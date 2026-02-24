import { BASE_PATH } from '../../config.js';

export function login() {
    window.location.href = `${BASE_PATH}/show_login`;
}

export function logout() {
    document.getElementById('logout').submit();
}

// -----------------------------
// スプラッシュ画面(モーダル画面)
// -----------------------------
export function openModal() {
    const modal = document.querySelector(".modal");
    modal.classList.remove("hidden");
}

export function closeModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hidden");
}

// -----------------------------
// その他
// -----------------------------
export function toManualPage() {
    location.href = `${BASE_PATH}/manuals`;
}
