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
    const [currentBlock, setCurrentBlock] = useState(null);
    const [nextBlock, setNextBlock] = useState(null);

    const requestTetromino = () => {
        console.log('📡 Demande d\'un nouveau tétrimino...');
        socket.emit('requestTetromino');
    };

    useEffect(() => {
        socket.on('tetromino', ({ type, shape }) => {
            console.log('🎮 Tétrimino reçu:', type, shape);

            if (!currentBlock) {
                setCurrentBlock({
                    shape: shape,
                    position: { x: Math.floor((SIZEX - shape[0].length) / 2), y: 0 },
                });
            } else {
                setNextBlock({
                    shape: shape,
                    position: { x: Math.floor((SIZEX - shape[0].length) / 2), y: 0 },
                });
            }
        });

        return () => {
            socket.off('tetromino');
        };
    }, [currentBlock]);

    const moveBlockDown = () => {
        if (!currentBlock) return;

        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => row.slice());
            const { shape, position } = currentBlock;
            const newY = position.y + 1;

            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] && newGrid[position.y + y] && newGrid[position.y + y][position.x + x]) {
                        newGrid[position.y + y][position.x + x] = 0;
                    }
                }
            }

            // Vérifier si le bloc peut descendre
            let canMove = true;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (
                        shape[y][x] &&
                        (newY + y >= SIZEY || newGrid[newY + y][position.x + x] !== 0)
                    ) {
                        canMove = false;
                    }
                }
            }

            if (canMove) {
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            newGrid[newY + y][position.x + x] = 1;
                        }
                    }
                }

                setCurrentBlock((prev) => ({
                    ...prev,
                    position: { ...prev.position, y: newY },
                }));
            } else {
                // Si le bloc ne peut pas descendre, il est fixé et le nextBlock devient le currentBlock
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            newGrid[position.y + y][position.x + x] = 1;
                        }
                    }
                }
                setCurrentBlock(nextBlock);
                setNextBlock(null);
                requestTetromino();
            }

            return newGrid;
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            moveBlockDown();
        }, 100);

        return () => clearInterval(interval);
    }, [currentBlock, nextBlock]);

    return (
        <div className="singleplayer-component">
            <div className="singleplayer-wrapper">
                <div className="singleplayer-game" style={{ aspectRatio: `${SIZEX} / ${SIZEY}` }}>
                    <div
                        className="singleplayer-grid"
                        style={{
                            gridTemplateColumns: `repeat(${SIZEX}, 1fr)`,
                            gridTemplateRows: `repeat(${SIZEY}, 1fr)`,
                        }}
                    >
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
                        {nextBlock && (
                            <div>
                                {nextBlock.shape.map((row, rowIndex) => (
                                    <div key={rowIndex} style={{ display: 'flex' }}>
                                        {row.map((cell, colIndex) => (
                                            <div
                                                key={colIndex}
                                                className={`singleplayer-cell ${cell ? 'active' : ''}`}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    margin: '1px',
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="singleplayer-start-button" onClick={requestTetromino}>
                        START
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SinglePlayerPage;
