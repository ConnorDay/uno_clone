import { Card, Color } from "./cards/card";

export class Deck {
    protected cards: Card[] = [];
    constructor() {
        this.addNumberCards();
        this.addSpecialCards();
    }

    public shuffle() {
        const shuffled: Card[] = [];
        while (this.cards.length > 0) {
            const target = Math.floor(Math.random() * this.cards.length);
            shuffled.push(this.cards[target]);
            this.cards.splice(target, 1);
        }

        this.cards = shuffled;
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
