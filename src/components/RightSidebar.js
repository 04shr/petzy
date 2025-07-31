import React, { useState, useEffect } from 'react';

const RightSidebar = () => {
  const [stats, setStats] = useState({
    health: 85,
    energy: 92,
    happiness: 78,
    bond: 94,
    trust: 89,
    loyalty: 96
  });

  // Simulate real-time stat updates
  useEffect(() => {
    const updateStats = () => {
      if (Math.random() > 0.7) {
        setStats(prevStats => ({
          ...prevStats,
          health: Math.max(70, Math.min(100, prevStats.health + Math.floor(Math.random() * 6) - 3)),
          energy: Math.max(70, Math.min(100, prevStats.energy + Math.floor(Math.random() * 6) - 3)),
          happiness: Math.max(70, Math.min(100, prevStats.happiness + Math.floor(Math.random() * 6) - 3))
        }));
      }
    };

    const interval = setInterval(updateStats, 5000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  const StatItem = ({ label, value, icon = '' }) => (
    <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
      <span>{label}</span>
      <span className="font-bold text-green-400 text-shadow-sm">{icon} {value}%</span>
    </div>
  );

  const ProgressBar = ({ value }) => (
    <div className="w-full h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden mt-1">
      <div 
        className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );

  return (
    <aside className="w-72 bg-black bg-opacity-40 backdrop-blur-3xl border-l-2 border-white border-opacity-20 p-4 relative overflow-y-auto">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 animate-pulse-slow"></div>
      
      {/* Stats Header */}
      <div className="text-center mb-6">
        <div className="font-['Orbitron'] text-white text-xl font-bold mb-2">🐾 Pet Stats</div>
        <div className="text-white text-opacity-70 text-sm">Real-time Metrics</div>
      </div>

      {/* Health Status Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 mb-4">
        <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          🏥 Health Status
        </div>
        <StatItem label="Health" value={stats.health} />
        <ProgressBar value={stats.health} />
        <StatItem label="Energy" value={stats.energy} />
        <ProgressBar value={stats.energy} />
        <StatItem label="Happiness" value={stats.happiness} />
        <ProgressBar value={stats.happiness} />
      </div>

      {/* Relationship Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 mb-4">
        <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          💫 Relationship
        </div>
        <StatItem label="Bond Level" value={stats.bond} icon="❤️" />
        <ProgressBar value={stats.bond} />
        <StatItem label="Trust" value={stats.trust} icon="🤝" />
        <ProgressBar value={stats.trust} />
        <StatItem label="Loyalty" value={stats.loyalty} icon="🛡️" />
        <ProgressBar value={stats.loyalty} />
      </div>

      {/* Activity Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 mb-4">
        <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          📊 Activity
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>Games Played</span>
          <span className="font-bold text-green-400">47</span>
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>Training Hours</span>
          <span className="font-bold text-green-400">23.5h</span>
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>Achievements</span>
          <span className="font-bold text-green-400">🏆 28</span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4">
        <div className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          🎯 Progress
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>XP Earned</span>
          <span className="font-bold text-green-400">2,350</span>
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>Coins</span>
          <span className="font-bold text-green-400">🪙 1,250</span>
        </div>
        <div className="flex justify-between items-center my-2 text-white text-opacity-80 text-sm">
          <span>Streak</span>
          <span className="font-bold text-green-400">🔥 12 days</span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;