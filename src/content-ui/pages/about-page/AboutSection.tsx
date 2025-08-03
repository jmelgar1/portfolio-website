import { forwardRef, Suspense, useMemo } from 'react';
import { Canvas } from "@react-three/fiber";
import './AboutSection.css';

const AboutSection = forwardRef<HTMLElement>((props, ref) => {
  const starPositions = useMemo(() => {
    const STAR_COUNT = 1500;
    const depth = 200;
    const cameraFov = 75;
    const cameraAspect = window.innerWidth / window.innerHeight;
    const fovRad = (cameraFov * Math.PI) / 180;
    const halfHeight = Math.tan(fovRad / 2) * depth;
    const halfWidth = halfHeight * cameraAspect;
    
    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2 * halfWidth;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * halfHeight;
      positions[i * 3 + 2] = -depth;
    }
    return positions;
  }, []);

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
            <group>
              {/* Static stars that don't move with mouse */}
              <points>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    array={starPositions}
                    count={1500}
                    itemSize={3}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.12}
                  color="#ffffff"
                  transparent={true}
                  opacity={1.0}
                  sizeAttenuation={false}
                />
              </points>
            </group>
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