import { BrowserWindow, Tray, Menu, globalShortcut } from 'electron';
import * as path from 'path';
//import ip from 'ip';
import  { Socket } from 'socket.io-client';
import * as I from './interfaces';

class HUD {
	current: BrowserWindow | null;
	tray: Tray | null;
	show: boolean;
	hud: I.HUD | null;
	constructor() {
		this.current = null;
		this.tray = null;
		this.show = true;
		this.hud = null;
	}

	async open(hud: I.HUD, io: Socket | null) {
		if (this.current !== null || this.hud !== null) return null;
		if (hud === null) return null;
		const hudWindow = new BrowserWindow({
			fullscreen: true,
			show: true,
			title: hud.name,
			resizable: false,
			alwaysOnTop: !hud.allowAppsOnTop,
			frame: false,
			transparent: true,
			focusable: true,
			webPreferences: {
				backgroundThrottling: false
			}
		});
		if (!hud.allowAppsOnTop) {
			hudWindow.on('show', () => {
				hudWindow.setAlwaysOnTop(true);
			});
			hudWindow.setIgnoreMouseEvents(true);
		}

		const tray = new Tray(path.join(__dirname, 'favicon.ico'));

		tray.setToolTip('Lexogrine HUD Viewer');
		tray.on('right-click', () => {
			const contextMenu = Menu.buildFromTemplate([
				{ label: hud.name, enabled: false },
				{ type: 'separator' },
				{ label: 'Show', type: 'checkbox', click: () => this.toggleVisibility(), checked: this.show },
				{ label: 'Close HUD', click: () => this.close() }
			]);
			tray.popUpContextMenu(contextMenu);
		});

		this.tray = tray;

		this.current = hudWindow;
		this.hud = hud;

		this.showWindow(hud, io);
		hudWindow.loadURL(hud.url);

		hudWindow.on('close', () => {
			if (this.hud && this.hud.keybinds) {
				for (const keybind of this.hud.keybinds) {
					globalShortcut.unregister(keybind.bind);
				}
			}
			globalShortcut.unregister('Alt+r');
			globalShortcut.unregister('Alt+F');

			this.hud = null;
			this.current = null;
			if (this.tray !== null) {
				this.tray.destroy();
			}
		});

		return true;
	}

	showWindow(hud: I.HUD, io: Socket | null) {
		if (!this.current) return;
		this.current.setOpacity(1);
		this.current.show();

		globalShortcut.register('Alt+r', () => {
			if (io) io.emit('readerReverseSide');
		});

		globalShortcut.register('Alt+F', () => {
			if (!this.current || !hud || !hud.url) return;
			this.current.loadURL(hud.url);
		});

		if (hud.keybinds) {
			for (const bind of hud.keybinds) {
				globalShortcut.register(bind.bind, () => {
					if (io) io.emit('readerKeybindAction', hud.dir, bind.action);
				});
			}
		}
	}

	toggleVisibility() {
		this.show = !this.show;
		if (this.current) {
			this.current.setOpacity(this.show ? 1 : 0);
		}
	}

	close() {
		if (this.tray !== null) {
			this.tray.destroy();
		}
		if (this.current === null) return null;

		this.current.close();
		this.current = null;

		return true;
	}
}

const HUDWindow = new HUD();

export default HUDWindow;
