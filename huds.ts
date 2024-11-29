import { ipcMain, app } from 'electron';
import fetch from 'node-fetch';
import * as I from './interfaces';
import HUD from './overlay';
import io, { Socket } from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import generateGSI from 'csgogsi-generator';
import { getGamePath } from 'steam-game-path';

const recentCodePath = path.join(app.getPath('userData'), 'code.lhv');

const saveLatestCode = (code: string) => {
	fs.writeFileSync(recentCodePath, code);
};

const getLatestCode = () => {
	return fs.readFileSync(recentCodePath, 'utf8');
};

const getIP = (code: string) => {
	const ipNumbers = code.split('-').map(n => parseInt(n, 16));

	const port = ipNumbers.pop();

	const ip = `${ipNumbers.join('.')}:${port}`;
	const address: string = `http://${ip}`;
	return address;
};
const validateGSI = (address: string): I.GSIValidationResponse => {
	const steamPath = getGamePath(730);
	if (!steamPath || !steamPath.game || !steamPath.game.path) return { available: false, installed: false };
	const cfgPath = path.join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
	if (!fs.existsSync(cfgPath)) {
		return { available: true, installed: false };
	}
	const fileText = fs.readFileSync(cfgPath, 'utf8');
	return { available: true, installed: fileText === generateGSI('HUDMANAGERGSI', address + '/').vdf };
};

const createGSIFile = (address: string) => {
	const gsiValidation = validateGSI(address);
	if (!gsiValidation.available) return gsiValidation;
	const steamPath = getGamePath(730);
	if (!steamPath || !steamPath.game) return gsiValidation;
	const cfgPath = path.join(steamPath.game.path, 'csgo', 'cfg', 'gamestate_integration_hudmanager.cfg');
	fs.writeFileSync(cfgPath, generateGSI('HUDMANAGERGSI', address + '/').vdf);
	return { available: true, installed: true };
};

if (!fs.existsSync(recentCodePath)) {
	saveLatestCode('');
}

let socket: Socket | null = null;

ipcMain.on('reload', (event, address: string, code: string) => {
	fetch(`${address}/api/huds`)
		.then(res => res.json())
		.then(res => {
			socket = io(address);
			socket!.on('connect', () => {
				event.reply('connection', true);
			});
			socket!.on('disconnect', () => {
				event.reply('connection', false);
			});
			socket!.on('readyToRegister', () => {
				saveLatestCode(code);
				socket!.emit('registerReader');
			});
			//createGSIFile(address);
			event.reply('huds', res, true);
		})
		.catch(() => {
			event.reply('huds', null, false);
		});
});

ipcMain.on('validateGSI', ev => {
	ev.reply('validation', validateGSI(getIP(getLatestCode())));
});

ipcMain.on('getCode', ev => {
	ev.reply('code', getLatestCode());
});

ipcMain.on('installGSI', ev => {
	createGSIFile(getIP(getLatestCode()));
	ev.reply('validation', validateGSI(getIP(getLatestCode())));
});

ipcMain.on('openHUD', (event, hud: I.HUD) => {
	HUD.open(hud, socket);
	//console.log(hud);
});
