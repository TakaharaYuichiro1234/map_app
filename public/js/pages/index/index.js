// *****************************
// トップページの入り口
// *****************************

// -----------------------------
// 初期設定
// -----------------------------
let mapInstance;
let listInstance;
let isSelectMode = false;  

document.addEventListener("DOMContentLoaded", () => {
    init();
    buttonListener();
    creatingNewSpotListener();
    menuButtonListener();
});

// 詳細画面を開くためのカスタムイベント
document.addEventListener("open-detail", (e) => {
    const { id } = e.detail;
    window.location.href = `detail.html?id=${id}`;
});

// リスト画面から地図の危険スポットをハイライトするためのカスタムイベント
document.addEventListener("change-view-to-map", (e) => {
    const { id } = e.detail;

    document.getElementById("view-switch-check").checked = true;
    document.getElementById("view-map").style.display = "block";
    document.getElementById("view-list").style.display = "none" ;
    isSelectMode = false;  
    mapInstance.highlightSpot(id);
});

// -----------------------------
// 初期設定用の関数
// -----------------------------
function init() {
    if (!localStorage.getItem(STORAGE_IS_NOT_FIRST_START)) {
        openModal();
        safeSetItem(STORAGE_IS_NOT_FIRST_START, true);
    };

    if (!mapInstance) {
        mapInstance = new MapModule();
        mapInstance.init();
    }
    if (!listInstance) {
        listInstance = new ListModule();
        listInstance.init();
    }

    document.getElementById("btn-list-near").innerHTML = `近くのスポット(${NEAR_DISTANCE}km以内)`;   
}

function buttonListener() {
    // 地図表示/リスト表示の切り替え 
    document.getElementById("view-switch-check").addEventListener("change", function () {
        isMap = this.checked;
        document.getElementById("view-map").style.display = isMap ? "block" : "none";
        document.getElementById("view-list").style.display = isMap ? "none" : "block";
    });

    // 地図画面の現在地ボタン押下時
    document.getElementById("to-current-btn").addEventListener("click", () => mapInstance.moveToCurrent());

    // リスト画面の「近くのスポット」ボタン押下時
    document.getElementById("btn-list-near").addEventListener("click", () => {
        const currentPosition = mapInstance.getLatestCurrentPosition();
        listInstance.filterNearSpots(currentPosition);
    });

    // リスト画面の「リセット」ボタン押下時
    document.getElementById("btn-list-all").addEventListener("click", () => {
        listInstance.reset();
    });

    // スプラッシュ画面
    document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
    document.querySelector(".modal-close").addEventListener("click", closeModal);
    document.getElementById("splash-modal-to-manual").addEventListener("click", toManualPage);
    document.getElementById("splash-modal-a-to-manual").addEventListener("click", toManualPage);
}

function creatingNewSpotListener() {
    // 新規スポット登録の際の場所を設定する処理
    const newBtn = document.getElementById("new-btn");
    const msg = document.getElementById("map-message");
    const cross = document.getElementById("center-cross");

    newBtn.addEventListener("click", (e) => {
        if (!isSelectMode) {
            // newButtonが「新規」のとき
            e.preventDefault(); 

            isSelectMode = true;
            newBtn.textContent = "決定";
            newBtn.style.backgroundColor = "#FF6666"

            msg.style.display = "block";
            cross.style.display = "block";

            // 現在地付近にスポットを登録することを想定しているので、地図の中心を現在地に移動
            mapInstance.moveToCurrent();

        } else {
            // newButtonが「決定」のとき
            const center = mapInstance.getMapCenter();
            const zoom = mapInstance.getMapZoom();
            saveMapCenterZoom(center.lat, center.lng, zoom);
            saveNewSpotPos(center.lat, center.lng);
            
            // 前回の新規登録の時一時保存した写真が残っている可能性があるため削除しておく
            localStorage.removeItem("tempPhotos");  

            // 新規登録画面に遷移
            window.location.href = "new.html";
        }
    });

    // 新規登録のキャンセルボタン押下時の処理
    document.getElementById("map-message-cancel-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        isSelectMode = false;

        msg.style.display = "none";
        cross.style.display = "none";

        newBtn.textContent = "新規";
        newBtn.style.backgroundColor = "#0078ff"
    });
}

// -----------------------------
// スプラッシュ画面(モーダル画面)
// -----------------------------
function openModal() {
    const modal = document.querySelector(".modal");
    modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hidden");
    selectedPhotoIndex = null;
}
