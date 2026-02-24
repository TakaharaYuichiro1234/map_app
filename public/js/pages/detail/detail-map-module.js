import { STORAGE_MAP_CENTER_ZOOM, IS_DEBUG, OFFSET_LAT, OFFSET_LNG } from '../../config.js';

export class DetailMapModule {
    constructor() {
        this.map = null;
        this.latestCurrentPosition = null;
        this.userMarker = null;
    }

    init() {
        this.map = L.map("map", { gestureHandling: true });

        L.tileLayer(
            "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
            { attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>" }
        ).addTo(this.map);

        this.userMarker = L.circleMarker([0, 0], {
            radius: 10,
            weight: 6,
            color: "#007AFF",
            fillColor: "#EEE",
            fillOpacity: 0.8,
            className: "user-location"
        }).addTo(this.map);

        this.map.locate({ watch: true, setView: false, enableHighAccuracy: true });
        this.map.on("locationfound", e => this.onLocationFound(e));
    }

    setMarker(lat, lng) {
        if (!this.map) return;

        const savedZoom = Number(localStorage.getItem(STORAGE_MAP_CENTER_ZOOM).zoom) || 14;

        L.marker([lat, lng]).addTo(this.map);
        this.map.setView([lat, lng], savedZoom);
    }

    getLatestCurrentPosition() {
        return this.latestCurrentPosition;
    }

    onLocationFound(e) {
        const offsetLat = IS_DEBUG ? OFFSET_LAT : 0.0;
        const offsetLng = IS_DEBUG ? OFFSET_LNG : 0.0;

        const pos = {
            lat: e.latlng.lat + offsetLat,
            lng: e.latlng.lng + offsetLng
        };

        this.userMarker.setLatLng(pos);
        this.latestCurrentPosition = pos;

        // 呼び出し元へ通知
        document.dispatchEvent(
            new CustomEvent("detailmap:locationfound", {
                detail: {
                    position: pos,
                    rawEvent: e
                }
            })
        );
    }
}