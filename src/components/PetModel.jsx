import React, {
  Suspense,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, useGLTF, OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";

// --- Model loader with mouth control ---
const Model = forwardRef(({ url }, ref) => {
  const group = useRef();
  const gltf = useGLTF(url);

  gltf.scene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.colorSpace = THREE.SRGBColorSpace;
      child.material.needsUpdate = true;
    }
  });

  const mouthClosed = gltf.scene.getObjectByName("Mouth_001");
  const mouthOpen = gltf.scene.getObjectByName("Mouth_002");

  if (mouthClosed && mouthOpen) {
    mouthClosed.visible = true;
    mouthOpen.visible = false;
  }

useImperativeHandle(ref, () => ({
  setMouthOpen: (open) => {
    if (!mouthClosed || !mouthOpen) return;
    mouthClosed.visible = !open;
    mouthOpen.visible = open;
  },
  toggleMouth: () => {
    if (!mouthClosed || !mouthOpen) return;
    const open = !mouthClosed.visible;
    mouthClosed.visible = !open;
    mouthOpen.visible = open;
  },
}));


  return <primitive ref={group} object={gltf.scene} dispose={null} />;
});

// --- Responsive wrapper ---
function ResponsiveWrapper({ children }) {
  const { viewport } = useThree();
  const scale = Math.min(viewport.width, viewport.height) / 6;
  return <group scale={scale}>{children}</group>;
}

// --- Main Pet Component ---
const PetModel = forwardRef(
  ({ modelPath = "/models/mouth.glb", className = "w-44 h-44" }, ref) => {
    return (
      <div className={className}>
        <Canvas
          camera={{ position: [0, 1.2, 3], fov: 40 }}
          style={{ width: "100%", height: "100%" }}
          gl={{
            antialias: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
          }}
        >
          <ambientLight intensity={1} />
          <Suspense fallback={<Html center>Loading pet...</Html>}>
            <ResponsiveWrapper>
              <Model ref={ref} url={modelPath} />
            </ResponsiveWrapper>
            <Preload all />
            <OrbitControls enablePan={false} enableZoom={true} />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

useGLTF.preload("/models/mouth.glb");

export default PetModel;
