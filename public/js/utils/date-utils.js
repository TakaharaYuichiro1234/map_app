// *****************************
// 日付操作の関数
// *****************************

// Date型のdateを、集計や比較用に「yy-mm-dd」形式の文字列に変換
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Date型のdateを、チャートのラベル用の文字列に変換
function formatDateLabel(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const day = date.getDay();
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    return `${m}/${d}(${dayNames[day]})`;
}

// Date型のdateを、詳細画面の表示用に「yyyy-mm-dd」形式の文字列に変換
function formatDateTime(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');

    return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

// 同一の日付かどうかの判定
function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}