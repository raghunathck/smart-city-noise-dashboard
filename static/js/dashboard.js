// =====================================================
// GLOBAL VARIABLES
// =====================================================

let map;
let markersLayer;

let noiseChart;
let locationNoiseChart;
let complianceChart;
let thresholdComparisonChart;

const noiseThreshold = 85;

let allData = [];


// =====================================================
// INITIALIZE MAP
// =====================================================

function initializeMap() {

    map = L.map("map").setView(
        [11.3410, 77.7172],
        12
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    markersLayer = L.layerGroup().addTo(map);


    // MAP LEGEND
    const legend = L.control({
        position: "bottomright"
    });


    legend.onAdd = function () {

        const div = L.DomUtil.create(
            "div",
            "info legend"
        );


        div.style.background = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "8px";
        div.style.boxShadow =
            "0 2px 6px rgba(0,0,0,0.3)";


        div.innerHTML = `
            <strong>Noise Level</strong><br>

            <span style="color:green;">
                ●
            </span>
            Normal ≤ 75 dB
            <br>

            <span style="color:#d39e00;">
                ●
            </span>
            Moderate 76–85 dB
            <br>

            <span style="color:red;">
                ●
            </span>
            High > 85 dB
        `;


        return div;
    };


    legend.addTo(map);

}


// =====================================================
// NOISE CLASSIFICATION
// =====================================================

function getNoiseClassification(noise) {

    noise = Number(noise);


    if (noise <= 75) {

        return "Normal";

    }


    if (noise <= 85) {

        return "Moderate";

    }


    return "High";

}


// =====================================================
// MARKER COLOR
// =====================================================

function getMarkerColor(noise) {

    noise = Number(noise);


    if (noise <= 75) {

        return "green";

    }


    if (noise <= 85) {

        return "#d39e00";

    }


    return "red";

}


// =====================================================
// UPDATE MAIN DASHBOARD
// =====================================================

function updateDashboard(data) {

    if (!data || data.length === 0) {

        return;

    }


    const totalLocations =
        data.length;


    const totalNoise =
        data.reduce(
            (sum, item) =>
                sum + Number(item.noise_level),
            0
        );


    const averageNoise =
        totalNoise / totalLocations;


    // COMPLIANCE
    const compliantLocations =
        data.filter(
            item =>
                String(item.compliance)
                    .toLowerCase()
                    === "compliant"
        ).length;


    const violations =
        data.filter(
            item =>
                String(item.compliance)
                    .toLowerCase()
                    === "violation"
        ).length;


    const complianceRate =
        totalLocations > 0
            ? (compliantLocations /
                totalLocations) * 100
            : 0;


    // SUMMARY CARDS
    document.getElementById(
        "totalLocations"
    ).textContent =
        totalLocations;


    document.getElementById(
        "averageNoise"
    ).textContent =
        averageNoise.toFixed(1);


    document.getElementById(
        "violations"
    ).textContent =
        violations;


    document.getElementById(
        "complianceRate"
    ).textContent =
        complianceRate.toFixed(1);


    document.getElementById(
        "complianceDetails"
    ).textContent =
        `${compliantLocations} of ${totalLocations} locations compliant`;


    // NOISE CLASSIFICATION COUNTS
    const normalCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Normal"
        ).length;


    const moderateCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Moderate"
        ).length;


    const highCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "High"
        ).length;


    document.getElementById(
        "normalCount"
    ).textContent =
        normalCount;


    document.getElementById(
        "moderateCount"
    ).textContent =
        moderateCount;


    document.getElementById(
        "highCount"
    ).textContent =
        highCount;


    // STEP 8
    updateComplianceMonitoring(
        data,
        totalLocations,
        compliantLocations,
        violations,
        complianceRate
    );


    // STEP 9
    updateSpatialSummary(data);


    // HIGHEST NOISE
    updateHighestNoise(data);


    // THRESHOLD CHART
    updateThresholdComparisonChart(data);


    // MAP
    updateMap(data);


    // ALERTS
    updateAlerts(data);


    // TABLE
    updateTable(data);


    // CHARTS
    updateCharts(data);


    // STEP 10
    updateLastUpdated();

}


// =====================================================
// STEP 8 - COMPLIANCE MONITORING
// =====================================================

