// async function initViewHistory(id) {
//     const ratings = await getRatingsBySpotId(id);

//     const domHistory = document.getElementById('history-container');
//     domHistory.innerHTML = '';
//     if (ratings.length === 0) {
//         domHistory.innerHTML = "<p>まだ評価がありません</p>";
//         return;
//     }

//     ratings.sort((a, b) => {
//         return new Date(b.createdAt) - new Date(a.createdAt);
//     });

//     for(const r of ratings) {
//         const date = formatDateKey(new Date(r.createdAt));
//         const targetUser = await getUserByUuid(r.uuid);
//         const userName = targetUser.name;

//         const isMyRating = user? (r.uuid === user['uuid']): false;
//         const hide = isMyRating ? "": "hide";

//         const colorDots = `<span class="history-dot level${r.rating}"></span>`;
//         const grayDots = `<span class="history-dot"></span>`;
//         const dots = colorDots.repeat(r.rating) + grayDots.repeat(MAX_RATING - r.rating);

//         const div = document.createElement("div");
//         div.className = "history-content";
//         div.innerHTML = `
//             <div class="history-content-header">
//                 <div class="history-content-header-left">
//                     <p class="history-date">${date}</p>
//                     <p class="history-user">${userName}</p>
//                 </div>
//                 <button 
//                     class="history-remove ${hide}" 
//                     id="history-remove_${r.id}">
//                     削除
//                 </button>
//             </div>
//             <div class="history-rating">
//                 ${dots}
//                 <span class="history-value">${'危険度の評価: ' + r.rating}</span>
//             </div>
//             <div class="history-content-main">
//                 <p class="history-comment">${r.comment}</p>
//             </div>
//         `;
//         domHistory.appendChild(div);

//         document.getElementById(`history-remove_${r.id}`).addEventListener('click', () => {
//             if (!confirm('この評価を削除してもよろしいですか？')) return;
//             if (!removeRating(r.id)) {
//                 alert('削除に失敗しました。');
//                 return;
//             }
//             initViewHistory(id);
//         });
//     }
// }

async function initViewHistory() {
    const ratings = await getRatingsBySpotId(id);

    const domHistory = document.getElementById('history-container');
    domHistory.textContent = ''; // innerHTML使わない

    if (ratings.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'まだ評価がありません';
        domHistory.appendChild(p);
        return;
    }

    ratings.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    for (const r of ratings) {
        const date = r.date;
        const targetUser = await getUserByUuid(r.uuid);
        const userName = targetUser?.name ?? '';

        const isMyRating = user ? (r.uuid === user['uuid']) : false;
        const hide = isMyRating ? "" : "hide";

        // ===== history-content =====
        const wrapper = document.createElement("div");
        wrapper.className = "history-content";

        // ===== header =====
        const header = document.createElement("div");
        header.className = "history-content-header";

        const headerLeft = document.createElement("div");
        headerLeft.className = "history-content-header-left";

        const dateP = document.createElement("p");
        dateP.className = "history-date";
        dateP.textContent = date;

        const userP = document.createElement("p");
        userP.className = "history-user";
        userP.textContent = userName;

        headerLeft.appendChild(dateP);
        headerLeft.appendChild(userP);

        const removeBtn = document.createElement("button");
        removeBtn.className = `history-remove ${hide}`;
        removeBtn.textContent = "削除";

        header.appendChild(headerLeft);
        header.appendChild(removeBtn);

        // ===== rating =====
        const ratingDiv = document.createElement("div");
        ratingDiv.className = "history-rating";

        const safeRating = Number(r.rating) || 0;

        for (let i = 0; i < MAX_RATING; i++) {
            const dot = document.createElement("span");
            dot.className = i < safeRating
                ? `history-dot level${safeRating}`
                : "history-dot";
            ratingDiv.appendChild(dot);
        }

        const valueSpan = document.createElement("span");
        valueSpan.className = "history-value";
        valueSpan.textContent = `危険度の評価: ${safeRating}`;

        ratingDiv.appendChild(valueSpan);

        // ===== comment =====
        const mainDiv = document.createElement("div");
        mainDiv.className = "history-content-main";

        const commentP = document.createElement("p");
        commentP.className = "history-comment";
        commentP.textContent = r.comment ?? '';

        mainDiv.appendChild(commentP);

        // ===== append =====
        wrapper.appendChild(header);
        wrapper.appendChild(ratingDiv);
        wrapper.appendChild(mainDiv);

        domHistory.appendChild(wrapper);

        // ===== イベント登録 =====
        removeBtn.addEventListener('click', async () => {
            if (!confirm('この評価を削除してもよろしいですか？')) return;

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const success = await removeRating(csrfToken, r.id);
            if (!success) {
                alert('削除に失敗しました。');
                return;
            }

            initViewHistory();
        });
    }
}
