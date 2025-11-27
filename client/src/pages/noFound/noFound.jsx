import React from 'react';
import GridBackground from '../../components/gridBackground/gridBackground';
import './noFound.css';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className='index-page'>
        <GridBackground />
        <div className='base'>
            <div className="not-found-page">
                <h1>404</h1>
                <div className="error-text">ERROR</div>
                <Link className="home-link" to="/">Go back home</Link>
            </div>
        </div>
    </div>
  );
}

export default NotFound;