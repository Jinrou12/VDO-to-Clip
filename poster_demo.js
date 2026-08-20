/* Khmer Audio & Video Poster Studio Demo JavaScript */
document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        mediaFiles: [],
        activeAudioId: null,
        activeTab: 'tab-upload',
        aspectRatio: '16:9',
        canvasWidth: 1280,
        canvasHeight: 720,
        
        // Speaker Layer (Left)
        speakerImg: null,
        rawSpeakerImg: null,
        speakerCanvas: null,
        speakerCtx: null,
        speakerScale: 100,
        speakerX: 0,
        speakerY: 0,
        speakerRadius: 0,
        speakerFlipH: false,
        bgTolerance: 30,
        isBgRemoved: false,
        speakerGlowColor: '#FFFFFF',
        speakerGlowSize: 0,
        speakerShadow: 15,
        speakerMaskShape: 'none',
        speakerAspect: 'auto',
        cropTop: 0,
        cropBottom: 0,
        cropLeft: 0,
        cropRight: 0,

        // Tools
        activeTool: 'select', // 'select' | 'eraser' | 'colorKey' | 'lasso'
        eraserSize: 30,
        lassoPoints: [],

        // Background Layer (Right)
        bgImg: null,
        bgScale: 100,
        bgX: 0,
        bgY: 0,
        bgBlur: 0,
        bgBright: 100,

        // Khmer Typography
        mainTitle: 'មនុស្សអត់ប្រយោជន៍',
        titleFont: 'Moul',
        titleFontSize: 65,
        titleColor1: '#FFE600',
        titleColor2: '#FF9900',
        titleOffsetX: 0,
        titleOffsetY: 0,

        subTitle: 'លោកគ្រូសាន ភិរម្យ ធម្មទានកាត់ខ្លី',
        subTitleOffsetY: 0,

        // Waveform Visualizer
        waveColor: '#FFFFFF',
        waveHeight: 80,
        waveY: 62,

        // Dragging & Interaction State
        dragTarget: null,
        dragStartX: 0,
        dragStartY: 0,

        // Audio & Visualizer State
        audioCtx: null,
        analyser: null,
        audioSource: null,
        freqData: null,
        isPlaying: false
    };

    // --- DOM Elements ---
    const elements = {
        tabs: document.querySelectorAll('.tab-btn'),
        panes: document.querySelectorAll('.tab-pane'),
        dropZone: document.getElementById('dropZone'),
        mediaFileInput: document.getElementById('mediaFileInput'),
        mediaGrid: document.getElementById('mediaGrid'),
        mediaCount: document.getElementById('mediaCount'),
        clearAllMediaBtn: document.getElementById('clearAllMediaBtn'),
        converterList: document.getElementById('converterList'),
        convertAllVideosBtn: document.getElementById('convertAllVideosBtn'),
        
        // Studio Elements
        posterCanvas: document.getElementById('posterCanvas'),
        ctx: document.getElementById('posterCanvas').getContext('2d'),
        aspectBtns: document.querySelectorAll('.aspect-btn'),
        activeAudioSelect: document.getElementById('activeAudioSelect'),
        audioPlayer: document.getElementById('audioPlayer'),
        playAudioBtn: document.getElementById('playAudioBtn'),
        audioScrubber: document.getElementById('audioScrubber'),
        audioTimeDisplay: document.getElementById('audioTimeDisplay'),

        // Control Inputs
        speakerPhotoInput: document.getElementById('speakerPhotoInput'),
        flipSpeakerBtn: document.getElementById('flipSpeakerBtn'),
        resetSpeakerImgBtn: document.getElementById('resetSpeakerImgBtn'),
        removeBgBtn: document.getElementById('removeBgBtn'),
        mediaPipeAiBtn: document.getElementById('mediaPipeAiBtn'),
        removeBgApiBtn: document.getElementById('removeBgApiBtn'),
        removeBgApiGroup: document.getElementById('removeBgApiGroup'),
        removeBgApiKeyInput: document.getElementById('removeBgApiKeyInput'),
        runRemoveBgApiBtn: document.getElementById('runRemoveBgApiBtn'),
        humanSegBtn: document.getElementById('humanSegBtn'),
        cropToolBtn: document.getElementById('cropToolBtn'),
        cropPanelGroup: document.getElementById('cropPanelGroup'),
        cropTopInput: document.getElementById('cropTopInput'),
        cropTopVal: document.getElementById('cropTopVal'),
        cropBottomInput: document.getElementById('cropBottomInput'),
        cropBottomVal: document.getElementById('cropBottomVal'),
        cropLeftInput: document.getElementById('cropLeftInput'),
        cropLeftVal: document.getElementById('cropLeftVal'),
        cropRightInput: document.getElementById('cropRightInput'),
        cropRightVal: document.getElementById('cropRightVal'),
        resetCropBtn: document.getElementById('resetCropBtn'),
        speakerAspectSelect: document.getElementById('speakerAspectSelect'),
        speakerMaskShapeSelect: document.getElementById('speakerMaskShapeSelect'),

        speakerGlowColorInput: document.getElementById('speakerGlowColorInput'),
        speakerGlowSizeInput: document.getElementById('speakerGlowSizeInput'),
        speakerGlowSizeVal: document.getElementById('speakerGlowSizeVal'),
        speakerShadowInput: document.getElementById('speakerShadowInput'),
        speakerShadowVal: document.getElementById('speakerShadowVal'),

        speakerScaleInput: document.getElementById('speakerScaleInput'),
        speakerScaleVal: document.getElementById('speakerScaleVal'),
        speakerXInput: document.getElementById('speakerXInput'),
        speakerXVal: document.getElementById('speakerXVal'),
        speakerYInput: document.getElementById('speakerYInput'),
        speakerYVal: document.getElementById('speakerYVal'),
        speakerRadiusInput: document.getElementById('speakerRadiusInput'),

        bgPhotoInput: document.getElementById('bgPhotoInput'),
        bgScaleInput: document.getElementById('bgScaleInput'),
        bgScaleVal: document.getElementById('bgScaleVal'),
        bgXInput: document.getElementById('bgXInput'),
        bgXVal: document.getElementById('bgXVal'),
        bgYInput: document.getElementById('bgYInput'),
        bgYVal: document.getElementById('bgYVal'),
        bgBlurInput: document.getElementById('bgBlurInput'),
        bgBlurVal: document.getElementById('bgBlurVal'),
        bgBrightInput: document.getElementById('bgBrightInput'),
        bgBrightVal: document.getElementById('bgBrightVal'),

        mainTitleInput: document.getElementById('mainTitleInput'),
        titleFontSelect: document.getElementById('titleFontSelect'),
        titleFontSizeInput: document.getElementById('titleFontSizeInput'),
        titleColor1Input: document.getElementById('titleColor1Input'),
        titleColor2Input: document.getElementById('titleColor2Input'),
        subTitleInput: document.getElementById('subTitleInput'),

        waveColorInput: document.getElementById('waveColorInput'),
        waveHeightInput: document.getElementById('waveHeightInput'),
        waveYInput: document.getElementById('waveYInput'),

        exportPosterImgBtn: document.getElementById('exportPosterImgBtn'),
        exportPosterVideoBtn: document.getElementById('exportPosterVideoBtn'),
        toastContainer: document.getElementById('toastContainer')
    };

    // --- Init Default Canvas & Demo Content ---
    function init() {
        setupTabEvents();
        setupFileUploadEvents();
        setupControlEvents();
        setupCanvasMouseEvents();
        setupAudioVisualizer();
        createDemoImages();
        startCanvasLoop();
    }

    // --- Tab Navigation ---
    function setupTabEvents() {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                elements.tabs.forEach(t => t.classList.remove('active'));
                elements.panes.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                state.activeTab = targetTab;
            });
        });

        elements.aspectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.aspectBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.aspectRatio = btn.dataset.ratio;
                updateCanvasDimensions();
            });
        });
    }

    function updateCanvasDimensions() {
        if (state.aspectRatio === '16:9') {
            state.canvasWidth = 1280;
            state.canvasHeight = 720;
        } else if (state.aspectRatio === '1:1') {
            state.canvasWidth = 1080;
            state.canvasHeight = 1080;
        } else if (state.aspectRatio === '9:16') {
            state.canvasWidth = 720;
            state.canvasHeight = 1280;
        }
        elements.posterCanvas.width = state.canvasWidth;
        elements.posterCanvas.height = state.canvasHeight;
    }

    // --- File Upload & Queue Manager ---
    function setupFileUploadEvents() {
        elements.dropZone.addEventListener('click', () => elements.mediaFileInput.click());

        elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.dropZone.classList.add('dragover');
        });

        elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('dragover'));

        elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });

        elements.mediaFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });

        elements.clearAllMediaBtn.addEventListener('click', () => {
            state.mediaFiles = [];
            renderMediaLibrary();
            renderConverterList();
            updateAudioSelectOptions();
            showToast('បានលុប File ទាំងអស់!');
        });
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            const isVideo = file.type.startsWith('video');
            const isAudio = file.type.startsWith('audio');
            if (!isVideo && !isAudio) return;

            const mediaItem = {
                id: Date.now() + Math.random(),
                file: file,
                name: file.name,
                type: isVideo ? 'video' : 'audio',
                url: URL.createObjectURL(file),
                duration: 0
            };

            const tempMedia = document.createElement(isVideo ? 'video' : 'audio');
            tempMedia.src = mediaItem.url;
            tempMedia.onloadedmetadata = () => {
                mediaItem.duration = tempMedia.duration || 0;
                renderMediaLibrary();
                renderConverterList();
                updateAudioSelectOptions();
            };

            state.mediaFiles.push(mediaItem);
        });

        showToast(`បាន Upload ${files.length} File ជោគជ័យ!`);
        renderMediaLibrary();
        renderConverterList();
        updateAudioSelectOptions();
    }

    function renderMediaLibrary() {
        elements.mediaCount.textContent = state.mediaFiles.length;
        if (state.mediaFiles.length === 0) {
            elements.mediaGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted);">មិនទាន់មាន File Upload នៅឡើយទេ</div>`;
            return;
        }

        elements.mediaGrid.innerHTML = state.mediaFiles.map(m => `
            <div class="media-card">
                <div class="media-card-header">
                    <span class="media-badge ${m.type === 'video' ? 'badge-video' : 'badge-audio'}">${m.type}</span>
                    <span class="media-meta">⏱️ ${formatTime(m.duration)}</span>
                </div>
                <div class="media-name" title="${m.name}">${m.name}</div>
                <div class="media-actions">
                    <button class="btn btn-secondary btn-sm" onclick="selectForStudio(${m.id})" style="flex:1;">🎨 Open Studio</button>
                    ${m.type === 'video' ? `<button class="btn btn-primary btn-sm" onclick="convertSingleVideo(${m.id})">🎵 Convert</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteMedia(${m.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function renderConverterList() {
        const videoFiles = state.mediaFiles.filter(m => m.type === 'video');
        if (videoFiles.length === 0) {
            elements.converterList.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">គ្មាន File Video សម្រាប់បំប្លែងទេ (សូម Upload Video ក្នុង Tab ទី 1)</div>`;
            return;
        }

        elements.converterList.innerHTML = videoFiles.map(v => `
            <div class="converter-item">
                <div class="converter-info">
                    <div class="converter-icon">🎬</div>
                    <div>
                        <div style="font-weight:700; color:var(--text-bright);">${v.name}</div>
                        <div style="font-size:0.82rem; color:var(--text-muted);">Duration: ${formatTime(v.duration)}</div>
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="convertSingleVideo(${v.id})">⚡ Convert to Audio (.WAV)</button>
                </div>
            </div>
        `).join('');
    }

    function updateAudioSelectOptions() {
        elements.activeAudioSelect.innerHTML = `<option value="">-- ជ្រើសរើស Audio/Video Track --</option>` +
            state.mediaFiles.map(m => `<option value="${m.id}">${m.type === 'video' ? '🎥' : '🎵'} ${m.name}</option>`).join('');
        
        if (state.mediaFiles.length > 0 && !state.activeAudioId) {
            state.activeAudioId = state.mediaFiles[0].id;
            elements.activeAudioSelect.value = state.activeAudioId;
            setAudioSource(state.mediaFiles[0]);
        }
    }

    window.selectForStudio = function(id) {
        const item = state.mediaFiles.find(m => m.id === id);
        if (!item) return;
        state.activeAudioId = id;
        elements.activeAudioSelect.value = id;
        setAudioSource(item);
        
        document.querySelector('[data-tab="tab-studio"]').click();
        showToast(`បានបើក "${item.name}" ក្នុង Studio`);
    };

    window.deleteMedia = function(id) {
        state.mediaFiles = state.mediaFiles.filter(m => m.id !== id);
        renderMediaLibrary();
        renderConverterList();
        updateAudioSelectOptions();
    };

    // --- Video to Audio Conversion ---
    window.convertSingleVideo = async function(id) {
        const item = state.mediaFiles.find(m => m.id === id);
        if (!item || item.type !== 'video') return;

        showToast(`⚡ កំពុងបំប្លែង "${item.name}" ទៅជា Audio...`);

        try {
            const response = await fetch(item.url);
            const arrayBuffer = await response.arrayBuffer();
            
            const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
            
            const wavBlob = audioBufferToWav(audioBuffer);
            const convertedName = item.name.replace(/\.[^/.]+$/, "") + "_audio.wav";
            const convertedFile = new File([wavBlob], convertedName, { type: 'audio/wav' });

            const audioItem = {
                id: Date.now() + Math.random(),
                file: convertedFile,
                name: convertedName,
                type: 'audio',
                url: URL.createObjectURL(convertedFile),
                duration: audioBuffer.duration
            };

            state.mediaFiles.push(audioItem);
            renderMediaLibrary();
            updateAudioSelectOptions();
            showToast(`✅ បំប្លែងបានជោគជ័យ: ${convertedName}`);
        } catch (err) {
            console.error(err);
            showToast(`❌ បរាជ័យក្នុងការបំប្លែង Video!`);
        }
    };

    elements.convertAllVideosBtn.addEventListener('click', async () => {
        const videoFiles = state.mediaFiles.filter(m => m.type === 'video');
        for (const v of videoFiles) {
            await convertSingleVideo(v.id);
        }
    });

    // --- Background Removal Algorithm ---
    async function processAutoRemoveBg(imageElement, tolerance = 30) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageElement.naturalWidth || imageElement.width;
        tempCanvas.height = imageElement.naturalHeight || imageElement.height;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(imageElement, 0, 0);

        const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;

        // Sample corner pixel colors (Top-Left & Top-Right)
        const sampleR = (data[0] + data[(tempCanvas.width - 1) * 4]) / 2;
        const sampleG = (data[1] + data[(tempCanvas.width - 1) * 4 + 1]) / 2;
        const sampleB = (data[2] + data[(tempCanvas.width - 1) * 4 + 2]) / 2;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diff = Math.sqrt((r - sampleR) ** 2 + (g - sampleG) ** 2 + (b - sampleB) ** 2);
            if (diff < tolerance * 2.5) {
                data[i + 3] = 0; // Set Alpha to 0 (Transparent)
            }
        }

        tCtx.putImageData(imgData, 0, 0);
        return new Promise((resolve) => {
            const cleanImg = new Image();
            cleanImg.onload = () => resolve(cleanImg);
            cleanImg.src = tempCanvas.toDataURL('image/png');
        });
    }

    // --- AI Human Segmentation Algorithm ---
    async function processHumanSegmentation(imageElement) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageElement.naturalWidth || imageElement.width;
        tempCanvas.height = imageElement.naturalHeight || imageElement.height;
        const tCtx = tempCanvas.getContext('2d');
        tCtx.drawImage(imageElement, 0, 0);

        const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;
        const w = tempCanvas.width;
        const h = tempCanvas.height;

        // Sample background pixels at top corners & top center
        const corners = [
            0,
            Math.floor(w / 2) * 4,
            (w - 1) * 4,
            (h - 1) * w * 4,
            ((h - 1) * w + (w - 1)) * 4
        ];

        const bgSamples = corners.map(idx => ({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2]
        }));

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            let minDiff = Infinity;
            bgSamples.forEach(bg => {
                const diff = Math.sqrt((r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2);
                if (diff < minDiff) minDiff = diff;
            });

            // Protect skin tones and orange/warm monk robes from being cut
            const isSkinOrRobe = (r > 80 && g > 35 && r >= g) || (r > 160 && g < 130);
            const threshold = isSkinOrRobe ? 90 : 55;

            if (minDiff < threshold) {
                data[i + 3] = 0; // Alpha 0 (Transparent)
            }
        }

        tCtx.putImageData(imgData, 0, 0);
        return new Promise((resolve) => {
            const cleanImg = new Image();
            cleanImg.onload = () => resolve(cleanImg);
            cleanImg.src = tempCanvas.toDataURL('image/png');
        });
    }

    // --- Interactive Mouse Dragging & Manual Eraser on Canvas ---
    function initSpeakerCanvas(img) {
        if (!img) return;
        state.rawSpeakerImg = img;
        state.speakerImg = img;

        const setupCanvas = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth || img.width || 400;
            c.height = img.naturalHeight || img.height || 600;
            const sCtx = c.getContext('2d');
            sCtx.drawImage(img, 0, 0);
            state.speakerCanvas = c;
            state.speakerCtx = sCtx;
        };

        if (img.complete && img.naturalWidth > 0) {
            setupCanvas();
        } else {
            img.onload = setupCanvas;
        }
    }

    function eraseSpeakerAt(canvasPosX, canvasPosY) {
        if (!state.speakerCanvas || !state.speakerCtx) return;
        const scale = state.speakerScale / 100;
        const spWidth = (state.canvasWidth * 0.45) * scale;
        const spHeight = (state.canvasHeight * 0.9) * scale;
        const spX = 30 + state.speakerX;
        const spY = (state.canvasHeight - spHeight) + state.speakerY;

        let relX = (canvasPosX - spX) / spWidth;
        let relY = (canvasPosY - spY) / spHeight;

        if (state.speakerFlipH) relX = 1 - relX;

        if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;

        const imgX = relX * state.speakerCanvas.width;
        const imgY = relY * state.speakerCanvas.height;
        const brushR = (state.eraserSize / spWidth) * state.speakerCanvas.width;

        const sCtx = state.speakerCtx;
        sCtx.save();
        sCtx.globalCompositeOperation = 'destination-out';
        sCtx.beginPath();
        sCtx.arc(imgX, imgY, brushR, 0, Math.PI * 2);
        sCtx.fill();
        sCtx.restore();

        const editedImg = new Image();
        editedImg.onload = () => { state.speakerImg = editedImg; };
        editedImg.src = state.speakerCanvas.toDataURL('image/png');
    }

    function pickAndRemoveColorAt(canvasPosX, canvasPosY) {
        if (!state.speakerCanvas || !state.speakerCtx) return;
        const scale = state.speakerScale / 100;
        const spWidth = (state.canvasWidth * 0.45) * scale;
        const spHeight = (state.canvasHeight * 0.9) * scale;
        const spX = 30 + state.speakerX;
        const spY = (state.canvasHeight - spHeight) + state.speakerY;

        let relX = (canvasPosX - spX) / spWidth;
        let relY = (canvasPosY - spY) / spHeight;

        if (state.speakerFlipH) relX = 1 - relX;

        if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;

        const imgX = Math.floor(relX * state.speakerCanvas.width);
        const imgY = Math.floor(relY * state.speakerCanvas.height);

        const sCtx = state.speakerCtx;
        const pixel = sCtx.getImageData(imgX, imgY, 1, 1).data;
        const targetR = pixel[0];
        const targetG = pixel[1];
        const targetB = pixel[2];

        const imgData = sCtx.getImageData(0, 0, state.speakerCanvas.width, state.speakerCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const diff = Math.sqrt((data[i] - targetR) ** 2 + (data[i + 1] - targetG) ** 2 + (data[i + 2] - targetB) ** 2);
            if (diff < state.bgTolerance * 2.5) {
                data[i + 3] = 0;
            }
        }

        sCtx.putImageData(imgData, 0, 0);
        const editedImg = new Image();
        editedImg.onload = () => { state.speakerImg = editedImg; };
        editedImg.src = state.speakerCanvas.toDataURL('image/png');
        showToast('🎯 បានលុបពណ៌ដែលបានរើសរួចរាល់!');
    }

    function eraseLassoRegion() {
        if (!state.speakerCanvas || !state.speakerCtx || state.lassoPoints.length < 3) return;
        const scale = state.speakerScale / 100;
        const spWidth = (state.canvasWidth * 0.45) * scale;
        const spHeight = (state.canvasHeight * 0.9) * scale;
        const spX = 30 + state.speakerX;
        const spY = (state.canvasHeight - spHeight) + state.speakerY;

        const sCtx = state.speakerCtx;
        sCtx.save();
        sCtx.globalCompositeOperation = 'destination-out';
        sCtx.beginPath();

        state.lassoPoints.forEach((pt, idx) => {
            let relX = (pt.x - spX) / spWidth;
            let relY = (pt.y - spY) / spHeight;
            if (state.speakerFlipH) relX = 1 - relX;
            const imgX = relX * state.speakerCanvas.width;
            const imgY = relY * state.speakerCanvas.height;

            if (idx === 0) sCtx.moveTo(imgX, imgY);
            else sCtx.lineTo(imgX, imgY);
        });

        sCtx.closePath();
        sCtx.fill();
        sCtx.restore();

        state.lassoPoints = [];
        const editedImg = new Image();
        editedImg.onload = () => { state.speakerImg = editedImg; };
        editedImg.src = state.speakerCanvas.toDataURL('image/png');
        showToast('✂️ បានលុបតំបន់គូសរង្វង់ (Lasso) រួចរាល់!');
    }

    let selfieSegmentationInstance = null;

    async function processMediaPipeSelfieCutout(imageElement) {
        return new Promise(async (resolve) => {
            try {
                const w = imageElement.naturalWidth || imageElement.width || 600;
                const h = imageElement.naturalHeight || imageElement.height || 800;

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = w;
                tempCanvas.height = h;
                const tCtx = tempCanvas.getContext('2d');

                let resolved = false;

                // 4-second safety timeout fallback
                const timeoutTimer = setTimeout(async () => {
                    if (!resolved) {
                        resolved = true;
                        showToast('⚡ កំពុងប្រើប្រាស់ Adaptive Human AI...');
                        const fallback = await processHumanSegmentation(imageElement);
                        resolve(fallback);
                    }
                }, 4000);

                if (!window.SelfieSegmentation) {
                    clearTimeout(timeoutTimer);
                    resolved = true;
                    const fallback = await processHumanSegmentation(imageElement);
                    resolve(fallback);
                    return;
                }

                if (!selfieSegmentationInstance) {
                    selfieSegmentationInstance = new window.SelfieSegmentation({
                        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
                    });
                    selfieSegmentationInstance.setOptions({
                        modelSelection: 1,
                    });
                }

                selfieSegmentationInstance.onResults((results) => {
                    if (resolved) return;
                    resolved = true;
                    clearTimeout(timeoutTimer);

                    tCtx.clearRect(0, 0, w, h);
                    tCtx.drawImage(results.segmentationMask, 0, 0, w, h);
                    
                    tCtx.globalCompositeOperation = 'source-in';
                    tCtx.drawImage(imageElement, 0, 0, w, h);

                    const cleanImg = new Image();
                    cleanImg.onload = () => resolve(cleanImg);
                    cleanImg.src = tempCanvas.toDataURL('image/png');
                });

                await selfieSegmentationInstance.send({ image: imageElement });
            } catch (err) {
                console.error('MediaPipe error:', err);
                const fallback = await processHumanSegmentation(imageElement);
                resolve(fallback);
            }
        });
    }

    async function processRemoveBgApi(imageElement, apiKey) {
        try {
            showToast('⚡ កំពុងផ្ញើទៅ Remove.bg HD AI...');
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageElement.naturalWidth || imageElement.width;
            tempCanvas.height = imageElement.naturalHeight || imageElement.height;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.drawImage(imageElement, 0, 0);

            const blob = await new Promise(r => tempCanvas.toBlob(r, 'image/png'));
            const formData = new FormData();
            formData.append('image_file', blob, 'speaker.png');
            formData.append('size', 'auto');

            const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: { 'X-Api-Key': apiKey },
                body: formData
            });

            if (!res.ok) {
                throw new Error(`API Error ${res.status}`);
            }

            const resBlob = await res.blob();
            const cleanImg = new Image();
            return new Promise((resolve) => {
                cleanImg.onload = () => resolve(cleanImg);
                cleanImg.src = URL.createObjectURL(resBlob);
            });
        } catch (err) {
            console.error(err);
            showToast('❌ API Key មិនត្រឹមត្រូវ ឬអស់ Credit! សូមពិនិត្យឡើងវិញ។');
            return imageElement;
        }
    }

    function setupCanvasMouseEvents() {
        const canvas = elements.posterCanvas;

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }

        canvas.addEventListener('mousedown', (e) => {
            const pos = getMousePos(e);
            
            if (state.activeTool === 'eraser') {
                state.dragTarget = 'erasing';
                eraseSpeakerAt(pos.x, pos.y);
                return;
            }

            if (state.activeTool === 'colorKey') {
                pickAndRemoveColorAt(pos.x, pos.y);
                state.activeTool = 'select';
                canvas.style.cursor = 'grab';
                return;
            }

            // Check Main Title hit
            const titleX = (state.canvasWidth * 0.72) + state.titleOffsetX;
            const titleY = (state.canvasHeight * 0.52) + state.titleOffsetY;
            if (Math.abs(pos.x - titleX) < 250 && Math.abs(pos.y - titleY) < 60) {
                state.dragTarget = 'title';
                state.dragStartX = pos.x - state.titleOffsetX;
                state.dragStartY = pos.y - state.titleOffsetY;
                canvas.style.cursor = 'grabbing';
                return;
            }

            // Check Subtitle hit
            const subY = titleY + state.titleFontSize * 0.8 + state.subTitleOffsetY;
            if (Math.abs(pos.x - titleX) < 250 && Math.abs(pos.y - subY) < 40) {
                state.dragTarget = 'subtitle';
                state.dragStartX = pos.x - state.titleOffsetX;
                state.dragStartY = pos.y - state.subTitleOffsetY;
                canvas.style.cursor = 'grabbing';
                return;
            }

            // Check Speaker hit
            const scale = state.speakerScale / 100;
            const spWidth = (state.canvasWidth * 0.45) * scale;
            const spHeight = (state.canvasHeight * 0.9) * scale;
            const spX = 30 + state.speakerX;
            const spY = (state.canvasHeight - spHeight) + state.speakerY;

            if (pos.x >= spX && pos.x <= spX + spWidth && pos.y >= spY && pos.y <= spY + spHeight) {
                state.dragTarget = 'speaker';
                state.dragStartX = pos.x - state.speakerX;
                state.dragStartY = pos.y - state.speakerY;
                canvas.style.cursor = 'grabbing';
                return;
            }

            // Default to Background drag
            state.dragTarget = 'background';
            state.dragStartX = pos.x - state.bgX;
            state.dragStartY = pos.y - state.bgY;
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            const pos = getMousePos(e);

            if (state.activeTool === 'eraser' && state.dragTarget === 'erasing') {
                eraseSpeakerAt(pos.x, pos.y);
                return;
            }

            if (!state.dragTarget) {
                canvas.style.cursor = state.activeTool === 'eraser' ? 'crosshair' : (state.activeTool === 'colorKey' ? 'cell' : 'grab');
                return;
            }

            if (state.dragTarget === 'title') {
                state.titleOffsetX = pos.x - state.dragStartX;
                state.titleOffsetY = pos.y - state.dragStartY;
            } else if (state.dragTarget === 'subtitle') {
                state.subTitleOffsetY = pos.y - state.dragStartY;
            } else if (state.dragTarget === 'speaker') {
                state.speakerX = pos.x - state.dragStartX;
                state.speakerY = pos.y - state.dragStartY;
                if (elements.speakerXInput) elements.speakerXInput.value = state.speakerX;
                if (elements.speakerYInput) elements.speakerYInput.value = state.speakerY;
                if (elements.speakerXVal) elements.speakerXVal.textContent = Math.round(state.speakerX) + 'px';
                if (elements.speakerYVal) elements.speakerYVal.textContent = Math.round(state.speakerY) + 'px';
            } else if (state.dragTarget === 'background') {
                state.bgX = pos.x - state.dragStartX;
                state.bgY = pos.y - state.dragStartY;
                if (elements.bgXInput) elements.bgXInput.value = state.bgX;
                if (elements.bgYInput) elements.bgYInput.value = state.bgY;
                if (elements.bgXVal) elements.bgXVal.textContent = Math.round(state.bgX) + 'px';
                if (elements.bgYVal) elements.bgYVal.textContent = Math.round(state.bgY) + 'px';
            }
        });

        window.addEventListener('mouseup', () => {
            state.dragTarget = null;
            if (canvas) canvas.style.cursor = state.activeTool === 'eraser' ? 'crosshair' : (state.activeTool === 'colorKey' ? 'cell' : 'grab');
        });
    }

    // --- Web Audio API & Visualizer Setup ---
    function setupAudioVisualizer() {
        elements.activeAudioSelect.addEventListener('change', (e) => {
            const id = parseFloat(e.target.value);
            const item = state.mediaFiles.find(m => m.id === id);
            if (item) {
                state.activeAudioId = id;
                setAudioSource(item);
            }
        });

        elements.playAudioBtn.addEventListener('click', () => {
            if (!state.audioCtx) {
                initWebAudio();
            }
            if (state.isPlaying) {
                elements.audioPlayer.pause();
                state.isPlaying = false;
                elements.playAudioBtn.textContent = '▶️ Play Audio';
            } else {
                elements.audioPlayer.play();
                state.isPlaying = true;
                elements.playAudioBtn.textContent = '⏸️ Pause';
            }
        });

        elements.audioPlayer.addEventListener('timeupdate', () => {
            if (elements.audioPlayer.duration) {
                const pct = (elements.audioPlayer.currentTime / elements.audioPlayer.duration) * 100;
                elements.audioScrubber.value = pct;
                elements.audioTimeDisplay.textContent = `${formatTime(elements.audioPlayer.currentTime)} / ${formatTime(elements.audioPlayer.duration)}`;
            }
        });

        elements.audioScrubber.addEventListener('input', (e) => {
            if (elements.audioPlayer.duration) {
                elements.audioPlayer.currentTime = (e.target.value / 100) * elements.audioPlayer.duration;
            }
        });
    }

    function initWebAudio() {
        try {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            state.analyser = state.audioCtx.createAnalyser();
            state.analyser.fftSize = 128;
            state.freqData = new Uint8Array(state.analyser.frequencyBinCount);

            state.audioSource = state.audioCtx.createMediaElementSource(elements.audioPlayer);
            state.audioSource.connect(state.analyser);
            state.analyser.connect(state.audioCtx.destination);
        } catch (err) {
            console.warn('WebAudio setup:', err);
        }
    }

    function setAudioSource(item) {
        elements.audioPlayer.src = item.url;
        state.isPlaying = false;
        elements.playAudioBtn.textContent = '▶️ Play Audio';
    }

    // --- Control Inputs & Listeners ---
    function setupControlEvents() {
        // Speaker Upload & Actions
        elements.speakerPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        initSpeakerCanvas(img);
                        showToast('បាន Upload រូប Speaker រួចរាល់!');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        if (elements.mediaPipeAiBtn) {
            elements.mediaPipeAiBtn.addEventListener('click', async () => {
                if (!state.rawSpeakerImg) {
                    showToast('⚠️ សូម Upload រូប Speaker ជាមុនសិន!');
                    return;
                }
                showToast('🧠 កំពុងកាត់រូបមនុស្សតាមបែប Google MediaPipe AI (100% ស្អាត)...');
                const cleanImg = await processMediaPipeSelfieCutout(state.rawSpeakerImg);
                initSpeakerCanvas(cleanImg);
                state.speakerGlowSize = 12;
                if (elements.speakerGlowSizeInput) elements.speakerGlowSizeInput.value = 12;
                if (elements.speakerGlowSizeVal) elements.speakerGlowSizeVal.textContent = '12px';
                showToast('✅ Google MediaPipe AI កាត់រូបមនុស្សបាន 100% ស្អាត!');
            });
        }

        if (elements.removeBgApiBtn) {
            elements.removeBgApiBtn.addEventListener('click', () => {
                const isHidden = elements.removeBgApiGroup.style.display === 'none';
                elements.removeBgApiGroup.style.display = isHidden ? 'block' : 'none';
            });
        }

        if (elements.runRemoveBgApiBtn) {
            elements.runRemoveBgApiBtn.addEventListener('click', async () => {
                if (!state.rawSpeakerImg) {
                    showToast('⚠️ សូម Upload រូប Speaker ជាមុនសិន!');
                    return;
                }
                const key = elements.removeBgApiKeyInput.value.trim();
                if (!key) {
                    showToast('⚠️ សូមបញ្ចូល API Key របស់ Remove.bg!');
                    return;
                }
                const cleanImg = await processRemoveBgApi(state.rawSpeakerImg, key);
                initSpeakerCanvas(cleanImg);
                showToast('✅ Remove.bg HD AI កាត់ Background បាន 100% រួចរាល់!');
            });
        }

        if (elements.lassoToolBtn) {
            elements.lassoToolBtn.addEventListener('click', () => {
                if (state.activeTool === 'lasso') {
                    state.activeTool = 'select';
                    if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'grab';
                    showToast('បានបិទ ឧបករណ៍ Lasso');
                } else {
                    state.activeTool = 'lasso';
                    if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'crosshair';
                    showToast('✂️ ឧបករណ៍ Lasso ត្រូវបានបើក៖ ប្រើ Mouse គូសរង្វង់ជុំវិញតំបន់ចង់លុប!');
                }
            });
        }

        if (elements.resetSpeakerImgBtn) {
            elements.resetSpeakerImgBtn.addEventListener('click', () => {
                if (state.rawSpeakerImg) {
                    initSpeakerCanvas(state.rawSpeakerImg);
                    state.activeTool = 'select';
                    if (elements.eraserSizeGroup) elements.eraserSizeGroup.style.display = 'none';
                    if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'grab';
                    showToast('🔄 បានស្តាររូប Speaker ដើមវិញ!');
                }
            });
        }

        if (elements.eraserToolBtn) {
            elements.eraserToolBtn.addEventListener('click', () => {
                if (state.activeTool === 'eraser') {
                    state.activeTool = 'select';
                    if (elements.eraserSizeGroup) elements.eraserSizeGroup.style.display = 'none';
                    if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'grab';
                    showToast('បានបិទ ជក់លុប BG (Normal Mode)');
                } else {
                    state.activeTool = 'eraser';
                    if (elements.eraserSizeGroup) elements.eraserSizeGroup.style.display = 'block';
                    if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'crosshair';
                    showToast('🧹 ជក់លុប BG ត្រូវបានបើក៖ ប្រើ Mouse អូសលើរូបដើម្បីលុប!');
                }
            });
        }

        if (elements.pickColorKeyBtn) {
            elements.pickColorKeyBtn.addEventListener('click', () => {
                state.activeTool = 'colorKey';
                if (elements.posterCanvas) elements.posterCanvas.style.cursor = 'cell';
                showToast('🎯 ជ្រើសរើសពណ៌លុប៖ សូម ចុចលើពណ៌ background លើរូបភាព!');
            });
        }

        if (elements.eraserSizeInput) {
            elements.eraserSizeInput.addEventListener('input', (e) => {
                state.eraserSize = parseInt(e.target.value);
                if (elements.eraserSizeVal) elements.eraserSizeVal.textContent = state.eraserSize + 'px';
            });
        }

        if (elements.cropToolBtn) {
            elements.cropToolBtn.addEventListener('click', () => {
                const isHidden = elements.cropPanelGroup.style.display === 'none';
                elements.cropPanelGroup.style.display = isHidden ? 'block' : 'none';
            });
        }

        if (elements.cropTopInput) {
            elements.cropTopInput.addEventListener('input', (e) => {
                state.cropTop = parseInt(e.target.value);
                if (elements.cropTopVal) elements.cropTopVal.textContent = state.cropTop + '%';
            });
        }
        if (elements.cropBottomInput) {
            elements.cropBottomInput.addEventListener('input', (e) => {
                state.cropBottom = parseInt(e.target.value);
                if (elements.cropBottomVal) elements.cropBottomVal.textContent = state.cropBottom + '%';
            });
        }
        if (elements.cropLeftInput) {
            elements.cropLeftInput.addEventListener('input', (e) => {
                state.cropLeft = parseInt(e.target.value);
                if (elements.cropLeftVal) elements.cropLeftVal.textContent = state.cropLeft + '%';
            });
        }
        if (elements.cropRightInput) {
            elements.cropRightInput.addEventListener('input', (e) => {
                state.cropRight = parseInt(e.target.value);
                if (elements.cropRightVal) elements.cropRightVal.textContent = state.cropRight + '%';
            });
        }
        if (elements.resetCropBtn) {
            elements.resetCropBtn.addEventListener('click', () => {
                state.cropTop = 0;
                state.cropBottom = 0;
                state.cropLeft = 0;
                state.cropRight = 0;
                if (elements.cropTopInput) elements.cropTopInput.value = 0;
                if (elements.cropBottomInput) elements.cropBottomInput.value = 0;
                if (elements.cropLeftInput) elements.cropLeftInput.value = 0;
                if (elements.cropRightInput) elements.cropRightInput.value = 0;
                if (elements.cropTopVal) elements.cropTopVal.textContent = '0%';
                if (elements.cropBottomVal) elements.cropBottomVal.textContent = '0%';
                if (elements.cropLeftVal) elements.cropLeftVal.textContent = '0%';
                if (elements.cropRightVal) elements.cropRightVal.textContent = '0%';
                showToast('🔄 បានស្តារ Crop ដើមវិញ!');
            });
        }
        if (elements.speakerAspectSelect) {
            elements.speakerAspectSelect.addEventListener('change', (e) => {
                state.speakerAspect = e.target.value;
                showToast(`បានកំណត់ទ្រង់ទ្រាយរូប៖ ${e.target.options[e.target.selectedIndex].text}`);
            });
        }

        if (elements.speakerMaskShapeSelect) {
            elements.speakerMaskShapeSelect.addEventListener('change', (e) => {
                state.speakerMaskShape = e.target.value;
                showToast(`បានប្តូរស៊ុមរាងរូបទៅជា៖ ${e.target.options[e.target.selectedIndex].text}`);
            });
        }

        elements.flipSpeakerBtn.addEventListener('click', () => {
            state.speakerFlipH = !state.speakerFlipH;
            showToast(`បានត្រឡប់រូប ${state.speakerFlipH ? 'ឆ្វេង-ស្តាំ' : 'ធម្មតា'}`);
        });

        elements.removeBgBtn.addEventListener('click', async () => {
            if (!state.rawSpeakerImg) {
                showToast('⚠️ សូម Upload រូប Speaker ជាមុនសិន!');
                return;
            }

            elements.bgToleranceGroup.style.display = 'block';
            showToast('✨ កំពុងលុប Background Auto...');
            state.speakerImg = await processAutoRemoveBg(state.rawSpeakerImg, state.bgTolerance);
            state.isBgRemoved = true;
            showToast('✅ លុប Background រួចរាល់!');
        });

        if (elements.humanSegBtn) {
            elements.humanSegBtn.addEventListener('click', async () => {
                if (!state.rawSpeakerImg) {
                    showToast('⚠️ សូម Upload រូប Speaker ជាមុនសិន!');
                    return;
                }

                elements.bgToleranceGroup.style.display = 'block';
                showToast('🧠 កំពុងកាត់រូបមនុស្ស (Human Segmentation AI)...');
                state.speakerImg = await processHumanSegmentation(state.rawSpeakerImg);
                state.isBgRemoved = true;
                state.speakerGlowSize = 12;
                if (elements.speakerGlowSizeInput) elements.speakerGlowSizeInput.value = 12;
                if (elements.speakerGlowSizeVal) elements.speakerGlowSizeVal.textContent = '12px';
                showToast('✅ AI Human Segmentation កាត់រូបមនុស្សជោគជ័យ!');
            });
        }

        if (elements.speakerGlowColorInput) {
            elements.speakerGlowColorInput.addEventListener('input', (e) => state.speakerGlowColor = e.target.value);
        }
        if (elements.speakerGlowSizeInput) {
            elements.speakerGlowSizeInput.addEventListener('input', (e) => {
                state.speakerGlowSize = parseInt(e.target.value);
                if (elements.speakerGlowSizeVal) elements.speakerGlowSizeVal.textContent = state.speakerGlowSize + 'px';
            });
        }
        if (elements.speakerShadowInput) {
            elements.speakerShadowInput.addEventListener('input', (e) => {
                state.speakerShadow = parseInt(e.target.value);
                if (elements.speakerShadowVal) elements.speakerShadowVal.textContent = state.speakerShadow + 'px';
            });
        }

        elements.bgToleranceInput.addEventListener('input', async (e) => {
            state.bgTolerance = parseInt(e.target.value);
            elements.bgToleranceVal.textContent = state.bgTolerance;
            if (state.rawSpeakerImg && state.isBgRemoved) {
                state.speakerImg = await processAutoRemoveBg(state.rawSpeakerImg, state.bgTolerance);
            }
        });

        elements.speakerScaleInput.addEventListener('input', (e) => {
            state.speakerScale = parseInt(e.target.value);
            elements.speakerScaleVal.textContent = state.speakerScale + '%';
        });

        elements.speakerXInput.addEventListener('input', (e) => {
            state.speakerX = parseInt(e.target.value);
            elements.speakerXVal.textContent = state.speakerX + 'px';
        });

        elements.speakerYInput.addEventListener('input', (e) => {
            state.speakerY = parseInt(e.target.value);
            elements.speakerYVal.textContent = state.speakerY + 'px';
        });

        elements.speakerRadiusInput.addEventListener('input', (e) => {
            state.speakerRadius = parseInt(e.target.value);
        });

        // Background Upload & Actions
        elements.bgPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => { state.bgImg = img; };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        elements.bgScaleInput.addEventListener('input', (e) => {
            state.bgScale = parseInt(e.target.value);
            elements.bgScaleVal.textContent = state.bgScale + '%';
        });

        elements.bgXInput.addEventListener('input', (e) => {
            state.bgX = parseInt(e.target.value);
            elements.bgXVal.textContent = state.bgX + 'px';
        });

        elements.bgYInput.addEventListener('input', (e) => {
            state.bgY = parseInt(e.target.value);
            elements.bgYVal.textContent = state.bgY + 'px';
        });

        elements.bgBlurInput.addEventListener('input', (e) => {
            state.bgBlur = parseInt(e.target.value);
            elements.bgBlurVal.textContent = state.bgBlur + 'px';
        });

        elements.bgBrightInput.addEventListener('input', (e) => {
            state.bgBright = parseInt(e.target.value);
            elements.bgBrightVal.textContent = state.bgBright + '%';
        });

        elements.mainTitleInput.addEventListener('input', (e) => state.mainTitle = e.target.value);
        elements.titleFontSelect.addEventListener('change', (e) => state.titleFont = e.target.value);
        elements.titleFontSizeInput.addEventListener('input', (e) => state.titleFontSize = parseInt(e.target.value));
        elements.titleColor1Input.addEventListener('input', (e) => state.titleColor1 = e.target.value);
        elements.titleColor2Input.addEventListener('input', (e) => state.titleColor2 = e.target.value);
        elements.subTitleInput.addEventListener('input', (e) => state.subTitle = e.target.value);

        elements.waveColorInput.addEventListener('input', (e) => state.waveColor = e.target.value);
        elements.waveHeightInput.addEventListener('input', (e) => state.waveHeight = parseInt(e.target.value));
        elements.waveYInput.addEventListener('input', (e) => state.waveY = parseInt(e.target.value));

        elements.exportPosterImgBtn.addEventListener('click', exportPosterImage);
        elements.exportPosterVideoBtn.addEventListener('click', exportPosterVideo);
    }

    // --- Canvas Drawing & Animation Loop ---
    function startCanvasLoop() {
        function loop() {
            try {
                renderPosterCanvas();
            } catch (err) {
                console.error('Canvas render frame error:', err);
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    function renderPosterCanvas() {
        const ctx = elements.ctx;
        const width = state.canvasWidth;
        const height = state.canvasHeight;

        ctx.clearRect(0, 0, width, height);

        // 1. Draw Custom Background Layer (Right Side / Full Canvas)
        if (state.bgImg && state.bgImg.complete && state.bgImg.naturalWidth > 0) {
            ctx.save();
            ctx.filter = `blur(${state.bgBlur}px) brightness(${state.bgBright}%)`;
            const bgScale = state.bgScale / 100;
            const bgW = width * bgScale;
            const bgH = height * bgScale;
            const bgX = (width - bgW) / 2 + state.bgX;
            const bgY = (height - bgH) / 2 + state.bgY;

            ctx.drawImage(state.bgImg, bgX, bgY, bgW, bgH);
            ctx.restore();
        } else {
            // Default Landscape Gradient Background
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(0.5, '#0f172a');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Speaker Photo Cutout (Left Side) with Natural Aspect Ratio & Crop
        if (state.speakerImg && (state.speakerImg.complete || state.speakerImg.width > 0) && (state.speakerImg.naturalWidth || state.speakerImg.width) > 0) {
            const scale = state.speakerScale / 100;
            const naturalW = state.speakerImg.naturalWidth || state.speakerImg.width || 400;
            const naturalH = state.speakerImg.naturalHeight || state.speakerImg.height || 600;

            // Compute Crop Parameters
            const cropL = (state.cropLeft / 100) * naturalW;
            const cropR = (state.cropRight / 100) * naturalW;
            const cropT = (state.cropTop / 100) * naturalH;
            const cropB = (state.cropBottom / 100) * naturalH;

            const srcW = Math.max(1, naturalW - cropL - cropR);
            const srcH = Math.max(1, naturalH - cropT - cropB);

            // Natural Aspect Ratio Calculation (Prevents image stretching!)
            let imgRatio = srcW / srcH;
            if (state.speakerAspect === '1:1') imgRatio = 1;
            else if (state.speakerAspect === '3:4') imgRatio = 3 / 4;
            else if (state.speakerAspect === '4:3') imgRatio = 4 / 3;

            const spHeight = (height * 0.88) * scale;
            const spWidth = spHeight * imgRatio;

            const spX = 30 + state.speakerX;
            const spY = (height - spHeight) + state.speakerY;

            // Outer Glow / Sticker Outline Pass
            if (state.speakerGlowSize > 0) {
                ctx.save();
                ctx.shadowColor = state.speakerGlowColor;
                ctx.shadowBlur = state.speakerGlowSize;
                
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                    const dx = Math.cos(angle) * (state.speakerGlowSize * 0.25);
                    const dy = Math.sin(angle) * (state.speakerGlowSize * 0.25);

                    if (state.speakerFlipH) {
                        ctx.save();
                        ctx.translate((spX + dx) + spWidth / 2, (spY + dy) + spHeight / 2);
                        ctx.scale(-1, 1);
                        ctx.drawImage(state.speakerImg, cropL, cropT, srcW, srcH, -spWidth / 2, -spHeight / 2, spWidth, spHeight);
                        ctx.restore();
                    } else {
                        ctx.drawImage(state.speakerImg, cropL, cropT, srcW, srcH, spX + dx, spY + dy, spWidth, spHeight);
                    }
                }
                ctx.restore();
            }

            // Drop Shadow & Main Cutout Pass
            ctx.save();
            if (state.speakerShadow > 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = state.speakerShadow;
                ctx.shadowOffsetX = 8;
                ctx.shadowOffsetY = 8;
            }

            if (state.speakerMaskShape === 'arch') {
                ctx.beginPath();
                const r = spWidth / 2;
                ctx.arc(spX + r, spY + r, r, Math.PI, 0, false);
                ctx.rect(spX, spY + r, spWidth, spHeight - r);
                ctx.clip();
            } else if (state.speakerMaskShape === 'circle') {
                ctx.beginPath();
                ctx.ellipse(spX + spWidth / 2, spY + spHeight / 2, spWidth / 2, spHeight / 2, 0, 0, Math.PI * 2);
                ctx.clip();
            } else if (state.speakerRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(spX, spY, spWidth, spHeight, state.speakerRadius);
                ctx.clip();
            }

            if (state.speakerFlipH) {
                ctx.translate(spX + spWidth / 2, spY + spHeight / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(state.speakerImg, cropL, cropT, srcW, srcH, -spWidth / 2, -spHeight / 2, spWidth, spHeight);
            } else {
                ctx.drawImage(state.speakerImg, cropL, cropT, srcW, srcH, spX, spY, spWidth, spHeight);
            }

            ctx.restore();
        }

        // 3. Draw Audio Spectrum Waveform Equalizer
        if (state.analyser && state.isPlaying) {
            state.analyser.getByteFrequencyData(state.freqData);
        }

        ctx.save();
        const wavePosY = (height * (state.waveY / 100));
        const numBars = 32;
        const barWidth = (width * 0.45) / numBars;
        const startX = width * 0.48;

        for (let i = 0; i < numBars; i++) {
            let val = state.freqData ? state.freqData[i] : (Math.sin(Date.now() * 0.005 + i) * 50 + 60);
            let barH = (val / 255) * state.waveHeight;

            ctx.fillStyle = state.waveColor;
            ctx.shadowColor = state.waveColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(startX + (i * barWidth), wavePosY - (barH / 2), barWidth - 4, barH);
        }
        ctx.restore();

        // 4. Draw Khmer Typography (Main Title & Subtitle)
        ctx.save();
        const titleX = (width * 0.72) + state.titleOffsetX;
        const titleY = (height * 0.52) + state.titleOffsetY;

        ctx.textAlign = 'center';
        ctx.font = `bold ${state.titleFontSize}px "${state.titleFont}", sans-serif`;

        // Gradient Fill
        const textGrad = ctx.createLinearGradient(titleX - 150, 0, titleX + 150, 0);
        textGrad.addColorStop(0, state.titleColor1);
        textGrad.addColorStop(1, state.titleColor2);

        // Stroke & Shadow
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(6, state.titleFontSize * 0.15);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 15;
        
        ctx.strokeText(state.mainTitle, titleX, titleY);
        ctx.fillStyle = textGrad;
        ctx.fillText(state.mainTitle, titleX, titleY);

        // Subtitle
        if (state.subTitle) {
            const subY = titleY + state.titleFontSize * 0.8 + state.subTitleOffsetY;
            ctx.font = `600 ${Math.round(state.titleFontSize * 0.45)}px "Kantumruy Pro", sans-serif`;
            ctx.lineWidth = 4;
            ctx.strokeText(state.subTitle, titleX, subY);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(state.subTitle, titleX, subY);
        }
        ctx.restore();

        // 5. Draw Active Selection Outline Box when Dragging
        if (state.dragTarget) {
            ctx.save();
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);

            if (state.dragTarget === 'title') {
                ctx.strokeRect(titleX - 220, titleY - state.titleFontSize, 440, state.titleFontSize * 1.3);
            } else if (state.dragTarget === 'subtitle') {
                const subY = titleY + state.titleFontSize * 0.8 + state.subTitleOffsetY;
                ctx.strokeRect(titleX - 200, subY - state.titleFontSize * 0.45, 400, state.titleFontSize * 0.7);
            } else if (state.dragTarget === 'speaker' && state.speakerImg) {
                const scale = state.speakerScale / 100;
                const naturalW = state.speakerImg.naturalWidth || state.speakerImg.width || 400;
                const naturalH = state.speakerImg.naturalHeight || state.speakerImg.height || 600;
                const cropL = (state.cropLeft / 100) * naturalW;
                const cropR = (state.cropRight / 100) * naturalW;
                const cropT = (state.cropTop / 100) * naturalH;
                const cropB = (state.cropBottom / 100) * naturalH;
                const srcW = Math.max(1, naturalW - cropL - cropR);
                const srcH = Math.max(1, naturalH - cropT - cropB);

                let imgRatio = srcW / srcH;
                if (state.speakerAspect === '1:1') imgRatio = 1;
                else if (state.speakerAspect === '3:4') imgRatio = 3 / 4;
                else if (state.speakerAspect === '4:3') imgRatio = 4 / 3;

                const spHeight = (height * 0.88) * scale;
                const spWidth = spHeight * imgRatio;
                const spX = 30 + state.speakerX;
                const spY = (height - spHeight) + state.speakerY;
                ctx.strokeRect(spX, spY, spWidth, spHeight);
            }
            ctx.restore();
        }

        // Draw live Lasso Tool polygon line preview
        if (state.activeTool === 'lasso' && state.lassoPoints && state.lassoPoints.length > 0) {
            ctx.save();
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            state.lassoPoints.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
            ctx.restore();
        }
    }

    // --- Generate Default Demo Images ---
    function createDemoImages() {
        const spCanvas = document.createElement('canvas');
        spCanvas.width = 400;
        spCanvas.height = 600;
        const sCtx = spCanvas.getContext('2d');
        
        const grad = sCtx.createLinearGradient(0, 0, 0, 600);
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(1, '#ea580c');
        sCtx.fillStyle = grad;
        sCtx.fillRect(50, 150, 300, 450);

        sCtx.fillStyle = '#fde047';
        sCtx.beginPath();
        sCtx.arc(200, 120, 70, 0, Math.PI * 2);
        sCtx.fill();

        const demoSpImg = new Image();
        demoSpImg.onload = () => {
            initSpeakerCanvas(demoSpImg);
        };
        demoSpImg.src = spCanvas.toDataURL();
    }

    // --- Export Functions ---
    function exportPosterImage() {
        renderPosterCanvas();
        const dataUrl = elements.posterCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `Khmer_Poster_${Date.now()}.png`;
        a.href = dataUrl;
        a.click();
        showToast('📸 បាន Export រូបភាព HD Poster រួចរាល់!');
    }

    async function exportPosterVideo() {
        if (!elements.audioPlayer.src) {
            showToast('⚠️ សូមជ្រើសរើស Audio/Video មុននឹង Export វីដេអូ!');
            return;
        }

        showToast('🎥 កំពុងបង្កើត Video ជាមួយចលនា Waveform...');

        const stream = elements.posterCanvas.captureStream(30);
        
        let mimeType = 'video/mp4;codecs=avc1,mp4a';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
        }

        const options = mimeType ? { mimeType, videoBitsPerSecond: 3500000 } : { videoBitsPerSecond: 3500000 };
        const recorder = new MediaRecorder(stream, options);
        const chunks = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/mp4' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = `Khmer_Poster_Video_${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`;
            a.href = url;
            a.click();
            showToast('✅ ទទួលបាន Video ជោគជ័យ!');
        };

        elements.audioPlayer.currentTime = 0;
        elements.audioPlayer.play();
        state.isPlaying = true;
        recorder.start();

        elements.audioPlayer.onended = () => {
            recorder.stop();
            state.isPlaying = false;
            elements.playAudioBtn.textContent = '▶️ Play Audio';
        };
    }

    // --- Helper Functions ---
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    // --- AudioBuffer to WAV Helper ---
    function audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const data = buffer.getChannelData(0);
        const dataSize = data.length * bytesPerSample;
        const headerSize = 44;
        const totalSize = headerSize + dataSize;
        
        const arrayBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(arrayBuffer);

        function writeString(offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        writeString(0, 'RIFF');
        view.setUint32(4, totalSize - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);

        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // Launch
    init();
});
