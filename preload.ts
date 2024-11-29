import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
    ...ipcRenderer,
    on: ipcRenderer.on,
    send: ipcRenderer.send
});