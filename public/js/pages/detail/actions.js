import { BASE_PATH, NEAR_DISTANCE } from '../../config.js';
import { getSpotById, removeSpot } from '../../services/spot-service.js';
import { isRated, saveRating } from '../../services/rating-service.js';
import { formatDate } from '../../utils/date-utils.js';
import { mCurrentPositionStatus } from './index.js';
import { calDistance } from '../../utils/math.js';

export function back() {
    location.href = `${BASE_PATH}/spots?highlight=${id}`;
}

export async function remove() {
    const spot = await getSpotById(id);
    const result = window.confirm(`このスポット「${spot.name}」を削除してもよろしいですか？\nスポットを削除すると写真や評価データも削除されます。`);
    if (result) {

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        const resp = await removeSpot(csrfToken, id);
        if (resp) {
            alert(`スポット「${spot.name}」を削除しました。`);
            window.location.href = `${BASE_PATH}`;
        } else {
            alert("このスポットの削除に失敗しました。");
        }
    }
}

export async function submitRating() {
    const spot = getSpotById(id);
    let distance = null;
    if (mCurrentPositionStatus.position) {
        distance = calDistance(
            mCurrentPositionStatus.position.lat,
            mCurrentPositionStatus.position.lng,
            spot.lat,
            spot.lng
        );
    }

    if (!distance) {
        if (!confirm('現在地が取得できないため、このスポットが近くにない可能性があります。このまま、このスポットの評価を登録しますか？')) return;
    } else if (distance > NEAR_DISTANCE) {
        alert(`このスポットは現在地から離れているため評価できません。\n評価できるのは${NEAR_DISTANCE}km以内のスポットです。`);
        return;
    } else {
        if (!confirm('評価を登録してよろしいですか？')) return;
    }

    const uuid = user['uuid'];
    const date = formatDate(new Date());

    // 評価済みかどうかチェック。評価済みなら保存しない
    if (await isRated(id, uuid, date)) return false;

    // 評価を保存
    const rating = Number(document.querySelector('input[name="rating"]:checked')?.value ?? 0);
    const comment = document.getElementById('rating-comment').value;

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

    const ret = await saveRating(csrfToken, id, date, rating, comment);
    if (!ret) {
        alert("評価の登録に失敗しました。");
        return;
    }

    location.href = `${BASE_PATH}/spots?highlight=${id}`;
}