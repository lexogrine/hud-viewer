"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var node_fetch_1 = __importDefault(require("node-fetch"));
var overlay_1 = __importDefault(require("./overlay"));
var socket_io_client_1 = __importDefault(require("socket.io-client"));
var socket = null;
electron_1.ipcMain.on('reload', function (event, address) {
    node_fetch_1["default"](address + "/api/huds")
        .then(function (res) { return res.json(); })
        .then(function (res) {
        socket = socket_io_client_1["default"].connect(address);
        socket.on("readyToRegister", function () {
            socket.emit("registerReader");
        });
        event.reply('huds', res);
    })["catch"](function () {
        event.reply('huds', null);
    });
});
electron_1.ipcMain.on('openHUD', function (event, hud) {
    overlay_1["default"].open(hud, socket);
    //console.log(hud);
});
