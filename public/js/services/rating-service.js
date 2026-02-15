// *****************************
// 評価(rating)データ管理
// *****************************
function loadRatings() {
    return JSON.parse(localStorage.getItem(STORAGE_RATINGS) || "[]");
}

function getRating(spotId, userId, rating, comment, createdAt) {
    const id = crypto.randomUUID();
    return {id, spotId, userId, rating, comment, createdAt};
}

function saveRating(spotId, userId, rating, comment, createdAt) {
    const data = getRating(spotId, userId, rating, comment, createdAt.toISOString());
    const list = loadRatings();
    list.push(data);
    if (!safeSetItem(STORAGE_RATINGS, JSON.stringify(list))) return false;

    return true;
}

// ダミーデータ作成用に、localStorageに一括でratingを保存する
function saveRatings(spotId, ratingData) {
    const list = loadRatings();

    for (const ratingDatum of ratingData) {
        if (!isRated(spotId, ratingDatum.userId, ratingDatum.createdAt)) {  
            const data = getRating(
                spotId,
                ratingDatum.userId,
                ratingDatum.rating,
                ratingDatum.comment,
                ratingDatum.createdAt.toISOString()
            );
            list.push(data);            
        }
    }

    if (!safeSetItem(STORAGE_RATINGS, JSON.stringify(list))) return false;
    return true;
}

function removeRating(id) {
    const ratings = loadRatings();
    const filtered = ratings.filter(r => r.id !== id);
    if (!safeSetItem(STORAGE_RATINGS, JSON.stringify(filtered))) return false;
    return true;
}

function isRated(spotId, userId, createdAt){
    const list = loadRatings();

    // 一人のuserは、一つのスポットに対して、1日1回だけ評価を登録できる
    const ratingIndex = list.findIndex(r =>
        r.spotId === spotId &&
        r.userId === userId &&
        isSameDay(new Date(r.createdAt), createdAt)
    );

    return ratingIndex !== -1;
}

function getRatingsBySpotId(spotId) {
    const ratings = loadRatings();
    return ratings.filter(s => s.spotId == spotId);
}

function getSpotRatingStats(spotId) {
    const dailyRating = getDailyRating(spotId);
    const totalUsers = dailyRating.userCount;
    const {recentRating, pastRating} = calRatingTrend(dailyRating.ratings);

    return {"recentRating":Math.round(recentRating), "pastRating":Math.round(pastRating), "totalUsers": totalUsers};
}

function calRatingTrend(ratings) {
    let recentRating = 0;
    let pastRating = 0;

    // 直近3日の評価値
    const ratingsInRecentDays = ratings.slice(-RECENT_DAYS).filter(r => r !== null);
    if (ratingsInRecentDays.length === 0) {
        return {"recentRating":recentRating, "pastRating":pastRating};
    }

    // 直近3日の評価値の平均をrecentRatingとする
    recentRating = ratingsInRecentDays.reduce((sum, r) => sum + r, 0) / ratingsInRecentDays.length;
    pastRating = recentRating;

    // 4日前より前のデータがなければpastRating=recentRating
    const ratingsBeforeRecentDays = ratings.slice(0, -(RECENT_DAYS+1)).filter(r => r !== null);
    if (ratingsBeforeRecentDays.length === 0) {
        return { "recentRating":recentRating, "pastRating": pastRating };
    }
    
    // 1次近似で31日前の評価値を算出する
    // 31日前をx=0としてy=ax+bにフィッティングすることで、y切片が31日前の評価値となる
    const n = ratings.length;
    const x = Array.from({ length: n}, (_, i) => i);
    const {_, intercept} = leastSquares(x, ratings);
    if (intercept !== null) {
        pastRating = Math.min(MAX_RATING, Math.max(MIN_RATING, intercept));
    }

    // recentRatingとpastRatingの差が±1以内なら変化なしとみなす
    if (Math.abs(recentRating-pastRating) <= 1) pastRating = recentRating;
    
    return { "recentRating":recentRating, "pastRating": pastRating };
}

function leastSquares(x, y) {
    if (x.length !== y.length) {
        console.error("x と y の要素数が一致していません");
        return {slope:null, intercept:null}
    }

    // yがnullでないデータのみ抽出
    const points = [];
    for (let i = 0; i < x.length; i++) {
        if (y[i] !== null) {
            points.push({ x: x[i], y: y[i] });
        }
    }

    const n = points.length;
    if (n < 2) {
        console.error("有効なデータ点が不足しています");
        return {slope:null, intercept:null}
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
    }

    const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - a * sumX) / n;

    return { slope:a, intercept:b };
}

