const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let port, parser, mainWindowRef;

function connectSerial(mainWindow) {
    mainWindowRef = mainWindow;

    // TODO make serial port configureable
    port = new SerialPort({ path: "COM3", baudRate: 115200 });
    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (data) => {
        try {
            const parsed = JSON.parse(data);
            mainWindowRef.webContents.send("sensor-data", {
                source: "serial",
                ...parsed
            });
        } catch {
            mainWindowRef.webContents.send("sensor-data", {
                source: "serial",
                raw: data
            });
        }
    });
}

function disconnectSerial() {
    if (port && port.isOpen) port.close();
}

module.exports = { connectSerial, disconnectSerial };
