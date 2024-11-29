"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_fetch_1 = __importDefault(require("node-fetch"));
const overlay_1 = __importDefault(require("./overlay"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csgogsi_generator_1 = __importDefault(require("csgogsi-generator"));
const steam_game_path_1 = require("steam-game-path");
const recentCodePath = path_1.default.join(electron_1.app.getPath('userData'), 'code.lhv');
const saveLatestCode = (code) => {
    fs_1.default.writeFileSync(recentCodePath, code);
};
const getLatestCode = () => {
    return fs_1.default.readFileSync(recentCodePath, 'utf8');
};
const getIP = (code) => {
    const ipNumbers = code.split('-').map(n => parseInt(n, 16));
    const port = ipNumbers.pop();
    const ip = `${ipNumbers.join('.')}:${port}`;
    const address = `http://${ip}`;
    return address;
};
const validateGSI = (address) => {
    const steamPath = (0, steam_game_path_1.getGamePath)(730);
    if (!steamPath || !steamPath.game || !steamPath.game.path)
        return { available: false, installed: false };
    const cfgPath = path_1.default.join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    if (!fs_1.default.existsSync(cfgPath)) {
        return { available: true, installed: false };
    }
    const fileText = fs_1.default.readFileSync(cfgPath, 'utf8');
    return { available: true, installed: fileText === (0, csgogsi_generator_1.default)('HUDMANAGERGSI', address + '/').vdf };
};
const createGSIFile = (address) => {
    const gsiValidation = validateGSI(address);
    if (!gsiValidation.available)
        return gsiValidation;
    const steamPath = (0, steam_game_path_1.getGamePath)(730);
    if (!steamPath || !steamPath.game)
        return gsiValidation;
    const cfgPath = path_1.default.join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    fs_1.default.writeFileSync(cfgPath, (0, csgogsi_generator_1.default)('HUDMANAGERGSI', address + '/').vdf);
    return { available: true, installed: true };
};
if (!fs_1.default.existsSync(recentCodePath)) {
    saveLatestCode('');
}
let socket = null;
electron_1.ipcMain.on('reload', (event, address, code) => {
    (0, node_fetch_1.default)(`${address}/api/huds`)
        .then(res => res.json())
        .then(res => {
        socket = (0, socket_io_client_1.default)(address);
        socket.on('connect', () => {
            event.reply('connection', true);
        });
        socket.on('disconnect', () => {
            event.reply('connection', false);
        });
        socket.on('readyToRegister', () => {
            saveLatestCode(code);
            socket.emit('registerReader');
        });
        //createGSIFile(address);
        event.reply('huds', res, true);
    })
        .catch(() => {
        event.reply('huds', null, false);
    });
});
electron_1.ipcMain.on('validateGSI', ev => {
    ev.reply('validation', validateGSI(getIP(getLatestCode())));
});
electron_1.ipcMain.on('getCode', ev => {
    ev.reply('code', getLatestCode());
});
electron_1.ipcMain.on('installGSI', ev => {
    createGSIFile(getIP(getLatestCode()));
    ev.reply('validation', validateGSI(getIP(getLatestCode())));
});
electron_1.ipcMain.on('openHUD', (event, hud) => {
    overlay_1.default.open(hud, socket);
    //console.log(hud);
});
