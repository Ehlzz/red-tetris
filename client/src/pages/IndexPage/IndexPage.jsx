import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import './IndexPage.css';
import GridBackground from '../../components/gridBackground/gridBackground';

const IndexPage = () => {
    const scrambleText = (element) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const originalText = element.dataset.originalText;
      let iterations = 0;
      
      const interval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((letter, index) => {
            if(index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if(iterations >= originalText.length) {
          clearInterval(interval);
        }
        
        iterations += 1;
      }, 25);
    };

    useEffect(() => {
      const navButtons = document.querySelectorAll('.nav-button');
      const handlers = [];

      navButtons.forEach(button => {
        button.dataset.originalText = button.textContent;
        const handler = () => {
          scrambleText(button);
        };
        handlers.push({ button, handler });
        button.addEventListener('mouseenter', handler);
      });

      return () => {
        handlers.forEach(({ button, handler }) => {
          button.removeEventListener('mouseenter', handler);
        });
      };
    }, []);

  return (
      <div className="index-page">
        <GridBackground />
        <div className='base'>
          <div className='top-main'>
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
              width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet" className='logo'>
              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
              fill="#fd1e2d" stroke="none">
              <path d="M1600 3840 l0 -320 -320 0 -320 0 0 -320 0 -320 640 0 640 0 0 -320
              0 -320 320 0 320 0 0 -320 0 -320 -640 0 -640 0 0 320 0 320 -320 0 -320 0 0
              -320 0 -320 320 0 320 0 0 -320 0 -320 640 0 640 0 0 320 0 320 640 0 640 0 0
              320 0 320 -320 0 -320 0 0 320 0 320 320 0 320 0 0 320 0 320 -320 0 -320 0 0
              320 0 320 -960 0 -960 0 0 -320z m1920 -640 l0 -320 -640 0 -640 0 0 320 0
              320 640 0 640 0 0 -320z"/>
              </g>
              </svg>
          <h1 className='index-title'>Gömbloc</h1>
          </div>
          <main>
            <nav className="main-navigation">
              <Link to="/singleplayer" className="nav-button">
                Singleplayer
              </Link>
              <Link to="/multiplayer" className="nav-button">
                Multiplayer
              </Link>
            </nav>
          </main>
        </div>
        <div className="footer">
          &copy; 2025 Gömbloc (Red Tetris). Made with ❤️ by 
          <a href="https://mathisd.fr" target="_blank" rel="noopener noreferrer"> madegryc</a> &
          <a href="https://github.com/Ehlzz" target="_blank" rel="noopener noreferrer"> ehalliez</a>.
        </div>
      </div>
  );
};

export default IndexPage;