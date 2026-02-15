let mSelectedPhotoId = null;

function showPhoto(id) {
    const domPhotoPreviewArea = document.getElementById("photo-preview-area");
    domPhotoPreviewArea.innerHTML = "";

    const photos = getPhotosBySpotId(id);
    photos.forEach(photo => {
        const img = document.createElement("img");
        img.src = photo.photoData;

        img.addEventListener("click", () => {
            mSelectedPhotoId = photo.id;
            openPhotoModal(photo.photoData);
        });

        domPhotoPreviewArea.appendChild(img);
    });
}

function removePhoto(spotId) {
    if (!confirm("この写真を削除しますか？")) return;

    removePhotoById(mSelectedPhotoId); 
    closePhotoModal();
    showPhoto(spotId);
}

function setMainPhoto(spotId) {
    swapMainPhoto(spotId, mSelectedPhotoId);
    closePhotoModal();
    showPhoto(spotId);
}

function openPhotoModal(src) {
    const modal = document.querySelector(".modal");
    const img = document.getElementById("photo-modal-img");

    img.src = src;
    modal.classList.remove("hidden");
}

function closePhotoModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hidden");
    mSelectedPhotoId = null;
}