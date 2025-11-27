import './gameOverMulti.css';
import { Link, useNavigate } from 'react-router-dom';

const GameOverMulti = ({ score, totalLinesCleared, playerLevel, roomName, playerName, room }) => {
    const navigate = useNavigate();
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
                    <div className="game-over-btn">
                        <div className="play-again" onClick={() => {{
                            navigate(`/lobby/${roomName}/${playerName}`, {state: {room: room}});
                        }}}>
                            Back to Lobby
                        </div>
                    </div>
                    
                </div>
        </>              
    );
};

export default GameOverMulti;