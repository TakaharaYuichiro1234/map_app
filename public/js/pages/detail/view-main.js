let mExistsMyRatingToday = false; // 今日、自分がこのスポットを評価済みならtrue

function initViewMain(id, isOwner) {
    const spot = getSpotById(id);
    mExistsMyRatingToday = isRated(spot.id, getCurrentUser().id, new Date()); 
    
    document.getElementById("header-title").innerHTML = spot.name;
    document.getElementById("photo-btn-container").style.display = isOwner ? "flex" : "none";

    initRatingBlock();
    initRegistratedDataBlock(id, isOwner);
    initMapBlock(id);
    initChartBlock(id);
}

function initRatingBlock() {
    const domRatingInputs = document.getElementById("rating-inputs");
    domRatingInputs.style.display = mExistsMyRatingToday? "none": "block";
    setRatingInputsViewing();
}

function setRatingInputsViewing(distance = null) {
    const domRatingInputsHeader = document.getElementById("rating-inputs-header");
    const domSubmitRating = document.getElementById("submit-rating");

    let text = "";
    if (mExistsMyRatingToday) {
        text = "このスポットは危険度を評価済みです。<br>(1日1回評価できます)";
    } else if (!distance || distance < NEAR_DISTANCE) {
        text = "このスポットの危険度を評価してください。";
        domSubmitRating.removeAttribute("disabled");
    } else {
        text = `このスポットは現在地から離れているため評価できません (評価できるのは${NEAR_DISTANCE}km以内のスポットです)。`;
        domSubmitRating.setAttribute("disabled", true);
    }

    domRatingInputsHeader.innerHTML = text;
}

function initRegistratedDataBlock(id, isOwner) {
    const spot = getSpotById(id);

    // DOMを一通り取得
    const domTitleInput = document.getElementById("title-input");
    const domDescriptionInput = document.getElementById("description-input");
    const domTitleText = document.getElementById("title-text");
    const domDescriptionText = document.getElementById("description-text");
    const domRemoveSpot = document.getElementById("remove");
    const domCreated = document.getElementById("created");
    const domUserName = document.getElementById("user-name");
    const domUpdateName = document.getElementById("update-name");
    const domUpdateDescription = document.getElementById("update-description");
    const domAddress = document.getElementById("address");
    
    // 各要素の表示・非表示を設定
    const showForOwner = [ domTitleInput, domDescriptionInput, domUpdateName, domUpdateDescription, domRemoveSpot ];
    showForOwner.forEach(el => el.style.display = isOwner ? "block" : "none" );

    const showForViewer = [ domTitleText, domDescriptionText ];
    showForViewer.forEach(el => el.style.display = isOwner ? "none" : "block" );
    
    // 各要素の表示内容の初期値を設定
    domTitleInput.value = spot.name;
    domTitleText.innerHTML = spot.name;
    domDescriptionInput.value = spot.description;
    domDescriptionText.innerHTML = spot.description;
    domCreated.innerHTML = formatDateTime(new Date(spot.createdAt));
    domAddress.innerHTML = spot.address?? ""; 

    const owner = getUserById(spot.ownerId);
    domUserName.innerHTML = owner? owner.name: "不明なユーザー";
};

function initMapBlock(id) {
    // 地図のインスタンスを作成して初期化
    const detailMap = new DetailMapModule();
    detailMap.init();

    // このスポットの位置にマーカーを表示
    const spot = getSpotById(id);
    detailMap.setMarker(spot.lat, spot.lng);
    
    // 現在地をイベントで取得して、スポットとの距離に関するコメントを表示
    document.addEventListener("detailmap:locationfound", (e) => {
        const { position } = e.detail;
        mCurrentPositionStatus.position = position;
        mCurrentPositionStatus.lastUpdate = performance.now();
        showDistanceComment({lat: spot.lat, lng: spot.lng});
    });
}

function initChartBlock(id) {
    // 「みんなの評価」部分のチャートインスタンスを作成して初期化
    const overallChart = new DetailChartModule("overallChart", id);
    overallChart.init();

    // 「みんなの評価」部分のコメント
    const spot = getSpotById(id);
    const totalUsers = spot.totalUsers;
    const recentRating = spot.recentRating;
    const pastRating = spot.pastRating;

    let trendComment = "";
    if (pastRating < recentRating) {
        trendComment = "<li>危険度の評価値が上昇傾向です</li>";
    } else if (pastRating > recentRating) {
        trendComment = "<li>危険度の評価値が改善傾向です</li>";
    }

    const usersComment = (totalUsers > 0) 
        ?  `<li>このスポットは${totalUsers}人に評価されています</li>` 
        : "<li>まだ評価がありません</li>";
        
    document.getElementById("overall-rating-info").innerHTML = `<ul>${usersComment}${trendComment}</ul>`;

    // 「自分の評価」部分のインスタンスを作成して初期化
    const currentUser = getCurrentUser();
    const myChart = new DetailChartModule("myChart", id, currentUser.id);
    myChart.init();

    // 「自分の評価」部分のコメント
    document.getElementById("my-rating-info").innerHTML = (myChart.ratingCount > 0)
        ? ""
        : "<ul><li>このスポットはまだ評価していません</li></ul>";
}
