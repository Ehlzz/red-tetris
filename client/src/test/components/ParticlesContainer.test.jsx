import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ParticlesContainer from '../../components/particlesContainer/ParticlesContainer';

describe('ParticlesContainer Component', () => {
    it('should not render when particles array is empty', () => {
        const { container } = render(<ParticlesContainer particles={[]} />);
        
        const particlesDiv = container.querySelector('.particles-container');
        expect(particlesDiv).not.toBeInTheDocument();
    });

    it('should render with single particle', () => {
        const particles = [
            { id: 1, x: 100, y: 200, color: 'red', size: 10 }
        ];

        const { container } = render(<ParticlesContainer particles={particles} />);
        
        const particleElements = container.querySelectorAll('.particle');
        expect(particleElements).toHaveLength(1);
    });

    it('should render with multiple particles', () => {
        const particles = [
            { id: 1, x: 100, y: 200, color: 'red', size: 10 },
            { id: 2, x: 150, y: 250, color: 'blue', size: 12 },
            { id: 3, x: 200, y: 300, color: 'green', size: 8 }
        ];

        const { container } = render(<ParticlesContainer particles={particles} />);
        
        const particleElements = container.querySelectorAll('.particle');
        expect(particleElements).toHaveLength(3);
    });

    it('should apply correct styles to particles', () => {
        const particles = [
            { id: 1, x: 100, y: 200, delay: 500 }
        ];

        const { container } = render(<ParticlesContainer particles={particles} />);
        
        const particle = container.querySelector('.particle');
        expect(particle).toHaveStyle({ left: '100px', top: '200px' });
    });

    it('should handle null particles prop', () => {
        const { container } = render(<ParticlesContainer particles={null} />);
        
        const particlesDiv = container.querySelector('.particles-container');
        expect(particlesDiv).not.toBeInTheDocument();
    });

    it('should handle undefined particles prop', () => {
        const { container } = render(<ParticlesContainer />);
        
        const particlesDiv = container.querySelector('.particles-container');
        expect(particlesDiv).not.toBeInTheDocument();
    });

    it('should handle particle without delay', () => {
        const particles = [
            { id: 1, x: 50, y: 100 }
        ];

        const { container } = render(<ParticlesContainer particles={particles} />);
        
        const particle = container.querySelector('.particle');
        expect(particle).toBeInTheDocument();
    });
});
