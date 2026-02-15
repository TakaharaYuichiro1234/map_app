function showPhoto() {
    const domPhotoPreviewArea = document.getElementById("photo-preview-area");
    domPhotoPreviewArea.innerHTML = "";

    for (const [i, photo] of photoList.entries()) {
        const img = document.createElement("img");
        img.src = photo;

        img.addEventListener("click", () => {
            selectedPhotoIndex = i;
            openPhotoModal(photo);
        });

        domPhotoPreviewArea.appendChild(img);
    }
}

function removePhoto() {
    if (!confirm("この写真を削除しますか？")) return;

    photoList.splice(selectedPhotoIndex, 1);
    closePhotoModal();
    showPhoto();
}

function setMainPhoto() {
    if ( selectedPhotoIndex >= 1 ) {
        [photoList[0], photoList[selectedPhotoIndex]] = [photoList[selectedPhotoIndex], photoList[0]];
    }
    
    closePhotoModal();
    showPhoto();
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
    selectedPhotoIndex = null;
}

function registerSpot() {
    const spotName = document.getElementById("spotName").value;
    const description = document.getElementById("description").value;

    if (!spotName) {
        alert("スポット名は必須です。");
        return;
    }

    if (!newSpotPos) {
        alert("位置情報が取得できませんでした。");
        return;
    }

    const newSpotId = saveSpot(
        spotName, 
        description, 
        newSpotPos.lat, 
        newSpotPos.lng, 
        address, 
        getCurrentUser().id
    );
    if (!newSpotId) {
        alert("スポットの登録に失敗しました。");
        return;
    }

    const photoIds = savePhotos(newSpotId, photoList);
    if (!photoIds) {
        alert("写真の登録に失敗しました。");
    } else {
        alert("登録しました");
    }

    location.href = `index.html?highlight=${newSpotId}`;
}
