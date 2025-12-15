import './gameOverMulti.css';
import { Link, useNavigate } from 'react-router-dom';

const GameOverMulti = ({ score, totalLinesCleared, playerLevel, roomName, playerName, room }) => {
    const navigate = useNavigate();
    
    const sortedPlayers = room?.players 
        ? [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0))
        : [];
    
    const currentPlayerRank = sortedPlayers.findIndex(player => player.name === playerName) + 1;
    
    return (
        <>
            <div className="background-overlay"></div>
                <div className="game-over-message">
                    <div className="game-over-text">
                        <h1>Game Over!</h1>
                        <div className="final-stats">
                            <p>Your Rank: #{currentPlayerRank}</p>
                        </div>
                    </div>
                    
                    <div className="leaderboard-section">
                        <div className="leaderboard-list">
                            {sortedPlayers.map((player, index) => (
                                <div 
                                    key={player.id || index}
                                    className={`leaderboard-item ${
                                        player.name === playerName ? 'current-player' : ''
                                    } ${
                                        index === 0 ? 'winner' : ''
                                    }`}
                                >
                                    <div className="rank">
                                        {index === 0 ? '🏆' : `#${index + 1}`}
                                    </div>
                                    <div className="player-info-over">
                                        <span className="player-name">{player.name}</span>
                                        <span className="player-score">{player.score || 0} pts</span>
                                    </div>
                                    <div className="player-details">
                                        <span>Level {player.level || 1}</span>
                                        <span>{player.totalColumnsCleared || 0} lines</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="game-over-btn">
                        <div onClick={() => {
                            navigate(`/lobby/${roomName}/${playerName}`, {state: {room: room}});
                        }}>
                            Back to Home
                        </div>
                    </div>
                    
                </div>
        </>              
    );
};

export default GameOverMulti;