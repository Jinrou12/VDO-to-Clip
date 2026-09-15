/**
 * Khmer Video Clipper Pro - Firebase Types & Interfaces
 */

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
    [key: string]: any;
}

export interface UserPreset {
    id: string;
    name: string;
    aspectRatio: string;
    colorMode: string;
    topTextColor1: string;
    topTextColor2: string;
    bottomTextColor1: string;
    bottomTextColor2: string;
    topFontSize: number;
    bottomFontSize: number;
    fontFamily: string;
    strokeColor: string;
    strokeWidth: number;
    bgMode: string;
    blurRadius: number;
    bgColor: string;
    updatedAt?: any;
    [key: string]: any;
}

export interface UserProject {
    id: string;
    title: string;
    name?: string;
    videoName?: string;
    duration?: number;
    clipsCount?: number;
    data?: any;
    clips?: any[];
    settings?: any;
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

export interface FirebaseServiceApi {
    config: FirebaseConfig;
    auth: () => any;
    db: () => any;
    getCurrentUser: () => any;
    signInWithGoogle: () => Promise<any>;
    signOutUser: () => Promise<boolean>;
    onAuthChange: (callback: (user: any) => void) => void;
    saveProjectToFirestore: (projectData: any) => Promise<{ success: boolean; projectId: string }>;
    getUserProjects: () => Promise<UserProject[]>;
    deleteUserProject: (projectId: string) => Promise<boolean>;
    savePresetToFirestore: (preset: Partial<UserPreset>) => Promise<boolean>;
    getUserPresets: () => Promise<UserPreset[]>;
    [key: string]: any;
}
