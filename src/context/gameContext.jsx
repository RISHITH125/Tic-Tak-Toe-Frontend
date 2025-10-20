import { useState, useEffect, useRef, useCallback } from "react";
import { buttonFunction } from "../utils/buttonFunction";
import { GameContext } from "./gameState";
import { io } from "socket.io-client";
import { quickMatch } from "../utils/serverutils";
import { getLeaderboard } from "../utils/serverutils";

const API_URL = import.meta.env.VITE_SERVER_HOST || "http://localhost:3000";

export const GameProvider = ({ children }) => {
    // board state
    const [modalType, setModalType] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // player and game state
    const [roomId, setRoomId] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [opponentSymbol, setOpponentSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [winner, setWinner] = useState(null);
    const [opponentConnected, setOpponentConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);
    const [disableBoardUI, setDisableBoardUI] = useState(true);
    const [matchStatus, setMatchStatus] = useState(null);
    const [opponentName, setOpponentName] = useState('');
    const [board_error, setBoard_Error] = useState(null); // <-- Keep this state
    const [leaderboard, setLeaderboard] = useState(null);



    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard(session);
                setLeaderboard(data.leaderboard);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };
        fetchLeaderboard();
        const intervalId = setInterval(fetchLeaderboard, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const socketRef = useRef(null);

    // FIX 1: Retrieve player symbol only once and don't create an infinite loop.
    useEffect(() => {
        const storedSymbol = localStorage.getItem('playerSymbol');
        if (playerSymbol === null && storedSymbol) {
            setPlayerSymbol(storedSymbol);
        }
    }, [playerSymbol]);

    // --- FIX 1: Enhanced Cleanup Function ---
    const terminateMatchCleanup = useCallback(() => {
        setMatchStatus(null); // Reset match status completely
        setOpponentConnected(false);
        setIsMyTurn(false);
        setBoard(Array(9).fill(null));
        setOpponentName(''); // Reset to empty string, not null
        setPlayerSymbol(null);

        // --- CRITICAL RESETTED STATES ---
        setRoomId(null);
        setWinner(null);
        setError(null); // Clear main errors
        setBoard_Error(null); // Clear board specific errors
        setLoading(false);
        // --------------------------------

        try {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            localStorage.removeItem('playerSymbol');
        } catch (e) {
            console.warn('Error disconnecting socket during cleanup', e);
        }
    }, []);

    // FIX 2: wrap the listener in useCallback so it always gets the latest state 
    // or, as a simpler method here, read the key variable from localStorage for safety.
    const attachSocketListeners = useCallback((sock) => {
        if (!sock) return;

        sock.on('connect', () => {
            // console.log('socket connected', sock.id);
        });

        sock.on('connect_error', (err) => {
            console.error('socket connect_error', err);
            // Optionally call cleanup on connection error to reset state
            terminateMatchCleanup();
        });

        sock.on('match_found', (payload) => {
            setOpponentConnected(true);
            const playersMap = payload.playersMap;
            const opponent = Object.keys(playersMap).find(name => name !== playerName);
            setOpponentName(opponent);
            setMatchStatus('ongoing');
            setRoomId(payload.roomId);
        });

        sock.on('symbol_assigned', (payload) => {
            setPlayerSymbol(payload.symbol);
            localStorage.setItem('playerSymbol', payload.symbol);
            if (payload.symbol === 'X') {
                setIsMyTurn(true);
                setDisableBoardUI(false);
            }
            setOpponentSymbol(payload.symbol === 'X' ? 'O' : 'X');
        });

        sock.on('game_start', () => {
            // Board UI enabled only if it's the player's turn, which is set in symbol_assigned 
            console.log('Game started');
        });

        // FIX 3: Reworked logic inside move_made for reliable turn switching
        sock.on('move_made', (payload) => {
            try {
                if (payload.gameState?.board && Array.isArray(payload.gameState.board)) {
                    setBoard(payload.gameState.board.slice());
                    const currentTurnSymbol = payload.gameState.currentTurn;

                    const localPlayerSymbol = localStorage.getItem('playerSymbol');

                    if (localPlayerSymbol === currentTurnSymbol) {
                        setIsMyTurn(true);
                        setDisableBoardUI(false); // <--- Enable board when it's our turn
                    } else {
                        setIsMyTurn(false);
                        setDisableBoardUI(true); // <--- Disable board when it's opponent's turn
                    }
                } else if (payload?.position != null && payload?.symbol) {
                    // Fallback logic for board update if gameState isn't sent
                    setBoard(prev => {
                        const next = prev.slice();
                        next[payload.position] = payload.symbol;
                        return next;
                    });
                    // Since this is the opponent's move, it must now be our turn
                    setIsMyTurn(true);
                    setDisableBoardUI(false);
                }
            } catch (err) {
                console.warn('error handling move_made', err);
            }
        });

        // --- Client-Side Error Handling for Invalid Move ---
        sock.on("error", (payload) => {
            // Check if the error is the structured JSON we expect from the server
            try {
                if (payload.flag === "invalid_move") { // Note the capitalization matching your server's throw
                    // re-enable board UI for player to try again
                    setIsMyTurn(true);
                    setDisableBoardUI(false);
                    setBoard_Error(payload.message || "Invalid move");
                    setTimeout(() => {
                        setBoard_Error(null);
                    }, 2000);
                } else {
                    // Handle general/unstructured errors
                    setError(payload.message || "An unexpected error occurred.");
                }
            } catch (e) {
                // If it wasn't a JSON string, treat it as a general error
                console.warn('Unstructured error received', e);
            }
        });

        sock.on("game_over", (payload) => {
            // update the board one last time
            try {
                if (payload.gameState?.board && Array.isArray(payload.gameState.board)) {
                    setBoard(payload.gameState.board.slice());
                }
            } catch (err) {
                console.warn('error handling game_over', err);
            }

            setWinner(payload.winner);
            setDisableBoardUI(true);
            setMatchStatus('completed');
            // DO NOT call terminateMatchCleanup here. 
            // The socket disconnect (which triggers cleanup) should happen only after 
            // the user clicks to leave or when the server tears down the room/disconnects the socket.
        })

        sock.on('match_terminated', () => {
            setMatchStatus("terminated");
            terminateMatchCleanup();
        });
    }, [playerName, terminateMatchCleanup]);

    const TurnComplete = (index) => {
        setIsMyTurn(false);
        setDisableBoardUI(true);
        socketRef.current.emit('player_move', { roomId, index });
    }

    const gameOver = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        } else {
            terminateMatchCleanup();
        }
    }





    const startMatch =
        async (type, options = {}) => {
            setError(null);
            setWinner(null);
            setBoard_Error(null);

            setModalType(type);
            setLoading(true);
            setDisableBoardUI(true);
            const password = options.password || '';
            try {
                const res = await buttonFunction(type, playerName, setModalOpen, setPlayerName, password, setSession);
                // buttonFunction will call setModalOpen(true) when it needs a username
                setMatchStatus("finding_opponent");
                if (res?.status === 'need_name') {
                    setModalOpen(true);
                }

                const session = res?.session || null;
                const sessionToken = session?.token || null;

                try {
                    if (sessionToken && !socketRef.current) {
                        socketRef.current = io(API_URL, { auth: { token: sessionToken } });
                        // attach persistent listeners for this socket
                        attachSocketListeners(socketRef.current);
                    }
                    else if (sessionToken) {
                        return { status: 'notok', reason: 'socket_already_connected' };
                    }
                    setLoading(false);
                    let Match = null;
                    if (type === 'quick') {
                        Match = await quickMatch(session);
                    }
                } catch (err) {
                    console.error('Socket connection error', err);
                }

                return res;
            } catch (err) {
                console.error('startMatch error', err);
                return { status: 'notok', reason: err?.message || 'startMatch_exception' };
            }
        }




    const value = {
        // state
        roomId,
        playerName,
        playerSymbol,
        isMyTurn,
        board,
        winner,
        opponentConnected,
        loading,
        error,
        session,
        modalType,
        modalOpen,
        opponentName,
        socket: socketRef.current,
        disableBoardUI,
        matchStatus,
        opponentSymbol,
        board_error,
        leaderboard,

        // setters
        setPlayerName,
        setModalType,
        setSession,
        setIsMyTurn,
        setRoomId,
        setPlayerSymbol,
        setBoard,
        setWinner,
        setOpponentConnected,
        setLoading,
        setError,
        setOpponentName,
        setModalOpen,
        // --- ADDED SETTER FOR EXPLICIT CLEARANCE IF NEEDED ---
        setBoard_Error,

        TurnComplete,
        // helpers
        startMatch,
        gameOver,
        terminateMatchCleanup,

    };

    // cleanup listeners and socket when user navigates using browser back/forward or unloads
    useEffect(() => {
        const onPopState = () => {
            terminateMatchCleanup();
        };
        const onBeforeUnload = () => {
            terminateMatchCleanup();
        };
        window.addEventListener('popstate', onPopState);
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('popstate', onPopState);
            window.removeEventListener('beforeunload', onBeforeUnload);
            // ensure socket is disconnected on provider unmount
            try {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            } catch (e) {
                console.warn('Error disconnecting socket on unmount', e);
            }
        };
    }, [terminateMatchCleanup]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}