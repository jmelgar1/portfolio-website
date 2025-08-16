import { useState, useEffect, useRef } from "react";
import "./OverlayNavigation.css";

interface OverlayNavigationProps {
  onSectionChange?: (section: string) => void;
}

const OverlayNavigation = ({ onSectionChange }: OverlayNavigationProps) => {
  const [activeSection, setActiveSection] = useState("about");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { id: "about", label: "ABOUT ME" },
    { id: "projects", label: "PROJECTS" },
    { id: "experience", label: "EXPERIENCE" }
  ];

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const scrollContainer = document.querySelector('.page-content');
    
    if (element && scrollContainer) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling flag to prevent flicker during animation
      setIsScrolling(true);
      setActiveSection(sectionId);
      onSectionChange?.(sectionId);
      
      // Get the element's position relative to the scroll container
      const elementTop = element.offsetTop;
      
      // Small offset to position header nicely below nav
      const offset = 20;
      
      scrollContainer.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 1000); // Smooth scroll typically takes ~500-800ms
    }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Skip scroll detection during programmatic scrolling
      if (isScrolling) return;
      
      const scrollContainer = e.target as HTMLElement;
      const sections = navItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }));

      const scrollTop = scrollContainer.scrollTop;
      
      // Use a simple offset for detecting which section is visible
      const scrollPosition = scrollTop + 100; // 100px buffer for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          if (sectionTop <= scrollPosition) {
            if (activeSection !== section.id) {
              setActiveSection(section.id);
              onSectionChange?.(section.id);
            }
            break;
          }
        }
      }
    };

    const scrollContainer = document.querySelector('.page-content');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        // Clean up timeout on unmount
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
    
    return () => {
      // Clean up timeout on unmount
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeSection, onSectionChange, navItems, isScrolling]);

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
};

export default OverlayNavigation;