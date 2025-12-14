import './TetrisGrid.css';
import ParticlesContainer from '../particlesContainer/ParticlesContainer';

const TetrisGrid = ({ displayGrid, isShaking, particles }) => {
    return (
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
            
            <ParticlesContainer particles={particles} />
        </div>
    );
};

export default TetrisGrid;
