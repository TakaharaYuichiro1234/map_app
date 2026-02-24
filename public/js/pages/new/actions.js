import { BASE_PATH } from '../../config.js';
import { saveSpot } from '../../services/spot-service.js';
import { savePhotos } from '../../services/photo-service.js';
import { photoList, address, newSpotPos } from './index.js';

let selectedPhotoIndex = null;

export function showPhoto() {
    const domPhotoPreviewArea = document.getElementById("photo-preview-area");
    domPhotoPreviewArea.innerHTML = "";

    for (const [i, photo] of photoList.entries()) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(photo);

        img.addEventListener("click", () => {
            selectedPhotoIndex = i;
            openPhotoModal(photo);
        });

        domPhotoPreviewArea.appendChild(img);
    }
}

export function removePhoto() {
    if (!confirm("この写真を削除しますか？")) return;

    photoList.splice(selectedPhotoIndex, 1);
    closePhotoModal();
    showPhoto();
}

export function setMainPhoto() {
    if (selectedPhotoIndex >= 1) {
        [photoList[0], photoList[selectedPhotoIndex]] = [photoList[selectedPhotoIndex], photoList[0]];
    }

    closePhotoModal();
    showPhoto();
}

function openPhotoModal(photo) {
    const modal = document.querySelector(".modal");
    const img = document.getElementById("photo-modal-img");
    img.src = URL.createObjectURL(photo);
    modal.classList.remove("hidden");
}

export function closePhotoModal() {
    const modal = document.querySelector(".modal");
    modal.classList.add("hidden");
    selectedPhotoIndex = null;
}

export async function registerSpot() {
    const form = document.getElementById('store-spot-form');
    const formData = new FormData(form);
    const spotName = formData.get('name').trim();
    const description = formData.get('description').trim();

    if (!spotName) {
        alert("スポット名は必須です。");
        return;
    }

    if (!newSpotPos) {
        alert("位置情報が取得できませんでした。");
        return;
    }

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

    const newSpotId = await saveSpot(csrfToken, spotName, description, newSpotPos.lat, newSpotPos.lng, address);
    if (newSpotId < 0) {
        alert("スポットの登録に失敗しました。");
        return;
    }

    const ret = await savePhotos(csrfToken, newSpotId, photoList);
    if (!ret) {
        console.error("写真の登録に失敗しました。");
    }
    location.href = `${BASE_PATH}/spots?highlight=${newSpotId}`;
}
