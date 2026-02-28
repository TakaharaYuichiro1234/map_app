// *****************************
// 写真(photos)データ管理
// *****************************
import { BASE_PATH } from '../config.js';
import { getCsrfToken } from '../utils/common.js';

export async function savePhotos(spotId, files) {
    for (const file of files) {
        const formData = new FormData();
        formData.append('csrf_token', getCsrfToken());
        formData.append('photo', file);
        formData.append('spot_id', spotId);

        const res = await fetch(`${BASE_PATH}/api/photos/store`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!data.success) return null;
    }

    return true;
}

export async function getPhotosBySpotId(spotId) {
    try {
        const url = `${BASE_PATH}/api/photos/get_by_spot_id/${spotId}`
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

        if (!result.success) throw new Error('エラー');

        const photos = result.photos.map(photo => {
            return {
                id: photo.id,
                spotId: photo.spot_id,
                uuid: photo.uuid,
                filename: photo.filename,
                sort_order: photo.sort_order,
                createdAt: photo.created_at,
            }
        })

        return photos;

    } catch (err) {
        console.error(err);
        return [];
    }
}


export async function getMainPhoto(spotId) {
    try {
        const url = `${BASE_PATH}/api/photos/get_main/${spotId}`
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

        if (!result.success) throw new Error('エラー');
        if (!result.photo) return null;

        return {
            id: result.photo.id,
            spotId: result.photo.spot_id,
            uuid: result.photo.uuid,
            filename: result.photo.filename,
            sort_order: result.photo.sort_order,
            createdAt: result.photo.created_at,
        };

    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function removePhotoById(targetPhotoId) {
    const formData = new FormData();
    formData.append('csrf_token', getCsrfToken());
    formData.append('id', targetPhotoId);

    try {
        const url = `${BASE_PATH}/api/photos/delete`
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

// このspotIdに登録されている複数の写真の先頭に、targetPhotoIdの写真を移動する
export async function swapMainPhoto(spotId, targetPhotoId) {
    const formData = new FormData();
    formData.append('csrf_token', getCsrfToken());
    formData.append('id', targetPhotoId);
    formData.append('spot_id', spotId);

    try {
        const url = `${BASE_PATH}/api/photos/reorder`
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