import { forwardRef } from 'react';
import './ExperienceSection.css';

const ExperienceSection = forwardRef<HTMLElement>((props, ref) => {
  const experiences = [
    {
      title: "Software Engineer II",
      company: "DICK'S Sporting Goods",
      location: "Remote",
      duration: "October 2024 - Present",
      responsibilities: [
        "Developed a product development management system using Angular and Java Spring Boot, integrating business analysts, product specialists, and over 350+ global textile vendors to streamline the product development pipeline and support the growth of vertical brands",
        "Implemented a third-party color management system into a full-stack angular application to accelerate the creation and editing of product colors. Designed custom data models and implemented RabbitMQ messaging in Java to enable seamless color data exchange, resulting in a 35% increase in product color creation",
        "Monitored system performance and resolved immediate user issues by using Kibana, Grafana, and Prometheus during on-call shifts, ensuring minimal downtime and ensuring a positive user experience",
        "Configured Azure Active Directory and Azure API Management to secure authentication and role-based access control for 2 new microservices, implementing OAuth 2.0 and JWT token validation to protect API endpoints and ensure only authorized users accessed sensitive data"
      ]
    },
    {
      title: "Software Engineer I",
      company: "DICK'S Sporting Goods",
      location: "Remote",
      duration: "May 2023 - October 2024",
      responsibilities: [
        "Collaborated with the loyalty rewards program software team to integrate store-wide rewards details, such as usage count and financial impact, into a mobile application. Leveraged APIs, Java, C#, and .NET to provide in-store employees with actionable insights on district performance, driving a 12% increase in loyalty account creations",
        "Helped develop a real-time reward points processing system using Java and C#, replacing daily batch processing to enable customers to instantly view earned points in their loyalty rewards account after each purchase",
        "Enhanced a mobile application with React Native, TypeScript, and C# to include a revamped store metrics page and custom leaderboards, boosting Dick's Sporting Goods credit card sign-ups by 7% with providing real-time performance data and incentivizing employees to compete for the most sign-ups",
        "Enhanced the store task creation interface in a React web application administrative tool by developing new front-end components using React and JavaScript, implementing flexible date manipulation logic in C#, and redesigning permissions to open up access to more users, resulting in improved operational efficiency and greater flexibility for task management"
      ]
    },
    {
      title: "Network Engineer Intern",
      company: "DICK'S Sporting Goods",
      location: "Pittsburgh, PA",
      duration: "June 2022 - August 2022",
      responsibilities: [
        "Created customizable dashboards that pulls specific jobs and functionalities from the network engineering resources and organizes them into one user interface using Powershell",
        "Developed an AI-powered troubleshooting assistant using OpenAI's GPT-3 API to help users diagnose common network/VPN issues",
        "Implemented and automated new network configuration tasks by developing Python scripts that interfaced with network devices via APIs and SSH"
      ]
    },
    {
      title: "Computer Technician",
      company: "eBryIT. Inc",
      location: "Kennesaw, Georgia",
      duration: "June 2021 - October 2021",
      responsibilities: [
        "Created responsive websites using HTML5, CSS3, and JavaScript for diverse client portfolio",
        "Optimized website performance achieving average load times under 2 seconds across all projects",
        "Collaborated with design team to implement pixel-perfect designs and cross-browser compatibility"
      ]
    }
  ];

  return (
    <section ref={ref} id="experience">
      <h1>
        Experience
      </h1>
      <div className="content">
        <p className="intro">
          My professional journey through the software development landscape, showcasing growth from intern to senior developer with expertise in modern web technologies.
        </p>
        
        <div className="timeline-container">
          <div className="timeline-line" aria-hidden="true"></div>
          {experiences.map((experience, index) => (
            <article key={index} className="timeline-item">
              <div className="timeline-dot" aria-hidden="true"></div>
              <div className="timeline-content">
                <div className="job-header">
                  <h3 className="job-title">{experience.title}</h3>
                  <div className="job-meta">
                    <p className="company-name">{experience.company}</p>
                    <p className="job-duration">{experience.duration}</p>
                    <p className="job-location">{experience.location}</p>
                  </div>
                </div>
                <ul className="responsibilities-list" role="list">
                  {experience.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="skills-section">
          <h3>Core Technologies & Skills</h3>
          <div className="skills-timeline">
            <div className="skill-category">
              <h4>Frontend Development</h4>
              <div className="skill-tags">
                <span className="skill-tag">React</span>
                <span className="skill-tag">TypeScript</span>
                <span className="skill-tag">Three.js</span>
                <span className="skill-tag">CSS3</span>
                <span className="skill-tag">HTML5</span>
                <span className="skill-tag">D3.js</span>
              </div>
            </div>
            <div className="skill-category">
              <h4>Backend Development</h4>
              <div className="skill-tags">
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Express.js</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">PostgreSQL</span>
                <span className="skill-tag">MongoDB</span>
                <span className="skill-tag">REST APIs</span>
              </div>
            </div>
            <div className="skill-category">
              <h4>Tools & Practices</h4>
              <div className="skill-tags">
                <span className="skill-tag">Git</span>
                <span className="skill-tag">Docker</span>
                <span className="skill-tag">Testing</span>
                <span className="skill-tag">CI/CD</span>
                <span className="skill-tag">Agile</span>
                <span className="skill-tag">WebSocket</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ExperienceSection.displayName = 'ExperienceSection';

export default ExperienceSection;