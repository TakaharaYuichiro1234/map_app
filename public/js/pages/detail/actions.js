function back(spotId) {
    location.href = `index.html?highlight=${spotId}`;
}

function remove(spotId) {
    const spot = getSpotById(spotId);
    const result = window.confirm(`このスポット「${spot.name}」を削除してもよろしいですか？\nスポットを削除すると写真や評価データも削除されます。`);
    if (result) {
        const resp = removeSpot(spotId);
        if (resp) {
            alert(`スポット「${spot.name}」を削除しました。`);
            window.location.href = "index.html";
        } else {
            alert("このスポットの削除に失敗しました。");
        }
    }
}

function submitRating(spotId) {
    const spot = getSpotById(spotId);
    let distance = null;
    if (mCurrentPositionStatus.position) {
        distance = MathModule.distance(
            mCurrentPositionStatus.position.lat,
            mCurrentPositionStatus.position.lng,
            spot.lat,
            spot.lng
        );
    } 

    if (!distance) {
        if (!confirm('現在地が取得できないため、このスポットが近くにない可能性があります。このまま、このスポットの評価を登録しますか？')) return;
    } else if (distance > NEAR_DISTANCE) {
        alert(`このスポットは現在地から離れているため評価できません。\n評価できるのは${NEAR_DISTANCE}km以内のスポットです。`);
        return;
    } else {
        if (!confirm('評価を登録してよろしいですか？')) return;
    }

    const userId = getCurrentUser().id;
    const createdAt = new Date();
    
    // 評価済みかどうかチェック。評価済みなら保存しない
    if (isRated(spotId, userId, createdAt)) return false;

    // 評価を保存
    const rating = Number(document.querySelector('input[name="rating"]:checked')?.value ?? 0);
    const comment = document.getElementById('rating-comment').value;
    if (!saveRating(spotId, userId, rating, comment, createdAt)) {
        alert("評価の登録に失敗しました。");
        return;
    } 

    // spotオブジェクトも更新
    const stats = getSpotRatingStats(spotId);
    const updatingSpotData = {
        totalUsers: stats.totalUsers,
        recentRating: stats.recentRating,
        pastRating: stats.pastRating
    }
    if (!updateSpot(spotId, updatingSpotData)) {
        return;
    } else {
        alert("評価を登録しました。");
    }
    
    location.href = `index.html?highlight=${spotId}`;
}