class ListModule {
    constructor() {
        this.listDom =  document.getElementById("list");
    }

    // -----------------------------
    // パブリックメソッド
    // -----------------------------
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
        for(const s of spots) {
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
        let spots = loadSpots();

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

    createListContent(s) {
        const distText = s.distance ? `距離：約${s.distance.toFixed(1)}km` : "";
        const avgText = `危険度：${s.recentRating !== 0 ? s.recentRating : "未評価"}`;

        const photos = getPhotosBySpotId(s.id);
        const photoData = photos.length > 0 ? photos[0].photoData : null;
        const imgHtml = `<img src=${photoData ?? "resources/img/noimage.png"}>`;

        const toMapButton = document.createElement("button");
        toMapButton.className = "list-content-info--detail-button";
        toMapButton.innerHTML = "地図へ移動";
        toMapButton.addEventListener('click', (e)=>{
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent('change-view-to-map', {
                detail: { id: s.id }
            }))
        });

        const openDetailButton = document.createElement("button");
        openDetailButton.className = "list-content-info--detail-button";
        openDetailButton.innerHTML = "詳細を見る";
        openDetailButton.addEventListener('click', (e)=>{
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent('open-detail', {
                detail: { id: s.id }
            }))
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "list-content-button-container";
        buttonContainer.appendChild(toMapButton);
        buttonContainer.appendChild(openDetailButton);

        const div = document.createElement("div");
        div.className = "spotItem";
        div.innerHTML = `
            <div class="list-content">
                <div class="list-content-image">${imgHtml}</div>
                <div class="list-content-info">
                    <p class="list-content-info--name">${s.name}</p>
                    <p class="list-content-info--data">${avgText}</p>
                    <p class="list-content-info--data">${s.address?? ""}</p>
                    <p class="list-content-info--data">${distText}</p>
                </div>
            </div>
        `;

        div.querySelector(".list-content-info").appendChild(buttonContainer);
        this.listDom.appendChild(div);

        div.addEventListener('click', (e)=>{
            document.dispatchEvent(new CustomEvent('open-detail', {
                detail: { id: s.id }
            }))
        });
    }
};