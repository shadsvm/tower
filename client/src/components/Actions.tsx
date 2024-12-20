import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { UnitsIcons, UnitsPrices } from "@server/constant";
import { BuyableUnits, ClientMessage } from "@server/types";
import { Dispatch, ReactNode, SetStateAction } from "react";

export default function ActionPanel({
  buyUnit,
  setBuyUnit,
}: {
  buyUnit: BuyableUnits | undefined;
  setBuyUnit: Dispatch<SetStateAction<BuyableUnits | undefined>>;
}): ReactNode {
  const game = useGameStore(({state}) => state);
  const {send} = useSocketStore();
  const {username} = useUserStore();

  if (game != undefined) return (
        <div className="flex justify-end items-center gap-3">
        {Object.entries(UnitsPrices).map(([unit, cost], index) => (
          <button
            key={index}
            aria-selected={buyUnit == (unit as BuyableUnits)}
            disabled={
               game.players[username].points < cost
            }
            className={
              "btn btn-white text-sm  p-1 transition"
            }
            onClick={() => {
              setBuyUnit(buyUnit ? undefined : unit as BuyableUnits);
            }}
          >
            <div className="flex flex-col justify-evenly items-center p-0">
              <p className="text-2xl">{UnitsIcons[unit as BuyableUnits]}</p>
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
