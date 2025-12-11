const charts = {};

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

        <button id="${key}-apply-btn">Apply</button>
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
                borderWidth: 2
            }]
        },
        options: { animation: false }
    });

    charts[key] = chart;

    // Bind button for applying chart-settings.
    document.getElementById(`${key}-apply-btn`).onclick = () => {
        const newLabel = document.getElementById(`${key}-label-input`).value || label;
        const newAxis = document.getElementById(`${key}-axis-input`).value || yLabel;
        updateChartAppearance(key, newLabel, newAxis);
    };
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

export { createChart, updateChartAppearance, charts };