function updateComplianceMonitoring(
    data,
    totalLocations,
    compliantLocations,
    violations,
    complianceRate
) {

    document.getElementById(
        "complianceTotalLocations"
    ).textContent =
        totalLocations;


    document.getElementById(
        "compliantLocations"
    ).textContent =
        compliantLocations;


    document.getElementById(
        "complianceViolations"
    ).textContent =
        violations;


    document.getElementById(
        "compliancePercentage"
    ).textContent =
        complianceRate.toFixed(1);


    const summary =
        document.getElementById(
            "complianceSummary"
        );


    if (violations === 0) {

        summary.className =
            "alert alert-success mt-3 mb-0";


        summary.textContent =
            "All monitored locations are currently compliant.";

    }

    else {

        summary.className =
            "alert alert-warning mt-3 mb-0";


        summary.textContent =
            `${violations} location(s) require attention due to compliance violations.`;

    }


    // COMPLIANCE TABLE

    const tableBody =
        document.getElementById(
            "complianceTableBody"
        );


    tableBody.innerHTML = "";


    data.forEach(item => {

        const noise =
            Number(item.noise_level);


        const classification =
            getNoiseClassification(
                noise
            );


        const compliance =
            item.compliance ||
            "Unknown";


        let action;


        if (
            String(compliance)
                .toLowerCase()
                === "violation"
        ) {

            action =
                "Requires Attention";

        }

        else {

            action =
                "Compliant";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.location}
            </td>

            <td>
                ${noise.toFixed(1)} dB
            </td>

            <td>
                ${classification}
            </td>

            <td class="${
                String(compliance)
                    .toLowerCase()
                    === "violation"
                    ? "text-danger compliance-bad"
                    : "text-success compliance-good"
            }">

                ${compliance}

            </td>

            <td class="${
                action === "Requires Attention"
                    ? "text-danger attention-text"
                    : "text-success"
            }">

                ${action}

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// =====================================================
// STEP 9 - SPATIAL SUMMARY
// =====================================================

function updateSpatialSummary(data) {

    const normalCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Normal"
        ).length;


    const moderateCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Moderate"
        ).length;


    const highCount =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "High"
        ).length;


    document.getElementById(
        "mapNormalCount"
    ).textContent =
        normalCount;


    document.getElementById(
        "mapModerateCount"
    ).textContent =
        moderateCount;


    document.getElementById(
        "mapHighCount"
    ).textContent =
        highCount;

}


// =====================================================
// HIGHEST NOISE LOCATION
// =====================================================

function updateHighestNoise(data) {

    if (!data || data.length === 0) {

        return;

    }


    const highest =
        data.reduce(
            (max, item) =>
                Number(item.noise_level) >
                Number(max.noise_level)
                    ? item
                    : max
        );


    const classification =
        getNoiseClassification(
            highest.noise_level
        );


    document.getElementById(
        "highestNoiseLocation"
    ).textContent =
        highest.location;


    document.getElementById(
        "highestNoiseValue"
    ).textContent =
        Number(
            highest.noise_level
        ).toFixed(1);


    document.getElementById(
        "highestNoiseStatus"
    ).textContent =
        `${classification} – ${highest.compliance}`;

}


// =====================================================
// THRESHOLD COMPARISON CHART
// =====================================================

