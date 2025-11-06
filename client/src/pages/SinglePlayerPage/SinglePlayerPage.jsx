import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './SinglePlayerPage.css';

const SIZEX = 10;
const SIZEY = 20;

// Connexion au serveur WebSocket
const socket = io('http://localhost:5000');

function SinglePlayerPage() {
    const [grid, setGrid] = useState(
        Array.from({ length: SIZEY }, () => Array(SIZEX).fill(0))
    );

    useEffect(() => {
        socket.on('tetromino', ({ type, shape }) => {
            console.log('🎮 Tétrimino reçu:', type, shape);

            setGrid(() => {
                const newGrid = Array.from({ length: SIZEY }, () => Array(SIZEX).fill(0));

                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            const gridX = x + Math.floor((SIZEX - shape[y].length) / 2);
                            if (gridX >= 0 && gridX < SIZEX && y < SIZEY) {
                                newGrid[y][gridX] = 1;
                            }
                        }
                    }
                }
                return newGrid;
            });
        });

        return () => {
            socket.off('tetromino');
        };
    }, []);

    const requestTetromino = () => {
        console.log('📡 Demande d\'un nouveau tétrimino...');
        socket.emit('requestTetromino');
    };

    return (
        <div className="singleplayer-component">
            <div className="singleplayer-wrapper">
                <div className="singleplayer-game" style={{ aspectRatio: `${SIZEX} / ${SIZEY}` }}>
                    <div className="singleplayer-grid" style={{ 
                        gridTemplateColumns: `repeat(${SIZEX}, 1fr)`,
                        gridTemplateRows: `repeat(${SIZEY}, 1fr)`
                    }}>
                        {grid.map((row, rowIndex) => 
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`singleplayer-cell ${cell ? 'active' : ''}`}
                                ></div>
                            ))
                        )}
                    </div>
                </div>
				<div className="singleplayer-info">
					<div className="singleplayer-next-block">
					</div>
					<div className="singleplayer-score">
						<h2>Score</h2>
						<p>0</p>
					</div>
					<button className="singleplayer-start-button" onClick={requestTetromino}>Add block</button>
				</div>
            </div>
        </div>
    );
}

export default SinglePlayerPage;
