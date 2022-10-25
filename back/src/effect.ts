import { Game } from "./uno";

export abstract class Effect {
    abstract resolve(game: Game): Promise<void>;
}

export class DrawEffect extends Effect {
    private _toDraw: number;
    constructor(num: number) {
        super();

        this._toDraw = num;
    }

    resolve(game: Game): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const target = game.getNextPlayer();
            game.giveCards(target.id, this._toDraw);
            resolve();
        });
    }
}

export class SkipEffect extends Effect {
    resolve(game: Game): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            //We need statuses.
            console.log("skipped :)");
            resolve();
        });
    }
}

export class ReverseEffect extends Effect {
    resolve(game: Game): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            game.playDirection *= -1;
            resolve();
        });
    }
}
