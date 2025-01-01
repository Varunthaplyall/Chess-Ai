import React, { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";
import faChessIcons from "./ChessIcon";

const DraggablePiece = ({ piece, rowIndex, colIndex }) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "PIECE",
    item: { from: `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const iconRef = useRef(null);

  useEffect(() => {
    if (iconRef.current) {
      preview(iconRef.current, { captureDraggingState: true });
    }
  }, [preview]);

  return (
    <div
      ref={drag}
      className={`relative transition-all ${
        isDragging ? "opacity-50 scale-110" : "opacity-100"
      }`}
    >
      <i
        ref={preview}
        className={`${
          faChessIcons[piece.type]
        } transition-transform hover:scale-110`}
        style={{
          color:
            piece.color === "w"
              ? "rgb(226, 232, 240)" // Slate-200 for white pieces
              : "rgb(51, 65, 85)", // Slate-700 for black pieces
          fontSize: "4rem",
          filter: `drop-shadow(0 0 3px ${
            piece.color === "w"
              ? "rgba(6, 182, 212, 0.5)" // Cyan glow for white pieces
              : "rgba(147, 51, 234, 0.5)" // Purple glow for black pieces
          })`,
        }}
      />
    </div>
  );
};

export default DraggablePiece;
