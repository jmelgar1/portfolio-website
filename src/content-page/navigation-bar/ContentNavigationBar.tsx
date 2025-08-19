import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import "./ContentNavigationBar.css";

interface OverlayNavigationProps {
  onSectionChange?: (section: string) => void;
}

export interface ContentNavigationBarRef {
  scrollToSection: (sectionId: string) => void;
}

const OverlayNavigation = forwardRef<ContentNavigationBarRef, OverlayNavigationProps>(({ onSectionChange }, ref) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("about");
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { id: "about", label: "ABOUT ME" },
    { id: "projects", label: "PROJECTS" },
    { id: "experience", label: "EXPERIENCE" }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const scrollContainer = document.querySelector('.page-content');
    
    if (element && scrollContainer) {
      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Set navigation flag to prevent scroll detection interference
      setIsNavigating(true);
      setActiveSection(sectionId);
      onSectionChange?.(sectionId);
      
      // Get the element's position relative to the scroll container
      const elementTop = element.offsetTop;
      
      // Small offset to position header nicely below nav
      const offset = 120;
      
      scrollContainer.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
      
      // Reset navigation flag after animation completes
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        navigationTimeoutRef.current = null;
      }, 800);
    }
  };

  const handleNavClick = (sectionId: string) => {
    // Navigate to the appropriate URL based on section
    const urlMap: Record<string, string> = {
      about: "/about",
      projects: "/projects", 
      experience: "/experience"
    };
    
    // Update URL first
    navigate(urlMap[sectionId] || "/about");
    
    // Then scroll to the section with a small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 50);
  };

  useImperativeHandle(ref, () => ({
    scrollToSection
  }));

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Skip scroll detection during programmatic navigation
      if (isNavigating) return;
      
      const scrollContainer = e.target as HTMLElement;
      const sections = navItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }));

      const scrollTop = scrollContainer.scrollTop;
      const containerHeight = scrollContainer.clientHeight;
      
      // Account for navigation bar offset
      const navOffset = 120;
      const viewportTop = scrollTop + navOffset;
      const viewportBottom = scrollTop + containerHeight;
      
      // Find which section takes up the majority of the visible viewport
      let maxVisibleArea = 0;
      let mostVisibleSection = 'about';
      
      sections.forEach(section => {
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          const sectionHeight = section.element.offsetHeight;
          const sectionBottom = sectionTop + sectionHeight;
          
          // Calculate visible area within the actual viewport (below nav)
          const visibleTop = Math.max(viewportTop, sectionTop);
          const visibleBottom = Math.min(viewportBottom, sectionBottom);
          const visibleArea = Math.max(0, visibleBottom - visibleTop);
          
          // Calculate percentage of viewport this section occupies
          const viewportHeight = viewportBottom - viewportTop;
          const visibilityPercentage = visibleArea / viewportHeight;
          
          // Section must occupy at least 50% of viewport to be considered active
          if (visibilityPercentage > 0.5 && visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            mostVisibleSection = section.id;
          }
        }
      });
      
      if (activeSection !== mostVisibleSection) {
        setActiveSection(mostVisibleSection);
        onSectionChange?.(mostVisibleSection);
        
        // Update URL when scrolling to different section
        const urlMap: Record<string, string> = {
          about: "/about",
          projects: "/projects", 
          experience: "/experience"
        };
        navigate(urlMap[mostVisibleSection] || "/about", { replace: true });
      }
    };

    const scrollContainer = document.querySelector('.page-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
    
    return () => {
      // Clean up navigation timeout on unmount
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [activeSection, onSectionChange, navigate, isNavigating]);

  return (
    <nav className="overlay-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`overlay-nav-item ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => handleNavClick(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
});

OverlayNavigation.displayName = 'OverlayNavigation';

export default OverlayNavigation;