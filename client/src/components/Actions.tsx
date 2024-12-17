import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { BuyUnits, ClientMessage, UnitCosts } from "@server/types";
import { Dispatch, ReactNode, SetStateAction, useMemo } from "react";

export default function ActionPanel({
  selectedUnit,
  setSelectedUnit,
}: {
  selectedUnit: BuyUnits | undefined;
  setSelectedUnit: Dispatch<SetStateAction<BuyUnits | undefined>>;
}): ReactNode {
  const game = useGameStore(({state}) => state);
  const {send} = useSocketStore();
  const {username} = useUserStore();
  const disabled = useMemo(() => game?.currentTurn !== username, [username,game?.currentTurn])

  if (game != undefined) return (
    <section className="group card flex flex-col gap-6">
      <div className="flex justify-between items-center text-xl">
        <div className={disabled ? 'text-error' : 'text-primary'}>
          {disabled
            ? `Waiting for ${game.currentTurn}`
            : "Your turn!"}
        </div>
        <div className="flex justify-center items-center gap-2 mr-8">
          {game.players[username].points}
          💰
        </div>
      </div>

        {!disabled &&
      <div className="flex justify-start items-center gap-5">
          <button
            onClick={() => {
              send({ type: ClientMessage.END_TURN });
            }}
            disabled={disabled}
            className={
              "btn btn-white"
            }
          >
            🤚 End Turn
          </button>


        {Object.entries(UnitCosts).map(([unit, cost], index) => (
          <button
            key={index}
            aria-selected={selectedUnit == (unit as BuyUnits)}
            disabled={
              disabled || game.players[username].points < cost
            }
            className={
              "btn btn-white aria-selected:bg-green-600  transition"
            }
            onClick={() => {
              if (disabled) return;
              if (selectedUnit) setSelectedUnit(undefined);
              else setSelectedUnit(unit as BuyUnits);
            }}
          >
            <div className="flex justify-evenly items-center">
              <p>{unit}</p>
              <p>{cost}$</p>
            </div>
          </button>
        ))}
      </div>
        }
    </section>
  );
}
