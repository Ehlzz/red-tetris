import { useState, useEffect, useRef } from 'react';
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

	const rotateBlock = () => {
		if (!currentBlock) return;
		
		const { shape, position } = currentBlock;
		console.log(shape);
		const rotatedShape = shape[0].map((_, index) =>
			shape.map(row => row[index]).reverse()
		);
		console.log(rotatedShape);

		let canRotate = true;
		for (let y = 0; y < rotatedShape.length; y++) {
			for (let x = 0; x < rotatedShape[y].length; x++) {
				if (rotatedShape[y][x]) {
					const gridY = position.y + y;
					const gridX = position.x + x;
					console.log('SizeY:', SIZEY, 'SizeX:', SIZEX, 'gridY:', gridY, 'gridX:', gridX);
					if (gridY >= SIZEY || gridX < 0 || gridX >= SIZEX) {
						canRotate = false;
					}
				}
			}
		}

		console.log(canRotate);	
		
		if (canRotate) {

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] && grid[position.y + y] && grid[position.y + y][position.x + x] !== undefined) {
						setGrid(prevGrid => {
							const newGrid = prevGrid.map(row => row.slice());
							newGrid[position.y + y][position.x + x] = 0;
							return newGrid;
						}
						);
					}
				}
			}

			for (let y = 0; y < rotatedShape.length; y++) {
				for (let x = 0; x < rotatedShape[y].length; x++) {
					if (rotatedShape[y][x]) {
						setGrid(prevGrid => {
							const newGrid = prevGrid.map(row => row.slice());
							newGrid[position.y + y][position.x + x] = 1;
							return newGrid;
						}
						);
					}
				}
			}
			

			setCurrentBlock((prev) => ({
				...prev,
				shape: rotatedShape,
			}));
		}
	};

	const moveBlock = (dx, dy) => {
		if (!currentBlock) return;

		console.log(currentBlock.shape);
		setGrid(prevGrid => {
			const newGrid = prevGrid.map(row => row.slice());
			const { shape, position } = currentBlock;
			const newY = position.y + dy;
			const newX = position.x + dx;

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] && newGrid[position.y + y] && newGrid[position.y + y][position.x + x] !== undefined) {
						newGrid[position.y + y][position.x + x] = 0
					}
				}
			}

			let canMove = true;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] && (newY + y >= SIZEY || newGrid[newY + y][newX + x] === 1) || newX + x < 0 || newX + x >= SIZEX)
					{
						canMove = false;
                    }
                }
            }

			if (canMove) {
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            newGrid[newY + y][newX + x] = 1;
                        }
                    }
                }

                setCurrentBlock((prev) => ({
                    ...prev,
                    position: { ...prev.position, y: newY, x: newX },
                }));
            }
			else {
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x]) {
                            newGrid[position.y + y][position.x + x] = 1;
                        }
                    }
                }
				if (dy === 1) {
					setCurrentBlock(nextBlock);
					setNextBlock(null);
					requestTetromino();
				}
            }

			return newGrid;

		});
	};

	useEffect(() => {
		const interval = setInterval(() => {
			moveBlock(0, 1);
		}, 1000); // Put a variable for speed when the player 'TETRIS' or times faster when the game is functionnal 

		return () => clearInterval(interval);
	}, [currentBlock]);


	useEffect(() => {
        const handleKeyDown = (event) => {
			console.log(event.key);
            if (event.key === "ArrowDown") {
				moveBlock(0, 1);	
				console.log("Move down");

			} else if (event.key === "ArrowLeft") {
				moveBlock(-1, 0);	
				console.log("Move left");
			} else if (event.key === "ArrowRight") {
				moveBlock(1, 0);	
				console.log("Move right");
			} else if (event.key === "ArrowUp") {
				console.log("Rotate");
				rotateBlock();
			}
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentBlock]);

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
