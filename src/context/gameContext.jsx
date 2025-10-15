import { useContext, useState} from "react";
import { GameContext } from "../utils/gameContext";
import { login } from "../utils/auth";

export const useTicTacToe = () => {
    const context = useContext(GameContext);

    if(!context){
        throw new Error('GameProvider must be used within a GameContext');
    }
    return context;
}

export const GameProvider = ({children}) => {
    const [modalButtonType, setModalButtonType] = useState(null); // "quick" or "private"

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
    const [socket, setSocket] = useState(null);


    

    const value ={
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
        socket,
        modalButtonType,


        setPlayerName,
        setModalButtonType,
    
    }

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider> 
    )
}