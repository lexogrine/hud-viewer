import { ipcMain } from 'electron';
import fetch from 'node-fetch';
import * as I from './interfaces';
import HUD from './overlay';
import io from 'socket.io-client';

let socket: SocketIOClient.Socket | null = null;

ipcMain.on('reload', (event, address: string) => {
	fetch(`${address}/api/huds`)
		.then(res => res.json())
		.then(res => {
			socket = io.connect(address);
			socket.on('readyToRegister', () => {
				socket.emit('registerReader');
			});
			event.reply('huds', res);
		})
		.catch(() => {
			event.reply('huds', null);
		});
});

ipcMain.on('openHUD', (event, hud: I.HUD) => {
	HUD.open(hud, socket);
	//console.log(hud);
});
