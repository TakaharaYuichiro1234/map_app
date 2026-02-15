function initViewHistory(id) {
    const ratings = getRatingsBySpotId(id);

    const domHistory = document.getElementById('history-container');
    domHistory.innerHTML = '';
    if (ratings.length === 0) {
        domHistory.innerHTML = "<p>まだ評価がありません</p>";
        return;
    }

    const currentUser = getCurrentUser();

    ratings.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    for(const r of ratings) {
        const date = formatDateKey(new Date(r.createdAt));
        const user = getUserById(r.userId).name;

        const isMyRating = (r.userId === currentUser.id);
        const hide = isMyRating ? "": "hide";

        const colorDots = `<span class="history-dot level${r.rating}"></span>`;
        const grayDots = `<span class="history-dot"></span>`;
        const dots = colorDots.repeat(r.rating) + grayDots.repeat(MAX_RATING - r.rating);

        const div = document.createElement("div");
        div.className = "history-content";
        div.innerHTML = `
            <div class="history-content-header">
                <div class="history-content-header-left">
                    <p class="history-date">${date}</p>
                    <p class="history-user">${user}</p>
                </div>
                <button 
                    class="history-remove ${hide}" 
                    id="history-remove_${r.id}">
                    削除
                </button>
            </div>
            <div class="history-rating">
                ${dots}
                <span class="history-value">${'危険度の評価: ' + r.rating}</span>
            </div>
            <div class="history-content-main">
                <p class="history-comment">${r.comment}</p>
            </div>
        `;
        domHistory.appendChild(div);

        document.getElementById(`history-remove_${r.id}`).addEventListener('click', () => {
            if (!confirm('この評価を削除してもよろしいですか？')) return;
            if (!removeRating(r.id)) {
                alert('削除に失敗しました。');
                return;
            }
            initViewHistory(id);
        });
    }
}
