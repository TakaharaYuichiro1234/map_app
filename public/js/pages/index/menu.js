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
            if (action === 'login') {
                window.location.href = `${BASE_PATH}/show_login`;
            } else if (action === 'logout') {
                document.getElementById('logout').submit();
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

function toManualPage() {
    location.href = `${BASE_PATH}/manuals`;
}
