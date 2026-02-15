// *****************************
// 写真(photos)データ管理
// *****************************
function loadPhotos() {
    return JSON.parse(localStorage.getItem(STORAGE_PHOTOS) || "[]");
}

function savePhotos(spotId, base64imgs) {
    const photos = loadPhotos();
    const ids = [];
    for(const img of base64imgs) {
        const id = crypto.randomUUID();
        const photo = {
            id: id,
            spotId: spotId,
            photoData: img
        };
        photos.push(photo);
        ids.push(id);
    }

    if (!safeSetItem(STORAGE_PHOTOS, JSON.stringify(photos))) return null;
    return ids;
}

function getPhotosBySpotId(spotId) {
    const photos = loadPhotos();
    return photos.filter(s => s.spotId == spotId);
}

function removePhotoById(targetPhotoId) {
    const photos = loadPhotos();
    const filtered = photos.filter(p => p.id !== targetPhotoId);
    if (!safeSetItem(STORAGE_PHOTOS, JSON.stringify(filtered))) return false;
    return true;
}

// このspotIdに登録されている複数の写真の先頭に、targetPhotoIdの写真を移動する
function swapMainPhoto(spotId, targetPhotoId) {
    const photos = loadPhotos();
    const filtered = photos.filter(s => s.spotId == spotId);
    const index = filtered.findIndex(photo => photo.id === targetPhotoId);
    if ( index <= 0 ) return true;   // filteredのなかで、すでに先頭にあるので終了

    const dstPhotoIdInFiltered = filtered[0].id; // filteredのなかで先頭の写真のID
    const dstPhotoIndex = photos.findIndex(photo => photo.id === dstPhotoIdInFiltered);
    const targetPhotoIndex = photos.findIndex(photo => photo.id === targetPhotoId);
    [photos[dstPhotoIndex], photos[targetPhotoIndex]] = [photos[targetPhotoIndex], photos[dstPhotoIndex]];
    if (!safeSetItem(STORAGE_PHOTOS, JSON.stringify(photos))) return false;
    return true;
}