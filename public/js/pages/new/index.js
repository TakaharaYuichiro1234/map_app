// *****************************
// 新規スポット登録ページの入り口
// *****************************

let photoList = [];
let address = "";
let newSpotPos = null;
let selectedPhotoIndex = null;

document.addEventListener("DOMContentLoaded", async () => {
    await initPhotoProcess();
    setButtonListener();
    await autofillSpotName();
});

async function initPhotoProcess() {
    const photoSelectBtnElementId = "photo-select-btn";
    const photoInputElementId = "photo-input";
    const fileSelectBtnElementId = "file-select-btn";
    const fileInputElementId = "file-input";

    // カメラ設定 : utils/photo/camera-using.js
    await cameraUsing(photoSelectBtnElementId);
    
    // 写真撮影/ファイル選択した後のコールバック : utils/photo/photo-selector.js
    initPhotoSelector(
        photoSelectBtnElementId, 
        photoInputElementId, 
        fileSelectBtnElementId, 
        fileInputElementId,
        (e) => handlePhotoSelect(e, {
            onEach: (img) => photoList.push(img),
            onComplete: () => showPhoto()
        })
    );
}

function setButtonListener() {
    document.getElementById("registerBtn").addEventListener("click", registerSpot);

    document.querySelector(".modal-backdrop").addEventListener("click", closePhotoModal);
    document.querySelector(".modal-close").addEventListener("click", closePhotoModal);
    document.getElementById("photo-modal-remove").addEventListener("click", removePhoto);
    document.getElementById("photo-modal-set-main").addEventListener("click", setMainPhoto);
}

async function autofillSpotName() {
    // 地図画面でlocalStorageに保存したlat, lngを取得して、すぐに消去
    newSpotPos = JSON.parse(localStorage.getItem(STORAGE_NEW_SPOT_POS));
    localStorage.removeItem(STORAGE_NEW_SPOT_POS);

    // スポット名を自動入力
    const input = document.getElementById("spotName");
    input.disabled = true;
    input.placeholder = "住所を取得中…";

    const addressData = await MuniModule.reverseGeocode(newSpotPos.lat, newSpotPos.lng);
    if (addressData) {
        address = addressData.pref + addressData.city + addressData.region;
        input.value = addressData.region ? `${addressData.region}付近` : `危険スポット#${getSpotNumber()}`;
    } else {
        input.value = `危険スポット#${getSpotNumber()}`;
    }
    input.disabled = false;
}
