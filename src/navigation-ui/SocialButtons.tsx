import GithubIcon from "../assets/icons/github.svg?react";
import LinkedinIcon from "../assets/icons/linkedin.svg?react";
import "./SocialButtons.css";

const GITHUB_URL = "https://github.com/jmelgar1";
const LINKEDIN_URL = "https://www.linkedin.com/in/josh-melgar/";

const SocialButtons = () => {
  return (
    <div className="bottom-left-buttons">
      <button className="resume-button">
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