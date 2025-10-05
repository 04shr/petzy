import React, { useState, useEffect } from "react";
import { usePreferences } from "../hooks/usePreferences";

const LeftSidebar = ({ dailyActions }) => {
  const [preferences, updatePreferences] = usePreferences();

  const navItems = [
    { icon: "🏠", name: "Home Base" },
    { icon: "⚙️", name: "Settings" },
  ];

  // Daily action counters
  const [dailyLog, setDailyLog] = useState({
    feed: 0,
    play: 0,
    groom: 0,
    rest: 0,
  });

  // Dynamically calculate stats
  const computeStats = (log) => {
    const stats = {};

    // Hunger: 0-100, +20 per feed, max 100
    stats.hunger = Math.min(100, log.feed * 20);
    // Happiness: +25 per play
    stats.happiness = Math.min(100, log.play * 25);
    // Energy: starts 100, -15 per play, +10 per feed, +20 per rest
    stats.energy = Math.max(0, Math.min(100, 100 - log.play * 15 + log.feed * 10 + log.rest * 20));
    // Love: +15 per groom
    stats.love = Math.min(100, log.groom * 15);
    // XP: +10 per action
    stats.xp = Math.min(100, (log.feed + log.play + log.groom + log.rest) * 10);
    // Streak: 1 if minimum daily requirements met, else 0
    stats.streak = log.feed >= 3 && log.play >= 4 ? 1 : 0;

    return stats;
  };

  // Update dailyLog whenever actions happen
  useEffect(() => {
    if (!dailyActions || !dailyActions.length) return;

    const newLog = { ...dailyLog };
    dailyActions.forEach((action) => {
      if (newLog[action] !== undefined) {
        newLog[action] += 1;
      }
    });

    setDailyLog(newLog);
  }, [dailyActions]);

  // Update preferences whenever dailyLog changes
  useEffect(() => {
    const stats = computeStats(dailyLog);
    updatePreferences({ stats });
  }, [dailyLog]);

  const stats = computeStats(dailyLog);

  return (
    <aside className="w-72 h-screen bg-black bg-opacity-40 backdrop-blur-3xl border-r-2 border-white border-opacity-20 p-4 relative overflow-y-auto no-scrollbar">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse-slow"></div>

      {/* Logo */}
      <div className="text-center mb-6 relative">
        <span className="text-4xl block mb-2 animate-bounce-slow">🐶</span>
        <h1 className="font-['Orbitron'] text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent animate-glow">
          Petzy
        </h1>
      </div>

      {/* Pet Status Panel */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 mb-4 text-white">
        <h2 className="font-bold text-lg mb-3 text-center">🐾 Pet Status</h2>
        <div className="space-y-4">
          {Object.entries(stats).map(([key, value], idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key}</span>
                <span>{key === "streak" ? value : `${value}%`}</span>
              </div>
              {key !== "streak" && (
                <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      key === "hunger"
                        ? "bg-yellow-400"
                        : key === "happiness"
                        ? "bg-green-400"
                        : key === "energy"
                        ? "bg-blue-400"
                        : key === "love"
                        ? "bg-pink-400"
                        : "bg-orange-400"
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
