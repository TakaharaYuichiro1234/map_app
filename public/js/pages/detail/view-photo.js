let mSelectedPhotoId = null;

async function showPhoto() {
    const domPhotoPreviewArea = document.getElementById("photo-preview-area");
    domPhotoPreviewArea.innerHTML = "";

    const photos = await getPhotosBySpotId(id);
    photos.forEach(photo => {
        const img = document.createElement("img");
        const path = `${BASE_PATH}/uploads/${photo.spotId}/${photo.filename}`;
        img.src = path;
        img.onerror = function () {
            this.onerror = null; // 無限ループ防止
            this.src = `${BASE_PATH}/resources/img/noimage.png`;
        };

        img.addEventListener("click", () => {
            mSelectedPhotoId = photo.id;
            openPhotoModal(photo);
        });

        domPhotoPreviewArea.appendChild(img);
    });
}

async function removePhoto() {
    if (!confirm("この写真を削除しますか？")) return;

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

    await removePhotoById(csrfToken, mSelectedPhotoId);
    closePhotoModal();
    await showPhoto();
}

async function setMainPhoto() {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

    await swapMainPhoto(csrfToken, id, mSelectedPhotoId);
    closePhotoModal();
    await showPhoto();
}

function openPhotoModal(photo) {
    const modal = document.querySelector(".modal");
    const img = document.getElementById("photo-modal-img");

    const path = `${BASE_PATH}/uploads/${photo.spotId}/${photo.filename}`;
    img.src = path;
    img.onerror = function () {
        this.onerror = null; // 無限ループ防止
        this.src = `${BASE_PATH}/resources/img/noimage.png`;
    };

    modal.classList.remove("hidden");
}

function closePhotoModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hidden");
    mSelectedPhotoId = null;
}