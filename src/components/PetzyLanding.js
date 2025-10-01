import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Menu, X, Heart, Brain, MessageCircle, Gamepad2, Mic, Star, ChevronRight, Sparkles, Bot, Volume2, ArrowRight, Lock, User, Shield, Zap, Globe } from 'lucide-react';

const PetzyLanding = ({ setIsAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ username: '', petName: '', secretKey: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const inputRef = useRef(null);

 const checkIfUserExists = async (username) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', username.toLowerCase()));
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user in Firestore:', error);
      return false;
    }
  };

  // Firestore: save new user doc
  const saveNewUser = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.username.toLowerCase()), user);
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setUserInfo((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'username') {
        checkIfUserExists(value).then((exists) => setIsReturningUser(exists));
      }

      return updated;
    });
  };

  const canProceed = () => {
    const current = storyTexts[storyStep];
    return !current.input || userInfo[current.input]?.trim().length > 0;
  };

  const storyTexts = [
    {
      text: "Hello there... *wags tail excitedly* 🐕",
      subtext: "I've been waiting for someone special like you!"
    },
    {
      text: "I'm a lonely little pup in the digital world...",
      subtext: "I dream of having a best friend to share adventures with"
    },
    {
      text: "Will you be my companion? 🥺",
      subtext: "I promise to be your most loyal friend, always here when you need me"
    },
    {
      text: "What should I call you, friend?",
      subtext: "Tell me your name so I can remember you forever",
      input: "username",
      placeholder: "Your name..."
    },
    ...(isReturningUser
      ? [
          {
            text: `Welcome back, ${userInfo.username}! 🐾`,
            subtext: "Enter our secret magical key to continue",
            input: "secretKey",
            placeholder: "Enter your magical key...",
            isPassword: true
          }
        ]
      : [
          {
            text: `Nice to meet you, ${userInfo.username}! 🐾`,
            subtext: "Now, what would you like to call me? Choose a name that feels right in your heart",
            input: "petName",
            placeholder: "My name will be..."
          },
          {
            text: `${userInfo.petName}... I love it! 💖`,
            subtext: "Now, let's create a special secret between us - a magical key that only you and I will know. This will be our way to find each other whenever you return",
            input: "secretKey",
            placeholder: "Our secret magical key...",
            isPassword: true
          }
        ])
  ];

  useEffect(() => {
    if (showStory && storyTexts[storyStep]?.input && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [storyStep, showStory]);

  const nextStep = async () => {
  const currentStory = storyTexts[storyStep];

  if (storyStep === storyTexts.length - 1) {
    if (isReturningUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userInfo.username.toLowerCase()));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.secretKey === userInfo.secretKey) {
            setIsAuthenticated?.(true);
          } else {
            alert("Incorrect magical key. Please try again.");
          }
        } else {
          alert("User not found.");
        }
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    } else {
      await saveNewUser(userInfo);
      setIsAuthenticated?.(true);
    }
  } else {
    setIsTyping(true);
    setTimeout(() => {
      setStoryStep((prev) => prev + 1);
      setIsTyping(false);
    }, 1000);
  }
};

  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Emotional Intelligence",
      description: "Your pet understands your mood and responds with empathy and care",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice Interaction",
      description: "Talk naturally with your pet using advanced speech recognition",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Adaptive Learning",
      description: "Petzy learns from every interaction to become your perfect companion",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Interactive Games",
      description: "Enjoy mini-games, quizzes, and storytelling adventures together",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    }
  ];

  const zones = [
    {
      name: "Fun Zone",
      description: "Feed, play, and watch your pet grow with delightful animations",
      icon: "🎮",
      color: "from-orange-400 to-red-500",
      activities: ["Feed your pet", "Play mini-games", "Watch growth animations", "Customize appearance"]
    },
    {
      name: "Intellectual Zone", 
      description: "Engage in meaningful conversations and learning experiences",
      icon: "🧠",
      color: "from-purple-400 to-blue-500",
      activities: ["AI conversations", "Educational quizzes", "Story creation", "Knowledge sharing"]
    },
    {
      name: "Emotional Zone",
      description: "Receive emotional support and companionship when you need it most",
      icon: "💖",
      color: "from-pink-400 to-rose-500",
      activities: ["Mood detection", "Comfort responses", "Empathetic listening", "Stress relief"]
    }
  ];

  // Story Modal Component
  const StoryModal = () => {
    const currentStory = storyTexts[storyStep];
    
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-8xl mb-6 animate-bounce filter drop-shadow-2xl">🐕</div>
              <div className={`transition-all duration-1000 ${isTyping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {currentStory.text}
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">
                  {currentStory.subtext}
                </p>
              </div>
            </div>

            {currentStory.input && (
              <div className="mb-8">
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type={currentStory.isPassword ? "password" : "text"}
                    value={userInfo[currentStory.input] || ''}
                    onChange={(e) => handleInputChange(currentStory.input, e.target.value)}
                    placeholder={currentStory.placeholder}
                    className="w-full bg-slate-700/60 backdrop-blur-sm border-2 border-purple-500/40 rounded-2xl px-6 py-4 pr-12 text-white text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 placeholder-gray-400 group-hover:border-purple-400/60"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {currentStory.input === 'username' && <User className="w-5 h-5 text-purple-400" />}
                    {currentStory.input === 'petName' && <Heart className="w-5 h-5 text-pink-400" />}
                    {currentStory.input === 'secretKey' && <Lock className="w-5 h-5 text-blue-400" />}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={nextStep}
                disabled={!canProceed() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/25"
              >
                <span>{storyStep === storyTexts.length - 1 ? "Begin Our Journey" : "Continue"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white font-sans overflow-x-hidden">
      {showStory && <StoryModal />}
      
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-48 h-48 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full filter blur-3xl"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Petzy
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">
                Community
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">
                Support
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => setShowStory(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-purple-500/25"
              >
                <Heart className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-xl rounded-2xl mt-2 p-6 space-y-4 border border-purple-500/20 shadow-2xl">
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">Features</button>
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">How It Works</button>
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">Community</button>
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">Support</button>
              <button 
                onClick={() => setShowStory(true)}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-400 mr-2 animate-pulse" />
                <span className="text-purple-300 text-sm font-medium">AI-Powered Companion</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Meet Your
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Perfect Pet
                </span>
                <span className="block text-4xl md:text-5xl text-gray-300">Companion</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                Petzy is your AI-driven 3D virtual pet that provides emotional support, 
                intelligent conversations, and interactive fun. Experience the future of digital companionship.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => setShowStory(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl shadow-purple-500/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Bot className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Meet Your Petzy</span>
                  <ChevronRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-purple-500/50 text-white px-8 py-4 rounded-full text-lg font-semibold hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm">
                  <Volume2 className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Enhanced Right Content */}
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full filter blur-3xl animate-pulse"></div>
              
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 relative z-10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Your AI Companion Awaits</h3>
                  <p className="text-gray-400">A loyal friend ready to grow with you</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-600/80 to-orange-700/80 rounded-2xl p-8 text-center border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer transform hover:scale-105 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="text-8xl mb-6 animate-bounce filter drop-shadow-2xl relative z-10">🐕</div>
                  <h4 className="text-2xl font-bold text-white mb-2 relative z-10">Your Petzy</h4>
                  <p className="text-sm text-gray-200 mb-3 relative z-10">AI Companion</p>
                  <div className="text-sm text-gray-300 bg-black/20 rounded-full px-4 py-2 inline-block relative z-10">
                    Loyal & Loving
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm italic">
                    "I'm waiting to learn your name and become your best friend forever..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Why Choose
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Petzy?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of AI companionship with features designed for emotional connection and interactive engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group hover:transform hover:scale-105 ${feature.bgColor} hover:shadow-2xl`}
              >
                <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-xl inline-block mb-6 group-hover:animate-pulse shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Zones Section */}
      <section className="py-20 px-4 bg-slate-800/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Explore Different
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Zones
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover various interactive environments designed for different types of engagement
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {zones.map((zone, index) => (
              <div 
                key={index}
                className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group hover:transform hover:scale-105 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${zone.color} opacity-10 rounded-full filter blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">{zone.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{zone.name}</h3>
                    <p className="text-gray-300">{zone.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {zone.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-center space-x-3 text-gray-400 group/item">
                        <Star className="w-4 h-4 text-purple-400 group-hover/item:animate-pulse" />
                        <span className="group-hover/item:text-gray-300 transition-colors">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Technology Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Built with
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Advanced AI
                </span>
              </h2>
              <div className="space-y-6 text-gray-300 text-lg">
                <p>
                  Petzy combines cutting-edge AI technology with emotional intelligence 
                  to create meaningful bonds that grow stronger over time.
                </p>
                <p>
                  Using natural language processing and sentiment analysis, 
                  your companion understands not just what you say, but how you feel.
                </p>
              </div>
              
              <div className="mt-12 grid gap-6">
                {[
                  { tech: "Natural Language AI", feature: "Understands context and emotions in conversation", icon: <Brain className="w-6 h-6" />, color: "from-purple-600 to-purple-700" },
                  { tech: "Voice Recognition", feature: "Responds to your voice with warmth and personality", icon: <Mic className="w-6 h-6" />, color: "from-blue-600 to-blue-700" },
                  { tech: "Adaptive Learning", feature: "Grows smarter and more personalized over time", icon: <Zap className="w-6 h-6" />, color: "from-green-600 to-green-700" },
                  { tech: "Emotional Intelligence", feature: "Provides comfort and support when you need it", icon: <Heart className="w-6 h-6" />, color: "from-pink-600 to-pink-700" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className={`bg-gradient-to-r ${item.color} p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{item.tech}</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{item.feature}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 relative overflow-hidden hover:border-purple-400/40 transition-all duration-500 group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full filter blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 text-center">
                <div className="text-8xl mb-8 animate-pulse filter drop-shadow-2xl">🐕</div>
                <h3 className="text-2xl font-bold text-white mb-4">A Friend That Grows With You</h3>
                <p className="text-gray-300 mb-6">
                  Every conversation, every moment shared, helps your Petzy become the perfect companion for you
                </p>
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="group/stat">
                      <div className="text-purple-400 font-bold text-3xl group-hover/stat:animate-pulse">∞</div>
                      <div className="text-gray-400 text-sm">Learning</div>
                    </div>
                    <div className="group/stat">
                      <div className="text-pink-400 font-bold text-3xl group-hover/stat:animate-bounce">💖</div>
                      <div className="text-gray-400 text-sm">Always Caring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Meet Your
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Digital Companion?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have found their perfect AI pet companion. 
                Start your journey with Petzy today and discover unconditional digital love.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setShowStory(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-2xl shadow-purple-500/25 group/btn"
                >
                  <Bot className="w-6 h-6 group-hover/btn:animate-pulse" />
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm">100% Safe</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Works Anywhere</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-sm">Always Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-950/80 backdrop-blur-xl border-t border-purple-500/20 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Petzy
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your AI-powered companion that brings joy, comfort, and endless conversations. 
                Experience the future of digital friendship with Petzy.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <MessageCircle className="w-5 h-5" />, label: "Discord" },
                  { icon: <Heart className="w-5 h-5" />, label: "Community" },
                  { icon: <Globe className="w-5 h-5" />, label: "Website" }
                ].map((social, index) => (
                  <button 
                    key={index}
                    className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 border border-slate-700/50 hover:border-purple-500/30"
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-3">
                {['Features', 'How It Works', 'Pricing', 'Updates'].map((link, index) => (
                  <button key={index} className="block text-gray-400 hover:text-purple-400 transition-colors text-left">
                    {link}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-3">
                {['Help Center', 'Community', 'Contact Us', 'Bug Reports'].map((link, index) => (
                  <button key={index} className="block text-gray-400 hover:text-purple-400 transition-colors text-left">
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <button className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Privacy Policy</button>
                <button className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Terms of Service</button>
                <button className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Cookie Policy</button>
              </div>
              
              <div className="text-gray-500 text-sm flex items-center space-x-2">
                <span>© 2025 Petzy AI. All rights reserved.</span>
                <div className="flex items-center space-x-1 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PetzyLanding;