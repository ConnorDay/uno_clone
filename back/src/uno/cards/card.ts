import { randomUUID } from "crypto";

export type Color = "red" | "blue" | "green" | "yellow" | "special";

export class Card {
    public color: Color;
    public value: string;
    public id: string = randomUUID();

    constructor(color: Color, value: string) {
        this.color = color;
        this.value = value;
    }

    public canPlayOn(card: Card): boolean {
        return card.color === this.color || card.value == this.value;
    }
}
