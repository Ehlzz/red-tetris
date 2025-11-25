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
                <p className='back-home-txt'>Go back <Link className="home-link" to="/">home</Link></p>
            </div>
        </div>
    </div>
  );
}

export default NotFound;