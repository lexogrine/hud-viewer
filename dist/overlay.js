"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var electron_1 = require("electron");
var HUD = /** @class */ (function () {
    function HUD() {
        this.current = null;
        this.tray = null;
        this.show = true;
        this.hud = null;
    }
    HUD.prototype.open = function (hud, io) {
        return __awaiter(this, void 0, void 0, function () {
            var hudWindow;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.current !== null || this.hud !== null)
                    return [2 /*return*/, null];
                if (hud === null)
                    return [2 /*return*/, null];
                hudWindow = new electron_1.BrowserWindow({
                    fullscreen: true,
                    show: false,
                    title: hud.name,
                    resizable: false,
                    alwaysOnTop: true,
                    frame: false,
                    transparent: true,
                    focusable: true,
                    webPreferences: {
                        backgroundThrottling: false
                    }
                });
                hudWindow.on('show', function () {
                    hudWindow.setAlwaysOnTop(true);
                });
                hudWindow.setIgnoreMouseEvents(true);
                /*const tray = new Tray(path.join(__dirname, 'favicon.ico'));
        
                tray.setToolTip('HUD Manager');
                tray.on('right-click', () => {
                    const contextMenu = Menu.buildFromTemplate([
                        { label: hud.name, enabled: false },
                        { type: 'separator' },
                        { label: 'Show', type: 'checkbox', click: () => this.toggleVisibility(), checked: this.show },
                        { label: 'Close HUD', click: () => this.close() }
                    ]);
                    tray.popUpContextMenu(contextMenu);
                });
        
                this.tray = tray;*/
                this.current = hudWindow;
                this.hud = hud;
                this.showWindow(hud, io);
                hudWindow.loadURL(hud.url);
                hudWindow.on('close', function () {
                    if (_this.hud && _this.hud.keybinds) {
                        for (var _i = 0, _a = _this.hud.keybinds; _i < _a.length; _i++) {
                            var keybind = _a[_i];
                            electron_1.globalShortcut.unregister(keybind.bind);
                        }
                    }
                    electron_1.globalShortcut.unregister('Alt+r');
                    electron_1.globalShortcut.unregister('Alt+F');
                    _this.hud = null;
                    _this.current = null;
                    if (_this.tray !== null) {
                        _this.tray.destroy();
                    }
                });
                return [2 /*return*/, true];
            });
        });
    };
    HUD.prototype.showWindow = function (hud, io) {
        var _this = this;
        if (!this.current)
            return;
        this.current.setOpacity(1);
        this.current.show();
        electron_1.globalShortcut.register('Alt+r', function () {
            //match.reverseSide(io);
            console.log('REVERSE MATCH');
            if (io)
                io.emit('readerReverseSide');
        });
        electron_1.globalShortcut.register('Alt+F', function () {
            if (!_this.current || !hud || !hud.url)
                return;
            _this.current.loadURL(hud.url);
        });
        console.log(hud.keybinds);
        if (hud.keybinds) {
            var _loop_1 = function (bind) {
                console.log('Registered', bind.bind);
                electron_1.globalShortcut.register(bind.bind, function () {
                    console.log("BIND: " + bind);
                    if (io)
                        io.emit('readerKeybindAction', hud.dir, bind.action);
                });
            };
            for (var _i = 0, _a = hud.keybinds; _i < _a.length; _i++) {
                var bind = _a[_i];
                _loop_1(bind);
            }
        }
    };
    HUD.prototype.toggleVisibility = function () {
        this.show = !this.show;
        if (this.current) {
            this.current.setOpacity(this.show ? 1 : 0);
        }
    };
    HUD.prototype.close = function () {
        if (this.tray !== null) {
            this.tray.destroy();
        }
        if (this.current === null)
            return null;
        this.current.close();
        this.current = null;
        return true;
    };
    return HUD;
}());
var HUDWindow = new HUD();
exports["default"] = HUDWindow;
