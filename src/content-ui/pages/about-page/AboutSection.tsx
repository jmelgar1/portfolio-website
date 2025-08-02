import { forwardRef } from 'react';
import './AboutSection.css';

const AboutSection = forwardRef<HTMLElement>((props, ref) => {
  return (
    <section ref={ref} id="about">
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
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;