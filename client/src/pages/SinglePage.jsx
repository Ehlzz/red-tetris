import { Link } from 'react-router-dom';
import './SinglePage.css';

function SinglePage() {
  return (
    <div className="about-page">
      <header>
        <nav>
          <Link to="/index">← Retour à l'accueil</Link>
        </nav>
        <h1>JOUEZ</h1>
      </header>
      
      <main>
        <div className="content">
          <div className='grid'></div>
        </div>
      </main>
    </div>
  );
}

export default SinglePage;