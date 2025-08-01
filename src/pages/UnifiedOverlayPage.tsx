import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "../components/overlay/OverlayPage";

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
      <div>
        {/* About Me Section */}
        <section ref={aboutRef} id="about" style={{ marginBottom: '2rem', minHeight: '100vh', paddingTop: '0.5rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
            About Me
          </h1>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '800px' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Welcome! I&apos;m a passionate software developer with expertise in modern web technologies 
              and a love for creating innovative digital experiences.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
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
        <section ref={projectsRef} id="projects" style={{ marginBottom: '2rem', minHeight: '100vh', paddingTop: '0rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
            Projects
          </h1>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '2rem' }}>
              Here are some of the projects I&apos;ve worked on, showcasing my skills in various technologies 
              and problem-solving approaches.
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Portfolio Website</h3>
              <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
                This interactive portfolio featuring Three.js galaxy animations, horizontal scrolling, 
                and modern React architecture.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>React</span>
                <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>Three.js</span>
                <span style={{ background: 'rgba(77, 166, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.9rem' }}>TypeScript</span>
              </div>
            </div>

            <p style={{ opacity: 0.7, fontStyle: 'italic' }}>
              More projects coming soon...
            </p>
          </div>
        </section>

        {/* Experience Section */}
        <section ref={experienceRef} id="experience" style={{ minHeight: '100vh', paddingTop: '0rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '2rem', color: '#4da6ff' }}>
            Experience
          </h1>
          <div style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '2rem' }}>
              My professional journey in software development and the technologies I&apos;ve mastered along the way.
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Software Developer</h3>
              <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Building modern web applications and user experiences</p>
              <ul style={{ marginLeft: '1.5rem', opacity: 0.9 }}>
                <li style={{ marginBottom: '0.5rem' }}>Full-stack development with React and Node.js</li>
                <li style={{ marginBottom: '0.5rem' }}>3D web graphics with Three.js and WebGL</li>
                <li style={{ marginBottom: '0.5rem' }}>Database design and API development</li>
                <li style={{ marginBottom: '0.5rem' }}>Performance optimization and testing</li>
              </ul>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Technical Skills</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Frontend</h4>
                  <p style={{ opacity: 0.7, fontSize: '1rem' }}>React, TypeScript, Three.js, CSS</p>
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Backend</h4>
                  <p style={{ opacity: 0.7, fontSize: '1rem' }}>Node.js, Python, APIs, Databases</p>
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', opacity: 0.9 }}>Tools</h4>
                  <p style={{ opacity: 0.7, fontSize: '1rem' }}>Git, Docker, Testing, CI/CD</p>
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