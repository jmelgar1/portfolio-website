import { forwardRef } from 'react';
import './AboutSection.css';

const AboutSection = forwardRef<HTMLElement>((props, ref) => {

  return (
    <section ref={ref} id="about" className="about-section">
      <div className="about-content-wrapper">
        <h1>
          About Me
        </h1>
        <h2 style={{ marginBottom: '2rem' }}>
          Josh Melgar - Full Stack Engineer | 2+ Years of Experience
        </h2>
        <div className="content about-content">
          <p>
            I am a software engineer based in Atlanta with over two years of experience developing end-to-end applications in a retail environment. 
            Currently, I work on a team that utilizes <strong>Angular, Java, Node.js, C#, Azure, Kubernetes, and PostgreSQL.</strong>
          </p>
          <p>
            I currently serve as a Software Engineer at <strong>DICK'S Sporting Goods</strong> on the Vertical Brands team, where I contribute to the expansion and maintenance of an internal
            web application that streamlines the retail product creation process. Our team ensures that stakeholders involved in product development have an efficient
            and intuitive platform to support DICK'S continuous creation of new products for their vertical brands.
          </p>
          <p>
            Previously, I participated in <strong>DICK'S technology development program</strong>, where I worked across three different teams—backend, frontend, and full-stack where I gained valuable
            insight into the multifaceted nature of software engineering. I am passionate about the development process and find great satisfaction in creating cohesive software systems. 
            Recently, I have been exploring artificial intelligence, particularly <strong>agentic coding</strong>, and discovering innovative approaches to accelerate my professional growth as a developer.
          </p>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;