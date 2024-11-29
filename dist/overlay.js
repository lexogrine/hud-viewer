"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
class HUD {
    current;
    tray;
    show;
    hud;
    constructor() {
        this.current = null;
        this.tray = null;
        this.show = true;
        this.hud = null;
    }
    async open(hud, io) {
        if (this.current !== null || this.hud !== null)
            return null;
        if (hud === null)
            return null;
        const hudWindow = new electron_1.BrowserWindow({
            fullscreen: true,
            show: true,
            title: hud.name,
            resizable: false,
            alwaysOnTop: !hud.allowAppsOnTop,
            frame: false,
            transparent: true,
            focusable: true,
            webPreferences: {
                backgroundThrottling: false
            }
        });
        if (!hud.allowAppsOnTop) {
            hudWindow.on('show', () => {
                hudWindow.setAlwaysOnTop(true);
            });
            hudWindow.setIgnoreMouseEvents(true);
        }
        const tray = new electron_1.Tray(path.join(__dirname, 'favicon.ico'));
        tray.setToolTip('Lexogrine HUD Viewer');
        tray.on('right-click', () => {
            const contextMenu = electron_1.Menu.buildFromTemplate([
                { label: hud.name, enabled: false },
                { type: 'separator' },
                { label: 'Show', type: 'checkbox', click: () => this.toggleVisibility(), checked: this.show },
                { label: 'Close HUD', click: () => this.close() }
            ]);
            tray.popUpContextMenu(contextMenu);
        });
        this.tray = tray;
        this.current = hudWindow;
        this.hud = hud;
        this.showWindow(hud, io);
        hudWindow.loadURL(hud.url);
        hudWindow.on('close', () => {
            if (this.hud && this.hud.keybinds) {
                for (const keybind of this.hud.keybinds) {
                    electron_1.globalShortcut.unregister(keybind.bind);
                }
            }
            electron_1.globalShortcut.unregister('Alt+r');
            electron_1.globalShortcut.unregister('Alt+F');
            this.hud = null;
            this.current = null;
            if (this.tray !== null) {
                this.tray.destroy();
            }
        });
        return true;
    }
    showWindow(hud, io) {
        if (!this.current)
            return;
        this.current.setOpacity(1);
        this.current.show();
        electron_1.globalShortcut.register('Alt+r', () => {
            if (io)
                io.emit('readerReverseSide');
        });
        electron_1.globalShortcut.register('Alt+F', () => {
            if (!this.current || !hud || !hud.url)
                return;
            this.current.loadURL(hud.url);
        });
        if (hud.keybinds) {
            for (const bind of hud.keybinds) {
                electron_1.globalShortcut.register(bind.bind, () => {
                    if (io)
                        io.emit('readerKeybindAction', hud.dir, bind.action);
                });
            }
        }
    }
    toggleVisibility() {
        this.show = !this.show;
        if (this.current) {
            this.current.setOpacity(this.show ? 1 : 0);
        }
    }
    close() {
        if (this.tray !== null) {
            this.tray.destroy();
        }
        if (this.current === null)
            return null;
        this.current.close();
        this.current = null;
        return true;
    }
}
const HUDWindow = new HUD();
exports.default = HUDWindow;
