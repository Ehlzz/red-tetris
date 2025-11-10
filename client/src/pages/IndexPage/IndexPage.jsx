import { Link } from 'react-router-dom';
import './IndexPage.css';

function IndexPage() {
  return (
    <div className='border'>
      <div className="index-page">
          <header>
            <h1>Red Tetris</h1>
          
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
        </header>
      </div>
    </div>
  );
}

export default IndexPage;