import { Card, Color } from "./cards/card";
import { Deck } from "./deck";

export class UnoDeck extends Deck {
    constructor() {
        super();
        this.addNumberCards();
        this.addSpecialCards();
    }

    protected addNumberCards() {
        let colors: Color[] = ["red", "yellow", "green", "blue"];
        colors.forEach((color) => {
            this.cards.push(new Card(color, "0"));

            for (let i = 1; i < 10; i++) {
                this.cards.push(new Card(color, `${i}`));
                this.cards.push(new Card(color, `${i}`));
            }
        });
    }

    protected addSpecialCards() {
        let colors: Color[] = ["red", "yellow", "green", "blue"];
        colors.forEach((color) => {
            ["+2", "skip", "reverse"].forEach((value) => {
                this.cards.push(new Card(color, value));
                this.cards.push(new Card(color, value));
            });
        });

        for (let i = 0; i < 4; i++) {
            this.cards.push(new Card("special", "+4"));
            this.cards.push(new Card("special", "wild"));
        }
    }
}
