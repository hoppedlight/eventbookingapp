import React from "react";

const ROWS = 8;
const COLS = 10;

export default function HallMatrix({
  reservedSeats = [],
  selectedSeats = [],
  setSelectedSeats,
}) {

  const isReserved = (row, col) =>
    reservedSeats.some(s => s.row === row && s.column === col);

  const isSelected = (row, col) =>
    selectedSeats.some(s => s.row === row && s.column === col);

  const toggleSeat = (row, col) => {
    if (isReserved(row, col)) return;

    if (isSelected(row, col)) {
      setSelectedSeats(prev =>
        prev.filter(s => !(s.row === row && s.column === col))
      );
    } else {
      setSelectedSeats(prev => [...prev, { row, column: col }]);
    }
  };

  return (
    <div className="space-y-2 mt-8">
      {Array.from({ length: ROWS }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 justify-center">
          {Array.from({ length: COLS }).map((_, colIndex) => {

            const row = rowIndex + 1;
            const col = colIndex + 1;

            const reserved = isReserved(row, col);
            const selected = isSelected(row, col);

            return (
              <div
                key={colIndex}
                onClick={() => toggleSeat(row, col)}
                className={`
                  w-8 h-8 rounded cursor-pointer transition
                  ${
                    reserved
                      ? "bg-gray-600 cursor-not-allowed"
                      : selected
                      ? "bg-green-500"
                      : "bg-[#c89295] hover:bg-[#ea2a33]"
                  }
                `}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
