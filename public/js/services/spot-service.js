// *****************************
// スポットデータ管理
// *****************************
function loadSpots() {
    const storageSpots = JSON.parse(localStorage.getItem(STORAGE_SPOTS) || "[]");
    return storageSpots;
}

function saveSpot(name, description, lat, lng, address, ownerId) {
    const spots = loadSpots();

    const spotId = crypto.randomUUID();
    const spot = {
        id: spotId,
        name: name,
        description: description,
        lat: lat,
        lng: lng,
        address: address,
        ownerId: ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalUsers: 0,
        recentRating: 0,
        pastRating: 0
    };
    spots.push(spot);

    if (!safeSetItem(STORAGE_SPOTS, JSON.stringify(spots))) return null;

    return spotId;
}

function getSpotById(id) {
    return loadSpots().find(s => s.id === id);
}

function updateSpot(id, data) {
    const spots = loadSpots();
    const index = spots.findIndex(s => s.id === id);

    if (index === -1) return false;

    for (const [key, value] of Object.entries(data)) {
        if (key !== "id" && key in spots[index]) {
            spots[index][key] = value;
        }
    }

    spots[index].updatedAt = new Date().toISOString();
    if (!safeSetItem(STORAGE_SPOTS, JSON.stringify(spots))) return false;
    return true;
}

function removeSpot(targetSpotId) {
    const spots = loadSpots();
    const index = spots.findIndex(s => s.id === targetSpotId);

    if (index === -1) return false;

    const ratings = loadRatings();
    const updatedRatings = ratings.filter(rating => rating.spotId !== targetSpotId);

    const photos = loadPhotos();
    const updatedPhotos = photos.filter(photo => photo.spotId !== targetSpotId);

    // 更新実行
    spots.splice(index, 1);
    if (!safeSetItem(STORAGE_SPOTS, JSON.stringify(spots))) return false;
    if (!safeSetItem(STORAGE_RATINGS, JSON.stringify(updatedRatings))) return false;
    if (!safeSetItem(STORAGE_PHOTOS, JSON.stringify(updatedPhotos))) return false;
    return true;
}

function getSpotNumber() {
    const numberText = localStorage.getItem(STORAGE_SPOT_NUMBER);
    let number = 1;
    if (numberText) {
        number = Number(numberText) + 1;
    } 

    if (!safeSetItem(STORAGE_SPOT_NUMBER, String(number))) return null;
    return number;
}