import React from 'react';
import { Link } from 'react-router-dom';

const Projects: React.FC = () => {
  return (
    <div>
      <h1>Projects</h1>
      <div>
        <p>
          <Link to="/projects/wall-of-entropy">Wall of Entropy</Link>
        </p>
        <p>
          <Link to="/projects/vocable-forage">Vocable Forage</Link>
        </p>
        <p>
          <Link to="/projects/parallel-visualizer">Parallel Visualizer</Link>
        </p>
      </div>
    </div>
  );
};

export default Projects;
