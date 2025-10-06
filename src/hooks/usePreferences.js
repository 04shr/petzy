// src/hooks/usePreferences.js
import { useState, useEffect, useCallback } from "react";
import bcrypt from "bcryptjs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Named exports:
 * - checkIfUserExists(username)
 * - createUser({ username, petName, secretKey, extra })
 * - verifyUser(username, secretKey)
 *
 * Default export:
 * - usePreferences() -> [preferences, updatePreferences, { loading }]
 *
 * NOTE:
 * - Documents are stored at users/{username.toLowerCase()}
 * - preferences are stored inside the document at the `preferences` field.
 */

// ---------- Utils ----------
const normalize = (username) => (username || "").trim().toLowerCase();
const SALT_ROUNDS = 10;

// ---------- Named account helpers ----------
export const checkIfUserExists = async (username) => {
  const id = normalize(username);
  if (!id) return false;
  try {
    const snap = await getDoc(doc(db, "users", id));
    return snap.exists();
  } catch (err) {
    console.error("checkIfUserExists error:", err);
    throw err;
  }
};

export const createUser = async ({ username, petName, secretKey, extra = {} }) => {
  const id = normalize(username);
  if (!id) return { ok: false, reason: "username_required" };

  try {
    const hashed = await bcrypt.hash(secretKey, SALT_ROUNDS);

    const userDoc = {
      username: username.trim(),
      username_lc: id,
      petName: (petName || "").trim(),
      secretKeyHash: hashed,
      createdAt: new Date().toISOString(),
      preferences: {
        stats: {},
        dailyLog: {},
        meshes: [],
        currentScene: null,
      },
      ...extra,
    };

    await setDoc(doc(db, "users", id), userDoc);
    const safe = { ...userDoc };
    delete safe.secretKeyHash;
    return { ok: true, data: safe };
  } catch (err) {
    console.error("createUser error:", err);
    return { ok: false, reason: err.message || "failed_to_create" };
  }
};

export const verifyUser = async (username, secretKey) => {
  const id = normalize(username);
  if (!id) return { ok: false, reason: "username_required" };

  try {
    const snap = await getDoc(doc(db, "users", id));
    if (!snap.exists()) return { ok: false, reason: "not_found" };

    const data = snap.data();
    const hash = data?.secretKeyHash;
    if (!hash) return { ok: false, reason: "no_password_stored" };

    const match = await bcrypt.compare(secretKey, hash);
    if (match) {
      const safe = { ...data };
      delete safe.secretKeyHash;
      return { ok: true, data: safe };
    } else {
      return { ok: false, reason: "wrong_password" };
    }
  } catch (err) {
    console.error("verifyUser error:", err);
    return { ok: false, reason: err.message || "verification_error" };
  }
};

// ---------- Default hook: usePreferences ----------
export default function usePreferences() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  const readUsername = () => {
    try {
      const u = localStorage.getItem("petzy_current_username");
      return u ? String(u).trim().toLowerCase() : null;
    } catch (err) {
      console.warn("localStorage read failed:", err);
      return null;
    }
  };

  const username = readUsername();
  const userDocRef = username ? doc(db, "users", username) : null;

  // load initial preferences
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userDocRef) {
        setPreferences({});
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const snap = await getDoc(userDocRef);
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data();
          setPreferences(data.preferences || {});
        } else {
          setPreferences({});
        }
      } catch (err) {
        console.error("usePreferences load error:", err);
        setPreferences({});
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  /**
   * updatePreferences(newPrefs)
   * merges top-level keys of newPrefs into preferences field
   * e.g. updatePreferences({ stats: {...}, meshes: [...] })
   */
  const updatePreferences = useCallback(
    async (newPrefs = {}) => {
      // update local state immediately for snappy UI
      setPreferences((prev = {}) => ({ ...prev, ...newPrefs }));

      if (!userDocRef) {
        console.warn("updatePreferences: no user logged in");
        return { ok: false, reason: "no_user" };
      }

      try {
        const payload = {};
        Object.keys(newPrefs).forEach((key) => {
          payload[`preferences.${key}`] = newPrefs[key];
        });

        // Try update; if doc doesn't exist create it
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          await updateDoc(userDocRef, payload);
        } else {
          // create doc with preferences
          await setDoc(userDocRef, { preferences: newPrefs, username: username, username_lc: username }, { merge: true });
        }

        return { ok: true };
      } catch (err) {
        console.error("updatePreferences error:", err);
        return { ok: false, reason: err.message || "failed_to_update" };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [username]
  );

  return [preferences || {}, updatePreferences, { loading }];
}
