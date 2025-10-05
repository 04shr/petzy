import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState({
    meshes: [],
    currentScene: null,
  });
//hello
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setPreferences(userData.preferences || { meshes: [], currentScene: null });
        } else {
          // always use setDoc to create new doc
          await setDoc(userDocRef, { preferences: { meshes: [], currentScene: null } });
          setPreferences({ meshes: [], currentScene: null });
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
      }
    };

    fetchPreferences();
  }, [userId]);

  const updatePreferences = async (newPrefs) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      if (!userId) return updated;

      const userDocRef = doc(db, "users", userId);
      // always use setDoc with merge for updates
      setDoc(userDocRef, { preferences: updated }, { merge: true }).catch(console.error);

      return updated;
    });
  };

  return [preferences, updatePreferences];
};
