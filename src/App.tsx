import React, { useState, useEffect } from 'react';
import './App.css';
import { HUD } from './../interfaces';
const { ipcRenderer } = window.require('electron');

function App() {
	const [code, setCode] = useState('C0-A8-2B-BF');
	const [huds, setHUDs] = useState<HUD[]>([]);

	const requestHUDs = () => {
		ipcRenderer.send('reload', code);
	};

	const openHUD = (hud: HUD) => () => {
		ipcRenderer.send("openHUD", hud);
	};

	useEffect(() => {
		ipcRenderer.on('huds', (event: any, huds: HUD[] | null) => {
			setHUDs(huds || []);
		});
	}, []);

	return (
		<div className="App">
			<main>
				<p>Lexogrine HUD Reader</p>
				<input onChange={e => setCode(e.target.value)} value={code} />
				<button onClick={requestHUDs}>Connect</button>
				{huds.map(hud => (
					<div className="hud-entry" key={hud.dir}>
						<div className="hud-name">{hud.name}</div>
						<div className="" onClick={openHUD(hud)}>OPEN</div>
					</div>
				))}
			</main>
		</div>
	);
}

export default App;
