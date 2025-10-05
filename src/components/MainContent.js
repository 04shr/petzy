import React, { useState, useRef, useEffect } from "react";
import PetModel from "./PetModel";
import parkImg from "../assets/images/park.png";
import clubImg from "../assets/images/club.png";
import schoolImg from "../assets/images/school.png";
import stadiumImg from "../assets/images/stadium.png";
import { usePreferences } from "../hooks/usePreferences";

const MainContent = () => {
    // Inside MainContent
    const [preferences, updatePreferences] = usePreferences();
const [meshes, setMeshes] = useState(preferences.meshes || []);
const [currentScene, setCurrentScene] = useState(preferences.currentScene || { name: "Default", img: null });

    const [notification, setNotification] = useState("");
    const [activePanel, setActivePanel] = useState(null); // null | "feed" | "play" | "teleport" | "customise"


    const petRef = useRef();
    const petContainerRef = useRef();

    // Use stable lowercase keys here. Display name can be anything.
    const actions = [
        { action: "feed", icon: "🍖", name: "Feed" },
        { action: "play", icon: "🎾", name: "Play" },
        { action: "teleport", icon: "🛸", name: "Teleport" },
        { action: "customise", icon: "🛁", name: "Customise" },
    ];

    const foodOptions = [
        { name: "Meat", icon: "🍖" },
        { name: "Apple", icon: "🍎" },
        { name: "Carrot", icon: "🥕" },
        { name: "Cookie", icon: "🍪" },
    ];

    const gameOptions = [
        { name: "Game 1", icon: "🎯", link: "#" },
        { name: "Game 2", icon: "🏃", link: "#" },
        { name: "Game 3", icon: "🧩", link: "#" },
        { name: "Game 4", icon: "🎵", link: "#" },
    ];

    // Scenes (replace the '#' with your actual image paths)
    const sceneOptions = [
        { name: "Sankey Tank", icon: "🌳", img: parkImg },
        { name: "Party", icon: "🎉", img: clubImg },
        { name: "CTR", icon: "🏨", img: schoolImg },
        { name: "Chinnaswamy Stadium", icon: "🏏", img: stadiumImg },
    ];

    const actionMessages = {
        feed: "Your pet is enjoying a delicious meal! 🍖",
        play: "Fetch time! Your pet is having a blast! 🎾",
        groom: "Your pet looks amazing and feels fresh! ✨",
        teleport: "Scene changed! ✨",
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(""), 3000);
    };

    // Normalizes the incoming action and opens panels for feed/play/customise/teleport
    const handleAction = (action) => {
        const key = typeof action === "string" ? action.toLowerCase() : action;
        const normalized = key === "customize" ? "customise" : key; // accept both spellings
        const panelOpeners = ["feed", "play", "customise", "teleport"];
        if (panelOpeners.includes(normalized)) {
            setActivePanel(normalized);
            return;
        }
        showNotification(actionMessages[normalized] || "Action completed! ✨");
    };

    // Load meshes when customise opens (best-effort)
useEffect(() => {
  if (activePanel !== "customise") return;

  // Only fetch if no meshes exist
  if (meshes.length > 0) return;

  const fetchMeshes = async () => {
    try {
      if (petRef.current) {
        if (typeof petRef.current.getMeshes === "function") {
          const remote = await petRef.current.getMeshes();
          if (Array.isArray(remote) && remote.length) {
            const normalized = remote.map((m) =>
              typeof m === "string"
                ? { name: m, color: petRef.current.getMeshColor ? petRef.current.getMeshColor(m) || "#ffffff" : "#ffffff" }
                : { name: m.name || "mesh", color: m.color || "#ffffff" }
            );
            setMeshes(normalized);
            return;
          }
        }
        if (typeof petRef.current.getMeshNames === "function") {
          const names = await petRef.current.getMeshNames();
          setMeshes(names.map((n) => ({ name: n, color: petRef.current.getMeshColor ? petRef.current.getMeshColor(n) || "#ffffff" : "#ffffff" })));
          return;
        }
      }
    } catch (err) {
      // ignore and use fallback
    }

    // fallback demo meshes
    setMeshes([
      { name: "Body", color: "#ffcc66" },
      { name: "Eyes", color: "#222222" },
      { name: "Ears", color: "#ff9999" },
      { name: "Collar", color: "#00ccff" },
    ]);
  };

  fetchMeshes();
}, [activePanel]);


    const handleDrop = (e) => {
  e.preventDefault();
  const food = e.dataTransfer.getData("food");
  if (food) {
    showNotification(`Your pet enjoyed the ${food}! 😋`);
    setActivePanel(null);

    // Save to preferences
    updatePreferences({ lastFed: food });
  }
};


    const handleDragOver = (e) => {
        e.preventDefault();
        if (!petContainerRef.current || !petRef.current) return;

        const rect = petContainerRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const mouthArea = {
            left: rect.left + rect.width * 0.35,
            right: rect.left + rect.width * 0.65,
            top: rect.top + rect.height * 0.55,
            bottom: rect.top + rect.height * 0.75,
        };

        if (
            mouseX >= mouthArea.left &&
            mouseX <= mouthArea.right &&
            mouseY >= mouthArea.top &&
            mouseY <= mouthArea.bottom
        ) {
            if (petRef.current && typeof petRef.current.setMouthOpen === "function") {
                petRef.current.setMouthOpen(true);
                clearTimeout(petRef.current._mouthTimeout);
                petRef.current._mouthTimeout = setTimeout(() => {
                    petRef.current.setMouthOpen(false);
                }, 1000);
            }
        }
    };

    // robust color update that attempts to call PetModel API if present
   // When changing color
