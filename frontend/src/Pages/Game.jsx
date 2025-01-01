import React, { useEffect, useState } from "react";
import { Shield, Sword, RotateCw } from "lucide-react";
import Chessboard from "../components/Chessboard";
import UseSocket from "../../hooks/UseSocket";

const Game = () => {
  const [gameId, setGameId] = useState(null);
  const [data, setData] = useState(null);
  const [gameStatus, setGameStatus] = useState("idle");
  const socket = UseSocket("http://localhost:3000");
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("gameStarted", (data) => {
      setData(data.gameStat.board);
      setGameId(data.gameId);
      setGameStatus("active");
    });

    socket.on("error", (error) => {
      console.error("Error:", error);
      setGameStatus("idle");
    });

    return () => {
      socket.off("gameStarted");
      socket.off("error");
    };
  }, [socket]);

  const handleClick = () => {
    setGameStatus("starting");
    const timer = setTimeout(() => {
      socket.emit("playWithAI", "test");
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleMoves = (data) => {
    setMoves((prevMoves) => [...prevMoves, data]);
  };

  const handleRestart = () => {
    setGameStatus("idle");
    setMoves([]);
    setGameId(null);
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gray-800  p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto flex items-start gap-8 relative z-10">
        <div className="flex-1 p-4 flex justify-center items-center">
          <div className="relative">
            <Chessboard
              gameId={gameId}
              data={data}
              onMove={handleMoves}
              socket={socket}
              onRestart={() => setMoves([])}
            />
          </div>
        </div>

        <div className="w-96 bg-gray-900 rounded-lg border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <div className="p-6 space-y-4">
            <button
              className={`w-full relative group ${
                gameStatus === "idle"
                  ? "bg-cyan-500 hover:bg-cyan-400"
                  : "bg-gray-700 cursor-not-allowed"
              } text-white font-bold py-3 px-4 rounded transition-all duration-300`}
              onClick={handleClick}
              disabled={gameStatus !== "idle"}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 group-hover:translate-x-full duration-1000 transform transition-transform" />
              <span className="relative flex items-center justify-center gap-2">
                {gameStatus === "starting" ? (
                  <RotateCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Sword className="w-5 h-5" />
                )}
                {gameStatus === "idle" ? "Play vs AI" : "Game in Progress"}
              </span>
            </button>

            {gameStatus === "active" && (
              <div className="flex justify-between items-center text-cyan-400 border border-cyan-400/20 rounded-lg p-3">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 hover:text-cyan-300 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                  Restart
                </button>
              </div>
            )}
          </div>

          <div className="px-4 py-4">
            <div className="border border-cyan-400/20 rounded-lg overflow-hidden">
              <div className="border-b border-cyan-400/20 p-3 bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">
                    Move History
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-cyan-400/20 scrollbar-track-gray-800/50">
                {moves.map((move, index) => (
                  <div
                    key={index}
                    className="text-gray-300 text-sm break-words border-b border-cyan-400/10 py-2 px-3 hover:bg-cyan-400/5 transition-colors"
                  >
                    <span className="mr-4 font-mono text-cyan-400">
                      {(index + 1).toString().padStart(2, "0")}.
                    </span>
                    <span className="font-medium">
                      {move.player ? (
                        <span className="text-white">
                          {move.player.from} → {move.player.to}
                        </span>
                      ) : (
                        <span className="text-cyan-400">
                          {move.ai.from} → {move.ai.to}
                        </span>
                      )}
                    </span>
                  </div>
                ))}

                {moves.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    No moves yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
