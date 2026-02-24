import { login, logout, openModal, toManualPage } from './actions.js';
import { createDummySpots } from './dummy.js';

export function menuButtonListener() {
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
                login();
            } else if (action === 'logout') {
                logout();
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

