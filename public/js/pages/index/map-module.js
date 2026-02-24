import { DEFAULT_MAP_CENTER_ZOOM, STORAGE_MAP_CENTER_ZOOM, IS_DEBUG, OFFSET_LAT, OFFSET_LNG } from '../../config.js';
import { saveMapCenterZoom } from '../../services/map-service.js';

export class MapModule {
    constructor() {
        this.mapElementId = "map";
        this.canvasId = "overlay-canvas";

        // map関連
        this.map = null;
        this.latestCurrentPosition = null;
        this.firstLocate = false;
        this.userMarker = null;

        // 3D棒グラフ関連
        this.canvas = null;
        this.ctx = null;
        this.spots = [];
        this.ratingStats = [];

        this.barHitAreas = [];
        this.activePopup = null;

        this.ANIMATION_SPEED = 0.02;
        this.animationProgress = 0;
        this.HOLD_TIME = 3000;
        this.phase = "growing";
        this.holdStartTime = null;

        this.highlightSpotId = null;
        this.highlightStartTime = null;
        this.moveToHilightSpotFlag = false;
    }

    // -----------------------------
    // パブリックメソッド
    // -----------------------------

    setSpotData(spots, ratingStats) {
        this.spots = spots;
        this.ratingStats = ratingStats;
    }

    setHighlight(id) {
        if (id) {
            this.highlightSpotId = id;
            this.highlightStartTime = performance.now();
            this.moveToHilightSpotFlag = true;
        }
    }

    init() {
        this.initMap();
        this.initCanvasLayer();
        this.moveToHilightSpot();
    }

    getLatestCurrentPosition() {
        return this.latestCurrentPosition;
    }

    getMapCenter() {
        return this.map.getCenter();
    }

    getMapZoom() {
        return this.map.getZoom();
    }

    getMapBounds() {
        return this.map.getBounds();
    }

    refreshMap() {
        this.drawBars();
    }

    highlightSpot(spotId) {
        this.highlightSpotId = spotId;
        this.highlightStartTime = performance.now();
        this.activePopup = null;
        this.moveToHilightSpot();
    }

    moveToCurrent() {
        if (!this.latestCurrentPosition) return;
        this.map.setView(this.latestCurrentPosition, this.map.getZoom(), {
            animate: true,
            duration: 0.4
        });
    }

    // -----------------------------
    // 初期化
    // -----------------------------
    initMap() {
        this.createMap();
        this.setupTile();
        this.initUserMarker();
        this.setupLocation();
        this.setupMapEvents();
    }

    initCanvasLayer() {
        this.initCanvas();
        this.animateBars();
    }

    // -----------------------------
    // マップ関連の基本的な関数
    // -----------------------------
    createMap() {
        this.map = L.map(this.mapElementId);
        this.map.doubleClickZoom.disable();

        try {
            const obj = JSON.parse(localStorage.getItem(STORAGE_MAP_CENTER_ZOOM));
            if (!obj.pos[0] || !obj.pos[1] || !obj.zoom) throw new Error("位置情報の初期値が不正");
            this.map.setView(obj.pos, obj.zoom);
        } catch {
            this.map.setView(DEFAULT_MAP_CENTER_ZOOM.pos, DEFAULT_MAP_CENTER_ZOOM.zoom);
            this.firstLocate = true;
        }
    }

