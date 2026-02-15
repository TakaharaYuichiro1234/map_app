// *****************************
// 緯度経度から住所への変換
// *****************************

(async function () {
    window.MuniModule = {
        init,
        reverseGeocode
    };

    document.addEventListener("DOMContentLoaded", init);

    let muniDict = {};

    async function init() {
        muniDict = await loadMunicipalityCSV();
    }

    async function loadMunicipalityCSV() {
        // 総務省 全国地方公共団体コード
        // https://www.soumu.go.jp/denshijiti/code.html
        const res = await fetch("resources/data/municipality.csv");
        const text = await res.text();
        const lines = text.split("\n");
        const dict = {};

        lines.forEach((line, index) => {
            if (index === 0) return; // ヘッダ行スキップ
            if (!line.trim()) return;

            const data = line.split(",");
            if (data.length >= 3) {
                const code = data[0].substring(0, 5);
                dict[code] = [data[1], data[2]];
            }
        });
        return dict;
    }

    async function reverseGeocode(lat, lng) {
        const url = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.results) {
                return null;
            }

            let lv01Nm = data.results.lv01Nm || "";
            if (lv01Nm === "−") lv01Nm = "";    // lv01が"−"で登録されている場合の処理
            const muniCd = data.results.muniCd || "";

            const muniData = muniDict[muniCd] || ["", ""]; 

            return {"code": muniCd, "pref": muniData[0], "city": muniData[1], "region": lv01Nm};

        } catch (err) {
            return null;
        }
    }
})();

