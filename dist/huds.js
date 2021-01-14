"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var node_fetch_1 = __importDefault(require("node-fetch"));
var overlay_1 = __importDefault(require("./overlay"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var csgogsi_generator_1 = __importDefault(require("csgogsi-generator"));
var steam_game_path_1 = require("steam-game-path");
var recentCodePath = path_1["default"].join(electron_1.app.getPath('userData'), 'code.lhv');
var saveLatestCode = function (code) {
    fs_1["default"].writeFileSync(recentCodePath, code);
};
var getLatestCode = function () {
    return fs_1["default"].readFileSync(recentCodePath, 'utf8');
};
var getIP = function (code) {
    var ipNumbers = code.split('-').map(function (n) { return parseInt(n, 16); });
    var port = ipNumbers.pop();
    var ip = ipNumbers.join('.') + ":" + port;
    var address = "http://" + ip;
    return address;
};
var validateGSI = function (address) {
    var steamPath = steam_game_path_1.getGamePath(730);
    if (!steamPath || !steamPath.game || !steamPath.game.path)
        return { available: false, installed: false };
    var cfgPath = path_1["default"].join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    if (!fs_1["default"].existsSync(cfgPath)) {
        return { available: true, installed: false };
    }
    var fileText = fs_1["default"].readFileSync(cfgPath, 'utf8');
    return { available: true, installed: fileText === csgogsi_generator_1["default"]('HUDMANAGERGSI', address + '/').vdf };
};
var createGSIFile = function (address) {
    var gsiValidation = validateGSI(address);
    if (!gsiValidation.available)
        return gsiValidation;
    var steamPath = steam_game_path_1.getGamePath(730);
    var cfgPath = path_1["default"].join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
    fs_1["default"].writeFileSync(cfgPath, csgogsi_generator_1["default"]('HUDMANAGERGSI', address + '/').vdf);
    return { available: true, installed: true };
};
if (!fs_1["default"].existsSync(recentCodePath)) {
    saveLatestCode('');
}
var socket = null;
electron_1.ipcMain.on('reload', function (event, address, code) {
    node_fetch_1["default"](address + "/api/huds")
        .then(function (res) { return res.json(); })
        .then(function (res) {
        socket = socket_io_client_1["default"].connect(address);
        socket.on('connect', function () {
            event.reply('connection', true);
        });
        socket.on('disconnect', function () {
            event.reply('connection', false);
        });
        socket.on('readyToRegister', function () {
            saveLatestCode(code);
            socket.emit('registerReader');
        });
        //createGSIFile(address);
        event.reply('huds', res, true);
    })["catch"](function () {
        event.reply('huds', null, false);
    });
});
electron_1.ipcMain.on('validateGSI', function (ev) {
    ev.reply('validation', validateGSI(getIP(getLatestCode())));
});
electron_1.ipcMain.on('getCode', function (ev) {
    ev.reply('code', getLatestCode());
});
electron_1.ipcMain.on('installGSI', function (ev) {
    createGSIFile(getIP(getLatestCode()));
    ev.reply('validation', validateGSI(getIP(getLatestCode())));
});
electron_1.ipcMain.on('openHUD', function (event, hud) {
    overlay_1["default"].open(hud, socket);
    //console.log(hud);
});
