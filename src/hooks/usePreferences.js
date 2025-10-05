// usePreferences.js
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // make sure Firebase is initialized

export const usePreferences = () => {
  const [preferences, setPreferences] = useState({
    meshes: [],         // array of {name, color}
    currentScene: null, // {name, img}
  });

  const userId = auth.currentUser?.uid;

  // Load preferences from Firestore on login
  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        const docRef = doc(db, "preferences", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPreferences(docSnap.data());
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      }
    };

    fetchPreferences();
  }, [userId]);

  const updatePreferences = async (newPrefs) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));

    if (!userId) return;
    try {
      const docRef = doc(db, "preferences", userId);
      await setDoc(docRef, { ...preferences, ...newPrefs });
    } catch (err) {
      console.error("Failed to update preferences:", err);
    }
  };

  return [preferences, updatePreferences];
};
