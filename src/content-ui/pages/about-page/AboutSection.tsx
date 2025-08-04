import { forwardRef, Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import Starfield from '../../../background/stars/star-field/Starfield';
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
        >
          <Suspense fallback={null}>
            <Starfield 
              staticMode={false}
              starCount={500}
              enableTwinkling={true}
              enableMouseInteraction={false}
              fov={75}
              cameraPosition={{ x: 0, y: 0, z: 0 }}
            />
            <ambientLight intensity={0.3} />
          </Suspense>
        </Canvas>
      </div>
      <div className="about-content-wrapper">
        <h1>
          About Me
        </h1>
        <div className="content about-content">
        <p>
          Hey, I&apos;m Josh! This website is just a cool side project I&apos;m working on to see what can be created 
          using almost entirely AI (with very minimal coding from me besides fixes and cleanup/organization).
        </p>
        <p>
          The site is constantly being worked on and improved, so expect to see new features and 
          enhancements as I continue experimenting with different AI tools and techniques.
        </p>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;