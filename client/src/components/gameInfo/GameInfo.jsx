import './GameInfo.css';

const GameInfo = ({ nextBlock, score, playerLevel, totalLinesCleared, playerName }) => {
    return (
        <div className='info'>
            <div className="next-block">
                {nextBlock && nextBlock.shape.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, cellIndex) => (
                            <div
                                key={cellIndex}
                                className={`cell ${cell ? 'filled' : ''}`}
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            <div className='scd-info'>
                <div className="score-board">
                    <p>Score : {score}</p>
                </div>
                <div className='info-game'>
                    <div className="current-lvl">
                        <p>Level : {playerLevel}</p>
                    </div>
                    <div className="lines-cleared">
                        <p>Line : {totalLinesCleared}</p>
                    </div>
                </div>
            </div>
            {playerName && (
            <div className='pseudo-multi'>
                <p>{playerName || ''}</p>
            </div>
            )}
        </div>
    );
};

export default GameInfo;
