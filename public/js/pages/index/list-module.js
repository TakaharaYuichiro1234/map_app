class ListModule {
    constructor() {
        this.listDom = document.getElementById("list");
        this.spots = [];
    }

    // -----------------------------
    // パブリックメソッド
    // -----------------------------
    setSpotData(spots) {
        this.spots = spots;
    }

    init() {
        this.showList();
    }

    filterNearSpots(currentPosition) {
        this.showList(true, currentPosition);
    }

    reset() {
        this.showList();
    }

    // -----------------------------
    // プライベートメソッド
    // -----------------------------
    showList(isOnlyNear = false, currentPosition = null) {
        this.listDom.innerHTML = '';

        if (isOnlyNear && !currentPosition) {
            this.listDom.innerHTML = "<p>現在地が取得できません</p>";
            return;
        }

        const spots = this.getSpots(isOnlyNear, currentPosition);

        // スポットデータをリストで表示
        let counter = 0;
        for (const s of spots) {
            if (isOnlyNear && s.distance > NEAR_DISTANCE) continue;
            counter++;
            this.createListContent(s);
        }

        if (counter === 0) {
            this.listDom.innerHTML = isOnlyNear
                ? "<p>この近くに登録されているスポットがありません</p>"
                : "<p>該当のデータがありません</p>";
        }
    }

    getSpots(isOnlyNear, currentPosition) {
        // let spots = this.spots;
        let spots = this.spots.map(s => ({ ...s }));     // ディープコピー

        // 「近くのスポット」が選択されていた場合、スポットデータに距離を追加
        if (isOnlyNear) {
            // スポットデータに距離を計算して保持
            spots = spots.map(s => {
                let distance = null;
                if (currentPosition) {
                    distance = MathModule.distance(
                        currentPosition.lat,
                        currentPosition.lng,
                        s.lat,
                        s.lng
                    );
                }
                return { ...s, distance };
            });

            // 距離が近い順にソート
            spots.sort((a, b) => {
                if (a.distance == null) return 1;
                if (b.distance == null) return -1;
                return a.distance - b.distance;
            });
        }

        return spots;
    }

    async createListContent(s) {
        const distText = s.distance ? `距離：約${s.distance.toFixed(1)}km` : "";

        const stats = await getSpotRatingStats(s.id);
        const recentRating = stats.recentRating;
        const avgText = `危険度：${recentRating !== 0 ? recentRating : "未評価"}`;

        const photo = await getMainPhoto(s.id);
        const path = photo
            ? `${BASE_PATH}/uploads/${photo.spotId}/${photo.filename}`
            : `${BASE_PATH}/resources/img/noimage.png`;

        // ===== 画像 =====
        const img = document.createElement("img");
        img.src = path;

        img.onerror = function () {
            this.onerror = null; // 無限ループ防止
            this.src = `${BASE_PATH}/resources/img/noimage.png`;
        };

        const imageDiv = document.createElement("div");
        imageDiv.className = "list-content-image";
        imageDiv.appendChild(img);

        // ===== 情報部分 =====
        const infoDiv = document.createElement("div");
        infoDiv.className = "list-content-info";

        const nameP = document.createElement("p");
        nameP.className = "list-content-info--name";
        nameP.textContent = s.name ?? "";

        const avgP = document.createElement("p");
        avgP.className = "list-content-info--data";
        avgP.textContent = avgText;

        const addressP = document.createElement("p");
        addressP.className = "list-content-info--data";
        addressP.textContent = s.address ?? "";

        const distP = document.createElement("p");
        distP.className = "list-content-info--data";
        distP.textContent = distText;

        infoDiv.appendChild(nameP);
        infoDiv.appendChild(avgP);
        infoDiv.appendChild(addressP);
        infoDiv.appendChild(distP);

        // ===== ボタン =====
        const toMapButton = document.createElement("button");
        toMapButton.className = "list-content-info--detail-button";
        toMapButton.textContent = "地図へ移動";
        toMapButton.addEventListener("click", (e) => {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent("change-view-to-map", {
                detail: { id: s.id }
            }));
        });

        const openDetailButton = document.createElement("button");
        openDetailButton.className = "list-content-info--detail-button";
        openDetailButton.textContent = "詳細を見る";
        openDetailButton.addEventListener("click", (e) => {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent("open-detail", {
                detail: { id: s.id }
            }));
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "list-content-button-container";
        buttonContainer.appendChild(toMapButton);
        buttonContainer.appendChild(openDetailButton);

        infoDiv.appendChild(buttonContainer);

        // ===== 全体 =====
        const contentDiv = document.createElement("div");
        contentDiv.className = "list-content";
        contentDiv.appendChild(imageDiv);
        contentDiv.appendChild(infoDiv);

        const div = document.createElement("div");
        div.className = "spotItem";
        div.appendChild(contentDiv);

        div.addEventListener("click", () => {
            document.dispatchEvent(new CustomEvent("open-detail", {
                detail: { id: s.id }
            }));
        });

        this.listDom.appendChild(div);
    }

};