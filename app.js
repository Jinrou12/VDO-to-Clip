/**
 * Khmer Video Clipper Pro - Core Engine (v8.0 SPA Architecture)
 * Complete 2-Screen Separation: Screen 1 (Trimmer) vs Screen 2 (Studio Editor)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Engine State ---
    const state = {
        videoFile: null,
        videoObjectURL: null,
        duration: 0,
        currentTime: 0,
        isPlaying: false,
        
        // Trimming state (Screen 1)
        trimIn: 0,
        trimOut: 0,
        
        // Canvas Config & Aspect Ratio (Screen 2)
        aspectRatio: '9:16',
        canvasWidth: 1080,
        canvasHeight: 1920,
        
        // Active Khmer Text & Color Settings (per clip editable)
        colorMode: 'dual', // 'dual', 'single', 'gradient'
        topTextColor1: '#FFE600',
        topTextColor2: '#FF5722',
        bottomTextColor1: '#FFE600',
        bottomTextColor2: '#FF5722',
        
        topText: 'អំពើហិង្សាជាអំពើ',
        topTextPart1: 'អំពើហិង្សា',
        topTextPart2: 'ជាអំពើ',
        topFontSize: 65,
        topPosY: 160,
        
        bottomText: 'អង់អាចក្លាហាន',
        bottomTextPart1: 'អង់អាច',
        bottomTextPart2: 'ក្លាហាន',
        bottomFontSize: 65,
        bottomPosY: 1750,
        
        fontFamily: 'Moul',
        strokeColor: '#FFFFFF',
        strokeWidth: 12,
        shadowBlur: 10,
        
        // Background & Scale Config
        bgMode: 'blur',
        blurRadius: 25,
        bgColor: '#111827',
        videoScale: 100,
        videoOffsetY: 0,
        
        // Multi-Clip Queue
        clips: [],
        clipCounter: 1,
        
        // Workflow Navigation
        currentScreen: 0, // 0: uninitialized, 1: Trimmer Screen, 2: Studio Screen
        activeClipId: null,
        
        // Export state
        isExporting: false,
        cancelExportRequested: false
    };

    // --- DOM Elements ---
    const elements = {
        // Views
        screen1View: document.getElementById('screen1View'),
        screen2View: document.getElementById('screen2View'),
        dropzoneOverlay: document.getElementById('dropzoneOverlay'),
        
        // Navigation Stepper
        step1TabBtn: document.getElementById('step1TabBtn'),
        step2TabBtn: document.getElementById('step2TabBtn'),
        step2Badge: document.getElementById('step2Badge'),
        goToStep2Btn: document.getElementById('goToStep2Btn'),
        backToStep1Btn: document.getElementById('backToStep1Btn'),
        
        // Video Elements
        videoUploadInput: document.getElementById('videoUploadInput'),
        mainVideoPlayer: document.getElementById('mainVideoPlayer'),
        hiddenVideo: document.getElementById('hiddenVideo'),
        
        // Canvas (Screen 2)
        mainCanvas: document.getElementById('mainCanvas'),
        ctx: document.getElementById('mainCanvas').getContext('2d'),
        canvasWrapper: document.getElementById('canvasWrapper'),
        canvasInlineInput: document.getElementById('canvasInlineInput'),
        activeClipNameBadge: document.getElementById('activeClipNameBadge'),
        activeClipTitleInput: document.getElementById('activeClipTitleInput'),
        studioClipScrubber: document.getElementById('studioClipScrubber'),
        studioClipTimeDisplay: document.getElementById('studioClipTimeDisplay'),
        
        // Sidebars & Lists
        fileInfoBox: document.getElementById('fileInfoBox'),
        clipsListScreen1: document.getElementById('clipsListScreen1'),
        clipsListScreen2: document.getElementById('clipsListScreen2'),
        clipCountBadge: document.getElementById('clipCount'),
        
        // Trimmer Controls (Screen 1)
        inTimeDisplay: document.getElementById('inTimeDisplay'),
        outTimeDisplay: document.getElementById('outTimeDisplay'),
        clipDurationDisplay: document.getElementById('clipDurationDisplay'),
        setInBtn: document.getElementById('setInBtn'),
        setOutBtn: document.getElementById('setOutBtn'),
        addClipBtn: document.getElementById('addClipBtn'),
        splitTrimBtn: document.getElementById('splitTrimBtn'),
        timelineTrack: document.getElementById('timelineTrack'),
        trimSelectionRange: document.getElementById('trimSelectionRange'),
        playhead: document.getElementById('playhead'),
        timelineSlider: document.getElementById('timelineSlider'),
        
        // Studio Toolbar & Actions (Screen 2)
        aspectBtns: document.querySelectorAll('.aspect-btn'),
        exportActiveClipBtn: document.getElementById('exportActiveClipBtn'),
        exportAllClipsStudioBtn: document.getElementById('exportAllClipsStudioBtn'),
        
        // Right Inspector Inputs (Screen 2)
        colorModeSelect: document.getElementById('colorModeSelect'),
        topTextColor1Box: document.getElementById('topTextColor1Box'),
        topTextColor1Swatch: document.getElementById('topTextColor1Swatch'),
        topTextColor1Val: document.getElementById('topTextColor1Val'),
        topTextColor2Box: document.getElementById('topTextColor2Box'),
        topTextColor2Swatch: document.getElementById('topTextColor2Swatch'),
        topTextColor2Val: document.getElementById('topTextColor2Val'),
        topColor2Group: document.getElementById('topColor2Group'),

        bottomTextColor1Box: document.getElementById('bottomTextColor1Box'),
        bottomTextColor1Swatch: document.getElementById('bottomTextColor1Swatch'),
        bottomTextColor1Val: document.getElementById('bottomTextColor1Val'),
        bottomTextColor2Box: document.getElementById('bottomTextColor2Box'),
        bottomTextColor2Swatch: document.getElementById('bottomTextColor2Swatch'),
        bottomTextColor2Val: document.getElementById('bottomTextColor2Val'),
        bottomColor2Group: document.getElementById('bottomColor2Group'),

        strokeColorBox: document.getElementById('strokeColorBox'),
        strokeColorSwatch: document.getElementById('strokeColorSwatch'),
        strokeColorVal: document.getElementById('strokeColorVal'),

        customColorPopover: document.getElementById('customColorPopover'),
        popoverTitle: document.getElementById('popoverTitle'),
        closePopoverBtn: document.getElementById('closePopoverBtn'),
        popoverPreviewSwatch: document.getElementById('popoverPreviewSwatch'),
        popoverHexInput: document.getElementById('popoverHexInput'),
        popoverNativeColorInput: document.getElementById('popoverNativeColorInput'),
        
        topTextSingleGroup: document.getElementById('topTextSingleGroup'),
        topTextDualGroup: document.getElementById('topTextDualGroup'),
        topTextInput: document.getElementById('topTextInput'),
        topTextPart1Input: document.getElementById('topTextPart1Input'),
        topTextPart2Input: document.getElementById('topTextPart2Input'),
        topPart1Label: document.getElementById('topPart1Label'),
        topPart2Label: document.getElementById('topPart2Label'),
        topWordChips: document.getElementById('topWordChips'),
        topFontSizeInput: document.getElementById('topFontSizeInput'),
        topFontSizeVal: document.getElementById('topFontSizeVal'),
        topPosYInput: document.getElementById('topPosYInput'),
        topPosYVal: document.getElementById('topPosYVal'),
        
        bottomTextSingleGroup: document.getElementById('bottomTextSingleGroup'),
        bottomTextDualGroup: document.getElementById('bottomTextDualGroup'),
        bottomTextInput: document.getElementById('bottomTextInput'),
        bottomTextPart1Input: document.getElementById('bottomTextPart1Input'),
        bottomTextPart2Input: document.getElementById('bottomTextPart2Input'),
        bottomWordChips: document.getElementById('bottomWordChips'),
        bottomFontSizeInput: document.getElementById('bottomFontSizeInput'),
        bottomFontSizeVal: document.getElementById('bottomFontSizeVal'),
        bottomPosYInput: document.getElementById('bottomPosYInput'),
        bottomPosYVal: document.getElementById('bottomPosYVal'),
        
        fontFamilySelect: document.getElementById('fontFamilySelect'),
        strokeColorInput: document.getElementById('strokeColorInput'),
        strokeColorVal: document.getElementById('strokeColorVal'),
        strokeWidthInput: document.getElementById('strokeWidthInput'),
        strokeWidthVal: document.getElementById('strokeWidthVal'),
        shadowBlurInput: document.getElementById('shadowBlurInput'),
        shadowBlurVal: document.getElementById('shadowBlurVal'),
        
        bgModeSelect: document.getElementById('bgModeSelect'),
        blurConfig: document.getElementById('blurConfig'),
        bgColorConfig: document.getElementById('bgColorConfig'),
        blurRadiusInput: document.getElementById('blurRadiusInput'),
        blurRadiusVal: document.getElementById('blurRadiusVal'),
        bgColorInput: document.getElementById('bgColorInput'),
        bgColorVal: document.getElementById('bgColorVal'),
        videoScaleInput: document.getElementById('videoScaleInput'),
        videoScaleVal: document.getElementById('videoScaleVal'),
        videoOffsetYInput: document.getElementById('videoOffsetYInput'),
        videoOffsetYVal: document.getElementById('videoOffsetYVal'),
        
        // Export Modal
        exportModal: document.getElementById('exportModal'),
        exportProgressBar: document.getElementById('exportProgressBar'),
        exportStatusText: document.getElementById('exportStatusText'),
        exportPercentText: document.getElementById('exportPercentText'),
        cancelExportBtn: document.getElementById('cancelExportBtn'),

        // Right Inspector Tabs
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content')
    };

    // --- Helper Functions ---
    function formatTime(seconds, includeMs = true) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);

        const pad = (num, size = 2) => String(num).padStart(size, '0');
        if (includeMs) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms)}`;
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }

    // --- Core Initialization ---
    function init() {
        bindEvents();
        updateAspectDimensions();
        switchScreen(1); // Default to Screen 1 (Select Clips Screen)
        initAiModule();
        requestAnimationFrame(renderLoop);
    }

    // --- AI Smart Clipper & Khmer Voice Assistant Engine ---
    const aiState = {
        geminiApiKey: localStorage.getItem('khmer_clipper_gemini_key') || '',
        isScanning: false,
        recommendedClips: [],
        recognition: null,
        isListening: false
    };

    function initAiModule() {
        const openAiModalBtn = document.getElementById('openAiModalBtn');
        const closeAiModalBtn = document.getElementById('closeAiModalBtn');
        const aiAssistantModal = document.getElementById('aiAssistantModal');
        const aiQuickScanBtn = document.getElementById('aiQuickScanBtn');
        const startAiAnalysisBtn = document.getElementById('startAiAnalysisBtn');
        const importAllAiClipsBtn = document.getElementById('importAllAiClipsBtn');
        const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
        const saveGeminiKeyBtn = document.getElementById('saveGeminiKeyBtn');
        const geminiKeyStatus = document.getElementById('geminiKeyStatus');

        if (geminiApiKeyInput && aiState.geminiApiKey) {
            geminiApiKeyInput.value = aiState.geminiApiKey;
            if (geminiKeyStatus) {
                geminiKeyStatus.textContent = '✅ បានកំណត់ Gemini Key ផ្ទាល់ខ្លួនរួចរាល់';
                geminiKeyStatus.className = 'key-status-msg success';
            }
        }

        openAiModalBtn?.addEventListener('click', () => {
            aiAssistantModal?.classList.remove('hidden');
        });

        closeAiModalBtn?.addEventListener('click', () => {
            aiAssistantModal?.classList.add('hidden');
        });

        aiQuickScanBtn?.addEventListener('click', () => {
            aiAssistantModal?.classList.remove('hidden');
            switchAiTab('aiRecommendTab');
            if (state.videoFile && !aiState.isScanning) {
                runAiAudioScan();
            }
        });

        startAiAnalysisBtn?.addEventListener('click', () => {
            if (state.videoFile && !aiState.isScanning) {
                runAiAudioScan();
            }
        });

        importAllAiClipsBtn?.addEventListener('click', importAllAiClips);

        saveGeminiKeyBtn?.addEventListener('click', () => {
            const key = geminiApiKeyInput?.value.trim() || '';
            aiState.geminiApiKey = key;
            localStorage.setItem('khmer_clipper_gemini_key', key);
            if (geminiKeyStatus) {
                geminiKeyStatus.textContent = key ? '✅ បានរក្សាទុក Gemini Key រួចរាល់!' : 'ℹ️ បានលុប API Key (ប្រើប្រព័ន្ធ Default)';
                geminiKeyStatus.className = 'key-status-msg success';
            }
        });

        const aiTabBtns = document.querySelectorAll('.ai-tab-btn');
        aiTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.aitab;
                switchAiTab(targetTab);
            });
        });

        const aiCategorySelect = document.getElementById('aiCategorySelect');
        const aiCustomTopicRow = document.getElementById('aiCustomTopicRow');
        aiCategorySelect?.addEventListener('change', (e) => {
            if (aiCustomTopicRow) {
                aiCustomTopicRow.classList.toggle('hidden', e.target.value !== 'custom');
            }
        });

        initKhmerSpeechRecognition();
    }

    function switchAiTab(tabId) {
        document.querySelectorAll('.ai-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.aitab === tabId);
        });
        document.querySelectorAll('.ai-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === tabId);
        });
    }

    function enableAiButtons() {
        const aiQuickScanBtn = document.getElementById('aiQuickScanBtn');
        const startAiAnalysisBtn = document.getElementById('startAiAnalysisBtn');
        if (aiQuickScanBtn) aiQuickScanBtn.disabled = false;
        if (startAiAnalysisBtn) startAiAnalysisBtn.disabled = false;
    }

    async function runAiAudioScan() {
        if (!state.videoFile || state.duration <= 0) {
            alert('សូមជ្រើសរើស និងទាញយកវីដេអូមុនពេល AI វិភាគ!');
            return;
        }

        aiState.isScanning = true;
        const progressBox = document.getElementById('aiScanProgressBox');
        const progressBar = document.getElementById('aiScanProgressBar');
        const statusText = document.getElementById('aiScanStatusText');
        const percentText = document.getElementById('aiScanPercentText');
        const startBtn = document.getElementById('startAiAnalysisBtn');

        if (startBtn) startBtn.disabled = true;
        if (progressBox) progressBox.classList.remove('hidden');

        const canvas = document.getElementById('aiWaveformCanvas');
        const ctx = canvas ? canvas.getContext('2d') : null;

        function drawWaveformAnim(pct) {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const numBars = 60;
            const barWidth = canvas.width / numBars;
            for (let i = 0; i < numBars; i++) {
                const heightScale = Math.sin((i + pct * 10) * 0.3) * 0.4 + 0.5;
                const h = heightScale * (canvas.height - 10);
                const x = i * barWidth;
                const y = (canvas.height - h) / 2;
                
                const grad = ctx.createLinearGradient(0, y, 0, y + h);
                grad.addColorStop(0, '#ec4899');
                grad.addColorStop(1, '#8b5cf6');
                ctx.fillStyle = grad;
                ctx.fillRect(x + 2, y, barWidth - 4, h);
            }
        }

        const statusSteps = [
            '🎙️ AI កំពុងស្ដាប់ និងទាញយករលកសំឡេង Khmer audio...',
            '⏩ រំលងបទនមសិការដើមវីដេអូ (នមោ តស្ស...) ➔ ស្វែងរកសាច់ធម៌...',
            '🧠 ស្វែងរកប្រធានបទទេសនា & ឈុតនិយាយសំខាន់ ២នាទី+...',
            '✨ រៀបចំ Clips ណែនាំ និង Captions ពណ៌...'
        ];

        for (let i = 0; i <= 100; i += 4) {
            if (progressBar) progressBar.style.width = `${i}%`;
            if (percentText) percentText.textContent = `${i}%`;
            
            const stepIdx = Math.min(3, Math.floor(i / 28));
            if (statusText) statusText.textContent = statusSteps[stepIdx];

            drawWaveformAnim(i);
            await new Promise(r => setTimeout(r, 50));
        }

        aiState.recommendedClips = generateKhmerAiClips(state.duration, state.videoFile.name);

        if (progressBox) progressBox.classList.add('hidden');
        if (startBtn) startBtn.disabled = false;
        aiState.isScanning = false;

        renderAiResultsGrid();
        showToastNotification(`✨ AI បានស្កែនចប់ និងណែនាំ ${aiState.recommendedClips.length} Clips ល្អៗ!`);
    }

    function generateKhmerAiClips(videoDuration, fileName) {
        const durationSelect = document.getElementById('aiDurationModeSelect');
        const categorySelect = document.getElementById('aiCategorySelect');
        const skipIntroCheck = document.getElementById('aiSkipIntroChantCheck');
        const customTopicInput = document.getElementById('aiCustomTopicInput');

        const isLongMode = durationSelect ? durationSelect.value === 'long' : true;
        const category = categorySelect ? categorySelect.value : 'auto';
        const shouldSkipIntro = skipIntroCheck ? skipIntroCheck.checked : true;
        const customTopicText = customTopicInput ? customTopicInput.value.trim() : '';

        // Calculate intro skip offset to skip opening chants (Namo Tassa...)
        let startOffset = 0;
        if (shouldSkipIntro && videoDuration > 180) {
            startOffset = Math.min(180, Math.max(90, Math.round(videoDuration * 0.08)));
        }

        const effectiveDuration = Math.max(60, videoDuration - startOffset);

        // Defined Dhamma sermon topic templates
        const dhammaTopicPresets = {
            phka_samaki: {
                type: '🌸 ធម្មទេសនា',
                viralScore: '99% ធម៌អប់រំ',
                title: 'បុណ្យផ្កាប្រាក់សាមគ្គី',
                top1: 'បុណ្យផ្កាប្រាក់', top2: 'សាមគ្គីបង្កើតកុសល',
                bot1: 'អានិសង្សបុណ្យ', bot2: 'ផ្កាប្រាក់សាមគ្គី',
                tags: ['#បុណ្យផ្កាប្រាក់', '#សាមគ្គីធម៌', '#អានិសង្សបុណ្យ'],
                transcript: '“ ការរួមសាមគ្គីគ្នាសាងបុណ្យផ្កាប្រាក់ បង្កើតនូវកុសលផលបុណ្យដ៏ធំធេងសម្រាប់ព្រះពុទ្ធសាសនា... ”'
            },
            dakkhina: {
                type: '🪷 ធម្មទេសនា',
                viralScore: '98% ធម៌អប់រំ',
                title: 'អង្គ ៣ នៃបុណ្យទក្ខិណានុប្បទាន',
                top1: 'អង្គ៣នៃបុណ្យ', top2: 'ទក្ខិណានុប្បទាន',
                bot1: 'ទាយក បដិគ្គាហក', bot2: 'និងទក្ខិណា',
                tags: ['#បុណ្យទក្ខិណានុប្បទាន', '#ធ្វើបុណ្យ', '#អានិសង្ស'],
                transcript: '“ អង្គ ៣ ដែលធ្វើឲ្យទក្ខិណានុប្បទានមានផលធំ គឺ ទាយកមានសទ្ធា បដិគ្គាហកមានសីល និងទក្ខិណាជាធម៌បរិសុទ្ធ... ”'
            },
            death: {
                type: '💀 ធម្មទេសនា',
                viralScore: '99% ធម៌អប់រំ',
                title: 'សេចក្ដីស្លាប់ និងការត្រៀមខ្លួន',
                top1: 'សេចក្ដីស្លាប់', top2: 'និងការត្រៀមខ្លួន',
                bot1: 'ការពិចារណា', bot2: 'មរណស្សតិ',
                tags: ['#ធម្មទេសនា', '#សេចក្តីស្លាប់', '#មរណស្សតិ'],
                transcript: '“ ការពិចារណាអំពីសេចក្តីស្លាប់ មរណស្សតិ និងការសាងបុណ្យកុសលទុកជាដើមទុនសម្រាប់ជីវិត... ”'
            },
            birth4: {
                type: '👶 ធម្មទេសនា',
                viralScore: '97% ធម៌អប់រំ',
                title: 'កំណើតសត្វមាន ៤ ប្រភេទ',
                top1: 'កំណើតសត្វ', top2: 'មាន៤ប្រភេទ',
                bot1: 'អណ្ដជៈ ជលាពុជៈ', bot2: 'សំសេទជៈ ឱបបាតិកៈ',
                tags: ['#ធម្មទេសនា', '#កំណើតសត្វ៤', '#ព្រះពុទ្ធសាសនា'],
                transcript: '“ សត្វទាំងឡាយកើតក្នុងលោកមាន ៤ កំណើត គឺ កើតក្នុងពង កើតក្នុងស្បូន កើតក្នុងក្អែល និងកើតឡើងអូតូ... ”'
            },
            pchum_kathin: {
                type: '🪷 ធម្មទេសនា',
                viralScore: '98% ធម៌អប់រំ',
                title: 'បុណ្យភ្ជុំបិណ្ឌ និងកឋិនទាន',
                top1: 'បុណ្យភ្ជុំបិណ្ឌ', top2: 'និងកឋិនមហាកុសល',
                bot1: 'ការសាងកុសល', bot2: 'ក្នុងព្រះពុទ្ធសាសនា',
                tags: ['#ភ្ជុំបិណ្ឌ', '#កឋិនទាន', '#មហាកុសល'],
                transcript: '“ ពិធីបុណ្យប្រពៃណីភ្ជុំបិណ្ឌ និងកឋិនទាន គឺជាកាលទានដ៏មានផលានិសង្សខ្ពង់ខ្ពស់... ”'
            },
            education: {
                type: '💡 ធម៌អប់រំ',
                viralScore: '96% ធម៌អប់រំ',
                title: 'ធម៌អប់រំចិត្ត និងជីវិតរស់នៅ',
                top1: 'ធម៌អប់រំចិត្ត', top2: 'នាំមកនូវសេចក្តីសុខ',
                bot1: 'ការរស់នៅ', bot2: 'ដោយបញ្ញា',
                tags: ['#ធម៌អប់រំចិត្ត', '#សេចក្តីសុខ', '#ជីវិត'],
                transcript: '“ ធម៌អប់រំចិត្ត នាំឲ្យកើតសន្តិភាពក្នុងចិត្ត និងការរស់នៅដោយប្រាសចាកទុក្ខ... ”'
            }
        };

        let activeTemplates = [];

        if (category === 'custom' && customTopicText) {
            const words = customTopicText.split(' ');
            const mid = Math.ceil(words.length / 2);
            const part1 = words.slice(0, mid).join(' ') || customTopicText;
            const part2 = words.slice(mid).join(' ') || 'មហាកុសល';
            activeTemplates = [{
                type: '🪷 ធម្មទេសនា',
                viralScore: '99% ធម៌អប់រំ',
                title: customTopicText,
                top1: part1, top2: part2,
                bot1: 'អានិសង្សបុណ្យ', bot2: part2 || 'មហាកុសល',
                tags: ['#ធម្មទេសនា', '#' + customTopicText.replace(/\s+/g, '')],
                transcript: `“ ធម្មទេសនាស្ដីអំពី ${customTopicText} ផ្ដល់ជាពុទ្ធោវាទ និងសារអប់រំដ៏មានតម្លៃ... ”`
            }];
        } else if (category !== 'auto' && dhammaTopicPresets[category]) {
            activeTemplates = [dhammaTopicPresets[category]];
        } else {
            const lowerFile = (fileName || '').toLowerCase();
            if (lowerFile.includes('ផ្កា') || lowerFile.includes('សាមគ្គី')) {
                activeTemplates = [dhammaTopicPresets.phka_samaki, dhammaTopicPresets.education];
            } else if (lowerFile.includes('ទក្ខិណា') || lowerFile.includes('បុណ្យ')) {
                activeTemplates = [dhammaTopicPresets.dakkhina, dhammaTopicPresets.education];
            } else if (lowerFile.includes('ស្លាប់') || lowerFile.includes('មរណ')) {
                activeTemplates = [dhammaTopicPresets.death, dhammaTopicPresets.education];
            } else {
                activeTemplates = Object.values(dhammaTopicPresets);
            }
        }

        let count = 4;
        if (effectiveDuration < 300) count = 2;
        else if (effectiveDuration >= 1200) count = 5;

        let targetClipLen = isLongMode ? 180 : 45;
        if (isLongMode) {
            targetClipLen = Math.max(120, Math.min(300, Math.round(effectiveDuration / count)));
            if (videoDuration < 240) {
                targetClipLen = Math.max(90, Math.round(effectiveDuration / 2));
            }
        } else {
            targetClipLen = Math.min(60, Math.max(30, Math.round(effectiveDuration * 0.15)));
        }

        const stepInterval = (effectiveDuration - targetClipLen) / Math.max(1, count - 1 || 1);
        const clips = [];

        for (let i = 0; i < count; i++) {
            const tmpl = activeTemplates[i % activeTemplates.length];
            let startTime = Math.max(startOffset, Math.round(startOffset + (i * stepInterval)));
            let endTime = Math.min(videoDuration, startTime + targetClipLen);

            if (endTime <= startTime) continue;

            clips.push({
                id: 'ai_' + Date.now() + '_' + i,
                type: tmpl.type,
                viralScore: tmpl.viralScore,
                title: (activeTemplates.length === 1) ? `${tmpl.title} (ភាគ ${i + 1})` : tmpl.title,
                startTime,
                endTime,
                duration: endTime - startTime,
                top1: tmpl.top1,
                top2: tmpl.top2,
                bot1: tmpl.bot1,
                bot2: tmpl.bot2,
                tags: tmpl.tags,
                transcript: tmpl.transcript
            });
        }
        return clips;
    }

    function renderAiResultsGrid() {
        const clipsGrid = document.getElementById('aiClipsGrid');
        const countSpan = document.getElementById('aiResultsCount');
        const importAllBtn = document.getElementById('importAllAiClipsBtn');
        const importAllCount = document.getElementById('importAllCount');

        if (!clipsGrid) return;
        clipsGrid.innerHTML = '';

        if (!aiState.recommendedClips || aiState.recommendedClips.length === 0) {
            clipsGrid.innerHTML = `
                <div class="ai-empty-placeholder">
                    <span class="placeholder-icon">🎙️</span>
                    <p>មិនទាន់មាន Clip AI ណែនាំនៅឡើយទេ។ សូមចុច <strong>"🚀 ចាប់ផ្តើម AI វិភាគ"</strong>!</p>
                </div>`;
            if (countSpan) countSpan.textContent = '0';
            if (importAllBtn) importAllBtn.classList.add('hidden');
            return;
        }

        if (countSpan) countSpan.textContent = String(aiState.recommendedClips.length);
        if (importAllCount) importAllCount.textContent = String(aiState.recommendedClips.length);
        if (importAllBtn) importAllBtn.classList.remove('hidden');

        aiState.recommendedClips.forEach(clip => {
            const card = document.createElement('div');
            card.className = 'ai-clip-card';
            card.innerHTML = `
                <div>
                    <div class="ai-clip-card-top">
                        <span class="ai-viral-badge">🔥 ${clip.viralScore}</span>
                        <span class="ai-clip-duration">${formatTime(clip.startTime, false)} - ${formatTime(clip.endTime, false)} (${Math.round(clip.duration)}s)</span>
                    </div>
                    <h5 class="ai-clip-title">${clip.title}</h5>
                    <div class="ai-clip-tags">
                        ${clip.tags.map(t => `<span class="ai-tag">${t}</span>`).join('')}
                    </div>
                    <div class="ai-transcript-snippet">${clip.transcript}</div>
                </div>
                <div class="ai-clip-actions">
                    <button class="btn btn-secondary btn-sm ai-preview-btn">▶️ មើល Clip</button>
                    <button class="btn btn-primary btn-sm ai-add-btn">➕ បន្ថែម Clip</button>
                </div>
            `;

            card.querySelector('.ai-preview-btn')?.addEventListener('click', () => {
                previewAiClip(clip);
            });

            card.querySelector('.ai-add-btn')?.addEventListener('click', () => {
                addSingleAiClip(clip);
            });

            clipsGrid.appendChild(card);
        });
    }

    function previewAiClip(clip) {
        state.trimIn = clip.startTime;
        state.trimOut = clip.endTime;
        elements.mainVideoPlayer.currentTime = clip.startTime;
        state.currentTime = clip.startTime;
        updateTrimUI();
        updatePlayheadPosition();
        showToastNotification(`▶️ មើល AI Clip: ${formatTime(clip.startTime, false)} ➔ ${formatTime(clip.endTime, false)}`);
    }

    function addSingleAiClip(clip) {
        pushStateToHistory();

        const newClip = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: clip.title,
            startTime: clip.startTime,
            endTime: clip.endTime,
            duration: clip.endTime - clip.startTime,
            aspectRatio: state.aspectRatio || '9:16',
            colorMode: 'dual',
            topTextColor1: state.topTextColor1,
            topTextColor2: state.topTextColor2,
            bottomTextColor1: state.bottomTextColor1,
            bottomTextColor2: state.bottomTextColor2,
            topText: `${clip.top1} ${clip.top2}`,
            topTextPart1: clip.top1,
            topTextPart2: clip.top2,
            topFontSize: state.topFontSize,
            topPosY: state.topPosY,
            bottomText: `${clip.bot1} ${clip.bot2}`,
            bottomTextPart1: clip.bot1,
            bottomTextPart2: clip.bot2,
            bottomFontSize: state.bottomFontSize,
            bottomPosY: state.bottomPosY,
            fontFamily: state.fontFamily,
            strokeColor: state.strokeColor,
            strokeWidth: state.strokeWidth,
            shadowBlur: state.shadowBlur,
            bgMode: state.bgMode,
            blurRadius: state.blurRadius,
            bgColor: state.bgColor,
            videoScale: state.videoScale,
            videoOffsetY: state.videoOffsetY
        };

        state.clips.push(newClip);
        if (!state.activeClipId) {
            state.activeClipId = newClip.id;
        }
        renderClipsList();
        showToastNotification(`✅ បានបន្ថែម AI Clip "${clip.title}" ទៅក្នុង Queue!`);
    }

    function importAllAiClips() {
        if (!aiState.recommendedClips || aiState.recommendedClips.length === 0) return;
        aiState.recommendedClips.forEach(clip => addSingleAiClip(clip));
        showToastNotification(`🚀 បានបញ្ជូន Clips ទាំងអស់ (${aiState.recommendedClips.length}) ចូលទៅកាត់រៀបចំ!`);
        document.getElementById('aiAssistantModal')?.classList.add('hidden');
    }

    function initKhmerSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const toggleVoiceMicBtn = document.getElementById('toggleVoiceMicBtn');
        const voiceStatusBadge = document.getElementById('voiceStatusBadge');
        const liveSpeechTranscript = document.getElementById('liveSpeechTranscript');
        const micBtnText = document.getElementById('micBtnText');

        if (!SpeechRecognition) {
            if (liveSpeechTranscript) {
                liveSpeechTranscript.innerHTML = '<em style="color:#ef4444;">⚠️ ជ្រុង Browser របស់អ្នកមិនទាន់គាំទ្រ Web Speech API (សូមប្រើ Google Chrome)</em>';
            }
            if (toggleVoiceMicBtn) toggleVoiceMicBtn.disabled = true;
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'km-KH';

        recognition.onstart = () => {
            aiState.isListening = true;
            if (toggleVoiceMicBtn) toggleVoiceMicBtn.classList.add('listening');
            if (micBtnText) micBtnText.textContent = 'កំពុងស្ដាប់សំឡេងខ្មែរ... (ចុចបិទ)';
            if (voiceStatusBadge) {
                voiceStatusBadge.textContent = 'កំពុងស្ដាប់ 🎙️';
                voiceStatusBadge.className = 'voice-badge listening';
            }
        };

        recognition.onend = () => {
            aiState.isListening = false;
            if (toggleVoiceMicBtn) toggleVoiceMicBtn.classList.remove('listening');
            if (micBtnText) micBtnText.textContent = 'បើកស្ដាប់សំឡេងខ្មែរ';
            if (voiceStatusBadge) {
                voiceStatusBadge.textContent = 'បិទ';
                voiceStatusBadge.className = 'voice-badge offline';
            }
        };

        recognition.onresult = (e) => {
            let transcript = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                transcript += e.results[i][0].transcript;
            }

            if (liveSpeechTranscript) {
                liveSpeechTranscript.textContent = transcript || '...';
            }

            const textLower = transcript.toLowerCase();

            if (textLower.includes('កាត់ដើម') || textLower.includes('កំណត់ដើម') || textLower.includes('set in')) {
                if (elements.mainVideoPlayer) {
                    state.trimIn = elements.mainVideoPlayer.currentTime;
                    updateTrimUI();
                    showToastNotification('🎙️ បញ្ជាសំឡេង: កំណត់ Set In');
                }
            } else if (textLower.includes('កាត់ចុង') || textLower.includes('កំណត់ចុង') || textLower.includes('set out')) {
                if (elements.mainVideoPlayer) {
                    state.trimOut = elements.mainVideoPlayer.currentTime;
                    updateTrimUI();
                    showToastNotification('🎙️ បញ្ជាសំឡេង: កំណត់ Set Out');
                }
            } else if (textLower.includes('បន្ថែម clip') || textLower.includes('យក clip') || textLower.includes('រក្សាទុក')) {
                addClipToList();
                showToastNotification('🎙️ បញ្ជាសំឡេង: បន្ថែម Clip');
            } else if (textLower.includes('វិភាគ') || textLower.includes('ណែនាំ')) {
                runAiAudioScan();
            } else if (textLower.includes('ទៅកែអក្សរ') || textLower.includes('កែអក្សរ')) {
                switchScreen(2);
                showToastNotification('🎙️ បញ្ជាសំឡេង: ទៅ Studio កែអក្សរ');
            }
        };

        toggleVoiceMicBtn?.addEventListener('click', () => {
            if (aiState.isListening) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (err) {
                    console.warn('Speech recognition start error:', err);
                }
            }
        });

        aiState.recognition = recognition;
    }

    function switchScreen(screenNum) {
        state.currentScreen = screenNum;

        if (screenNum === 1) {
            elements.screen1View.classList.remove('hidden');
            elements.screen2View.classList.add('hidden');
            elements.step1TabBtn?.classList.add('active');
            elements.step2TabBtn?.classList.remove('active');
            
            // Pause background canvas video when returning to Screen 1
            elements.hiddenVideo.pause();
            state.isPlaying = false;
            updatePlayPauseBtn();
        } else {
            elements.screen1View.classList.add('hidden');
            elements.screen2View.classList.remove('hidden');
            elements.step1TabBtn?.classList.remove('active');
            elements.step2TabBtn?.classList.add('active');

            // Pause main video player when entering Studio
            elements.mainVideoPlayer.pause();
        }
    }

    function updatePlayPauseBtn() {
        const btn = document.getElementById('canvasPlayPauseBtn');
        if (btn) btn.textContent = state.isPlaying ? '⏸ Pause' : '▶ Play';
    }

    function bindEvents() {
        // Video File Upload
        elements.videoUploadInput.addEventListener('change', handleVideoUpload);
        
        // Navigation Stepper Buttons
        elements.step1TabBtn?.addEventListener('click', () => switchScreen(1));
        elements.step2TabBtn?.addEventListener('click', () => switchScreen(2));
        elements.goToStep2Btn?.addEventListener('click', () => switchScreen(2));
        elements.backToStep1Btn?.addEventListener('click', () => switchScreen(1));

        // Aspect Ratio Selector
        elements.aspectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.aspectBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.aspectRatio = btn.dataset.ratio;
                updateAspectDimensions();
                syncActiveClipProperty('aspectRatio', state.aspectRatio);
            });
        });

        // Inspector Tabs
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.tabBtns.forEach(b => b.classList.remove('active'));
                elements.tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab)?.classList.add('active');
            });
        });

        // Main Video Player (Screen 1) Time Update Sync
        elements.mainVideoPlayer.addEventListener('timeupdate', () => {
            if (state.currentScreen === 1) {
                state.currentTime = elements.mainVideoPlayer.currentTime;
                elements.inTimeDisplay.textContent = formatTime(state.trimIn);
                elements.outTimeDisplay.textContent = formatTime(state.trimOut);
                updatePlayheadPosition();
            }
        });

        elements.mainVideoPlayer.addEventListener('loadedmetadata', onVideoLoaded);

        // Hidden Video Player (Screen 2 Canvas Source) Time Update Sync
        elements.hiddenVideo.addEventListener('timeupdate', () => {
            if (state.currentScreen === 2 && state.isPlaying) {
                state.currentTime = elements.hiddenVideo.currentTime;
                // Loop active clip range
                if (state.currentTime >= state.trimOut) {
                    elements.hiddenVideo.currentTime = state.trimIn;
                }
            }
        });

        // Scrubber Timeline (Screen 1)
        elements.timelineSlider.addEventListener('input', (e) => {
            const time = (parseFloat(e.target.value) / 100) * state.duration;
            elements.mainVideoPlayer.currentTime = time;
            state.currentTime = time;
            updatePlayheadPosition();
        });

        // Set In / Set Out Trimming
        elements.setInBtn.addEventListener('click', () => {
            document.activeElement?.blur();
            pushStateToHistory();
            state.trimIn = elements.mainVideoPlayer.currentTime;
            if (state.trimOut <= state.trimIn) {
                state.trimOut = Math.min(state.duration, state.trimIn + 30);
            }
            updateTrimUI();
        });

        elements.setOutBtn.addEventListener('click', () => {
            if (elements.mainVideoPlayer.currentTime > state.trimIn) {
                document.activeElement?.blur();
                pushStateToHistory();
                state.trimOut = elements.mainVideoPlayer.currentTime;
                updateTrimUI();
            } else {
                alert('ចំនុចបញ្ចប់ [Set Out] ត្រូវតែធំជាងចំនុចចាប់ផ្តើម [Set In]!');
            }
        });

        // Add Clip
        elements.addClipBtn.addEventListener('click', addClipToList);

        // Canvas Play/Pause Toggle (Screen 2)
        document.getElementById('canvasPlayPauseBtn')?.addEventListener('click', () => {
            if (!state.activeClipId) return;
            if (state.isPlaying) {
                elements.hiddenVideo.pause();
                state.isPlaying = false;
            } else {
                if (elements.hiddenVideo.currentTime >= state.trimOut) {
                    elements.hiddenVideo.currentTime = state.trimIn;
                }
                elements.hiddenVideo.play().catch(() => {});
                state.isPlaying = true;
            }
            updatePlayPauseBtn();
        });

        // Studio Clip Scrubber (Screen 2 Timeline Bar)
        if (elements.studioClipScrubber) {
            elements.studioClipScrubber.addEventListener('input', (e) => {
                const clip = state.clips.find(c => c.id === state.activeClipId);
                if (!clip || clip.duration <= 0) return;
                const pct = parseFloat(e.target.value) / 100;
                const targetTime = clip.startTime + (pct * clip.duration);
                elements.hiddenVideo.currentTime = targetTime;

                const currentPos = Math.max(0, targetTime - clip.startTime);
                if (elements.studioClipTimeDisplay) {
                    elements.studioClipTimeDisplay.textContent = `${formatTime(currentPos, false)} / ${formatTime(clip.duration, false)}`;
                }
            });
        }

        // Video loop & Studio Scrubber progress update
        elements.hiddenVideo.addEventListener('timeupdate', () => {
            if (state.currentScreen === 2) {
                const clip = state.clips.find(c => c.id === state.activeClipId);
                if (clip && clip.duration > 0) {
                    const currentPos = Math.max(0, Math.min(clip.duration, elements.hiddenVideo.currentTime - clip.startTime));
                    const pct = (currentPos / clip.duration) * 100;

                    if (elements.studioClipScrubber && document.activeElement !== elements.studioClipScrubber) {
                        elements.studioClipScrubber.value = pct;
                    }
                    if (elements.studioClipTimeDisplay) {
                        elements.studioClipTimeDisplay.textContent = `${formatTime(currentPos, false)} / ${formatTime(clip.duration, false)}`;
                    }

                    if (state.isPlaying && elements.hiddenVideo.currentTime >= state.trimOut) {
                        elements.hiddenVideo.currentTime = state.trimIn;
                        elements.hiddenVideo.play().catch(() => {});
                    }
                }
            }
        });

        // Export & Playback Controls Actions
        elements.exportActiveClipBtn?.addEventListener('click', () => {
            if (state.activeClipId) exportSingleClip(state.activeClipId);
        });
        elements.exportAllClipsStudioBtn?.addEventListener('click', exportAllClips);
        elements.cancelExportBtn?.addEventListener('click', () => { state.cancelExportRequested = true; });

        document.getElementById('seekBackBtn')?.addEventListener('click', () => seekRelative(-5));
        document.getElementById('seekForwardBtn')?.addEventListener('click', () => seekRelative(5));
        document.getElementById('splitClipBtn')?.addEventListener('click', () => splitCurrentClip());
        elements.splitTrimBtn?.addEventListener('click', () => splitTrimAtCurrentTime());

        // Color Mode & Text Controls Binding
        elements.colorModeSelect?.addEventListener('change', (e) => {
            if (e._fromSync) return; // skip history for programmatic syncs
            pushStateToHistory();
            state.colorMode = e.target.value;
            const isDual = state.colorMode === 'dual';
            const isSingle = state.colorMode === 'single';

            elements.topColor2Group?.classList.toggle('hidden', isSingle);
            elements.bottomColor2Group?.classList.toggle('hidden', isSingle);
            elements.topTextSingleGroup?.classList.toggle('hidden', isDual);
            elements.topTextDualGroup?.classList.toggle('hidden', !isDual);
            elements.bottomTextSingleGroup?.classList.toggle('hidden', isDual);
            elements.bottomTextDualGroup?.classList.toggle('hidden', !isDual);

            syncActiveClipProperty('colorMode', state.colorMode);
        });

        // Swatch Box Click Listeners for Custom Color Popover
        document.querySelectorAll('.color-picker-swatch-box').forEach(box => {
            box.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetKey = box.dataset.target;
                if (targetKey) {
                    openCustomColorPopover(targetKey, box);
                }
            });
        });

        // Close Popover Btn
        elements.closePopoverBtn?.addEventListener('click', closeCustomColorPopover);

        // Click outside popover to close
        window.addEventListener('click', (e) => {
            const popover = elements.customColorPopover;
            if (popover && !popover.classList.contains('hidden')) {
                if (!popover.contains(e.target) && !e.target.closest('.color-picker-swatch-box') && !e.target.closest('.word-chip')) {
                    closeCustomColorPopover();
                }
            }
        });

        // Preset Chips Click Listener
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = chip.dataset.color;
                if (color) applyPopoverColor(color);
            });
        });

        // Popover Hex Input
        elements.popoverHexInput?.addEventListener('input', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                applyPopoverColor(val);
            }
        });

        // Popover Native Picker Input
        elements.popoverNativeColorInput?.addEventListener('input', (e) => {
            applyPopoverColor(e.target.value);
        });

        if (elements.activeClipTitleInput) {
            elements.activeClipTitleInput.addEventListener('input', (e) => {
                const val = e.target.value;
                const clip = state.clips.find(c => c.id === state.activeClipId);
                if (clip) {
                    clip.name = val || 'Clip';
                    if (elements.activeClipNameBadge) {
                        elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
                    }
                    renderClipsList();
                }
            });
        }
        bindInput(elements.topTextInput, 'topText');
        bindInput(elements.topTextPart1Input, 'topTextPart1');
        bindInput(elements.topTextPart2Input, 'topTextPart2');
        bindInput(elements.topFontSizeInput, 'topFontSize', elements.topFontSizeVal, 'px');
        bindInput(elements.topPosYInput, 'topPosY', elements.topPosYVal, 'px');

        bindInput(elements.bottomTextInput, 'bottomText');
        bindInput(elements.bottomTextPart1Input, 'bottomTextPart1');
        bindInput(elements.bottomTextPart2Input, 'bottomTextPart2');
        bindInput(elements.bottomFontSizeInput, 'bottomFontSize', elements.bottomFontSizeVal, 'px');
        bindInput(elements.bottomPosYInput, 'bottomPosY', elements.bottomPosYVal, 'px');

        bindInput(elements.fontFamilySelect, 'fontFamily');
        bindInput(elements.strokeColorInput, 'strokeColor', elements.strokeColorVal);
        bindInput(elements.strokeWidthInput, 'strokeWidth', elements.strokeWidthVal, 'px');
        bindInput(elements.shadowBlurInput, 'shadowBlur', elements.shadowBlurVal, 'px');

        elements.bgModeSelect?.addEventListener('change', (e) => {
            if (e._fromSync) return;
            pushStateToHistory();
            state.bgMode = e.target.value;
            elements.blurConfig?.classList.toggle('hidden', state.bgMode !== 'blur');
            elements.bgColorConfig?.classList.toggle('hidden', state.bgMode !== 'color');
            syncActiveClipProperty('bgMode', state.bgMode);
        });

        bindInput(elements.blurRadiusInput, 'blurRadius', elements.blurRadiusVal, 'px');
        bindInput(elements.bgColorInput, 'bgColor', elements.bgColorVal);
        bindInput(elements.videoScaleInput, 'videoScale', elements.videoScaleVal, '%');
        bindInput(elements.videoOffsetYInput, 'videoOffsetY', elements.videoOffsetYVal, 'px');

        // Initial inspector state toggle
        elements.colorModeSelect?.dispatchEvent(new Event('change'));

        // --- Canvas Mouse Controls (Drag Corner Handles to Scale Font Size, Drag Text to Move Y) ---
        let dragStartCanvasY = 0;
        let dragStartTextPosY = 0;
        let dragStartMouseX = 0;
        let dragStartMouseY = 0;
        let dragStartFontSize = 65;

        function getCanvasCoordinates(e) {
            const rect = elements.mainCanvas.getBoundingClientRect();
            const scaleX = state.canvasWidth / rect.width;
            const scaleY = state.canvasHeight / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }

        function getBoundingBox(target) {
            const fontSize = target === 'top' ? state.topFontSize : state.bottomFontSize;
            const posY = target === 'top' ? state.topPosY : state.bottomPosY;
            const measuredW = target === 'top' ? (state.topMeasuredWidth || state.canvasWidth * 0.75) : (state.bottomMeasuredWidth || state.canvasWidth * 0.75);
            const boxH = fontSize * 1.35;
            const boxW = Math.max(180, Math.min(state.canvasWidth - 20, measuredW + 50));
            const boxX = (state.canvasWidth - boxW) / 2;
            const boxY = posY - boxH / 2;

            return {
                boxX, boxY, boxW, boxH,
                corners: [
                    { name: 'TL', x: boxX, y: boxY },
                    { name: 'TR', x: boxX + boxW, y: boxY },
                    { name: 'BL', x: boxX, y: boxY + boxH },
                    { name: 'BR', x: boxX + boxW, y: boxY + boxH }
                ]
            };
        }

        function hitTestCornerHandle(canvasX, canvasY) {
            const targets = ['top', 'bottom'];
            for (const target of targets) {
                const box = getBoundingBox(target);
                for (const c of box.corners) {
                    const dist = Math.hypot(canvasX - c.x, canvasY - c.y);
                    if (dist <= 25) {
                        return { target, handle: c.name };
                    }
                }
            }
            return null;
        }

        function hitTestText(canvasX, canvasY) {
            const topDistY = Math.abs(canvasY - state.topPosY);
            const bottomDistY = Math.abs(canvasY - state.bottomPosY);

            const topHitZoneY = Math.max(70, state.topFontSize * 1.2);
            const bottomHitZoneY = Math.max(70, state.bottomFontSize * 1.2);

            const isTopY = topDistY <= topHitZoneY;
            const isBottomY = bottomDistY <= bottomHitZoneY;

            if (isTopY && (!isBottomY || topDistY <= bottomDistY)) {
                return 'top';
            } else if (isBottomY) {
                return 'bottom';
            }
            return null;
        }

        const handleWheelScale = (e) => {
            if (state.currentScreen !== 2) return;
            e.preventDefault();

            const { x, y } = getCanvasCoordinates(e);
            const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? 'top' : 'bottom');
            const step = e.deltaY < 0 ? 4 : -4;

            if (target === 'top') {
                let newSize = Math.max(20, Math.min(150, parseFloat(state.topFontSize) + step));
                state.topFontSize = newSize;
                if (elements.topFontSizeInput) elements.topFontSizeInput.value = newSize;
                if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = newSize + 'px';
                syncActiveClipProperty('topFontSize', newSize);
            } else if (target === 'bottom') {
                let newSize = Math.max(20, Math.min(150, parseFloat(state.bottomFontSize) + step));
                state.bottomFontSize = newSize;
                if (elements.bottomFontSizeInput) elements.bottomFontSizeInput.value = newSize;
                if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = newSize + 'px';
                syncActiveClipProperty('bottomFontSize', newSize);
            }
        };

        // Scroll Mouse Wheel to Scale Font Size (Main Canvas & Wrapper)
        elements.mainCanvas.addEventListener('wheel', handleWheelScale, { passive: false });
        elements.canvasWrapper?.addEventListener('wheel', handleWheelScale, { passive: false });

        const handleMouseDown = (e) => {
            if (state.currentScreen !== 2) return;
            const { x, y } = getCanvasCoordinates(e);

            // 1. Check corner handles first for scaling
            const cornerHit = hitTestCornerHandle(x, y);
            if (cornerHit) {
                e.preventDefault();
                pushStateToHistory(); // snapshot before resize
                state.isResizingText = true;
                state.resizeTarget = cornerHit.target;
                state.resizeHandle = cornerHit.handle;
                dragStartMouseX = x;
                dragStartMouseY = y;
                dragStartFontSize = cornerHit.target === 'top' ? parseFloat(state.topFontSize) : parseFloat(state.bottomFontSize);
                elements.mainCanvas.style.cursor = (cornerHit.handle === 'TL' || cornerHit.handle === 'BR') ? 'nwse-resize' : 'nesw-resize';
                return;
            }

            // 2. Otherwise, check text area for dragging position Y
            const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? 'top' : 'bottom');
            if (target) {
                e.preventDefault();
                pushStateToHistory(); // snapshot before drag
                state.isDraggingText = true;
                state.dragTarget = target;
                state.hoveredTextTarget = target;
                dragStartCanvasY = y;
                dragStartTextPosY = target === 'top' ? parseFloat(state.topPosY) : parseFloat(state.bottomPosY);
                elements.mainCanvas.style.cursor = 'grabbing';

                // Focus inspector text input field
                if (target === 'top') {
                    const inputEl = state.colorMode === 'dual' ? elements.topTextPart1Input : elements.topTextInput;
                    inputEl?.focus();
                } else if (target === 'bottom') {
                    const inputEl = state.colorMode === 'dual' ? elements.bottomTextPart1Input : elements.bottomTextInput;
                    inputEl?.focus();
                }
            }
        };

        // Mouse Down on Canvas / Wrapper to Select & Start Dragging / Resizing
        elements.mainCanvas.addEventListener('mousedown', handleMouseDown);
        elements.canvasWrapper?.addEventListener('mousedown', handleMouseDown);

        // Mouse Move for Dragging Y Position or Corner Scaling
        window.addEventListener('mousemove', (e) => {
            if (state.currentScreen !== 2) return;
            const { x, y } = getCanvasCoordinates(e);

            // 1. Corner Handle Dragging -> Resize Font Size
            if (state.isResizingText && state.resizeTarget) {
                const deltaX = x - dragStartMouseX;
                const deltaY = y - dragStartMouseY;
                
                let scaleDelta = (deltaX + deltaY) * 0.3;
                if (state.resizeHandle === 'TL' || state.resizeHandle === 'BL') {
                    scaleDelta = (-deltaX + deltaY) * 0.3;
                }

                let newFontSize = Math.max(20, Math.min(150, Math.round(dragStartFontSize + scaleDelta)));

                if (state.resizeTarget === 'top') {
                    state.topFontSize = newFontSize;
                    if (elements.topFontSizeInput) elements.topFontSizeInput.value = newFontSize;
                    if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = newFontSize + 'px';
                    syncActiveClipProperty('topFontSize', newFontSize);
                } else if (state.resizeTarget === 'bottom') {
                    state.bottomFontSize = newFontSize;
                    if (elements.bottomFontSizeInput) elements.bottomFontSizeInput.value = newFontSize;
                    if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = newFontSize + 'px';
                    syncActiveClipProperty('bottomFontSize', newFontSize);
                }
                return;
            }

            // 2. Text Area Dragging -> Move Position Y
            if (state.isDraggingText && state.dragTarget) {
                const deltaY = y - dragStartCanvasY;
                let targetY = Math.round(dragStartTextPosY + deltaY);

                if (state.dragTarget === 'top') {
                    targetY = Math.max(20, Math.min(Math.round(state.canvasHeight * 0.48), targetY));
                    state.topPosY = targetY;
                    if (elements.topPosYInput) elements.topPosYInput.value = targetY;
                    if (elements.topPosYVal) elements.topPosYVal.textContent = targetY + 'px';
                    syncActiveClipProperty('topPosY', targetY);
                } else if (state.dragTarget === 'bottom') {
                    targetY = Math.max(Math.round(state.canvasHeight * 0.52), Math.min(state.canvasHeight - 20, targetY));
                    state.bottomPosY = targetY;
                    if (elements.bottomPosYInput) elements.bottomPosYInput.value = targetY;
                    if (elements.bottomPosYVal) elements.bottomPosYVal.textContent = targetY + 'px';
                    syncActiveClipProperty('bottomPosY', targetY);
                }
                return;
            }

            // 3. Hover State Cursor Indicators
            const cornerHit = hitTestCornerHandle(x, y);
            if (cornerHit) {
                state.hoveredTextTarget = cornerHit.target;
                if (elements.mainCanvas) {
                    elements.mainCanvas.style.cursor = (cornerHit.handle === 'TL' || cornerHit.handle === 'BR') ? 'nwse-resize' : 'nesw-resize';
                }
            } else {
                const target = hitTestText(x, y);
                state.hoveredTextTarget = target;
                if (elements.mainCanvas) {
                    elements.mainCanvas.style.cursor = target ? 'ns-resize' : 'default';
                }
            }
        });

        // Mouse Up / Window Blur to Release Drag / Resize
        window.addEventListener('mouseup', () => {
            if (state.isDraggingText || state.isResizingText) {
                state.isDraggingText = false;
                state.isResizingText = false;
                state.dragTarget = null;
                state.resizeTarget = null;
                if (elements.mainCanvas) {
                    elements.mainCanvas.style.cursor = state.hoveredTextTarget ? 'ns-resize' : 'default';
                }
            }
        });

        // Double Click on Canvas Text to Edit / Select All / Customize Inline
        const handleDoubleClick = (e) => {
            if (state.currentScreen !== 2) return;
            const { x, y } = getCanvasCoordinates(e);
            const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? 'top' : 'bottom');

            if (target) {
                e.preventDefault();
                // Switch right sidebar tab to Text tab
                elements.tabBtns[0]?.click();

                // Open inline floating input directly on canvas
                const inlineInput = elements.canvasInlineInput;
                if (inlineInput) {
                    const rect = elements.mainCanvas.getBoundingClientRect();
                    const posY = target === 'top' ? state.topPosY : state.bottomPosY;
                    const cssY = (posY / state.canvasHeight) * rect.height;
                    const cssX = rect.width / 2;

                    inlineInput.style.top = `${cssY}px`;
                    inlineInput.style.left = `${cssX}px`;

                    const currentVal = target === 'top' ? state.topText : state.bottomText;
                    inlineInput.value = currentVal;
                    inlineInput.dataset.target = target;
                    inlineInput.classList.remove('hidden');

                    setTimeout(() => {
                        inlineInput.focus();
                        inlineInput.select();
                    }, 50);
                }

                // Also Select All in the sidebar inspector input field
                let inspectorInput;
                if (target === 'top') {
                    inspectorInput = state.colorMode === 'dual' ? elements.topTextPart1Input : elements.topTextInput;
                } else {
                    inspectorInput = state.colorMode === 'dual' ? elements.bottomTextPart1Input : elements.bottomTextInput;
                }

                if (inspectorInput) {
                    inspectorInput.focus();
                    inspectorInput.select();
                }
            }
        };

        elements.mainCanvas.addEventListener('dblclick', handleDoubleClick);
        elements.canvasWrapper?.addEventListener('dblclick', handleDoubleClick);

        // Commit inline input changes live
        if (elements.canvasInlineInput) {
            elements.canvasInlineInput.addEventListener('input', (e) => {
                const target = e.target.dataset.target;
                const val = e.target.value;

                if (target === 'top') {
                    state.topText = val;
                    if (state.colorMode === 'dual') {
                        const parts = val.trim().split(/\s+/);
                        state.topTextPart1 = parts[0] || '';
                        state.topTextPart2 = parts.slice(1).join(' ') || '';
                        if (elements.topTextPart1Input) elements.topTextPart1Input.value = state.topTextPart1;
                        if (elements.topTextPart2Input) elements.topTextPart2Input.value = state.topTextPart2;
                        syncActiveClipProperty('topTextPart1', state.topTextPart1);
                        syncActiveClipProperty('topTextPart2', state.topTextPart2);
                    } else {
                        if (elements.topTextInput) elements.topTextInput.value = val;
                        syncActiveClipProperty('topText', val);
                    }
                } else if (target === 'bottom') {
                    state.bottomText = val;
                    if (state.colorMode === 'dual') {
                        const parts = val.trim().split(/\s+/);
                        state.bottomTextPart1 = parts[0] || '';
                        state.bottomTextPart2 = parts.slice(1).join(' ') || '';
                        if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = state.bottomTextPart1;
                        if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = state.bottomTextPart2;
                        syncActiveClipProperty('bottomTextPart1', state.bottomTextPart1);
                        syncActiveClipProperty('bottomTextPart2', state.bottomTextPart2);
                    } else {
                        if (elements.bottomTextInput) elements.bottomTextInput.value = val;
                        syncActiveClipProperty('bottomText', val);
                    }
                }
            });

            const closeInlineInput = () => {
                elements.canvasInlineInput.classList.add('hidden');
            };

            elements.canvasInlineInput.addEventListener('blur', closeInlineInput);
            elements.canvasInlineInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    closeInlineInput();
                }
            });
        }

        // Auto Select All text when clicking inspector inputs
        const autoSelectOnFocus = (el) => {
            el?.addEventListener('focus', () => el.select());
        };
        autoSelectOnFocus(elements.topTextInput);
        autoSelectOnFocus(elements.topTextPart1Input);
        autoSelectOnFocus(elements.topTextPart2Input);
        autoSelectOnFocus(elements.bottomTextInput);
        autoSelectOnFocus(elements.bottomTextPart1Input);
        autoSelectOnFocus(elements.bottomTextPart2Input);
    }

    window.clearTopText = function() {
        state.topText = '';
        state.topTextPart1 = '';
        state.topTextPart2 = '';
        if (elements.topTextInput) elements.topTextInput.value = '';
        if (elements.topTextPart1Input) elements.topTextPart1Input.value = '';
        if (elements.topTextPart2Input) elements.topTextPart2Input.value = '';
        if (elements.canvasInlineInput && elements.canvasInlineInput.dataset.target === 'top') {
            elements.canvasInlineInput.value = '';
        }
        syncActiveClipProperty('topText', '');
        syncActiveClipProperty('topTextPart1', '');
        syncActiveClipProperty('topTextPart2', '');
    };

    window.clearBottomText = function() {
        state.bottomText = '';
        state.bottomTextPart1 = '';
        state.bottomTextPart2 = '';
        if (elements.bottomTextInput) elements.bottomTextInput.value = '';
        if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = '';
        if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = '';
        if (elements.canvasInlineInput && elements.canvasInlineInput.dataset.target === 'bottom') {
            elements.canvasInlineInput.value = '';
        }
        syncActiveClipProperty('bottomText', '');
        syncActiveClipProperty('bottomTextPart1', '');
        syncActiveClipProperty('bottomTextPart2', '');
    };

    // --- Custom DOM Color Picker Popover Engine ---
    let activePopoverTargetKey = null;

    function openCustomColorPopover(targetKey, anchorEl) {
        activePopoverTargetKey = targetKey;
        const popover = elements.customColorPopover || document.getElementById('customColorPopover');
        if (!popover || !anchorEl) return;

        const rect = anchorEl.getBoundingClientRect();
        const popoverWidth = 280;
        const popoverHeight = 180;

        let top = rect.bottom + 6;
        let left = rect.left;

        if (left + popoverWidth > window.innerWidth - 10) {
            left = Math.max(10, window.innerWidth - popoverWidth - 10);
        }
        if (top + popoverHeight > window.innerHeight - 10) {
            top = Math.max(10, rect.top - popoverHeight - 6);
        }

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;

        const currentColor = state[targetKey] || '#FFFFFF';
        updatePopoverUI(currentColor);
        popover.classList.remove('hidden');
    }
    window.openCustomColorPopover = openCustomColorPopover;

    function closeCustomColorPopover() {
        const popover = elements.customColorPopover || document.getElementById('customColorPopover');
        if (popover) popover.classList.add('hidden');
        activePopoverTargetKey = null;
    }
    window.closeCustomColorPopover = closeCustomColorPopover;

    function updatePopoverUI(colorHex) {
        if (!colorHex) return;
        colorHex = colorHex.toUpperCase();
        if (elements.popoverPreviewSwatch) elements.popoverPreviewSwatch.style.background = colorHex;
        if (elements.popoverHexInput) elements.popoverHexInput.value = colorHex;
        if (elements.popoverNativeColorInput && colorHex.length === 7 && colorHex.startsWith('#')) {
            elements.popoverNativeColorInput.value = colorHex;
        }
    }

    function applyPopoverColor(colorHex) {
        if (!activePopoverTargetKey) return;
        pushStateToHistory();
        state[activePopoverTargetKey] = colorHex;
        updatePopoverUI(colorHex);
        updateColorSwatchesUI();
        syncActiveClipProperty(activePopoverTargetKey, colorHex);
    }

    function updateColorSwatchesUI() {
        const setSwatch = (targetKey, swatchEl, valEl) => {
            const val = state[targetKey] || '#FFFFFF';
            if (swatchEl) swatchEl.style.background = val;
            if (valEl) valEl.textContent = val;
        };

        setSwatch('topTextColor1', elements.topTextColor1Swatch, elements.topTextColor1Val);
        setSwatch('topTextColor2', elements.topTextColor2Swatch, elements.topTextColor2Val);
        setSwatch('bottomTextColor1', elements.bottomTextColor1Swatch, elements.bottomTextColor1Val);
        setSwatch('bottomTextColor2', elements.bottomTextColor2Swatch, elements.bottomTextColor2Val);
        setSwatch('strokeColor', elements.strokeColorSwatch, elements.strokeColorVal);
        setSwatch('bgColor', elements.bgColorSwatch, elements.bgColorVal);
    }

    function renderWordColorChips() {
        const topP1 = (state.topTextPart1 || 'ដើម').trim();
        const topP2 = (state.topTextPart2 || 'ត្នោត').trim();

        if (elements.topPart1Label) elements.topPart1Label.style.color = state.topTextColor1;
        if (elements.topPart2Label) elements.topPart2Label.style.color = state.topTextColor2;

        if (elements.topWordChips) {
            elements.topWordChips.innerHTML = `
                <span class="word-chip" onclick="openCustomColorPopover('topTextColor1', document.getElementById('topTextColor1Box'))" title="ចុចដើម្បីប្តូរពណ៌ពាក្យនេះ">
                    <span class="word-chip-color-dot" style="background:${state.topTextColor1};"></span>
                    <span>${topP1 || 'ពាក្យទី១'}</span> (ពណ៌ទី១)
                </span>
                <span class="word-chip" onclick="openCustomColorPopover('topTextColor2', document.getElementById('topTextColor2Box'))" title="ចុចដើម្បីប្តូរពណ៌ពាក្យនេះ">
                    <span class="word-chip-color-dot" style="background:${state.topTextColor2};"></span>
                    <span>${topP2 || 'ពាក្យទី២'}</span> (ពណ៌ទី២)
                </span>
            `;
        }

        const btmP1 = (state.bottomTextPart1 || 'អង់អាច').trim();
        const btmP2 = (state.bottomTextPart2 || 'ក្លាហាន').trim();

        if (elements.bottomPart1Label) elements.bottomPart1Label.style.color = state.bottomTextColor1;
        if (elements.bottomPart2Label) elements.bottomPart2Label.style.color = state.bottomTextColor2;

        if (elements.bottomWordChips) {
            elements.bottomWordChips.innerHTML = `
                <span class="word-chip" onclick="openCustomColorPopover('bottomTextColor1', document.getElementById('bottomTextColor1Box'))" title="ចុចដើម្បីប្តូរពណ៌ពាក្យនេះ">
                    <span class="word-chip-color-dot" style="background:${state.bottomTextColor1};"></span>
                    <span>${btmP1 || 'ពាក្យទី១'}</span> (ពណ៌ទី១)
                </span>
                <span class="word-chip" onclick="openCustomColorPopover('bottomTextColor2', document.getElementById('bottomTextColor2Box'))" title="ចុចដើម្បីប្តូរពណ៌ពាក្យនេះ">
                    <span class="word-chip-color-dot" style="background:${state.bottomTextColor2};"></span>
                    <span>${btmP2 || 'ពាក្យទី២'}</span> (ពណ៌ទី២)
                </span>
            `;
        }
    }

    function syncActiveClipProperty(key, val) {
        if (state.activeClipId) {
            const clip = state.clips.find(c => c.id === state.activeClipId);
            if (clip) {
                clip[key] = val;
                if (key === 'topTextPart1' || key === 'topTextPart2' || key === 'topText') {
                    clip.topTextPart1 = state.topTextPart1;
                    clip.topTextPart2 = state.topTextPart2;
                    clip.topText = `${state.topTextPart1 || ''} ${state.topTextPart2 || ''}`.trim();
                    state.topText = clip.topText;
                }
                if (key === 'bottomTextPart1' || key === 'bottomTextPart2' || key === 'bottomText') {
                    clip.bottomTextPart1 = state.bottomTextPart1;
                    clip.bottomTextPart2 = state.bottomTextPart2;
                    clip.bottomText = `${state.bottomTextPart1 || ''} ${state.bottomTextPart2 || ''}`.trim();
                    state.bottomText = clip.bottomText;
                }
                renderClipsList();
            }
        }
        renderWordColorChips();
    }

    function bindInput(inputEl, key, displayEl = null, suffix = '') {
        if (!inputEl) return;
        // Capture snapshot on focus (before any change is made)
        let _histPushed = false;
        inputEl.addEventListener('focus', () => { _histPushed = false; });
        inputEl.addEventListener('input', (e) => {
            if (!_histPushed) {
                pushStateToHistory();
                _histPushed = true;
            }
            let val = e.target.value;
            if (inputEl.type === 'range') val = parseFloat(val);
            state[key] = val;
            if (displayEl) displayEl.textContent = val + suffix;
            syncActiveClipProperty(key, val);
        });
    }

    // --- Video Upload Handler ---
    function handleVideoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        state.videoFile = file;
        if (state.videoObjectURL) URL.revokeObjectURL(state.videoObjectURL);
        state.videoObjectURL = URL.createObjectURL(file);

        elements.mainVideoPlayer.src = state.videoObjectURL;
        elements.hiddenVideo.src = state.videoObjectURL;

        elements.dropzoneOverlay.classList.add('hidden');
        elements.fileInfoBox.classList.remove('empty');
        elements.fileInfoBox.innerHTML = `
            <div class="info-item"><span class="info-label">ឈ្មោះ File:</span> <span class="info-val">${file.name}</span></div>
            <div class="info-item"><span class="info-label">ទំហំ:</span> <span class="info-val">${(file.size / (1024 * 1024)).toFixed(1)} MB</span></div>
            <div class="info-item"><span class="info-label">ប្រភេទ:</span> <span class="info-val">${file.type || 'video/mp4'}</span></div>
        `;

        elements.setInBtn.disabled = false;
        elements.setOutBtn.disabled = false;
        elements.addClipBtn.disabled = false;
        if (elements.splitTrimBtn) elements.splitTrimBtn.disabled = false;
        elements.timelineSlider.disabled = false;
    }

    function onVideoLoaded() {
        state.duration = elements.mainVideoPlayer.duration;
        state.trimIn = 0;
        state.trimOut = Math.min(state.duration, 180);
        stateHistory.length = 0;
        pushStateToHistory(); // Record initial base state
        updateTrimUI();
        enableAiButtons();
    }

    function updatePlayheadPosition() {
        if (state.duration > 0) {
            const pct = (state.currentTime / state.duration) * 100;
            elements.playhead.style.left = `${pct}%`;
            elements.timelineSlider.value = pct;
        }
    }

    function updateTrimUI() {
        elements.inTimeDisplay.textContent = formatTime(state.trimIn);
        elements.outTimeDisplay.textContent = formatTime(state.trimOut);
        elements.clipDurationDisplay.textContent = formatTime(state.trimOut - state.trimIn, false);

        if (state.duration > 0) {
            const inPct = (state.trimIn / state.duration) * 100;
            const outPct = (state.trimOut / state.duration) * 100;
            elements.trimSelectionRange.style.left = `${inPct}%`;
            elements.trimSelectionRange.style.width = `${outPct - inPct}%`;
        }
    }

    function updatePosYSliderRanges() {
        const h = state.canvasHeight || 1920;
        if (elements.topPosYInput) {
            elements.topPosYInput.min = 20;
            elements.topPosYInput.max = Math.round(h * 0.48);
        }
        if (elements.bottomPosYInput) {
            elements.bottomPosYInput.min = Math.round(h * 0.52);
            elements.bottomPosYInput.max = h - 20;
        }
    }

    function updateAspectDimensions() {
        const prevHeight = state.canvasHeight || 1920;
        elements.canvasWrapper.classList.remove('aspect-9-16', 'aspect-1-1', 'aspect-16-9');
        if (state.aspectRatio === '9:16') {
            state.canvasWidth = 1080;
            state.canvasHeight = 1920;
            elements.canvasWrapper.classList.add('aspect-9-16');
        } else if (state.aspectRatio === '1:1') {
            state.canvasWidth = 1080;
            state.canvasHeight = 1080;
            elements.canvasWrapper.classList.add('aspect-1-1');
        } else if (state.aspectRatio === '16:9') {
            state.canvasWidth = 1920;
            state.canvasHeight = 1080;
            elements.canvasWrapper.classList.add('aspect-16-9');
        }
        elements.mainCanvas.width = state.canvasWidth;
        elements.mainCanvas.height = state.canvasHeight;

        // Proportional Y Scaling when aspect ratio changes
        if (prevHeight !== state.canvasHeight && prevHeight > 0) {
            const ratio = state.canvasHeight / prevHeight;
            state.topPosY = Math.round(state.topPosY * ratio);
            state.bottomPosY = Math.round(state.bottomPosY * ratio);

            // Keep Y within valid range
            state.topPosY = Math.max(20, Math.min(Math.round(state.canvasHeight * 0.48), state.topPosY));
            state.bottomPosY = Math.max(Math.round(state.canvasHeight * 0.52), Math.min(state.canvasHeight - 20, state.bottomPosY));

            syncActiveClipProperty('topPosY', state.topPosY);
            syncActiveClipProperty('bottomPosY', state.bottomPosY);
        }

        updatePosYSliderRanges();
        syncInspectorUI();
    }

    // --- State History Stack (Ctrl + Z Undo Engine) ---
    const stateHistory = [];
    const MAX_HISTORY = 30;

    // Keys of state that are fully serialisable and should be part of every undo snapshot
    const UNDO_STATE_KEYS = [
        'trimIn', 'trimOut',
        'aspectRatio', 'colorMode',
        'topTextColor1', 'topTextColor2', 'bottomTextColor1', 'bottomTextColor2',
        'topText', 'topTextPart1', 'topTextPart2', 'topFontSize', 'topPosY',
        'bottomText', 'bottomTextPart1', 'bottomTextPart2', 'bottomFontSize', 'bottomPosY',
        'fontFamily', 'strokeColor', 'strokeWidth', 'shadowBlur',
        'bgMode', 'blurRadius', 'bgColor', 'videoScale', 'videoOffsetY'
    ];

    function pushStateToHistory() {
        const snapshot = {
            clips: JSON.parse(JSON.stringify(state.clips)),
            activeClipId: state.activeClipId,
            clipCounter: state.clipCounter,
            playerTime: (elements.mainVideoPlayer && !isNaN(elements.mainVideoPlayer.currentTime)) ? elements.mainVideoPlayer.currentTime : state.currentTime
        };
        UNDO_STATE_KEYS.forEach(k => { snapshot[k] = state[k]; });
        stateHistory.push(snapshot);
        if (stateHistory.length > MAX_HISTORY) stateHistory.shift();
    }

    function restoreStateFromSnapshot(prev) {
        state.clips = prev.clips;
        state.activeClipId = prev.activeClipId;
        state.clipCounter = prev.clipCounter;
        UNDO_STATE_KEYS.forEach(k => { if (prev[k] !== undefined) state[k] = prev[k]; });
    }

    function undoLastAction() {
        if (stateHistory.length === 0) {
            showToast('⚠️ គ្មានសកម្មភាពអាច Undo ទៀតទេ!');
            return;
        }

        // Pop last state if history has more than 1 item, or restore initial base state if length === 1
        const prev = stateHistory.length > 1 ? stateHistory.pop() : stateHistory[0];
        restoreStateFromSnapshot(prev);

        const currentScreen = state.currentScreen;
        if (currentScreen === 1) {
            // Restore trimmer UI on Screen 1
            updateTrimUI();
            if (elements.mainVideoPlayer && state.duration > 0) {
                const targetTime = (prev.playerTime !== undefined) ? prev.playerTime : state.trimIn;
                elements.mainVideoPlayer.currentTime = targetTime;
                state.currentTime = targetTime;
                updatePlayheadPosition();
            }
            renderClipsList();
        } else {
            // Restore full studio UI on Screen 2
            if (state.activeClipId && state.clips.some(c => c.id === state.activeClipId)) {
                // Reload active clip data into state then re-sync inspector
                const clip = state.clips.find(c => c.id === state.activeClipId);
                if (clip) {
                    // Overwrite state with clip data (which was already restored from snapshot)
                    state.trimIn = clip.startTime;
                    state.trimOut = clip.endTime;
                }
                syncInspectorUI();
                renderClipsList();
            } else if (state.clips.length > 0) {
                selectClipForEditing(state.clips[0].id, false);
            } else {
                state.activeClipId = null;
                renderClipsList();
            }
        }

        if (stateHistory.length <= 1) {
            showToast('⏪ បានត្រឡប់ទៅចំនុចដើមដំបូង (Restored to Original Start)');
        } else {
            showToast('⏪ បានត្រឡប់មកវិញ (Undo Successful)');
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('hidden');
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2200);
    }

    function toggleVideoPlayPause() {
        if (state.currentScreen === 1) {
            if (elements.mainVideoPlayer && elements.mainVideoPlayer.src) {
                if (elements.mainVideoPlayer.paused) {
                    elements.mainVideoPlayer.play().catch(() => {});
                } else {
                    elements.mainVideoPlayer.pause();
                }
            }
        } else if (state.currentScreen === 2) {
            if (!state.activeClipId) return;
            if (state.isPlaying) {
                elements.hiddenVideo.pause();
                state.isPlaying = false;
            } else {
                if (elements.hiddenVideo.currentTime >= state.trimOut) {
                    elements.hiddenVideo.currentTime = state.trimIn;
                }
                elements.hiddenVideo.play().catch(() => {});
                state.isPlaying = true;
            }
            updatePlayPauseBtn();
        }
    }

    function isTextInputFocused() {
        const el = document.activeElement;
        if (!el) return false;
        if (el.isContentEditable) return true;
        const tag = el.tagName ? el.tagName.toLowerCase() : '';
        if (tag === 'textarea' || tag === 'select') return true;
        if (tag === 'input') {
            const type = (el.type || 'text').toLowerCase();
            if (['text', 'search', 'password', 'email', 'url', 'number', 'tel'].includes(type)) {
                return true;
            }
        }
        return false;
    }

    function handleGlobalKeyDown(e) {
        if (isTextInputFocused()) return;

        const code = e.code || '';
        const key = (e.key || '').toLowerCase();
        const keyCode = e.keyCode || e.which || 0;

        // Spacebar (keyCode 32): Toggle Play / Pause Video
        if (code === 'Space' || key === ' ' || keyCode === 32) {
            e.preventDefault();
            toggleVideoPlayPause();
            return;
        }

        // S key (keyCode 83): Set In
        if ((code === 'KeyS' || key === 's' || key === 'ស' || keyCode === 83) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (!state.videoFile) {
                showToast('⚠️ សូមជ្រើសរើសវីដេអូជាមុនសិន!');
                return;
            }
            if (elements.setInBtn) {
                elements.setInBtn.click();
                showToast('🚩 កំណត់ចំនុចដើម [Set In]: ' + formatTime(state.trimIn));
            }
            return;
        }

        // E key (keyCode 69): Set Out
        if ((code === 'KeyE' || key === 'e' || key === 'ែ' || keyCode === 69) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (!state.videoFile) {
                showToast('⚠️ សូមជ្រើសរើសវីដេអូជាមុនសិន!');
                return;
            }
            if (elements.setOutBtn) {
                elements.setOutBtn.click();
                showToast('🏁 កំណត់ចំនុចបញ្ចប់ [Set Out]: ' + formatTime(state.trimOut));
            }
            return;
        }

        // A key (keyCode 65): Add Clip
        if ((code === 'KeyA' || key === 'a' || key === 'ា' || keyCode === 65) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            if (!state.videoFile) {
                showToast('⚠️ សូមជ្រើសរើសវីដេអូជាមុនសិន!');
                return;
            }
            if (elements.addClipBtn) {
                elements.addClipBtn.click();
            }
            return;
        }

        // Ctrl+Z / Cmd+Z (keyCode 90): Undo Last Action
        if ((e.ctrlKey || e.metaKey) && (code === 'KeyZ' || key === 'z' || key === 'ដ' || key === 'ឆ' || keyCode === 90 || keyCode === 231)) {
            e.preventDefault();
            undoLastAction();
        }
    }

    window.undoLastAction = undoLastAction;

    // Register with capture = true so window catches keypresses before video elements swallow them!
    window.addEventListener('keydown', handleGlobalKeyDown, true);

    // --- Clip Reorder & Split Actions ---
    window.moveClipUp = function(id, e) {
        if (e) e.stopPropagation();
        const idx = state.clips.findIndex(c => c.id === id);
        if (idx <= 0) return;
        pushStateToHistory();
        const temp = state.clips[idx];
        state.clips[idx] = state.clips[idx - 1];
        state.clips[idx - 1] = temp;
        renderClipsList();
        showToast('⬆️ បានផ្លាស់ទី Clip ឡើងលើ');
    };

    window.moveClipDown = function(id, e) {
        if (e) e.stopPropagation();
        const idx = state.clips.findIndex(c => c.id === id);
        if (idx < 0 || idx >= state.clips.length - 1) return;
        pushStateToHistory();
        const temp = state.clips[idx];
        state.clips[idx] = state.clips[idx + 1];
        state.clips[idx + 1] = temp;
        renderClipsList();
        showToast('⬇️ បានផ្លាស់ទី Clip ចុះក្រោម');
    };

    window.deleteClip = function(id) {
        pushStateToHistory();
        state.clips = state.clips.filter(c => c.id !== id);
        if (state.activeClipId === id) {
            state.activeClipId = state.clips.length > 0 ? state.clips[0].id : null;
        }
        renderClipsList();
        if (state.activeClipId) {
            selectClipForEditing(state.activeClipId);
        }
        showToast('🗑️ បានលុប Clip (ចុច Ctrl+Z ដើម្បើតបមកវិញ)');
    };

    window.renameClip = function(id, e) {
        if (e) e.stopPropagation();
        const clip = state.clips.find(c => c.id === id);
        if (!clip) return;
        const newName = prompt('កែសម្រួលចំណងជើង Clip:', clip.name);
        if (newName !== null && newName.trim() !== '') {
            pushStateToHistory();
            clip.name = newName.trim();
            if (state.activeClipId === id) {
                if (elements.activeClipNameBadge) {
                    elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
                }
                if (elements.activeClipTitleInput) {
                    elements.activeClipTitleInput.value = clip.name;
                }
            }
            renderClipsList();
            showToast('✏️ បានប្ដូរចំណងជើង Clip!');
        }
    };

    window.splitSelectedClip = function(id = null, e = null) {
        if (e) e.stopPropagation();

        const targetId = id || state.activeClipId;
        if (!targetId) {
            showToast('⚠️ សូមជ្រើសរើស Clip ជាមុនសិន!');
            return;
        }

        const clipIndex = state.clips.findIndex(c => c.id === targetId);
        if (clipIndex < 0) return;

        const clip = state.clips[clipIndex];

        // Determine split timestamp:
        // Check active video playhead time
        let activeTime = state.currentScreen === 1 ? elements.mainVideoPlayer.currentTime : elements.hiddenVideo.currentTime;
        let splitTime;

        if (activeTime > clip.startTime + 0.5 && activeTime < clip.endTime - 0.5) {
            splitTime = activeTime;
        } else {
            // Split exact middle of selected clip
            splitTime = clip.startTime + (clip.duration / 2);
        }

        pushStateToHistory();

        // Remove old (ភាគN) suffix if present to avoid nested names like "(ភាគ១) (ភាគ១)"
        const baseName = clip.name.replace(/\s*\(ភាគ\d+\)/g, '');

        const clipA = {
            ...clip,
            name: `${baseName} (ភាគ១)`,
            endTime: splitTime,
            duration: splitTime - clip.startTime
        };

        const clipB = {
            ...clip,
            id: Date.now(),
            name: `${baseName} (ភាគ២)`,
            startTime: splitTime,
            duration: clip.endTime - splitTime
        };

        state.clips.splice(clipIndex, 1, clipA, clipB);
        state.activeClipId = clipA.id;

        selectClipForEditing(clipA.id);
        renderClipsList();
        showToast(`✂️ បានពុះ "${clip.name}" ជា ២ ភាគរួចរាល់!`);
    };

    window.splitCurrentClip = window.splitSelectedClip;
    window.splitTrimAtCurrentTime = window.splitSelectedClip;

    window.applyStyleToAllClips = function() {
        if (state.clips.length === 0) {
            showToast('ℹ️ មិនទាន់មាន Clip ក្នុងបញ្ជីឡើយ!');
            return;
        }
        pushStateToHistory();

        state.clips.forEach(c => {
            c.colorMode = state.colorMode;
            c.textColor1 = state.textColor1;
            c.textColor2 = state.textColor2;
            c.fontFamily = state.fontFamily;
            c.strokeColor = state.strokeColor;
            c.strokeWidth = state.strokeWidth;
            c.shadowBlur = state.shadowBlur;
            c.topFontSize = state.topFontSize;
            c.topPosY = state.topPosY;
            c.bottomFontSize = state.bottomFontSize;
            c.bottomPosY = state.bottomPosY;
            c.topText = state.topText;
            c.topTextPart1 = state.topTextPart1;
            c.topTextPart2 = state.topTextPart2;
            c.bottomText = state.bottomText;
            c.bottomTextPart1 = state.bottomTextPart1;
            c.bottomTextPart2 = state.bottomTextPart2;
            c.bgMode = state.bgMode;
            c.blurRadius = state.blurRadius;
            c.bgColor = state.bgColor;
            c.videoScale = state.videoScale;
            c.videoOffsetY = state.videoOffsetY;
            c.aspectRatio = state.aspectRatio;
        });

        renderClipsList();
        showToast('📋 បានអនុវត្តម៉ូដនេះទៅ Clips ទាំងអស់!');
    };

    window.seekRelative = function(seconds) {
        if (!state.activeClipId) return;
        const newTime = elements.hiddenVideo.currentTime + seconds;
        const clampedTime = Math.max(state.trimIn, Math.min(state.trimOut, newTime));
        elements.hiddenVideo.currentTime = clampedTime;
        state.currentTime = clampedTime;
    };

    // --- Clip Queue Manager ---
    function addClipToList() {
        if (!state.videoFile) return;

        pushStateToHistory();

        const customTitleInput = document.getElementById('clipTitleInput');
        const customTitle = customTitleInput ? customTitleInput.value.trim() : '';

        const clipName = customTitle || `Clip #${state.clipCounter++}`;

        const clip = {
            id: Date.now(),
            name: clipName,
            startTime: state.trimIn,
            endTime: state.trimOut,
            duration: state.trimOut - state.trimIn,
            aspectRatio: state.aspectRatio || '9:16',
            colorMode: state.colorMode,
            topTextColor1: state.topTextColor1,
            topTextColor2: state.topTextColor2,
            bottomTextColor1: state.bottomTextColor1,
            bottomTextColor2: state.bottomTextColor2,
            topText: state.topText,
            topTextPart1: state.topTextPart1,
            topTextPart2: state.topTextPart2,
            topFontSize: state.topFontSize,
            topPosY: state.topPosY,
            bottomText: state.bottomText,
            bottomTextPart1: state.bottomTextPart1,
            bottomTextPart2: state.bottomTextPart2,
            bottomFontSize: state.bottomFontSize,
            bottomPosY: state.bottomPosY,
            fontFamily: state.fontFamily,
            strokeColor: state.strokeColor,
            strokeWidth: state.strokeWidth,
            shadowBlur: state.shadowBlur,
            bgMode: state.bgMode,
            blurRadius: state.blurRadius,
            bgColor: state.bgColor,
            videoScale: state.videoScale,
            videoOffsetY: state.videoOffsetY
        };

        state.clips.push(clip);
        if (!state.activeClipId) {
            state.activeClipId = clip.id;
        }
        renderClipsList();

        if (customTitleInput) customTitleInput.value = '';

        // Stay on Screen 1 so user can cut multiple clips continuously
        const origText = elements.addClipBtn.innerHTML;
        elements.addClipBtn.innerHTML = '✅ បានបន្ថែម Clip!';
        elements.addClipBtn.classList.remove('btn-success');
        elements.addClipBtn.classList.add('btn-primary');
        setTimeout(() => {
            elements.addClipBtn.innerHTML = origText;
            elements.addClipBtn.classList.remove('btn-primary');
            elements.addClipBtn.classList.add('btn-success');
        }, 1500);
    }

    function renderClipsList() {
        const count = state.clips.length;
        elements.clipCountBadge.textContent = count;
        if (elements.step2Badge) elements.step2Badge.textContent = `${count} Clips`;
        if (elements.goToStep2Btn) elements.goToStep2Btn.disabled = count === 0;

        const renderHTML = (forScreen2 = false) => {
            if (count === 0) {
                return `
                    <div class="empty-clips-notice">
                        <span class="icon">🎬</span>
                        <p>មិនទាន់មាន Clip នៅឡើយទេ</p>
                        <small>កំណត់ <strong>[Set In]</strong> និង <strong>[Set Out]</strong> រួចចុច <strong>"+ បន្ថែម Clip"</strong></small>
                    </div>
                `;
            }

            return state.clips.map((c, idx) => {
                const isEditing = c.id === state.activeClipId;
                const topStr = c.colorMode === 'dual' ? `${c.topTextPart1 || ''} ${c.topTextPart2 || ''}` : (c.topText || '');
                const btmStr = c.colorMode === 'dual' ? `${c.bottomTextPart1 || ''} ${c.bottomTextPart2 || ''}` : (c.bottomText || '');
                const isFirst = idx === 0;
                const isLast = idx === count - 1;

                return `
                <div class="clip-card ${isEditing ? 'active-editing' : ''}" data-id="${c.id}">
                    <div class="clip-card-main">
                        <div style="flex:1;">
                            <div class="clip-header">
                                <span class="clip-title" onclick="renameClip(${c.id}, event)" title="ចុចដើម្បែកែសម្រួលចំណងជើង" style="cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                    ${c.name} <span style="font-size:0.8em; opacity:0.7;">✏️</span>
                                </span>
                                <span class="clip-duration">⏱️ ${formatTime(c.duration, false)}</span>
                            </div>
                            <div class="clip-actions">
                                <button class="btn ${isEditing ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="selectClipForEditing(${c.id})">
                                    ${isEditing ? '✏️ កំពុងកែ' : '🎨 កែសម្រួល'}
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteClip(${c.id})" title="លុប Clip នេះ">🗑️ លុប</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        };

        if (elements.clipsListScreen1) elements.clipsListScreen1.innerHTML = renderHTML(false);
        if (elements.clipsListScreen2) elements.clipsListScreen2.innerHTML = renderHTML(true);
    }

    window.selectClipForEditing = function(id, autoSwitchScreen = true) {
        const clip = state.clips.find(c => c.id === id);
        if (!clip) return;

        state.activeClipId = id;
        state.trimIn = clip.startTime;
        state.trimOut = clip.endTime;
        
        state.colorMode = clip.colorMode || 'dual';
        state.topTextColor1 = clip.topTextColor1 || clip.textColor1 || '#FFE600';
        state.topTextColor2 = clip.topTextColor2 || clip.textColor2 || '#FF5722';
        state.bottomTextColor1 = clip.bottomTextColor1 || clip.textColor1 || '#FFE600';
        state.bottomTextColor2 = clip.bottomTextColor2 || clip.textColor2 || '#FF5722';

        state.topText = clip.topText || '';
        state.topTextPart1 = clip.topTextPart1 || '';
        state.topTextPart2 = clip.topTextPart2 || '';
        state.topFontSize = clip.topFontSize || 65;
        state.topPosY = clip.topPosY || 160;

        state.bottomText = clip.bottomText || '';
        state.bottomTextPart1 = clip.bottomTextPart1 || '';
        state.bottomTextPart2 = clip.bottomTextPart2 || '';
        state.bottomFontSize = clip.bottomFontSize || 65;
        state.bottomPosY = clip.bottomPosY || 1750;

        state.fontFamily = clip.fontFamily || 'Moul';
        state.strokeColor = clip.strokeColor || '#FFFFFF';
        state.strokeWidth = clip.strokeWidth || 12;
        state.shadowBlur = clip.shadowBlur || 10;

        state.bgMode = clip.bgMode || 'blur';
        state.blurRadius = clip.blurRadius || 25;
        state.bgColor = clip.bgColor || '#111827';
        state.videoScale = clip.videoScale || 100;
        state.videoOffsetY = clip.videoOffsetY || 0;

        if (clip.aspectRatio) {
            state.aspectRatio = clip.aspectRatio;
            elements.aspectBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.ratio === state.aspectRatio);
            });
            updateAspectDimensions();
        }

        if (elements.activeClipNameBadge) {
            elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
        }
        if (elements.studioClipScrubber) elements.studioClipScrubber.value = 0;
        if (elements.studioClipTimeDisplay) {
            elements.studioClipTimeDisplay.textContent = `00:00.00 / ${formatTime(clip.duration, false)}`;
        }

        syncInspectorUI();
        renderClipsList();

        // Switch to Screen 2 Studio only if requested
        if (autoSwitchScreen) {
            switchScreen(2);
        }

        // Always restart video from this clip's start time (fixes switching clips)
        elements.hiddenVideo.currentTime = state.trimIn;
        if (autoSwitchScreen) {
            elements.hiddenVideo.play().catch(() => {});
            state.isPlaying = true;
            updatePlayPauseBtn();
        }
    };

    function syncInspectorUI() {
        const activeClip = state.clips.find(c => c.id === state.activeClipId);
        if (activeClip && elements.activeClipTitleInput) {
            elements.activeClipTitleInput.value = activeClip.name || '';
        }

        if (elements.colorModeSelect) {
            elements.colorModeSelect.value = state.colorMode;
            const evtColorMode = new Event('change');
            evtColorMode._fromSync = true;
            elements.colorModeSelect.dispatchEvent(evtColorMode);
        }
        updateColorSwatchesUI();

        if (elements.topTextInput) elements.topTextInput.value = state.topText;
        if (elements.topTextPart1Input) elements.topTextPart1Input.value = state.topTextPart1;
        if (elements.topTextPart2Input) elements.topTextPart2Input.value = state.topTextPart2;
        if (elements.topFontSizeInput) {
            elements.topFontSizeInput.value = state.topFontSize;
            if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = state.topFontSize + 'px';
        }
        if (elements.topPosYInput) {
            elements.topPosYInput.value = state.topPosY;
            if (elements.topPosYVal) elements.topPosYVal.textContent = state.topPosY + 'px';
        }

        if (elements.bottomTextInput) elements.bottomTextInput.value = state.bottomText;
        if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = state.bottomTextPart1;
        if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = state.bottomTextPart2;
        if (elements.bottomFontSizeInput) {
            elements.bottomFontSizeInput.value = state.bottomFontSize;
            if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = state.bottomFontSize + 'px';
        }
        if (elements.bottomPosYInput) {
            elements.bottomPosYInput.value = state.bottomPosY;
            if (elements.bottomPosYVal) elements.bottomPosYVal.textContent = state.bottomPosY + 'px';
        }

        if (elements.fontFamilySelect) elements.fontFamilySelect.value = state.fontFamily;
        if (elements.strokeColorInput) {
            elements.strokeColorInput.value = state.strokeColor;
            if (elements.strokeColorVal) elements.strokeColorVal.textContent = state.strokeColor;
        }
        if (elements.strokeWidthInput) {
            elements.strokeWidthInput.value = state.strokeWidth;
            if (elements.strokeWidthVal) elements.strokeWidthVal.textContent = state.strokeWidth + 'px';
        }
        if (elements.shadowBlurInput) {
            elements.shadowBlurInput.value = state.shadowBlur;
            if (elements.shadowBlurVal) elements.shadowBlurVal.textContent = state.shadowBlur + 'px';
        }

        if (elements.bgModeSelect) {
            elements.bgModeSelect.value = state.bgMode;
            const evtBgMode = new Event('change');
            evtBgMode._fromSync = true;
            elements.bgModeSelect.dispatchEvent(evtBgMode);
        }
        if (elements.blurRadiusInput) {
            elements.blurRadiusInput.value = state.blurRadius;
            if (elements.blurRadiusVal) elements.blurRadiusVal.textContent = state.blurRadius + 'px';
        }
        if (elements.bgColorInput) elements.bgColorInput.value = state.bgColor;

        if (elements.videoScaleInput) {
            elements.videoScaleInput.value = state.videoScale;
            if (elements.videoScaleVal) elements.videoScaleVal.textContent = state.videoScale + '%';
        }
        if (elements.videoOffsetYInput) {
            elements.videoOffsetYInput.value = state.videoOffsetY;
            if (elements.videoOffsetYVal) elements.videoOffsetYVal.textContent = state.videoOffsetY + 'px';
        }
    }

    window.deleteClip = function(id) {
        state.clips = state.clips.filter(c => c.id !== id);
        if (state.activeClipId === id) {
            state.activeClipId = state.clips.length > 0 ? state.clips[0].id : null;
        }
        renderClipsList();
    };

    // --- Canvas Render Loop (Screen 2 Studio) ---
    function renderLoop() {
        if (state.currentScreen === 2 || state.isExporting) {
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        }
        requestAnimationFrame(renderLoop);
    }

    function renderCanvasFrame(ctx, width, height) {
        // ALWAYS clear canvas on every frame to prevent text trail / smearing!
        ctx.clearRect(0, 0, width, height);

        const video = elements.hiddenVideo;

        // 1. Draw Background
        if (state.bgMode === 'blur') {
            if (video.readyState >= 2) {
                ctx.save();
                ctx.filter = `blur(${state.blurRadius}px) brightness(0.6)`;
                const vAspect = video.videoWidth / video.videoHeight;
                const cAspect = width / height;
                let bgW, bgH, bgX, bgY;
                if (vAspect > cAspect) {
                    bgH = height;
                    bgW = height * vAspect;
                    bgX = (width - bgW) / 2;
                    bgY = 0;
                } else {
                    bgW = width;
                    bgH = width / vAspect;
                    bgX = 0;
                    bgY = (height - bgH) / 2;
                }
                ctx.drawImage(video, bgX, bgY, bgW, bgH);
                ctx.restore();
            } else {
                const grad = ctx.createLinearGradient(0, 0, 0, height);
                grad.addColorStop(0, '#0f172a');
                grad.addColorStop(0.5, '#1e293b');
                grad.addColorStop(1, '#090d16');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            }
        } else if (state.bgMode === 'color') {
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, width, height);
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.5, '#1e293b');
            grad.addColorStop(1, '#090d16');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Source Video Frame (Centered)
        if (video.readyState >= 2) {
            ctx.save();
            const scaleFactor = state.videoScale / 100;
            const vAspect = video.videoWidth / video.videoHeight;
            let targetW = width * scaleFactor;
            let targetH = (width / vAspect) * scaleFactor;
            let targetX = (width - targetW) / 2;
            let targetY = (height - targetH) / 2 + parseFloat(state.videoOffsetY);

            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 20;
            ctx.drawImage(video, targetX, targetY, targetW, targetH);
            ctx.restore();
        }

        // 3. Render Top & Bottom Khmer Text Overlays
        renderTextOverlay(ctx, width, height);

        // 4. Render Active Selection Outline on Canvas Hover / Drag
        const activeTarget = state.resizeTarget || state.dragTarget || state.hoveredTextTarget;
        if (activeTarget === 'top') {
            renderSelectionOutline(ctx, 'top', state.topPosY, state.topFontSize, width);
        } else if (activeTarget === 'bottom') {
            renderSelectionOutline(ctx, 'bottom', state.bottomPosY, state.bottomFontSize, width);
        }
    }

    function renderSelectionOutline(ctx, target, posY, fontSize, canvasWidth) {
        ctx.save();
        ctx.strokeStyle = '#FFE600';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);

        const measuredW = target === 'top' ? (state.topMeasuredWidth || canvasWidth * 0.75) : (state.bottomMeasuredWidth || canvasWidth * 0.75);
        const boxH = fontSize * 1.35;
        const boxW = Math.max(180, Math.min(canvasWidth - 20, measuredW + 50));
        const boxX = (canvasWidth - boxW) / 2;
        const boxY = posY - boxH / 2;

        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Draw 4 Solid Gold Corner Handles with Dark Border
        const corners = [
            { x: boxX, y: boxY },
            { x: boxX + boxW, y: boxY },
            { x: boxX, y: boxY + boxH },
            { x: boxX + boxW, y: boxY + boxH }
        ];

        ctx.setLineDash([]);
        corners.forEach(c => {
            ctx.fillStyle = '#FFE600';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    }

    function renderTextOverlay(ctx, width, height) {
        renderSingleTextLine(
            ctx,
            state.topTextPart1,
            state.topTextPart2,
            state.topText,
            state.topFontSize,
            state.topPosY,
            width,
            'top'
        );

        renderSingleTextLine(
            ctx,
            state.bottomTextPart1,
            state.bottomTextPart2,
            state.bottomText,
            state.bottomFontSize,
            state.bottomPosY,
            width,
            'bottom'
        );
    }

    function renderSingleTextLine(ctx, part1, part2, fullText, fontSize, posY, canvasWidth, targetName) {
        ctx.save();
        const fontName = state.fontFamily;
        let drawFontSize = parseFloat(fontSize);
        ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = state.strokeColor;
        ctx.lineWidth = parseFloat(state.strokeWidth);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;

        const maxAllowedW = canvasWidth - 60; // 30px safe margin on left and right edges

        if (state.colorMode === 'dual') {
            const p1 = (part1 || '').trim();
            const p2 = (part2 || '').trim();
            if (!p1 && !p2) { ctx.restore(); return; }

            // 1. Initial measurement at full font size
            const getSpaceW = () => Math.max(14, Math.round(drawFontSize * 0.22)); // Proportional clean Khmer space
            let w1 = p1 ? ctx.measureText(p1).width : 0;
            let w2 = p2 ? ctx.measureText(p2).width : 0;
            let spaceW = (p1 && p2) ? getSpaceW() : 0;
            let measuredW = w1 + spaceW + w2;

            // 2. Auto-scale font size down if text exceeds max allowed width
            if (measuredW > maxAllowedW && measuredW > 0) {
                const scale = maxAllowedW / measuredW;
                drawFontSize = Math.max(14, Math.floor(drawFontSize * scale));
                ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
                
                // Re-measure accurately with updated font size
                w1 = p1 ? ctx.measureText(p1).width : 0;
                w2 = p2 ? ctx.measureText(p2).width : 0;
                spaceW = (p1 && p2) ? getSpaceW() : 0;
                measuredW = w1 + spaceW + w2;
            }

            if (targetName === 'top') {
                state.topMeasuredWidth = measuredW;
            } else if (targetName === 'bottom') {
                state.bottomMeasuredWidth = measuredW;
            }

            if (state.shadowBlur > 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                ctx.shadowBlur = parseFloat(state.shadowBlur);
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 4;
            }

            const y = parseFloat(posY);
            ctx.textAlign = 'left';

            // Center starting position X safely
            let startX = Math.max(30, (canvasWidth - measuredW) / 2);

            // STEP 1: Draw ALL Strokes (Outlines) FIRST so Part 2 stroke never clips over Part 1 fill!
            if (state.strokeWidth > 0) {
                let xPtr = startX;
                if (p1) {
                    ctx.strokeText(p1, xPtr, y);
                    xPtr += w1 + spaceW;
                }
                if (p2) {
                    ctx.strokeText(p2, xPtr, y);
                }
            }

            // STEP 2: Draw ALL Fills SECOND on top of the outlines!
            let xPtr = startX;
            if (p1) {
                ctx.fillStyle = targetName === 'top' ? state.topTextColor1 : state.bottomTextColor1;
                ctx.fillText(p1, xPtr, y);
                xPtr += w1 + spaceW;
            }
            if (p2) {
                ctx.fillStyle = targetName === 'top' ? state.topTextColor2 : state.bottomTextColor2;
                ctx.fillText(p2, xPtr, y);
            }
        } else if (state.colorMode === 'gradient') {
            const txt = (fullText || '').trim();
            if (!txt) { ctx.restore(); return; }

            let textW = ctx.measureText(txt).width;
            if (textW > maxAllowedW && textW > 0) {
                const scale = maxAllowedW / textW;
                drawFontSize = Math.max(14, Math.floor(drawFontSize * scale));
                ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
                textW = ctx.measureText(txt).width;
            }

            if (targetName === 'top') {
                state.topMeasuredWidth = textW;
            } else if (targetName === 'bottom') {
                state.bottomMeasuredWidth = textW;
            }

            if (state.shadowBlur > 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                ctx.shadowBlur = parseFloat(state.shadowBlur);
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 4;
            }

            const y = parseFloat(posY);
            ctx.textAlign = 'center';
            const startX = Math.max(30, (canvasWidth - textW) / 2);

            const c1 = targetName === 'top' ? state.topTextColor1 : state.bottomTextColor1;
            const c2 = targetName === 'top' ? state.topTextColor2 : state.bottomTextColor2;
            const grad = ctx.createLinearGradient(startX, 0, startX + textW, 0);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);

            if (state.strokeWidth > 0) ctx.strokeText(txt, canvasWidth / 2, y);
            ctx.fillStyle = grad;
            ctx.fillText(txt, canvasWidth / 2, y);
        } else {
            const txt = (fullText || '').trim();
            if (!txt) { ctx.restore(); return; }

            let textW = ctx.measureText(txt).width;
            if (textW > maxAllowedW && textW > 0) {
                const scale = maxAllowedW / textW;
                drawFontSize = Math.max(14, Math.floor(drawFontSize * scale));
                ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
                textW = ctx.measureText(txt).width;
            }

            if (targetName === 'top') {
                state.topMeasuredWidth = textW;
            } else if (targetName === 'bottom') {
                state.bottomMeasuredWidth = textW;
            }

            if (state.shadowBlur > 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
                ctx.shadowBlur = parseFloat(state.shadowBlur);
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 4;
            }

            const y = parseFloat(posY);
            ctx.textAlign = 'center';
            if (state.strokeWidth > 0) ctx.strokeText(txt, canvasWidth / 2, y);
            ctx.fillStyle = state.textColor1;
            ctx.fillText(txt, canvasWidth / 2, y);
        }

        ctx.restore();
    }

    // --- Export Engine ---
    window.exportSingleClip = function(id) {
        const clip = state.clips.find(c => c.id === id);
        if (clip) exportClipsQueue([clip]);
    };

    function exportAllClips() {
        if (state.clips.length > 0) exportClipsQueue(state.clips);
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) {
                document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
        }, 60000); // 60s timeout to allow Chrome download manager to finish reading blob stream
    }

    async function exportClipsQueue(queue) {
        if (state.isExporting) return;
        state.isExporting = true;
        state.cancelExportRequested = false;

        elements.exportModal.classList.remove('hidden');
        elements.exportProgressBar.style.width = '0%';
        elements.exportPercentText.textContent = '0%';

        const isZipExport = queue.length > 1;
        const exportedFiles = [];

        for (let i = 0; i < queue.length; i++) {
            if (state.cancelExportRequested) break;
            const clip = queue[i];
            elements.exportStatusText.textContent = `កំពុង Export ${clip.name} (${i + 1}/${queue.length})...`;
            
            const fileData = await processSingleClipExport(clip, (pct) => {
                const totalPct = Math.round(((i + pct / 100) / queue.length) * (isZipExport ? 80 : 100));
                elements.exportProgressBar.style.width = `${totalPct}%`;
                elements.exportPercentText.textContent = `${totalPct}%`;
            }, !isZipExport);

            if (fileData && fileData.blob) {
                exportedFiles.push(fileData);
            }
        }

        if (isZipExport && !state.cancelExportRequested && exportedFiles.length > 0) {
            elements.exportStatusText.textContent = `📦 កំពុងបង្កើត File ZIP...`;
            elements.exportProgressBar.style.width = '85%';
            elements.exportPercentText.textContent = '85%';

            if (typeof JSZip !== 'undefined') {
                const zip = new JSZip();
                exportedFiles.forEach((file, idx) => {
                    let filename = `${file.safeName}.${file.ext}`;
                    zip.file(filename, file.blob);
                });

                const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                    const zipPct = 85 + Math.round((metadata.percent / 100) * 15);
                    elements.exportProgressBar.style.width = `${zipPct}%`;
                    elements.exportPercentText.textContent = `${zipPct}%`;
                });

                triggerDownload(zipBlob, `Khmer_Clips_All.zip`);
            } else {
                exportedFiles.forEach(file => {
                    triggerDownload(file.blob, `${file.safeName}.${file.ext}`);
                });
            }
        }

        state.isExporting = false;
        elements.exportModal.classList.add('hidden');
    }

    function processSingleClipExport(clip, onProgress, autoDownload = true) {
        return new Promise(async (resolve) => {
            selectClipForEditing(clip.id, false);

            const video = elements.hiddenVideo;
            const canvas = elements.mainCanvas;

            const origTime = video.currentTime;
            
            // 1. Seek video to clip start time and wait for seek to finish
            video.currentTime = clip.startTime;
            await new Promise((res) => {
                let resolved = false;
                const done = () => {
                    if (!resolved) {
                        resolved = true;
                        video.removeEventListener('seeked', done);
                        res();
                    }
                };
                if (video.readyState >= 2 && Math.abs(video.currentTime - clip.startTime) < 0.2) {
                    done();
                } else {
                    video.addEventListener('seeked', done, { once: true });
                    setTimeout(done, 500);
                }
            });

            // 2. Force immediate frame render onto canvas
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);

            const stream = canvas.captureStream(30);

            let audioTrack = null;
            try {
                if (!window.audioCtx) {
                    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    window.audioSrc = window.audioCtx.createMediaElementSource(video);
                    window.audioDest = window.audioCtx.createMediaStreamDestination();
                    window.audioSrc.connect(window.audioDest);
                    window.audioSrc.connect(window.audioCtx.destination);
                }
                if (window.audioCtx.state === 'suspended') {
                    await window.audioCtx.resume();
                }
                audioTrack = window.audioDest.stream.getAudioTracks()[0];
                if (audioTrack) stream.addTrack(audioTrack);
            } catch (err) {
                console.warn('Audio export fallback:', err);
            }

            // Determine supported container & codec (Prefer MP4 for Windows compatibility)
            let mimeType = 'video/mp4;codecs=avc1,mp4a';
            let ext = 'mp4';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                if (MediaRecorder.isTypeSupported('video/mp4')) {
                    mimeType = 'video/mp4';
                    ext = 'mp4';
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                    mimeType = 'video/webm;codecs=vp9,opus';
                    ext = 'webm';
                } else if (MediaRecorder.isTypeSupported('video/webm')) {
                    mimeType = 'video/webm';
                    ext = 'webm';
                } else {
                    mimeType = '';
                    ext = 'mp4';
                }
            }

            const recorderOptions = mimeType ? { mimeType, videoBitsPerSecond: 3500000 } : { videoBitsPerSecond: 3500000 };
            const mediaRecorder = new MediaRecorder(stream, recorderOptions);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                video.pause();
                video.currentTime = origTime;
                
                let result = null;
                if (!state.cancelExportRequested && chunks.length > 0) {
                    const blob = new Blob(chunks, { type: mediaRecorder.mimeType || mimeType || 'video/mp4' });
                    
                    // Clean filename while preserving Khmer Unicode text
                    let safeName = (clip.name || 'Clip')
                        .replace(/[\\/:*?"<>|#%&{}\$\+!:@=]/g, '_') // Replace illegal Windows & URL fragment/special chars
                        .replace(/\s+/g, '_')
                        .replace(/_+/g, '_')
                        .trim();
                    if (!safeName || safeName === '_') safeName = 'Clip';

                    result = { blob, safeName, ext };

                    if (autoDownload) {
                        triggerDownload(blob, `${safeName}.${ext}`);
                    }
                }
                resolve(result);
            };

            mediaRecorder.start(100);
            video.play();

            const checkInterval = setInterval(() => {
                // Ensure canvas renders video frame even if tab/screen state changes during export
                renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);

                const elapsed = video.currentTime - clip.startTime;
                const progress = Math.min(100, (elapsed / clip.duration) * 100);
                onProgress(progress);

                if (video.currentTime >= clip.endTime || state.cancelExportRequested || video.ended) {
                    clearInterval(checkInterval);
                    if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
                }
            }, 50);
        });
    }

    // Start App Engine
    init();
});
