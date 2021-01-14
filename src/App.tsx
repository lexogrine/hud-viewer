import React, { useState, useEffect } from 'react';
import './App.css';
import { Input, Button } from 'reactstrap';
import { GSIValidationResponse, HUD } from './../interfaces';
import HUDEntry from './HUDEntry';
const { ipcRenderer } = window.require('electron');

const hashCode = (s: string) =>
	s
		.split('')
		.reduce((a, b) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0)
		.toString();

const getIP = (code: string) => {
	const ipNumbers = code.split('-').map(n => parseInt(n, 16));

	const port = ipNumbers.pop();

	const ip = `${ipNumbers.join('.')}:${port}`;
	const address = `http://${ip}`;
	return address;
};

function App() {
	const [code, setCode] = useState('');
	const [huds, setHUDs] = useState<HUD[]>([]);
	const [status, setStatus] = useState(false);
	const [available, setAvailable] = useState(false);
	const [installed, setInstalled] = useState(false);

	const requestHUDs = () => {
		ipcRenderer.send('reload', getIP(code), code);
	};

	useEffect(() => {
		ipcRenderer.on('validation', (event: unknown, response: GSIValidationResponse) => {
			setAvailable(response.available);
			setInstalled(response.installed);
		});
		ipcRenderer.on('code', (event: any, code: string) => {
			setCode(code);
		});
		ipcRenderer.on('huds', (event: any, huds: HUD[] | null, status?: boolean) => {
			setHUDs(huds || []);
			setStatus(!!status);
			if (status) {
				ipcRenderer.send('validateGSI');
			}
		});
		ipcRenderer.on('connection', (event: any, status: boolean) => {
			setStatus(status);
		});
		ipcRenderer.send('getCode');
	}, []);
	const minimize = () => {
		ipcRenderer.send('min');
	};
	const maximize = () => {
		ipcRenderer.send('max');
	};
	const close = () => {
		ipcRenderer.send('close');
	};
	const installGSI = () => {
		ipcRenderer.send('installGSI');
	};
	return (
		<div className="App">
			<div className="window-bar">
				<div className="window-drag-bar">
					<div className="title-bar">Lexogrine HUD Viewer</div>
				</div>
				<div onClick={minimize} className="app-control minimize"></div>
				<div onClick={maximize} className="app-control maximize"></div>
				<div onClick={close} className="app-control close"></div>
			</div>
			<div className="App-container">
				<main>
					<p>Lexogrine HUD Viewer</p>
					<p>
						LHM Status:{' '}
						<span className={status ? 'online' : 'offline'}>{status ? 'online' : 'offline'}</span>
					</p>
					{status ? (
						<p>
							<Button disabled={!available || installed} className="round-btn" onClick={installGSI}>
								{!available ? 'Not available' : installed ? 'Installed' : 'Install'}
							</Button>
						</p>
					) : null}
					{huds.length ? null : (
						<>
							<Input onChange={e => setCode(e.target.value.toUpperCase())} value={code.toUpperCase()} />
							<Button className="round-btn" onClick={requestHUDs}>
								Connect
							</Button>
						</>
					)}
					{huds.map(hud => (
						<HUDEntry hud={hud} url={getIP(code)} key={hashCode(hud.dir)} />
					))}
				</main>
			</div>
		</div>
	);
}

export default App;
