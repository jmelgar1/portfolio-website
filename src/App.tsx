import React from 'react';
import './App.css';
import IntroSection from './components/content/intro-section/IntroSection';
import WorkHistory from './components/content/work-history/WorkHistory';
import ProjectsSection from './components/content/projects-section/ProjectsSection';
import ThreeJSBackground from './background/ThreeJSBackground';
import MouseParticleTrail from './components/cursor-trail/CursorTrail';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';

function App() {
  const sections = ['intro', 'work', 'projects'];
  const {
    scrollPosition,
    scrollToSection,
    getCurrentSection,
    getSectionProgress,
    maxScroll
  } = useHorizontalScroll(200, 0.5);


  return (
    <div className="App">
      <MouseParticleTrail />
      <ThreeJSBackground scrollPosition={scrollPosition} maxScroll={maxScroll} />
      <main 
        className="main-content" 
        style={{ transform: `translateX(-${scrollPosition}vw)` }}
      >
        <IntroSection />
        <WorkHistory />
        <ProjectsSection />
      </main>
      
      <div className="section-indicators">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`indicator ${getCurrentSection() === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
            title={`Go to ${sections[index]} section`}
            style={{
              opacity: getCurrentSection() === index ? 
                Math.max(0.4, 1 - getSectionProgress() * 0.6) : 0.3
            }}
          />
        ))}
        <div className="scroll-progress">
          <div 
            className="progress-bar"
            style={{ width: `${(scrollPosition / maxScroll) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
