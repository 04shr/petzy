// src/components/PetzyLanding.js
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Heart, Brain, MessageCircle, Gamepad2, Mic, Star, ChevronRight, Sparkles, Bot, Volume2, ArrowRight, Lock, User, Shield, Zap, Globe } from 'lucide-react';
import usePreferences, { checkIfUserExists, createUser, verifyUser } from "../hooks/usePreferences";

const PetzyLanding = ({ setIsAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ username: "", petName: "", secretKey: "" });
  const [isTyping, setIsTyping] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const inputRef = useRef(null);

  // hook for preferences in landing (not used heavily here, but kept for parity)
  const [prefs] = usePreferences();

  // debounce ref for username checks
  const checkDebounceRef = useRef(null);

  // storyTexts depends on isReturningUser and userInfo
  const storyTexts = [
    { text: "Hello there... *wags tail excitedly* 🐕", subtext: "I've been waiting for someone special like you!" },
    { text: "I'm a lonely little pup in the digital world...", subtext: "I dream of having a best friend to share adventures with" },
    { text: "Will you be my companion? 🥺", subtext: "I promise to be your most loyal friend, always here when you need me" },
    { text: "What should I call you, friend?", subtext: "Tell me your name so I can remember you forever", input: "username", placeholder: "Your name..." },
    ...(isReturningUser
      ? [
          { text: `Welcome back, ${userInfo.username || ""}! 🐾`, subtext: "Enter our secret magical key to continue", input: "secretKey", placeholder: "Enter your magical key...", isPassword: true }
        ]
      : [
          { text: `Nice to meet you, ${userInfo.username || ""}! 🐾`, subtext: "Now, what would you like to call me? Choose a name that feels right in your heart", input: "petName", placeholder: "My name will be..." },
          { text: `${userInfo.petName || ""}... I love it! 💖`, subtext: "Now, let's create a special secret between us - a magical key that only you and I will know. This will be our way to find each other whenever you return", input: "secretKey", placeholder: "Our secret magical key...", isPassword: true }
        ])
  ];

  useEffect(() => {
    if (showStory && storyTexts[storyStep]?.input && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [showStory, storyStep]); // storyTexts references userInfo, but it's fine to rely on storyStep

  // handle input change with username existence debounce
  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));

    if (field === "username") {
      // reset returning user flag until debounce resolves
      setIsReturningUser(false);
      if (checkDebounceRef.current) clearTimeout(checkDebounceRef.current);

      const trimmed = value.trim();
      if (trimmed.length < 3) return;

      checkDebounceRef.current = setTimeout(async () => {
        try {
          const exists = await checkIfUserExists(trimmed);
          setIsReturningUser(Boolean(exists));
        } catch (err) {
          console.error("username check failed", err);
          setIsReturningUser(false);
        }
      }, 400); // 400ms debounce
    }
  };

  const canProceed = () => {
    const current = storyTexts[storyStep];
    return !current.input || (userInfo[current.input]?.trim().length > 0);
  };

  // next step: either show next story or finalize signup/login
  const nextStep = async () => {
    const currentStory = storyTexts[storyStep];

    if (storyStep === storyTexts.length - 1) {
      // finalize
      if (isReturningUser) {
        // login flow
        try {
          const res = await verifyUser(userInfo.username, userInfo.secretKey);
          if (res.ok) {
            const unameLc = userInfo.username.trim().toLowerCase();
            localStorage.setItem("petzy_current_username", unameLc);
            setCurrentUsername(userInfo.username.trim());
            setIsAuthenticated?.(true);
            // clear secret from memory
            setUserInfo((p) => ({ ...p, secretKey: "" }));
          } else {
            if (res.reason === "not_found") alert("User not found.");
            else if (res.reason === "wrong_password") alert("Incorrect magical key. Please try again.");
            else alert("Login failed. Try again later.");
          }
        } catch (err) {
          console.error("verify error", err);
          alert("Error verifying user. See console.");
        }
      } else {
        // signup flow
        try {
          if (!userInfo.username?.trim() || !userInfo.petName?.trim() || !userInfo.secretKey) {
            alert("Please provide username, pet name and a secret key.");
            return;
          }
          const createRes = await createUser({
            username: userInfo.username,
            petName: userInfo.petName,
            secretKey: userInfo.secretKey
          });

          if (createRes.ok) {
            const unameLc = userInfo.username.trim().toLowerCase();
            localStorage.setItem("petzy_current_username", unameLc);
            setCurrentUsername(userInfo.username.trim());
            setIsAuthenticated?.(true);
            // clear secret from memory
            setUserInfo((p) => ({ ...p, secretKey: "" }));
          } else {
            alert("Failed to create user: " + (createRes.reason || "unknown error"));
          }
        } catch (err) {
          console.error("createUser error", err);
          alert("Error creating user. See console.");
        }
      }
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setStoryStep((s) => s + 1);
        setIsTyping(false);
      }, 700);
    }
  };

  // UI: story modal
  const StoryModal = () => {
    const currentStory = storyTexts[storyStep];
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-8xl mb-6 animate-bounce filter drop-shadow-2xl">🐕</div>
              <div className={`transition-all duration-700 ${isTyping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                <h3 className="text-3xl font-bold text-white mb-4 leading-tight">{currentStory.text}</h3>
                <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto">{currentStory.subtext}</p>
              </div>
            </div>

            {currentStory.input && (
              <div className="mb-8">
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type={currentStory.isPassword ? "password" : "text"}
                    value={userInfo[currentStory.input] || ""}
                    onChange={(e) => handleInputChange(currentStory.input, e.target.value)}
                    placeholder={currentStory.placeholder}
                    className="w-full bg-slate-700/60 backdrop-blur-sm border-2 border-purple-500/40 rounded-2xl px-6 py-4 pr-12 text-white text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 placeholder-gray-400 group-hover:border-purple-400/60"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {currentStory.input === "username" && <User className="w-5 h-5 text-purple-400" />}
                    {currentStory.input === "petName" && <Heart className="w-5 h-5 text-pink-400" />}
                    {currentStory.input === "secretKey" && <Lock className="w-5 h-5 text-blue-400" />}
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

  // top-level UI (simplified header + CTA area from your original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white font-sans overflow-x-hidden">
      {showStory && <StoryModal />}

      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Petzy</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">Features<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span></button>
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">How It Works<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span></button>
              <button className="text-gray-300 hover:text-purple-400 transition-all duration-300 relative group">Community<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span></button>
              <button onClick={() => setShowStory(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg shadow-purple-500/25"><Heart className="w-4 h-4" /><span>Get Started</span></button>
            </div>

            <button className="md:hidden text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-xl rounded-2xl mt-2 p-6 space-y-4 border border-purple-500/20 shadow-2xl">
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">Features</button>
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">How It Works</button>
              <button className="block text-gray-300 hover:text-purple-400 transition-colors py-2">Community</button>
              <button onClick={() => setShowStory(true)} className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25">Get Started</button>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-400 mr-2 animate-pulse" />
                <span className="text-purple-300 text-sm font-medium">AI-Powered Companion</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Meet Your
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Perfect Pet</span>
                <span className="block text-4xl md:text-5xl text-gray-300">Companion</span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                Petzy is your AI-driven 3D virtual pet that provides emotional support, intelligent conversations, and interactive fun.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button onClick={() => setShowStory(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl shadow-purple-500/25 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Bot className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Meet Your Petzy</span>
                  <ChevronRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-purple-500/50 text-white px-8 py-4 rounded-full text-lg font-semibold hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"><Volume2 className="w-5 h-5" /><span>Watch Demo</span></button>
              </div>
            </div>

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
                  <div className="text-sm text-gray-300 bg-black/20 rounded-full px-4 py-2 inline-block relative z-10">Loyal & Loving</div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-300 text-sm italic">"I'm waiting to learn your name and become your best friend forever..."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* rest of your landing content (features, zones, etc.) can remain unchanged; omitted for brevity */}
    </div>
  );
};

export default PetzyLanding;
