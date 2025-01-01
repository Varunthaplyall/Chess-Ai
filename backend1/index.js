// index.js
const app = require("express")();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const GameManager = require("./manager/GameManager");
const { v4: uuidv4 } = require("uuid");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const activeGames = new Map();

io.on("connection", (socket) => {
  socket.on("playWithAI", (msg) => {
    console.log("Play with AI:", msg);
    try {
      const gameId = uuidv4();
      console.log("New game created:", gameId);
      const gameManager = new GameManager(gameId, socket.id);
      activeGames.set(gameId, gameManager);

      const startResult = gameManager.startGame();
      if (!startResult.success) {
        return socket.emit("error", startResult.error);
      }

      socket.emit("gameStarted", {
        gameId,
        gameStat: gameManager.getGameStats(),
      });
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", "Failed to start game");
    }
  });

  socket.on("makeMove", async (data) => {
    try {
      if (!data) {
        return socket.emit("error", "No move data provided");
      }

      const { gameId, from, to } = data;

      if (!gameId || !from || !to) {
        return socket.emit("error", "Missing required move information");
      }

      const game = activeGames.get(gameId);
      if (!game) {
        return socket.emit("error", "Game not found");
      }

      console.log(`Attempting move from ${from} to ${to}`);

      const playerMoveResult = game.makeMove(from, to);
      if (!playerMoveResult.success) {
        socket.emit("error", playerMoveResult.error);
        return;
      }

      socket.emit("moveResult", playerMoveResult);

      try {
        const aiMoveResult = await game.aiMove();
        if (!aiMoveResult.success) {
          return socket.emit("error", aiMoveResult.error);
        }
        socket.emit("aiMove", aiMoveResult);
      } catch (error) {
        console.error("AI move error:", error);
        socket.emit("error", "AI move failed: " + error.message);
      }
    } catch (error) {
      console.error("Move error:", error);
      socket.emit("error", "An error occurred while processing the move");
    }
  });

  socket.on("disconnect", () => {
    try {
      for (const [gameId, gameManager] of activeGames) {
        if (gameManager.game.player === socket.id) {
          activeGames.delete(gameId);
          console.log(`Game ${gameId} cleaned up on disconnect`);
        }
      }
    } catch (error) {
      console.error("Error during disconnect cleanup:", error);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
