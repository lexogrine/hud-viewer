import { ipcMain, app } from 'electron';
import fetch from 'node-fetch';
import * as I from './interfaces';
import HUD from './overlay';
import io from 'socket.io-client';
import fs from 'fs';
import path from 'path';

const recentCodePath = path.join(app.getPath('userData'), 'code.lhv');

const saveLatestCode = (code: string) => {
	fs.writeFileSync(recentCodePath, code);
};

const getLatestCode = () => {
	return fs.readFileSync(recentCodePath, 'utf8');
};

if (!fs.existsSync(recentCodePath)) {
	saveLatestCode('');
}

let socket: SocketIOClient.Socket | null = null;

ipcMain.on('reload', (event, address: string, code: string) => {
	fetch(`${address}/api/huds`)
		.then(res => res.json())
		.then(res => {
			socket = io.connect(address);
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
			event.reply('huds', res, true);
		})
		.catch(() => {
			event.reply('huds', null, false);
		});
});

ipcMain.on('getCode', ev => {
	ev.reply('code', getLatestCode());
});

ipcMain.on('openHUD', (event, hud: I.HUD) => {
	HUD.open(hud, socket);
	//console.log(hud);
});
