import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import SinglePlayerBack from './pages/SinglePlayerBack/SinglePlayerBack';
import MultiPlayerFront from './pages/MultiPlayerFront/MultiPlayerFront';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection automatique de "/" vers "/index" */}
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/singleplayerBack" element={<SinglePlayerBack />} />
        <Route path="/multiplayerFront" element={<MultiPlayerFront />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;