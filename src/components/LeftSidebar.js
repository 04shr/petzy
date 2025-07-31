import React from 'react';

const LeftSidebar = () => {
  const navItems = [
    { icon: '🏠', name: 'Home Base' },
    { icon: '📊', name: 'Dashboard' },
    { icon: '🏆', name: 'Achievements' },
    { icon: '📈', name: 'Progress' },
    { icon: '🎯', name: 'Challenges' },
    { icon: '⚙️', name: 'Settings' }
  ];

  return (
    <aside className="w-72 bg-black bg-opacity-40 backdrop-blur-3xl border-r-2 border-white border-opacity-20 p-4 relative overflow-y-auto">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse-slow"></div>
      
      {/* Logo */}
      <div className="text-center mb-6 relative">
        <span className="text-4xl block mb-2 animate-bounce-slow">🐶</span>
        <h1 className="font-['Orbitron'] text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent animate-glow">
          Petzy
        </h1>
      </div>
      
      {/* User Profile */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 mb-4 text-center">
        <div className="w-15 h-15 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl animate-pulse-slow">
          🎮
        </div>
        <div className="text-white font-bold text-lg mb-1">Champion Player</div>
        <div className="bg-gradient-to-r from-pink-400 to-red-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Level 42 Master
        </div>
      </div>
      
      {/* Navigation Menu */}
      <ul className="space-y-3">
        {navItems.map((item, index) => (
          <li key={index}>
            <a 
              href="#" 
              className="nav-link-hover flex items-center p-3 text-white rounded-xl transition-all duration-300 bg-white bg-opacity-5 border border-transparent hover:transform hover:translate-x-2 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30 font-semibold text-sm relative overflow-hidden"
            >
              <span className="mr-3 text-base">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LeftSidebar;