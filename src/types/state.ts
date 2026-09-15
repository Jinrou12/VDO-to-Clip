/**
 * Khmer Video Clipper Pro - State & Layer Type Definitions
 */

export type PlatformMode = 'facebook' | 'youtube' | string;

export type VideoPlacementLayout = 'split-right' | 'split-left' | 'pip' | 'full' | string;

export interface VideoPlacement {
    layout: VideoPlacementLayout;
    widthPct: number;
    feather: number;
    x: number;
    y: number;
    scale: number;
    [key: string]: any;
}

export interface HeadlineBanner {
    enabled: boolean;
    text: string;
    fontSize: number;
    height: number;
    bgColor: string;
    textColor: string;
    fontFamily: string;
    [key: string]: any;
}

export interface StudioLayer {
    id: string | number;
    type?: 'image' | 'text' | 'video' | 'shape' | string;
    name?: string;
    src?: string;
    img?: HTMLImageElement;
    imgElement?: HTMLImageElement;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    scale?: number;
    opacity?: number;
    visible?: boolean;
    zIndex?: number;
    rotation?: number;
    [key: string]: any;
}

export interface SubtitleItem {
    index?: number;
    start?: number;
    end?: number;
    text?: string;
    [key: string]: any;
}

export interface ClipItem {
    id: number | string;
    title?: string;
    name?: string;
    start?: number;
    end?: number;
    startTime?: number;
    endTime?: number;
    duration?: number;
    score?: number;
    reason?: string;
    topText?: string;
    bottomText?: string;
    topText1?: string;
    topText2?: string;
    bottomText1?: string;
    bottomText2?: string;
    subtitles?: SubtitleItem[];
    captionLines?: any[];
    thumbnail?: string;
    status?: string;
    [key: string]: any;
}

export interface BatchVideoItem {
    id: string | number;
    file: any;
    name: string;
    size?: number;
    duration?: number;
    status?: string;
    progress?: number;
    statusText?: string;
    clips?: ClipItem[];
    error?: string;
    [key: string]: any;
}

export interface AppEngineState {
    videoFile: any;
    videoObjectURL: string | null;
    duration: number;
    currentTime: number;
    isPlaying: boolean;

    // Trimming (Screen 1)
    trimIn: number;
    trimOut: number;

    // Platform Mode
    platformMode: PlatformMode;

    // YouTube Multi-Layer Studio State
    studioLayers: StudioLayer[];
    studioLayerCounter: number | string;
    activeLayerId: string | number | null;
    videoPlacement: VideoPlacement;
    headlineBanner: HeadlineBanner;

    // Filmora Pro Workspace State
    filmoraZoom: number;
    filmoraActiveTab: string;
    filmoraMediaFilter: string;
    filmoraSelectedBlock: any;

    // Canvas Config & Aspect Ratio
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | string;
    canvasWidth: number;
    canvasHeight: number;

    // Active Khmer Text & Color Settings
    colorMode: 'dual' | 'single' | 'gradient' | string;
    topTextColor1: string;
    topTextColor2: string;
    bottomTextColor1: string;
    bottomTextColor2: string;

    topText: string;
    topTextPart1: string;
    topTextPart2: string;
    topFontSize: number;
    topPosY: number;

    bottomText: string;
    bottomTextPart1: string;
    bottomTextPart2: string;
    bottomFontSize: number;
    bottomPosY: number;

    fontFamily: string;
    strokeColor: string;
    strokeWidth: number;
    shadowBlur: number;

    // Background & Scale Config
    bgMode: 'blur' | 'color' | 'image' | string;
    blurRadius: number;
    bgColor: string;
    videoScale: number;
    videoOffsetY: number;

    // Multi-Clip Queue
    clips: ClipItem[];
    clipCounter: number | string;

    // Batch Multi-Video Queue State
    batchVideos: BatchVideoItem[];
    activeBatchVideoId: string | number | null;
    batchPollingTimer: any;
    batchMode: 'parallel' | 'sequential' | string;

    // Navigation & Project
    currentScreen: number;
    activeClipId: number | string | null;
    currentProjectId?: string | null;

    // Drag, Resize & Interactive Targets
    resizeTarget?: string | null;
    dragTarget?: string | null;
    hoveredTextTarget?: string | null;
    topMeasuredWidth?: number;
    bottomMeasuredWidth?: number;

    // Export Controls
    isExporting?: boolean;
    cancelExportRequested?: boolean;

    // Dynamic state properties index signature
    [key: string]: any;
}
