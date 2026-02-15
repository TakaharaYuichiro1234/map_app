function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function compressImage(base64, maxSize = 150, quality = 0.3) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;

        img.onload = () => {
            let w, h;

            if (img.width >= img.height) {
                const scale = maxSize / img.width;
                w = maxSize;
                h = img.height * scale;
            } else {
                const scale = maxSize / img.height;
                h = maxSize;
                w = img.width * scale;
            }

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(w);
            canvas.height = Math.round(h);

            canvas.getContext("2d").drawImage(img, 0, 0, w, h);

            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
        };

        img.onerror = reject;
    });
}
