import {useState, useEffect } from "react"
import { useTicTacToe } from "../context/gameContext"
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {buttonFunction} from "../utils/buttonFunction"

function Home() {
    const navigate = useNavigate();

    const [getName, setGetName] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [authError, setAuthError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    const { playerName, setPlayerName, modalButtonType, setModalButtonType } = useTicTacToe();

    // On mount: if there's a stored session, populate playerName from it so
    // we use the session username before attempting login.
    useEffect(() => {
        // Only set from stored session if we don't already have a playerName
        if (playerName) return;
        try {
            const raw = localStorage.getItem('session');
            if (raw) {
                const s = JSON.parse(raw);
                if (s?.username) {
                    setPlayerName(s.username);
                }
            }
        } catch (err) {
            // ignore malformed session but log for debugging
            console.warn('Failed to read stored session', err);
        }
    }, [playerName, setPlayerName]);

    // Keep stored session.username in sync with playerName changes so subsequent
    // attempts will use the updated username.
    useEffect(() => {
        try {
            const raw = localStorage.getItem('session');
            if (raw) {
                const s = JSON.parse(raw);
                if (playerName && s?.username !== playerName) {
                    s.username = playerName;
                    localStorage.setItem('session', JSON.stringify(s));
                }
            }
        } catch (err) {
            // ignore malformed session but log for debugging
            console.warn('Failed to sync session username', err);
        }
    }, [playerName]);

    return (
        <div className="h-[100vh] w-[100vw] flex flex-col gap-10 justify-center items-center bg-gradient-to-b from-gray-900 to-black">
            <Navbar playerName={playerName} />
            <div>Hero</div>

            <div className="flex justify-between w-auto gap-2">
                <button className="w-auto border-2 border-amber-500/60 p-2 rounded-md font-bold bg-amber-600/60 hover:bg-amber-600/80 backdrop-blur-sm transition"
                    onClick={async () => {
                        setAuthError('');
                        if (!playerName) {
                            setModalButtonType("quick");
                            setGetName(true);
                            return;
                        }
                        const res = await buttonFunction("quick", playerName, setGetName, setPlayerName,password);
                        if (res?.status === 'ok') {
                            navigate('/board');
                        } else if (res?.status === 'need_name') {
                            setGetName(true);
                        } else {
                            setAuthError(res?.reason || 'Unknown error');
                        }
                    }}
                >
                    Quick Match
                </button>

                <button className="w-auto border-2 border-blue-400/60 p-2 rounded-md font-bold bg-blue-500/60 hover:bg-blue-500/80 backdrop-blur-sm transition"
                    onClick={async () => {
                        setAuthError('');
                        if (!playerName) {
                            setModalButtonType("private");
                            setGetName(true);
                            return;
                        }
                        const res = await buttonFunction("private", playerName, setGetName, setPlayerName,password);
                        if (res?.status === 'ok') {
                            navigate('/board');
                        } else if (res?.status === 'need_name') {
                            setGetName(true);
                        } else {
                            setAuthError(res?.reason || 'Unknown error');
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
                        onSubmit={async e => {
                            e.preventDefault();
                            setAuthError('');
                            if (!playerName.trim()) {
                                setNameError(true);
                                return;
                            }
                            const res = await buttonFunction(modalButtonType, playerName, setGetName, setPlayerName,password);
                            if (res?.status === 'ok') {
                                setGetName(false);
                                setNameError(false);
                                navigate('/board');
                            } else if (res?.status === 'need_name') {
                                setGetName(true);
                            } else {
                                // keep modal open and show reason
                                setNameError(true);
                                setAuthError(res?.reason || 'Authentication failed');
                            }
                        }}

                    >
                        <h2 className="text-lg font-bold text-center">Enter username and password</h2>
                        <input
                        name="username"
                            type="text"
                            className={`p-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${nameError ? 'ring-2 ring-red-500 ring-inset' : ''}`}
                            value={playerName}
                            placeholder="Enter username"
                            onChange={e => {
                                setPlayerName(e.target.value);
                                if (nameError && e.target.value.trim()) setNameError(false);
                                if (authError) setAuthError('');
                            }}
                        />
                        
                        <input
                            type="password"
                            className={`p-2 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${passwordError ? 'ring-2 ring-red-500 ring-inset' : ''}`}
                            value={password}
                            placeholder="Enter password"
                            onChange={e => {
                                setPassword(e.target.value);
                                if (passwordError && e.target.value.trim()) setPasswordError(false);
                                if (authError) setAuthError('');
                            }}
                        />
                        {authError && <div className="text-red-400 text-sm">{authError}</div>}
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