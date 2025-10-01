import React, { useState, useRef } from "react";
import PetzyLanding from "./components/PetzyLanding";
import BackgroundParticles from "./components/BackgroundParticles";
import LeftSidebar from "./components/LeftSidebar";
import MainContent from "./components/MainContent";
import RightSidebar from "./components/RightSidebar";
import PetModel from "./components/PetModel"; // ⬅️ import PetModel

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Shared ref between PetModel and RightSidebar
  const petRef = useRef();

  return (
    <div
      className={`font-['Space_Grotesk'] bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-800 ${
        isAuthenticated ? "h-screen overflow-hidden" : ""
      }`}
    >
      <BackgroundParticles />

      {!isAuthenticated ? (
        <PetzyLanding setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <div className="grid grid-cols-[290px_1fr_290px] h-screen gap-0">
          <LeftSidebar />

          {/* Middle column: MainContent + PetModel */}
        <div className="relative flex flex-col items-center justify-center">
  <MainContent />
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <PetModel ref={petRef} className="w-100 h-100" />
  </div>
</div>
          {/* Pass petRef so RightSidebar can control mouth */}
          <RightSidebar petRef={petRef} />
        </div>
      )}
    </div>
  );
}

export default App;
