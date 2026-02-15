// *****************************
// ローカルストレージのkey
// *****************************
const STORAGE_SPOTS = "spots";
const STORAGE_RATINGS = "ratings";
const STORAGE_PHOTOS = "photos";
const STORAGE_USER = "userId";
const STORAGE_SPOT_NUMBER = "spotNumber";
const STORAGE_MAP_CENTER_ZOOM = "mapCenterZoom";
const STORAGE_NEW_SPOT_POS = "newSpotPos";
const STORAGE_IS_NOT_FIRST_START = "isNotFirstStart";

// *****************************
// 共通の定数
// *****************************
const TERM = 30; // 集計期間(30日前までの評価を集計)
const RECENT_DAYS = 3;  // 直近3日の評価の平均を現在の評価とする
const MIN_RATING = 1;
const MAX_RATING = 5;
const NEAR_DISTANCE = 3.0;  // 現在地から3.0km以内を近くのスポットとする
const DEFAULT_MAP_CENTER_ZOOM = {pos:[35.681236, 139.767125], zoom:14}; // 東京駅周辺

// *****************************
// デバッグ用の定数
// *****************************
const IS_DEBUG = false;
const OFFSET_LAT = 0.0;  // デバッグモードでは現在地にオフセットをつけて表示
const OFFSET_LNG = 0.0;

// *****************************
// 地図関連のlocalStorage操作
// *****************************
function saveMapCenterZoom(lat, lng, zoom) {
    if (!safeSetItem(STORAGE_MAP_CENTER_ZOOM, JSON.stringify({
        pos: [lat, lng],
        zoom: zoom
    }))) return false;
    return true;
}

function saveNewSpotPos(lat, lng) {
    if (!safeSetItem(STORAGE_NEW_SPOT_POS, JSON.stringify({lat: lat, lng: lng}))) return false;
    return true;
}

// *****************************
// 基本的なlocalStorage操作
// *****************************
function getLocalStorageSizeKB() {
    let total = 0;
    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        const value = localStorage.getItem(key);
        total += key.length + value.length;
    }
    return (total * 2 / 1024).toFixed(2); // UTF16(2bytes)換算
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (e instanceof DOMException &&
            (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {

            alert(
                "保存できません。\n" +
                "ローカルストレージの容量が上限に達しました。\n" +
                `現在の使用量：約${getLocalStorageSizeKB()} KB`
            );
            return false;
        }
        throw e;
    }
}

function clearLocalStorageItems() {
    localStorage.removeItem(STORAGE_PHOTOS);
    localStorage.removeItem(STORAGE_RATINGS);
    localStorage.removeItem(STORAGE_SPOTS);
    localStorage.removeItem(STORAGE_MAP_CENTER_ZOOM);
    localStorage.removeItem(STORAGE_SPOT_NUMBER);
    localStorage.removeItem(STORAGE_IS_NOT_FIRST_START);
}