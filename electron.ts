/* eslint-disable no-console */
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import './huds';
export const isDev = process.env.DEV === 'true';

const createMainWindow = () => {
	let win: BrowserWindow | null;

	if (app) {
		app.on('window-all-closed', app.quit);

		app.on('before-quit', async () => {
			if (!win) return;

			win.removeAllListeners('close');
			win.close();
		});
	}

	win = new BrowserWindow({
		height: 835,
		show: false,
		frame: isDev,
		titleBarStyle: isDev ? 'hidden' : 'default',
		//resizable: isDev,
		title: 'Lexogrine HUD Reader',
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			backgroundThrottling: false,
			nodeIntegration: true,
			devTools: isDev
		},
		minWidth: 775,
		minHeight: 835,
		width: 1010
	});

	win.once('ready-to-show', () => {
		if (win) {
			win.show();
		}
	});
	// win.setMenu(null);
	win.setMenuBarVisibility(!isDev);

	win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/build/index.html`);
	win.on('close', () => {
		win = null;
		app.quit();
	});
};

const lock = app.requestSingleInstanceLock();
if (!lock) {
	app.quit();
} else {
	app.on('ready', createMainWindow);
}
