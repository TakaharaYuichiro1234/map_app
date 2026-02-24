export const BASE_PATH = '/map_app';

// *****************************
// ローカルストレージのkey
// *****************************
export const STORAGE_SPOT_NUMBER = "spotNumber";
export const STORAGE_MAP_CENTER_ZOOM = "mapCenterZoom";
export const STORAGE_NEW_SPOT_POS = "newSpotPos";
export const STORAGE_IS_NOT_FIRST_START = "isNotFirstStart";

// *****************************
// 共通の定数
// *****************************
export const TERM = 30; // 集計期間(30日前までの評価を集計)
export const RECENT_DAYS = 3;  // 直近3日の評価の平均を現在の評価とする
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const NEAR_DISTANCE = 3.0;  // 現在地から3.0km以内を近くのスポットとする
export const DEFAULT_MAP_CENTER_ZOOM = {pos:[35.681236, 139.767125], zoom:14}; // 東京駅周辺

// *****************************
// デバッグ用の定数
// *****************************
export const IS_DEBUG = false;
export const OFFSET_LAT = 0.0;  // デバッグモードでは現在地にオフセットをつけて表示
export const OFFSET_LNG = 0.0;
