class DetailChartModule {
    constructor(chartDomId, spotId, userId = null) {
        this.chartDomId = chartDomId;
        this.spotId = spotId;
        this.userId = userId;
        this._ratings = [];
    }

    async init() {
        const dailyRating = this.userId
            ? await getDailyRatingEachUser(this.spotId, this.userId)
            : await getDailyRating(this.spotId);

        const days = dailyRating.days.map(day => day.substr(5));
        this._ratings = dailyRating.ratings.map(this.formatRating);
        this.drawChart(days, this._ratings);
    }

    get ratingCount() {
        return this._ratings.filter(r => r !== null).length;
    }

    formatRating(rating) {
        return typeof rating === "number"
            ? Math.round(rating * 10) / 10
            : null;
    }

    drawChart(days, ratings) {
        const ctx = document
            .getElementById(this.chartDomId)
            .getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: days,
                datasets: [{ data: ratings }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 5.2,
                        grace: "10%",
                        afterBuildTicks: axis => {
                            axis.ticks = [0, 1, 2, 3, 4, 5]
                                .map(v => ({ value: v }));
                        }
                    }
                }
            }
        });
    }
}
