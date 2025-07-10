import React, { useEffect, useRef, useState } from 'react';
import './CursorTrail.css';

const CursorTrail = () => {
  const [trails, setTrails] = useState([]);
  const trailId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newTrail = {
        id: trailId.current++,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setTrails(prev => [...prev, newTrail]);
    };

    const cleanupTrails = () => {
      const now = Date.now();
      setTrails(prev => prev.filter(trail => now - trail.timestamp < 1000));
    };

    const interval = setInterval(cleanupTrails, 50);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="cursor-trail-container">
      {trails.map(trail => (
        <div
          key={trail.id}
          className="trail-particle"
          style={{
            left: trail.x,
            top: trail.y,
            animationDelay: `${(Date.now() - trail.timestamp)}ms`
          }}
        />
      ))}
    </div>
  );
};

export default CursorTrail;