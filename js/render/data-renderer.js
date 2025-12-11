import { createChart, addPoint, charts } from "./chart-manager.js";

// UI refs
const portSelect = document.getElementById("portSelect");
const logBox = document.getElementById("log");
const serialConnectBtn = document.getElementById("serialConnect");
const serialDisconnectBtn = document.getElementById("serialDisconnect");
const udpStartBtn = document.getElementById("udpStart");
const udpStopBtn = document.getElementById("udpStop");

// Bind buttons to APIs
serialConnectBtn.onclick = () => {
    const selectedPort = portSelect.value;
    if (selectedPort) {
        window.serialAPI.connect(selectedPort);
    }
};
serialDisconnectBtn.onclick = () => window.serialAPI.disconnect();

udpStartBtn.onclick = () => window.udpAPI.start();
udpStopBtn.onclick = () => window.udpAPI.stop();

// Display available ports
async function refreshPorts() {
    const ports = await window.serialAPI.listPorts();
    portSelect.innerHTML = "";
    ports.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        portSelect.appendChild(opt);
    });
}
// Start inverval for refreshing com ports (every 2 seconds ...)
setInterval(refreshPorts, 2000);
// Initial refresh
refreshPorts();


function log(msg) {
    logBox.textContent += msg + "\n";
    logBox.scrollTop = logBox.scrollHeight;
}

// --- Unified Data Listener ---
window.dataAPI.onData((data) => {
    log(`[${data.source}] ${JSON.stringify(data)}`);

    Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== "number") return;  // Filter out non-number values -> not supported

        // Create new chart if needed
        if (!charts[key]) {
            createChart(key, key, key);
        }

        // Add point to chart
        addPoint(key, value);
    });
});
