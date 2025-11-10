import {useEffect, useState} from 'react';
import './SinglePlayerBack.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const SinglePlayerBack = () => {
    const [grid, setGrid] = useState(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const [nextBlock, setNextBlock] = useState(null);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    
    const createEmptyGrid = () => {
        return Array(20).fill().map(() => Array(10).fill(''));
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
            setGrid(game.grid);
            setCurrentBlock(game.currentBlock);
            setNextBlock(game.nextBlock);
            setScore(game.score);
            setDisplayGrid(game.grid);
        });

        socket.on('gameOver', ({ score }) => {
        console.log('💀 Game Over! Score final:', score);
        setGameOver(true);
        setScore(score);
    });

        return () => {
            socket.off('receiveGame');
            socket.off('initGrid');
            socket.off('sendTetromino');
            socket.off('refreshGame');
            socket.off('gameOver');
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
			console.log(event.key);
            
            if (!gameStarted && event.key === " ") {
                socket.emit('startGame');
                return;
            }
            
            if (gameStarted) {
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
    }, [gameStarted]);

    return (

        <div className="game-container">
            <div className="single-player-back">
                <div className="test">
                    <div className="grid">
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
                    
                    <div className='info'>
                        {!gameStarted && (
                            <>
                                <div className="background-overlay"></div>
                                <div className="start-message">
                                    <p>Press <strong>SPACE</strong> to start the game !</p>
                                </div>
                            </>
                        )}
                        
                        {gameStarted && (
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
                        )}
                        
                        <div className="score-board">
                            <p>{score}</p>
                        </div>

                        {gameOver && (
                            <>
                                <div className="background-overlay"></div>
                                <div className="game-over-message">
                                    <p>Game Over!</p>
                                    <p>Final Score: {score}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SinglePlayerBack;