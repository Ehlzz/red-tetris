import {useEffect, useState, useRef} from 'react';
import './MultiPlayerGame.css';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from "react-router-dom";
import GameOverMulti from '../../components/gameOverMulti/gameOverMulti';

const MultiPlayerGame = ({ socket }) => {
    const { roomId, playerName: urlPlayerName } = useParams();
    const [nextBlock, setNextBlock] = useState(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [playerLevel, setPlayerLevel] = useState(1);
    const [totalLinesCleared, setTotalLinesCleared] = useState(0);
    const [room, setRoom] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const [particles, setParticles] = useState([]);
    const particleTimeouts = useRef(new Set());
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(false);
    const previousLevel = useRef(1);
    const [spectatedPlayer, setSpectatedPlayer] = useState(null);
    const spectatedPlayerRef = useRef(null);
    const createEmptyGrid = () => {
        return Array(22).fill().map(() => Array(10).fill(''));
    };
    
    const [displayGrid, setDisplayGrid] = useState(createEmptyGrid());

    useEffect(() => {
        socket.on('countdown', (count) => {
            // console.log('⏳ Décompte reçu:', count);
            setCountdown(count);
        });

        socket.on('startMultiplayerGame', (data) => {
            console.log('🎮 Partie multijoueur démarrée:', data);
            setRoom(data.room);
        });

        return () => {
            socket.off('countdown');
            socket.off('startMultiplayerGame');
            
            particleTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
            particleTimeouts.current.clear();
        };
}, [socket]);

    useEffect(() => {
        socket.on('receiveGame', (player) => {
            console.log('🔌 Connecté au serveur avec l\'ID:', socket.id)
            console.log('🟩 Grille initialisée:', player.grid);
            console.log('⏭ Bloc suivant:', player.nextBlock);
            setSelectedPlayer(player)
            console.log('Selected Player : ', player);
            setGameStarted(true);
            setCountdown(null);
            spectatedPlayerRef.current = socket.id;
            setSpectatedPlayer(socket.id);
            setNextBlock(player.nextBlock);
            setScore(player.score || 0);
            setPlayerLevel(player.level || 1);
            setTotalLinesCleared(player.totalColumnsCleared || 0);
            setDisplayGrid(player.grid);
        })

        socket.on('refreshGame', (game) => {
            console.log('🔄 Jeu rafraîchi:', game);
            if (game.room) {
                console.log('🔄 Room info:', game.room);
                setRoom(game.room);
            }
            if (game.level > previousLevel.current) {
                setNewLevel(game.level);
                setShowLevelUp(true);
                
                setTimeout(() => setShowLevelUp(false), 2000);
            }
            const id = spectatedPlayerRef.current;
            previousLevel.current = game.level;
            console.log('Spectated Player ID:', id);
            const player = game.room.players.find(p => p.id === id);
            console.log(player);
            setDisplayGrid(player.grid);
            setNextBlock(game.nextBlock);
            setScore(game.score);
            setPlayerLevel(game.level);
            setTotalLinesCleared(game.totalColumnsCleared);
        });

        socket.on('refreshRoom', (game) => {
            setRoom(game.room);
        });

        socket.on('blockFixed', (data) => {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 200);
            
            if (data && data.positions) {
                const newParticles = [];
                const currentTime = Date.now();
                
                data.positions.forEach((pos, index) => {
                    for (let i = 0; i < 3; i++) {
                        const particleId = currentTime + index * 10 + i;
                        newParticles.push({
                            id: particleId,
                            x: pos.x * 34 + 10 + Math.random() * 10,
                            y: (pos.y - 2) * 34 + 10 + Math.random() * 10,
                            createdAt: currentTime
                        });
                        
                        const timeoutId = setTimeout(() => {
                            setParticles(prev => prev.filter(p => p.id !== particleId));
                            particleTimeouts.current.delete(timeoutId);
                        }, 2500);
                        
                        particleTimeouts.current.add(timeoutId);
                    }
                });
                
                setParticles(prev => [...prev, ...newParticles]);
            }
        });

        socket.on('gameOver', ({ score }) => {
            socket.emit('gameOver', { roomId: roomId });
            console.log('💀 Game Over! Score final:', score);
            setScore(score);
            setGameStarted(false);
        });
        
        socket.on('multiplayerGameEnd', (data) => {
            console.log('🏆 Fin de la partie multijoueur:', data);
            setGameOver(true);
            setRoom(data.room);
        });

        return () => {
            socket.off('receiveGame');
            socket.off('initGrid');
            socket.off('sendTetromino');
            socket.off('refreshGame');
            socket.off('gameOver');
            socket.off('multiplayerGameEnd');
            socket.off('blockFixed');
        };
    }, []);

    function requestChangePlayerPreview(playerId) {
        setSpectatedPlayer(playerId);
        spectatedPlayerRef.current = playerId;
        setDisplayGrid(room.players.find(p => p.id === playerId).grid);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
			// console.log(event.key);
            
            if (gameStarted && !gameOver) {
                if (event.key === "ArrowUp") {
                    if (!event.repeat) {
                        socket.emit('rotateBlock');
                    }
                } else {
                    if (event.key === "ArrowDown") {
                        socket.emit('moveBlock', { x: 0, y: 1 });
                    } else if (event.key === "ArrowLeft") {
                        socket.emit('moveBlock', { x: -1, y: 0 });
                    } else if (event.key === "ArrowRight") {
                        socket.emit('moveBlock', { x: 1, y: 0 });
                    } else if (event.key === " ") {
                        socket.emit('dropBlock');
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted, gameOver]);

    return (

        <div className="game-container">
            <div className="multi-player-back">
                <div className="leaderboard">
                    {room && (
                        <div className="players-list">
                            {room.players.map((player) => {
                                if (player.id === spectatedPlayer) return null;
                                return (
                                    <div className="leaderboard-player-component" key={player.id} onClick={(e) => {requestChangePlayerPreview(player.id)}}>
                                        {player.isGameOver && <div className="overlay-game-over">💀</div>}
                                        <div className="player-preview-grid">
                                            {player.grid && player.grid.slice(2).map((row, rowIndex) => (
                                                <div key={rowIndex} className="row">
                                                    {row.map((cell, cellIndex) => (
                                                        <div
                                                            key={cellIndex}
                                                            className={`player-preview-cell ${cell}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="leaderboard-player-info">
                                            <p className="player-name">{player.name}</p>
                                            <p className="player-score">Score: {player.score}</p>
                                            <p className="player-level">Level: {player.level}</p>
                                            <p className="player-level">Line cleared: {player.totalColumnsCleared}</p>
                                            <div className="next-block-other">
                                                {player.nextBlock && player.nextBlock.shape.map((row, rowIndex) => (
                                                    <div key={rowIndex} className="row">
                                                        {row.map((cell, cellIndex) => (
                                                            <div
                                                                key={cellIndex}
                                                                className={`cell ${cell ? 'filled' : ''}`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="test">
                    <div className="grid-container">
                        <div className={`grid ${isShaking ? 'shake' : ''}`}>
                            {displayGrid.slice(2).map((row, rowIndex) => (
                                <div key={rowIndex} className="row">
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`cell ${cell}`}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="particles-container">
                            {particles.map(particle => (
                                <div
                                    key={particle.id}
                                    className="particle"
                                    style={{
                                        left: `${particle.x}px`,
                                        top: `${particle.y}px`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {showLevelUp && (
                        <div className="level-up-animation">
                            <div className="level-up-content">
                                <h2>LEVEL UP!</h2>
                                <p>Level {newLevel}</p>
                                <div className="level-up-sparkles">
                                    <span>🔥</span>
                                    <span>🔥</span>
                                    <span>🔥</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!gameStarted && !gameOver && (
                        <>
                            {countdown !== null && (
                                <div className="countdown">
                                    <span>{countdown > 0 ? countdown : ''}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className='info'>
                        
                        <div className="next-block">
                            {nextBlock && nextBlock.shape.map((row, rowIndex) => (
                                <div key={rowIndex} className="row">
                                    {row.map((cell, cellIndex) => (
                                        <div
                                            key={cellIndex}
                                            className={`cell ${cell ? 'filled' : ''}`}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="scd-info">
                            <div className="score-board">
                                <p>Score : {score}</p>
                            </div>
                        <div className='info-game'>
                            <div className="current-lvl">
                                <p>Level : {playerLevel}</p>
                            </div>
                            <div className="lines-cleared">
                                <p>Line : {totalLinesCleared}</p>
                            </div>
                        </div>
                        </div>

                            { gameOver && (
                                <>
                                    <GameOverMulti 
                                        score={score}
                                        totalLinesCleared={totalLinesCleared}
                                        playerLevel={playerLevel}
                                        roomName={roomId}
                                        room={room}
                                        playerName={room.players.find(p => p.id === socket.id).name}
                                    />
                                </>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiPlayerGame;