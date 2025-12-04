// TODO look at dgram
const dgram = require("dgram");

let socket = null;
let mainWindowRef = null;
const PORT = 6666;

function startUdp(mainWindow) {
    mainWindowRef = mainWindow;

    socket = dgram.createSocket("udp4");

    socket.on("message", (msg) => {
        const text = msg.toString();
        try {
            const parsed = JSON.parse(text);
            mainWindowRef.webContents.send("sensor-data", {
                source: "udp",
                ...parsed
            });
        } catch {
            mainWindowRef.webContents.send("sensor-data", {
                source: "udp",
                raw: text
            });
        }
    });

    socket.bind(PORT, "0.0.0.0");
}

function stopUdp() {
    if (socket) socket.close();
    socket = null;
}

module.exports = { startUdp, stopUdp };
