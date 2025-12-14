import {useEffect, useState, useRef} from 'react';
import './SinglePlayer.css';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import GameOverSolo from '../../components/gameOverSolo/gameOverSolo';
import LevelUpAnimation from '../../components/levelUpAnimation/LevelUpAnimation';
import TetrisGrid from '../../components/tetrisGrid/TetrisGrid';
import GameInfo from '../../components/gameInfo/GameInfo';

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

    const getCellSize = () => {
        return window.innerWidth <= 1024 ? 24 : 34;
    };
    
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
                        const cellSize = getCellSize();
                        newParticles.push({
                            id: particleId,
                            x: pos.x * cellSize + cellSize/3 + Math.random() * (cellSize/3),
                            y: (pos.y - 2) * cellSize + cellSize/3 + Math.random() * (cellSize/3),
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
            
            console.log('🧹 Démontage du composant - Reset complet');
            socket.emit('resetGame');

            particleTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
            particleTimeouts.current.clear();
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!gameStarted && !gameOver && event.key === " ") {
                socket.emit('startGame');
                return;
            }
            
            if (gameStarted && !gameOver) {
                if (event.key === "ArrowUp") {
                    if (!event.repeat) {
                        socket.emit('rotateBlock');
                    }
                }
                if (event.key === " ") {
                    if (!event.repeat) {
                        socket.emit('dropBlock');
                    }
                }
                else {
                    if (event.key === "ArrowDown") {
                        socket.emit('moveBlock', { x: 0, y: 1 });
                    } else if (event.key === "ArrowLeft") {
                        socket.emit('moveBlock', { x: -1, y: 0 });
                    } else if (event.key === "ArrowRight") {
                        socket.emit('moveBlock', { x: 1, y: 0 });
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted, gameOver]);

    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const handleTouchStart = (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        };

        const handleTouchMove = (event) => {
            touchEndX = event.touches[0].clientX;
            touchEndY = event.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    socket.emit('moveBlock', { x: 1, y: 0 });
                } else if (deltaX < -50) {
                    socket.emit('moveBlock', { x: -1, y: 0 });
                }
            } else {
                if (deltaY > 50) {
                    socket.emit('moveBlock', { x: 0, y: 1 });
                } else if (deltaY < -50) {
                    socket.emit('rotateBlock');
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [socket]);

    return (
        <div className="game-container">
            <div className="single-player-back">
                <div style={{ display: 'flex' }}>
                    <TetrisGrid 
                        displayGrid={displayGrid}
                        isShaking={isShaking}
                        particles={particles}
                    />
                    
                    <LevelUpAnimation show={showLevelUp} level={newLevel} />
                
                    {!gameStarted && !gameOver && (
                        <>
                            <div className="start-message">
                                <p>Press <strong>SPACE</strong> to start the game !</p>
                            </div>
                        </>
                    )}
                    
                    <GameInfo 
                        nextBlock={nextBlock}
                        score={score}
                        playerLevel={playerLevel}
                        totalLinesCleared={totalLinesCleared}
                    />
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