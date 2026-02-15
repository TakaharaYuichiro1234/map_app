function initPhotoSelector(
    photoSelectBtnElementId, 
    photoInputElementId, 
    fileSelectBtnElementId, 
    fileInputElementId, 
    onSelect
) {
    const photoSelectBtn = document.getElementById(photoSelectBtnElementId);
    const photoInput = document.getElementById(photoInputElementId);
    photoSelectBtn.addEventListener("click", () => photoInput.click());
    photoInput.addEventListener("change", onSelect);
    
    const fileSelectBtn = document.getElementById(fileSelectBtnElementId);
    const fileInput = document.getElementById(fileInputElementId)
    fileSelectBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", onSelect);
}

async function handlePhotoSelect(
    e,
    { onEach = () => true, onComplete = () => {} } = {}
) {
    for (const file of e.target.files) {
        const base64 = await readFileAsBase64(file);
        const compressed = await compressImage(base64);
        const result = onEach(compressed);
        if (result === false)  return;
    }

    onComplete();
}