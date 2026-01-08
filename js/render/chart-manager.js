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

function createChart(key, label = key, yLabel = key) {
    const container = document.getElementById("chartsContainer");

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
    title.textContent = label;
    chartContainer.appendChild(title);

    const canvas = document.createElement("canvas");
    canvas.id = `${key}-canvas`;
    canvas.style.minWidth = "400px"; // optional, to keep chart a good size
    canvas.style.height = "250px";
    chartContainer.appendChild(canvas);
    wrapper.appendChild(chartContainer);

    // Settings panel
    const settings = document.createElement("div");
    settings.style.display = "flex";
    settings.style.flexDirection = "column";
    settings.style.gap = "8px";

    settings.innerHTML = `
        <label>Label:</label>
        <input type="text" id="${key}-label-input" placeholder="${label}" style="width:120px;" />

        <label>Y-Axis:</label>
        <input type="text" id="${key}-axis-input" placeholder="${yLabel}" style="width:60px;" />

        <label>Max Points:</label>
        <input type="number" id="${key}-maxpoints-input" min="1" value="${DEFAULT_MAX_POINTS}" style="width:60px;" />

        <label>Line Color:</label>
        <input type="color" id="${key}-color-input" value="${DEFAULT_COLOR}" style="width:60px;" />

        <label>Y Min:</label>
        <input type="number" step="any" id="${key}-ymin-input" placeholder="auto" style="width:60px;" />

        <label>Y Max:</label>
        <input type="number" step="any" id="${key}-ymax-input" placeholder="auto" style="width:60px;" />
    `;
    wrapper.appendChild(settings);
    container.appendChild(wrapper);

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: yLabel,
                data: [],
                borderWidth: 2,
            }]
        },
        options: {
            animation: false,
        }
    });

    charts[key] = chart;
    chartSettings[key] = { maxPoints: DEFAULT_MAX_POINTS };
    datapoints[key] = []; // initialize full history

    // Live settings update
    const updateSettings = () => {
        // Get input values
        const newLabel = document.getElementById(`${key}-label-input`).value || label;
        const newAxis = document.getElementById(`${key}-axis-input`).value || yLabel;
        const newMaxPoints = parseInt(document.getElementById(`${key}-maxpoints-input`).value) || DEFAULT_MAX_POINTS;
        const newColor = document.getElementById(`${key}-color-input`).value || DEFAULT_COLOR;
        const yminVal = document.getElementById(`${key}-ymin-input`).value;
        const ymaxVal = document.getElementById(`${key}-ymax-input`).value;

        //Set label
        document.getElementById(`${key}-title`).textContent = newLabel;
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
        chart.options.scales.y.min = yminVal === "" ? null : parseFloat(yminVal);
        chart.options.scales.y.max = ymaxVal === "" ? null : parseFloat(ymaxVal);

        chart.update();
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

function createChartsFromImportedDatapoints(importedDatapoints) {
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
            createChart(key, key, key);
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


export { createChart, addPoint, charts, datapoints, createChartsFromImportedDatapoints, getDatapointsForChart, getAllDatapoints };