import './LobbyGamePage.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import GridBackground from '../../components/gridBackground';

const LobbyGamePage = () => {
    const [players, setPlayers] = useState([
        { id: 1, name: 'Alice', isHost: true, isReady: false },
        { id: 2, name: 'Bob', isHost: false, isReady: true },
        { id: 3, name: 'Charlie', isHost: false, isReady: false },
        { id: 4, name: 'Diana', isHost: false, isReady: false },
    ]);
    const [currentPlayerId] = useState(1);

    
    const toggleReady = (playerId) => {
        setPlayers(players.map(player => 
            player.id === playerId ? { ...player, isReady: !player.isReady } : player
        ));
    };

    const roomCode = "ABC123";

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode).then(() => {
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const allPlayersReady = players.every(player => player.isReady);
    const canStartGame = currentPlayer?.isHost && allPlayersReady && players.length >= 2;

    return (
        <div className="lobby-game-page">
            <GridBackground />
            <div className='base-lobby'>
                <div className='top-main-lobby'>
                    <Link to="/multiplayerfront">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" className="arrow-back"><path fill="#fd1e2d" d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2zM7 10V8h2v2zm0 0v2H5v-2zm10 0V8h-2v2zm0 0v2h2v-2z"/></svg>
                    </Link>
                    <h1 className='title'>Game Lobby</h1>
                </div>
                
                <main className="lobby-main">
                    <div className="lobby-info">
                        <h2 className="lobby-subtitle">
                            {allPlayersReady ? 'All players ready!' : (
                                <>
                                    Waiting for players
                                    <span className="animated-dots">
                                        <span>.</span>
                                        <span>.</span>
                                        <span>.</span>
                                    </span>
                                </>
                            )}
                        </h2>
                        <div className="room-code">
                            <span>Room Code: </span>
                            <span className="code" on:onClick={copyRoomCode}>ABC123</span>
                            <button className="copy-button" onClick={copyRoomCode}>Copy</button>
                        </div>
                    </div>

                    <div className="players-container">
                        <h3 className="players-title">Players ({players.length}/4)</h3>
                        <div className="player-list">
                            {players.map(player => (
                                <div key={player.id} className={`player-item ${player.isReady ? 'ready' : 'not-ready'} ${player.id === currentPlayerId ? 'current-player' : ''}`}>
                                    <div className="player-info">
                                        <div className="player-name-container">
                                            {player.isHost && (
                                                <svg className="crown-icon" width="20" height="20" viewBox="0 0 24 24">
                                                    <path fill="#fd1e2d" d="M5 16L3 6l5.5 6L12 4l3.5 8L21 6l-2 10H5zm2.7-2h8.6l.9-4.4l-2.1 2.7L12 8.4l-3.1 3.9l-2.1-2.7L7.7 14z"/>
                                                </svg>
                                            )}
                                            <span className="player-name">{player.name}</span>
                                            {player.isHost && <span className="host-badge">HOST</span>}
                                        </div>
                                        <div className={`ready-status ${player.isReady ? 'ready' : 'not-ready'}`}>
                                            {player.isReady ? '✓ READY' : 'NOT READY'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lobby-actions">
                        {currentPlayer && (
                            <button 
                                className={`ready-button ${currentPlayer.isReady ? 'ready' : 'not-ready'}`}
                                onClick={() => toggleReady(currentPlayerId)}
                            >
                                {currentPlayer.isReady ? 'NOT READY' : 'READY'}
                            </button>
                        )}
                        
                        {currentPlayer?.isHost && (
                            <button 
                                className={`start-game-button ${canStartGame ? 'enabled' : 'disabled'}`}
                                disabled={!canStartGame}
                            >
                                START GAME
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LobbyGamePage;