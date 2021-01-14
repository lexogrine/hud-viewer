export type PanelInputType =
	| 'text'
	| 'number'
	| 'team'
	| 'image'
	| 'match'
	| 'player'
	| 'select'
	| 'action'
	| 'checkbox';

export interface GeneralInput {
	type: Exclude<PanelInputType, 'select' | 'action' | 'checkbox'>;
	name: string;
	label: string;
}

export interface SelectActionInput {
	type: 'select' | 'action';
	name: string;
	label: string;
	values: {
		label: string;
		name: string;
	}[];
}

export interface CheckboxInput {
	type: 'checkbox';
	name: string;
	label: string;
}

export type PanelInput = GeneralInput | SelectActionInput | CheckboxInput;

export type KeyBind = {
	bind: string;
	action: string;
};

export type PanelTemplate = {
	label: string;
	name: string;
	inputs: PanelInput[];
};

export interface HUD {
	name: string;
	version: string;
	author: string;
	legacy: boolean;
	dir: string;
	radar: boolean;
	killfeed: boolean;
	panel?: PanelTemplate[];
	keybinds?: KeyBind[];
	url: string;
	boltobserv?: {
		css?: boolean;
		maps?: boolean;
	};
	isDev: boolean;
}

export interface GSIValidationResponse {
	installed: boolean;
	available: boolean;
}