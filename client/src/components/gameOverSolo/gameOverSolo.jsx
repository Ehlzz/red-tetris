import './gameOverSolo.css';
import { Link } from 'react-router-dom';

const GameOverSolo = ({ score, totalLinesCleared, playerLevel, onRestart }) => {
    return (
        <>
            <div className="background-overlay"></div>
                <div className="game-over-message">
                    <div className="game-over-text">
                        <h1>Game Over!</h1>
                        <div className="final-stats">
                            <p>Total Lines Cleared: {totalLinesCleared}</p>
                            <p>Level: {playerLevel}</p>
                            <p>Final Score: {score}</p>
                        </div>
                    </div>
                    <div className="game-over-btn">
                        <Link to="/" className="nav-button-home">
                            Return
                        </Link>
                        <button className="play-again" onClick={onRestart}>
                            Play again
                        </button>
                    </div>
                </div>
        </>              
    );
};

export default GameOverSolo;