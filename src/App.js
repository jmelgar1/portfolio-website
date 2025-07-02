import React from 'react';
import './App.css';
import IntroSection from './components/IntroSection';
import WorkHistory from './components/WorkHistory';
import ProjectsSection from './components/ProjectsSection';
import ThreeJSBackground from './components/threejs/ThreeJSBackground';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';

function App() {
  const sections = ['intro', 'work', 'projects'];
  const {
    scrollPosition,
    scrollToSection,
    getCurrentSection,
    getSectionProgress,
    maxScroll
  } = useHorizontalScroll(350, 0.6); // maxScroll, sensitivity


  return (
    <div className="App">
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
