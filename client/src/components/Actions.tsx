import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { ClientMessage, UnitCosts, UnitType } from "@server/types";
import { Dispatch, ReactNode, SetStateAction } from "react";

export default function ActionPanel({
  selectedUnit,
  setSelectedUnit,
  disabled,
}: {
  selectedUnit: UnitType | undefined;
  setSelectedUnit: Dispatch<SetStateAction<UnitType | undefined>>;
  disabled: boolean;
}): ReactNode {
  const game = useGameStore(({game}) => game);
  const send = useSocketStore(({send}) => send);
  const username = useUserStore(({username}) => username);

  return (
    <section className="group card flex flex-col gap-6">
      <div className="flex justify-between items-center text-xl">
        {disabled
          ? "Your turn!"
          : `Waiting for ${game?.currentTurn}`}
        <div className="flex justify-center items-center gap-2 mr-8">
          {game?.players[username].points}
          💰
        </div>
      </div>

      <div className="flex justify-between items-center gap-5">
        <button
          onClick={() => {
            console.log("action panel end turn");
            send({ type: ClientMessage.END_TURN });
          }}
          disabled={disabled}
          className={
            "btn btn-white"
          }
        >
          🤚 End Turn
        </button>
        <div className="flex justify-between items-center gap-5">

      {Object.entries(UnitCosts).map(([unit, cost], index) => (
        <button
          key={index}
          aria-selected={selectedUnit == (unit as UnitType)}
          disabled={
            disabled || game!.players[username].points < cost
          }
          className={
            "btn btn-white aria-selected:bg-green-600  transition"
          }
          onClick={() => {
            if (disabled) return;
            if (selectedUnit) setSelectedUnit(undefined);
            else setSelectedUnit(unit as UnitType);
          }}
        >
          <div className="flex justify-evenly items-center">
            <p>{unit}</p>
            <p>{cost}$</p>

          </div>
        </button>
      ))}
      </div>
      </div>
    </section>
  );
}
