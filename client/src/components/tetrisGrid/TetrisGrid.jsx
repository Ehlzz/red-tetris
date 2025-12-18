import './TetrisGrid.css';
import ParticlesContainer from '../particlesContainer/ParticlesContainer';
import { useEffect } from 'react';

const TetrisGrid = ({ displayGrid, isShaking, particles, isGameOver}) => {

    useEffect(() => {
        console.log('Particules updated:', particles);
    }, [particles]);

    return (
        <div className="grid-container">
            <div className={`grid ${isShaking ? 'shake' : ''}`}>
                <div className={`game-over-overlay ${isGameOver ? 'visible' : ''}`}>
                    <div className="game-over-icon">💀</div>
                    <div className="game-over-text-multi">Game Over</div>
                </div>
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
            
            <ParticlesContainer particles={particles} />
        </div>
    );
};

export default TetrisGrid;
