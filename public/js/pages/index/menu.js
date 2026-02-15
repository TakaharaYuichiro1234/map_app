function menuButtonListener() {
    const menuBtn = document.getElementById("menu-btn");
    const menuPanel = document.getElementById("menu-panel");

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menuPanel.classList.toggle("show");
    });

    // 画面のどこかをクリックしたら閉じる
    document.addEventListener("click", () => {
        menuPanel.classList.remove("show");
    });

    // メニュー項目がクリックされたとき
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => {
            const action = e.target.dataset.action;
            if (action === 'clear') {
                dataClear();
            } else if (action === 'user') {
                toUserPage();
            } else if (action === 'dummy') {
                createDummySpots();
            } else if (action === 'manual') {
                toManualPage();
            } else if (action === 'about') {
                openModal();
            } else {
                alert("選択されたメニュー: " + action);
            }

            menuPanel.classList.remove("show");
        });
    });
}

function dataClear() {
    const size = getLocalStorageSizeKB();
    const msg = `保存されているデータを全て削除してよろしいですか？\n現在使用中のローカルストレージ容量：${Math.round(size)} KB`;
    if (confirm(msg)) {
        clearLocalStorageItems();
        alert("データを削除しました");
        mapInstance.refreshMap();
        listInstance.init();
    }
}

function toManualPage() {
    window.location.href = "manual.html";
}
function toUserPage() {
    window.location.href = "user.html";
}
