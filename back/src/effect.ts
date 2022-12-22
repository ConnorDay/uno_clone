import { DrawEvent } from "./event";
import { DrawStatus, SkipStatus } from "./status";
import { Game } from "./uno";

export abstract class Effect {
	abstract resolve(game: Game): Promise<void>;
}

export class DrawEffect extends Effect {
	private _value: string;
	private _toDraw: number;
	constructor(value: string, num: number) {
		super();

		this._value = value;
		this._toDraw = num;
	}

	async resolve(game: Game): Promise<void> {
		game.addStatus(
			game.getNextPlayer(),
			new DrawStatus(this._value, this._toDraw, this._toDraw)
		);
	}
}

export class SkipEffect extends Effect {
	resolve(game: Game): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			game.addStatus(game.getNextPlayer(), new SkipStatus());
			resolve();
		});
	}
}

export class ReverseEffect extends Effect {
	resolve(game: Game): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			game.playDirection *= -1;
			resolve();
		});
	}
}
