"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = void 0;
/* eslint-disable no-console */
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
require("./huds");
exports.isDev = process.env.VITE_DEV === 'true';
const createMainWindow = () => {
    let win;
    if (electron_1.app) {
        electron_1.app.on('window-all-closed', electron_1.app.quit);
        electron_1.app.on('before-quit', async () => {
            if (!win)
                return;
            win.removeAllListeners('close');
            win.close();
        });
    }
    win = new electron_1.BrowserWindow({
        height: 435,
        show: false,
        frame: false,
        titleBarStyle: 'hidden',
        //resizable: isDev,
        title: 'Lexogrine HUD Viewer',
        icon: path_1.default.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true,
            preload: path_1.default.join(__dirname, 'preload.js')
            //devTools: isDev
        },
        minWidth: 775,
        minHeight: 435,
        width: 775
    });
    electron_1.ipcMain.on('min', () => {
        win.minimize();
    });
    electron_1.ipcMain.on('max', () => {
        if (win.isMaximized()) {
            win.restore();
        }
        else {
            win.maximize();
        }
    });
    electron_1.ipcMain.on('close', () => {
        win.close();
    });
    win.once('ready-to-show', () => {
        if (win) {
            win.show();
        }
    });
    // win.setMenu(null);
    win.setMenuBarVisibility(!exports.isDev);
    win.loadURL(exports.isDev ? 'http://localhost:3001' : `file://${__dirname}/dist/build/index.html`);
    win.on('close', () => {
        win = null;
        electron_1.app.quit();
    });
};
const lock = electron_1.app.requestSingleInstanceLock();
if (!lock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('ready', createMainWindow);
}
