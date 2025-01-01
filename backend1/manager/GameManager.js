const { Chess } = require("chess.js");
const { spawn } = require("child_process");

class GameManager {
  constructor(id, socketId) {
    this.game = {
      id: id,
      player: socketId,
      ai: "AI",
      status: "waiting",
      turn: "player",
      movesHistory: [],
      chess: new Chess(),
      result: null,
      aiEngine: spawn("/usr/games/stockfish"),
    };
  }

  startGame() {
    if (this.game.status !== "waiting") {
      return { success: false, error: "Game is already started or finished" };
    }
    this.game.status = "ongoing";
    return { success: true, message: "Game started." };
  }

  makeMove(from, to) {
    if (this.game.status !== "ongoing") {
      return { success: false, error: "Game is not ongoing" };
    }
    if (this.game.turn !== "player") {
      return { success: false, error: "It's AI's turn" };
    }

    const move = this.game.chess.move({ from, to });
    if (!move) {
      return { success: false, error: "Invalid move" };
    }

    this.game.movesHistory.push(move.san);
    this.game.turn = "ai";

    if (this.checkGameOver()) {
      return {
        success: true,
        move: move.san,
        gameOver: true,
        message: "Game over!",
      };
    }

    return {
      success: true,
      move: move.san,
      fen: this.game.chess.fen(),
    };
  }

  async aiMove() {
    console.log("AI Move");
    if (this.game.status !== "ongoing") {
      return { success: false, error: "Game is not ongoing" };
    }

    if (this.game.turn !== "ai") {
      return { success: false, error: "It's your turn" };
    }

    try {
      const aiMove = await this.getAiMove();
      const move = this.game.chess.move(aiMove);
      this.game.movesHistory.push(move.san);
      this.game.turn = "player";

      if (this.checkGameOver()) {
        return {
          success: true,
          move: move.san,
          gameOver: true,
          message: "Game over!",
        };
      }
      console.log(`AI Move: ${move.san}`);
      return {
        success: true,
        move: move.san,
        fen: this.game.chess.fen(),
      };
    } catch (error) {
      console.error("Error during AI move:", error);
      return {
        success: false,
        error: `Error during AI move: ${error}`,
      };
    }
  }

  checkGameOver() {
    if (this.game.chess.isGameOver()) {
      this.game.status = "finished";
      this.game.result = "Game Over";
      return true;
    }
    return false;
  }

  getAiMove() {
    return new Promise((resolve, reject) => {
      const engine = this.game.aiEngine;
      let bestMove = null;

      engine.stdin.write("uci\n");
      engine.stdin.write(`position fen ${this.game.chess.fen()}\n`);
      engine.stdin.write("go movetime 2000\n");

      engine.stdout.on("data", (data) => {
        const message = data.toString();
        if (message.includes("bestmove")) {
          bestMove = message.split("bestmove")[1].split("ponder")[0].trim();
          resolve(bestMove);
        }
      });

      engine.on("error", (err) => {
        reject(err);
      });
    });
  }

  getGameStats() {
    return {
      board: this.game.chess.board(),
      moveHistory: this.game.movesHistory,
      turn: this.game.turn,
      status: this.game.status,
      result: this.game.result,
    };
  }
}

module.exports = GameManager;
