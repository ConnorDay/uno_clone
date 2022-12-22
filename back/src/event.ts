import { Player } from "./player";
import { Game } from "./uno";
import { Card } from "./uno/cards/card";

export abstract class Event {
	game: Game;
	target: Player;
	constructor(game: Game, target: Player) {
		this.game = game;
		this.target = target;
	}
}
export abstract class DisableableEvent extends Event {
	isDisabled = false;
}

export class TurnStartEvent extends Event {}
export class TurnEndEvent extends Event {}

export class DrawEvent extends DisableableEvent {
	toDraw: number;
	drawUntilPlayable: boolean = false;
	stopOnPlayable: boolean = false;
	playPlayable: boolean = false;
	constructor(
		game: Game,
		target: Player,
		toDraw: number,
		keepDrawing?: boolean,
		stopOnPlayable?: boolean,
		playPlayable?: boolean
	) {
		super(game, target);
		this.toDraw = toDraw;
		if (keepDrawing !== undefined) {
			this.drawUntilPlayable = keepDrawing;
		}
		if (stopOnPlayable !== undefined) {
			this.stopOnPlayable = stopOnPlayable;
		}
		if (playPlayable !== undefined) {
			this.playPlayable = playPlayable;
		}
	}
}

export class PlayEvent extends DisableableEvent {
	toPlay: Card;
	constructor(game: Game, target: Player, toPlay: Card) {
		super(game, target);
		this.toPlay = toPlay;
	}
}
