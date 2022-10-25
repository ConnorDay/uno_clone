import { randomUUID } from "crypto";
import { Effect } from "../../effect";

export type Color = "red" | "blue" | "green" | "yellow" | "special";
export type Query = {
    prompt: string;
    options: string[];
};

export class Card {
    public color: Color;
    public value: string;
    public id: string = randomUUID();

    //The query that the game should after the card is played
    protected _query: Query | undefined;

    constructor(color: Color, value: string) {
        this.color = color;
        this.value = value;
    }

    /**
     * Used to reset any metadata on the card before it gets shuffled back into the deck
     */
    public reset(): void {}

    public canPlayOn(card: Card): boolean {
        return card.color === this.color || card.value == this.value;
    }

    public getEffect(): Effect | undefined {
        return;
    }

    public onQueryResponse(index: number): void {}

    public get query(): Query | undefined {
        return this._query;
    }
}
