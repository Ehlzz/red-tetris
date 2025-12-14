import './ParticlesContainer.css';

const ParticlesContainer = ({ particles }) => {
    if (!particles || particles.length === 0) return null;
    
    return (
        <div className="particles-container">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        animationDelay: `${particle.delay || 0}ms`
                    }}
                />
            ))}
        </div>
    );
};

export default ParticlesContainer;
