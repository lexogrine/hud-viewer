import React, { useState, useEffect } from 'react';
import './App.css';
import { Input, Button } from 'reactstrap';
import { HUD } from './../interfaces';
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
	const ipNumbers = code
		.split('-')
		.map(n => parseInt(n, 16));

	const port = ipNumbers.pop();

	const ip = `${ipNumbers.join('.')}:${port}`;
	const address = `http://${ip}`;
	return address;
};

function App() {
	const [code, setCode] = useState('a9-fe-39-46-515');
	const [huds, setHUDs] = useState<HUD[]>([]);

	const requestHUDs = () => {
		ipcRenderer.send('reload', getIP(code));
	};
	
	useEffect(() => {
		ipcRenderer.on('huds', (event: any, huds: HUD[] | null) => {
			setHUDs(huds || []);
		});
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

	return (
		<div className="App">
			
			<div className="window-bar">
				<div className="window-drag-bar"></div>
				<div onClick={minimize} className="app-control minimize"></div>
				<div onClick={maximize} className="app-control maximize"></div>
				<div onClick={close} className="app-control close"></div>
			</div>
			<div className="App-container">
				<main>
					{
						huds.length ? null : <>
							<p>Lexogrine HUD Reader</p>
							<Input onChange={e => setCode(e.target.value.toUpperCase())} value={code.toUpperCase()} />
							<Button onClick={requestHUDs}>Connect</Button>
						</>
					}
					{huds.map(hud => (
						<HUDEntry hud={hud} url={getIP(code)} key={hashCode(hud.dir)} />
					))}
				</main>
			</div>
		</div>
	);
}

export default App;
