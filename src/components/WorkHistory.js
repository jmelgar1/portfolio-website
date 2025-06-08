import React from 'react';
import './WorkHistory.css';

const WorkHistory = () => {
  const workExperience = [
    {
      id: 1,
      company: "Tech Solutions Inc.",
      position: "Full Stack Developer",
      duration: "2022 - Present",
      description: "Developed and maintained web applications using React, Node.js, and MongoDB. Collaborated with cross-functional teams to deliver high-quality software solutions.",
      technologies: ["React", "Node.js", "MongoDB", "JavaScript", "CSS3", "HTML5"]
    },
    {
      id: 2,
      company: "Digital Innovations LLC",
      position: "Junior Web Developer",
      duration: "2021 - 2022",
      description: "Assisted in building responsive web applications and contributed to both frontend and backend development. Gained experience in modern web development practices.",
      technologies: ["JavaScript", "HTML5", "CSS3", "Bootstrap", "PHP", "MySQL"]
    }
  ];

  return (
    <section className="work-history">
      <div className="section-content">
        <h2 className="section-title">Work Experience</h2>
        <div className="work-timeline">
          {workExperience.map((job) => (
            <div key={job.id} className="work-item">
              <div className="work-header">
                <h3 className="job-title">{job.position}</h3>
                <span className="company">{job.company}</span>
                <span className="duration">{job.duration}</span>
              </div>
              <p className="job-description">{job.description}</p>
              <div className="technologies">
                {job.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkHistory; 