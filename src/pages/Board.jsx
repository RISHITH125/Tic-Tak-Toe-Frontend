import { useNavigate } from "react-router-dom";
import { useTicTacToe } from "../context/gameState"
import { useEffect } from "react";
export default function Board() {

  const navigate = useNavigate();

  const {
          modalType, 
          playerName,
          session,
          roomId,
          playerSymbol,
          isMyTurn,
          board,
          winner,
          isDraw,
          opponentConnected,
          loading,
          error,
          matchStatus,
          opponentName,
          setIsMyTurn,


          } = useTicTacToe();

  useEffect(() => {
    if(matchStatus==='terminated'){
      navigate('/');
    }
  }, [matchStatus]);






  return (<div className='h-[100vh] w-[100vw] content-center text-center text-3xl  bg-gradient-to-b from-gray-900 to-black'>
        {
          modalType === 'quick' ? 
          <div>
              {opponentConnected ? `Opponent: ${opponentName}` : 'Waiting for opponent to connect...'}
          </div>: 
          modalType === 'private' ? 
          <div>
            {opponentConnected ? `Opponent: ${opponentName}` : 'link to join the game'}
          </div>:            
          <div>No Match Type Selected</div>
        }

    </div>)
}
