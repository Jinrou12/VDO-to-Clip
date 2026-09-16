/**
 * Khmer Video Clipper Pro - Firebase Service (TypeScript Version)
 * Handles Authentication (Google Sign-In) & Cloud Firestore Database Synchronization
 */

import type { FirebaseConfig, UserPreset, UserProject, FirebaseServiceApi } from './types/firebase';

// Firebase Configuration for Project: vdo-to-clip-any
export const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyCInSqUSTeFVvc7UQBogkHL_GlX2IgQHjQ",
    authDomain: "vdo-to-clip-any.firebaseapp.com",
    projectId: "vdo-to-clip-any",
    storageBucket: "vdo-to-clip-any.firebasestorage.app",
    messagingSenderId: "43348008176",
    appId: "1:43348008176:web:fd9c43d57b2a415950f635",
    measurementId: "G-PXQCK75NQ6"
};

// Internal Firebase State
let firebaseApp: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;
let currentUser: any = null;

try {
    if (typeof (window as any).firebase !== 'undefined') {
        const fb = (window as any).firebase;
        firebaseApp = fb.initializeApp(firebaseConfig);
        auth = fb.auth();
        db = fb.firestore();
        googleProvider = new fb.auth.GoogleAuthProvider();
        console.log("🔥 Firebase initialized successfully for Khmer Clipper Pro!");
    } else {
        console.warn("⚠️ Firebase SDK not loaded yet.");
    }
} catch (e) {
    console.error("❌ Firebase init error:", e);
}

// ==========================================
// Authentication Methods
// ==========================================

let _authCallback: ((user: any) => void) | null = null;

export function getLocalUser(): any {
    try {
        const stored = localStorage.getItem('khmer_clipper_user');
        if (stored) return JSON.parse(stored);
    } catch (_) {}
    return null;
}

export function setLocalUser(name: string, email: string = ''): any {
    const cleanName = (name || 'Editor').trim();
    const user = {
        uid: 'local_' + Date.now(),
        displayName: cleanName,
        email: email ? email.trim() : `${cleanName.toLowerCase().replace(/\s+/g, '_')}@local.pc`,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        isLocal: true
    };
    try {
        localStorage.setItem('khmer_clipper_user', JSON.stringify(user));
    } catch (_) {}
    currentUser = user;
    if (_authCallback) _authCallback(user);
    return user;
}

/**
 * Sign In with Google Popup (with local editor profile fallback for desktop)
 */
