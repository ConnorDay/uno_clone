import { Game } from "..";
import { DrawEffect, Effect, ReverseEffect, SkipEffect } from "../../effect";
import { Card, Color } from "./card";

export class DrawTwo extends Card {
	constructor(color: Color) {
		super(color, "+2");
	}

	public getEffect(): Effect | undefined {
		return new DrawEffect(this.value, 2);
	}
}

export class Skip extends Card {
	constructor(color: Color) {
		super(color, "skip");
	}

	public getEffect(): Effect | undefined {
		return new SkipEffect();
	}
}

export class Reverse extends Card {
	constructor(color: Color) {
		super(color, "reverse");
	}

	public getEffect(): Effect | undefined {
		return new ReverseEffect();
	}
}

export class Wild extends Card {
	constructor() {
		super("special", "wild");
	}

	protected _query = {
		prompt: "Choose a color",
		options: ["red", "blue", "green", "yellow"],
	};

	public canPlayOn(card: Card): boolean {
		//Wilds can be played on anything
		return true;
	}

	public reset(): void {
		this.color = "special";
	}

	public onQueryResponse(index: number): void {
		this.color = this.query!.options[index] as Color;
	}
}

export class DrawFour extends Wild {
	constructor() {
		super();
		this.value = "+4";
	}

	public getEffect(): Effect | undefined {
		return new DrawEffect(this.value, 4);
	}
}
