import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OverlayPage from "./background/ImmersiveBackground";
import AboutSection from "./modules/about-module/AboutSection";
import ProjectsSection from "./modules/projects-module/ProjectsSection";
import ExperienceSection from "./modules/experience-module/ExperienceSection";
import ContentNavigationBar, { ContentNavigationBarRef } from "./navigation-bar/ContentNavigationBar";
import './ContentPage.css';

const ContentPage = () => {
  const location = useLocation();
  const aboutRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);
  const experienceRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<ContentNavigationBarRef>(null);
  
  const [, setActiveSection] = useState("about");

  useEffect(() => {
    // Update active section state based on URL and sync with navigation bar
    let sectionId = 'about';
    
    if (location.pathname === '/projects') {
      sectionId = 'projects';
    } else if (location.pathname === '/experience') {
      sectionId = 'experience';
    } else if (location.pathname === '/about') {
      sectionId = 'about';
    }

    setActiveSection(sectionId);
    
    // Ensure navigation bar is in sync when URL changes from external sources
    // (like browser back/forward buttons or direct URL access)
    if (navigationRef.current) {
      // Use a small delay to ensure the navigation bar has mounted
      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.scrollToSection(sectionId);
        }
      }, 100);
    }
  }, [location.pathname]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <OverlayPage>
      <ContentNavigationBar ref={navigationRef} onSectionChange={handleSectionChange} />
      <div className="portfolio-sections">
        <AboutSection ref={aboutRef} />
        <ProjectsSection ref={projectsRef} />
        <ExperienceSection ref={experienceRef} />
      </div>
    </OverlayPage>
  );
};

export default ContentPage;