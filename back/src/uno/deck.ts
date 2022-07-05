import { Card } from "./cards/card";

export class Deck {
    protected cards: Card[] = [];
    constructor() {}

    public shuffle() {
        const shuffled: Card[] = [];
        while (this.cards.length > 0) {
            const target = Math.floor(Math.random() * this.cards.length);
            shuffled.push(this.cards[target]);
            this.cards.splice(target, 1);
        }

        this.cards = shuffled;
    }

    public draw(): Card | undefined {
        return this.cards.pop();
    }

    public get length(): number {
        return this.cards.length;
    }

    public addCard(card: Card) {
        this.cards.push(card);
    }

    public mergeDecks(deck: Deck) {
        while (deck.length > 0) {
            const drawnCard = deck.draw();
            if (drawnCard !== undefined) {
                this.addCard(drawnCard);
            }
        }
    }
}
