import GithubIcon from "../../assets/icons/github.svg?react";
import LinkedinIcon from "../../assets/icons/linkedin.svg?react";
import "./SocialButtons.css";

const GITHUB_URL = "https://github.com/jmelgar1"; 
const LINKEDIN_URL = "https://www.linkedin.com/in/josh-melgar/";
const PORTFOLIO_SERVICE = import.meta.env.VITE_PORTFOLIO_SERVICE;
const RESUME_ENDPOINT = import.meta.env.VITE_RESUME_URL;
const RESUME_URL = `${PORTFOLIO_SERVICE}${RESUME_ENDPOINT}`;

const SocialButtons = () => {
  const handleResumeClick = async () => {
    try {
      const response = await fetch(RESUME_URL);
      const data = await response.json();
      
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
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