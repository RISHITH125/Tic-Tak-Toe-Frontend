import { createContext, useContext } from "react";
export const GameContext = createContext();

export const useTicTacToe = () => {
    const context = useContext(GameContext);

    if(!context){
        throw new Error('GameProvider must be used within a GameContext');
    }
    return context;
}