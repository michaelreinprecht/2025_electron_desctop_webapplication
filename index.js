const { app, BrowserWindow, ipcMain } = require('electron')
const { connectSerial, disconnectSerial, listSerialPorts } = require("./js/main/serial-main.js");
const { startUdp, stopUdp } = require("./js/main/udp-main.js");

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: __dirname + "/preload.js",
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        }
    });

    mainWindow.loadFile('./html/index.html');
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

// --- IPC Handlers ---
ipcMain.on("serial-connect", (event, port) => connectSerial(mainWindow, port));
ipcMain.on("serial-disconnect", () => disconnectSerial());
ipcMain.handle("serial-list-ports", async () => {
    return await listSerialPorts();
});

ipcMain.on("udp-start", () => startUdp(mainWindow));
ipcMain.on("udp-stop", () => stopUdp());

// ### Startup application ###
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
})