const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serialAPI", {
    connect: () => ipcRenderer.send("serial-connect"),
    disconnect: () => ipcRenderer.send("serial-disconnect"),
});

contextBridge.exposeInMainWorld("udpAPI", {
    start: () => ipcRenderer.send("udp-start"),
    stop: () => ipcRenderer.send("udp-stop"),
});

// unified incoming sensor stream
contextBridge.exposeInMainWorld("dataAPI", {
    onData: (cb) => ipcRenderer.on("sensor-data", (_, data) => cb(data))
});
