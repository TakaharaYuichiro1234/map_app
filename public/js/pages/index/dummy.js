// *****************************
// ダミーデータ作成
// *****************************

async function createDummySpots() {
    const TOTAL_DUMMIES = 1;

    const center = mapInstance.getMapCenter();
    centerLat = center.lat;
    centerLng = center.lng;
    const zoom = mapInstance.getMapZoom();
    saveMapCenterZoom(centerLat, centerLng, zoom);

    const bounds = mapInstance.getMapBounds();
    const rangeLat = bounds.getNorthEast().lat - bounds.getSouthWest().lat;
    const rangeLng = bounds.getNorthEast().lng - bounds.getSouthWest().lng;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    const currentUserUuid = user['uuid'];
    const allUsers = await getUsers();
    const userUuidAll = allUsers.map(u => u.uuid);

    for (let i = 0; i < TOTAL_DUMMIES; i++) {
        const name = `ダミースポット#${getSpotNumber()}`;
        const description = "";
        const lat = (Math.random() - 0.5) * rangeLat + centerLat;
        const lng = (Math.random() - 0.5) * rangeLng + centerLng;
        const addData = await MuniModule.reverseGeocode(lat, lng);
        const address = addData ? addData.pref + addData.city + addData.region : "住所が取得できませんでした";

        const spotId = await saveSpot(csrfToken, name, description, lat, lng, address);
        if (!spotId) return;

        const totalUsers = Math.floor(Math.random() * 3);   // 0人から5人
        const userUuids = userUuidAll.filter(id => id !== currentUserUuid); // 現在のユーザーは除外
        while (userUuids.length > totalUsers) {
            const index = Math.floor(Math.random() * userUuids.length);
            userUuids.splice(index, 1); // userIdをどれか一つ減らす
        }

        const ratingData = [];
        for (let userUuid of userUuids) {
            const ratings = dummyRatings(TERM + 2, "random"); // random, increase, decrease, fixed

            for (const [j, rating] of ratings.entries()) {
                const d = new Date();
                d.setDate(d.getDate() - j);

                if (rating !== null) {
                    ratingData.push({
                        userUuid,
                        date: formatDate(d),
                        rating,
                        comment: ''
                    });
                }
            }
        }

        const ret = await saveDummyRatings(csrfToken, spotId, ratingData);
        if (!ret) return;
    }

    location.href = `${BASE_PATH}`;
}

function dummyRatings(total, type = "random") {
    let ratings = [];
    switch (type) {
        case "random":
            ratings = dummyRatingsRandom(total);
            break;
        case "increase":
            ratings = dummyRatingsIncrease(total);
            break;
        case "decrease":
            ratings = dummyRatingsDecrease(total);
            break;
        case "fixed":
            ratings = dummyRatingsFixed();
            break;
    }
    return ratings;
}

function dummyRatingsRandom(total) {
    let ratings = [];
    for (let i = 0; i < total; i++) {
        // MAXとMINの範囲外のときはnull (あえて欠損値を作っている)
        r = Math.floor(Math.random() * MAX_RATING * 4) + 1;
        if (r <= MAX_RATING && r >= MIN_RATING) {
            ratings.push(r);
        } else {
            ratings.push(null);
        }
    }
    return ratings;
}

function dummyRatingsIncrease(total) {
    let ratings = [];
    for (let i = 0; i < total; i++) {
        r = Math.max(MIN_RATING, Math.floor(MAX_RATING * (1 - (i / total)) + 1));
        ratings.push(r);
    }
    return ratings;
}

function dummyRatingsDecrease(total) {
    let ratings = [];
    for (let i = 0; i < total; i++) {
        r = Math.max(MIN_RATING, Math.floor(i / total * MAX_RATING) + 1);
        ratings.push(r);
    }
    return ratings;
}

function dummyRatingsFixed() {
    let ratings = [
        3, 3, 3.3, 3.3, 3.2, 2,
        3, 2.5, 2.5, 2.8, 3, 3,
        4, 4, 3.3, 3.3, 3.3, 3.3,
        4, 4.2, 4.2, 4, 5, 5,
        4.5, 4.5, 4, 4, 5, 5,
        5, 5, 5
    ];

    return ratings;
}
