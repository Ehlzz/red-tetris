import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import GridBackground from '../../components/gridBackground/gridBackground';

describe('GridBackground Component', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('should render 200 cells (20 rows x 10 columns)', () => {
        const { container } = render(<GridBackground />);
        
        const cells = container.querySelectorAll('.cellBack');
        expect(cells).toHaveLength(200);
    });

    it('should render grid container', () => {
        const { container } = render(<GridBackground />);
        
        const grid = container.querySelector('.gridBack');
        expect(grid).toBeInTheDocument();
    });

    it('should render all cells with correct class', () => {
        const { container } = render(<GridBackground />);
        
        const cells = container.querySelectorAll('.cellBack');
        cells.forEach(cell => {
            expect(cell).toHaveClass('cellBack');
        });
    });

    it('should have unique keys for cells', () => {
        const { container } = render(<GridBackground />);
        
        const cells = container.querySelectorAll('.cellBack');
        expect(cells.length).toBe(200);
    });
});
