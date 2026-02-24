// *****************************
// 基本的なlocalStorage操作
// *****************************
export function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        if (e instanceof DOMException &&
            (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {

            alert(
                "保存できません。\n" +
                "ローカルストレージの容量が上限に達しました。\n" +
                `現在の使用量：約${getLocalStorageSizeKB()} KB`
            );
            return false;
        }
        throw e;
    }
}

function getLocalStorageSizeKB() {
    let total = 0;
    for (let key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        const value = localStorage.getItem(key);
        total += key.length + value.length;
    }
    return (total * 2 / 1024).toFixed(2); // UTF16(2bytes)換算
}