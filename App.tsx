import React, { useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { parseMarkdownData } from './services/parser';

const App: React.FC = () => {
  // Parse data once on mount (or memoize it)
  const projects = useMemo(() => parseMarkdownData(), []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard projects={projects} />} />
          <Route path="/projects" element={<ProjectList projects={projects} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
