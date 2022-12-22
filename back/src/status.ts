import { DrawEvent, PlayEvent, TurnEndEvent, TurnStartEvent } from "./event";
import { Card } from "./uno/cards/card";

export abstract class Status {
	async onTurnStart(event: TurnStartEvent) {}
	async onTurnEnd(event: TurnEndEvent) {}
	async onDraw(event: DrawEvent) {}
	async onPlay(event: PlayEvent) {}
}

export class SkipStatus extends Status {
	async onTurnStart(event: TurnStartEvent) {
		event.game.turn += event.game.playDirection;
	}
	async onTurnEnd(event: TurnEndEvent): Promise<void> {
		event.game.removeStatus(event.target, this);
	}
}

export class DrawStatus extends Status {
	private _matchValue: string;
	private _toDraw: number;
	private _increment: number;

	constructor(value: string, toDraw: number, increment: number) {
		super();
		this._matchValue = value;
		this._toDraw = toDraw;
		this._increment = increment;
	}

	async onTurnStart(event: TurnStartEvent): Promise<void> {
		const canStack =
			event.game.hands[event.target.id].find(
				(card) => card.value === this._matchValue
			) !== undefined;

		if (!canStack) {
			event.game.giveCards(
				new DrawEvent(event.game, event.target, this._toDraw)
			);
			event.game.turn += event.game.playDirection;
			event.game.removeStatus(event.target, this);
		}
	}

	async onPlay(event: PlayEvent): Promise<void> {
		//Only allow stacking
		if (event.toPlay.value === this._matchValue) {
			//Apply status to next player and remove from this one
			const nextPlayer = event.game.getNextPlayer();
			event.game.addStatus(
				nextPlayer,
				new DrawStatus(
					this._matchValue,
					this._toDraw + this._increment,
					this._increment
				)
			);
			event.game.removeStatus(event.target, this);
		} else {
			event.isDisabled = true;
		}
	}

	async onDraw(event: DrawEvent): Promise<void> {
		event.drawUntilPlayable = false;
		event.playPlayable = false;
		event.stopOnPlayable = false;
		event.toDraw = this._toDraw;

		event.game.removeStatus(event.target, this);
	}
}
