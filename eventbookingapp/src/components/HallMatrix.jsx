import React, { useState } from "react";

const ROWS = 8;
const COLS = 12;

const bookedSeats = ["2-5", "3-6", "4-7"];

const HallMatrix = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (row, col) => {
    const seatId = `${row + 1}-${col + 1}`;

    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatStatus = (row, col) => {
    const seatId = `${row + 1}-${col + 1}`;

    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hall Seats</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 40px)`,
          gap: "8px",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: ROWS }).map((_, row) =>
          Array.from({ length: COLS }).map((_, col) => {
            const status = getSeatStatus(row, col);

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => toggleSeat(row, col)}
                style={{
                  width: 40,
                  height: 30,
                  borderRadius: 4,
                  cursor: status === "booked" ? "not-allowed" : "pointer",
                  backgroundColor:
                    status === "booked"
                      ? "#555"
                      : status === "selected"
                      ? "#4CAF50"
                      : "#ddd",
                  border: "1px solid #999",
                }}
                title={`Seat ${row}-${col}`}
              />
            );
          })
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Selected Seats:</strong> {selectedSeats.join(", ") || "None"}
      </div>
    </div>
  );
};

export default HallMatrix;
