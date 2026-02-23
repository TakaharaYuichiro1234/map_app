<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
    <title>危険スポット登録</title>
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/style.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/new.css">
</head>

<body>
    <header class="header-type4">
        <button class="prev-button">
            <a class="lessthan" href="<?= BASE_PATH ?>/"></a>
        </button>
        <span class="header-title">新規スポット登録</span>
        <button class="header-button" id="registerBtn">登録</button>
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
        <form id="store-spot-form">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
            <div>
                <p class="info-caption">スポット名：</p>
                <input name="name" class="info-data" type="text" id="spotName" maxlength="100">
            </div>
            <div>
                <p class="info-caption">危険内容の説明：</p>
                <textarea name="description" class="info-data info-data-textarea" id="description" maxlength="300"></textarea>
            </div>

            <div>
                <p class="info-caption">写真：</p>
                <div class="photo-btn-container">
                    <button type="button" id="photo-select-btn" class="photo-btn">撮影</button>
                    <button type="button" id="file-select-btn" class="photo-btn">ファイル選択</button>
                </div>
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
                <div id="photo-preview-area" style="margin-top:10px;"></div>
            </div>
        </form>
    </main>

    <script>
        const user = <?= json_encode($user, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        const isAdmin = <?= json_encode($isAdmin, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

    <script src="<?= BASE_PATH ?>/js/app.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/muni.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/camera-using.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/photo-selector.js"></script>
    <script src="<?= BASE_PATH ?>/js/utils/photo/photo-uploader.js"></script>

    <script src="<?= BASE_PATH ?>/js/services/photo-service.js"></script>
    <script src="<?= BASE_PATH ?>/js/services/spot-service.js"></script>
    <script src="<?= BASE_PATH ?>/js/services/user-service.js"></script>

    <script src="<?= BASE_PATH ?>/js/pages/new/actions.js"></script>
    <script src="<?= BASE_PATH ?>/js/pages/new/index.js"></script>
</body>

</html>