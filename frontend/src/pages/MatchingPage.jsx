import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Sparkles, Users, ArrowRight } from 'lucide-react';

const MatchingPage = () => {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-glow" aria-hidden="true" />
      <div className="coming-soon-icon">
        <Target size={56} strokeWidth={1.5} />
      </div>
      <div className="coming-soon-badge">
        <Sparkles size={12} aria-hidden="true" />
        Coming Soon
      </div>
      <h1>Smart Matching</h1>
      <p>
        Our AI-powered matching algorithm will pair you with the most
        compatible skill-trade partners based on your goals, availability,
        and learning style.
      </p>
      <div className="coming-soon-features">
        <div className="csf-item">
          <Users size={18} aria-hidden="true" />
          <span>AI-powered partner recommendations</span>
        </div>
        <div className="csf-item">
          <Target size={18} aria-hidden="true" />
          <span>Skill compatibility scoring</span>
        </div>
        <div className="csf-item">
          <Sparkles size={18} aria-hidden="true" />
          <span>Timezone & language matching</span>
        </div>
      </div>
      <Link to="/posts" className="btn btn-primary btn-lg">
        Browse Posts Instead
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
};

export default MatchingPage;
