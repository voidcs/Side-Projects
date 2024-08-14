import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Projects from './pages/Projects';
import WallOfEntropy from './pages/WallOfEntropy';
import VocableForage from './pages/VocableForage';
import ParallelVisualizer from './pages/ParallelVisualizer';
import NotFound from './pages/NotFound';
import Header from './components/Header/Header';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <div style={{ paddingTop: '100px' }}> {/* Adjusted padding to push content below header */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/wall-of-entropy" element={<WallOfEntropy />} />
            <Route path="/projects/vocable-forage" element={<VocableForage />} />
            <Route path="/projects/parallel-visualizer" element={<ParallelVisualizer />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} /> {/* This handles 404 pages */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
