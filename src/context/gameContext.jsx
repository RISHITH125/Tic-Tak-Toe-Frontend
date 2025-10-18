import { useState, useEffect, useRef, useCallback } from "react";
import { buttonFunction } from "../utils/buttonFunction";
import { GameContext } from "./gameState";
import { io } from "socket.io-client";
import { quickMatch } from "../utils/serverutils";

const API_URL = import.meta.env.VITE_SERVER_HOST || "http://localhost:3000";

export const GameProvider = ({ children }) => {
    // board state
    const [modalType, setModalType] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // player and game state
    const [roomId, setRoomId] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [opponentConnected, setOpponentConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);
    const [disableBoardUI, setDisableBoardUI] = useState(true);
    const [matchStatus, setMatchStatus] = useState(null);

    const socketRef = useRef(null);

    // opponet  state
    const [opponentName, setOpponentName] = useState('');




    const terminateMatchCleanup = useCallback(() => {
        setMatchStatus('terminated');
        setOpponentConnected(false);
        setIsMyTurn(false);
        setBoard(Array(9).fill(null));
        setOpponentName(null);
        setPlayerSymbol(null);
        try {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        } catch (e) {
            console.warn('Error disconnecting socket during cleanup', e);
        }
    }, [setMatchStatus, setOpponentConnected, setIsMyTurn, setBoard, setOpponentName, setPlayerSymbol]);

    const startMatch =
        async (type, options = {}) => {
            // ensure modalType is current
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
                    }
                    else {
                        return { status: 'notok', reason: 'socket_already_connected' };
                    }
                    setLoading(false);
                    let Match = null;
                    if (type === 'quick') {
                        Match = await quickMatch(session);
                        if (Match?.status === 'success') {
                            socketRef.current.on('match_found', (payload) => {
                                setOpponentConnected(true);
                                const playersMap = payload.playersMap;
                                const opponent = Object.keys(playersMap).find(name => name !== playerName)
                                setOpponentName(opponent);
                                setMatchStatus('ongoing');
                            });
                            socketRef.current.on('symbol_assigned', (payload) => {
                                setPlayerSymbol(payload.symbol);
                                if (payload.symbol === 'X') {
                                    setIsMyTurn(true);
                                }
                            });
                            socketRef.current.on('game_start', () => {
                                setDisableBoardUI(false);
                            });
                            socketRef.current.on('match_terminated', () => {
                                // centralize cleanup
                                terminateMatchCleanup();
                            });
                        }
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
        isDraw,
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

        // setters
        setPlayerName,
        setModalType,
        setSession,
        setIsMyTurn,
        setRoomId,
        setPlayerSymbol,
        setBoard,
        setWinner,
        setIsDraw,
        setOpponentConnected,
        setLoading,
        setError,
        setOpponentName,
        setModalOpen,


        // helpers
        // startMatch centralizes the flow: set modal type, attempt auth/session
        // caller can await the result and navigate on success
        startMatch
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