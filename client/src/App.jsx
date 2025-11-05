import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import SinglePlayerPage from './pages/SinglePlayerPage/SinglePlayerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection automatique de "/" vers "/index" */}
        <Route path="/" element={<Navigate to="/index" replace />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/singleplayer" element={<SinglePlayerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;