import React, { useEffect } from 'react';
import './gridBackground.css';

const GridBackground = () => {
  useEffect(() => {
    const cells = document.querySelectorAll('.celltest');
    
    cells.forEach((cell) => {
      cell.addEventListener('mouseover', () => {
        cell.classList.add('active');
        setTimeout(() => {
            cell.classList.remove('active');
            }
        , 1000);
      });
    });
    
    return () => {
      cells.forEach((cell) => {
        cell.removeEventListener('mouseover', () => {});
      });
    };
    }, []);

    return (
        <div className='gridtest'>
          {Array.from({ length: 100 * 100 }).map((_, i) => (
            <div key={i} className="celltest" />
          ))}
        </div>
    );
};

export default GridBackground;