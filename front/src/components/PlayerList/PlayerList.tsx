type playerInfo = {
    name: string;
    id: string;
};

type Props = {
    players: playerInfo[];
    additional?: (player: playerInfo) => JSX.Element;
};

function PlayerList(props: Props) {
    const { players } = props;
    let { additional } = props;
    if (additional === undefined) {
        additional = (p: playerInfo) => <></>;
    }
    return (
        <div>
            {players.map((player) => {
                return (
                    <p key={player.id}>
                        {player.name} {additional!(player)}
                    </p>
                );
            })}
        </div>
    );
}

export { PlayerList };
