const charts = {};
const chartSettings = {};
const datapoints = {}; // Holds ALL recorded datapoints

// Default values
const DEFAULT_MAX_POINTS = 50;
const DEFAULT_COLOR = "#007bff";


function hexToRGBA(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

async function createChart(key, label = key, yLabel = key) {
    const container = document.getElementById("chartsContainer");

    const saved = await window.storeAPI.get(`charts.${key}`, {});

    const settings = {
        label: saved.label ?? label,
        yLabel: saved.yLabel ?? yLabel,
        maxPoints: saved.maxPoints ?? DEFAULT_MAX_POINTS,
        color: saved.color ?? DEFAULT_COLOR,
        yMin: saved.yMin ?? null,
        yMax: saved.yMax ?? null
    };

    const wrapper = document.createElement("div");
    wrapper.className = "chart-block";
    wrapper.style.display = "flex";         // <-- make chart and settings side by side
    wrapper.style.alignItems = "flex-start";
    wrapper.style.marginBottom = "40px";
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.padding = "15px";
    wrapper.style.borderRadius = "8px";
    wrapper.style.gap = "20px";             // space between chart and settings

    // Chart container (title + canvas)
    const chartContainer = document.createElement("div");
    chartContainer.style.display = "flex";
    chartContainer.style.flexDirection = "column";
    chartContainer.style.alignItems = "center";

    const title = document.createElement("h3");
    title.id = `${key}-title`;
    title.textContent = settings.label;
    chartContainer.appendChild(title);

    const canvas = document.createElement("canvas");
    canvas.id = `${key}-canvas`;
    canvas.style.minWidth = "400px"; // optional, to keep chart a good size
    canvas.style.height = "250px";
    chartContainer.appendChild(canvas);
    wrapper.appendChild(chartContainer);

    // Settings panel
    const settingsPanel = document.createElement("div");
    settingsPanel.style.display = "flex";
    settingsPanel.style.flexDirection = "column";
    settingsPanel.style.gap = "8px";

    settingsPanel.innerHTML = `
        <label>Label:</label>
        <input type="text" id="${key}-label-input" placeholder="${settings.label}" style="width:120px;" />

        <label>Y-Axis:</label>
        <input type="text" id="${key}-axis-input" placeholder="${settings.yLabel}" style="width:60px;" />

        <label>Max Points:</label>
        <input type="number" id="${key}-maxpoints-input" min="1" value="${settings.maxPoints}" style="width:60px;" />

        <label>Line Color:</label>
        <input type="color" id="${key}-color-input" value="${settings.color}" style="width:60px;" />

        <label>Y Min:</label>
        <input type="number" step="any" id="${key}-ymin-input" placeholder="auto" style="width:60px;" value="${settings.yMin ?? ""}" />

        <label>Y Max:</label>
        <input type="number" step="any" id="${key}-ymax-input" placeholder="auto" style="width:60px;" value="${settings.yMax ?? ""}" />
    `;
    wrapper.appendChild(settingsPanel);
    container.appendChild(wrapper);

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                title: settings.label,
                label: settings.yLabel,
                data: [],
                borderWidth: 2,
                borderColor: settings.color,
                backgroundColor: hexToRGBA(settings.color, 0.2),
                pointBackgroundColor: settings.color,
                pointBorderColor: settings.color
            }]
        },
        options: {
            animation: false,
            scales: {
                y: {
                    min: settings.yMin,
                    max: settings.yMax
                }
            }
        }
    });

    charts[key] = chart;
    chartSettings[key] = { maxPoints: settings.maxPoints };
    datapoints[key] = []; // initialize full history

    // Live settings update
    const updateSettings = () => {
        // Get input values
        const newLabel = document.getElementById(`${key}-label-input`).value || label;
        const newAxis = document.getElementById(`${key}-axis-input`).value || yLabel;
        const newMaxPoints = parseInt(document.getElementById(`${key}-maxpoints-input`).value) || DEFAULT_MAX_POINTS;
        const newColor = document.getElementById(`${key}-color-input`).value || DEFAULT_COLOR;
        const yminRaw = document.getElementById(`${key}-ymin-input`).value;
        const ymaxRaw = document.getElementById(`${key}-ymax-input`).value;
        const newYMin = yminRaw === "" ? null : parseFloat(yminRaw);
        const newYMax = ymaxRaw === "" ? null : parseFloat(ymaxRaw);

        //Set label
        title.textContent = newLabel;
        chart.data.datasets[0].label = newAxis;

        //Set maxpoints
        chartSettings[key].maxPoints = newMaxPoints;
        const len = chart.data.labels.length;
        if (len > newMaxPoints) { // Slice currently displayed data array based on maxpoints
            chart.data.labels = chart.data.labels.slice(len - newMaxPoints);
            chart.data.datasets[0].data = chart.data.datasets[0].data.slice(len - newMaxPoints);
        }

        // Set chart color
        chart.data.datasets[0].borderColor = newColor;
        chart.data.datasets[0].backgroundColor = hexToRGBA(newColor, 0.2);
        chart.data.datasets[0].pointBackgroundColor = newColor;
        chart.data.datasets[0].pointBorderColor = newColor;

        // Set min/max scaling
        chart.options.scales.y.min = newYMin;
        chart.options.scales.y.max = newYMax;

        chart.update();

        window.storeAPI.set(`charts.${key}`, {
            label: newLabel,
            yLabel: newAxis,
            maxPoints: newMaxPoints,
            color: newColor,
            newYMin,
            newYMax
        });
    };

    ["label-input", "axis-input", "maxpoints-input", "color-input", "ymin-input", "ymax-input"].forEach(idSuffix => {
        document.getElementById(`${key}-${idSuffix}`).addEventListener("change", updateSettings);
    });
}

function addPoint(key, value) {
    const chart = charts[key];
    const timestamp = new Date().toLocaleTimeString();

    // Push to chart
    chart.data.labels.push(timestamp);
    chart.data.datasets[0].data.push(value);
    // Push to ALL datapoints
    datapoints[key].push({ time: timestamp, value });

    // Trim to maxPoints for chart display
    const maxPts = chartSettings[key]?.maxPoints || DEFAULT_MAX_POINTS;
    if (chart.data.labels.length > maxPts) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

async function createChartsFromImportedDatapoints(importedDatapoints) {
    //Clear existing data
    for (const key in datapoints) {
        datapoints[key].length = 0;

        if (charts[key]) {
            charts[key].data.labels.length = 0;
            charts[key].data.datasets[0].data.length = 0;
            charts[key].update();
        }
    }

    //Create missing charts
    for (const key in importedDatapoints) {
        if (!charts[key]) {
            await createChart(key, key, key);
        }
    }

    //Restore datapoints
    for (const key in importedDatapoints) {
        const chart = charts[key];
        const points = importedDatapoints[key];

        for (const point of points) {
            chart.data.labels.push(point.time);
            chart.data.datasets[0].data.push(point.value);
            datapoints[key].push(point);
        }

        chart.update();
    }
}

function getDatapointsForChart(key) {
    return datapoints[key] || [];
}

function getAllDatapoints() {
    return datapoints;
}

function buildChartKey(type, sentBy = null) {
    return sentBy ? `${type}@${sentBy}` : type;
}

async function restoreChartsFromSettings() {
    const saved = await window.storeAPI.get("charts", {});
    for (const key of Object.keys(saved)) {
        await createChart(key, saved[key].label ?? key, saved[key].yLabel ?? key);
    }
}

export { createChart, restoreChartsFromSettings, buildChartKey, addPoint, charts, datapoints, createChartsFromImportedDatapoints, getDatapointsForChart, getAllDatapoints };