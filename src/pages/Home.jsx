import { useState ,useEffect} from "react";
import { useTicTacToe } from "../context/gameState";
import { useNavigate } from "react-router-dom";
import "../index.css"
function Home() {
  const navigate = useNavigate();

  const [nameError, setNameError] = useState(false);
  const [authError, setAuthError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const {
    playerName,
    setPlayerName,
    modalType,
    startMatch,
    modalOpen,
    leaderboard,
    setModalOpen,
  } = useTicTacToe();

  useEffect(()=>{
    const session = JSON.parse(localStorage.getItem("session"));
    setPlayerName(session?.username || "")
  },[setPlayerName])

 
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white relative overflow-hidden">
      {/* Ambient gradient glow */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-rose-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-sky-600/20 blur-[120px] rounded-full animate-pulse"></div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-6xl font-extrabold tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          TIC-TAC-TOE
        </h1>
        <p className="text-gray-400 text-lg mt-2 font-light tracking-widest">
          Enter the Grid
        </p>
      </div>

      {/* Player Info */}
      {playerName && (
      <div className="text-xl text-gray-300 mb-8">
        Username:{" "}
        <span className="text-amber-400 font-semibold">
          {playerName || ""}
        </span>
      </div>
      )}

      {/* Buttons */}
      <div className="flex justify-center gap-6 mb-12 z-10">
        <button
          className="px-8 py-3 border-2 border-amber-500/60 font-bold rounded-lg bg-amber-600/60 hover:bg-amber-600/80 text-white shadow-[0_0_10px_rgba(255,200,100,0.3)] hover:shadow-[0_0_20px_rgba(255,200,100,0.5)] transition-all duration-300"
          onClick={async () => {
            setAuthError("");
            const res = await startMatch("quick");
            if (res?.status === "ok") {
              navigate("/board");
            } else if (res?.status === "need_name") {
              setModalOpen(true);
            } else {
              setAuthError(res?.reason || "Unknown error");
            }
          }}
        >
          Quick Match
        </button>

        {/* Private button commented out but styled in case you re-enable it */}
        {/* <button
          className="px-8 py-3 border-2 border-blue-400/60 font-bold rounded-lg bg-blue-500/60 hover:bg-blue-500/80 text-white shadow-[0_0_10px_rgba(100,180,255,0.3)] hover:shadow-[0_0_20px_rgba(100,180,255,0.5)] transition-all duration-300"
          onClick={async () => {
            setAuthError('');
            const res = await startMatch('private');
            if (res?.status === 'ok') {
              navigate('/board');
            } else if (res?.status === 'need_name') {
              setModalOpen(true);
            } else {
              setAuthError(res?.reason || 'Unknown error');
            }
          }}
        >
          Private Room
        </button> */}
      </div>

      {/* Leaderboard placeholder */}
            {/* Leaderboard */}
      <div 
        // id="leaderboard-scroll"
        className="relative
    overflow-y-auto 
    max-h-[40vh]
    mt-6 w-[90%] sm:w-[600px]
    bg-gray-900/50 border border-gray-700 rounded-xl 
    p-4 backdrop-blur-md 
    shadow-[0_0_25px_rgba(255,255,255,0.1)]
    scroll-smooth
    touch-pan-y
      "
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(100 116 139 / 0.6) transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.scrollbarColor = 'rgb(100 116 139 / 0.9) transparent';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.scrollbarColor = 'rgb(100 116 139 / 0.6) transparent';
          }}

      >
         <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
        <h2 className="text-2xl font-bold text-center mb-4 text-amber-400 drop-shadow-[0_0_8px_rgba(255,200,100,0.5)]">
          Leaderboard
        </h2>

        {!leaderboard ? (
          <div className="text-gray-500 text-center italic py-4 animate-pulse">
            Loading leaderboard...
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="grid grid-cols-5 text-sm sm:text-base font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-2">
              <div className="text-center">Rank</div>
              <div className="col-span-2 text-center">Username</div>
              <div className="text-center">Wins</div>
              <div className="text-center">Points</div>
            </div>

            {/* Top players */}
            {leaderboard.length > 0 ? (
              leaderboard.map((player, index) => {
                const isCurrentUser = player.username === playerName;
                return (
                  <div
                    key={player._id}
                    className={`grid grid-cols-5 text-sm sm:text-base text-center py-2 rounded-lg transition-all duration-200 ${
                      isCurrentUser
                        ? "bg-amber-600/40 border border-amber-400/40 text-white font-bold shadow-[0_0_10px_rgba(255,200,100,0.3)]"
                        : "hover:bg-gray-800/60"
                    }`}
                  >
                    <div>{index + 1}</div>
                    <div className="col-span-2 truncate">{player.username}</div>
                    <div>{player.wins}</div>
                    <div>{player.totalPoints}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-center italic py-2">
                No players yet
              </div>
            )}

            {/* Separator for authenticated user not in top 10 */}
            {leaderboard?.userRating &&
              !leaderboard.topPlayers.some(
                (p) => p.username === playerName
              ) && (
                <>
                  <div className="my-3 border-t border-gray-700 opacity-40"></div>
                  <div
                    className="grid grid-cols-5 text-sm sm:text-base text-center py-2 rounded-lg bg-emerald-600/40 border border-emerald-400/40 text-white font-bold shadow-[0_0_10px_rgba(100,255,150,0.3)]"
                  >
                    <div>{leaderboard.userRating.rank}</div>
                    <div className="col-span-2 truncate">
                      {leaderboard.userRating.username}
                    </div>
                    <div>{leaderboard.userRating.wins}</div>
                    <div>{leaderboard.userRating.totalPoints}</div>
                  </div>
                </>
              )}
          </div>
        )}
      </div>


      {/* Auth Modal */}
      {modalOpen && (
        <div
          className="absolute top-0 left-0 h-full w-full bg-black/95 backdrop-blur-md flex justify-center items-center z-80"
          onClick={() => nameError && setNameError(false)}
        >
          <form
            className="bg-gray-900/80 border border-gray-700 p-8 rounded-2xl flex flex-col gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] w-[90%] sm:w-[400px]"
            onClick={(e) => e.stopPropagation()}
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError("");
              if (!playerName.trim()) {
                setNameError(true);
                return;
              }
              const res = await startMatch(modalType, { password });
              if (res?.status === "ok") {
                setModalOpen(false);
                setNameError(false);
                navigate("/board");
              } else if (res?.status === "need_name") {
                setModalOpen(true);
              } else {
                setNameError(true);
                setAuthError(res?.reason || "Authentication failed");
              }
            }}
          >
            <h2 className="text-2xl font-semibold text-center text-white mb-2">
              Enter Username & Password
            </h2>
            <input
              name="username"
              type="text"
              className={`p-3 rounded-md bg-gray-800/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                nameError ? "ring-2 ring-red-500 ring-inset" : ""
              }`}
              value={playerName}
              placeholder="Username"
              onChange={(e) => {
                setPlayerName(e.target.value);
                if (nameError && e.target.value.trim()) setNameError(false);
                if (authError) setAuthError("");
              }}
            />
            <input
              type="password"
              className={`p-3 rounded-md bg-gray-800/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                passwordError ? "ring-2 ring-red-500 ring-inset" : ""
              }`}
              value={password}
              placeholder="Password"
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError && e.target.value.trim())
                  setPasswordError(false);
                if (authError) setAuthError("");
              }}
            />
            {authError && (
              <div className="text-red-400 text-sm text-center">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="mt-2 border-2 border-emerald-400/60 p-3 rounded-md font-bold bg-emerald-500/60 hover:bg-emerald-500/80 text-white shadow-[0_0_10px_rgba(100,255,150,0.3)] hover:shadow-[0_0_20px_rgba(100,255,150,0.5)] transition-all duration-300"
            >
              Start Game
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;