    setupTile() {
        L.tileLayer(
            "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            { attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>" }
        ).addTo(this.map);
    }

    initUserMarker() {
        this.userMarker = L.circleMarker([0, 0], {
            radius: 10,
            weight: 6,
            color: "#007AFF",
            fillColor: "#EEE",
            fillOpacity: 0.8,
            className: "user-location"
        }).addTo(this.map);
    }

    setupLocation() {
        this.map.locate({ watch: true, setView: false, enableHighAccuracy: true });
    }

    setupMapEvents() {
        this.map.on("locationfound", e => this.onLocationFound(e));
        this.map.on("click", e => this.onMapClick(e));
        this.map.on('moveend zoomend', () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            saveMapCenterZoom(center.lat, center.lng, zoom);

            this.drawBars();
        });
    }

    moveToHilightSpot() {
        if (this.highlightSpotId) {
            const spot = this.spots.find(s => s.id === this.highlightSpotId);
            if (spot) {
                const latlng = L.latLng(spot.lat, spot.lng);
                if (!this.map.getBounds().contains(latlng)) {
                    this.map.setView(latlng, this.map.getZoom(), {
                        animate: true,
                        duration: 0.4
                    });
                }
            }
        }
    }

    // -----------------------------
    // マップ関連コールバック関数
    // -----------------------------
    onLocationFound(e) {
        const offsetLat = IS_DEBUG ? OFFSET_LAT : 0.0;
        const offsetLng = IS_DEBUG ? OFFSET_LNG : 0.0;

        const pos = {
            lat: e.latlng.lat + offsetLat,
            lng: e.latlng.lng + offsetLng
        };

        this.userMarker.setLatLng(pos);
        this.latestCurrentPosition = pos;

        // 初回起動時(localStorageに前回の位置が保存されていない状態)は地図を現在地に移動する
        if (this.firstLocate) {
            this.map.setView(pos, 14);
            this.firstLocate = false;
            saveMapCenterZoom(pos.lat, pos.lng, this.map.getZoom());
        }
    }

    onMapClick(e) {
        const p = this.map.latLngToContainerPoint(e.latlng);
        const x = p.x;
        const y = p.y;

        // ポップアップのクリック判定 (クリックしたら詳細画面へ遷移)
        if (this.activePopup) {
            const q = this.map.latLngToContainerPoint([this.activePopup.lat, this.activePopup.lng]);
            const boxX = q.x - 20;
            const boxY = q.y + 10;

            if (x >= boxX && x <= boxX + this.activePopup.width &&
                y >= boxY && y <= boxY + this.activePopup.height) {
                document.dispatchEvent(new CustomEvent('open-detail', {
                    detail: { id: this.activePopup.spotId }
                }))
                return;
            }
        }

        // 棒グラフのクリック判定 (クリックしたらポップアップを表示)
        for (const bar of this.barHitAreas) {
            if (
                x >= bar.x &&
                x <= bar.x + bar.width &&
                y >= bar.y &&
                y <= bar.y + bar.height
            ) {
                this.showCanvasPopup(bar.spotId, bar.lat, bar.lng, bar.spotName, x, y);
                return;
            }
        }

        // 地図の何もないところをクリックしたとき (ポップアップを閉じる)
        if (this.activePopup) {
            this.activePopup = null;
            this.drawBars();
        }
    }

    // -----------------------------
    // 3D棒グラフ関連の基本的な関数
    // -----------------------------
    initCanvas() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
    }

    // loadSpotData() {
    //     this.spots = loadSpots();
    // }

    // getHighlightFromUrl() {
    //     const params = new URLSearchParams(location.search);
    //     const id = params.get("highlight");
    //     if (id) {
    //         this.highlightSpotId = id;
    //         this.highlightStartTime = performance.now();
    //         this.moveToHilightSpotFlag = true;
    //     }
    // }

    // -----------------------------
    // 3D棒グラフ描画
    // -----------------------------
    projectBox(levelH, levelA, p0) {
        const UNIT_H = 20;  // levelH=1の時の高さ(px/level)
        const UNIT_A = 10;  // levelA=1の時の底面の辺の長さ(px/level)
        const K_S = 0.2;    // 前面と背面のズレを表す係数
        const K_U = 0.98;   // 前面と背面の長さの比率
        const K_D = 0.7;    // 前面と奥行きの長さの比率
        const K_T = 1.1;    // levelH=1のときの底面と上面の長さの比

        const h = levelH * UNIT_H;
        const wB = levelA * UNIT_A;

        const sB = K_S * wB;
        const uB = K_U * wB;
        const dB = K_D * wB;

        const wT = (1 + (K_T - 1.0) * levelH) * wB;
        const sT = K_S * wT;
        const uT = K_U * wT;
        const dT = K_D * wT;

        // 底面の4隅の点(xBi,yBi) (左下を基準に右回りにi=0,1,2,3)
        const xB0 = p0.x - wB / 2;
        const yB0 = p0.y;
        const xB1 = xB0 + sB;
        const yB1 = yB0 - dB;
        const xB2 = xB1 + uB;
        const yB2 = yB1;
        const xB3 = xB0 + wB;
        const yB3 = yB0;

        // 上面の4隅の点(xTi,yTi) (左下を基準に右回りにi=0,1,2,3)
        const xT0 = p0.x - wT / 2;
        const yT0 = p0.y - h;
        const xT1 = xT0 + sT;
        const yT1 = yT0 - dT;
        const xT2 = xT1 + uT;
        const yT2 = yT1;
        const xT3 = xT0 + wT;
        const yT3 = yT0;

        const basePoints = [{ x: xB0, y: yB0 }, { x: xB1, y: yB1 }, { x: xB2, y: yB2 }, { x: xB3, y: yB3 }];
        const topPoints = [{ x: xT0, y: yT0 }, { x: xT1, y: yT1 }, { x: xT2, y: yT2 }, { x: xT3, y: yT3 }];
        const hitPoints = [{ x: xT0, y: yB0 }, { x: xT0, y: yT1 }, { x: xT2, y: yT2 }, { x: xT2, y: yT3 }];
        return { basePoints, topPoints, hitPoints };
    }

    isHighlighting(spotId) {
        if (spotId !== this.highlightSpotId) return false;

        const HIGHTLIGHT_DURATION = 2000;
        const elapsed = performance.now() - this.highlightStartTime;
        return elapsed < HIGHTLIGHT_DURATION;
    }

    getBarColor(rated, isHighlight, isExpansionBar) {
        // どの面か、評価済みか、によって基本のLuminance値を選択
        const BASE_LUMI = {
            "rated": {
                "front": 60,
                "top": 80,
                "side": 45
            },
            "notRated": {
                "front": 90,
                "top": 98,
                "side": 85
            }
        }

        // 伸縮の変化量
        const expansionRate = isExpansionBar ? (this.animationProgress) : 1;

        // 点滅の変化量
        const blink = isHighlight
            ? Math.floor(performance.now() / 100) % 2
            : 0;

        const barColor = baseLumi => {
            const LUMI_BLINK_RANGE = 20;
            const blinkedLumi = baseLumi + blink * LUMI_BLINK_RANGE;
            const lumi = Math.max(0, Math.min(100, blinkedLumi));
            const START_ALPHA = 0.2;
            const STABLE_ALPHA = 0.8;
            const alpha = (STABLE_ALPHA - START_ALPHA) * expansionRate + START_ALPHA;
            return `hsla(0,100%,${lumi}%,${alpha})`
        };

        return [
            barColor(BASE_LUMI[rated]["front"]),
            barColor(BASE_LUMI[rated]["top"]),
            barColor(BASE_LUMI[rated]["side"])
        ];
    }

    drawBars() {
        this.canvas.width = this.map.getSize().x;
        this.canvas.height = this.map.getSize().y;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.barHitAreas.length = 0;

        this.spots.forEach(spot => {
            const index = this.ratingStats.findIndex(r => r.spotId === spot.id);
            let latestRating = 1;
            let pastRating = 1;
            let users = 1;
            let isRated = false;
            if (index >= 0) {
                latestRating = this.ratingStats[index].recentRating;
                pastRating = this.ratingStats[index].pastRating;
                users = Math.min(5, this.ratingStats[index].totalUsers);
                isRated = this.ratingStats[index].isRated;
            }

            const p = this.map.latLngToContainerPoint([spot.lat, spot.lng]);


            // バーの高さレベル(1〜5)
            const maxH = latestRating > 0 ? latestRating : 1;
            const minH = pastRating > 0 ? pastRating : 1;
            const levelH = (maxH - minH) * this.animationProgress + minH;



            // バーの底面サイズレベル(1〜2: ユーザー数1のとき1、5のとき2)
            const levelA = Math.max(1.0, Math.min(2.0, 1.0 + (users - 1) / 4));



            // 遠近投影計算
            const { basePoints, topPoints, hitPoints } = this.projectBox(levelH, levelA, p);

            // バーの色
            const isExpansionBar = (maxH != minH);
            const isHighlight = this.isHighlighting(spot.id);

            const rated = latestRating > 0 ? "rated" : "notRated";
            const barColor = this.getBarColor(rated, isHighlight, isExpansionBar);
            const frontColor = barColor[0];
            const topColor = barColor[1];
            const sideColor = barColor[2];

            this.ctx.strokeStyle = latestRating > 0 ? "#FFFFFFE0" : "#666666";

            // バーの前面を描く
            this.ctx.fillStyle = frontColor;
            this.ctx.beginPath();
            this.ctx.moveTo(basePoints[0].x, basePoints[0].y);
            this.ctx.lineTo(topPoints[0].x, topPoints[0].y);
            this.ctx.lineTo(topPoints[3].x, topPoints[3].y);
            this.ctx.lineTo(basePoints[3].x, basePoints[3].y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // バーの上面を描く
            this.ctx.fillStyle = topColor;
            this.ctx.beginPath();
            this.ctx.moveTo(topPoints[0].x, topPoints[0].y);
            this.ctx.lineTo(topPoints[1].x, topPoints[1].y);
            this.ctx.lineTo(topPoints[2].x, topPoints[2].y);
            this.ctx.lineTo(topPoints[3].x, topPoints[3].y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // バーの側面を描く
            this.ctx.fillStyle = sideColor;
            this.ctx.beginPath();
            this.ctx.moveTo(basePoints[3].x, basePoints[3].y);
            this.ctx.lineTo(topPoints[3].x, topPoints[3].y);
            this.ctx.lineTo(topPoints[2].x, topPoints[2].y);
            this.ctx.lineTo(basePoints[2].x, basePoints[2].y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();

            // チェックマーク
            if (isRated) {
                this.drawCheckMark(
                    basePoints[3].x,
                    basePoints[3].y - 6
                );
            }

            // バーをクリックした時の当たり判定            
            this.barHitAreas.push({
                lat: spot.lat,
                lng: spot.lng,
                spotName: spot.name,
                x: hitPoints[1].x,
                y: hitPoints[1].y,
                width: hitPoints[2].x - hitPoints[1].x,
                height: hitPoints[0].y - hitPoints[1].y,
                spotId: spot.id
            });
        });

        this.drawPopup();
    }

    drawCheckMark(x, y) {
        this.ctx.save();

        // 背景部分の丸を描く
        this.ctx.fillStyle = "rgba(255,255,255,0.85)";
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // チェックマークを描く
        this.ctx.strokeStyle = "#AF52DE";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";

        this.ctx.beginPath();
        this.ctx.moveTo(x - 4, y);
        this.ctx.lineTo(x - 1, y + 3);
        this.ctx.lineTo(x + 5, y - 4);
        this.ctx.stroke();

        this.ctx.restore();
    }

    animateBars() {
        const loop = ts => {
            if (this.phase === "growing") {
                this.animationProgress += this.ANIMATION_SPEED;
                if (this.animationProgress >= 1) {
                    this.animationProgress = 1;
                    this.phase = "holding";
                    this.holdStartTime = ts;
                }
            } else if (this.phase === "holding" && ts - this.holdStartTime >= this.HOLD_TIME) {
                this.animationProgress = 0;
                this.phase = "growing";
            }

            this.drawBars();
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    drawPopup() {
        if (!this.activePopup) return;

        // ポップアップの基準点
        const p = this.map.latLngToContainerPoint([this.activePopup.lat, this.activePopup.lng]);
        const boxX = p.x - 20;
        const boxY = p.y + 10;

        this.ctx.save();

        // スポット名のテキスト(サイズ取得のため先に設定)
        const text = this.activePopup.spotName;
        this.ctx.font = "14px sans-serif";
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;

        // 棒グラフを指す三角印
        const arrowTipWidth = 8;
        const arrowTipOffset = 20;
        this.ctx.fillStyle = "#0000FF40";
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(boxX + arrowTipOffset - arrowTipWidth / 2, boxY + 2);
        this.ctx.lineTo(boxX + arrowTipOffset + arrowTipWidth / 2, boxY + 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // ポップアップの背景となる四角形
        const popupLeft = boxX;
        const popupTop = boxY;
        const popupWidth = textWidth + 20;
        const popupHeight = 30;
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(popupLeft, popupTop, popupWidth, popupHeight);

        // スポット名を書く
        this.ctx.fillStyle = "blue";
        this.ctx.fillText(text, boxX + 10, boxY + 20);

        // スポット名のテキストに下線
        this.ctx.strokeStyle = "blue";
        this.ctx.beginPath();
        this.ctx.moveTo(boxX + 10, boxY + 22);
        this.ctx.lineTo(boxX + 10 + textWidth, boxY + 22);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();

        this.activePopup.width = popupWidth;
        this.activePopup.height = popupHeight;
    }

    showCanvasPopup(spotId, lat, lng, spotName, x, y) {
        this.activePopup = {
            spotId: spotId,
            lat: lat,
            lng: lng,
            spotName: spotName,
            width: 150,
            height: 30
        };
        this.drawBars();
    }
}
