(() => {
  // src/firebase_service.ts
  var firebaseConfig = {
    apiKey: "AIzaSyCinSquSTEfVvc7UQBogkHL_GLX2IgQHJQ",
    authDomain: "vdo-to-clip-any.firebaseapp.com",
    projectId: "vdo-to-clip-any",
    storageBucket: "vdo-to-clip-any.firebasestorage.app",
    messagingSenderId: "43348008176",
    appId: "1:43348008176:web:fd9c43d57b2a415950f635",
    measurementId: "G-PXQCK7SNQ6"
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
  async function signInWithGoogle() {
    if (!auth || !googleProvider) {
      throw new Error("Firebase Auth \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u1791\u17C1\u17D4 \u179F\u17BC\u1798\u1796\u17B7\u1793\u17B7\u178F\u17D2\u1799\u1798\u17BE\u179B Internet!");
    }
    try {
      const result = await auth.signInWithPopup(googleProvider);
      currentUser = result.user;
      console.log("\u2705 Logged in successfully:", currentUser.displayName);
      return currentUser;
    } catch (error) {
      console.error("\u274C Google Sign-In failed:", error);
      throw error;
    }
  }
  async function signOutUser() {
    if (!auth) return false;
    try {
      await auth.signOut();
      currentUser = null;
      console.log("\u{1F44B} Logged out successfully");
      return true;
    } catch (error) {
      console.error("\u274C Sign out failed:", error);
      throw error;
    }
  }
  function onAuthChange(callback) {
    if (!auth) return;
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      if (callback) callback(user);
    });
  }
  async function saveProjectToFirestore(projectData) {
    if (!currentUser) {
      throw new Error("\u179F\u17BC\u1798 Login \u1785\u17BC\u179B\u1782\u178E\u1793\u17B8\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793 \u178A\u17BE\u1798\u17D2\u1794\u17B8 Save \u1791\u17C5\u179B\u17BE Cloud!");
    }
    if (!db) {
      throw new Error("Firestore Database \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u1791\u17C1\u17D4");
    }
    const fb = window.firebase;
    try {
      const projectId = projectData.id ? String(projectData.id) : `proj_${Date.now()}`;
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
    if (!currentUser || !db) return [];
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
    if (!currentUser || !db || !projectId) return false;
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
