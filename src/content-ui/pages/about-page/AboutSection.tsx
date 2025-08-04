import { forwardRef, Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import Starfield from '../../../background/stars/star-field/Starfield';
import AsteroidBelt from '../../../background/asteroids/AsteroidBelt';
import './AboutSection.css';

const AboutSection = forwardRef<HTMLElement>((props, ref) => {

  return (
    <section ref={ref} id="about" className="about-section">
      <div className="starfield-background">
        <Canvas
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <Starfield 
              staticMode={false}
              starCount={500}
              enableTwinkling={true}
              enableMouseInteraction={false}
              fov={70}
              cameraPosition={{ x: 0, y: 0, z: 0 }}
            />
            <AsteroidBelt />
            <ambientLight intensity={0.1} />
          </Suspense>
        </Canvas>
      </div>
      <div className="about-content-wrapper">
        <h1>
          About Me
        </h1>
        <div className="content about-content">
        <p>
          I'm a full-stack software engineer based in Atlanta with over two years of experience developing end-to-end applications in a retail setting. 
          Recently, I've worked professionally with Angular, Java, C#, Azure, Kubernetes, and PostgreSQL.
        </p>
        <p>
          I enjoy the process of building and the satisfaction that comes from connecting the dots in software systems. 
          Lately, I've been exploring AI, particularly agentic coding, and uncovering new ways to enhance my learning and become a more effective developer.
        </p>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;