import React from "react";
import GithubIcon from "../../assets/icons/github.svg?react";
import LinkedinIcon from "../../assets/icons/linkedin.svg?react";
import "./SocialButtons.css";

const SocialButtons = () => {
  return (
    <div className="bottom-left-buttons">
      <button className="resume-button">
        MY RESUME
      </button>
      <button className="icon-button github-button">
        <GithubIcon />
      </button>
      <button className="icon-button linkedin-button">
        <LinkedinIcon />
      </button>
    </div>
  );
};

export default SocialButtons;