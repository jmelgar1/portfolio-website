import GithubIcon from "../../assets/icons/github.svg?react";
import LinkedinIcon from "../../assets/icons/linkedin.svg?react";
import "./SocialButtons.css";

const GITHUB_URL = "https://github.com/jmelgar1"; 
const LINKEDIN_URL = "https://www.linkedin.com/in/josh-melgar/";
const RESUME_URL = import.meta.env.VITE_RESUME_URL;

const SocialButtons = () => {
  const handleResumeClick = async () => {
    try {
      console.log('Fetching resume from:', RESUME_URL);
      const response = await fetch(RESUME_URL);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.signedUrl) {
        console.log('Opening signed URL:', data.signedUrl);
        window.open(data.signedUrl, '_blank');
      } else {
        console.warn('No signedUrl found in response');
      }
    } catch (error) {
      console.error('Error fetching resume URL:', error);
    }
  };

  return (
    <div className="bottom-left-buttons">
      <button className="resume-button" onClick={handleResumeClick}>
        MY RESUME
      </button>
      <button 
        className="icon-button github-button"
        onClick={() => window.open(GITHUB_URL, '_blank')}
      >
        <GithubIcon />
      </button>
      <button 
        className="icon-button linkedin-button"
        onClick={() => window.open(LINKEDIN_URL, '_blank')}
      >
        <LinkedinIcon />
      </button>
    </div>
  );
};

export default SocialButtons;