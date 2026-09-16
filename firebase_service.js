(() => {
  // src/firebase_service.ts
  var firebaseConfig = {
    apiKey: "AIzaSyCInSqUSTeFVvc7UQBogkHL_GlX2IgQHjQ",
    authDomain: "vdo-to-clip-any.firebaseapp.com",
    projectId: "vdo-to-clip-any",
    storageBucket: "vdo-to-clip-any.firebasestorage.app",
    messagingSenderId: "43348008176",
    appId: "1:43348008176:web:fd9c43d57b2a415950f635",
    measurementId: "G-PXQCK75NQ6"
  };
  var firebaseApp = null;
  var auth = null;
  var db = null;
  var googleProvider = null;
  var currentUser = null;
  try {
    if (typeof window.firebase !== "undefined") {
      const fb = window.firebase;
      firebaseApp = fb.initializeApp(firebaseConfig);
      auth = fb.auth();
      db = fb.firestore();
      googleProvider = new fb.auth.GoogleAuthProvider();
      console.log("\u{1F525} Firebase initialized successfully for Khmer Clipper Pro!");
    } else {
      console.warn("\u26A0\uFE0F Firebase SDK not loaded yet.");
    }
  } catch (e) {
    console.error("\u274C Firebase init error:", e);
  }
  var _authCallback = null;
  function getLocalUser() {
    try {
      const stored = localStorage.getItem("khmer_clipper_user");
      if (stored) return JSON.parse(stored);
    } catch (_) {
    }
    return null;
  }
  function setLocalUser(name, email = "") {
    const cleanName = (name || "Editor").trim();
    const user = {
      uid: "local_" + Date.now(),
      displayName: cleanName,
      email: email ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, "_")}@local.pc`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      isLocal: true
    };
    try {
      localStorage.setItem("khmer_clipper_user", JSON.stringify(user));
    } catch (_) {
    }
    currentUser = user;
    if (_authCallback) _authCallback(user);
    return user;
  }
  async function signInWithGoogle() {
    if (!auth || !googleProvider) {
      const name = prompt("\u179F\u17BC\u1798\u1794\u1789\u17D2\u1785\u17BC\u179B\u1788\u17D2\u1798\u17C4\u17C7 \u17AC Email \u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1794\u17D2\u179A\u17BE\u1794\u17D2\u179A\u17B6\u179F\u17CB\u179B\u17BE PC \u1793\u17C1\u17C7 (\u17A7. Visal):", "Visal");
      if (name && name.trim()) {
        return setLocalUser(name.trim());
      }
      throw new Error("\u1798\u17B7\u1793\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB\u1782\u178E\u1793\u17B8\u17D4");
    }
    try {
      const result = await auth.signInWithPopup(googleProvider);
      currentUser = result.user;
      console.log("\u2705 Logged in successfully:", currentUser.displayName);
      if (_authCallback) _authCallback(currentUser);
      return currentUser;
    } catch (error) {
      console.warn("\u274C Google Sign-In notice:", error);
      if (error.code === "auth/popup-blocked" || String(error.message || "").includes("popup") || String(error.message || "").includes("invalid")) {
        const fallback = confirm(
          "\u26A0\uFE0F \u1793\u17C5\u179B\u17BE\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8 Desktop (PC) Windows \u1785\u17B6\u1780\u17CB\u179F\u17C4\u179A\u1798\u17B7\u1793\u17B1\u17D2\u1799\u1794\u17BE\u1780 Google Pop-up \u178A\u17C4\u1799\u179F\u17D2\u179C\u17D0\u1799\u1794\u17D2\u179A\u179C\u178F\u17D2\u178F\u17B7\u17D4\n\n\u{1F449} \u178F\u17BE\u17A2\u17D2\u1793\u1780\u1785\u1784\u17CB\u1794\u1784\u17D2\u1780\u17BE\u178F\u1788\u17D2\u1798\u17C4\u17C7 Profile \u1795\u17D2\u1791\u17B6\u179B\u17CB\u1781\u17D2\u179B\u17BD\u1793\u179B\u17BE PC \u1793\u17C1\u17C7\u1797\u17D2\u179B\u17B6\u1798\u17D7\u178A\u17C2\u179A\u17AC\u1791\u17C1? (\u1798\u17B7\u1793\u1794\u17B6\u1785\u17CB Login Google)"
        );
        if (fallback) {
          const name = prompt("\u179F\u17BC\u1798\u1794\u1789\u17D2\u1785\u17BC\u179B\u1788\u17D2\u1798\u17C4\u17C7\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780 (\u17A7. Visal):", "Visal");
          if (name && name.trim()) {
            return setLocalUser(name.trim());
          }
        }
      }
      throw error;
    }
  }
  async function signOutUser() {
    try {
      localStorage.removeItem("khmer_clipper_user");
      if (auth) await auth.signOut();
      currentUser = null;
      console.log("\u{1F44B} Logged out successfully");
      if (_authCallback) _authCallback(null);
      return true;
    } catch (error) {
      console.error("\u274C Sign out failed:", error);
      return false;
    }
  }
  function onAuthChange(callback) {
    _authCallback = callback;
    const local = getLocalUser();
    if (local) {
      currentUser = local;
      callback(local);
    }
    if (auth) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          currentUser = user;
          callback(user);
        } else if (!getLocalUser()) {
          currentUser = null;
          callback(null);
        }
      });
    }
  }
  async function saveProjectToFirestore(projectData) {
    if (!currentUser) {
      throw new Error("\u179F\u17BC\u1798 Login \u1785\u17BC\u179B\u1782\u178E\u1793\u17B8\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793 \u178A\u17BE\u1798\u17D2\u1794\u17B8 Save!");
    }
    const projectId = projectData.id ? String(projectData.id) : `proj_${Date.now()}`;
    if (currentUser.isLocal) {
      try {
        const localProjects = JSON.parse(localStorage.getItem("khmer_local_projects") || "[]");
        const idx = localProjects.findIndex((p) => p.id === projectId);
        const payload = {
          id: projectId,
          name: projectData.name || "\u1782\u1798\u17D2\u179A\u17C4\u1784\u1780\u17B6\u178F\u17CB\u178F\u1782\u17D2\u1798\u17B6\u1793\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784",
          updatedAt: /* @__PURE__ */ new Date(),
          createdAt: projectData.createdAt || /* @__PURE__ */ new Date(),
          clipsCount: (projectData.clips || []).length,
          aspectRatio: projectData.aspectRatio || "9:16",
          platformMode: projectData.platformMode || "facebook",
          clips: projectData.clips || [],
          settings: projectData.settings || {}
        };
        if (idx !== -1) localProjects[idx] = payload;
        else localProjects.unshift(payload);
        localStorage.setItem("khmer_local_projects", JSON.stringify(localProjects.slice(0, 30)));
        console.log("\u{1F4BE} Project saved to Local Workspace successfully:", projectId);
        return { success: true, projectId };
      } catch (err) {
        throw new Error("Local save error: " + err.message);
      }
    }
    if (!db) {
      throw new Error("Firestore Database \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u1791\u17C1\u17D4");
    }
    const fb = window.firebase;
    try {
      const docRef = db.collection("users").doc(currentUser.uid).collection("projects").doc(projectId);
      const payload = {
        id: projectId,
        name: projectData.name || "\u1782\u1798\u17D2\u179A\u17C4\u1784\u1780\u17B6\u178F\u17CB\u178F\u1782\u17D2\u1798\u17B6\u1793\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784",
        updatedAt: fb.firestore.FieldValue.serverTimestamp(),
        createdAt: projectData.createdAt || fb.firestore.FieldValue.serverTimestamp(),
        clipsCount: (projectData.clips || []).length,
        aspectRatio: projectData.aspectRatio || "9:16",
        platformMode: projectData.platformMode || "facebook",
        clips: projectData.clips || [],
        settings: {
          topText: projectData.topText || "",
          bottomText: projectData.bottomText || "",
          fontFamily: projectData.fontFamily || "Moul",
          colorMode: projectData.colorMode || "dual",
          strokeColor: projectData.strokeColor || "#FFFFFF",
          strokeWidth: projectData.strokeWidth || 12,
          topTextColor1: projectData.topTextColor1 || "#FFE600",
          topTextColor2: projectData.topTextColor2 || "#FF5722",
          bottomTextColor1: projectData.bottomTextColor1 || "#FFE600",
          bottomTextColor2: projectData.bottomTextColor2 || "#FF5722"
        }
      };
      await docRef.set(payload, { merge: true });
      console.log("\u2601\uFE0F Project saved to Firestore successfully:", projectId);
      return { success: true, projectId };
    } catch (error) {
      console.error("\u274C Save to Firestore failed:", error);
      throw error;
    }
  }
  async function getUserProjects() {
    if (!currentUser) return [];
    if (currentUser.isLocal) {
      try {
        return JSON.parse(localStorage.getItem("khmer_local_projects") || "[]");
      } catch (_) {
        return [];
      }
    }
    if (!db) return [];
    try {
      const snapshot = await db.collection("users").doc(currentUser.uid).collection("projects").orderBy("updatedAt", "desc").limit(20).get();
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push(doc.data());
      });
      return projects;
    } catch (error) {
      console.error("\u274C Fetch projects failed:", error);
      return [];
    }
  }
  async function deleteUserProject(projectId) {
    if (!currentUser || !projectId) return false;
    if (currentUser.isLocal) {
      try {
        const localProjects = JSON.parse(localStorage.getItem("khmer_local_projects") || "[]");
        const filtered = localProjects.filter((p) => p.id !== String(projectId));
        localStorage.setItem("khmer_local_projects", JSON.stringify(filtered));
        return true;
      } catch (_) {
        return false;
      }
    }
    if (!db) return false;
    try {
      await db.collection("users").doc(currentUser.uid).collection("projects").doc(String(projectId)).delete();
      console.log("\u{1F5D1}\uFE0F Deleted project from Firestore:", projectId);
      return true;
    } catch (error) {
      console.error("\u274C Delete project failed:", error);
      throw error;
    }
  }
  async function savePresetToFirestore(preset) {
    if (!currentUser || !db) return false;
    const fb = window.firebase;
    try {
      const presetId = preset.id || `preset_${Date.now()}`;
      await db.collection("users").doc(currentUser.uid).collection("presets").doc(presetId).set({
        ...preset,
        updatedAt: fb.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.error("\u274C Save preset failed:", e);
      return false;
    }
  }
  async function getUserPresets() {
    if (!currentUser || !db) return [];
    try {
      const snapshot = await db.collection("users").doc(currentUser.uid).collection("presets").orderBy("updatedAt", "desc").get();
      const presets = [];
      snapshot.forEach((doc) => presets.push(doc.data()));
      return presets;
    } catch (e) {
      console.error("\u274C Get presets failed:", e);
      return [];
    }
  }
  var FirebaseService = {
    config: firebaseConfig,
    auth: () => auth,
    db: () => db,
    getCurrentUser: () => currentUser,
    signInWithGoogle,
    signOutUser,
    onAuthChange,
    saveProjectToFirestore,
    getUserProjects,
    deleteUserProject,
    savePresetToFirestore,
    getUserPresets
  };
  if (typeof window !== "undefined") {
    window.FirebaseService = FirebaseService;
  }
})();
//# sourceMappingURL=firebase_service.js.map
