import { textChangeRangeIsUnchanged } from "typescript";
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

export class Game extends Room {
    private playersConnected: string[] = [];
    private connecting = true;

    private hands: { [key: string]: Card[] } = {};

    private deck: UnoDeck = new UnoDeck();
    private discard: Deck = new Deck();

    private topCard: Card;

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
        this._turn = num % this.players.length;
    }
    public get turn(): number {
        return this._turn;
    }

    private giveCards(playerId: string, numCards: number) {
        for (let i = 0; i < numCards; i++) {
            let toDraw = this.deck.draw();

            //Attempt to shuffle the discard back into the deck
            if (toDraw === undefined) {
                this.deck.mergeDecks(this.discard);
                toDraw = this.deck.draw();

                //No more available cards, just don't do anything
                if (toDraw === undefined) {
                    return;
                }
            }

            this.hands[playerId].push(toDraw);
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
