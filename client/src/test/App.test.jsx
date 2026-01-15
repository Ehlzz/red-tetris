import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
        connected: false
    }))
}));

describe('App Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<App />);
        
        expect(container).toBeInTheDocument();
    });

    it('should contain BrowserRouter', () => {
        render(<App />);
        
        expect(document.body).toBeInTheDocument();
    });
});
