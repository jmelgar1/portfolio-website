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
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const offset = 120;
      
      scrollContainer.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 800); // Reduce timeout to allow manual scrolling sooner
    }
  };

  const handleNavClick = (sectionId: string) => {
    // Navigate to the appropriate URL based on section
    const urlMap: Record<string, string> = {
      about: "/about",
      projects: "/projects", 
      experience: "/experience"
    };
    
    // First navigate to update the URL
    navigate(urlMap[sectionId] || "/about");
    
    // Use a small delay to ensure DOM is ready after navigation
    // This prevents race conditions between URL change and scrolling
    setTimeout(() => {
      scrollToSection(sectionId);
    }, 50);
  };

  useImperativeHandle(ref, () => ({
    scrollToSection
  }));

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
      const containerHeight = scrollContainer.clientHeight;
      
      // Find which section takes up the majority of the viewport
      let maxVisibleArea = 0;
      let mostVisibleSection = 'about';
      
      sections.forEach(section => {
        if (section.element) {
          const sectionTop = section.element.offsetTop;
          const sectionHeight = section.element.offsetHeight;
          const sectionBottom = sectionTop + sectionHeight;
          
          // Calculate visible area of this section
          const visibleTop = Math.max(scrollTop, sectionTop);
          const visibleBottom = Math.min(scrollTop + containerHeight, sectionBottom);
          const visibleArea = Math.max(0, visibleBottom - visibleTop);
          
          if (visibleArea > maxVisibleArea) {
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
});

OverlayNavigation.displayName = 'OverlayNavigation';

export default OverlayNavigation;