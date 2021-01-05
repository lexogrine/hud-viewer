"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var electron_1 = require("electron");
var node_fetch_1 = __importDefault(require("node-fetch"));
var getIP = function (code) {
    var ip = code.split('-').map(function (n) { return parseInt(n, 16); }).join('.');
    var address = "http://" + ip + ":1349";
    return address;
};
electron_1.ipcMain.on("reload", function (event, code) {
    console.log(code);
    node_fetch_1["default"](getIP(code) + "/api/huds").then(function (res) { return res.json(); }).then(function (res) {
        event.reply("huds", res);
    })["catch"](function (e) {
        console.log(e);
        event.reply("huds", null);
    });
});
