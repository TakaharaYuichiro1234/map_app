// *****************************
// 詳細ページの入り口
// *****************************

// -----------------------------
// 初期設定
// -----------------------------
const mCurrentPositionStatus = {position: null, lastUpdate:null};

document.addEventListener("DOMContentLoaded", async () => {
    await init();    
});

// -----------------------------
// 初期設定用の関数
// -----------------------------
async function init() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");

    // このスポットが自分の作成したスポットかどうかをチェック
    const isOwner = (getSpotById(id).ownerId === getCurrentUser().id);

    // カメラ・写真関連の処理の初期化
    await initPhotoProcess(id, isOwner);

    // ページのトップに戻るボタン
    initToPageTop('to-page-top');

    // セクションごとにデータを表示
    initViewMain(id, isOwner);
    showPhoto(id);
    initViewHistory(id);

    // イベントリスナーを設定
    setButtonListener(id);
    setPhotoButtonListener(id, isOwner);
    setInputElementListener(id);

    // 位置情報取得可否のモニタリングの初期化
    initMonitoringCurrentPosition()
}

async function initPhotoProcess(id, isOwner) {
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
            onEach: (img) => {
                if (!savePhotos(id, [img]))  return false;
                return true;
            },
            onComplete: () => showPhoto(id)
        })
    );
}

function setPhotoButtonListener(id, isOwner) {
    document.querySelector(".modal-button-container").style.display = isOwner? "flex": "none";
    document.querySelector(".modal-backdrop").addEventListener("click", closePhotoModal);
    document.querySelector(".modal-close").addEventListener("click", closePhotoModal);
    document.getElementById("photo-modal-remove").addEventListener("click", () => removePhoto(id));
    document.getElementById("photo-modal-set-main").addEventListener("click", () => setMainPhoto(id));
}

function setButtonListener(id) {
    document.getElementById("back").addEventListener("click", () => back(id));
    document.getElementById("submit-rating").addEventListener("click", () => submitRating(id));
    document.getElementById("remove").addEventListener("click", () => remove(id));
}

function setInputElementListener(id) {
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

function showDistanceComment(spotPosition=null) {
    let distance = null;
    if (mCurrentPositionStatus.position && spotPosition) {
        distance = MathModule.distance(
            mCurrentPositionStatus.position.lat,
            mCurrentPositionStatus.position.lng,
            spotPosition.lat,
            spotPosition.lng
        );
    } 

    const dom = document.getElementById("distance-comment");
    dom.innerHTML = distance ? `スポットとの距離：約${Math.round(distance*10)/10}km` : "現在地を取得できません。";
    dom.style.display = "block";

    setRatingInputsViewing(distance);
}
