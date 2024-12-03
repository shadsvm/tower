import { Dispatch, SetStateAction } from "react";
import { UseSocket } from "src/hooks/useSocket";
import { ClientMessage, UnitCosts, UnitType } from "@shared/types";

export const ActionPanel = ({
  socket,
  selectedUnit,
  setSelectedUnit,
  disabled,
}: {
  socket: UseSocket;
  selectedUnit: UnitType | undefined;
  setSelectedUnit: Dispatch<SetStateAction<UnitType | undefined>>;
  disabled: boolean;
}) => {
  return (
    <div className="group flex items-center gap-5 p-4 flex-1">
      <div className="flex justify-center items-center mr-8">
        {socket.game?.players[socket.username].points}
        <i className="nes-icon coin "></i>
      </div>

      <button
        onClick={() => {
          console.log("action panel end turn");
          socket.send({ type: ClientMessage.END_TURN });
        }}
        disabled={disabled}
        className={
          "px-4 py-2.5 border ring ring-gray-700 ring-offset-4 border-gray-300 disabled:bg-gray-500/50 disabled:cursor-default aria-selected:bg-green-500 bg-blue-400/90 transition"
        }
      >
        End Turn
      </button>
      {Object.entries(UnitCosts).map(([unit, cost], index) => (
        <button
          key={index}
          aria-selected={selectedUnit == (unit as UnitType)}
          disabled={
            disabled || socket.game!.players[socket.username].points < cost
          }
          className={
            "px-4 py-2 border flex items-center justify-center gap-6 ring ring-gray-700 ring-offset-4 border-gray-300 disabled:bg-gray-500/50 disabled:cursor-default aria-selected:bg-green-500 bg-blue-400/90 transition"
          }
          onClick={() => {
            if (disabled) return;
            if (selectedUnit) setSelectedUnit(undefined);
            else setSelectedUnit(unit as UnitType);
          }}
        >
          <div className="text-2xl">{unit}</div>
          <div>
            {cost}
            <i className="nes-icon coin is-small"></i>
          </div>
        </button>
      ))}
    </div>
  );
};
