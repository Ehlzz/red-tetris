import { useState } from 'react';
import './SinglePlayerPage.css';

const SIZEX = 10;
const SIZEY = 20;
const blocks = {
	I: [
		[1, 1, 1, 1]
	],
	J: [
		[1, 0, 0],
		[1, 1, 1]
	],
	L: [
		[0, 0, 1],
		[1, 1, 1]
	],
	O: [
		[1, 1],
		[1, 1]
	],
	S: [
		[0, 1, 1],
		[1, 1, 0]
	],
	T: [
		[0, 1, 0],
		[1, 1, 1]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1]
	],
};

function SinglePlayerPage() {
    const [grid, setGrid] = useState(
        Array.from({ length: SIZEY }, () => Array(SIZEX).fill(0))
    );

	const addRandomBlock = () => {
		const blockTypes = Object.keys(blocks);
		const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
		const block = blocks[randomType];
		
		setGrid(prevGrid => {	
			const newGrid = Array.from({ length: SIZEY }, () => Array(SIZEX).fill(0)).map(row => row.slice());
			
			for (let y = 0; y < block.length; y++) {
				for (let x = 0; x < block[y].length; x++) {
					if (block[y][x]) {
						newGrid[y][x + Math.floor((SIZEX - block[y].length) / 2)] = 1;
					}
				}
			}
			return newGrid;
		});
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
					<button className="singleplayer-start-button" onClick={addRandomBlock}>Add block</button>
				</div>
            </div>
        </div>
    );
}

export default SinglePlayerPage;
