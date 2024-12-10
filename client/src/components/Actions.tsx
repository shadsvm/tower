import { ClientMessage, UnitCosts, UnitType } from "@server/types";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { UseSocket } from "src/hooks/useSocket";

export default function ActionPanel({
  socket,
  selectedUnit,
  setSelectedUnit,
  disabled,
}: {
  socket: UseSocket;
  selectedUnit: UnitType | undefined;
  setSelectedUnit: Dispatch<SetStateAction<UnitType | undefined>>;
  disabled: boolean;
}): ReactNode {
  return (
    <section className="group card flex flex-col gap-6">
      <div className="flex justify-between items-center text-xl">
        {socket?.game?.currentTurn === socket.username
          ? "Your turn!"
          : `Waiting for ${socket?.game?.currentTurn}`}
        <div className="flex justify-center items-center gap-2 mr-8">
          {socket.game?.players[socket.username].points}
          💰
        </div>
      </div>

      <div className="flex justify-between items-center gap-5">
        <button
          onClick={() => {
            console.log("action panel end turn");
            socket.send({ type: ClientMessage.END_TURN });
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
            disabled || socket.game!.players[socket.username].points < cost
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