const handleColorChange = (meshName, color) => {
  setMeshes((prev) => {
    const updated = prev.map((m) => (m.name === meshName ? { ...m, color } : m));
    updatePreferences({ meshes: updated }); // save to Firestore
    return updated;
  });

  try {
    if (petRef.current && typeof petRef.current.setMeshColor === "function") {
      petRef.current.setMeshColor(meshName, color);
    }
    showNotification(`${meshName} color updated`);
  } catch (err) {
    showNotification(`Could not update ${meshName} color on model.`);
  }
};

const resetMeshToDefault = (meshName) => {
  try {
    if (petRef.current && typeof petRef.current.resetMeshColor === "function") {
      const maybeColor = petRef.current.resetMeshColor(meshName);
      const newColor = typeof maybeColor === "string" ? maybeColor : petRef.current.getMeshColor ? petRef.current.getMeshColor(meshName) : "#ffffff";
      setMeshes((prev) => {
        const updated = prev.map((m) => (m.name === meshName ? { ...m, color: newColor } : m));
        updatePreferences({ meshes: updated }); // save to Firestore
        return updated;
      });
      showNotification(`${meshName} reset`);
      return;
    }
  } catch (err) { }

  handleColorChange(meshName, "#ffffff");
};


    // Teleport: change scene helper
  const applyScene = (scene) => {
  setCurrentScene(scene);
  updatePreferences({ currentScene: scene }); // save to Firestore

  try {
    if (petRef.current && typeof petRef.current.setScene === "function") {
      petRef.current.setScene(scene.img);
    }
  } catch (err) { }

  showNotification(`Teleported to ${scene.name}! 🌟`);
  setActivePanel(null);
};

    return (
        <main className="flex flex-col h-screen p-4 relative overflow-hidden">
            {/* scene background layer */}
            <div
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none bg-center bg-cover bg-no-repeat"
                style={{
                    backgroundImage: currentScene.img ? `url(${currentScene.img})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "none",
                    opacity: currentScene.img ? 1 : 0,
                    transition: "opacity 250ms ease-in-out",
                }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

            <header className="flex justify-center items-center mb-4 p-4 bg-white bg-opacity-10 backdrop-blur-3xl rounded-3xl border border-white border-opacity-20 z-10">
                <div className="text-2xl font-bold text-white text-shadow-md text-center">
                    🎮 Welcome to the Ultimate Pet Experience! 🐾
                </div>
            </header>

            <section
                className="flex-1 flex flex-col items-center justify-center relative z-10"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Left panel for feed / play */}
                {(activePanel === "feed" || activePanel === "play") && (
                    <div className="absolute top-1/4 left-20 -translate-x-1/3 -translate-y-8 scale-90 origin-top-right bg-black/80 backdrop-blur-xl border border-white/20 p-3 z-40 rounded-2xl shadow-lg flex flex-col w-48">
                        <button
                            onClick={() => setActivePanel(null)}
                            className="mb-2 text-white bg-red-500 px-2 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                            ✖ Close
                        </button>
                        <h2 className="text-white text-sm font-bold mb-3 text-center">
                            {activePanel === "feed" ? "Choose Food" : "Choose Game"}
                        </h2>
                        <div className="flex flex-col gap-2">
                            {activePanel === "feed" &&
                                foodOptions.map((food, i) => (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("food", food.name);
                                            const dragIcon = document.createElement("div");
                                            dragIcon.style.fontSize = "2rem";
                                            dragIcon.innerText = food.icon;
                                            document.body.appendChild(dragIcon);
                                            e.dataTransfer.setDragImage(dragIcon, 16, 16);
                                            setTimeout(() => document.body.removeChild(dragIcon), 0);
                                        }}
                                        className="cursor-grab flex flex-col items-center justify-center text-white text-sm text-center p-2 rounded-lg bg-white/10 hover:bg-cyan-500/30 transition-all duration-200"
                                    >
                                        <span className="block text-2xl">{food.icon}</span>
                                        {food.name}
                                    </div>
                                ))}
                          {activePanel === "play" &&
  gameOptions.map((game, i) => (
    <a
      key={i}
      href={game.link}
      onClick={() => {
        setActivePanel(null);
        updatePreferences({ lastPlayedGame: game.name });
      }}
      className="flex flex-col items-center justify-center gap-1 cursor-pointer text-white text-center p-2 rounded-lg bg-white/10 hover:bg-green-500/30 transition-all duration-200"
    >
      <span className="text-2xl">{game.icon}</span>
      <span className="text-xs">{game.name}</span>
    </a>
  ))}

                            {/* guard: show message if array empty */}
                            {activePanel === "play" && gameOptions.length === 0 && (
                                <div className="text-white/70 text-xs text-center">No games available.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Right panel for customise */}
                {activePanel === "customise" && (
                    <div className="absolute top-1/4 right-14 translate-x-1/3 -translate-y-8 scale-90 origin-top-left bg-black/80 backdrop-blur-xl border border-white/20 p-4 z-40 rounded-2xl shadow-lg flex flex-col w-64 max-h-[60vh] overflow-x-hidden overflow-y-auto pr-3 custom-scrollbar">
                        <button
                            onClick={() => setActivePanel(null)}
                            className="mb-3 self-end text-white bg-red-500 px-2 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                            ✖ Close
                        </button>
                        <h2 className="text-white text-sm font-bold mb-3 text-center">Customize Meshes</h2>
                        <div className="flex flex-col gap-3">
                         {(!meshes || meshes.length === 0) ? (
  <div className="text-white/70 text-xs text-center">Loading meshes...</div>
) : (
  meshes.map((mesh, i) => (
    <div key={mesh.name + i} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5">
      <div className="flex-1">
        <div className="text-white text-sm font-medium">{mesh.name}</div>
        <div className="text-white/70 text-xs mt-0.5">{mesh.color}</div>
      </div>

      <div className="flex items-center gap-2">
        <div title={mesh.color} className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: mesh.color }} />
        <input type="color" value={mesh.color} onChange={(e) => handleColorChange(mesh.name, e.target.value)} className="w-10 h-8 p-0" aria-label={`Change color of ${mesh.name}`} />
        <button onClick={() => resetMeshToDefault(mesh.name)} className="ml-2 text-white bg-white/5 px-2 py-1 rounded text-xs hover:bg-white/10">Reset</button>
      </div>
    </div>
  ))
)}

                            {meshes.map((mesh, i) => (
                                <div key={mesh.name + i} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5">
                                    <div className="flex-1">
                                        <div className="text-white text-sm font-medium">{mesh.name}</div>
                                        <div className="text-white/70 text-xs mt-0.5">{mesh.color}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            title={mesh.color}
                                            className="w-8 h-8 rounded-full border border-white/20"
                                            style={{ backgroundColor: mesh.color }}
                                        />
                                        <input
                                            type="color"
                                            value={mesh.color}
                                            onChange={(e) => handleColorChange(mesh.name, e.target.value)}
                                            className="w-10 h-8 p-0"
                                            aria-label={`Change color of ${mesh.name}`}
                                        />
                                        <button
                                            onClick={() => resetMeshToDefault(mesh.name)}
                                            className="ml-2 text-white bg-white/5 px-2 py-1 rounded text-xs hover:bg-white/10"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Teleport panel (center-right, similar look to customise) */}
                {activePanel === "teleport" && (
                    <div className="absolute top-1/4 right-8 translate-x-2 -translate-y-8 scale-90 origin-top-left bg-black/80 backdrop-blur-xl border border-white/20 p-4 z-40 rounded-2xl shadow-lg flex flex-col w-72 max-h-[60vh] overflow-x-hidden overflow-y-auto pr-3 custom-scrollbar">
                        <button
                            onClick={() => setActivePanel(null)}
                            className="mb-3 self-end text-white bg-red-500 px-2 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                            ✖ Close
                        </button>
                        <h2 className="text-white text-sm font-bold mb-3 text-center">Teleport — Choose a Scene</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {sceneOptions.map((scene, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyScene(scene)}
                                    className="flex flex-col items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-150"
                                    title={`Teleport to ${scene.name}`}
                                >
                                    <div className="w-full h-24 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
                                        {scene.img ? (
                                            <img src={scene.img} alt={scene.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="text-white/60 text-sm">No image</div>
                                        )}
                                    </div>
                                    <div className="text-white text-xs font-medium">
                                        {scene.icon} {scene.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={petContainerRef} className="w-full max-w-xs flex-1 flex items-center justify-center relative z-10">
                    <PetModel ref={petRef} modelPath="/models/mouth.glb" className="w-full h-full object-contain" />
                </div>
            </section>

            <section className="grid grid-cols-4 gap-4 -mt-6 z-10">
                {actions.map((actionData, index) => (
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

            {notification && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400/90 via-blue-500/90 to-purple-500/90 text-white px-8 py-4 rounded-2xl font-bold z-50 backdrop-blur-3xl border border-white border-opacity-30 animate-pulse">
                    {notification}
                </div>
            )}
        </main>
    );
};

export default MainContent;
