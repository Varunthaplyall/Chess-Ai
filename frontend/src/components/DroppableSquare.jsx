import React from "react";
import { useDrop } from "react-dnd";
import { Chess } from "chess.js";

const DroppableSquare = ({
  rowIndex,
  colIndex,
  children,
  chess,
  socket,
  gameId,
  isPlayerTurn,
  gameStarted,
  setMoves,
  setBoard,
}) => {
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: "PIECE",
      canDrop: (item) => {
        if (!isPlayerTurn || !gameStarted) return false;

        const from = item.from;
        const to = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
        try {
          const testChess = new Chess(chess.fen());
          const isValid = testChess.move({ from, to }) !== null;
          return isValid;
        } catch (e) {
          console.error("Move validation error:", e);
          return false;
        }
      },
      drop: (item) => {
        const from = item.from;
        const to = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;

        try {
          const move = chess.move({ from, to });
          if (move) {
            setBoard(chess.board());
            socket.emit("makeMove", { gameId, from, to });
            setMoves((prevMoves) => [
              ...prevMoves,
              {
                player: { from, to },
              },
            ]);
            console.log("Move made:", move);
            return { success: true };
          }
        } catch (e) {
          console.error("Move error", e);
        }
        return { success: false };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [chess, isPlayerTurn, gameStarted, gameId]
  );

  return (
    <div
      ref={drop}
      className={`w-[12vw] h-[12vw] max-w-[100px] max-h-[100px] flex justify-center items-center text-2xl font-bold cursor-pointer transition-all relative
      ${
        (rowIndex + colIndex) % 2 === 0
          ? "bg-gray-800/80 hover:bg-gray-800/90"
          : "bg-gray-900/80 hover:bg-gray-900/90"
      }
      ${isOver && canDrop ? "shadow-[inset_0_0_15px_rgba(6,182,212,0.5)]" : ""}
      ${isOver && !canDrop ? "shadow-[inset_0_0_15px_rgba(239,68,68,0.5)]" : ""}
      border border-cyan-400/10`}
    >
      <div
        className={`absolute inset-0 transition-opacity ${
          isOver && canDrop ? "bg-cyan-400/20" : ""
        } ${isOver && !canDrop ? "bg-red-400/20" : ""}`}
      />

      <div className="flex items-center justify-center relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DroppableSquare;
