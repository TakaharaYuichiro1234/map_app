// *****************************
// 地図関連のlocalStorage操作
// *****************************
import { STORAGE_MAP_CENTER_ZOOM, STORAGE_NEW_SPOT_POS } from '../config.js';
import { safeSetItem } from './local-storage-service.js';

export function saveMapCenterZoom(lat, lng, zoom) {
    if (!safeSetItem(STORAGE_MAP_CENTER_ZOOM, JSON.stringify({
        pos: [lat, lng],
        zoom: zoom
    }))) return false;
    return true;
}

export function saveNewSpotPos(lat, lng) {
    if (!safeSetItem(STORAGE_NEW_SPOT_POS, JSON.stringify({lat: lat, lng: lng}))) return false;
    return true;
}
