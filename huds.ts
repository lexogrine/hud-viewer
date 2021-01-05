import { ipcMain } from 'electron';
import fetch from 'node-fetch';

const getIP = (code: string) => {
    const ip = code.split('-').map(n => parseInt(n, 16)).join('.');
    const address = `http://${ip}:1349`;
    return address;
}

ipcMain.on("reload", (event, code: string) => {
    console.log(code);
    fetch(`${getIP(code)}/api/huds`).then(res => res.json()).then(res => {
        event.reply("huds", res);
    }).catch(e => {
        console.log(e);
        event.reply("huds", null);
    })
});
