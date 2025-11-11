import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import './IndexPage.css';

const IndexPage = () => {
  useEffect(() => {
    const cells = document.querySelectorAll(".celltest");

    cells.forEach((cell) => {
      cell.addEventListener("mouseover", () => {
        cell.classList.add("active");

        setTimeout(() => {
          cell.classList.remove("active");
        }, 1000);
      });
    });

    return () => {
      cells.forEach((cell) => {
        cell.removeEventListener("mouseover", () => {});
      });
    };
  }, []);

  return (
      <div className="index-page">
        <div className='gridtest'>
          {Array.from({ length: 100 * 100 }).map((_, i) => (
            <div key={i} className="celltest" />
          ))}
        </div>
        <div className='base'>
          <h1 className='title'>Red Tetris</h1>
          <main>
            <nav className="main-navigation">
              <Link to="/singleplayerback" className="nav-button">
                Singleplayer
              </Link>
              <Link to="/singleplayerback" className="nav-button">
                Multiplayer
              </Link>
            </nav>
          </main>
        </div>
        <div className="footer">
          &copy; 2025 Red Tetris. Made with ❤️ by 
          <a href="https://mathisd.fr" target="_blank" rel="noopener noreferrer"> madegryc</a> &
          <a href="https://github.com/Ehlzz" target="_blank" rel="noopener noreferrer"> ehalliez</a>.
        </div>
      </div>
  );
};

export default IndexPage;