import React, { useEffect } from 'react';
import './gridBackground.css';

const GridBackground = () => {
  useEffect(() => {
    const cells = document.querySelectorAll('.cellBack');
    
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
        <div className='gridBack'>
          {Array.from({ length: 20 * 10 }).map((_, i) => (
            <div key={i} className="cellBack" />
          ))}
        </div>
    );
};

export default GridBackground;