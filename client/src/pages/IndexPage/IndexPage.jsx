import { Link } from 'react-router-dom';
import './IndexPage.css';

function IndexPage() {
  return (
    <div className="index-page">
      <header>
        <h1>Bienvenue sur Red Tetris</h1>
      </header>
      
      <main>
        <nav className="main-navigation">
          <Link to="/multiplayer" className="nav-button">
            Multiplayer
          </Link>
          <Link to="/singleplayerback" className="nav-button">
            Singleplayer Back cett efios
          </Link>
        </nav>
        
        <div className="content">
          <p>blablabla</p>
        </div>
      </main>
    </div>
  );
}

export default IndexPage;