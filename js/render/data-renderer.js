// UI refs
const logBox = document.getElementById("log");
const serialConnectBtn = document.getElementById("serialConnect");
const serialDisconnectBtn = document.getElementById("serialDisconnect");
const udpStartBtn = document.getElementById("udpStart");
const udpStopBtn = document.getElementById("udpStop");

// Bind buttons to APIs
serialConnectBtn.onclick = () => window.serialAPI.connect();
serialDisconnectBtn.onclick = () => window.serialAPI.disconnect();

udpStartBtn.onclick = () => window.udpAPI.start();
udpStopBtn.onclick = () => window.udpAPI.stop();

// --- Setup Charts ---
const tempChart = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Temperature (°C)",
                data: [],
                borderWidth: 2
            }
        ]
    },
    options: {
        animation: false
    }
});

const humChart = new Chart(document.getElementById("humChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Humidity (%)",
                data: [],
                borderWidth: 2
            }
        ]
    },
    options: {
        animation: false
    }
});

const MAX_POINTS = 50;

// --- Helper functions ---
function addPoint(chart, value) {
    const t = new Date().toLocaleTimeString();

    chart.data.labels.push(t);
    chart.data.datasets[0].data.push(value);

    if (chart.data.labels.length > MAX_POINTS) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}

function log(msg) {
    logBox.textContent += msg + "\n";
    logBox.scrollTop = logBox.scrollHeight;
}

// --- Unified Data Listener ---
window.dataAPI.onData((data) => {
    console.log("DATA:", data);

    log(`[${data.source}] ${JSON.stringify(data)}`);

    // handle numeric values
    if (data.temp !== undefined) addPoint(tempChart, data.temp);
    if (data.humidity !== undefined) addPoint(humChart, data.humidity);
});
