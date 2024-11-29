import React from 'react';
import { Row, Col } from 'reactstrap';
import Tip from './Tooltip';
import * as I from './../interfaces';
import Display from './assets/Display.png';
import Map from './assets/Map.png';
import Killfeed from './assets/Killfeed.png';

interface IProps {
	hud: I.HUD;
	url: string;
}

const DEFAULT_THUMBNAIL_API_PATH = "default/icon.png";

const HUDEntry = ({ hud, url }: IProps) => {
	const openHUD = () => {
		window.ipcRenderer?.send('openHUD', hud);
	};

	const portLocation = hud.url.indexOf(':1349');
	const apiUrl = hud.url.substring(0, portLocation + 6);

	return (
		<Row key={hud.dir} className="hudRow">
			<Col s={12}>
				<Row>
					<Col className="centered thumb">
						<img src={hud.thumbnail ? `${apiUrl}huds/${hud.resourceId}/thumbnail` : `${apiUrl}/${DEFAULT_THUMBNAIL_API_PATH}`} alt={`${hud.name}`} />
					</Col>
					<Col style={{ flex: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<Row>
							<Col>
								<strong className="hudName">
									{hud.isDev ? '[DEV] ' : ''}
									{hud.name}
								</strong>{' '}
								<span className="hudVersion">({hud.version})</span>
							</Col>
						</Row>
						<Row>
							<Col className="hudAuthor">
								<div>{hud.author}</div>
							</Col>
						</Row>
						{hud.killfeed || hud.radar ? (
							<Row>
								<Col>
									{hud.radar ? (
										<Tip
											id={`radar_support_${hud.dir}`}
											className="radar_support"
											label={<img src={Map} className="action" alt="Supports boltgolt's radar" />}
										>
											Includes Boltgolt&apos;s radar
										</Tip>
									) : (
										''
									)}
									{hud.killfeed ? (
										<Tip
											id={`killfeed_support_${hud.dir}`}
											className="killfeed_support"
											label={
												<img src={Killfeed} className="action" alt="Supports custom killfeed" />
											}
										>
											Includes custom killfeed
										</Tip>
									) : (
										''
									)}
								</Col>
							</Row>
						) : (
							''
						)}
					</Col>
					<Col style={{ flex: 1 }} className="hud-options">
						<div className="centered">
							<img src={Display} onClick={openHUD} className="action" alt="Start HUD" />
						</div>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default HUDEntry;
