import React, { useState, useRef } from 'react';
import PetModel from './PetModel';

const MainContent = () => {
  const [currentZone, setCurrentZone] = useState('fun');
  const [notification, setNotification] = useState('');
  const petRef = useRef(); // ✅ ref for PetModel

  const zoneActions = {
    fun: [
      { action: 'feed', icon: '🍖', name: 'Feed' },
      { action: 'play', icon: '🎾', name: 'Play' },
      { action: 'sleep', icon: '😴', name: 'Sleep' },
      { action: 'groom', icon: '🛁', name: 'Groom' }
    ],
    intellectual: [
      { action: 'talk', icon: '💬', name: 'Talk' },
      { action: 'answer', icon: '❓', name: 'Answer' },
      { action: 'fact', icon: '📚', name: 'Fact' },
      { action: 'what', icon: '🤔', name: 'What' }
    ]
  };

  const actionMessages = {
    feed: 'Your pet is enjoying a delicious meal! 🍖',
    play: 'Fetch time! Your pet is having a blast! 🎾',
    groom: 'Your pet looks amazing and feels fresh! ✨',
    sleep: 'Sweet dreams! Your pet is resting peacefully 😴',
    talk: 'Having a wonderful conversation with your pet! 💬',
    answer: 'Your pet is thinking about the answer! ❓',
    fact: 'Learning interesting facts together! 📚',
    what: 'Exploring new questions and curiosities! 🤔'
  };

  const toggleZone = () => {
    const newZone = currentZone === 'fun' ? 'intellectual' : 'fun';
    setCurrentZone(newZone);
    const zoneName = newZone === 'fun' ? 'Fun Zone' : 'Intellectual Zone';
    showNotification(`Switched to ${zoneName}! 🔄`);
  };

  const handleAction = (action) => {
    showNotification(actionMessages[action] || 'Action completed! ✨');
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <main className="flex-1 p-4 flex flex-col h-screen relative">
      {/* Header */}
      <header className="flex justify-center items-center mb-4 p-4 bg-white bg-opacity-10 backdrop-blur-3xl rounded-3xl border border-white border-opacity-20 relative overflow-hidden">
        <div className="text-2xl font-bold text-white text-shadow-md text-center">
          🎮 Welcome to the Ultimate Pet Experience! 🐾
        </div>
      </header>

      {/* Pet Showcase */}
    <section className="flex flex-col items-center p-4">
  <div className="w-full max-w-xs aspect-square">
    <PetModel ref={petRef} modelPath="/models/mouth.glb" className="w-full h-full object-contain" />
  </div>
</section>

      {/* Zone Toggle Button */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={toggleZone}
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-none rounded-3xl text-black font-bold cursor-pointer transition-all duration-300 shadow-lg shadow-yellow-400/40 text-lg min-w-48 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/60"
        >
          {currentZone === 'fun' ? 'Fun Zone' : 'Intellectual Zone'} 🔄
        </button>
      </div>

      {/* Zone Actions */}
      <section className="grid grid-cols-4 gap-4">
        {zoneActions[currentZone].map((actionData, index) => (
          <button
            key={index}
            onClick={() => handleAction(actionData.action)}
            className="p-4 bg-white bg-opacity-10 backdrop-blur-3xl border border-white border-opacity-20 rounded-2xl text-white font-semibold cursor-pointer transition-all duration-300 relative overflow-hidden text-center text-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/30 hover:border-cyan-400"
          >
            <span className="text-2xl block mb-1">{actionData.icon}</span>
            <span>{actionData.name}</span>
          </button>
        ))}
      </section>

      {/* Notification */}
      {notification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400/90 via-blue-500/90 to-purple-500/90 text-white px-8 py-4 rounded-2xl font-bold z-50 backdrop-blur-3xl border border-white border-opacity-30 animate-pulse">
          {notification}
        </div>
      )}
    </main>
  );
};

export default MainContent;