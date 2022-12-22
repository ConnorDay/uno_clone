import { DrawEvent, PlayEvent, TurnEndEvent, TurnStartEvent } from "../event";
import { Player } from "../player";
import { Room } from "../room";
import { Status } from "../status";
import { Card } from "./cards/card";
import { Deck } from "./deck";
import { UnoDeck } from "./uno_deck";

type playerSyncConnectingObject = {
	name: string;
	id: string;
	connected: boolean;
};

type playerSyncObject = {
	name: string;
	id: string;
	numCards: number;
};

type gameSyncObject = {
	turn: number;
	players: playerSyncObject[];
	topCard: Card;
};

type playResponse = {
	success: boolean;
};

export class Game extends Room {
	private playersConnected: string[] = [];
	private connecting = true;

	public hands: { [key: string]: Card[] } = {};
	public statuses: { [key: string]: Status[] } = {};

	public deck: UnoDeck = new UnoDeck();
	public discard: Deck = new Deck();

	public disabledCards: string[] = [];

	public topCard: Card;

	public playDirection: 1 | -1 = 1;

	private _turn: number = 0;

	constructor(code: string, playerList: Player[]) {
		super(code);

		this.listenerEvents.push("gameLoaded");

		// Wait for each player to connect
		playerList.forEach((player) => {
			this.addPlayer(player, false);

			player.socket.on("gameLoaded", () => {
				//Make sure we haven't already marked this player as connected
				if (this.playersConnected.includes(player.id)) {
					console.warn(
						`user '${player.name}' attempted to connect, but was already connected`
					);
					return;
				}

				console.log(
					`user '${player.name}' in '${this.code}' has connected to the game`
				);

				this.playersConnected.push(player.id);

				this.sync();

				//check if all players have connected
				if (this.players.length === this.playersConnected.length) {
					this.start();
				}
			});
		});

		this.deck.shuffle();

		//This is guaranteed to not be undefined because the deck was just made
		this.topCard = this.deck.draw()!;

		this.emitAll("roundStart");
	}

	public getNextPlayer(offset: number = 1): Player {
		offset *= this.playDirection;
		offset %= this.players.length; //Negative mod is fine here

		let turn = offset + this.turn;
		if (turn < 0) {
			turn += this.players.length;
		} else if (turn >= this.players.length) {
			turn -= this.players.length;
		}

		return this.players[turn];
	}

	public sync() {
		//sync for when players are connecting
		if (this.connecting) {
			const toSend: playerSyncConnectingObject[] = [];
			this.players.forEach((player) => {
				toSend.push({
					name: player.name,
					id: player.id,
					connected: this.playersConnected.includes(player.id),
				});
			});
			this.emitAll("playerSync", toSend);
			return;
		}

		const playerSync: playerSyncObject[] = [];
		this.players.forEach((player) => {
			playerSync.push({
				name: player.name,
				id: player.id,
				numCards: this.hands[player.id].length,
			});
		});

		const toSend: gameSyncObject = {
			turn: this.turn,
			players: playerSync,
			topCard: this.topCard,
		};

		this.emitAll("gameSync", toSend);
	}

	public removePlayer(toRemove: Player, sync: boolean = true): void {
		super.removePlayer(toRemove, false);

		//Make sure that the turn is still valid
		if (!this.connecting) {
			this.turn = this.turn;
		}

		if (sync) {
			this.sync();
		}
	}

	public set turn(num: number) {
		//Not using modulus because it's valid for num to be negative.
		if (num < 0) {
			num = this.players.length - 1;
		}

		if (num >= this.players.length) {
			num = 0;
		}

		//Trigger End Turn Event
		{
			const target = this.getNextPlayer(0);
			const event = new TurnEndEvent(this, target);
			for (let status of this.statuses[target.id]) {
				console.log(
					`running onTurnEnd of ${status.name} for player '${target.name}'`
				);
				status.onTurnEnd(event);
			}
		}

		this._turn = num;

		//Trigger Start Turn Event
		{
			const target = this.getNextPlayer(0);
			const event = new TurnStartEvent(this, target);
			for (let status of this.statuses[target.id]) {
				console.log(
					`running onTurnStart of ${status.name} for player '${target.name}'`
				);
				status.onTurnStart(event);
			}
		}
	}
	public get turn(): number {
		return this._turn;
	}

	private drawCard(): Card | undefined {
		let toDraw = this.deck.draw();

		//Attempt to shuffle the discard back into the deck
		if (toDraw === undefined) {
			//Merge discard back into the draw pile
			this.discard.resetCards();
			this.deck.mergeDecks(this.discard);
			toDraw = this.deck.draw();

			//No more available cards, just don't do anything
			if (toDraw === undefined) {
				return;
			}
		}

		return toDraw;
	}

