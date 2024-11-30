type TurnInfoProps = {
  isMyTurn: boolean;
  currentTurn: string;
  turnNumber: number;
  onEndTurn: () => void;
};

export const TurnInfo = ({
  isMyTurn,
  currentTurn,
  turnNumber,
  onEndTurn,
}: TurnInfoProps) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="text-xl">
        {isMyTurn ? "Your turn!" : `Waiting for ${currentTurn}`}
      </div>
      <div className="text-sm">Turn {turnNumber}</div>
      {isMyTurn && (
        <button onClick={onEndTurn} className="nes-btn is-primary">
          End Turn
        </button>
      )}
    </div>
  );
};
