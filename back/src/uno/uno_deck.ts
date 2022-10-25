import { Card, Color } from "./cards/card";
import { DrawFour, DrawTwo, Reverse, Skip, Wild } from "./cards/special_cards";
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
            [DrawTwo, Skip, Reverse].forEach((cardType) => {
                this.cards.push(new cardType(color));
                this.cards.push(new cardType(color));
            });
        });

        for (let i = 0; i < 4; i++) {
            this.cards.push(new DrawFour());
            this.cards.push(new Wild());
        }
    }
}