function countUniqueUserIds(data) {
    const userIdSet = new Set();

    data.forEach(datum => {
        if (datum.userId != null) {
            userIdSet.add(datum.userId);
        }
    });
    return userIdSet.size;
}

function getDailyRating(spotId) {
    const list = loadRatings().filter(r => r.spotId === spotId);
    const uniqueUserIds = getUniqueUserIds(list);
    const userCount = uniqueUserIds.size;

    // 31日前(=TERM+1日)から今日までの日付データの配列daysを作成
    const days = createDayArrayInTerm();

    // days(31日前から今日までの日付の配列)に対応する評価値の配列を、ユーザー毎に作成
    const ratingsEachUsers = {};
    for (let userId of uniqueUserIds) {
        const listEachUser = list.filter(r => r.userId === userId);
        ratingsEachUsers[userId] = createRatingArrayInTerm(listEachUser, days);
    }

    // ユーザー毎のratings配列のi番目の要素を平均する(nullの場合を考慮)
    const avgRatings = new Array(days.length).fill(null);
    for (let i = 0; i < avgRatings.length; i++) {
        let sum = 0;
        let counts = 0;     
        for (let key in ratingsEachUsers) {
            const rating = ratingsEachUsers[key][i];
            if (rating !== null) {
                sum += rating;
                counts ++;
            } 
        }
        if (counts> 0) {
            avgRatings[i] = sum/counts;
        }
    }

    return {"days":days, "ratings":avgRatings, "userCount": userCount};
}

function getDailyRatingEachUser(spotId, userId) {
    const list = loadRatings().filter(r => r.spotId === spotId);

    // 31日前(=TERM+1日)から今日までの日付データの配列daysを作成
    const days = createDayArrayInTerm();

    // days(31日前から今日までの日付の配列)に対応する評価値の配列を、ユーザー毎に作成
    const listEachUser = list.filter(r => r.userId === userId);
    ratings = createRatingArrayInTerm(listEachUser, days);

    return {"days":days, "ratings":ratings};
}

function createDayArrayInTerm() {
    const today = new Date();

    const iniDay = new Date(today);
    iniDay.setDate(today.getDate() - (TERM+1));
    const days = [iniDay];  // 配列の先頭は31日前の日付
    for (let i = 0; i <= TERM; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (TERM - i));
        days.push(d);   // 30日前から今日までの日付を配列に追加
    }

    return days;
}

function createRatingArrayInTerm(listEachUser, days) {
    // days(31日前から今日までの日付の配列)に対応する評価値の配列を作成
    // まずは、日付をキー、評価値をバリューとするオブジェクトに再編
    const dailyRatingAll = {};
    for (let datum of listEachUser) {
        const d = formatDateKey(new Date(datum.createdAt));
        if (!(d in dailyRatingAll)) {
            dailyRatingAll[d] = datum.rating;
        } 
    }

    // 配列の最初の値(31日前に相当)は、期間の前で、かつ、最新の日付の評価値を入れる
    let latestRatingBeforeTerm = null;
    const borderDate = days[0]; // 31日前(=30日前の1日前)の日付
    let maxDateBeforeTerm = null;
    for (let key of Object.keys(dailyRatingAll)) {
        const keyDate = new Date(key);
        if (keyDate <= borderDate) {
            if (keyDate >= maxDateBeforeTerm) {
                latestRatingBeforeTerm = dailyRatingAll[key];
                maxDateBeforeTerm = keyDate;
            }
        }
    }
    
    // 30日前から今日までの評価値の配列。
    // 欠損値は直前の評価値で埋める。ただし、今日の評価値が欠損の場合はnullのままにしておく
    const ratings = [latestRatingBeforeTerm];
    for (let i = 1; i < days.length; i++) {
        const fd = formatDateKey(days[i]);
        if (fd in dailyRatingAll) {
            ratings.push(dailyRatingAll[fd]);
        } else {
            if (i < days.length - 1) {
                ratings.push(ratings[i-1]);
            } else {
                ratings.push(null);
            }
        }
    }
    return ratings;
}

function getUniqueUserIds(data) {
    const userIdSet = new Set();

    data.forEach(datum => {
        if (datum.userId != null) {
            userIdSet.add(datum.userId);
        }
    });
    return userIdSet;
}