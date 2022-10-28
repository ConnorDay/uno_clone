import { Player } from "../player";
import { Room } from "../room";
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

	public deck: UnoDeck = new UnoDeck();
	public discard: Deck = new Deck();

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
			this._turn = this.players.length - 1;
			return;
		}

		if (num >= this.players.length) {
			this._turn = 0;
			return;
		}

		this._turn = num;
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

	public giveCards(playerId: string, numCards: number) {
		for (let i = 0; i < numCards; i++) {
			const toDraw = this.drawCard();
			if (toDraw === undefined) {
				return;
			}

			this.hands[playerId].push(toDraw);
		}
	}

	private playCard(player: Player, card: Card) {
		this.turn += this.playDirection;

		//Remove card from the player's hand
		this.hands[player.id] = this.hands[player.id].filter((hCard) => {
			return hCard.id !== card.id;
		});
		player.socket.emit("handSync", this.hands[player.id]);

		this.discard.addCard(this.topCard);
		this.topCard = card;

		this.sync();

		//Resolve card query
		if (card.query !== undefined) {
			player.socket.emit("queryRequest", card.query);
			player.socket.once("queryResponse", (index: number) => {
				card.onQueryResponse(index);
				this.sync();
			});
		}
	}

	private start() {
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
			player.socket.on("playRequest", (id: string) => {
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

				const canPlay = card.canPlayOn(this.topCard);
				if (!canPlay) {
					const response: playResponse = {
						success: false,
					};
					player.socket.emit("playResponse", response);
					return;
				}

				const response: playResponse = {
					success: true,
				};

				player.socket.emit("playResponse", response);
				this.playCard(player, card);
			});

			player.socket.on("drawRequest", () => {
				if (player.id !== this.players[this.turn].id) {
					return;
				}
				let card = this.drawCard();

				//Repeat until the player draws a card that can be played, or there are no more card to draw
				while (card !== undefined && !card.canPlayOn(this.topCard)) {
					this.hands[player.id].push(card);
					card = this.drawCard();
				}

				player.socket.emit("handSync", this.hands[player.id]);

				if (card !== undefined) {
					this.playCard(player, card);
				}
			});
		});

		//Deal 7 cards to each player
		this.players.forEach((player) => {
			this.hands[player.id] = [];
			this.giveCards(player.id, 7);

			player.socket.emit("handSync", this.hands[player.id]);
		});

		//Select a starting player
		this.turn = Math.floor(Math.random() * this.players.length);

		this.sync();

		this.emitAll("gameStart");
	}
}
