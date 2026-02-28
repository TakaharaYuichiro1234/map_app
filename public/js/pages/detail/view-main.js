import { NEAR_DISTANCE } from '../../config.js';
import { formatDate, formatDateTime } from '../../utils/date-utils.js';
import { getUserByUuid } from '../../services/user-service.js';
import { getSpotRatingStats, isRated } from '../../services/rating-service.js';
import { DetailMapModule } from './detail-map-module.js';
import { DetailChartModule } from './detail-chart-module.js';
import { mCurrentPositionStatus, showDistanceComment } from './index.js';

let mExistsMyRatingToday = false; // 今日、自分がこのスポットを評価済みならtrue

export async function initViewMain(isOwner, spot) {
    mExistsMyRatingToday = user ? await isRated(spot.id, user['uuid'], formatDate(new Date())) : false;
    document.getElementById("header-title").innerHTML = spot.name;
    document.getElementById("photo-btn-container").style.display = isOwner ? "flex" : "none";

    initRatingBlock();
    initRegistratedDataBlock(isOwner, spot);
    initMapBlock(spot);
    initChartBlock(spot);
}

function initRatingBlock() {
    const domRatingInputs = document.getElementById("rating-inputs");
    const isViewing = !mExistsMyRatingToday && user;
    domRatingInputs.style.display = isViewing ? "block" : "none";
    setRatingInputsViewing();
}

export function setRatingInputsViewing(distance = null) {
    const domRatingInputsHeader = document.getElementById("rating-inputs-header");
    const domSubmitRating = document.getElementById("submit-rating");

    let text = "";
    if (user) {
        if (mExistsMyRatingToday) {
            text = "このスポットは危険度を評価済みです。<br>(1日1回評価できます)";
        } else if (!distance || distance < NEAR_DISTANCE) {
            text = "このスポットの危険度を評価してください。";
            domSubmitRating.removeAttribute("disabled");
        } else {
            text = `このスポットは現在地から離れているため評価できません (評価できるのは${NEAR_DISTANCE}km以内のスポットです)。`;
            domSubmitRating.setAttribute("disabled", true);
        }
    } else {
        text = "危険度を評価するにはログインしてください。";
    }

    domRatingInputsHeader.innerHTML = text;
}

async function initRegistratedDataBlock(isOwner, spot) {
    // DOMを一通り取得
    const domTitleInput = document.getElementById("title-input");
    const domDescriptionInput = document.getElementById("description-input");
    const domTitleText = document.getElementById("title-text");
    const domDescriptionText = document.getElementById("description-text");
    const domRemoveSpot = document.getElementById("remove");
    const domCreated = document.getElementById("created");
    const domUserName = document.getElementById("user-name");
    const domUpdateName = document.getElementById("update-name");
    const domUpdateDescription = document.getElementById("update-description");
    const domAddress = document.getElementById("address");

    // 各要素の表示・非表示を設定
    const showForOwner = [domTitleInput, domDescriptionInput, domUpdateName, domUpdateDescription, domRemoveSpot];
    showForOwner.forEach(el => el.style.display = isOwner ? "block" : "none");

    const showForViewer = [domTitleText, domDescriptionText];
    showForViewer.forEach(el => el.style.display = isOwner ? "none" : "block");

    // 各要素の表示内容の初期値を設定
    domTitleInput.value = spot.name;
    domTitleText.innerHTML = spot.name;
    domDescriptionInput.value = spot.description;
    domDescriptionText.innerHTML = spot.description;
    domCreated.innerHTML = formatDateTime(new Date(spot.createdAt));
    domAddress.innerHTML = spot.address ?? "";

    const owner = await getUserByUuid(spot.ownerUuid);
    domUserName.innerHTML = owner ? owner.name : "不明なユーザー";
};

function initMapBlock(spot) {
    // 地図のインスタンスを作成して初期化
    const detailMap = new DetailMapModule();
    detailMap.init();

    // このスポットの位置にマーカーを表示
    detailMap.setMarker(spot.lat, spot.lng);

    // 現在地をイベントで取得して、スポットとの距離に関するコメントを表示
    document.addEventListener("detailmap:locationfound", (e) => {
        const { position } = e.detail;
        mCurrentPositionStatus.position = position;
        mCurrentPositionStatus.lastUpdate = performance.now();
        showDistanceComment({ lat: spot.lat, lng: spot.lng });
    });
}

async function initChartBlock(spot) {
    // 「みんなの評価」部分のチャートインスタンスを作成して初期化
    const overallChart = new DetailChartModule("overallChart", spot.id);
    await overallChart.init();

    // 「みんなの評価」部分のコメント
    let stats = await getSpotRatingStats(spot.id);
    const totalUsers = stats.totalUsers;
    const recentRating = stats.recentRating;
    const pastRating = stats.pastRating;

    let trendComment = "";
    if (pastRating < recentRating) {
        trendComment = "<li>危険度の評価値が上昇傾向です</li>";
    } else if (pastRating > recentRating) {
        trendComment = "<li>危険度の評価値が改善傾向です</li>";
    }

    const usersComment = (totalUsers > 0)
        ? `<li>このスポットは${totalUsers}人に評価されています</li>`
        : "<li>まだ評価がありません</li>";

    document.getElementById("overall-rating-info").innerHTML = `<ul>${usersComment}${trendComment}</ul>`;

    // 「自分の評価」部分のインスタンスを作成して初期化
    if (user) {
        const myChart = new DetailChartModule("myChart", spot.id, user['uuid']);
        await myChart.init();

        // 「自分の評価」部分のコメント
        document.getElementById("my-rating-info").innerHTML = (myChart.ratingCount > 0)
            ? ""
            : "<ul><li>このスポットはまだ評価していません</li></ul>";
    }
}