function updateThresholdComparisonChart(data) {

    const labels =
        data.map(
            item =>
                item.location
        );


    const noiseValues =
        data.map(
            item =>
                Number(item.noise_level)
        );


    const thresholdValues =
        data.map(
            () =>
                noiseThreshold
        );


    if (thresholdComparisonChart) {

        thresholdComparisonChart.destroy();

    }


    thresholdComparisonChart =
        new Chart(
            document.getElementById(
                "thresholdComparisonChart"
            ),
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            label:
                                "Actual Noise Level (dB)",

                            data:
                                noiseValues
                        },

                        {
                            type: "line",

                            label:
                                "Alert Threshold (85 dB)",

                            data:
                                thresholdValues,

                            borderWidth: 3,

                            pointRadius: 0
                        }

                    ]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true,

                            title: {

                                display: true,

                                text:
                                    "Noise Level (dB)"

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// UPDATE MAP
// =====================================================

function updateMap(data) {

    if (!markersLayer) {

        return;

    }


    markersLayer.clearLayers();


    const bounds = [];


    data.forEach(item => {

        const latitude =
            Number(item.latitude);


        const longitude =
            Number(item.longitude);


        const noise =
            Number(item.noise_level);


        const classification =
            getNoiseClassification(
                noise
            );


        const markerColor =
            getMarkerColor(
                noise
            );


        bounds.push([
            latitude,
            longitude
        ]);


        const marker =
            L.circleMarker(
                [
                    latitude,
                    longitude
                ],
                {

                    radius: 9,

                    color:
                        markerColor,

                    fillColor:
                        markerColor,

                    fillOpacity:
                        0.8,

                    weight: 2

                }
            );


        marker.bindPopup(`

            <div style="min-width:220px;">

                <h6>
                    <strong>
                        ${item.location}
                    </strong>
                </h6>

                <hr>

                <strong>
                    Noise Level:
                </strong>

                ${noise.toFixed(1)} dB

                <br>

                <strong>
                    Classification:
                </strong>

                ${classification}

                <br>

                <strong>
                    Compliance:
                </strong>

                ${item.compliance}

                <br>

                <strong>
                    Status:
                </strong>

                ${item.status}

                <br>

                <strong>
                    Latitude:
                </strong>

                ${latitude}

                <br>

                <strong>
                    Longitude:
                </strong>

                ${longitude}

                <hr>

                ${
                    noise > noiseThreshold

                    ? `

                        <span style="color:red;">

                            <strong>
                                ⚠ HIGH NOISE ALERT
                            </strong>

                        </span>

                    `

                    : `

                        <span style="color:green;">

                            <strong>
                                ✓ Within Alert Threshold
                            </strong>

                        </span>

                    `
                }

            </div>

        `);


        marker.addTo(
            markersLayer
        );

    });


    if (bounds.length > 0) {

        map.fitBounds(
            bounds,
            {
                padding: [
                    30,
                    30
                ]
            }
        );

    }

}


// =====================================================
// SHOW ALL LOCATIONS
// =====================================================

function showAllLocations() {

    if (
        !allData ||
        allData.length === 0
    ) {

        return;

    }


    updateMap(
        allData
    );


    updateTable(
        allData
    );


    document.getElementById(
        "locationSearch"
    ).value = "";


    document.getElementById(
        "statusFilter"
    ).value = "All";

}


// =====================================================
// ALERTS
// =====================================================

function updateAlerts(data) {

    const alertData =
        data.filter(
            item =>
                Number(item.noise_level)
                > noiseThreshold
        );


    const alertSummary =
        document.getElementById(
            "alertSummary"
        );


    const tableBody =
        document.getElementById(
            "alertTableBody"
        );


    tableBody.innerHTML = "";


    if (alertData.length === 0) {

        alertSummary.textContent =
            "No high-noise alerts detected.";

    }

    else {

        alertSummary.textContent =
            `${alertData.length} high-noise location(s) detected.`;

    }


    alertData.forEach(item => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.location}
            </td>

            <td>
                ${Number(
                    item.noise_level
                ).toFixed(1)} dB
            </td>

            <td>
                ${getNoiseClassification(
                    item.noise_level
                )}
            </td>

            <td class="text-danger">

                High Noise Alert

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// =====================================================
// MONITORING TABLE
// =====================================================

function updateTable(data) {

    const tableBody =
        document.getElementById(
            "monitoringTableBody"
        );


    tableBody.innerHTML = "";


    data.forEach(item => {

        const noise =
            Number(item.noise_level);


        const classification =
            getNoiseClassification(
                noise
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.location}
            </td>

            <td>
                ${noise.toFixed(1)} dB
            </td>

            <td>
                ${classification}
            </td>

            <td>
                ${item.compliance}
            </td>

            <td>
                ${item.latitude}
            </td>

            <td>
                ${item.longitude}
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// =====================================================
// CHARTS
// =====================================================

function updateCharts(data) {

    // ---------------------------------------------
    // NOISE DISTRIBUTION
    // ---------------------------------------------

    const normal =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Normal"
        ).length;


    const moderate =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "Moderate"
        ).length;


    const high =
        data.filter(
            item =>
                getNoiseClassification(
                    item.noise_level
                ) === "High"
        ).length;


    if (noiseChart) {

        noiseChart.destroy();

    }


    noiseChart =
        new Chart(
            document.getElementById(
                "noiseChart"
            ),
            {

                type: "pie",

                data: {

                    labels: [
                        "Normal",
                        "Moderate",
                        "High"
                    ],

                    datasets: [

                        {
                            data: [
                                normal,
                                moderate,
                                high
                            ]
                        }

                    ]

                },

                options: {

                    responsive: true

                }

            }
        );


    // ---------------------------------------------
    // LOCATION-WISE NOISE
    // ---------------------------------------------

    const locations =
        data.map(
            item =>
                item.location
        );


    const noiseValues =
        data.map(
            item =>
                Number(item.noise_level)
        );


    if (locationNoiseChart) {

        locationNoiseChart.destroy();

    }


    locationNoiseChart =
        new Chart(
            document.getElementById(
                "locationNoiseChart"
            ),
            {

                type: "bar",

                data: {

                    labels:
                        locations,

                    datasets: [

                        {
                            label:
                                "Noise Level (dB)",

                            data:
                                noiseValues
                        }

                    ]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true,

                            title: {

                                display: true,

                                text:
                                    "Noise Level (dB)"

                            }

                        }

                    }

                }

            }
        );


    // ---------------------------------------------
    // COMPLIANCE CHART
    // ---------------------------------------------

    const compliant =
        data.filter(
            item =>
                String(item.compliance)
                    .toLowerCase()
                    === "compliant"
        ).length;


    const violation =
        data.filter(
            item =>
                String(item.compliance)
                    .toLowerCase()
                    === "violation"
        ).length;


    if (complianceChart) {

        complianceChart.destroy();

    }


    complianceChart =
        new Chart(
            document.getElementById(
                "complianceChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Compliant",
                        "Violation"
                    ],

                    datasets: [

                        {
                            data: [
                                compliant,
                                violation
                            ]
                        }

                    ]

                },

                options: {

                    responsive: true

                }

            }
        );

}


