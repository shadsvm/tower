import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { BuyUnits, ClientMessage, UnitCosts, UnitsIcons } from "@server/types";
import { Dispatch, ReactNode, SetStateAction } from "react";

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

  if (game != undefined) return (
        <div className="flex justify-end items-center gap-3">
        {Object.entries(UnitCosts).map(([unit, cost], index) => (
          <button
            key={index}
            aria-selected={selectedUnit == (unit as BuyUnits)}
            disabled={
               game.players[username].points < cost
            }
            className={
              "btn btn-white text-sm  p-1 transition"
            }
            onClick={() => {
              if (selectedUnit) setSelectedUnit(undefined);
              else setSelectedUnit(unit as BuyUnits);
            }}
          >
            <div className="flex flex-col justify-evenly items-center p-0">
              <p className="text-2xl">{UnitsIcons[unit as BuyUnits]}</p>
              <p className="text-xs">-{cost}$</p>
            </div>
          </button>
        ))}
        <button
          onClick={() => {
            send({ type: ClientMessage.END_TURN });
          }}
          className={
            "btn btn-white text-md"
          }
        >
          <p>End</p>
          <p>Turn</p>
        </button>
        </div>


  );
}
