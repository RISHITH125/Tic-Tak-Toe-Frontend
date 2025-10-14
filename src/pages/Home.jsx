import { useEffect, useState } from "react"
import { useTicTacToe } from "../context/gameContext"
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {buttonFunction} from "../utils/buttonFunction"

function Home() {
    const navigate = useNavigate();

    const [getName, setGetName] = useState(false);
    const [nameError, setNameError] = useState(false);

    const { playerName, setPlayerName, modalButtonType, setModalButtonType } = useTicTacToe();

    useEffect(() => {
        const storedName = localStorage.getItem('playerName');
        if (storedName) {
            setPlayerName(storedName);
        }
    }, [playerName, setPlayerName]);

    return (
        <div className="h-[100vh] w-[100vw] flex flex-col gap-10 justify-center items-center bg-gradient-to-b from-gray-900 to-black">
            <Navbar playerName={playerName} />
            <div>Hero</div>

            <div className="flex justify-between w-auto gap-2">
                <button className="w-auto border-2 border-amber-500/60 p-2 rounded-md font-bold bg-amber-600/60 hover:bg-amber-600/80 backdrop-blur-sm transition"
                    onClick={() => {
                        if (!playerName) {
                            setModalButtonType("quick");
                            setGetName(true);
                        } else {
                            buttonFunction("quick", playerName, setGetName);
                            navigate('/board');
                        }
                    }}
                >
                    Quick Match
                </button>

                <button className="w-auto border-2 border-blue-400/60 p-2 rounded-md font-bold bg-blue-500/60 hover:bg-blue-500/80 backdrop-blur-sm transition"
                    onClick={() => {
                        if (!playerName) {
                            setModalButtonType("private");
                            setGetName(true);
                        } else {
                            buttonFunction("private", playerName, setGetName);
                            navigate('/board');
                        }
                    }}
                >
                    Private Room
                </button>
            </div>

            <div>LeaderBoard</div>

            { getName && (
                <div
                    className="absolute top-0 left-0 h-[100vh] w-[100vw] bg-black/99 z-100 flex justify-center items-center"
                    onClick={() => nameError && setNameError(false)}
                >
                    <form
                        className="p-6 rounded-lg flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                        onSubmit={e => {
                            e.preventDefault();
                            if (!playerName.trim()) {
                                setNameError(true);
                            } else {
                                setGetName(false);
                                localStorage.setItem('playerName', playerName);
                                setNameError(false);
                                buttonFunction(modalButtonType, playerName, setGetName);
                                navigate('/board');
                            }
                        }}
                    >
                        <h2 className="text-lg font-bold text-center">Enter your name</h2>
                        <input
                            type="text"
                            className={`p-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${nameError ? 'ring-2 ring-red-500 ring-inset' : ''}`}
                            value={playerName}
                            onChange={(e) => {
                                setPlayerName(e.target.value);
                                if (nameError && e.target.value.trim()) setNameError(false);
                            }}
                            placeholder="Enter username"
                        />
                        <button
                            type="submit"
                            className="border-2 border-green-400/60 p-2 rounded-md font-bold bg-green-500/60 hover:bg-green-500/80 backdrop-blur-sm transition"
                        >
                            Start Game
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
export default Home