// =====================================================
// SEARCH AND FILTER
// =====================================================

function applyFilters() {

    const searchText =
        document.getElementById(
            "locationSearch"
        ).value
        .toLowerCase();


    const selectedFilter =
        document.getElementById(
            "statusFilter"
        ).value;


    const filteredData =
        allData.filter(item => {


            const location =
                String(item.location)
                    .toLowerCase();


            const classification =
                getNoiseClassification(
                    item.noise_level
                );


            const matchesSearch =
                location.includes(
                    searchText
                );


            let matchesFilter =
                true;


            if (
                selectedFilter !== "All"
            ) {

                if (
                    selectedFilter ===
                    "Violation"
                ) {

                    matchesFilter =
                        String(
                            item.compliance
                        )
                        .toLowerCase()
                        === "violation";

                }

                else {

                    matchesFilter =
                        classification ===
                        selectedFilter;

                }

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    updateTable(
        filteredData
    );


    updateMap(
        filteredData
    );

}


// =====================================================
// STEP 10 - LAST UPDATED TIME
// =====================================================

function updateLastUpdated() {

    const lastUpdated =
        document.getElementById(
            "lastUpdated"
        );


    if (!lastUpdated) {

        return;

    }


    const now =
        new Date();


    lastUpdated.textContent =
        now.toLocaleString();

}


// =====================================================
// STEP 10 - EXPORT DATA TO CSV
// =====================================================

function exportDataToCSV() {

    if (
        !allData ||
        allData.length === 0
    ) {

        alert(
            "No monitoring data available to export."
        );

        return;

    }


    const headers = [

        "Location",
        "Noise Level (dB)",
        "Classification",
        "Compliance",
        "Status",
        "Latitude",
        "Longitude"

    ];


    const rows =
        allData.map(item => [

            item.location,

            Number(
                item.noise_level
            ).toFixed(1),

            getNoiseClassification(
                item.noise_level
            ),

            item.compliance,

            item.status,

            item.latitude,

            item.longitude

        ]);


    let csvContent =
        headers.join(",") +
        "\n";


    rows.forEach(row => {

        const formattedRow =
            row.map(value => {

                const text =
                    String(
                        value ?? ""
                    );


                return `"${text.replace(
                    /"/g,
                    '""'
                )}"`;

            });


        csvContent +=
            formattedRow.join(",") +
            "\n";

    });


    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.setAttribute(
        "href",
        url
    );


    link.setAttribute(
        "download",
        "smart_city_noise_monitoring_data.csv"
    );


    link.style.visibility =
        "hidden";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =====================================================
// STEP 10 - PRINT DASHBOARD
// =====================================================

function printDashboard() {

    window.print();

}


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ---------------------------------------------
        // INITIALIZE MAP
        // ---------------------------------------------

        initializeMap();


        // ---------------------------------------------
        // LOAD API DATA
        // ---------------------------------------------

        fetch(
            "/api/noise-data"
        )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to fetch noise data"
                );

            }


            return response.json();

        })


        .then(data => {

            console.log(
                "Noise data loaded:",
                data
            );


            allData =
                data;


            updateDashboard(
                data
            );

        })


        .catch(error => {

            console.error(
                "Error loading data:",
                error
            );

        });


        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        document
            .getElementById(
                "locationSearch"
            )
            .addEventListener(
                "input",
                applyFilters
            );


        // ---------------------------------------------
        // FILTER
        // ---------------------------------------------

        document
            .getElementById(
                "statusFilter"
            )
            .addEventListener(
                "change",
                applyFilters
            );


        // ---------------------------------------------
        // SHOW ALL LOCATIONS
        // ---------------------------------------------

        document
            .getElementById(
                "showAllLocations"
            )
            .addEventListener(
                "click",
                showAllLocations
            );


        // ---------------------------------------------
        // EXPORT DATA
        // ---------------------------------------------

        document
            .getElementById(
                "exportDataButton"
            )
            .addEventListener(
                "click",
                exportDataToCSV
            );


        // ---------------------------------------------
        // PRINT DASHBOARD
        // ---------------------------------------------

        document
            .getElementById(
                "printDashboardButton"
            )
            .addEventListener(
                "click",
                printDashboard
            );

    }
);