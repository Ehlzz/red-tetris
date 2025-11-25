import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import SinglePlayer from './pages/SinglePlayer/SinglePlayer';
import MultiPlayerGame from './pages/MultiPlayerGame/MultiPlayerGame';
import NotFound from './pages/noFound/noFound';
import { io } from "socket.io-client";
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
import MultiPlayer from './pages/MultiPlayer/MultiPlayer';
import LobbyGamePage from './pages/LobbyGamePage/LobbyGamePage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/singleplayer" element={<SinglePlayer socket={socket} />} />
        <Route path="/multiplayer" element={<MultiPlayer socket={socket} />} />
        <Route path="/lobby" element={<LobbyGamePage socket={socket}/>} />
        <Route path="/lobby/:roomId/:playerName" element={<LobbyGamePage socket={socket} />} />
        <Route path="/lobby/:roomId" element={<LobbyGamePage socket={socket} />} />
        <Route path="/game/:roomId/:playerName" element={<MultiPlayerGame socket={socket} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;