document.addEventListener("DOMContentLoaded", function () {

    fetch("/api/noise-data")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch noise data");
            }
            return response.json();
        })
        .then(data => {

            console.log("Noise data received:", data);

            // -----------------------------
            // MAP
            // -----------------------------

            const map = L.map("map").setView([11.3410, 77.7172], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map);

            data.forEach(item => {

                let markerColor = "green";

                if (item.status === "High") {
                    markerColor = "red";
                } else if (item.status === "Moderate") {
                    markerColor = "orange";
                }

                const marker = L.circleMarker(
                    [item.latitude, item.longitude],
                    {
                        radius: 8,
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.8
                    }
                ).addTo(map);

                marker.bindPopup(`
                    <b>Location:</b> ${item.location}<br>
                    <b>Noise Level:</b> ${item.noise_level} dB<br>
                    <b>Status:</b> ${item.status}<br>
                    <b>Compliance:</b> ${item.compliance}
                `);
            });

            // -----------------------------
            // STATISTICS
            // -----------------------------

            const totalLocations = data.length;

            const highNoise = data.filter(
                item => item.status === "High"
            ).length;

            const moderateNoise = data.filter(
                item => item.status === "Moderate"
            ).length;

            const normalNoise = data.filter(
                item => item.status === "Normal"
            ).length;

            const averageNoise =
                data.reduce(
                    (sum, item) => sum + item.noise_level,
                    0
                ) / (data.length || 1);

            // -----------------------------
            // UPDATE DASHBOARD CARDS
            // -----------------------------

            const totalElement =
                document.getElementById("totalLocations");

            const highElement =
                document.getElementById("highNoise");

            const averageElement =
                document.getElementById("averageNoise");

            if (totalElement) {
                totalElement.textContent = totalLocations;
            }

            if (highElement) {
                highElement.textContent = highNoise;
            }

            if (averageElement) {
                averageElement.textContent =
                    averageNoise.toFixed(2) + " dB";
            }

            // -----------------------------
            // CHART
            // -----------------------------

            const chartCanvas =
                document.getElementById("noiseChart");

            if (chartCanvas) {

                new Chart(chartCanvas, {
                    type: "pie",

                    data: {
                        labels: [
                            "Normal",
                            "Moderate",
                            "High"
                        ],

                        datasets: [{
                            data: [
                                normalNoise,
                                moderateNoise,
                                highNoise
                            ]
                        }]
                    },

                    options: {
                        responsive: true
                    }
                });
            }

        })

        .catch(error => {
            console.error("Error loading noise data:", error);
        });

});
