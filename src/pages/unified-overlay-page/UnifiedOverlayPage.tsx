import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "../../components/overlay/OverlayPage";
import './UnifiedOverlayPage.css';

const UnifiedOverlayPage = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the appropriate section based on the route
    const scrollToSection = () => {
      let targetRef = aboutRef;
      
      if (location.pathname === '/projects') {
        targetRef = projectsRef;
      } else if (location.pathname === '/experience') {
        targetRef = experienceRef;
      }

      if (targetRef.current) {
        const scrollContainer = document.querySelector('.page-content') as HTMLElement;
        if (scrollContainer) {
          // Get the element's position relative to the scroll container
          const elementTop = targetRef.current.offsetTop;
          
          // Small offset to position header nicely below nav
          const offset = 20;
          
          scrollContainer.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth'
          });
        }
      }
    };

    // Small delay to ensure the overlay is fully rendered
    const timer = setTimeout(scrollToSection, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <OverlayPage>
      <div className="unified-overlay-page">
        {/* About Me Section */}
        <section ref={aboutRef} id="about">
          <h1>
            About Me
          </h1>
          <div className="content about-content">
            <p>
              Welcome! I&apos;m a passionate software developer with expertise in modern web technologies 
              and a love for creating innovative digital experiences.
            </p>
            <p>
              My journey in technology spans across full-stack development, with particular strengths 
              in React, TypeScript, and Three.js for creating immersive web experiences.
            </p>
            <p>
              When I&apos;m not coding, you can find me exploring new technologies, contributing to open-source 
              projects, and continuously learning about the ever-evolving world of software development.
            </p>
          </div>
        </section>

        {/* Projects Section */}
        <section ref={projectsRef} id="projects">
          <h1>
            Projects
          </h1>
          <div className="content">
            <p className="intro">
              Here are some of the projects I&apos;ve worked on, showcasing my skills in various technologies 
              and problem-solving approaches.
            </p>
            
            <div className="project-item">
              <h3>Portfolio Website</h3>
              <p className="description">
                This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, 
                and modern React architecture.
              </p>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Three.js</span>
                <span className="tech-tag">TypeScript</span>
              </div>
            </div>

            <p className="coming-soon">
              More projects coming soon...
            </p>
          </div>
        </section>

        {/* Experience Section */}
        <section ref={experienceRef} id="experience">
          <h1>
            Experience
          </h1>
          <div className="content">
            <p className="intro">
              My professional journey in software development and the technologies I&apos;ve mastered along the way.
            </p>
            
            <div className="experience-item">
              <h3>Software Developer</h3>
              <p className="description">Building modern web applications and user experiences</p>
              <ul>
                <li>Full-stack development with React and Node.js</li>
                <li>3D web graphics with Three.js and WebGL</li>
                <li>Database design and API development</li>
                <li>Performance optimization and testing</li>
              </ul>
            </div>

            <div className="skills-section">
              <h3>Technical Skills</h3>
              <div className="skills-grid">
                <div>
                  <h4>Frontend</h4>
                  <p>React, TypeScript, Three.js, CSS</p>
                </div>
                <div>
                  <h4>Backend</h4>
                  <p>Node.js, Python, APIs, Databases</p>
                </div>
                <div>
                  <h4>Tools</h4>
                  <p>Git, Docker, Testing, CI/CD</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </OverlayPage>
  );
};

export default UnifiedOverlayPage;