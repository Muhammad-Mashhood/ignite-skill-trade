import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-glow" aria-hidden="true" />
      <div className="not-found-ghost" aria-hidden="true">
        <Ghost size={64} strokeWidth={1.5} />
      </div>
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} aria-hidden="true" />
          Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-secondary btn-lg">
          <ArrowLeft size={18} aria-hidden="true" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
