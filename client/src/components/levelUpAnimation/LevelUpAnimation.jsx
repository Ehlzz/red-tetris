import './LevelUpAnimation.css';

const LevelUpAnimation = ({ show, level }) => {
    if (!show) return null;
    
    return (
        <div className="level-up-animation">
            <div className="level-up-content">
                <h2>LEVEL UP!</h2>
                <p>Level {level}</p>
                <div className="level-up-sparkles">
                    <span>🔥</span>
                    <span>🔥</span>
                    <span>🔥</span>
                </div>
            </div>
        </div>
    );
};

export default LevelUpAnimation;