export async function signInWithGoogle(): Promise<any> {
    if (!auth || !googleProvider) {
        const name = prompt("សូមបញ្ចូលឈ្មោះ ឬ Email របស់អ្នកសម្រាប់ប្រើប្រាស់លើ PC នេះ (ឧ. Visal):", "Visal");
        if (name && name.trim()) {
            return setLocalUser(name.trim());
        }
        throw new Error("មិនបានកំណត់គណនី។");
    }
    try {
        const result = await auth.signInWithPopup(googleProvider);
        currentUser = result.user;
        console.log("✅ Logged in successfully:", currentUser.displayName);
        if (_authCallback) _authCallback(currentUser);
        return currentUser;
    } catch (error: any) {
        console.warn("❌ Google Sign-In notice:", error);
        // PyWebView desktop apps block popups by default
        if (error.code === 'auth/popup-blocked' || String(error.message || '').includes('popup') || String(error.message || '').includes('invalid')) {
            const fallback = confirm(
                "⚠️ នៅលើកម្មវិធី Desktop (PC) Windows ចាក់សោរមិនឱ្យបើក Google Pop-up ដោយស្វ័យប្រវត្តិ។\n\n" +
                "👉 តើអ្នកចង់បង្កើតឈ្មោះ Profile ផ្ទាល់ខ្លួនលើ PC នេះភ្លាមៗដែរឬទេ? (មិនបាច់ Login Google)"
            );
            if (fallback) {
                const name = prompt("សូមបញ្ចូលឈ្មោះរបស់អ្នក (ឧ. Visal):", "Visal");
                if (name && name.trim()) {
                    return setLocalUser(name.trim());
                }
            }
        }
        throw error;
    }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<boolean> {
    try {
        localStorage.removeItem('khmer_clipper_user');
        if (auth) await auth.signOut();
        currentUser = null;
        console.log("👋 Logged out successfully");
        if (_authCallback) _authCallback(null);
        return true;
    } catch (error) {
        console.error("❌ Sign out failed:", error);
        return false;
    }
}

/**
 * Listen to Auth State Changes
 */
export function onAuthChange(callback: (user: any) => void): void {
    _authCallback = callback;
    const local = getLocalUser();
    if (local) {
        currentUser = local;
        callback(local);
    }
    if (auth) {
        auth.onAuthStateChanged((user: any) => {
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

// ==========================================
// Firestore Database Methods
// ==========================================

/**
 * Save Current Project & Clips to Firestore
 */
export async function saveProjectToFirestore(projectData: any): Promise<{ success: boolean; projectId: string }> {
    if (!currentUser) {
        throw new Error("សូម Login ចូលគណនីរបស់អ្នកជាមុនសិន ដើម្បី Save!");
    }

    const projectId = projectData.id ? String(projectData.id) : `proj_${Date.now()}`;

    // Handle Local Editor Profile saving
    if (currentUser.isLocal) {
        try {
            const localProjects = JSON.parse(localStorage.getItem('khmer_local_projects') || '[]');
            const idx = localProjects.findIndex((p: any) => p.id === projectId);
            const payload = {
                id: projectId,
                name: projectData.name || 'គម្រោងកាត់តគ្មានចំណងជើង',
                updatedAt: new Date(),
                createdAt: projectData.createdAt || new Date(),
                clipsCount: (projectData.clips || []).length,
                aspectRatio: projectData.aspectRatio || '9:16',
                platformMode: projectData.platformMode || 'facebook',
                clips: projectData.clips || [],
                settings: projectData.settings || {}
            };
            if (idx !== -1) localProjects[idx] = payload;
            else localProjects.unshift(payload);
            localStorage.setItem('khmer_local_projects', JSON.stringify(localProjects.slice(0, 30)));
            console.log("💾 Project saved to Local Workspace successfully:", projectId);
            return { success: true, projectId };
        } catch (err: any) {
            throw new Error("Local save error: " + err.message);
        }
    }

    if (!db) {
        throw new Error("Firestore Database មិនទាន់ដំណើរការទេ។");
    }

    const fb = (window as any).firebase;
    try {
        const docRef = db.collection('users').doc(currentUser.uid).collection('projects').doc(projectId);

        const payload = {
            id: projectId,
            name: projectData.name || 'គម្រោងកាត់តគ្មានចំណងជើង',
            updatedAt: fb.firestore.FieldValue.serverTimestamp(),
            createdAt: projectData.createdAt || fb.firestore.FieldValue.serverTimestamp(),
            clipsCount: (projectData.clips || []).length,
            aspectRatio: projectData.aspectRatio || '9:16',
            platformMode: projectData.platformMode || 'facebook',
            clips: projectData.clips || [],
            settings: {
                topText: projectData.topText || '',
                bottomText: projectData.bottomText || '',
                fontFamily: projectData.fontFamily || 'Moul',
                colorMode: projectData.colorMode || 'dual',
                strokeColor: projectData.strokeColor || '#FFFFFF',
                strokeWidth: projectData.strokeWidth || 12,
                topTextColor1: projectData.topTextColor1 || '#FFE600',
                topTextColor2: projectData.topTextColor2 || '#FF5722',
                bottomTextColor1: projectData.bottomTextColor1 || '#FFE600',
                bottomTextColor2: projectData.bottomTextColor2 || '#FF5722'
            }
        };

        await docRef.set(payload, { merge: true });
        console.log("☁️ Project saved to Firestore successfully:", projectId);
        return { success: true, projectId };
    } catch (error) {
        console.error("❌ Save to Firestore failed:", error);
        throw error;
    }
}

/**
 * Get All Projects for Current User
 */
export async function getUserProjects(): Promise<UserProject[]> {
    if (!currentUser) return [];

    if (currentUser.isLocal) {
        try {
            return JSON.parse(localStorage.getItem('khmer_local_projects') || '[]');
        } catch (_) {
            return [];
        }
    }

    if (!db) return [];

    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('projects')
            .orderBy('updatedAt', 'desc')
            .limit(20)
            .get();

        const projects: UserProject[] = [];
        snapshot.forEach((doc: any) => {
            projects.push(doc.data() as UserProject);
        });
        return projects;
    } catch (error) {
        console.error("❌ Fetch projects failed:", error);
        return [];
    }
}

/**
 * Delete a Project from Firestore
 */
export async function deleteUserProject(projectId: string): Promise<boolean> {
    if (!currentUser || !projectId) return false;

    if (currentUser.isLocal) {
        try {
            const localProjects = JSON.parse(localStorage.getItem('khmer_local_projects') || '[]');
            const filtered = localProjects.filter((p: any) => p.id !== String(projectId));
            localStorage.setItem('khmer_local_projects', JSON.stringify(filtered));
            return true;
        } catch (_) {
            return false;
        }
    }

    if (!db) return false;

    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('projects')
            .doc(String(projectId))
            .delete();
        console.log("🗑️ Deleted project from Firestore:", projectId);
        return true;
    } catch (error) {
        console.error("❌ Delete project failed:", error);
        throw error;
    }
}

/**
 * Save Custom Text/Font Style Preset to Firestore
 */
export async function savePresetToFirestore(preset: Partial<UserPreset>): Promise<boolean> {
    if (!currentUser || !db) return false;
    const fb = (window as any).firebase;
    try {
        const presetId = preset.id || `preset_${Date.now()}`;
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('presets')
            .doc(presetId)
            .set({
                ...preset,
                updatedAt: fb.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        return true;
    } catch (e) {
        console.error("❌ Save preset failed:", e);
        return false;
    }
}

/**
 * Get All Custom Presets for Current User
 */
export async function getUserPresets(): Promise<UserPreset[]> {
    if (!currentUser || !db) return [];
    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('presets')
            .orderBy('updatedAt', 'desc')
            .get();
        const presets: UserPreset[] = [];
        snapshot.forEach((doc: any) => presets.push(doc.data() as UserPreset));
        return presets;
    } catch (e) {
        console.error("❌ Get presets failed:", e);
        return [];
    }
}

// Export to Global Window Object for seamless use across app.js
export const FirebaseService: FirebaseServiceApi = {
    config: firebaseConfig,
    auth: () => auth,
    db: () => db,
    getCurrentUser: () => currentUser,
    signInWithGoogle,
    signOutUser,
    onAuthChange,
    saveProjectToFirestore: saveProjectToFirestore as any,
    getUserProjects,
    deleteUserProject,
    savePresetToFirestore,
    getUserPresets
};

if (typeof window !== 'undefined') {
    (window as any).FirebaseService = FirebaseService;
}
