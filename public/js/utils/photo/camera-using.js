export async function cameraUsing(photoSelectBtnElementId) {
    const canUseCamera = await checkCameraAvailable();
    const photoSelectBtn = document.getElementById(photoSelectBtnElementId);
    photoSelectBtn.style.display = canUseCamera ? "block" : "none";
}

// カメラが使えるか判定
export async function checkCameraAvailable() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch {
        return false;
    }
}
