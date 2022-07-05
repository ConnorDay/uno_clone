import { UnoCard, cardObject } from "../Card/Card";

type Props = {
    cards: cardObject[];
};
function Hand(props: Props) {
    const { cards } = props;

    return (
        <div>
            {cards.map((card) => {
                return <UnoCard card={card} key={card.id} />;
            })}
        </div>
    );
}
export { Hand };
