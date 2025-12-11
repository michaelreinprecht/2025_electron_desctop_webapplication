const charts = {};
const chartSettings = {};

// Default values
const MAX_POINTS = 50;

function createChart(key, label = key, yLabel = key) {
    const container = document.getElementById("chartsContainer");

    const wrapper = document.createElement("div");
    wrapper.className = "chart-block";
    wrapper.style.marginBottom = "40px";
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.padding = "15px";
    wrapper.style.borderRadius = "8px";

    const title = document.createElement("h3");
    title.id = `${key}-title`;
    title.textContent = label;
    wrapper.appendChild(title);

    const canvas = document.createElement("canvas");
    canvas.id = `${key}-canvas`;
    wrapper.appendChild(canvas);

    // Settings panel -> todo: mabey move html to extra file ...
    const settings = document.createElement("div");
    settings.style.marginTop = "10px";


    settings.innerHTML = `
    <label>Display Name:</label>
    <input id="${key}-label-input" placeholder="${label}" />

    <label style="margin-left:10px;">Y-Axis Label:</label>
    <input id="${key}-axis-input" placeholder="${yLabel}" />

    <label style="margin-left:10px;">Max Points:</label>
    <input id="${key}-maxpoints-input" type="number" min="1" value="${MAX_POINTS}" style="width:60px;" />

    <button id="${key}-apply-btn">Apply</button>`;

    wrapper.appendChild(settings);
    container.appendChild(wrapper);

    const chart = new Chart(canvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: yLabel,
                data: [],
                borderWidth: 2
            }]
        },
        options: { animation: false }
    });

    charts[key] = chart;

    chartSettings[key] = {
        maxPoints: MAX_POINTS
    };

    // Bind button for applying chart-settings.
    document.getElementById(`${key}-apply-btn`).onclick = () => {
        const newLabel = document.getElementById(`${key}-label-input`).value || label;
        const newAxis = document.getElementById(`${key}-axis-input`).value || yLabel;
        const newMaxPoints = parseInt(document.getElementById(`${key}-maxpoints-input`).value) || MAX_POINTS;
        updateChartAppearance(key, newLabel, newAxis);
        // Update per-chart max points
        chartSettings[key].maxPoints = newMaxPoints;

        const chart = charts[key];
        const len = chart.data.labels.length;
        // If, after setting maxPoints, there is already more entries than maxPoints in the chart
        // slice the array to its length is maxPoints.
        if (len > newMaxPoints) {
            chart.data.labels = chart.data.labels.slice(len - newMaxPoints);
            chart.data.datasets[0].data = chart.data.datasets[0].data.slice(len - newMaxPoints);
        }
        chart.update();
    };
}

function addPoint(key, value) {
    const chart = charts[key];
    if (!chart) return;

    const t = new Date().toLocaleTimeString();

    chart.data.labels.push(t);
    chart.data.datasets[0].data.push(value);

    const maxPts = chartSettings[key]?.maxPoints || MAX_POINTS;

    if (chart.data.labels.length > maxPts) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}


function updateChartAppearance(key, label, axisLabel) {
    const chart = charts[key];
    if (!chart) return;

    // Title
    document.getElementById(`${key}-title`).textContent = label;

    // Dataset label
    chart.data.datasets[0].label = axisLabel;
    chart.update();
}

export { createChart, addPoint, charts };
