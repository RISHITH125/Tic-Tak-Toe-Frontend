import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { GameProvider } from './context/gameContext'
import Home from './pages/Home'
import Board from './pages/Board'
function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/board' element={<Board/>}/>
        </Routes>
      </Router>
    </GameProvider>
  )
}

export default App
