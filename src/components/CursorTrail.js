import React, { useEffect, useRef } from "react";
import './CursorTrail.css';

const MouseParticleTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    let hue = 0;
    const maxDistance = 90;
    
    const createParticle = (x, y) => {
      return {
        x: x,
        y: y,
        size: 3,
        color: `hsl(${hue}, 100%, 50%)`,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1
      };
    };
    
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance <= maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = particles[i].color;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hue++;
      
      ctx.globalAlpha = 1;
      connectParticles();
      
      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.size -= 0.05;
        
        if (particle.size <= 0.3) {
          particles.splice(index, 1);
        }
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    const handleMouseMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      
      particles.push(createParticle(x, y));
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    animate();
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

export default MouseParticleTrail;