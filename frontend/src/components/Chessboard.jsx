import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggablePiece from "./DraggablePiece";
import DroppableSquare from "./DroppableSquare";

const Chessboard = ({ gameId, data, socket, onMove, onRestart }) => {
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [moves, setMoves] = useState([]);

  const handleMoveResult = (data) => {
    if (data.success) {
      const newChess = new Chess(data.fen);
      setChess(newChess);
      setBoard(newChess.board());
      setIsPlayerTurn(false);
    }
    if (data.gameOver === true) {
      setGameOver(true);
      setGameOverMessage("You Lost!");
    }
  };

  const handleAiMove = (data) => {
    if (data.gameOver === true) {
      setGameOver(true);
      setGameOverMessage("You won!");
    }

    if (data.success) {
      const oldPosition = chess.fen().split(" ")[0];
      const newPosition = data.fen.split(" ")[0];

      let fromSquare = "";
      let piece = "";

      const oldBoard = oldPosition.split("/");
      const newBoard = newPosition.split("/");

      for (let rank = 0; rank < 8; rank++) {
        let oldFile = 0;
        let newFile = 0;

        while (oldFile < 8 || newFile < 8) {
          const oldChar = oldBoard[rank][oldFile];
          const newChar = newBoard[rank][newFile];

          if (oldChar !== newChar) {
            if (/[pnbrqkPNBRQK]/.test(oldChar)) {
              piece = oldChar;
              fromSquare = `${String.fromCharCode(97 + oldFile)}${8 - rank}`;
            }
          }

          oldFile += /\d/.test(oldChar) ? parseInt(oldChar) : 1;
          newFile += /\d/.test(newChar) ? parseInt(newChar) : 1;
        }
      }

      const newChess = new Chess(data.fen);
      setChess(newChess);
      setBoard(newChess.board());
      setIsPlayerTurn(true);

      const newMove = {
        ai: {
          from: fromSquare,
          to: data.move,
        },
      };

      setMoves((prevMoves) => [...prevMoves, newMove]);
    }
  };

  useEffect(() => {
    if (moves.length > 0) {
      const lastMove = moves[moves.length - 1];
      if (lastMove) {
        onMove(lastMove);
      }
    }
  }, [moves]);

  useEffect(() => {
    if (gameId) {
      const newChess = new Chess();
      setChess(newChess);
      setBoard(newChess.board());
      setGameOver(false);
    }
    if (socket) {
      socket.on("moveResult", handleMoveResult);
      socket.on("aiMove", handleAiMove);
      socket.on("error", (error) => {
        console.error("Error:", error);
      });
    }

    return () => {
      if (socket) {
        socket.off("moveResult", handleMoveResult);
        socket.off("aiMove", handleAiMove);
      }
    };
  }, [gameId, socket]);

  useEffect(() => {
    if (gameId) {
      setGameStarted(true);
      const newChess = new Chess();
      setChess(newChess);
      setBoard(newChess.board());
      setGameOver(false);
      setGameOverMessage("");
      setMoves([]);
      onRestart?.();
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameId]);

  const playerColour = "w";

  const renderBoard = () => {
    return board.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((square, colIndex) => (
          <DroppableSquare
            key={colIndex}
            rowIndex={rowIndex}
            colIndex={colIndex}
            chess={chess}
            socket={socket}
            gameId={gameId}
            isPlayerTurn={isPlayerTurn}
            gameStarted={gameStarted}
            setMoves={setMoves}
            setBoard={setBoard}
            playerColour={playerColour}
          >
            {square && square.type ? (
              <DraggablePiece
                piece={square}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isPlayerTurn={isPlayerTurn}
                gameStarted={gameStarted}
                playerColour={playerColour}
              />
            ) : null}
          </DroppableSquare>
        ))}
      </div>
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative flex flex-col items-center justify-center border-4 border-cyan-400/50 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(6,182,212,0.1)_25%,rgba(6,182,212,0.1)_26%,transparent_27%,transparent_74%,rgba(6,182,212,0.1)_75%,rgba(6,182,212,0.1)_76%,transparent_77%)] bg-[size:50px_50px]" />
        <div className="inline-block relative z-10">{renderBoard()}</div>
        {showMessage && (
          <div className="text-cyan-400 text-4xl font-bold absolute inset-0 flex items-center justify-center animate-pulse bg-gray-900/90 px-6 py-2 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <div className="relative">
              <span className="absolute -inset-1 blur-sm bg-cyan-400/30" />
              <span className="relative">Game Started</span>
            </div>
          </div>
        )}
        {gameOverMessage && (
          <div className="text-cyan-400 text-4xl font-bold absolute inset-0 flex items-center justify-center animate-pulse bg-gray-900/90 px-6 py-2 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <div className="relative">
              <span className="absolute -inset-1 blur-sm bg-cyan-400/30" />
              <span className="relative">{gameOverMessage}</span>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default Chessboard;
