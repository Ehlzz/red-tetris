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

            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => row.slice());

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
				setCurrentBlock({shape: shape, position: { x: Math.floor((SIZEX - shape[0].length) / 2), y: 0 }});
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
	const [currentBlock, setCurrentBlock] = useState(null);

	const addRandomBlock = () => {
		const blockTypes = Object.keys(blocks);
		const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
		const block = blocks[randomType];
		
		setGrid(prevGrid => {	
			const newGrid = prevGrid.map(row => row.slice());
			
			for (let y = 0; y < block.length; y++) {
				for (let x = 0; x < block[y].length; x++) {
					if (block[y][x]) {
						newGrid[y][x + Math.floor((SIZEX - block[y].length) / 2)] = 1;
						console.log(`Placing block part at (${x + Math.floor((SIZEX - block[y].length) / 2)}, ${y})`);
					}
				}
			}
			setCurrentBlock({shape: block, position: { x: Math.floor((SIZEX - block[0].length) / 2), y: 0 }});
			return newGrid;
		});
	};

	const moveBlockDown = () => {
		if (!currentBlock) return;

		setGrid(prevGrid => {
			const newGrid = prevGrid.map(row => row.slice());
			const { shape, position } = currentBlock;
			const newY = position.y + 1;

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] && newGrid[position.y + y] && newGrid[position.y + y][position.x + x]) {
						newGrid[position.y + y][position.x + x] = 0
					}
				}
			}

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] && newGrid[newY + y] && newGrid[newY + y][position.x + x] !== undefined) {
						newGrid[newY + y][position.x + x] = 1
					}
				}
			}

			setCurrentBlock(prev => ({
				...prev,
				position: { ...prev.position, y: newY}
			}));

			return newGrid;

		});
	};

	useEffect(() => {
		const interval = setInterval(() => {
			moveBlockDown();
		}, 1000);

		return () => clearInterval(interval);
	}, [currentBlock]);


	useEffect(() => {
        const handleKeyDown = (event) => {
			console.log(event.key);
            if (event.key === "ArrowDown") {
				console.log("Move down");

			} else if (event.key === "ArrowLeft") {
				console.log("Move left");
			} else if (event.key === "ArrowRight") {
				console.log("Move right");
			} else if (event.key === "ArrowUp") {
				console.log("Rotate");
			}
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

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
