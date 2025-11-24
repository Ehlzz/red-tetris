import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import SinglePlayerBack from './pages/SinglePlayerBack/SinglePlayerBack';
import MultiPlayerHome from './pages/MultiPlayerHome/MultiPlayerHome';
import { io } from "socket.io-client";
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/singleplayerBack" element={<SinglePlayerBack socket={socket} />} />
        <Route path="/multiplayer" element={<MultiPlayerHome socket={socket} />} />
        {/* Route pour rejoindre avec roomId et playerName */}
        <Route path="/multiplayer/:roomId/:playerName" element={<MultiPlayerHome socket={socket} />} />
        {/* Route pour rejoindre avec juste le roomId */}
        <Route path="/multiplayer/:roomId" element={<MultiPlayerHome socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;