	public async giveCards(drawEvent: DrawEvent, doSync: boolean = true) {
		console.log(`drawing cards for player '${drawEvent.target.name}`);
		for (let status of this.statuses[drawEvent.target.id]) {
			console.log(`running onDraw for status ${status.name}`);
			await status.onDraw(drawEvent);
		}

		if (drawEvent.isDisabled) {
			console.log("drawing cancelled");
			return;
		}

		let numDrawn = 0;
		let foundPlayable: Card | undefined = undefined;
		while (
			numDrawn < drawEvent.toDraw ||
			(drawEvent.drawUntilPlayable && foundPlayable === undefined)
		) {
			const toDraw = this.drawCard();
			if (toDraw === undefined) {
				console.warn("Unable to draw additional cards");
				break;
			}

			this.hands[drawEvent.target.id].push(toDraw);

			if (toDraw.canPlayOn(this.topCard)) {
				console.log("drew a playable card");
				foundPlayable = toDraw;
				if (drawEvent.stopOnPlayable) {
					console.log("stopping on playable card draw");
					break;
				}
			}

			numDrawn++;
		}

		console.log(`player '${drawEvent.target.name}' drew ${numDrawn} cards`);

		if (doSync) {
			console.log("syncing...");
			drawEvent.target.socket.emit(
				"handSync",
				this.hands[drawEvent.target.id]
			);
			this.sync();
		}

		if (drawEvent.playPlayable && foundPlayable !== undefined) {
			console.log(
				`playing playable card '${foundPlayable.color} ${foundPlayable.value}`
			);
			this.playCard(new PlayEvent(this, drawEvent.target, foundPlayable));
		}
	}

	public addStatus(player: Player, status: Status) {
		this.statuses[player.id].push(status);
		console.log(`added status ${status.name} to player '${player.name}'`);
	}
	public removeStatus(player: Player, status: Status) {
		const prev = this.statuses[player.id].length;
		this.statuses[player.id] = this.statuses[player.id].filter(
			(s) => s !== status
		);

		console.log(
			`removed status ${status.name} from player '${
				player.name
			}'. ${prev} -> ${this.statuses[player.id].length}`
		);
	}

	private async playCard(event: PlayEvent): Promise<boolean> {
		const player = event.target;
		const card = event.toPlay;
		console.log(
			`Player '${player.name}' requested to play '${card.color} ${card.value}'`
		);

		if (!card.canPlayOn(this.topCard)) {
			console.log("cannot play on card");
			return false;
		}

		for (let status of this.statuses[player.id]) {
			console.log(`running on play for ${status.name}`);
			await status.onPlay(event);
		}

		if (event.isDisabled) {
			console.log("play was disabled");
			return false;
		}

		//Remove card from the player's hand
		console.log(`removing card from '${player.name}'`);
		this.hands[player.id] = this.hands[player.id].filter((hCard) => {
			return hCard.id !== card.id;
		});
		player.socket.emit("handSync", this.hands[player.id]);

		//Update topcard
		this.discard.addCard(this.topCard);
		this.topCard = card;
		this.sync();

		//send card query if exists
		const queryProm = new Promise<void>((resolve, reject) => {
			if (card.query !== undefined) {
				console.log("Sending a query request");

				player.socket.emit("queryRequest", card.query);
				player.socket.once("queryResponse", (index: number) => {
					card.onQueryResponse(index);
					this.sync();
					console.log("got a query response");
					resolve();
				});
			} else {
				resolve();
			}
		});

		//Wait for query to resolve
		await queryProm;

		//Apply Card Effects
		const effectProm = new Promise<void>(async (resolve, reject) => {
			const effect = card.getEffect();
			if (effect === undefined) {
				resolve();
				return;
			}

			console.log("Applying card effect");
			await effect.resolve(this);
			resolve();
		});

		//Wait for effects to resolve
		await effectProm;

		console.log(`player '${player.name}' played a card successfully`);

		this.turn += this.playDirection;
		this.sync();

		return true;
	}

	private async start() {
		this.connecting = false;
		console.log(`game started for '${this.code}'`);

		//remove loaded listener for all players
		this.players.forEach((player) => {
			player.socket.removeAllListeners("gameLoaded");
		});

		//Remove gameLoaded event from listenerEvents
		this.listenerEvents = this.listenerEvents.filter(
			(event) => event !== "gameLoaded"
		);

		//Setup new listeners
		this.listenerEvents.push("playRequest");
		this.listenerEvents.push("drawRequest");
		this.players.forEach((player) => {
			player.socket.on("playRequest", async (id: string) => {
				if (player.id !== this.players[this.turn].id) {
					const response: playResponse = {
						success: false,
					};
					player.socket.emit("playResponse", response);
					return;
				}

				const card = this.hands[player.id].find((card) => {
					return card.id === id;
				});

				if (card === undefined) {
					const response: playResponse = {
						success: false,
					};
					player.socket.emit("playResponse", response);
					return;
				}

				const response: playResponse = {
					success: await this.playCard(
						new PlayEvent(this, player, card)
					),
				};

				player.socket.emit("playResponse", response);
			});

			player.socket.on("drawRequest", async () => {
				if (player.id !== this.players[this.turn].id) {
					return;
				}

				const event = new DrawEvent(this, player, 0, true, true, true);
				this.giveCards(event);
			});
		});

		//Deal 7 cards to each player and instantiate statuses
		for (let player of this.players) {
			this.hands[player.id] = [];
			this.statuses[player.id] = [];
			await this.giveCards(new DrawEvent(this, player, 7), false);
			player.socket.emit("handSync", this.hands[player.id]);
		}

		//Select a starting player
		this.turn = Math.floor(Math.random() * this.players.length);

		this.sync();

		this.emitAll("gameStart");
	}
}
