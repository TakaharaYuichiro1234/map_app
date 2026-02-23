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
    { onEach = async () => true, onComplete = async () => {} } = {}
) {
    for (const file of e.target.files) {
        const result = await onEach(file);
        if (result === false)  return;
    }

    await onComplete();
}
