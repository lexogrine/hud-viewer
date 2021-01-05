import React, { useState, useEffect } from 'react';
import './App.css';
const { ipcRenderer } = window.require('electron');

function App() {
	const [ code, setCode ] = useState('C0-A8-2B-BF');
	const [ apiAddress, setAPI ] = useState<string | null>(null);

	const requestHUDs = () => {
		ipcRenderer.send("reload", code);
	}

	const loadHUDs = () => {

	}

	useEffect(() => {
		ipcRenderer.on("huds", (event: any, huds: any) => {
			console.log(huds);
		});
	}, [])



	return (
		<div className="App">
			<header className="App-header">
				<p>Lexogrine HUD Reader</p>
				<input onChange={e => setCode(e.target.value)} value={code} />
				<button onClick={requestHUDs}>Connect</button>
			</header>
		</div>
	);
}

export default App;
