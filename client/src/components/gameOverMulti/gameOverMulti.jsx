import './gameOverMulti.css';
import { Link } from 'react-router-dom';

const GameOverMulti = ({ score, totalLinesCleared, playerLevel, roomName, playerName }) => {
    return (
        <>
            <div className="background-overlay"></div>
                <div className="game-over-message">
                    <div className="game-over-text">
                        <h1>Game Oveeeeer!</h1>
                        <div className="final-stats">
                            <p>Total Lines Cleared: {totalLinesCleared}</p>
                            <p>Level: {playerLevel}</p>
                            <p>Final Score: {score}</p>
                        </div>
                    </div>
                    <div className='Spectate-btn'>
                        <button className="spectate-button">
                            Spectate Game
                        </button>
                    </div>
                    <div className="game-over-btn">
                        <Link to={`/lobby/${roomName}/${playerName}`} className="play-again">
                            Back to Lobby
                        </Link>
                    </div>
                </div>
        </>              
    );
};

export default GameOverMulti;