const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serialAPI", {
    connect: (port) => ipcRenderer.send("serial-connect", port),
    disconnect: () => ipcRenderer.send("serial-disconnect"),
    listPorts: () => ipcRenderer.invoke("serial-list-ports"),
});

contextBridge.exposeInMainWorld("udpAPI", {
    start: () => ipcRenderer.send("udp-start"),
    stop: () => ipcRenderer.send("udp-stop"),
});

// unified incoming sensor data
contextBridge.exposeInMainWorld("dataAPI", {
    onData: (cb) => {
        ipcRenderer.on("sensor-data", (event, data) => {
            if (!data) return; // ignore undefined events before renderer is fully initialized
            cb(data);
        });
    }
});

// access to electron store
contextBridge.exposeInMainWorld("storeAPI", {
    get: (key, def) => ipcRenderer.invoke("store-get", key, def),
    set: (key, value) => ipcRenderer.send("store-set", key, value),
    delete: (key) => ipcRenderer.send("store-delete", key),
});
