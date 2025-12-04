import {useEffect, useState, useRef} from 'react';
import './SinglePlayer.css';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import GameOverSolo from '../../components/gameOverSolo/gameOverSolo';

const SinglePlayer = ({ socket }) => {
    const [grid, setGrid] = useState(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const [nextBlock, setNextBlock] = useState(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [playerLevel, setPlayerLevel] = useState(1);
    const [totalLinesCleared, setTotalLinesCleared] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [particles, setParticles] = useState([]);
    const particleTimeouts = useRef(new Set());
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(1);
    const previousLevel = useRef(1);
    
    const createEmptyGrid = () => {
        return Array(22).fill().map(() => Array(10).fill(''));
    };
    
    const [displayGrid, setDisplayGrid] = useState(createEmptyGrid());

    useEffect(() => {
        socket.on('receiveGame', (game) => {
            console.log('🔌 Connecté au serveur avec l\'ID:', socket.id)
            console.log('🟩 Grille initialisée:', game.grid);
            console.log('🎮 Bloc courant:', game.currentBlock);
            console.log('⏭ Bloc suivant:', game.nextBlock);
            setGrid(game.grid);
            setCurrentBlock(game.currentBlock);
            setNextBlock(game.nextBlock);
            setGameStarted(true);
            setDisplayGrid(game.grid);
        })

        socket.on('refreshGame', (game) => {
            console.log('🔄 Jeu rafraîchi:', game);
            
            if (game.level > previousLevel.current) {
                setNewLevel(game.level);
                setShowLevelUp(true);
                
                setTimeout(() => setShowLevelUp(false), 2000);
            }
            
            previousLevel.current = game.level;
            
            setGrid(game.grid);
            setCurrentBlock(game.currentBlock);
            setNextBlock(game.nextBlock);
            setScore(game.score);
            setDisplayGrid(game.grid);
            setPlayerLevel(game.level);
            setTotalLinesCleared(game.totalColumnsCleared);
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
        console.log('💀 Game Over! Score final:', score);
        setGameOver(true);
        setScore(score);
        setGameStarted(false);
    });

        return () => {
            socket.off('receiveGame');
            socket.off('initGrid');
            socket.off('sendTetromino');
            socket.off('refreshGame');
            socket.off('gameOver');
            socket.off('blockFixed');
            
            particleTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
            particleTimeouts.current.clear();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
			console.log(event.key);
            
            if (!gameStarted && !gameOver && event.key === " ") {
                socket.emit('startGame');
                return;
            }
            
            if (gameStarted && !gameOver) {
                if (event.key === "ArrowDown") {
                    socket.emit('moveBlock', { x: 0, y: 1 });
                } else if (event.key === "ArrowLeft") {
                    socket.emit('moveBlock', { x: -1, y: 0 });
                } else if (event.key === "ArrowRight") {
                    socket.emit('moveBlock', { x: 1, y: 0 });
                } else if (event.key === "ArrowUp") {
                    socket.emit('rotateBlock');
                } else if (event.key === " ") {
                    socket.emit('dropBlock');
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
            <div className="single-player-back">
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
                                        top: `${particle.y}px`,
                                        animationDelay: `${particle.delay}ms`
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
                            <div className="start-message">
                                <p>Press <strong>SPACE</strong> to start the game !</p>
                            </div>
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
                        <div className='scd-info'>
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

                    </div>
                    {gameOver && (
                        <>
                            <GameOverSolo 
                                score={score}
                                totalLinesCleared={totalLinesCleared}
                                playerLevel={playerLevel}
                                onRestart={() => {
                                    setGameOver(false);
                                    setScore(0);
                                    setPlayerLevel(1);
                                    setTotalLinesCleared(0);
                                    setGameStarted(false);
                                    setCurrentBlock(null);
                                    setNextBlock(null);
                                    setDisplayGrid(createEmptyGrid());
                                    socket.emit('resetGame');
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SinglePlayer;