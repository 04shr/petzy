import React, {
  Suspense,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Html, useGLTF, OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";

// --- ColorAnimator: smoothly lerps mesh colors ---
function ColorAnimator({ meshesRef }) {
  useFrame(() => {
    const map = meshesRef.current;
    if (!map) return;
    const lerpSpeed = 0.18;
    for (const key of Object.keys(map)) {
      const entry = map[key];
      if (!entry || !entry.mesh || !entry.mesh.material) continue;
      const mat = entry.mesh.material;
      const target = entry.targetColor;
      if (mat.color && target) {
        mat.color.lerp(target, lerpSpeed);
        mat.needsUpdate = true;
      }
    }
  });
  return null;
}

// --- GLTF Model loader with mouth control and mesh color API ---
const Model = forwardRef(({ url }, ref) => {
  const group = useRef();
  const gltf = useGLTF(url);
  const meshesRef = useRef({});

  // --- Mouth nodes ref ---
  const mouthNodesRef = useRef({ closed: null, open: null });

  // --- Speaking control ref ---
  const speakingRef = useRef(false);

  // --- Setup meshes and mouth nodes after GLTF loaded ---
  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    const map = {};
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // clone material
        if (!child.material._petMaterialClone) {
          const cloned = child.material.clone();
          cloned._petMaterialClone = true;
          child.material = cloned;
        }
        if (child.material.color) child.material.colorSpace = THREE.SRGBColorSpace;
        child.material.needsUpdate = true;

        const orig = child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff);
        const name = child.name && child.name.length ? child.name : child.uuid;

        map[name] = {
          mesh: child,
          originalColor: orig.clone(),
          targetColor: orig.clone(),
        };
      }
    });
    meshesRef.current = map;

    // --- Mouth nodes ---
    const closed = gltf.scene.getObjectByName("Mouth_001");
    const open = gltf.scene.getObjectByName("Mouth_002");
    if (closed && open) {
      closed.visible = true;
      open.visible = false;
      mouthNodesRef.current = { closed, open };
    }
  }, [gltf]);

  // --- Helpers ---
  const colorToHex = (c) => (c ? `#${c.getHexString()}` : "#ffffff");
  const hexToColor = (hex) => {
    try { return new THREE.Color(hex); } 
    catch { return new THREE.Color(0xffffff); }
  };

  // --- Imperative API ---
  useImperativeHandle(ref, () => ({
    // Mouth control
    setMouthOpen: (open) => {
      const { closed, open: openNode } = mouthNodesRef.current;
      if (!closed || !openNode) return;
      closed.visible = !open;
      openNode.visible = open;
    },
    toggleMouth: () => {
      const { closed, open: openNode } = mouthNodesRef.current;
      if (!closed || !openNode) return;
      const open = !closed.visible;
      closed.visible = !open;
      openNode.visible = open;
    },
    startSpeaking: () => {
      speakingRef.current = true;
    },
    stopSpeaking: () => {
      speakingRef.current = false;
      const { closed, open: openNode } = mouthNodesRef.current;
      if (closed && openNode) {
        closed.visible = true;
        openNode.visible = false;
      }
    },

    // Mesh API
    getMeshNames: () => Object.keys(meshesRef.current),
    getMeshes: () =>
      Object.entries(meshesRef.current).map(([name, { mesh, targetColor }]) => ({
        name,
        color: colorToHex(targetColor || (mesh.material?.color ?? new THREE.Color(0xffffff))),
      })),
    getMeshColor: (name) => {
      const entry = meshesRef.current[name];
      if (!entry) return null;
      return colorToHex(entry.targetColor || (entry.mesh.material?.color || new THREE.Color(0xffffff)));
    },
    setMeshColor: (name, hexColor) => {
      const entry = meshesRef.current[name];
      if (!entry) {
        console.warn("[PetModel] setMeshColor: mesh not found:", name);
        return false;
      }
      entry.targetColor = hexToColor(hexColor);
      return true;
    },
    resetMeshColor: (name) => {
      const entry = meshesRef.current[name];
      if (!entry) return null;
      entry.targetColor = entry.originalColor.clone();
      return colorToHex(entry.originalColor);
    },
  }));

  // --- Animate mouth while speaking ---
  useFrame(() => {
    const { closed, open: openNode } = mouthNodesRef.current;
    if (!closed || !openNode) return;
    if (speakingRef.current) {
      const t = Date.now() * 0.005; // speed of mouth movement
      const open = Math.sin(t) > 0;
      closed.visible = !open;
      openNode.visible = open;
    }
  });

  return (
    <>
      <primitive ref={group} object={gltf.scene} dispose={null} />
      <ColorAnimator meshesRef={meshesRef} />
    </>
  );
});

Model.displayName = "Model";

// --- Responsive wrapper ---
function ResponsiveWrapper({ children }) {
  const { viewport } = useThree();
  const scale = Math.min(viewport.width, viewport.height) / 4;
  return <group scale={scale}>{children}</group>;
}

// --- Main Pet Component ---
const PetModel = forwardRef(
  ({ modelPath = "/models/mouth.glb", className = "w-50 h-50" }, ref) => {
    return (
      <div className={className}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 40 }}
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
