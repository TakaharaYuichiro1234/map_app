// *****************************
// スポットデータ管理
// *****************************
import { BASE_PATH, STORAGE_SPOT_NUMBER } from '../config.js';
import { safeSetItem } from './local-storage-service.js';

export async function loadSpots() {
    try {
        const url = `${BASE_PATH}/api/spots`
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('通信エラー');
        }
        const result = await res.json();
        if (!result.success) throw new Error('データベースエラー');

        const spots = result.spots.map(spot => {
            return {
                id: spot.id,
                name: spot.name,
                description: spot.description,
                lat: spot.lat,
                lng: spot.lng,
                address: spot.address,
                ownerUuid: spot.owner_uuid,
                createdAt: spot.created_at,
                updatedAt: spot.updated_at,
            }
        })
        return spots;

    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function saveSpot(csrfToken, name, description, lat, lng, address) {
    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('address', address);

    try {
        const url = `${BASE_PATH}/api/spots/store`
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin', // セッション / CSRF用
        });

        if (!res.ok) {
            throw new Error('通信エラー');
        }

        const result = await res.json();

        if (!result.success) throw new Error('書き込みエラー');
        return result.spotId;;

    } catch (err) {
        console.error(err);
        return -1;
    }
}

export async function getSpotById(id) {
    try {
        const url = `${BASE_PATH}/api/spots/${id}`
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error('通信エラー');
        }
        const result = await res.json();
        if (!result.success) throw new Error('データベースエラー');

        const spot = {
            id: result.spot.id,
            name: result.spot.name,
            description: result.spot.description,
            lat: result.spot.lat,
            lng: result.spot.lng,
            address: result.spot.address,
            ownerUuid: result.spot.owner_uuid,
            createdAt: result.spot.created_at,
            updatedAt: result.spot.updated_at,
        };
        return spot;

    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function updateSpot(csrfToken, targetId, data) {
    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('id', targetId);

    for (const key in data) {
        if (key === "name") formData.append(key, data[key]);
        if (key === "description") formData.append(key, data[key]);
    }

    try {
        const url = `${BASE_PATH}/api/spots/update`
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin', // セッション / CSRF用
        });


        if (!res.ok) {
            throw new Error('通信エラー');
        }

        const result = await res.json();

        if (!result.success) throw new Error('データベースエラー');
        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function removeSpot(csrfToken, targetId) {
    const formData = new FormData();
    formData.append('csrf_token', csrfToken);
    formData.append('id', targetId);

    try {
        const url = `${BASE_PATH}/api/spots/delete`
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin', // セッション / CSRF用
        });


        if (!res.ok) {
            throw new Error('通信エラー');
        }

        const result = await res.json();

        if (!result.success) throw new Error('データベースエラー');
        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}

export function getSpotNumber() {
    const numberText = localStorage.getItem(STORAGE_SPOT_NUMBER);
    let number = 1;
    if (numberText) {
        number = Number(numberText) + 1;
    }

    if (!safeSetItem(STORAGE_SPOT_NUMBER, String(number))) return null;
    return number;
}
