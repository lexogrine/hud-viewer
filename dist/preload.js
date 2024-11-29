"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('ipcRenderer', {
    ...electron_1.ipcRenderer,
    on: electron_1.ipcRenderer.on,
    send: electron_1.ipcRenderer.send
});
