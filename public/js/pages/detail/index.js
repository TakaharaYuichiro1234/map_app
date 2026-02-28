// *****************************
// 詳細ページの入り口
// *****************************

// -----------------------------
// 初期設定
// -----------------------------
import { getSpotById, updateSpot } from '../../services/spot-service.js';
import { savePhotos } from '../../services/photo-service.js';
import { cameraUsing } from '../../utils/photo/camera-using.js';
import { initPhotoSelector, handlePhotoSelect } from '../../utils/photo/photo-selector.js';
import { initToPageTop } from '../../utils/to-page-top.js';
import { initViewMain } from './view-main.js';
import { initViewHistory } from './view-history.js';
import { showPhoto, setMainPhoto, removePhoto, closePhotoModal } from './view-photo.js';
import { setRatingInputsViewing } from './view-main.js';
import { back, submitRating, remove } from './actions.js';
import { calDistance } from '../../utils/math.js';

export const mCurrentPositionStatus = { position: null, lastUpdate: null };

document.addEventListener("DOMContentLoaded", async () => {
    await init();
});

// -----------------------------
// 初期設定用の関数
// -----------------------------
async function init() {
    const spot = await getSpotById(id);
    const isOwner = user ? (spot.ownerUuid === user['uuid']) : false;

    // カメラ・写真関連の処理の初期化
    await initPhotoProcess(isOwner);

    // ページのトップに戻るボタン
    initToPageTop('to-page-top');

    // セクションごとにデータを表示
    initViewMain(isOwner, spot);
    showPhoto();
    initViewHistory();

    // イベントリスナーを設定
    setButtonListener();
    setPhotoButtonListener(isOwner);
    setInputElementListener();

    // 位置情報取得可否のモニタリングの初期化
    initMonitoringCurrentPosition()
}

async function initPhotoProcess(isOwner) {
    const photoSelectBtnElementId = "photo-select-btn";
    const photoInputElementId = "photo-input";
    const fileSelectBtnElementId = "file-select-btn";
    const fileInputElementId = "file-input";

    // カメラ設定 : utils/photo/camera-using.js
    if (isOwner) await cameraUsing(photoSelectBtnElementId);

    // 写真撮影/ファイル選択した後のコールバック : utils/photo/photo-selector.js
    initPhotoSelector(
        photoSelectBtnElementId,
        photoInputElementId,
        fileSelectBtnElementId,
        fileInputElementId,
        (e) => handlePhotoSelect(e, {
            onEach: async (img) => {
                const ret = await savePhotos(id, [img]);
                if (!ret) return false;
                return true;
            },
            onComplete: async () => await showPhoto(id)
        })
    );
}

function setPhotoButtonListener(isOwner) {
    document.querySelector(".modal-button-container").style.display = isOwner ? "flex" : "none";
    document.querySelector(".modal-backdrop").addEventListener("click", closePhotoModal);
    document.querySelector(".modal-close").addEventListener("click", closePhotoModal);
    document.getElementById("photo-modal-remove").addEventListener("click", () => removePhoto());
    document.getElementById("photo-modal-set-main").addEventListener("click", () => setMainPhoto());
}

function setButtonListener() {
    document.getElementById("back").addEventListener("click", () => back());
    document.getElementById("submit-rating").addEventListener("click", () => submitRating());
    document.getElementById("remove").addEventListener("click", () => remove());
}

function setInputElementListener() {
    setupEditableField({
        inputEl: document.getElementById("title-input"),
        buttonEl: document.getElementById("update-name"),
        onUpdate: (value) => updateSpotField({
            spotId: id,
            value,
            fieldName: "name",
            emptyMessage: "スポット名は必須です",
            confirmMessage: "スポット名を更新してもよろしいですか？"
        })
    });

    setupEditableField({
        inputEl: document.getElementById("description-input"),
        buttonEl: document.getElementById("update-description"),
        onUpdate: (value) => updateSpotField({
            spotId: id,
            value,
            fieldName: "description",
            confirmMessage: "危険内容の説明を更新してもよろしいですか？"
        })
    });
}

function setupEditableField({
    inputEl,
    buttonEl,
    onUpdate
}) {
    let initialValue = inputEl.value;

    inputEl.addEventListener("input", () => {
        const isChanged = inputEl.value !== initialValue;
        buttonEl.disabled = !isChanged;
        inputEl.classList.toggle("changed", isChanged);
    });

    buttonEl.addEventListener("click", () => {
        const success = onUpdate(inputEl.value);
        if (!success) return;

        initialValue = inputEl.value;
        buttonEl.disabled = true;
        inputEl.classList.remove("changed");
    });
}

function updateSpotField({
    spotId,
    fieldName,
    value,
    confirmMessage,
    emptyMessage
}) {
    if (emptyMessage && !value) {
        alert(emptyMessage);
        return false;
    }

    if (!window.confirm(confirmMessage)) {
        return false;
    }

    const resp = updateSpot(spotId, { [fieldName]: value });
    if (!resp) {
        alert("データの更新に失敗しました");
        return false;
    }

    return true;
}

function initMonitoringCurrentPosition() {
    mCurrentPositionStatus.lastUpdate = performance.now();
    setInterval(() => {
        if (mCurrentPositionStatus.lastUpdate < performance.now() - 30000) {
            mCurrentPositionStatus.position = null;
            showDistanceComment();
        }
    }, 5000);
}

export function showDistanceComment(spotPosition = null) {
    let distance = null;
    if (mCurrentPositionStatus.position && spotPosition) {
        distance = calDistance(
            mCurrentPositionStatus.position.lat,
            mCurrentPositionStatus.position.lng,
            spotPosition.lat,
            spotPosition.lng
        );
    }

    const dom = document.getElementById("distance-comment");
    dom.innerHTML = distance ? `スポットとの距離：約${Math.round(distance * 10) / 10}km` : "現在地を取得できません。";
    dom.style.display = "block";

    setRatingInputsViewing(distance);
}
