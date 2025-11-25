import './LobbyGamePage.css';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import GridBackground from '../../components/gridBackground/gridBackground';

const LobbyGamePage = ({ socket }) => {
    const { roomId, playerName: urlPlayerName } = useParams();
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState(urlPlayerName || "");
    const [room, setRoom] = useState(null);
    const [allPlayersReady, setAllPlayersReady] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const joinSent = useRef(false);
    
    useEffect(() => {
        if (!playerName && roomId) {
            navigate("/multiplayer", {
                state: { errorType: 'noName', roomId: roomId }
            });
        }
    }, []);

    const checkCanStart = () => {
        return socket.id == room.chief && allPlayersReady && room.players.length >= 2;
    }
    useEffect(() => {
        const handleLobbyCreated = (game) => {
            console.log('Lobby created recu')
            setRoom(game.room);
            navigate(`/lobby/${game.room.roomId}/${playerName}`);
        };
        
        const handleLobbyJoined = (game) => {
            setRoom(game.room);
            if (!roomId) {
                navigate(`/lobby/${game.roomId}/${playerName}`);
            }
        };

        const handlePlayerLeft = (game) => {
            setRoom(game.room);
        };
        
        const handleError = (error) => {
            setRoom(null);
            if (error.name) {
                setPlayerName("");
            }
            navigate("/multiplayer", {
                state: { errorType: error.errorType, roomId: error.room }
            });
        };

        const handleRefreshRoom = (game) => {
            console.log('🔄 Room refreshed:', game);
            setRoom(game.room);
            let allReady = true;
            game.room.players.forEach(player => {
                if (player.id === socket.id) {
                    setIsReady(player.isReady);
                    console.log('🟢 Your ready status:', player.isReady);
                }
                if (!player.isReady) {
                    allReady = false;
                }
            });
            setAllPlayersReady(allReady);
        };

        const handleGameStarted = (args) => {
            navigate(`/game/${roomId}/${args.name}`);
        }
        
        socket.on("lobbyCreated", handleLobbyCreated);
        socket.on("lobbyJoined", handleLobbyJoined);
        socket.on("playerLeft", handlePlayerLeft);
        socket.on("error", handleError);
        socket.on("refreshRoom", handleRefreshRoom);
        socket.on("startMultiplayerGame", handleGameStarted);

        return () => {
            socket.off("lobbyCreated", handleLobbyCreated);
            socket.off("lobbyJoined", handleLobbyJoined);
            socket.off("playerLeft", handlePlayerLeft);
            socket.off("error", handleError);
            socket.off("refreshRoom", handleRefreshRoom);
            socket.off("startMultiplayerGame", handleGameStarted);
        };
    }, [playerName, navigate, roomId, room]);

    
    const toggleReady = (playerId) => {
        socket.emit("toggleReady", {roomId: roomId});
    };

    useEffect(() => {
        if (roomId && urlPlayerName && !joinSent.current) {
            joinSent.current = true;

            setPlayerName(urlPlayerName);

            socket.emit("joinLobby", {
                args: {
                    roomId,
                    playerName: urlPlayerName,
                }
            });
        }
    }, [roomId, urlPlayerName]);


    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId).then(() => {
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleStartGame = () => {
        if (checkCanStart()) {
            socket.emit("startMultiplayerGame", roomId);
        }
    };

    return (
        <div className="lobby-game-page">
            <GridBackground />
            {room && (
            <div className='base-lobby'>
                <div className='top-main-lobby'>
                    <Link to="/multiplayer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" className="arrow-back"><path fill="#fd1e2d" d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2zM7 10V8h2v2zm0 0v2H5v-2zm10 0V8h-2v2zm0 0v2h2v-2z"/></svg>
                    </Link>
                    <h1 className='index-title'>Game Lobby</h1>
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
                            <span className="code" onClick={copyRoomCode}>{roomId}</span>
                            <button className="copy-button" onClick={copyRoomCode}>Copy</button>
                        </div>
                    </div>
                    <div className="players-container">
                        <h3 className="players-title">Players ({room && room.players.length || 0}/4)</h3>
                        <div className="player-list">
                            {room && room.players.map(player => (
                                <div key={player.id} className={`player-item ${player.isReady ? 'ready' : 'not-ready'}`}>
                                    <div className="player-info">
                                        <div className="player-name-container">
                                            {room.chief == player.id && (
                                                <svg className="crown-icon" width="20" height="20" viewBox="0 0 24 24">
                                                    <path fill="#fd1e2d" d="M5 16L3 6l5.5 6L12 4l3.5 8L21 6l-2 10H5zm2.7-2h8.6l.9-4.4l-2.1 2.7L12 8.4l-3.1 3.9l-2.1-2.7L7.7 14z"/>
                                                </svg>
                                            )}
                                            <span className="player-name">{player.name}</span>
                                            {room.chief == player.id && <span className="host-badge">HOST</span>}
                                            {socket.id == player.id && <span className="host-badge">YOU</span>}
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
                        <button 
                            className={`ready-button ${!isReady ? 'ready' : 'not-ready'}`}
                            onClick={() => toggleReady(socket.id)}
                        >
                            {isReady ? 'CANCEL' : 'READY'}
                        </button>
                        
                        {room && room.chief == socket.id && (
                            <button 
                                className={`start-game-button ${checkCanStart() ? 'enabled' : 'disabled'}`}
                                disabled={!checkCanStart()}
                                onClick={handleStartGame}
                            >
                                START GAME
                            </button>
                        )}
                    </div>
                </main>
            </div>
            )}
        </div>
    );
};

export default LobbyGamePage;