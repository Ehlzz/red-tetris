import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../../pages/noFound/noFound';

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotFound Component', () => {
    it('should render 404 text', () => {
        renderWithRouter(<NotFound />);
        
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render ERROR text', () => {
        renderWithRouter(<NotFound />);
        
        expect(screen.getByText('ERROR')).toBeInTheDocument();
    });

    it('should render go back home link', () => {
        renderWithRouter(<NotFound />);
        
        const homeLink = screen.getByText('Go back home');
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should render GridBackground component', () => {
        const { container } = renderWithRouter(<NotFound />);
        
        expect(container.querySelector('.gridBack')).toBeInTheDocument();
    });

    it('should have correct CSS classes', () => {
        const { container } = renderWithRouter(<NotFound />);
        
        expect(container.querySelector('.not-found-page')).toBeInTheDocument();
        expect(container.querySelector('.index-page')).toBeInTheDocument();
        expect(container.querySelector('.base')).toBeInTheDocument();
    });

    it('should render home link with correct class', () => {
        renderWithRouter(<NotFound />);
        
        const homeLink = screen.getByText('Go back home');
        expect(homeLink).toHaveClass('home-link');
    });
});
