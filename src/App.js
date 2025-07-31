import React from 'react';
import BackgroundParticles from './components/BackgroundParticles';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';

function App() {
  return (
    <div className="font-['Space_Grotesk'] bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 h-screen overflow-hidden relative">
      <BackgroundParticles />
      
      <div className="grid grid-cols-[280px_1fr_280px] h-screen gap-0">
        <LeftSidebar />
        <MainContent />
        <RightSidebar />
      </div>
    </div>
  );
}

export default App;