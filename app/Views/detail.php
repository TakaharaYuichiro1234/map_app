<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
    <title>スポット詳細</title>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet-gesture-handling/dist/leaflet-gesture-handling.min.css" type="text/css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/style.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/detail.css">
</head>

<body>
    <header class="header-type3">
        <button class="prev-button" id="back">
            <a class="lessthan"></a>
        </button>
        <span class="header-title" id="header-title">スポット詳細</span>
    </header>

    <div class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="閉じる"></button>
            <img id="photo-modal-img" />
            <div class="modal-button-container">
                <button id="photo-modal-remove">この写真を削除</button>
                <button id="photo-modal-set-main">メインの写真に設定</button>
            </div>
        </div>
    </div>

    <main>
        <button class="page-top" id="to-page-top"><span></span>TOP</button>

        <section id="distance-comment"></section>

        <section>
            <div class="section-header">
                <h3>危険度評価</h3>
            </div>
            <p id="rating-inputs-header"></p>

            <div id="rating-inputs">
                <div>
                    <label class="radio-rating"> <input type="radio" name="rating" value="5">5: 非常に危険と感じる</label>
                    <label class="radio-rating"> <input type="radio" name="rating" value="4">4: やや危険と感じる</label>
                    <label class="radio-rating"> <input type="radio" name="rating" value="3" checked>3: どちらとも言えない</label>
                    <label class="radio-rating"> <input type="radio" name="rating" value="2">2: あまり危険と感じない</label>
                    <label class="radio-rating"> <input type="radio" name="rating" value="1">1: 全く危険と感じない</label>
                </div>
                <div>
                    <p class="info-caption">コメント：</p>
                    <textarea class="info-data info-data-textarea" id="rating-comment" maxlength="300"></textarea>
                </div>
                <button class="primary-button" id="submit-rating">評価結果を登録する</button>
            </div>
        </section>

        <section>
            <div class="section-header">
                <h3>このスポットの登録情報</h3>
                <button id="remove">スポットを削除</button>
            </div>

            <div>
                <div class="info-caption-container">
                    <p class="info-caption">スポット名：</p>
                    <button disabled class="info-caption-button" id="update-name">更新</button>
                </div>
                <input class="info-data" type="text" id="title-input" maxlength="100">
                <p class="info-data" id="title-text"></p>
            </div>

            <div>
                <div class="info-caption-container">
                    <p class="info-caption">危険内容の説明：</p>
                    <button disabled class="info-caption-button" id="update-description">更新</button>
                </div>
                <textarea class="info-data info-data-textarea" id="description-input" maxlength="300"></textarea>
                <p class="info-data" id="description-text"></p>
            </div>

            <div>
                <p class="info-caption">登録日時：</p>
                <p class="info-data" id="created"></p>
            </div>

            <div>
                <p class="info-caption">登録ユーザー：</p>
                <p class="info-data" id="user-name"></p>
            </div>

            <div id="photo-btn-container">
                <button id="photo-select-btn" class="photo-btn">写真追加(撮影)</button>
                <button id="file-select-btn" class="photo-btn">写真追加(ファイル)</button>
                <input
                    type="file"
                    id="photo-input"
                    accept="image/*"
                    capture="environment"
                    multiple
                    hidden />
                <input
                    type="file"
                    id="file-input"
                    accept="image/*"
                    multiple
                    hidden />
            </div>

            <div id="photo-preview-area" style="margin-top:10px;"></div>

            <div class="mapArea">
                <div id="map"></div>
            </div>

            <div>
                <p id="address"></p>
            </div>
        </section>

        <section>
            <div class="section-header">
                <h3>過去1ヶ月間の自分の評価の推移</h3>
            </div>
            <div class="rating-info" id="my-rating-info"></div>
            <canvas class="chart" id="myChart"></canvas>
        </section>

        <section>
            <div class="section-header">
                <h3>過去1ヶ月間のみんなの評価の推移</h3>
            </div>
            <div class="rating-info" id="overall-rating-info"></div>
            <canvas class="chart" id="overallChart"></canvas>
        </section>

        <section>
            <div class="section-header">
                <h3>評価の履歴</h3>
            </div>
            <div id="history-container"></div>
        </section>

    </main>

    <script>
        const user = <?= json_encode($user, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        const isAdmin = <?= json_encode($isAdmin, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        const id = parseInt(<?= json_encode($id, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
    </script>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-gesture-handling"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>

    <script src="<?= BASE_PATH ?>/js/app.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/date-utils.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/math.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/camera-using.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/photo-selector.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/photo-uploader.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/to-page-top.js"></script>

    <script src="<?= BASE_PATH ?>/js/services/rating-service.js"></script>
    <script src="<?= BASE_PATH ?>/js/services/photo-service.js"></script>
    <script src="<?= BASE_PATH ?>/js/services/spot-service.js"></script>
    <script src="<?= BASE_PATH ?>/js/services/user-service.js"></script>

    <script src="<?= BASE_PATH ?>/js/pages/detail/detail-map-module.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/detail-chart-module.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/view-main.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/view-photo.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/view-history.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/actions.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/detail/index.js"></script>
</body>

</html>