/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import { useTicTacToe } from "../context/gameState";
import { useEffect } from "react";

export default function Board() {
  const navigate = useNavigate();

  const {
    modalType,
    playerName,
    playerSymbol,
    isMyTurn,
    board,
    winner,
    disableBoardUI,
    board_error,

    opponentSymbol,
    opponentConnected,
    matchStatus,
    opponentName,
    TurnComplete,
    terminateMatchCleanup,
  } = useTicTacToe();

  useEffect(() => {
    if (matchStatus === "terminated" || matchStatus === null && opponentConnected === false) {
      if (!winner) {
        navigate("/");
      }
    }
  }, [matchStatus, opponentConnected, winner]);

  useEffect(() => {
    if (winner != null) {
      const timeoutId = setTimeout(() => {
        terminateMatchCleanup();
        navigate("/");
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [winner, navigate, terminateMatchCleanup]);


  const renderCell = (cell, index) => (
    <div
      key={index}
      className={`h-[100px] w-[100px] flex justify-center items-center 
        rounded-md border-2 border-gray-700 text-4xl font-bold cursor-pointer
        transition-all duration-200
        ${(cell === playerSymbol) ? "text-rose-400" : (cell === opponentSymbol) ? "text-sky-400" : "text-gray-500"}
        ${disableBoardUI || winner ? "" : "hover:scale-105 hover:bg-gray-800/30"}
`}

      onClick={() => {
        if (isMyTurn && !disableBoardUI && winner == null) {
          TurnComplete(index);
        }
      }}

    >
      {cell}
    </div>
  );

  const isGameActiveOrComplete = matchStatus === "ongoing" || winner !== null;

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {modalType === "quick" ? (
        isGameActiveOrComplete ? (
          <div className="p-6 rounded-2xl bg-gray-900/70 backdrop-blur-md border border-gray-800 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-center mb-4">
              <div
                className={`px-4 py-1 rounded-full text-sm font-semibold ${isMyTurn && !winner ? "bg-rose-500/20 text-rose-400" : "bg-gray-700/50 text-gray-400"
                  }`}
              >
                {playerName} ({playerSymbol})
              </div>
              <div className="text-gray-500 text-xs">vs</div>
              <div
                className={`px-4 py-1 rounded-full text-sm font-semibold ${!isMyTurn && !winner ? "bg-sky-500/20 text-sky-400" : "bg-gray-700/50 text-gray-400"
                  }`}
              >
                {opponentName} ({opponentSymbol})
              </div>
            </div>

            <div
              className={`grid grid-cols-3 rounded-xl overflow-hidden border-1 gap-1.5 border-gray-700 ${isMyTurn && !winner
                  ? "shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "opacity-80 blur-[0.3px]"
                }`}
            >
              {board.map(renderCell)}
            </div>

            <div className="mt-6 text-center text-lg font-medium">
              {winner ? (
                <div
                  className={`${winner === playerSymbol
                      ? "text-green-400"
                      : winner === "Draw" || winner === "draw"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                >
                  {winner === "draw" ? "It's a draw!" : `${winner} wins!`}
                </div>
              ) : (
                <div
                  className={`${isMyTurn ? "text-rose-400" : "text-gray-500"
                    } animate-pulse`}
                >
                  {board_error !== null ? (
                    <div className="text-red-400">{board_error}</div>
                  ) : opponentConnected ? (
                    <div>{isMyTurn ? "Your turn" : "Waiting for opponent..."}</div>
                  ) : (
                    <div>Connecting...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-lg animate-pulse">
            Waiting for opponent to connect..
          </div>
        )
      ) : modalType === "private" ? (
        <div className="text-gray-300">
          {opponentConnected ? (
            `Opponent: ${opponentName}`
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-500">Share this link to join:</span>
              <div className="bg-gray-800 px-4 py-2 rounded-md text-sm text-blue-400">
                {window.location.origin}/join/{window.location.pathname.split('/').pop()}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500">No Match Type Selected</div>
      )}
    </div>
  );
}