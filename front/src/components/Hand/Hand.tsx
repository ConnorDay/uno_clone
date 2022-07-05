import { UnoCard, cardObject } from "../Card/Card";

type Props = {
    cards: cardObject[];
};
function Hand(props: Props) {
    const { cards } = props;

    //Sort the hand by color first, then value
    cards.sort((a, b) => {
        //Sort by value
        if (a.color === b.color) {
            if (a.value === b.value) return 0;

            return a.value < b.value ? -1 : 1;
        }

        //Make sure "special" cards appear at the end
        if (a.color === "special") return 1;
        if (b.color === "special") return -1;

        //Sort by color
        return a.color < b.color ? -1 : 1;
    });

    return (
        <div>
            {cards.map((card) => {
                return <UnoCard card={card} key={card.id} />;
            })}
        </div>
    );
}
export { Hand };
