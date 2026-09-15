/**
 * Khmer Video Clipper Pro - Global Ambient Type Declarations
 */

export {};

declare global {
    var JSZip: any;
    var firebase: any;
    var puter: any;
    var selectClipForEditing: any;
    var exportSingleClip: any;
    var updateStudioTimelineUI: any;
    var updateClipsCount: any;
    var renderClipsListScreen1: any;
    var renderClipsListScreen2: any;

    interface Event {
        _fromSync?: boolean;
        [key: string]: any;
    }

    interface EventTarget {
        closest?: any;
        value?: any;
        dataset?: any;
        [key: string]: any;
    }

    interface Element {
        dataset?: any;
        blur?: any;
        isContentEditable?: any;
        type?: any;
        [key: string]: any;
    }

    interface HTMLElement {
        checked?: boolean;
        disabled?: boolean;
        currentTime?: number;
        readyState?: number;
        captureStream?: any;
        pause?: any;
        play?: any;
        ended?: boolean;
        src?: string;
        muted?: boolean;
        value?: any;
        [key: string]: any;
    }

    interface Window {
        // Firebase
        FirebaseService?: any;
        firebase?: any;

        // Puter AI
        puter?: any;

        // JSZip
        JSZip?: any;

        // Web Audio Context for Export
        audioCtx?: any;
        webkitAudioContext?: any;
        audioSrc?: any;
        audioDest?: any;

        // Screen Navigation & UI Actions
        switchScreen?: (...args: any[]) => void;
        undoLastAction?: (...args: any[]) => void;
        redoLastAction?: (...args: any[]) => void;
        loadDemoClips?: (...args: any[]) => void;
        loadSampleCollage?: (...args: any[]) => void;
        setPlatformMode?: (...args: any[]) => void;

        // Clip Actions
        splitSelectedClip?: (...args: any[]) => void;
        removeClip?: (...args: any[]) => void;
        selectClip?: (...args: any[]) => void;
        exportSingleClip?: (...args: any[]) => void;

        // AI & Cloud Actions
        runAiAudioScan?: (...args: any[]) => void;
        testOmniRouteConnection?: (...args: any[]) => void;

        // Batch Queue Actions
        startBatchScanWorkflow?: (...args: any[]) => void;
        clearBatchQueue?: (...args: any[]) => void;
        removeBatchVideo?: (...args: any[]) => void;
        selectActiveBatchVideo?: (...args: any[]) => void;
        addFilesToBatchQueue?: (...args: any[]) => void;

        // Studio Layers
        addStudioImageLayer?: (...args: any[]) => void;
        selectStudioLayer?: (...args: any[]) => void;
        toggleStudioLayerVisibility?: (...args: any[]) => void;
        moveStudioLayer?: (...args: any[]) => void;
        removeStudioLayer?: (...args: any[]) => void;

        // History Actions
        undo?: (...args: any[]) => void;
        redo?: (...args: any[]) => void;

        // Dynamic Window methods
        [key: string]: any;
    }
}
