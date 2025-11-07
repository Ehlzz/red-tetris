import {useEffect, useState} from 'react';
import './SinglePlayerBack.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const SinglePlayerBack = () => {
    const [grid, setGrid] = useState(null);
    const [currentBlock, setCurrentBlock] = useState(null);
    const [nextBlock, setNextBlock] = useState(null);

    useEffect(() => {
        socket.on('receiveGame', (game) => {
            console.log('🔌 Connecté au serveur avec l\'ID:', socket.id)
            console.log('🟩 Grille initialisée:', game.grid);
            console.log('🎮 Bloc courant:', game.currentBlock);
            console.log('⏭ Bloc suivant:', game.nextBlock);
            setGrid(game.grid);
            setCurrentBlock(game.currentBlock);
            setNextBlock(game.nextBlock);
        })

        socket.on('refreshGame', (game) => {
            console.log('🔄 Jeu rafraîchi:', game);
            setGrid(game.grid);
            setCurrentBlock(game.currentBlock);
            setNextBlock(game.nextBlock);
        });

        return () => {
            socket.off('receiveGame');
            socket.off('initGrid');
            socket.off('sendTetromino');
            socket.off('refreshGame');
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
			console.log(event.key);
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
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (

        <div className="single-player-back">
            {!grid && (
                <button onClick={() => socket.emit('startGame')}>Start Game</button>
            )}
            {grid && (
                <div className="grid">
                    {grid.slice(2).map((row, rowIndex) => (
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
            )}
        </div>
    );
};

export default SinglePlayerBack;