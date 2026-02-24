<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
    <title>危険スポット一覧</title>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/style.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/css/index.css">
</head>

<body>
    <!-- Javascriptからpostするためのform(非表示) -->
    <div class="hidden">
        <form id="logout" action="<?= BASE_PATH ?>/logout" method="post">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">
        </form>
    </div>

    <header class="header-type1">
        <span class="header-title">危険スポット一覧</span>
        <span class="user-name" id="user-name"><?= htmlspecialchars($_SESSION['user']['name'] ?? "ログインしていません") ?></span>
        <div class="view-switch">
            <input type="checkbox" id="view-switch-check" checked>
            <label for="view-switch-check" class="top">地図</label>
            <label for="view-switch-check" class="bottom">リスト</label>
        </div>
        <button class="three-dot-leader" id="menu-btn">
            <span class="dot"></span>
        </button>
    </header>

    <div class="modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="閉じる"></button>
            <div class="modal-content-inner">
                <div class="modal-text">
                    <h1>危険スポット可視化アプリ</h1>
                </div>
                <div class="modal-text">
                    <p>身近にある危険な場所(危険スポット)の危険度を「3Dマーカー」で地図上に表示するアプリです。</p>
                    <p>SNS型の投稿機能で、危険スポットを登録できます。</p>
                    <p>登録された危険スポットの危険度を、5段階で評価できます。</p>
                    <p>基本的な操作方法は、<a id="splash-modal-a-to-manual">簡易マニュアル</a>の「基本操作 (スポット登録・評価)」をご参照ください。</p>
                </div>
            </div>

            <div class="modal-button-container">
                <button id="splash-modal-to-manual">簡易マニュアル</button>
            </div>
        </div>
    </div>

    <main>
        <div class="menu-panel" id="menu-panel">
            <div class="menu-item <?= $user ? 'hidden' : '' ?>" data-action="login">ログイン</div>
            <div class="menu-item <?= $user ? '' : 'hidden' ?>" data-action="logout">ログアウト</div>
            <div class="menu-item <?= $isAdmin ? '' : 'hidden' ?>" data-action="dummy">ダミーデータ生成</div>
            <hr>
            <div class="menu-item" data-action="manual">簡易マニュアル</div>
            <div class="menu-item" data-action="about">このアプリについて</div>
        </div>

        <!-- 地図表示 -->
        <div class="view-area" id="view-map">
            <div id="map"></div>
            <canvas id="overlay-canvas"></canvas>
            <button id="to-current-btn">現在地</button>
            <div id="map-message" class="map-message">
                場所を指定して「決定」をクリックしてください
                <button id="map-message-cancel-btn" class="cancel-btn">×</button>
            </div>
            <div id="center-cross">＋</div>
            <button class="new-btn" id="new-btn">新規</button>
        </div>

        <!-- リスト表示 -->
        <div class="view-area" id="view-list">
            <div class="list-button-container">
                <button id="btn-list-near"></button>
                <button id="btn-list-all">リセット</button>
            </div>
            <div id="list"></div>
        </div>
    </main>

    <script>
        const user = <?= json_encode($user, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        const isAdmin = <?= json_encode($isAdmin, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
    </script>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <script type="module" src="<?= BASE_PATH ?>/js/pages/index/index.js"></script>
</body>

</html>