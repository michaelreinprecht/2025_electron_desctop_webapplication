const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let port, parser, mainWindowRef;

function connectSerial(mainWindow, portPath) {
    mainWindowRef = mainWindow;

    if (!portPath) {
        console.error("No COM port specified!");
        return;
    }

    port = new SerialPort({ path: portPath, baudRate: 115200 });
    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (data) => {
        try {
            const parsed = JSON.parse(data);
            mainWindowRef.webContents.send("sensor-data", {
                source: "serial",
                sentBy: portPath,
                ...parsed
            });
        } catch (err) {
            mainWindowRef.webContents.send("sensor-data", {
                source: "serial",
                sentBy: portPath,
                raw: data
            });
        }
    });
}


function disconnectSerial() {
    if (port && port.isOpen) port.close();
}

async function listSerialPorts() {
    try {
        const ports = await SerialPort.list();
        return ports.map(p => p.path);
    } catch (err) {
        console.error("Error listing ports:", err);
        return [];
    }
}

module.exports = { connectSerial, disconnectSerial, listSerialPorts };
