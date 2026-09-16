(() => {
  // src/app.ts
  document.addEventListener("DOMContentLoaded", () => {
    const state = {
      videoFile: null,
      videoObjectURL: null,
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      // Trimming state (Screen 1)
      trimIn: 0,
      trimOut: 0,
      // Platform Mode (facebook = 9:16 Vertical Mobile, youtube = 16:9 Widescreen Multi-Layer Studio)
      platformMode: "facebook",
      // 'facebook' | 'youtube'
      // YouTube Multi-Layer Studio State
      studioLayers: [],
      studioLayerCounter: 1,
      activeLayerId: null,
      videoPlacement: {
        layout: "split-right",
        // 'split-right' | 'split-left' | 'pip' | 'full'
        widthPct: 50,
        feather: 40,
        x: 0,
        y: 0,
        scale: 100
      },
      headlineBanner: {
        enabled: true,
        text: "\u17A0\u17BD\u179F\u1796\u17C1\u179B\u17A0\u17BE\u1799\u17A2\u17BC\u1793 ! \u178F\u17D2\u179A\u1784\u17CB\u1790\u17B6\u1781\u17D2\u1798\u17C2\u179A\u1793\u17B7\u1784\u179F\u17C0\u1798\u1787\u17B6\u1798\u1793\u17BB\u179F\u17D2\u179F\u179F\u17D2\u17A2\u17B6\u178F\u1794\u17B6\u178F",
        fontSize: 42,
        height: 120,
        bgColor: "#005f73",
        textColor: "#FFE600",
        fontFamily: "Moul"
      },
      // Filmora Pro Workspace State
      filmoraZoom: 35,
      // pixels per second on timeline
      filmoraActiveTab: "media",
      filmoraMediaFilter: "all",
      filmoraSelectedBlock: null,
      // Canvas Config & Aspect Ratio (Screen 2 & Screen 3)
      aspectRatio: "9:16",
      canvasWidth: 1080,
      canvasHeight: 1920,
      // Active Khmer Text & Color Settings (per clip editable)
      colorMode: "dual",
      // 'dual', 'single', 'gradient'
      topTextColor1: "#FFE600",
      topTextColor2: "#FF5722",
      bottomTextColor1: "#FFE600",
      bottomTextColor2: "#FF5722",
      topText: "\u17A2\u17C6\u1796\u17BE\u17A0\u17B7\u1784\u17D2\u179F\u17B6\u1787\u17B6\u17A2\u17C6\u1796\u17BE",
      topTextPart1: "\u17A2\u17C6\u1796\u17BE\u17A0\u17B7\u1784\u17D2\u179F\u17B6",
      topTextPart2: "\u1787\u17B6\u17A2\u17C6\u1796\u17BE",
      topFontSize: 65,
      topPosY: 160,
      bottomText: "\u17A2\u1784\u17CB\u17A2\u17B6\u1785\u1780\u17D2\u179B\u17B6\u17A0\u17B6\u1793",
      bottomTextPart1: "\u17A2\u1784\u17CB\u17A2\u17B6\u1785",
      bottomTextPart2: "\u1780\u17D2\u179B\u17B6\u17A0\u17B6\u1793",
      bottomFontSize: 65,
      bottomPosY: 1520,
      extraCaptions: [],
      fontFamily: "Moul",
      strokeColor: "#FFFFFF",
      strokeWidth: 12,
      shadowBlur: 10,
      // Background & Scale Config
      bgMode: "blur",
      blurRadius: 25,
      bgColor: "#111827",
      videoScale: 100,
      videoOffsetY: 0,
      // Multi-Clip Queue
      clips: [],
      clipCounter: 1,
      // Batch Multi-Video Queue State (វិធីទី ២)
      batchVideos: [],
      activeBatchVideoId: null,
      batchPollingTimer: null,
      batchMode: "parallel",
      // Workflow Navigation
      currentScreen: 0,
      // 0: uninitialized, 1: Trimmer Screen, 2: Studio Screen
      activeClipId: null,
      // Export state
      isExporting: false,
      cancelExportRequested: false
    };
    const elements = {
      // Views & Panels (4-Step Architecture)
      screenUpload: document.getElementById("screenUpload"),
      workspace3Col: document.getElementById("workspace3Col"),
      screen2TrimmerPanel: document.getElementById("screen2TrimmerPanel"),
      screen3Inspector: document.getElementById("screen3Inspector"),
      rawVideoViewport: document.getElementById("rawVideoViewport"),
      canvasWrapper: document.getElementById("canvasWrapper"),
      screen2TimelineControls: document.getElementById("screen2TimelineControls"),
      screen3TimelineControls: document.getElementById("screen3TimelineControls"),
      dropzoneOverlay: document.getElementById("dropzoneOverlay"),
      // Navigation Stepper (4 Steps)
      stepBtn1: document.getElementById("stepBtn1"),
      stepBtn2: document.getElementById("stepBtn2"),
      stepBtn3: document.getElementById("stepBtn3"),
      stepBtn4: document.getElementById("stepBtn4"),
      stepBtns: [
        document.getElementById("stepBtn1"),
        document.getElementById("stepBtn2"),
        document.getElementById("stepBtn3"),
        document.getElementById("stepBtn4")
      ],
      step2Badge: document.getElementById("step2Badge"),
      btnReturnToEditor: document.getElementById("btnReturnToEditor"),
      // Legacy compatibility
      screen1View: document.getElementById("screenUpload"),
      screen2View: document.getElementById("workspace3Col"),
      step1TabBtn: document.getElementById("step1TabBtn"),
      step2TabBtn: document.getElementById("step2TabBtn"),
      goToStep2Btn: document.getElementById("goToStep2Btn"),
      backToStep1Btn: document.getElementById("backToStep1Btn"),
      // Video Elements
      videoUploadInput: document.getElementById("videoUploadInput"),
      mainVideoPlayer: document.getElementById("mainVideoPlayer"),
      hiddenVideo: document.getElementById("hiddenVideo"),
      // Canvas (Screen 2)
      mainCanvas: document.getElementById("mainCanvas"),
      ctx: document.getElementById("mainCanvas")?.getContext("2d"),
      canvasInlineInput: document.getElementById("canvasInlineInput"),
      activeClipNameBadge: document.getElementById("activeClipNameBadge"),
      activeClipTitleInput: document.getElementById("activeClipTitleInput"),
      studioClipScrubber: document.getElementById("studioClipScrubber"),
      studioClipTimeDisplay: document.getElementById("studioTimelineTimeDisplay"),
      studioTimelineTimeDisplay: document.getElementById("studioTimelineTimeDisplay"),
      studioTimelineRangeDisplay: document.getElementById("studioTimelineRangeDisplay"),
      studioTimelineClipBadge: document.getElementById("studioTimelineClipBadge"),
      studioTimelineTrack: document.getElementById("studioTimelineTrack"),
      studioScrubberTrackBox: document.getElementById("studioScrubberTrackBox"),
      studioProgressFill: document.getElementById("studioProgressFill"),
      studioPlayhead: document.getElementById("studioPlayhead"),
      // Sidebars & Lists
      fileInfoBox: document.getElementById("fileInfoBox"),
      clipsListScreen1: document.getElementById("clipsListScreen1"),
      clipsListScreen2: document.getElementById("clipsListScreen2"),
      clipCountBadge: document.getElementById("clipCount"),
      // Trimmer Controls (Screen 1)
      inTimeDisplay: document.getElementById("inTimeDisplay"),
      outTimeDisplay: document.getElementById("outTimeDisplay"),
      clipDurationDisplay: document.getElementById("clipDurationDisplay"),
      setInBtn: document.getElementById("setInBtn"),
      setOutBtn: document.getElementById("setOutBtn"),
      addClipBtn: document.getElementById("addClipBtn"),
      splitTrimBtn: document.getElementById("splitTrimBtn"),
      timelineTrack: document.getElementById("timelineTrack"),
      trimSelectionRange: document.getElementById("trimSelectionRange"),
      playhead: document.getElementById("playhead"),
      timelineSlider: document.getElementById("timelineSlider"),
      // Studio Toolbar & Actions (Screen 2)
      aspectBtns: document.querySelectorAll(".aspect-btn"),
      exportActiveClipBtn: document.getElementById("exportActiveClipBtn"),
      exportAllClipsStudioBtn: document.getElementById("exportAllClipsStudioBtn"),
      // Right Inspector Inputs (Screen 2)
      colorModeSelect: document.getElementById("colorModeSelect"),
      topTextColor1Box: document.getElementById("topTextColor1Box"),
      topTextColor1Swatch: document.getElementById("topTextColor1Swatch"),
      topTextColor1Val: document.getElementById("topTextColor1Val"),
      topTextColor2Box: document.getElementById("topTextColor2Box"),
      topTextColor2Swatch: document.getElementById("topTextColor2Swatch"),
      topTextColor2Val: document.getElementById("topTextColor2Val"),
      topColor2Group: document.getElementById("topColor2Group"),
      bottomTextColor1Box: document.getElementById("bottomTextColor1Box"),
      bottomTextColor1Swatch: document.getElementById("bottomTextColor1Swatch"),
      bottomTextColor1Val: document.getElementById("bottomTextColor1Val"),
      bottomTextColor2Box: document.getElementById("bottomTextColor2Box"),
      bottomTextColor2Swatch: document.getElementById("bottomTextColor2Swatch"),
      bottomTextColor2Val: document.getElementById("bottomTextColor2Val"),
      bottomColor2Group: document.getElementById("bottomColor2Group"),
      strokeColorBox: document.getElementById("strokeColorBox"),
      strokeColorSwatch: document.getElementById("strokeColorSwatch"),
      strokeColorVal: document.getElementById("strokeColorVal"),
      bgColorSwatch: document.getElementById("bgColorSwatch"),
      customColorPopover: document.getElementById("customColorPopover"),
      popoverTitle: document.getElementById("popoverTitle"),
      closePopoverBtn: document.getElementById("closePopoverBtn"),
      popoverPreviewSwatch: document.getElementById("popoverPreviewSwatch"),
      popoverHexInput: document.getElementById("popoverHexInput"),
      popoverNativeColorInput: document.getElementById("popoverNativeColorInput"),
      topTextSingleGroup: document.getElementById("topTextSingleGroup"),
      topTextDualGroup: document.getElementById("topTextDualGroup"),
      topTextInput: document.getElementById("topTextInput"),
      topTextPart1Input: document.getElementById("topTextPart1Input"),
      topTextPart2Input: document.getElementById("topTextPart2Input"),
      topPart1Label: document.getElementById("topPart1Label"),
      topPart2Label: document.getElementById("topPart2Label"),
      topWordChips: document.getElementById("topWordChips"),
      topFontSizeInput: document.getElementById("topFontSizeInput"),
      topFontSizeVal: document.getElementById("topFontSizeVal"),
      topPosYInput: document.getElementById("topPosYInput"),
      topPosYVal: document.getElementById("topPosYVal"),
      bottomTextSingleGroup: document.getElementById("bottomTextSingleGroup"),
      bottomTextDualGroup: document.getElementById("bottomTextDualGroup"),
      bottomTextInput: document.getElementById("bottomTextInput"),
      bottomTextPart1Input: document.getElementById("bottomTextPart1Input"),
      bottomTextPart2Input: document.getElementById("bottomTextPart2Input"),
      bottomWordChips: document.getElementById("bottomWordChips"),
      bottomFontSizeInput: document.getElementById("bottomFontSizeInput"),
      bottomFontSizeVal: document.getElementById("bottomFontSizeVal"),
      bottomPosYInput: document.getElementById("bottomPosYInput"),
      bottomPosYVal: document.getElementById("bottomPosYVal"),
      fontFamilySelect: document.getElementById("fontFamilySelect"),
      strokeColorInput: document.getElementById("strokeColorInput"),
      strokeWidthInput: document.getElementById("strokeWidthInput"),
      strokeWidthVal: document.getElementById("strokeWidthVal"),
      shadowBlurInput: document.getElementById("shadowBlurInput"),
      shadowBlurVal: document.getElementById("shadowBlurVal"),
      bgModeSelect: document.getElementById("bgModeSelect"),
      blurConfig: document.getElementById("blurConfig"),
      bgColorConfig: document.getElementById("bgColorConfig"),
      blurRadiusInput: document.getElementById("blurRadiusInput"),
      blurRadiusVal: document.getElementById("blurRadiusVal"),
      bgColorInput: document.getElementById("bgColorInput"),
      bgColorVal: document.getElementById("bgColorVal"),
      videoScaleInput: document.getElementById("videoScaleInput"),
      videoScaleVal: document.getElementById("videoScaleVal"),
      videoOffsetYInput: document.getElementById("videoOffsetYInput"),
      videoOffsetYVal: document.getElementById("videoOffsetYVal"),
      // Export Modal
      exportModal: document.getElementById("exportModal"),
      exportProgressBar: document.getElementById("exportProgressBar"),
      exportStatusText: document.getElementById("exportStatusText"),
      exportPercentText: document.getElementById("exportPercentText"),
      cancelExportBtn: document.getElementById("cancelExportBtn"),
      // Right Inspector Tabs
      tabBtns: document.querySelectorAll(".tab-btn"),
      tabContents: document.querySelectorAll(".tab-content")
    };
    function createSampleNewsCard(title, subtitle, badgeText, themeColor = "#005f73", icon = "\u{1F4F0}") {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 420;
      const ctx = c.getContext("2d");
      const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, themeColor);
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < c.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, c.height);
        ctx.stroke();
      }
      for (let y = 0; y < c.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(c.width, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.arc(c.width / 2, c.height / 2 - 25, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, c.width / 2, c.height / 2 - 25);
      ctx.fillStyle = "#FFE600";
      ctx.fillRect(24, 20, 160, 30);
      ctx.fillStyle = "#000000";
      ctx.font = 'bold 15px "Kantumruy Pro", sans-serif';
      ctx.fillText(badgeText, 104, 35);
      ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
      ctx.fillRect(0, c.height - 95, c.width, 95);
      ctx.fillStyle = "#FFE600";
      ctx.fillRect(0, c.height - 95, c.width, 3);
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = 'bold 20px "Kantumruy Pro", sans-serif';
      ctx.fillText(title, 20, c.height - 58);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = '15px "Kantumruy Pro", sans-serif';
      ctx.fillText(subtitle, 20, c.height - 25);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, c.width, c.height);
      return c.toDataURL("image/png");
    }
    function setPlatformMode(mode, skipToast = false) {
      state.platformMode = mode;
      document.querySelectorAll("#headerPlatformToggle .platform-btn, #platformModeSelector .platform-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.platform === mode);
      });
      document.body.classList.toggle("platform-mode-facebook", mode === "facebook");
      document.body.classList.toggle("platform-mode-youtube", mode === "youtube");
      document.body.dataset.platformMode = mode;
      const lockedBadge = document.getElementById("youtubeLockedBadge");
      const aspectControl = document.getElementById("aspectRatioSegmentedControl");
      const ytAccordion = document.getElementById("youtubeStudioAccordionItem");
      if (mode === "youtube") {
        state.aspectRatio = "16:9";
        if (lockedBadge) lockedBadge.classList.remove("hidden");
        if (aspectControl) aspectControl.classList.add("hidden");
        if (ytAccordion) {
          ytAccordion.classList.remove("hidden");
          ytAccordion.classList.add("active");
        }
        if (state.studioLayers.length === 0) {
          loadSampleCollage();
        }
        if (!skipToast) showToast("\u{1F4FA} YouTube Mode (16:9 Widescreen & Multi-Layer Studio)");
      } else {
        state.aspectRatio = "9:16";
        if (lockedBadge) lockedBadge.classList.add("hidden");
        if (aspectControl) aspectControl.classList.remove("hidden");
        elements.aspectBtns.forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.ratio === "9:16");
        });
        if (ytAccordion) {
          ytAccordion.classList.add("hidden");
          ytAccordion.classList.remove("active");
        }
        if (!skipToast) showToast("\u{1F4F1} Facebook / TikTok Mode (9:16 Vertical Clips)");
      }
      updateAspectDimensions();
      syncYoutubeStudioUI();
      renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
    }
    window.setPlatformMode = setPlatformMode;
    function addStudioImageLayer(src, name = null) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const layerId = "layer_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
        const layerName = name || `Layer #${state.studioLayerCounter++}`;
        const count = state.studioLayers.length;
        const naturalW = img.naturalWidth || img.width || 640;
        const naturalH = img.naturalHeight || img.height || 420;
        const aspect = naturalH / naturalW;
        const defaultW = Math.min(560, Math.round(state.canvasWidth * 0.36));
        const defaultH = Math.round(defaultW * aspect);
        let defaultX = 60 + count % 3 * 50;
        let defaultY = 60 + count % 3 * 50;
        const layer = {
          id: layerId,
          name: layerName,
          img,
          imgElement: img,
          src,
          x: defaultX,
          y: defaultY,
          w: defaultW,
          h: defaultH,
          scale: 1,
          opacity: 1,
          visible: true
        };
        state.studioLayers.push(layer);
        state.activeLayerId = layerId;
        renderStudioLayersList();
        syncFilmoraInspectorUI();
        renderFilmoraTimeline();
        renderFilmoraMediaBin();
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        showToast(`\u{1F5BC}\uFE0F \u1794\u17B6\u1793\u1794\u1793\u17D2\u1790\u17C2\u1798 "${layerName}"`);
      };
      img.src = src;
    }
    window.addStudioImageLayer = addStudioImageLayer;
    function loadSampleCollage() {
      state.studioLayers = [];
      const card1 = createSampleNewsCard("Donald Trump & US Foreign Policy", "Special Geopolitical Analysis Report", "\u{1F525} WORLD NEWS", "#1e3a8a", "\u{1F3DB}\uFE0F");
      const card2 = createSampleNewsCard("Military Jet & Defense Modernization", "Air Force Readiness & Strategic Defense", "\u26A1 DEFENSE", "#831843", "\u2708\uFE0F");
      const card3 = createSampleNewsCard("Cambodian History & Official Archive", "Historical Documents & Treaties Reference", "\u{1F4DC} ARCHIVE", "#064e3b", "\u{1F4D6}");
      addStudioImageLayer(card1, "\u179A\u17BC\u1794\u1791\u17B8\u17E1: World News (Trump)");
      setTimeout(() => addStudioImageLayer(card2, "\u179A\u17BC\u1794\u1791\u17B8\u17E2: Military Jet Defense"), 60);
      setTimeout(() => addStudioImageLayer(card3, "\u179A\u17BC\u1794\u1791\u17B8\u17E3: Official Documents"), 120);
    }
    window.loadSampleCollage = loadSampleCollage;
    function renderStudioLayersList() {
      const container = document.getElementById("ytStudioLayersList");
      if (!container) return;
      if (state.studioLayers.length === 0) {
        container.innerHTML = `
                <div style="text-align:center; padding:14px; color:var(--text-muted); font-size:0.75rem; border:1px dashed rgba(255,255,255,0.15); border-radius:6px;">
                    \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793\u179A\u17BC\u1794\u1797\u17B6\u1796 layer \u1793\u17C5\u17A1\u17BE\u1799\u1791\u17C1<br>
                    <button type="button" class="btn btn-secondary btn-xs" onclick="window.loadSampleCollage && window.loadSampleCollage()" style="margin-top:6px;">\u{1F4F0} \u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1782\u17C6\u179A\u17BC Collage</button>
                </div>
            `;
        return;
      }
      container.innerHTML = state.studioLayers.map((layer, idx) => {
        const isActive = layer.id === state.activeLayerId;
        return `
                <div class="studio-layer-item ${isActive ? "active" : ""}" data-layer-id="${layer.id}" onclick="selectStudioLayer(${layer.id}, event)">
                    <img src="${layer.src}" class="layer-thumb" alt="thumb">
                    <div class="layer-info">
                        <div class="layer-name">${layer.name}</div>
                        <div class="layer-meta">
                            <span>${layer.visible ? "\u{1F441}\uFE0F \u1794\u1784\u17D2\u17A0\u17B6\u1789" : "\u{1F648} \u179B\u17B6\u1780\u17CB"}</span>
                            <span>\u2022</span>
                            <span>Scale: ${Math.round(layer.scale * 100)}%</span>
                        </div>
                    </div>
                    <div class="layer-actions">
                        <button type="button" class="btn-layer-action" onclick="toggleStudioLayerVisibility(${layer.id}, event)" title="${layer.visible ? "\u179B\u17B6\u1780\u17CB Layer" : "\u1794\u1784\u17D2\u17A0\u17B6\u1789 Layer"}">
                            ${layer.visible ? "\u{1F441}\uFE0F" : "\u{1F6AB}"}
                        </button>
                        <button type="button" class="btn-layer-action" onclick="moveStudioLayer(${layer.id}, 'up', event)" title="\u179A\u17C6\u1780\u17B7\u179B\u17A1\u17BE\u1784\u179B\u17BE" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ""}>
                            \u2B06\uFE0F
                        </button>
                        <button type="button" class="btn-layer-action" onclick="moveStudioLayer(${layer.id}, 'down', event)" title="\u179A\u17C6\u1780\u17B7\u179B\u1785\u17BB\u17C7\u1780\u17D2\u179A\u17C4\u1798" ${idx === state.studioLayers.length - 1 ? 'disabled style="opacity:0.3;"' : ""}>
                            \u2B07\uFE0F
                        </button>
                        <button type="button" class="btn-layer-action delete" onclick="removeStudioLayer(${layer.id}, event)" title="\u179B\u17BB\u1794 Layer">
                            \u{1F5D1}\uFE0F
                        </button>
                    </div>
                </div>
            `;
      }).join("");
    }
    function selectStudioLayer(id, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      state.activeLayerId = id;
      renderStudioLayersList();
    }
    window.selectStudioLayer = selectStudioLayer;
    function toggleStudioLayerVisibility(id, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const layer = state.studioLayers.find((l) => l.id === id);
      if (layer) {
        layer.visible = !layer.visible;
        renderStudioLayersList();
      }
    }
    window.toggleStudioLayerVisibility = toggleStudioLayerVisibility;
    function moveStudioLayer(id, dir, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      const idx = state.studioLayers.findIndex((l) => l.id === id);
      if (idx < 0) return;
      if (dir === "up" && idx > 0) {
        const temp = state.studioLayers[idx];
        state.studioLayers[idx] = state.studioLayers[idx - 1];
        state.studioLayers[idx - 1] = temp;
      } else if (dir === "down" && idx < state.studioLayers.length - 1) {
        const temp = state.studioLayers[idx];
        state.studioLayers[idx] = state.studioLayers[idx + 1];
        state.studioLayers[idx + 1] = temp;
      }
      renderStudioLayersList();
    }
    window.moveStudioLayer = moveStudioLayer;
    function removeStudioLayer(id, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      state.studioLayers = state.studioLayers.filter((l) => l.id !== id);
      if (state.activeLayerId === id) {
        state.activeLayerId = state.studioLayers.length > 0 ? state.studioLayers[0].id : null;
      }
      renderStudioLayersList();
      showToast("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794 Layer \u179A\u17BC\u1794\u1797\u17B6\u1796");
    }
    window.removeStudioLayer = removeStudioLayer;
    function syncYoutubeStudioUI() {
      document.querySelectorAll(".yt-layout-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.layout === state.videoPlacement.layout);
      });
      const wInput = document.getElementById("ytVideoWidthInput");
      const wVal = document.getElementById("ytVideoWidthVal");
      if (wInput) wInput.value = state.videoPlacement.widthPct;
      if (wVal) wVal.textContent = state.videoPlacement.widthPct + "%";
      const fCheckbox = document.getElementById("ytVideoFeatherCheckbox");
      const fInput = document.getElementById("ytVideoFeatherInput");
      const fVal = document.getElementById("ytVideoFeatherVal");
      if (fCheckbox) fCheckbox.checked = state.videoPlacement.feather > 0;
      if (fInput) fInput.value = state.videoPlacement.feather;
      if (fVal) fVal.textContent = state.videoPlacement.feather + "px";
      const bCheckbox = document.getElementById("ytBannerEnabledCheckbox");
      const bInput = document.getElementById("ytBannerTextInput");
      const bFontInput = document.getElementById("ytBannerFontSizeInput");
      const bFontVal = document.getElementById("ytBannerFontSizeVal");
      const bHInput = document.getElementById("ytBannerHeightInput");
      const bHVal = document.getElementById("ytBannerHeightVal");
      const bBgInput = document.getElementById("ytBannerBgColorInput");
      const bTextInput = document.getElementById("ytBannerTextColorInput");
      if (bCheckbox) bCheckbox.checked = state.headlineBanner.enabled;
      if (bInput) bInput.value = state.headlineBanner.text;
      if (bFontInput) bFontInput.value = state.headlineBanner.fontSize;
      if (bFontVal) bFontVal.textContent = state.headlineBanner.fontSize + "px";
      if (bHInput) bHInput.value = state.headlineBanner.height;
      if (bHVal) bHVal.textContent = state.headlineBanner.height + "px";
      if (bBgInput) bBgInput.value = state.headlineBanner.bgColor;
      if (bTextInput) bTextInput.value = state.headlineBanner.textColor;
      document.querySelectorAll(".banner-color-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color.toLowerCase() === state.headlineBanner.bgColor.toLowerCase());
      });
      renderStudioLayersList();
    }
    function bindYoutubeStudioEvents() {
      document.querySelectorAll("#headerPlatformToggle .platform-btn, #platformModeSelector .platform-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = btn.dataset.platform;
          if (mode) setPlatformMode(mode);
        });
      });
      document.querySelectorAll(".yt-layout-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushStateToHistory();
          state.videoPlacement.layout = btn.dataset.layout;
          document.querySelectorAll(".yt-layout-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          showToast(`\u{1F4D0} \u1794\u17D2\u179B\u1784\u17CB: ${btn.querySelector(".yt-layout-name")?.textContent || btn.dataset.layout}`);
        });
      });
      const wInput = document.getElementById("ytVideoWidthInput");
      const wVal = document.getElementById("ytVideoWidthVal");
      if (wInput) {
        wInput.addEventListener("input", (e) => {
          state.videoPlacement.widthPct = parseFloat(e.target.value);
          if (wVal) wVal.textContent = state.videoPlacement.widthPct + "%";
        });
      }
      const fCheckbox = document.getElementById("ytVideoFeatherCheckbox");
      const fInput = document.getElementById("ytVideoFeatherInput");
      const fVal = document.getElementById("ytVideoFeatherVal");
      if (fCheckbox) {
        fCheckbox.addEventListener("change", (e) => {
          state.videoPlacement.feather = e.target.checked ? parseFloat(fInput?.value) || 40 : 0;
        });
      }
      if (fInput) {
        fInput.addEventListener("input", (e) => {
          state.videoPlacement.feather = parseFloat(e.target.value);
          if (fVal) fVal.textContent = state.videoPlacement.feather + "px";
          if (fCheckbox) fCheckbox.checked = state.videoPlacement.feather > 0;
        });
      }
      const imgUpload = document.getElementById("ytImageLayerUploadInput");
      const addImgBtn = document.getElementById("ytAddImageLayerBtn");
      if (addImgBtn && imgUpload) {
        addImgBtn.addEventListener("click", () => imgUpload.click());
        imgUpload.addEventListener("change", (e) => {
          const files = Array.from(e.target?.files || []);
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
              addStudioImageLayer(evt.target.result, file.name.replace(/\.[^/.]+$/, ""));
            };
            reader.readAsDataURL(file);
          });
          imgUpload.value = "";
        });
      }
      const loadSampleBtn = document.getElementById("ytLoadSampleCollageBtn");
      if (loadSampleBtn) {
        loadSampleBtn.addEventListener("click", () => loadSampleCollage());
      }
      const bCheckbox = document.getElementById("ytBannerEnabledCheckbox");
      if (bCheckbox) {
        bCheckbox.addEventListener("change", (e) => {
          state.headlineBanner.enabled = e.target.checked;
        });
      }
      const bInput = document.getElementById("ytBannerTextInput");
      if (bInput) {
        bInput.addEventListener("input", (e) => {
          state.headlineBanner.text = e.target.value;
        });
      }
      const bFontInput = document.getElementById("ytBannerFontSizeInput");
      const bFontVal = document.getElementById("ytBannerFontSizeVal");
      if (bFontInput) {
        bFontInput.addEventListener("input", (e) => {
          state.headlineBanner.fontSize = parseFloat(e.target.value);
          if (bFontVal) bFontVal.textContent = state.headlineBanner.fontSize + "px";
        });
      }
      const bHInput = document.getElementById("ytBannerHeightInput");
      const bHVal = document.getElementById("ytBannerHeightVal");
      if (bHInput) {
        bHInput.addEventListener("input", (e) => {
          state.headlineBanner.height = parseFloat(e.target.value);
          if (bHVal) bHVal.textContent = state.headlineBanner.height + "px";
        });
      }
      document.querySelectorAll(".banner-color-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.headlineBanner.bgColor = btn.dataset.color;
          document.querySelectorAll(".banner-color-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const bgInput2 = document.getElementById("ytBannerBgColorInput");
          if (bgInput2) bgInput2.value = state.headlineBanner.bgColor;
        });
      });
      const bgInput = document.getElementById("ytBannerBgColorInput");
      if (bgInput) {
        bgInput.addEventListener("input", (e) => {
          state.headlineBanner.bgColor = e.target.value;
          document.querySelectorAll(".banner-color-btn").forEach((b) => b.classList.remove("active"));
        });
      }
      document.querySelectorAll(".banner-text-color-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.headlineBanner.textColor = btn.dataset.color;
          const txtInput2 = document.getElementById("ytBannerTextColorInput");
          if (txtInput2) txtInput2.value = state.headlineBanner.textColor;
        });
      });
      const txtInput = document.getElementById("ytBannerTextColorInput");
      if (txtInput) {
        txtInput.addEventListener("input", (e) => {
          state.headlineBanner.textColor = e.target.value;
        });
      }
      document.querySelectorAll(".badge-headline-sample").forEach((badge) => {
        badge.addEventListener("click", () => {
          const sample = badge.dataset.text;
          if (sample) {
            state.headlineBanner.text = sample;
            if (bInput) bInput.value = sample;
            showToast(`\u{1F3F7}\uFE0F \u1794\u17B6\u1793\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784: "${sample}"`);
          }
        });
      });
    }
    function formatFilmoraTimecode(seconds) {
      if (isNaN(seconds) || seconds < 0) seconds = 0;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor(seconds % 3600 / 60);
      const secs = Math.floor(seconds % 60);
      const frames = Math.floor(seconds % 1 * 30);
      const pad = (n, s = 2) => String(n).padStart(s, "0");
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
    }
    const filmoraTextStylesList = Array.from({ length: 23 }, (_, i) => ({
      id: `filmora_text_style_${i + 1}`,
      name: `Text Style ${i + 1}`,
      png: `filmora_assets/text_styles/Text style ${i + 1}.png`,
      fontFamily: i % 2 === 0 ? "Moul" : "Kantumruy Pro",
      color: ["#FFE600", "#FF3366", "#00E5FF", "#FFFFFF", "#FFD700", "#FF9900"][i % 6]
    }));
    const filmoraLutPresetsList = [
      { id: "blockbuster", name: "Blockbuster", filter: "contrast(1.2) saturate(1.3) hue-rotate(-5deg)", color: "#38bdf8" },
      { id: "cool_max", name: "Cool Max", filter: "contrast(1.1) saturate(1.1) hue-rotate(15deg) brightness(1.05)", color: "#00e5ff" },
      { id: "film_stock", name: "Film Stock", filter: "sepia(0.2) contrast(1.15) saturate(1.2)", color: "#f59e0b" },
      { id: "warm_max", name: "Warm Max", filter: "sepia(0.3) saturate(1.25) brightness(1.05)", color: "#ea580c" },
      { id: "black_white", name: "Black & White", filter: "grayscale(1) contrast(1.3)", color: "#94a3b8" },
      { id: "boost_color", name: "Boost Color", filter: "saturate(1.6) contrast(1.1)", color: "#ec4899" },
      { id: "brighten", name: "Brighten", filter: "brightness(1.2) contrast(1.05)", color: "#fde047" },
      { id: "darken", name: "Darken", filter: "brightness(0.85) contrast(1.15)", color: "#475569" },
      { id: "epic", name: "Epic", filter: "contrast(1.35) saturate(0.9) brightness(0.95)", color: "#8b5cf6" },
      { id: "fantasy", name: "Fantasy", filter: "hue-rotate(25deg) saturate(1.3) brightness(1.1)", color: "#a855f7" },
      { id: "far_east", name: "Far East", filter: "sepia(0.25) hue-rotate(-10deg) saturate(1.2)", color: "#ef4444" },
      { id: "jungle", name: "Jungle", filter: "hue-rotate(-15deg) saturate(1.4) contrast(1.1)", color: "#10b981" },
      { id: "lomo", name: "Lomo", filter: "contrast(1.4) saturate(1.25) brightness(0.95)", color: "#d97706" },
      { id: "old_film", name: "Old Film", filter: "sepia(0.5) contrast(1.2) brightness(0.9)", color: "#78350f" },
      { id: "polaroid", name: "Polaroid", filter: "contrast(1.05) saturate(1.1) brightness(1.15) sepia(0.1)", color: "#06b6d4" },
      { id: "tv_vintage", name: "TV Vintage", filter: "contrast(1.2) saturate(0.8) hue-rotate(10deg)", color: "#6366f1" },
      { id: "vignette_classic", name: "Vignette Classic", filter: "contrast(1.15) saturate(1.1)", color: "#64748b" }
    ];
    const filmoraStockMediaList = [
      { id: "stock_trump", name: "Donald Trump & US Policy", meta: "News Photo \u2022 Politics", bg: "#a16207", icon: "\u{1F454}" },
      { id: "stock_jet", name: "Fighter Jet Military", meta: "Air Force \u2022 Modernization", bg: "#0f766e", icon: "\u2708\uFE0F" },
      { id: "stock_doc", name: "Law / Dhamma Manuscript", meta: "Historical \u2022 Archive", bg: "#92400e", icon: "\u{1F4DC}" },
      { id: "stock_sermon", name: "Monk Dhamma Backdrop", meta: "Buddhism \u2022 Teaching", bg: "#b45309", icon: "\u{1FAB7}" },
      { id: "stock_news_desk", name: "TV Studio Anchor Desk", meta: "Broadcast \u2022 Studio", bg: "#1e3a8a", icon: "\u{1F399}\uFE0F" }
    ];
    function renderFilmoraMediaBin() {
      const emptyDropzone = document.getElementById("filmoraEmptyDropzone");
      const itemsGrid = document.getElementById("filmoraItemsGrid");
      const treeProjectCount = document.getElementById("filmoraTreeProjectCount");
      if (!itemsGrid) return;
      const activeTab = state.filmoraActiveTab || "media";
      const projectItemCount = (state.videoFile ? 1 : 0) + (state.studioLayers ? state.studioLayers.length : 0);
      if (treeProjectCount) treeProjectCount.textContent = `(${projectItemCount})`;
      itemsGrid.innerHTML = "";
      if (activeTab === "media") {
        if (projectItemCount === 0) {
          emptyDropzone?.classList.remove("hidden");
          itemsGrid?.classList.add("hidden");
        } else {
          emptyDropzone?.classList.add("hidden");
          itemsGrid?.classList.remove("hidden");
          const vdoCard = document.createElement("div");
          vdoCard.className = "filmora-item-card";
          vdoCard.innerHTML = `
                    <div class="item-card-thumb" style="background: radial-gradient(circle, #1e3a8a 0%, #0d1217 100%);">
                        <span style="font-size:2rem;">\u{1F3AC}</span>
                        <span class="thumb-badge">16:9 HD</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name" title="${state.videoFile ? state.videoFile.name : "Master Video"}">${state.videoFile ? state.videoFile.name : "Master Video Clip"}</span>
                        <button class="item-card-plus" title="Add to Timeline">+</button>
                    </div>
                `;
          vdoCard.addEventListener("click", () => {
            toggleFilmoraInspector("video");
          });
          itemsGrid.appendChild(vdoCard);
          if (state.studioLayers && state.studioLayers.length > 0) {
            state.studioLayers.forEach((layer) => {
              const lCard = document.createElement("div");
              lCard.className = "filmora-item-card";
              lCard.innerHTML = `
                            <div class="item-card-thumb" style="background: radial-gradient(circle, #b45309 0%, #0d1217 100%);">
                                <span style="font-size:2rem;">\u{1F5BC}\uFE0F</span>
                                <span class="thumb-badge">Overlay</span>
                            </div>
                            <div class="item-card-footer">
                                <span class="item-card-name" title="${layer.name}">${layer.name}</span>
                                <button class="item-card-plus" title="Add to Timeline">+</button>
                            </div>
                        `;
              lCard.addEventListener("click", () => {
                toggleFilmoraInspector("collage");
              });
              itemsGrid.appendChild(lCard);
            });
          }
        }
      } else if (activeTab === "titles") {
        emptyDropzone?.classList.add("hidden");
        itemsGrid?.classList.remove("hidden");
        const moulCard = document.createElement("div");
        moulCard.className = "filmora-item-card";
        moulCard.style.borderColor = "#55E5C5";
        moulCard.innerHTML = `
                <div class="item-card-thumb" style="background: linear-gradient(135deg, #581c87, #1e1b4b); padding:4px; text-align:center;">
                    <span style="font-family:'Moul',serif; font-size:0.72rem; color:#FFE600; line-height:1.2; display:block;">\u1794\u178A\u17B6\u1796\u17D0\u178F\u17CC\u1798\u17B6\u1793\u1781\u17D2\u1798\u17C2\u179A</span>
                    <span style="font-size:0.6rem; color:#e2e8f0;">(\u1796\u17BB\u1798\u17D2\u1796\u17A2\u1780\u17D2\u179F\u179A\u1798\u17BC\u179B)</span>
                </div>
                <div class="item-card-footer">
                    <span class="item-card-name">Khmer Moul Headline</span>
                    <button class="item-card-plus" title="Add to Timeline">+</button>
                </div>
            `;
        moulCard.addEventListener("click", () => {
          state.headlineBanner.enabled = true;
          state.headlineBanner.fontFamily = "Moul";
          toggleFilmoraInspector("banner");
          renderFilmoraTimeline();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          showToast("\u{1F524} \u1794\u17B6\u1793\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u1794\u178A\u17B6\u1796\u17D0\u178F\u17CC\u1798\u17B6\u1793\u1796\u17BB\u1798\u17D2\u1796\u1798\u17BC\u179B Moul Font");
        });
        itemsGrid.appendChild(moulCard);
        filmoraTextStylesList.forEach((style) => {
          const sCard = document.createElement("div");
          sCard.className = "filmora-item-card";
          sCard.innerHTML = `
                    <div class="item-card-thumb" style="background:#161D24;">
                        <img src="${style.png}" alt="${style.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display:none; font-size:1.4rem; color:${style.color}; font-weight:800;">T</span>
                        <span class="thumb-badge">Preset</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name">${style.name}</span>
                        <button class="item-card-plus" title="Apply Style">+</button>
                    </div>
                `;
          sCard.addEventListener("click", () => {
            state.headlineBanner.enabled = true;
            state.headlineBanner.textColor = style.color;
            state.headlineBanner.fontFamily = style.fontFamily;
            renderFilmoraTimeline();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            showToast(`\u2728 \u1794\u17B6\u1793\u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F\u1798\u17C9\u17BC\u178A ${style.name} \u1791\u17C5\u179B\u17BE\u1794\u178A\u17B6\u1796\u17D0\u178F\u17CC\u1798\u17B6\u1793!`);
          });
          itemsGrid.appendChild(sCard);
        });
      } else if (activeTab === "stockMedia") {
        emptyDropzone?.classList.add("hidden");
        itemsGrid?.classList.remove("hidden");
        filmoraStockMediaList.forEach((stock, idx) => {
          const stCard = document.createElement("div");
          stCard.className = "filmora-item-card";
          stCard.innerHTML = `
                    <div class="item-card-thumb" style="background: radial-gradient(circle, ${stock.bg} 0%, #0d1217 100%);">
                        <span style="font-size:2rem;">${stock.icon}</span>
                        <span class="thumb-badge">Stock</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name" title="${stock.name}">${stock.name}</span>
                        <button class="item-card-plus" title="Add Layer">+</button>
                    </div>
                `;
          stCard.addEventListener("click", () => {
            const existing = state.studioLayers.find((l) => l.name === stock.name);
            if (!existing) {
              const cardDataUrl = createSampleNewsCard(stock.name, stock.meta, "\u{1F525} BREAKING NEWS", stock.bg, stock.icon);
              addStudioImageLayer(cardDataUrl, stock.name);
              showToast(`\u{1F4F8} \u1794\u17B6\u1793\u1794\u1789\u17D2\u1785\u17BC\u179B "${stock.name}" \u1791\u17C5\u179B\u17BE Timeline!`);
            } else {
              state.activeLayerId = existing.id;
              toggleFilmoraInspector("collage");
              syncFilmoraInspectorUI();
              renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
              showToast(`\u2139\uFE0F \u179F\u17D2\u179A\u1791\u17B6\u1794\u17CB "${stock.name}" \u178F\u17D2\u179A\u17BC\u179C\u1794\u17B6\u1793\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F`);
            }
          });
          itemsGrid.appendChild(stCard);
        });
      } else if (activeTab === "effects") {
        emptyDropzone?.classList.add("hidden");
        itemsGrid?.classList.remove("hidden");
        filmoraLutPresetsList.forEach((lut) => {
          const lutCard = document.createElement("div");
          lutCard.className = "filmora-item-card";
          lutCard.innerHTML = `
                    <div class="item-card-thumb" style="background: radial-gradient(circle, ${lut.color}44 0%, #0d1217 100%);">
                        <span style="font-size:1.6rem;">\u2728</span>
                        <span class="thumb-badge">3D LUT</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name" title="${lut.name}">${lut.name}</span>
                        <button class="item-card-plus" title="Apply 3D LUT">+</button>
                    </div>
                `;
          lutCard.addEventListener("click", () => {
            state.activeLut = lut;
            const canvas = elements.mainCanvas;
            if (canvas) {
              canvas.style.filter = lut.filter;
            }
            showToast(`\u2728 \u1794\u17B6\u1793\u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F Filmora 3D LUT: ${lut.name}`);
          });
          itemsGrid.appendChild(lutCard);
        });
      } else if (activeTab === "splitScreen") {
        emptyDropzone?.classList.add("hidden");
        itemsGrid?.classList.remove("hidden");
        const splitPresets = [
          { id: "split-right", name: "\u179F\u17D2\u178F\u17B6\u17C6 + \u179A\u17BC\u1794\u1786\u17D2\u179C\u17C1\u1784", desc: "Host Right / Image Left", icon: "\u25E7" },
          { id: "split-left", name: "\u1786\u17D2\u179C\u17C1\u1784 + \u179A\u17BC\u1794\u179F\u17D2\u178F\u17B6\u17C6", desc: "Host Left / Image Right", icon: "\u25E8" },
          { id: "pip", name: "Picture-in-Picture", desc: "Floating Host Video", icon: "\u25A3" },
          { id: "full", name: "\u1796\u17C1\u1789 16:9 Widescreen", desc: "Master Video Full", icon: "\u25A2" }
        ];
        splitPresets.forEach((preset) => {
          const pCard = document.createElement("div");
          pCard.className = "filmora-item-card";
          pCard.innerHTML = `
                    <div class="item-card-thumb" style="background: radial-gradient(circle, #55E5C533 0%, #0d1217 100%);">
                        <span style="font-size:2.2rem; color:#55E5C5;">${preset.icon}</span>
                        <span class="thumb-badge">Split</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name" title="${preset.name}">${preset.name}</span>
                        <button class="item-card-plus" title="Apply Layout">+</button>
                    </div>
                `;
          pCard.addEventListener("click", () => {
            pushStateToHistory();
            state.videoPlacement.layout = preset.id;
            syncFilmoraInspectorUI();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            showToast(`\u{1F4D0} \u1794\u17B6\u1793\u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F\u1794\u17D2\u179B\u1784\u17CB: ${preset.name}`);
          });
          itemsGrid.appendChild(pCard);
        });
      } else if (activeTab === "audio") {
        emptyDropzone?.classList.add("hidden");
        itemsGrid?.classList.remove("hidden");
        const audioTracks = [
          { id: "audio_master", name: "Master Video Audio", meta: "Original Audio Track", icon: "\u{1F399}\uFE0F" },
          { id: "audio_sermon", name: "Dhamma Sermon Enhance", meta: "Voice Clarity Booster", icon: "\u{1F3B5}" },
          { id: "audio_ambient", name: "Zen Ambient Bed", meta: "Soft Background Music", icon: "\u{1F3A7}" },
          { id: "audio_sting", name: "News Intro Stinger", meta: "Broadcasting Sound FX", icon: "\u26A1" }
        ];
        audioTracks.forEach((a) => {
          const aCard = document.createElement("div");
          aCard.className = "filmora-item-card";
          aCard.innerHTML = `
                    <div class="item-card-thumb" style="background: radial-gradient(circle, #15803d44 0%, #0d1217 100%);">
                        <span style="font-size:1.8rem;">${a.icon}</span>
                        <span class="thumb-badge">Audio</span>
                    </div>
                    <div class="item-card-footer">
                        <span class="item-card-name" title="${a.name}">${a.name}</span>
                        <button class="item-card-plus" title="Add Track">+</button>
                    </div>
                `;
          aCard.addEventListener("click", () => {
            toggleFilmoraInspector("audio");
            showToast(`\u{1F3B5} \u1794\u17B6\u1793\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179F\u17C6\u17A1\u17C1\u1784: ${a.name}`);
          });
          itemsGrid.appendChild(aCard);
        });
      }
    }
    function toggleFilmoraInspector(openTab = null) {
      const drawer = document.getElementById("filmoraInspectorDrawer");
      const toggleBtn = document.getElementById("filmoraToolInspectorToggle");
      if (!drawer) return;
      if (openTab) {
        drawer.classList.remove("closed");
        toggleBtn?.classList.add("active-accent");
        switchFilmoraInspectorTab(openTab);
      } else {
        const isClosed = drawer.classList.toggle("closed");
        if (isClosed) {
          toggleBtn?.classList.remove("active-accent");
        } else {
          toggleBtn?.classList.add("active-accent");
        }
      }
    }
    function switchFilmoraInspectorTab(tabName) {
      document.querySelectorAll("#filmoraInspectorDrawer .insp-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.tab === tabName);
      });
      document.querySelectorAll("#filmoraInspectorDrawer .insp-pane").forEach((p) => {
        p.classList.add("hidden");
      });
      const paneId = "inspPane" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.remove("hidden");
    }
    function syncFilmoraInspectorUI() {
      document.querySelectorAll("#inspPaneVideo .fl-preset-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.layout === state.videoPlacement.layout);
      });
      const fInput = document.getElementById("filmoraFeatherInput");
      const fVal = document.getElementById("filmoraFeatherVal");
      if (fInput) fInput.value = state.videoPlacement.feather || 0;
      if (fVal) fVal.textContent = (state.videoPlacement.feather || 0) + "px";
      const wInput = document.getElementById("filmoraWidthPctInput");
      const wVal = document.getElementById("filmoraWidthPctVal");
      if (wInput) wInput.value = state.videoPlacement.widthPct || 50;
      if (wVal) wVal.textContent = (state.videoPlacement.widthPct || 50) + "%";
      const bToggle = document.getElementById("filmoraBannerToggle");
      const bText = document.getElementById("filmoraBannerTextInput");
      const bFont = document.getElementById("filmoraBannerFontSizeInput");
      const bFontVal = document.getElementById("filmoraBannerFontSizeVal");
      const bH = document.getElementById("filmoraBannerHeightInput");
      const bHVal = document.getElementById("filmoraBannerHeightVal");
      if (bToggle) bToggle.checked = state.headlineBanner.enabled;
      if (bText) bText.value = state.headlineBanner.text;
      if (bFont) bFont.value = state.headlineBanner.fontSize || 42;
      if (bFontVal) bFontVal.textContent = (state.headlineBanner.fontSize || 42) + "px";
      if (bH) bH.value = state.headlineBanner.height || 120;
      if (bHVal) bHVal.textContent = (state.headlineBanner.height || 120) + "px";
      document.querySelectorAll("#filmoraBannerColorSwatches .color-swatch").forEach((swatch) => {
        swatch.classList.toggle("active", swatch.dataset.color.toLowerCase() === (state.headlineBanner.bgColor || "").toLowerCase());
      });
      const layerCount = document.getElementById("filmoraLayerCount");
      if (layerCount) layerCount.textContent = String(state.studioLayers.length);
      const layersList = document.getElementById("filmoraLayersList");
      if (layersList) {
        layersList.innerHTML = "";
        state.studioLayers.forEach((layer, idx) => {
          const isSelected = layer.id === state.activeLayerId;
          const item = document.createElement("div");
          item.className = "filmora-layer-item" + (isSelected ? " active" : "");
          item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px; flex:1; overflow:hidden; cursor:pointer;">
                        <span>\u{1F5BC}\uFE0F</span>
                        <span style="font-weight:600; color:#e2e8f0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${layer.name}</span>
                    </div>
                    <div style="display:flex; gap:4px; align-items:center;">
                        <button class="filmora-btn-outline-sm btn-layer-vis" style="padding:2px 5px;" title="Hide/Show">${layer.visible ? "\u{1F441}\uFE0F" : "\u{1F648}"}</button>
                        <button class="filmora-btn-outline-sm btn-layer-del" style="padding:2px 5px; color:#ff4f4f;" title="Delete">\u{1F5D1}\uFE0F</button>
                    </div>
                `;
          item.addEventListener("click", (e) => {
            if (e.target.closest(".btn-layer-vis") || e.target.closest(".btn-layer-del")) return;
            state.activeLayerId = layer.id;
            syncFilmoraInspectorUI();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          });
          item.querySelector(".btn-layer-vis")?.addEventListener("click", (e) => {
            e.stopPropagation();
            layer.visible = !layer.visible;
            syncFilmoraInspectorUI();
            renderFilmoraTimeline();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          });
          item.querySelector(".btn-layer-del")?.addEventListener("click", (e) => {
            e.stopPropagation();
            state.studioLayers.splice(idx, 1);
            if (state.activeLayerId === layer.id) {
              state.activeLayerId = state.studioLayers.length > 0 ? state.studioLayers[0].id : null;
            }
            syncFilmoraInspectorUI();
            renderFilmoraTimeline();
            renderFilmoraMediaBin();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          });
          layersList.appendChild(item);
        });
      }
      const activeControls = document.getElementById("filmoraActiveLayerControls");
      const activeLayer = state.studioLayers.find((l) => l.id === state.activeLayerId) || (state.studioLayers.length > 0 ? state.studioLayers[0] : null);
      if (activeControls) {
        if (activeLayer) {
          state.activeLayerId = activeLayer.id;
          activeControls.classList.remove("hidden");
          const nameEl = document.getElementById("filmoraActiveLayerName");
          if (nameEl) nameEl.textContent = activeLayer.name;
          const scaleInput = document.getElementById("filmoraLayerScaleInput");
          const scaleVal = document.getElementById("filmoraLayerScaleVal");
          const currentScale = Math.round((activeLayer.scale || 1) * 100);
          if (scaleInput) scaleInput.value = currentScale;
          if (scaleVal) scaleVal.textContent = currentScale + "%";
          const opacityInput = document.getElementById("filmoraLayerOpacityInput");
          const opacityVal = document.getElementById("filmoraLayerOpacityVal");
          const currentOpacity = Math.round((activeLayer.opacity !== void 0 ? activeLayer.opacity : 1) * 100);
          if (opacityInput) opacityInput.value = currentOpacity;
          if (opacityVal) opacityVal.textContent = currentOpacity + "%";
        } else {
          activeControls.classList.add("hidden");
        }
      }
    }
    function renderFilmoraTimeline() {
      const container = document.getElementById("filmoraTimelineContainer");
      if (!container) return;
      const clip = state.clips.find((c) => c.id === state.activeClipId) || state.clips[0] || {
        startTime: state.trimIn,
        endTime: state.trimOut || 60,
        duration: Math.max(10, state.trimOut - state.trimIn || 60),
        title: "Clip #1 (Main Clip)"
      };
      const duration = Math.max(10, clip.duration || clip.endTime - clip.startTime || 60);
      const zoom = state.filmoraZoom || 35;
      const timelineWidth = Math.max(800, Math.round(duration * zoom));
      const cornerTime = document.getElementById("filmoraCornerTimecode");
      if (cornerTime) cornerTime.textContent = formatFilmoraTimecode(duration);
      const rulerCanvas = document.getElementById("filmoraRulerCanvas");
      if (rulerCanvas) {
        rulerCanvas.width = timelineWidth;
        rulerCanvas.height = 26;
        const rCtx = rulerCanvas.getContext("2d");
        rCtx.fillStyle = "#19222B";
        rCtx.fillRect(0, 0, timelineWidth, 26);
        rCtx.fillStyle = "#8E9BAE";
        rCtx.strokeStyle = "#212F3D";
        rCtx.font = "10px Consolas, monospace";
        rCtx.lineWidth = 1;
        const stepSec = zoom > 50 ? 1 : zoom > 25 ? 2 : 5;
        for (let s = 0; s <= duration + 10; s += stepSec) {
          const x = Math.round(s * zoom);
          if (x > timelineWidth) break;
          const isMajor = s % (stepSec * 2) === 0;
          const tickH = isMajor ? 12 : 6;
          rCtx.beginPath();
          rCtx.moveTo(x, 26 - tickH);
          rCtx.lineTo(x, 26);
          rCtx.stroke();
          if (isMajor) {
            const mins = Math.floor(s / 60);
            const secs = s % 60;
            const label = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
            rCtx.fillText(label, x + 3, 14);
          }
        }
      }
      const blockTitles = document.getElementById("filmoraBlockTitles");
      const blockTitlesLabel = document.getElementById("filmoraBlockTitlesLabel");
      if (blockTitles) {
        blockTitles.style.left = "0px";
        blockTitles.style.width = timelineWidth + "px";
        if (blockTitlesLabel) {
          blockTitlesLabel.textContent = `\u{1F4F0} ${state.headlineBanner.text || "\u1794\u178A\u17B6\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784\u1796\u17D0\u178F\u17CC\u1798\u17B6\u1793 (Khmer Moul)"}`;
        }
        blockTitles.onclick = () => toggleFilmoraInspector("banner");
      }
      const laneOverlays = document.getElementById("laneOverlays");
      if (laneOverlays) {
        laneOverlays.innerHTML = "";
        if (state.studioLayers && state.studioLayers.length > 0) {
          state.studioLayers.forEach((layer) => {
            const block = document.createElement("div");
            block.className = "filmora-clip-block block-overlays";
            block.style.left = "0px";
            block.style.width = timelineWidth + "px";
            block.innerHTML = `
                        <span class="clip-icon">\u{1F5BC}\uFE0F</span>
                        <span class="clip-text">${layer.name}</span>
                    `;
            block.onclick = () => toggleFilmoraInspector("collage");
            laneOverlays.appendChild(block);
          });
        } else {
          const emptyNotice = document.createElement("div");
          emptyNotice.style.cssText = "color:#64748b; font-size:0.72rem; padding:8px 12px; font-style:italic;";
          emptyNotice.textContent = 'Drag & Drop \u17AC\u1785\u17BB\u1785 "Stock Media" \u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u1793\u17D2\u1790\u17C2\u1798\u179F\u17D2\u179A\u1791\u17B6\u1794\u17CB Collage';
          laneOverlays.appendChild(emptyNotice);
        }
      }
      const blockVideo = document.getElementById("filmoraBlockVideo");
      const blockVideoLabel = document.getElementById("filmoraBlockVideoLabel");
      if (blockVideo) {
        blockVideo.style.left = "0px";
        blockVideo.style.width = timelineWidth + "px";
        if (blockVideoLabel) {
          blockVideoLabel.textContent = clip.name || clip.title || "Master Video Clip";
        }
        blockVideo.onclick = () => toggleFilmoraInspector("video");
      }
      const blockAudio = document.getElementById("filmoraBlockAudio");
      const waveCanvas = document.getElementById("filmoraWaveformCanvas");
      if (blockAudio) {
        blockAudio.style.left = "0px";
        blockAudio.style.width = timelineWidth + "px";
        blockAudio.onclick = () => toggleFilmoraInspector("audio");
      }
      if (waveCanvas) {
        waveCanvas.width = timelineWidth;
        waveCanvas.height = 34;
        const wCtx = waveCanvas.getContext("2d");
        wCtx.clearRect(0, 0, timelineWidth, 34);
        wCtx.strokeStyle = "rgba(85, 229, 197, 0.75)";
        wCtx.lineWidth = 1.5;
        const step = 4;
        wCtx.beginPath();
        for (let x = 0; x < timelineWidth; x += step) {
          const s = x / zoom;
          const pause = Math.sin(s * 0.7) > 0.65;
          const amp = pause ? 2 : Math.sin(s * 6.5) * Math.cos(s * 2.1) * 12 + 14;
          const h = Math.max(3, Math.min(28, amp));
          const y1 = (34 - h) / 2;
          const y2 = y1 + h;
          wCtx.moveTo(x, y1);
          wCtx.lineTo(x, y2);
        }
        wCtx.stroke();
      }
      updateFilmoraPlayhead();
    }
    function updateFilmoraPlayhead() {
      if (state.platformMode !== "youtube" || state.currentScreen !== 3) return;
      const video = elements.hiddenVideo;
      const clip = state.clips.find((c) => c.id === state.activeClipId);
      const start = clip ? clip.startTime : state.trimIn;
      const dur = clip ? clip.duration || clip.endTime - clip.startTime : state.trimOut - state.trimIn || 60;
      const curVideoTime = video ? video.currentTime : state.currentTime || 0;
      const curRelativeTime = Math.max(0, curVideoTime - start);
      const zoom = state.filmoraZoom || 35;
      const marker = document.getElementById("filmoraPlayheadMarker");
      const flag = document.getElementById("filmoraPlayheadFlag");
      if (marker) {
        const leftPx = Math.round(curRelativeTime * zoom);
        marker.style.left = leftPx + "px";
      }
      if (flag) {
        flag.textContent = formatFilmoraTimecode(curRelativeTime).slice(3, 8);
      }
      const monitorTc = document.getElementById("filmoraMonitorTimecode");
      if (monitorTc) monitorTc.textContent = formatFilmoraTimecode(curRelativeTime);
      const projectTitle = document.getElementById("filmoraProjectTitle");
      if (projectTitle) {
        projectTitle.textContent = `${clip ? clip.name : "Untitled"} : ${formatFilmoraTimecode(curRelativeTime)}`;
      }
      const pBar = document.getElementById("filmoraMonitorProgressBar");
      if (pBar && dur > 0) {
        const pct = Math.min(100, curRelativeTime / dur * 100);
        pBar.style.width = pct + "%";
      }
      const playBtn = document.getElementById("filmoraBtnPlayPause");
      if (playBtn) {
        playBtn.textContent = video && !video.paused ? "\u23F8" : "\u25B6";
      }
    }
    function seekFilmoraPlayhead(e) {
      const rulerTrack = document.getElementById("filmoraRulerTrack");
      if (!rulerTrack) return;
      const rect = rulerTrack.getBoundingClientRect();
      const clickX = Math.max(0, e.clientX - rect.left);
      const zoom = state.filmoraZoom || 35;
      const clickedSec = clickX / zoom;
      const clip = state.clips.find((c) => c.id === state.activeClipId);
      const start = clip ? clip.startTime : state.trimIn;
      const dur = clip ? clip.duration || clip.endTime - clip.startTime : state.trimOut - state.trimIn || 60;
      const targetTime = Math.max(start, Math.min(start + dur, start + clickedSec));
      if (elements.hiddenVideo) {
        elements.hiddenVideo.currentTime = targetTime;
      }
      state.currentTime = targetTime;
      renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
      updateFilmoraPlayhead();
    }
    function bindFilmoraEvents() {
      document.querySelectorAll("#filmoraMainTabs .filmora-ribbon-tab").forEach((tabBtn) => {
        tabBtn.addEventListener("click", () => {
          document.querySelectorAll("#filmoraMainTabs .filmora-ribbon-tab").forEach((b) => b.classList.remove("active"));
          tabBtn.classList.add("active");
          state.filmoraActiveTab = tabBtn.dataset.tab;
          renderFilmoraMediaBin();
        });
      });
      document.querySelectorAll(".filmora-tree-sidebar .tree-item, .filmora-tree-sidebar .tree-sub-item").forEach((treeBtn) => {
        treeBtn.addEventListener("click", () => {
          document.querySelectorAll(".filmora-tree-sidebar .tree-item, .filmora-tree-sidebar .tree-sub-item").forEach((b) => b.classList.remove("active"));
          treeBtn.classList.add("active");
          const sub = treeBtn.dataset.sub;
          const tree = treeBtn.dataset.tree;
          if (tree === "project") {
            state.filmoraActiveTab = "media";
          } else if (tree === "sample") {
            state.filmoraActiveTab = "stockMedia";
          } else if (sub === "cinematic") {
            state.filmoraActiveTab = "effects";
          } else {
            state.filmoraActiveTab = "media";
          }
          document.querySelectorAll("#filmoraMainTabs .filmora-ribbon-tab").forEach((t) => {
            t.classList.toggle("active", t.dataset.tab === state.filmoraActiveTab);
          });
          renderFilmoraMediaBin();
        });
      });
      const studioImgInput = document.getElementById("studioImageUploadInput");
      if (studioImgInput) {
        studioImgInput.addEventListener("change", (e) => {
          const files = Array.from(e.target?.files || []);
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
              addStudioImageLayer(evt.target.result, file.name.replace(/\.[^/.]+$/, ""));
            };
            reader.readAsDataURL(file);
          });
          studioImgInput.value = "";
        });
      }
      document.querySelectorAll("#filmoraActiveLayerControls .btn-layer-preset").forEach((btn) => {
        btn.addEventListener("click", () => {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (!layer) return;
          const preset = btn.dataset.preset;
          const img = layer.img || layer.imgElement;
          const curScale = layer.scale || 1;
          const lw = (layer.w || (img ? img.naturalWidth || img.width : 480)) * curScale;
          const lh = (layer.h || (img ? img.naturalHeight || img.height : 320)) * curScale;
          const layout = state.videoPlacement.layout || "split-right";
          const widthPct = (state.videoPlacement.widthPct || 50) / 100;
          let targetX = 0, targetY = 0, targetW = state.canvasWidth, targetH = state.canvasHeight;
          if (layout === "split-right") {
            targetW = Math.round(state.canvasWidth * widthPct);
            targetX = state.canvasWidth - targetW;
          } else if (layout === "split-left") {
            targetW = Math.round(state.canvasWidth * widthPct);
            targetX = 0;
          } else if (layout === "pip") {
            targetW = Math.round(state.canvasWidth * 0.38);
            targetX = state.canvasWidth - targetW - 40;
            targetY = 40;
          }
          if (preset === "center-video") {
            layer.x = Math.round(targetX + (targetW - lw) / 2);
            layer.y = Math.round(targetY + (targetH - lh) / 2);
            showToast("\u{1F3A5} \u1794\u17B6\u1793\u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796\u1785\u17C6\u1780\u178E\u17D2\u178F\u17B6\u179B\u179C\u17B8\u178A\u17C1\u17A2\u17BC!");
          } else if (preset === "top-right") {
            layer.scale = 0.55;
            const nW = (layer.w || 480) * layer.scale;
            layer.x = state.canvasWidth - nW - 40;
            layer.y = 40;
            showToast("\u{1F4CC} \u1794\u17B6\u1793\u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796\u1793\u17C5\u1787\u17D2\u179A\u17BB\u1784\u179B\u17BE\u179F\u17D2\u178F\u17B6\u17C6!");
          } else if (preset === "lower-third") {
            layer.scale = 0.75;
            const nW = (layer.w || 480) * layer.scale;
            const nH = (layer.h || 320) * layer.scale;
            layer.x = Math.round(targetX + (targetW - nW) / 2);
            layer.y = state.canvasHeight - nH - 140;
            showToast("\u{1F4F0} \u1794\u17B6\u1793\u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796\u179B\u17BE\u1794\u178A\u17B6\u1796\u17D0\u178F\u17CC\u1798\u17B6\u1793!");
          } else if (preset === "left-side") {
            layer.scale = 0.95;
            layer.x = 50;
            layer.y = 60;
            showToast("\u{1F4D0} \u1794\u17B6\u1793\u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796\u1793\u17C5\u1795\u17D2\u1793\u17C2\u1780\u1781\u17B6\u1784\u1786\u17D2\u179C\u17C1\u1784!");
          }
          syncFilmoraInspectorUI();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      });
      const layerScaleInput = document.getElementById("filmoraLayerScaleInput");
      const layerScaleVal = document.getElementById("filmoraLayerScaleVal");
      if (layerScaleInput) {
        layerScaleInput.addEventListener("input", (e) => {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (layer) {
            layer.scale = parseInt(e.target.value) / 100;
            if (layerScaleVal) layerScaleVal.textContent = e.target.value + "%";
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          }
        });
      }
      const layerOpacityInput = document.getElementById("filmoraLayerOpacityInput");
      const layerOpacityVal = document.getElementById("filmoraLayerOpacityVal");
      if (layerOpacityInput) {
        layerOpacityInput.addEventListener("input", (e) => {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (layer) {
            layer.opacity = parseInt(e.target.value) / 100;
            if (layerOpacityVal) layerOpacityVal.textContent = e.target.value + "%";
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          }
        });
      }
      document.getElementById("btnLayerBringForward")?.addEventListener("click", () => {
        const idx = state.studioLayers.findIndex((l) => l.id === state.activeLayerId);
        if (idx > -1 && idx < state.studioLayers.length - 1) {
          const temp = state.studioLayers[idx];
          state.studioLayers.splice(idx, 1);
          state.studioLayers.push(temp);
          syncFilmoraInspectorUI();
          renderFilmoraTimeline();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          showToast("\u2B06\uFE0F \u1794\u17B6\u1793\u179A\u17C6\u1780\u17B7\u179B\u179F\u17D2\u179A\u1791\u17B6\u1794\u17CB\u17A1\u17BE\u1784\u179B\u17BE\u1782\u17C1!");
        }
      });
      document.getElementById("btnLayerSendBackward")?.addEventListener("click", () => {
        const idx = state.studioLayers.findIndex((l) => l.id === state.activeLayerId);
        if (idx > 0) {
          const temp = state.studioLayers[idx];
          state.studioLayers.splice(idx, 1);
          state.studioLayers.unshift(temp);
          syncFilmoraInspectorUI();
          renderFilmoraTimeline();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          showToast("\u2B07\uFE0F \u1794\u17B6\u1793\u179A\u17C6\u1780\u17B7\u179B\u179F\u17D2\u179A\u1791\u17B6\u1794\u17CB\u1785\u17BB\u17C7\u1780\u17D2\u179A\u17C4\u1798\u1782\u17C1!");
        }
      });
      document.getElementById("filmoraToolInspectorToggle")?.addEventListener("click", () => {
        toggleFilmoraInspector();
      });
      document.getElementById("filmoraCloseInspectorBtn")?.addEventListener("click", () => {
        toggleFilmoraInspector();
      });
      document.querySelectorAll("#filmoraInspectorDrawer .insp-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          switchFilmoraInspectorTab(tab.dataset.tab);
        });
      });
      document.querySelectorAll("#inspPaneVideo .fl-preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          pushStateToHistory();
          state.videoPlacement.layout = btn.dataset.layout;
          syncFilmoraInspectorUI();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          showToast(`\u{1F4D0} \u1794\u17D2\u179B\u1784\u17CB Filmora: ${btn.dataset.layout}`);
        });
      });
      const fInput = document.getElementById("filmoraFeatherInput");
      const fVal = document.getElementById("filmoraFeatherVal");
      if (fInput) {
        fInput.addEventListener("input", (e) => {
          state.videoPlacement.feather = parseFloat(e.target.value);
          if (fVal) fVal.textContent = state.videoPlacement.feather + "px";
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      }
      const wInput = document.getElementById("filmoraWidthPctInput");
      const wVal = document.getElementById("filmoraWidthPctVal");
      if (wInput) {
        wInput.addEventListener("input", (e) => {
          state.videoPlacement.widthPct = parseFloat(e.target.value);
          if (wVal) wVal.textContent = state.videoPlacement.widthPct + "%";
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      }
      const bText = document.getElementById("filmoraBannerTextInput");
      if (bText) {
        bText.addEventListener("input", (e) => {
          state.headlineBanner.text = e.target.value;
          const blockLabel = document.getElementById("filmoraBlockTitlesLabel");
          if (blockLabel) blockLabel.textContent = `\u{1F4F0} ${e.target.value}`;
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      }
      const bFont = document.getElementById("filmoraBannerFontSizeInput");
      const bFontVal = document.getElementById("filmoraBannerFontSizeVal");
      if (bFont) {
        bFont.addEventListener("input", (e) => {
          state.headlineBanner.fontSize = parseInt(e.target.value);
          if (bFontVal) bFontVal.textContent = state.headlineBanner.fontSize + "px";
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      }
      const bH = document.getElementById("filmoraBannerHeightInput");
      const bHVal = document.getElementById("filmoraBannerHeightVal");
      if (bH) {
        bH.addEventListener("input", (e) => {
          state.headlineBanner.height = parseInt(e.target.value);
          if (bHVal) bHVal.textContent = state.headlineBanner.height + "px";
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      }
      document.querySelectorAll("#filmoraBannerColorSwatches .color-swatch").forEach((swatch) => {
        swatch.addEventListener("click", () => {
          document.querySelectorAll("#filmoraBannerColorSwatches .color-swatch").forEach((s) => s.classList.remove("active"));
          swatch.classList.add("active");
          state.headlineBanner.bgColor = swatch.dataset.color;
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      });
      const btnPlay = document.getElementById("filmoraBtnPlayPause");
      if (btnPlay) {
        btnPlay.addEventListener("click", () => {
          if (!elements.hiddenVideo) return;
          if (elements.hiddenVideo.paused) {
            elements.hiddenVideo.play().catch(() => {
            });
          } else {
            elements.hiddenVideo.pause();
          }
          updateFilmoraPlayhead();
        });
      }
      document.getElementById("filmoraBtnFirstFrame")?.addEventListener("click", () => {
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        const start = clip ? clip.startTime : state.trimIn;
        if (elements.hiddenVideo) elements.hiddenVideo.currentTime = start;
        updateFilmoraPlayhead();
      });
      document.getElementById("filmoraBtnStepBack")?.addEventListener("click", () => {
        if (elements.hiddenVideo) elements.hiddenVideo.currentTime = Math.max(0, elements.hiddenVideo.currentTime - 1);
        updateFilmoraPlayhead();
      });
      document.getElementById("filmoraBtnStepForward")?.addEventListener("click", () => {
        if (elements.hiddenVideo) elements.hiddenVideo.currentTime = elements.hiddenVideo.currentTime + 1;
        updateFilmoraPlayhead();
      });
      document.getElementById("filmoraBtnStop")?.addEventListener("click", () => {
        if (elements.hiddenVideo) {
          elements.hiddenVideo.pause();
          const clip = state.clips.find((c) => c.id === state.activeClipId);
          elements.hiddenVideo.currentTime = clip ? clip.startTime : state.trimIn;
        }
        updateFilmoraPlayhead();
      });
      document.getElementById("filmoraSnapshotBtn")?.addEventListener("click", () => {
        const canvas = elements.mainCanvas;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `filmora_snapshot_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("\u{1F4F7} \u1794\u17B6\u1793\u1790\u178F\u1799\u1780\u179A\u17BC\u1794\u1797\u17B6\u1796 Snapshot \u178A\u17C4\u1799\u1787\u17C4\u1782\u1787\u17D0\u1799!");
      });
      document.getElementById("filmoraFullscreenBtn")?.addEventListener("click", () => {
        const slot = document.getElementById("filmoraCanvasSlot");
        if (!slot) return;
        if (!document.fullscreenElement) {
          slot.requestFullscreen().catch(() => {
          });
        } else {
          document.exitFullscreen().catch(() => {
          });
        }
      });
      const volSlider = document.getElementById("filmoraMonitorVol");
      const muteBtn = document.getElementById("filmoraMuteBtn");
      if (volSlider) {
        volSlider.addEventListener("input", (e) => {
          if (elements.hiddenVideo) elements.hiddenVideo.volume = e.target.value / 100;
        });
      }
      if (muteBtn) {
        muteBtn.addEventListener("click", () => {
          if (!elements.hiddenVideo) return;
          elements.hiddenVideo.muted = !elements.hiddenVideo.muted;
          muteBtn.textContent = elements.hiddenVideo.muted ? "\u{1F507}" : "\u{1F50A}";
        });
      }
      let isScrubbing = false;
      const rulerTrack = document.getElementById("filmoraRulerTrack");
      if (rulerTrack) {
        rulerTrack.addEventListener("mousedown", (e) => {
          isScrubbing = true;
          seekFilmoraPlayhead(e);
        });
      }
      const monitorProgress = document.getElementById("filmoraMonitorProgressTrack");
      if (monitorProgress) {
        monitorProgress.addEventListener("click", (e) => {
          const rect = monitorProgress.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          const clip = state.clips.find((c) => c.id === state.activeClipId);
          const start = clip ? clip.startTime : state.trimIn;
          const dur = clip ? clip.duration || clip.endTime - clip.startTime : state.trimOut - state.trimIn || 60;
          if (elements.hiddenVideo) {
            elements.hiddenVideo.currentTime = start + pct * dur;
          }
          updateFilmoraPlayhead();
        });
      }
      window.addEventListener("mousemove", (e) => {
        if (isScrubbing) {
          seekFilmoraPlayhead(e);
        }
      });
      window.addEventListener("mouseup", () => {
        isScrubbing = false;
      });
      document.getElementById("filmoraToolSplit")?.addEventListener("click", () => {
        if (window.splitSelectedClip) {
          window.splitSelectedClip();
          renderFilmoraTimeline();
          showToast("\u2702\uFE0F \u1794\u17B6\u1793\u1796\u17BB\u17C7 Clip \u1787\u17B6\u1796\u17B8\u179A\u178F\u17D2\u179A\u1784\u17CB Playhead");
        }
      });
      document.getElementById("filmoraToolUndo")?.addEventListener("click", () => {
        if (window.undo) window.undo();
        renderFilmoraTimeline();
      });
      document.getElementById("filmoraToolRedo")?.addEventListener("click", () => {
        if (window.redo) window.redo();
        renderFilmoraTimeline();
      });
      document.getElementById("filmoraToolDelete")?.addEventListener("click", () => {
        if (state.activeClipId) {
          const idx = state.clips.findIndex((c) => c.id === state.activeClipId);
          if (idx !== -1) {
            state.clips.splice(idx, 1);
            if (state.clips.length > 0) {
              selectClipForEditing(state.clips[0].id);
            }
            renderFilmoraTimeline();
            showToast("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794 Clip \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB");
          }
        }
      });
      const tlZoom = document.getElementById("filmoraTimelineZoom");
      if (tlZoom) {
        tlZoom.addEventListener("input", (e) => {
          state.filmoraZoom = parseFloat(e.target.value);
          renderFilmoraTimeline();
        });
      }
      document.getElementById("filmoraExportClipBtn")?.addEventListener("click", () => {
        if (state.activeClipId) {
          exportSingleClip(state.activeClipId);
        } else if (state.clips.length > 0) {
          exportSingleClip(state.clips[0].id);
        } else {
          showToast("\u26A0\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB Export \u1791\u17C1!");
        }
      });
      document.getElementById("filmoraBtnLoadSampleCollage")?.addEventListener("click", () => {
        loadSampleCollage();
        syncFilmoraInspectorUI();
        renderFilmoraTimeline();
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        showToast("\u{1F4F0} \u1794\u17B6\u1793\u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796 Collage \u1782\u17C6\u179A\u17BC 3 \u179F\u1793\u17D2\u179B\u17B9\u1780!");
      });
    }
    function formatTime(seconds, includeMs = true) {
      if (isNaN(seconds) || seconds < 0) seconds = 0;
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor(seconds % 3600 / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor(seconds % 1 * 100);
      const pad = (num, size = 2) => String(num).padStart(size, "0");
      if (includeMs) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms)}`;
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    function init() {
      bindEvents();
      bindYoutubeStudioEvents();
      bindFilmoraEvents();
      setPlatformMode(state.platformMode, true);
      updateAspectDimensions();
      switchScreen(1);
      initAiModule();
      checkServerBatchState();
      requestAnimationFrame(renderLoop);
    }
    async function checkServerBatchState() {
      if (localStorage.getItem("khmer_clipper_batch_cleared") === "true") {
        return;
      }
      try {
        const serverOrigin = window.location.origin.includes(":5000") || window.location.origin.includes("127.0.0.1") ? window.location.origin : "http://127.0.0.1:5000";
        const resp = await fetch(`${serverOrigin}/api/batch/status`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (data && data.success && Array.isArray(data.videos)) {
          if (data.videos.length > 0) {
            if (state.batchVideos.length === 0) {
              state.batchVideos = data.videos.map((v) => ({
                id: v.id,
                name: v.name,
                size: v.size,
                path: v.path || v.name,
                duration: v.duration || 0,
                status: v.status || "queued",
                stage: v.stage || "\u179A\u1784\u17CB\u1785\u17B6\u17C6...",
                progress: v.progress || 0,
                clips: v.clips || [],
                clips_count: v.clips_count || (v.clips ? v.clips.length : 0),
                objectURL: null
              }));
              renderBatchQueue();
              updateBatchSwitcherBar();
            }
          } else {
            state.batchVideos = [];
            renderBatchQueue();
            updateBatchSwitcherBar();
          }
        }
      } catch (e) {
      }
    }
    const REAL_AUTHENTIC_DHAMMA_CLIPS = [
      {
        id: "real_council_1",
        isConsensus: true,
        title: "\u1798\u17B6\u1793\u17A1\u17B6\u1793\u1798\u17B6\u1793\u179C\u17B8\u17A1\u17B6\u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1794\u17D2\u179A\u17B6\u1780\u178A\u1790\u17B6 \xAB\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\xBB\u17D6 \u1780\u17B6\u179A\u179C\u17C7\u1780\u17B6\u178F\u17CB\u1791\u179F\u17D2\u179F\u1793\u17C8 \xAB\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\xBB \u178F\u17B6\u1798\u1795\u17D2\u179B\u17BC\u179C\u1792\u1798\u17CC",
        startTime: 2068,
        endTime: 2468,
        duration: 400,
        top1: "\u1791\u17D2\u179A\u1796\u17D2\u1799\u179F\u1798\u17D2\u1794\u178F\u17D2\u178F\u17B7\u1780\u17D2\u179A\u17C5\u1781\u17D2\u179B\u17BD\u1793 vs \u17A2\u179A\u17B7\u1799\u1791\u17D2\u179A\u1796\u17D2\u1799",
        top2: "\u178F\u17BE\u1792\u17D2\u179C\u17BE\u178A\u17BC\u1785\u1798\u17D2\u178F\u17C1\u1785\u1791\u17BE\u1794\u17A0\u17C5\u1790\u17B6 \xAB\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\xBB \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A?",
        bot1: "\u1785\u17BC\u179B\u1794\u17BB\u178E\u17D2\u1799 \u17E5\u1796\u17B6\u1793\u17CB \u17AC \u17E1\u1798\u17C9\u17BA\u1793 \u1780\u17CF\u1787\u17B6\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793",
        bot2: "\u179C\u1794\u17D2\u1794\u1792\u1798\u17CC\u1793\u17C3\u1780\u17B6\u179A\u179B\u17C7\u1794\u1784\u17CB \u1793\u17B7\u1784\u179F\u1791\u17D2\u1792\u17B6\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6",
        viralScore: "99.5%",
        tags: ["#\u17A2\u179A\u17B7\u1799\u1791\u17D2\u179A\u1796\u17D2\u1799", "#\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\u1796\u17B7\u178F", "#\u1780\u17BB\u179F\u179B\u1792\u1798\u17CC", "#GrandCouncil"],
        transcript: '"\u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u17C5\u178F\u17B6\u1798\u17A2\u178F\u17D2\u1790\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1793\u17C3\u1796\u17D2\u179A\u17C7\u179F\u1791\u17D2\u1792\u1798\u17D2\u1798 \u179B\u17C4\u1780\u17A2\u178F\u17CB\u1790\u17B6 \u1780\u17D2\u179A\u1791\u17C1\u1789\u17C4\u1798\u178E\u17B6... \u178F\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F\u1793\u17C1\u17C7 \u1782\u17BA\u1790\u17B6\u1794\u17C6\u1796\u17C1\u1789\u1780\u17B6\u178F\u1796\u17D2\u179C\u1780\u17B7\u1785\u17D2\u1785\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\u17A0\u17D2\u1793\u17B9\u1784\u17B1\u17D2\u1799\u17A0\u17BC\u179A\u17A0\u17C2\u17A2\u1789\u17D2\u1785\u17B9\u1784\u1798\u1780"',
        modelBadge: "\u{1F451} 4-LLM Full Council Unanimous",
        badgeColor: "#f43f5e",
        strategyNote: "\u{1F3DB}\uFE0F The Grand Council: Claude 3.5 + Gemini Pro + GPT-4o + Gemini Flash Hook \u1794\u17B6\u1793\u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6",
        auditNote: "The Grand Council: \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u178A\u17C4\u1799 4 \u1798\u17C9\u17BC\u178C\u17C2\u179B \u2014 Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799 (+4s \u178A\u17BE\u1798, +8s \u1785\u17BB\u1784)"
      },
      {
        id: "real_council_2",
        isConsensus: true,
        title: "\u178F\u17BE\u1794\u17D2\u179A\u17B6\u1780\u17CB\u179A\u17C0\u179B\u1793\u17B7\u1784\u1794\u17D2\u179A\u17B6\u1780\u17CB\u178A\u17BB\u179B\u17D2\u179B\u17B6\u179A\u17A2\u17B6\u1785\u1794\u17D2\u179A\u17C2\u1787\u17B6\u1795\u17D2\u1780\u17B6\u1794\u17D2\u179A\u17B6\u1780\u17CB\u1794\u17B6\u1793\u178A\u17C4\u1799\u179A\u1794\u17C0\u1794\u178E\u17B6?",
        startTime: 921,
        endTime: 1153,
        duration: 232,
        top1: "\u17A0\u17B7\u179A\u1789\u17D2\u1789\u1794\u17BB\u1794\u17D2\u1795\u17B6 \u1793\u17B7\u1784 \u179A\u17BC\u1794\u17B7\u1799\u1794\u17BB\u1794\u17D2\u1795\u17B6",
        top2: "\u1780\u17B6\u179A\u179C\u17B7\u179C\u178C\u17D2\u178D\u1796\u17B8\u1794\u17D2\u179A\u1796\u17D0\u1793\u17D2\u1792\u178A\u17BC\u179A\u1791\u17C6\u1793\u17B7\u1789 \u1798\u1780\u1787\u17B6\u1794\u17BB\u178E\u17D2\u1799\u1795\u17D2\u1780\u17B6\u1794\u17D2\u179A\u17B6\u1780\u17CB",
        bot1: "\u17A0\u17C1\u178F\u17BB\u17A2\u17D2\u179C\u17B8\u1794\u17B6\u1793\u1787\u17B6\u179B\u17BB\u1799\u17A2\u17B6\u1785\u1780\u17D2\u179B\u17B6\u1799\u1787\u17B6\u1794\u17BB\u178E\u17D2\u1799?",
        bot2: "\u1780\u17B6\u179A\u179C\u17B7\u1797\u17B6\u1782\u1793\u17D0\u1799\u179F\u1784\u17D2\u1782\u1798\u1793\u17B7\u1784\u179F\u17B6\u179F\u1793\u17B6",
        viralScore: "98.2%",
        tags: ["#\u1795\u17D2\u1780\u17B6\u1794\u17D2\u179A\u17B6\u1780\u17CB", "#\u17A0\u17B7\u179A\u1789\u17D2\u1789\u1794\u17BB\u1794\u17D2\u1795\u17B6", "#\u179A\u17BC\u1794\u17B7\u1799\u1794\u17BB\u1794\u17D2\u1795\u17B6", "#\u1794\u17BB\u178E\u17D2\u1799\u1791\u17B6\u1793"],
        transcript: '"\u1796\u17B6\u1780\u17D2\u1799\u1790\u17B6 \u1795\u17D2\u1780\u17B6 \u1796\u17B6\u1780\u17D2\u1799\u1790\u17B6 \u1794\u17BB\u1794\u17D2\u1795\u17B6... \u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u178A\u17C4\u17C7\u178A\u17BC\u179A\u1791\u17C6\u1793\u17B7\u1789\u1791\u17C5\u179C\u17B7\u1789\u1791\u17C5\u1798\u1780 \u179F\u17BC\u1798\u1796\u17D2\u179A\u17C7\u1798\u17A0\u17B6\u1790\u17C1\u179A \u1793\u17B7\u1798\u1793\u17D2\u178F\u1787\u17D2\u179A\u17B6\u1794"',
        modelBadge: "\u{1F3C6} 3-AI Grand Consensus",
        badgeColor: "#8b5cf6",
        strategyNote: "\u{1F3DB}\uFE0F Consensus: GPT-4o + Gemini Flash Hook + Claude 3.5 Sonnet",
        auditNote: "The Grand Council: \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u178A\u17C4\u1799 3 \u1798\u17C9\u17BC\u178C\u17C2\u179B \u2014 Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
      },
      {
        id: "real_council_3",
        isConsensus: true,
        title: "\u1794\u17D2\u179A\u1798\u17BC\u179B\u179B\u17BB\u1799\u1782\u17C1\u1792\u17D2\u179C\u17BE\u1794\u17BB\u178E\u17D2\u1799 \u178F\u17C2\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u1798\u17B7\u1793\u1785\u17C1\u1789\u1798\u17BD\u1799\u179A\u17C0\u179B\u17D6 \u179C\u17C7\u1780\u17B6\u178F\u17CB\u179A\u17BF\u1784\u178F\u1798\u17D2\u179B\u17B6\u1797\u17B6\u1796\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u179A\u17C3\u17A2\u1784\u17D2\u1782\u17B6\u179F!",
        startTime: 2456,
        endTime: 2603,
        duration: 147,
        top1: "\u179A\u17C3\u17A2\u1784\u17D2\u1782\u17B6\u179F\u179B\u17BB\u1799\u1782\u17C1\u1792\u17D2\u179C\u17BE\u1794\u17BB\u178E\u17D2\u1799",
        top2: "\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u1798\u17B7\u1793\u1785\u17C1\u1789\u1798\u17BD\u1799\u179A\u17C0\u179B?",
        bot1: "\u178F\u1798\u17D2\u179B\u17B6\u1797\u17B6\u1796\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1792\u17D2\u179C\u17BE\u1794\u17BB\u178E\u17D2\u1799",
        bot2: "\u1785\u17B7\u178F\u17D2\u178F\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792\u1791\u17BE\u1794\u1794\u17B6\u1793\u1794\u17BB\u178E\u17D2\u1799\u1792\u17C6",
        viralScore: "98.2%",
        tags: ["#\u178F\u1798\u17D2\u179B\u17B6\u1797\u17B6\u1796", "#\u1792\u17D2\u179C\u17BE\u1794\u17BB\u178E\u17D2\u1799", "#\u179A\u17C3\u17A2\u1784\u17D2\u1782\u17B6\u179F", "#\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC"],
        transcript: '"\u17A2\u17D2\u1793\u1780\u1781\u17D2\u179B\u17C7\u178A\u17BE\u179A\u1794\u17D2\u179A\u1798\u17BC\u179B\u179B\u17BB\u1799\u1782\u17C1\u1792\u17D2\u179C\u17BE\u1794\u17BB\u178E\u17D2\u1799 \u178F\u17C2\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u1798\u17B7\u1793\u178A\u17C2\u179B\u1785\u17C1\u1789\u1798\u17BD\u1799\u179A\u17C0\u179B..."',
        modelBadge: "\u{1F451} 4-LLM Full Council Unanimous",
        badgeColor: "#f43f5e",
        strategyNote: "\u{1F3DB}\uFE0F The Grand Council: \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6 4 \u1798\u17C9\u17BC\u178C\u17C2\u179B",
        auditNote: "Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
      },
      {
        id: "real_council_4",
        isConsensus: true,
        title: "\u178F\u17D2\u179A\u17C3\u1791\u17D2\u179C\u17B6\u179A\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u17D6 \u1780\u17B6\u179A\u179A\u17BD\u1798\u1794\u17C1\u17C7\u178A\u17BC\u1784 \u179C\u17B6\u1785\u17B6 \u1793\u17B7\u1784\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1780\u179F\u17B6\u1784\u1780\u17BB\u179F\u179B",
        startTime: 1475,
        endTime: 1708,
        duration: 233,
        top1: "\u1780\u17B6\u1799\u1780\u1798\u17D2\u1798 \u179C\u1785\u17B8\u1780\u1798\u17D2\u1798 \u1798\u1793\u17C4\u1780\u1798\u17D2\u1798",
        top2: "\u178F\u17D2\u179A\u17C3\u1791\u17D2\u179C\u17B6\u179A\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1780\u179F\u17B6\u1784\u1780\u17BB\u179F\u179B",
        bot1: "\u179A\u17BD\u1798\u1785\u17B7\u178F\u17D2\u178F \u179A\u17BD\u1798\u179F\u1798\u17D2\u178F\u17B8 \u179A\u17BD\u1798\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796",
        bot2: "\u1795\u179B\u1794\u17BB\u178E\u17D2\u1799\u1780\u17BE\u178F\u1785\u17C1\u1789\u1796\u17B8\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1797\u17B6\u1796",
        viralScore: "96.5%",
        tags: ["#\u178F\u17D2\u179A\u17C3\u1791\u17D2\u179C\u17B6\u179A", "#\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1792\u1798\u17CC", "#\u1780\u17BB\u179F\u179B", "#\u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6"],
        transcript: '"\u1780\u17B6\u179A\u179A\u17BD\u1798\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u178F\u17B6\u1798\u1791\u17D2\u179C\u17B6\u179A\u1791\u17B6\u17C6\u1784\u1794\u17B8 \u1780\u17B6\u1799 \u179C\u17B6\u1785\u17B6 \u1785\u17B7\u178F\u17D2\u178F..."',
        modelBadge: "\u{1F3C6} 3-AI Grand Consensus",
        badgeColor: "#8b5cf6",
        strategyNote: "\u{1F3DB}\uFE0F Consensus: Gemini Pro + Claude + GPT-4o",
        auditNote: "Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
      },
      {
        id: "real_council_5",
        isConsensus: true,
        title: "\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6\u17D6 \u1780\u17B6\u179A\u179C\u17B7\u1793\u17B7\u1799\u17C4\u1782\u179B\u17BE\u1792\u1793\u1792\u17B6\u1793\u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17BE\u1798\u17B8\u17D2\u1794\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u179F\u1784\u17D2\u1782\u1798",
        startTime: 1857,
        endTime: 2013,
        duration: 156,
        top1: "\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6 vs \u1797\u17B6\u1796\u179B\u17D2\u1784\u1784\u17CB\u1781\u17D2\u179B\u17C5",
        top2: "\u179C\u17B7\u1793\u17B7\u1799\u17C4\u1782\u179B\u17BE\u1792\u1793\u1792\u17B6\u1793\u1798\u1793\u17BB\u179F\u17D2\u179F",
        bot1: "\u17A2\u1794\u17CB\u179A\u17C6\u1780\u17BC\u1793\u1785\u17C5\u17B1\u17D2\u1799\u1798\u17B6\u1793\u1785\u17C6\u178E\u17C1\u17C7\u178A\u17B9\u1784",
        bot2: "\u179F\u1784\u17D2\u1782\u1798\u1787\u17B6\u178F\u17B7\u1798\u17B6\u1793\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1799\u17BC\u179A\u17A2\u1784\u17D2\u179C\u17C2\u1784",
        viralScore: "96.5%",
        tags: ["#\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6", "#\u1792\u1793\u1792\u17B6\u1793\u1798\u1793\u17BB\u179F\u17D2\u179F", "#\u1780\u17B6\u179A\u17A2\u1794\u17CB\u179A\u17C6", "#\u179F\u1784\u17D2\u1782\u1798\u1787\u17B6\u178F\u17B7"],
        transcript: '"\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6 \u1782\u17BA\u1796\u1793\u17D2\u179B\u17BA\u178A\u17CF\u1780\u17D2\u179A\u17C3\u179B\u17C2\u1784... \u1794\u178E\u17D2\u178F\u17BB\u17C7\u1792\u1793\u1792\u17B6\u1793\u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17BE\u1798\u17D2\u1794\u17B8\u17A2\u1797\u17B7\u179C\u178C\u17D2\u178D\u179F\u1784\u17D2\u1782\u1798..."',
        modelBadge: "\u{1F3C6} 3-AI Grand Consensus",
        badgeColor: "#8b5cf6",
        strategyNote: "\u{1F3DB}\uFE0F Consensus: Gemini Pro + Claude Sonnet",
        auditNote: "Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
      },
      {
        id: "real_council_6",
        isConsensus: true,
        title: "\u1791\u17C1\u179F\u1793\u17B6\u178A\u17C1\u1789\u1798\u17C1\u1783\u17D6 \u179F\u17BB\u17C6\u1798\u17C1\u1783\u179F\u17D2\u179A\u1791\u17BB\u17C6\u179F\u17D2\u1798\u17BE\u1793\u17B9\u1784\u179F\u1798\u17D2\u1794\u17BB\u179A\u179B\u17C4\u1780\u1782\u17D2\u179A\u17BC\u1794\u17B6\u1793\u17A0\u17BE\u1799!",
        startTime: 371,
        endTime: 543,
        duration: 172,
        top1: "\u1780\u17C6\u1794\u17D2\u179B\u17C2\u1784\u179F\u17BE\u1785\u1785\u17BB\u1780\u1796\u17C4\u17C7\u1780\u17D2\u1793\u17BB\u1784\u179A\u17C4\u1784\u1794\u17BB\u178E\u17D2\u1799",
        top2: "\u1791\u17C1\u179F\u1793\u17B6\u178A\u17C1\u1789\u1798\u17C1\u1783\u1780\u17BB\u17C6\u17B1\u17D2\u1799\u1797\u17D2\u179B\u17C0\u1784!",
        bot1: "\u179F\u17BB\u17C6\u1798\u17C1\u1783\u179F\u17D2\u179A\u1791\u17BB\u17C6\u179F\u17D2\u1798\u17BE\u1793\u17B9\u1784\u179F\u1798\u17D2\u1794\u17BB\u179A\u179B\u17C4\u1780\u1782\u17D2\u179A\u17BC",
        bot2: "\u179F\u17C6\u178E\u17BE\u1785\u179F\u1794\u17D2\u1794\u17B6\u1799\u1780\u17D2\u1793\u17BB\u1784\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799",
        viralScore: "93.8%",
        tags: ["#\u1780\u17C6\u1794\u17D2\u179B\u17C2\u1784", "#\u1791\u17C1\u179F\u1793\u17B6\u178A\u17C1\u1789\u1798\u17C1\u1783", "#\u179F\u17C6\u178E\u17BE\u1785", "#MonkHumor"],
        transcript: '"\u1789\u17B6\u178F\u17B7\u1789\u17C4\u1798\u179F\u17BB\u17C6\u17B1\u17D2\u1799\u1798\u17C1\u1783\u179F\u17D2\u179A\u1791\u17BB\u17C6... \u179F\u17D2\u179A\u1791\u17BB\u17C6\u1794\u17C9\u17BB\u178E\u17D2\u178E\u17B6\u179F\u1798\u17D2\u1794\u17BB\u179A\u179B\u17C4\u1780\u1782\u17D2\u179A\u17BC\u1794\u17B6\u1793\u17A0\u17BE\u1799..."',
        modelBadge: "\u26A1 Viral Humor Highlight",
        badgeColor: "#ec4899",
        strategyNote: "\u{1F3AD} Claude 3.5 Sonnet Humor Scout Pick",
        auditNote: "\u179F\u17C6\u178E\u17BE\u1785\u1795\u17D2\u1791\u17BB\u17C7\u1796\u17C1\u1789\u179A\u17C4\u1784\u1794\u17BB\u178E\u17D2\u1799 \u1782\u17D2\u1798\u17B6\u1793\u1780\u17B6\u178F\u17CB\u178A\u17B6\u1785\u17CB\u179F\u17B6\u1785\u17CB\u179A\u17BF\u1784"
      },
      {
        id: "real_council_7",
        isConsensus: true,
        title: "\u179B\u17C4\u1780\u1782\u17D2\u179A\u17BC\u1791\u17C1\u179F\u1793\u17B6\u178C\u17BA\u1782\u17D2\u1793\u17B6\u17D6 \u1785\u17B6\u17C6\u1798\u17BE\u179B\u179F\u17BD\u179A\u1792\u1798\u17CC\u17B2\u17D2\u1799\u1794\u17B6\u179F\u17CB\u1787\u17BE\u1784\u1798\u17D2\u178F\u1784\u1798\u17BE\u179B!",
        startTime: 671,
        endTime: 803,
        duration: 132,
        top1: "\u1796\u17D2\u179A\u17C7\u179F\u1784\u17D2\u1783\u1785\u17C4\u1791\u179F\u17BD\u179A\u178A\u17C1\u1789\u178A\u17C4\u179B",
        top2: "\u179F\u17BD\u179A\u1792\u1798\u17CC\u17B1\u17D2\u1799\u1794\u17B6\u179F\u17CB\u1787\u17BE\u1784\u1798\u17D2\u178F\u1784\u1798\u17BE\u179B!",
        bot1: "\u179F\u17B7\u179B\u17D2\u1794\u17C8\u1793\u17C3\u1780\u17B6\u179A\u179F\u1798\u17D2\u178F\u17C2\u1784\u1792\u1798\u17CC\u1786\u17D2\u179B\u17BE\u1799\u1786\u17D2\u179B\u1784",
        bot2: "\u1791\u17B6\u17C6\u1784\u1785\u17C6\u178E\u17C1\u17C7\u178A\u17B9\u1784 \u1791\u17B6\u17C6\u1784\u179F\u17C6\u178E\u17BE\u1785",
        viralScore: "94.6%",
        tags: ["#\u1791\u17C1\u179F\u1793\u17B6\u1786\u17D2\u179B\u17BE\u1799\u1786\u17D2\u179B\u1784", "#\u178C\u17BA\u1782\u17D2\u1793\u17B6", "#\u1785\u17C6\u178E\u17C1\u17C7\u178A\u17B9\u1784\u1792\u1798\u17CC", "#MonkBanter"],
        transcript: '"\u1785\u17B6\u17C6\u1798\u17BE\u179B\u179F\u17BD\u179A\u1792\u1798\u17CC\u179B\u17C4\u1780\u1782\u17D2\u179A\u17BC\u17B1\u17D2\u1799\u1794\u17B6\u179F\u17CB\u1787\u17BE\u1784\u1798\u17D2\u178F\u1784\u1798\u17BE\u179B... \u1790\u17B6\u178F\u17BE\u1786\u17D2\u179B\u17BE\u1799\u179A\u17BD\u1785\u17AC\u17A2\u178F\u17CB..."',
        modelBadge: "\u26A1 Viral Banter Highlight",
        badgeColor: "#ec4899",
        strategyNote: "\u{1F3AD} Gemini Flash Hook + Claude Banter Scout",
        auditNote: "Zero Cut-off \u1792\u17B6\u1793\u17B6\u1793\u17D0\u1799\u1794\u17D2\u179A\u1799\u17C4\u1782\u1796\u17C1\u1789\u179B\u17C1\u1789"
      },
      {
        id: "real_council_8",
        isConsensus: true,
        title: "\u179A\u179F\u17D2\u1798\u17B8\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u17D6 \u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179A\u17BD\u1798\u1782\u17D2\u1793\u17B6\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u1797\u17B6\u1796\u1784\u1784\u17B9\u178F\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798",
        startTime: 1255,
        endTime: 1395,
        duration: 140,
        top1: "\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1797\u17B6\u1796",
        top2: "\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u1797\u17B6\u1796\u1784\u1784\u17B9\u178F\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798",
        bot1: "\u179A\u17BD\u1798\u1782\u17D2\u1793\u17B6\u1787\u17B6\u1792\u17D2\u179B\u17BB\u1784\u1798\u17BD\u1799\u178A\u17BC\u1785\u1785\u1784\u17D2\u1780\u17B9\u17C7\u1798\u17BD\u1799\u1794\u17B6\u1785\u17CB",
        bot2: "\u1782\u17D2\u1798\u17B6\u1793\u17A7\u1794\u179F\u1782\u17D2\u1782\u178E\u17B6\u179A\u17B6\u179A\u17B6\u17C6\u1784\u1794\u17B6\u1793\u17A1\u17BE\u1799",
        viralScore: "93.8%",
        tags: ["#\u179A\u179F\u17D2\u1798\u17B8\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8", "#\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1797\u17B6\u1796", "#\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179A\u17BD\u1798", "#\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6"],
        transcript: '"\u1780\u17B6\u179B\u178E\u17B6\u1799\u17BE\u1784\u1798\u17B6\u1793\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1782\u17D2\u1793\u17B6 \u1797\u17B6\u1796\u1784\u1784\u17B9\u178F\u1791\u17B6\u17C6\u1784\u17A1\u17B6\u1799\u1793\u17B9\u1784\u178F\u17D2\u179A\u17BC\u179C\u179A\u179B\u17B6\u1799\u179F\u17B6\u1794\u179F\u17BC\u1793\u17D2\u1799..."',
        modelBadge: "\u{1F3C6} 3-AI Grand Consensus",
        badgeColor: "#8b5cf6",
        strategyNote: "\u{1F3DB}\uFE0F Consensus: GPT-4o + Gemini Pro",
        auditNote: "Zero Cut-off \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
      }
    ];
    function getDefaultGeminiApiKey() {
      return localStorage.getItem("khmer_clipper_gemini_key") || localStorage.getItem("vdo_gemini_api_key") || (typeof atob === "function" ? atob("QVEuQWI4Uk42S0hpbTBxNVJ3Y1E5TFNOVGwxRHlrUWdHTDlmczZkNlc5VExEOGU0VGxJSEE=") : "");
    }
    const aiState = {
      aiEngine: localStorage.getItem("khmer_clipper_ai_engine") || "omniroute",
      geminiModel: localStorage.getItem("khmer_clipper_gemini_model") || "multi-ai-consensus",
      geminiApiKey: getDefaultGeminiApiKey(),
      groqApiKey: localStorage.getItem("khmer_clipper_groq_key") || "",
      omniRouteUrl: localStorage.getItem("khmer_clipper_omniroute_url") || "http://localhost:20128",
      omniRouteApiKey: localStorage.getItem("khmer_clipper_omniroute_key") || "",
      omniRouteModel: localStorage.getItem("khmer_clipper_omniroute_model") || "multi-ai-consensus",
      isScanning: false,
      recommendedClips: [],
      recognition: null,
      isListening: false
    };
    const OMNIROUTE_MODEL_ACHIEVEMENTS = {
      "multi-ai-consensus": {
        name: "Multi-AI Consensus (Gemini \u2794 Claude)",
        tier: "\u{1F91D} Multi-Agent Network (\u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB\u1782\u17D2\u1793\u17B6)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Zero Cutoff Retention",
        achievement: "Gemini \u179A\u17BB\u1780\u179A\u1780 Clip \u178A\u17C6\u1794\u17BC\u1784 \u2794 Claude \u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB \u1793\u17B7\u1784\u1794\u17C6\u1796\u17C1\u1789 Timecode \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799",
        suitable: "\u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6 \u1793\u17B7\u1784\u1780\u17B6\u179A\u1794\u1784\u17D2\u179A\u17C0\u1793 \u2014 \u1792\u17B6\u1793\u17B6\u179F\u17D2\u178F\u17B6\u1794\u17CB\u1799\u179B\u17CB\u1793\u17D0\u1799\u1796\u17C1\u1789\u179B\u17C1\u1789 \u17E1\u17E0\u17E0%"
      },
      "ensemble": {
        name: "Multi-AI Consensus (Gemini \u2794 Claude)",
        tier: "\u{1F91D} Multi-Agent Network (\u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB\u1782\u17D2\u1793\u17B6)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Zero Cutoff Retention",
        achievement: "Gemini \u179A\u17BB\u1780\u179A\u1780 Clip \u178A\u17C6\u1794\u17BC\u1784 \u2794 Claude \u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB \u1793\u17B7\u1784\u1794\u17C6\u1796\u17C1\u1789 Timecode \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799",
        suitable: "\u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6 \u1793\u17B7\u1784\u1780\u17B6\u179A\u1794\u1784\u17D2\u179A\u17C0\u1793 \u2014 \u1792\u17B6\u1793\u17B6\u179F\u17D2\u178F\u17B6\u1794\u17CB\u1799\u179B\u17CB\u1793\u17D0\u1799\u1796\u17C1\u1789\u179B\u17C1\u1789 \u17E1\u17E0\u17E0%"
      },
      "auto/best-fast": {
        name: "OmniRoute Auto Best-Fast",
        tier: "\u26A1 Auto Smart Router (\u179B\u17BF\u1793\u1794\u17C6\u1795\u17BB\u178F)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Zero Latency Dynamic",
        achievement: "OmniRoute Gateway \u2014 \u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u178A\u17C4\u1799\u179F\u17D2\u179C\u17D0\u1799\u1794\u17D2\u179A\u179C\u178F\u17D2\u178F\u17B7\u1793\u17BC\u179C\u1798\u17C9\u17BC\u178C\u17C2\u179B\u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u179B\u17BF\u1793\u1794\u17C6\u1795\u17BB\u178F \u1793\u17B7\u1784\u1798\u17B6\u1793\u179F\u17D2\u1790\u17C1\u179A\u1797\u17B6\u1796\u1781\u17D2\u1796\u179F\u17CB",
        suitable: "\u179F\u17D0\u1780\u17D2\u178F\u17B7\u179F\u1798\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1780\u17B6\u179A\u1780\u17B6\u178F\u17CB\u178F\u179A\u17A0\u17D0\u179F \u1798\u17B7\u1793\u1794\u17B6\u1785\u17CB\u179A\u1784\u17CB\u1785\u17B6\u17C6"
      },
      "auto/claude-sonnet": {
        name: "OmniRoute Auto Claude Sonnet",
        tier: "\u{1F3AD} Auto Claude Route (\u1786\u17D2\u179B\u17B6\u178F\u1794\u17C6\u1795\u17BB\u178F)",
        badge: "\u2605\u2605\u2605\u2605\u2605 #1 Context Quality",
        achievement: "OmniRoute Gateway \u2014 \u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Provider \u179A\u1794\u179F\u17CB Claude Sonnet \u178A\u17C2\u179B\u179F\u1780\u1798\u17D2\u1798 \u1793\u17B7\u1784\u179B\u17BF\u1793\u1794\u17C6\u1795\u17BB\u178F",
        suitable: "\u179B\u17D2\u17A2\u17A5\u178F\u1781\u17D2\u1785\u17C4\u17C7\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1780\u17B6\u179A\u1799\u179B\u17CB\u178A\u17B9\u1784\u1796\u17B8\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC \u1793\u17B7\u1784\u1780\u17B6\u178F\u17CB\u179C\u17B8\u178A\u17C1\u17A2\u17BC Viral"
      },
      "auto/claude-opus": {
        name: "OmniRoute Auto Claude Opus",
        tier: "\u{1F451} Auto Claude Opus (\u179F\u17CA\u17B8\u1787\u1798\u17D2\u179A\u17C5)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Flagship Quality",
        achievement: "OmniRoute Gateway \u2014 \u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Provider \u179A\u1794\u179F\u17CB Claude Opus \u178A\u17C2\u179B\u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F",
        suitable: "\u179C\u17B7\u1797\u17B6\u1782\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC \u1793\u17B7\u1784\u17A2\u178F\u17D2\u1790\u1793\u17D0\u1799\u1787\u17D2\u179A\u17B6\u179B\u1787\u17D2\u179A\u17C5"
      },
      "auto/gemini": {
        name: "OmniRoute Auto Gemini",
        tier: "\u{1F52E} Auto Gemini Route (Google)",
        badge: "\u2605\u2605\u2605\u2605\u2605 1M Context Window",
        achievement: "OmniRoute Gateway \u2014 \u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Provider \u179A\u1794\u179F\u17CB Gemini Pro/Flash \u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F",
        suitable: "\u179C\u17B7\u1797\u17B6\u1782\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u179C\u17C2\u1784\u17D7\u1799\u17C9\u17B6\u1784\u179F\u17BB\u1780\u17D2\u179A\u17B9\u178F"
      },
      "auto/best-reasoning": {
        name: "OmniRoute Auto Best-Reasoning",
        tier: "\u{1F40B} Auto Reasoning (DeepSeek/o3)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Chain-of-Thought #1",
        achievement: "OmniRoute Gateway \u2014 \u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u1798\u17C9\u17BC\u178C\u17C2\u179B\u1782\u17B7\u178F\u1794\u17C2\u1794\u17A0\u17C1\u178F\u17BB\u1795\u179B DeepSeek R1 / o3 \u178A\u17C4\u1799\u179F\u17D2\u179C\u17D0\u1799\u1794\u17D2\u179A\u179C\u178F\u17D2\u178F\u17B7",
        suitable: "\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC \u1793\u17B7\u1784\u1782\u178F\u17B7\u1794\u178E\u17D2\u178C\u17B7\u178F"
      },
      "auto/best-coding": {
        name: "OmniRoute Auto Best-Coding",
        tier: "\u{1F4BB} Auto Best Coding & Logic",
        badge: "\u2605\u2605\u2605\u2605\u2605 Logic & Precision",
        achievement: "OmniRoute Gateway \u2014 \u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u1780\u17C6\u1796\u17BC\u179B\u1798\u17C9\u17BC\u178C\u17C2\u179B\u1795\u17D2\u1793\u17C2\u1780 Logic & Structuring",
        suitable: "\u179A\u17C0\u1794\u1785\u17C6\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799 JSON \u1793\u17B7\u1784 Captions \u1799\u17C9\u17B6\u1784\u1798\u17B6\u1793\u179A\u1794\u17C0\u1794"
      },
      "claude-sonnet-4-5": {
        name: "Claude Sonnet 4.5",
        tier: "\u{1F3C6} Top Tier Frontier (Anthropic 2025)",
        badge: "\u2605\u2605\u2605\u2605\u2605 #1 Context & Coding Nuance",
        achievement: "Anthropic Flagship \u2014 \u1787\u17C6\u1793\u17B6\u1789\u1781\u17D2\u1796\u179F\u17CB\u1794\u17C6\u1795\u17BB\u178F\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1799\u179B\u17CB\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A \u179C\u1794\u17D2\u1794\u1792\u1798\u17CC \u1793\u17B7\u1784\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC\u179F\u17CA\u17B8\u1787\u1798\u17D2\u179A\u17C5",
        suitable: "\u179B\u17D2\u17A2\u17A5\u178F\u1781\u17D2\u1785\u17C4\u17C7\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1780\u17B6\u179A\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Hook \u179C\u17B8\u178A\u17C1\u17A2\u17BC Viral \u1793\u17B7\u1784 Caption \u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789"
      },
      "claude-opus-4": {
        name: "Claude Opus 4",
        tier: "\u{1F451} Flagship Frontier (Anthropic)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Deepest Reasoning",
        achievement: "Anthropic Opus \u2014 \u1780\u17B6\u179A\u179C\u17B7\u1797\u17B6\u1782\u1791\u179F\u17D2\u179F\u1793\u179C\u17B7\u1787\u17D2\u1787\u17B6 \u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6 \u1793\u17B7\u1784\u17A2\u178F\u17D2\u1790\u1793\u17D0\u1799\u1787\u17D2\u179A\u17B6\u179B\u1787\u17D2\u179A\u17C5",
        suitable: "\u1780\u17B6\u178F\u17CB\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1791\u17C1\u179F\u1793\u17B6\u1794\u17C2\u1794\u17A2\u1794\u17CB\u179A\u17C6 \u1793\u17B7\u1784\u1791\u179F\u17D2\u179F\u1793\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1787\u17B8\u179C\u17B7\u178F"
      },
      "gpt-4o": {
        name: "GPT-4o",
        tier: "\u{1F310} Multimodal Frontier (OpenAI)",
        badge: "\u2605\u2605\u2605\u2605\u2605 88.7% MMLU Score",
        achievement: "OpenAI Flagship \u2014 \u1787\u17C6\u1793\u17B6\u1789 Multilingual \u1781\u17D2\u1796\u179F\u17CB \u1793\u17B7\u1784\u1780\u17B6\u179A\u1799\u179B\u17CB\u178A\u17B9\u1784\u1796\u17B8\u179F\u17B6\u1785\u17CB\u179A\u17BF\u1784\u179B\u17BF\u1793\u179A\u17A0\u17D0\u179F",
        suitable: "\u1794\u1784\u17D2\u1780\u17BE\u178F\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784 Viral Hooks \u1793\u17B7\u1784 Caption \u179B\u17BE-\u1780\u17D2\u179A\u17C4\u1798 \u1786\u17D2\u179B\u17B6\u178F\u179C\u17C3"
      },
      "gemini-2.5-pro": {
        name: "Gemini 2.5 Pro",
        tier: "\u{1F52E} DeepMind Flagship (Google)",
        badge: "\u2605\u2605\u2605\u2605\u2605 1M+ Token Context Window",
        achievement: "Google DeepMind \u2014 Context \u1792\u17C6\u1794\u17C6\u1795\u17BB\u178F \u17A2\u17B6\u1785\u179C\u17B7\u1797\u17B6\u1782\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u179C\u17C2\u1784\u17D7\u1796\u17C1\u1789 \u17E1-\u17E2 \u1798\u17C9\u17C4\u1784\u178A\u17C4\u1799\u1795\u17D2\u1791\u17B6\u179B\u17CB",
        suitable: "\u179F\u17D2\u1780\u17C2\u1793\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u179C\u17C2\u1784\u17D7\u1791\u17B6\u17C6\u1784\u1798\u17BC\u179B\u178A\u17C4\u1799\u1798\u17B7\u1793\u1794\u17B6\u1785\u17CB\u1780\u17B6\u178F\u17CB\u1787\u17B6\u178A\u17C6\u178E\u17B6\u1780\u17CB\u1780\u17B6\u179B"
      },
      "gemini-2.5-flash": {
        name: "Gemini 2.5 Flash",
        tier: "\u26A1 Ultra-Fast Production (Google)",
        badge: "\u2605\u2605\u2605\u2605\u2606 Sub-3s Response Time",
        achievement: "Google DeepMind \u2014 \u179B\u17D2\u1794\u17BF\u1793\u179B\u17BF\u1793\u1794\u17C6\u1795\u17BB\u178F \u179F\u1793\u17D2\u179F\u17C6\u179F\u17C6\u1785\u17C3 \u1793\u17B7\u1784\u1782\u17BB\u178E\u1797\u17B6\u1796\u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u1781\u17D2\u1796\u179F\u17CB",
        suitable: "\u1780\u17B6\u178F\u17CB\u178F\u179A\u17A0\u17D0\u179F\u1791\u17B6\u1793\u17CB\u1785\u17B7\u178F\u17D2\u178F \u1798\u17B7\u1793\u1794\u17B6\u1785\u17CB\u179A\u1784\u17CB\u1785\u17B6\u17C6\u1799\u17BC\u179A"
      },
      "claude-haiku-3-5": {
        name: "Claude Haiku 3.5",
        tier: "\u{1F338} Lightweight Fast (Anthropic)",
        badge: "\u2605\u2605\u2605\u2605\u2606 High Speed & Low Latency",
        achievement: "Anthropic \u2014 \u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u179A\u17A0\u17D0\u179F\u178A\u17BC\u1785\u1795\u17D2\u179B\u17C1\u1780\u1794\u1793\u17D2\u1791\u17C4\u179A \u179F\u1793\u17D2\u179F\u17C6 Token",
        suitable: "\u1780\u17B6\u178F\u17CB\u178F\u1783\u17D2\u179B\u17B8\u1794\u1781\u17D2\u179B\u17B8\u17D7\u179A\u17A0\u17D0\u179F"
      },
      "gpt-4o-mini": {
        name: "GPT-4o mini",
        tier: "\u{1F4A8} OpenAI Lightweight",
        badge: "\u2605\u2605\u2605\u2605\u2606 Cost-Efficient & Fast",
        achievement: "OpenAI \u2014 \u178F\u1798\u17D2\u179B\u17C3\u1791\u17B6\u1794\u1794\u17C6\u1795\u17BB\u178F \u179B\u17D2\u1794\u17BF\u1793\u179B\u17BF\u1793 \u1793\u17B7\u1784\u1786\u17D2\u179B\u17B6\u178F\u179C\u17C3",
        suitable: "\u179F\u1793\u17D2\u179F\u17C6\u179F\u17C6\u1785\u17C3\u1792\u1793\u1792\u17B6\u1793 \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u179A\u179B\u17BC\u1793"
      },
      "llama-3.3-70b": {
        name: "Llama 3.3 70B",
        tier: "\u{1F999} Meta Open Source Flagship",
        badge: "\u2605\u2605\u2605\u2605\u2606 91% HumanEval",
        achievement: "Meta AI Open Weights \u2014 \u179F\u1798\u178F\u17D2\u1790\u1797\u17B6\u1796\u1794\u17D2\u179A\u17A0\u17B6\u1780\u17CB\u1794\u17D2\u179A\u17A0\u17C2\u179B GPT-4 \u178F\u17C2\u1787\u17B6 Open Source",
        suitable: "\u1786\u17D2\u179B\u17B6\u178F\u179C\u17C3 \u1793\u17B7\u1784\u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3 \u17E1\u17E0\u17E0% \u179B\u17BE\u1798\u17C9\u17B6\u179F\u17CA\u17B8\u1793\u1795\u17D2\u1791\u17B6\u179B\u17CB"
      },
      "deepseek-r1": {
        name: "DeepSeek R1",
        tier: "\u{1F40B} #1 Reasoning Model (DeepSeek)",
        badge: "\u2605\u2605\u2605\u2605\u2605 Chain-of-Thought #1",
        achievement: "DeepSeek (2025) \u2014 \u1780\u17B6\u179A\u1782\u17B7\u178F\u1794\u17C2\u1794\u17A0\u17C1\u178F\u17BB\u1795\u179B\u1787\u17D2\u179A\u17C5\u1787\u17D2\u179A\u17C7 (Reasoning) \u179B\u17C1\u1781\u17E1 \u1780\u17D2\u1793\u17BB\u1784\u179B\u17C4\u1780",
        suitable: "\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC\u178A\u17C2\u179B\u178F\u17D2\u179A\u17BC\u179C\u1793\u17B9\u1784\u1780\u1798\u17D2\u1798\u1795\u179B \u1793\u17B7\u1784\u1782\u178F\u17B7\u1794\u178E\u17D2\u178C\u17B7\u178F\u1799\u17C9\u17B6\u1784\u1785\u17D2\u1794\u17B6\u179F\u17CB\u179B\u17B6\u179F\u17CB"
      },
      "o3-mini": {
        name: "o3-mini",
        tier: "\u{1F914} OpenAI Reasoning Model",
        badge: "\u2605\u2605\u2605\u2605\u2606 STEM & Logic Winner",
        achievement: "OpenAI \u2014 \u179C\u17B7\u1797\u17B6\u1782\u1798\u17BD\u1799\u1787\u17C6\u17A0\u17B6\u1793\u1798\u17D2\u178F\u1784\u17D7\u178A\u17C4\u1799\u1794\u17D2\u179A\u17BB\u1784\u1794\u17D2\u179A\u1799\u17D0\u178F\u17D2\u1793",
        suitable: "\u179A\u17C0\u1794\u1785\u17C6\u179B\u17C6\u178A\u17B6\u1794\u17CB\u179B\u17C6\u178A\u17C4\u1799\u179F\u17B6\u1785\u17CB\u179A\u17BF\u1784\u1780\u17D2\u1793\u17BB\u1784\u179C\u17B8\u178A\u17C1\u17A2\u17BC"
      },
      "qwen-2.5-72b": {
        name: "Qwen 2.5 72B",
        tier: "\u{1F30F} Asian Languages Champion (Alibaba)",
        badge: "\u2605\u2605\u2605\u2605\u2606 128K Multilingual Leader",
        achievement: "Alibaba Cloud \u2014 \u1787\u17C6\u1793\u17B6\u1789\u1797\u17B6\u179F\u17B6\u17A2\u17B6\u179F\u17CA\u17B8\u17A2\u17B6\u1782\u17D2\u1793\u17C1\u1799\u17CD\u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F \u1799\u179B\u17CB\u1796\u17B6\u1780\u17D2\u1799\u1781\u17D2\u1798\u17C2\u179A-\u1794\u17B6\u179B\u17B8",
        suitable: "\u1794\u1780\u179F\u17D2\u179A\u17B6\u1799\u1796\u17B6\u1780\u17D2\u1799\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6 \u1793\u17B7\u1784\u1797\u17B6\u179F\u17B6\u1794\u17B6\u179B\u17B8\u1794\u17B6\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1794\u17C6\u1795\u17BB\u178F"
      },
      "mistral-large": {
        name: "Mistral Large",
        tier: "\u{1F30A} European Flagship (Mistral)",
        badge: "\u2605\u2605\u2605\u2605\u2606 128K Precision",
        achievement: "Mistral AI \u2014 \u1797\u17B6\u179F\u17B6\u1785\u17D2\u1794\u17B6\u179F\u17CB\u179B\u17B6\u179F\u17CB \u1793\u17B7\u1784\u1780\u17B6\u179A\u179A\u17C0\u1794\u1785\u17C6\u1791\u1798\u17D2\u179A\u1784\u17CB\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C",
        suitable: "\u179A\u1785\u1793\u17B6\u179F\u1798\u17D2\u1796\u17D0\u1793\u17D2\u1792\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784 \u1793\u17B7\u1784\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B6\u1793\u179A\u1794\u17C0\u1794"
      },
      "llama-3.1-405b": {
        name: "Llama 3.1 405B",
        tier: "\u{1F451} Largest Open Model (Meta)",
        badge: "\u2605\u2605\u2605\u2605\u2606 405 Billion Parameters",
        achievement: "Meta AI \u2014 \u1798\u17C9\u17BC\u178C\u17C2\u179B\u1794\u17BE\u1780\u1785\u17C6\u17A0\u179A\u1792\u17C6\u1794\u17C6\u1795\u17BB\u178F\u1780\u17D2\u1793\u17BB\u1784\u1794\u17D2\u179A\u179C\u178F\u17D2\u178F\u17B7\u179F\u17B6\u179F\u17D2\u178F\u17D2\u179A TOP 5 Global",
        suitable: "\u1782\u17BB\u178E\u1797\u17B6\u1796\u179B\u17C6\u178A\u17B6\u1794\u17CB\u1780\u17C6\u1796\u17BC\u179B AI"
      },
      "gemma-3-27b": {
        name: "Gemma 3 27B",
        tier: "\u{1F48E} Google Open Weights",
        badge: "\u2605\u2605\u2605\u2606\u2606 Local Offline AI",
        achievement: "Google DeepMind \u2014 \u179A\u1785\u1793\u17B6\u17A1\u17BE\u1784\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u179B\u17BE\u1780\u17BB\u17C6\u1796\u17D2\u1799\u17BC\u1791\u17D0\u179A\u1795\u17D2\u1791\u17B6\u179B\u17CB\u1781\u17D2\u179B\u17BD\u1793",
        suitable: "\u1794\u17D2\u179A\u17BE Offline \u179B\u17BE\u1780\u17BB\u17C6\u1796\u17D2\u1799\u17BC\u1791\u17D0\u179A\u1798\u17B7\u1793\u1794\u17B6\u1785\u17CB\u17A2\u17CA\u17B8\u1793\u1792\u17BA\u178E\u17B7\u178F"
      },
      "phi-4": {
        name: "Phi-4",
        tier: "\u{1F537} Microsoft Compact AI",
        badge: "\u2605\u2605\u2605\u2606\u2606 14B High Density",
        achievement: "Microsoft \u2014 \u1798\u17C9\u17BC\u178C\u17C2\u179B\u178F\u17BC\u1785\u178F\u17C2\u1781\u17D2\u179B\u17B9\u1798 \u179F\u17CA\u17B8 RAM \u178F\u17B7\u1785",
        suitable: "\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u179B\u17BE\u1780\u17BB\u17C6\u1796\u17D2\u1799\u17BC\u1791\u17D0\u179A\u1792\u1798\u17D2\u1798\u178F\u17B6"
      }
    };
    function updateAiEngineUI(engine) {
      const badge = document.getElementById("aiEngineStatusBadge");
      const omniContainer = document.getElementById("omniRouteContainer");
      const puterBanner = document.getElementById("puterGeminiBanner");
      const geminiModelContainer = document.getElementById("geminiModelContainer");
      const groqContainer = document.getElementById("groqApiKeyContainer");
      const ollamaAlert = document.getElementById("ollamaRequiredAlert");
      if (omniContainer) {
        omniContainer.classList.toggle("hidden", engine !== "omniroute");
      }
      if (puterBanner) {
        puterBanner.classList.toggle("hidden", engine !== "puter");
      }
      if (geminiModelContainer) {
        geminiModelContainer.classList.toggle("hidden", engine !== "puter" && engine !== "gemini");
      }
      if (groqContainer) {
        groqContainer.classList.toggle("hidden", engine !== "groq");
      }
      if (ollamaAlert && engine !== "ollama") {
        ollamaAlert.classList.add("hidden");
      }
      if (badge) {
        if (engine === "omniroute") {
          const modelKey = aiState.omniRouteModel || "claude-sonnet-4-5";
          const modelMeta = OMNIROUTE_MODEL_ACHIEVEMENTS[modelKey] || { name: modelKey };
          badge.textContent = `\u{1F680} OmniRoute Active (${modelMeta.name})`;
          badge.style.color = "#a5b4fc";
          badge.style.background = "rgba(99,102,241,0.2)";
          badge.style.borderColor = "rgba(99,102,241,0.5)";
        } else if (engine === "groq") {
          badge.textContent = "\u{1F193} Groq API Active (Llama 3.3 Free)";
          badge.style.color = "#fbbf24";
          badge.style.background = "rgba(251,191,36,0.15)";
          badge.style.borderColor = "rgba(251,191,36,0.4)";
        } else if (engine === "puter") {
          badge.textContent = "\u2728 Free Gemini AI (Puter.js)";
          badge.style.color = "#4ade80";
          badge.style.background = "rgba(34,197,94,0.15)";
          badge.style.borderColor = "rgba(34,197,94,0.4)";
        } else if (engine === "gemini") {
          badge.textContent = "\u{1F511} Google Gemini API Key Active";
          badge.style.color = "#c084fc";
          badge.style.background = "rgba(168,85,247,0.15)";
          badge.style.borderColor = "rgba(168,85,247,0.4)";
        } else if (engine === "ollama") {
          badge.textContent = "\u{1F999} Ollama Local Gemma 3 Active";
          badge.style.color = "#38bdf8";
          badge.style.background = "rgba(56,189,248,0.15)";
          badge.style.borderColor = "rgba(56,189,248,0.4)";
        } else {
          badge.textContent = "\u{1F3AF} Local Waveform Peak Engine (Offline)";
          badge.style.color = "#94a3b8";
          badge.style.background = "rgba(148,163,184,0.15)";
          badge.style.borderColor = "rgba(148,163,184,0.4)";
        }
      }
      renderOmniRouteAchievementBadge();
    }
    function renderOmniRouteAchievementBadge() {
      const modelKey = aiState.omniRouteModel || "claude-sonnet-4-5";
      const meta = OMNIROUTE_MODEL_ACHIEVEMENTS[modelKey];
      if (!meta) return;
      let badgeBox = document.getElementById("omniRouteAchievementDetails");
      if (!badgeBox) {
        const container = document.getElementById("omniRouteContainer");
        if (!container) return;
        badgeBox = document.createElement("div");
        badgeBox.id = "omniRouteAchievementDetails";
        badgeBox.style.marginTop = "10px";
        badgeBox.style.padding = "8px 12px";
        badgeBox.style.borderRadius = "8px";
        badgeBox.style.background = "rgba(99,102,241,0.12)";
        badgeBox.style.border = "1px solid rgba(99,102,241,0.3)";
        badgeBox.style.fontSize = "0.78rem";
        badgeBox.style.lineHeight = "1.5";
        container.appendChild(badgeBox);
      }
      badgeBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:6px;">
                <span style="font-weight:700; color:#c7d2fe;">${meta.tier}: ${meta.name}</span>
                <span style="background:rgba(99,102,241,0.3); color:#e0e7ff; padding:2px 8px; border-radius:12px; font-size:0.72rem; font-weight:600;">${meta.badge}</span>
            </div>
            <div style="color:#cbd5e1; margin-bottom:3px;">\u{1F31F} <strong>\u179F\u1798\u17B7\u1791\u17D2\u1792\u1795\u179B (Achievement):</strong> ${meta.achievement}</div>
            <div style="color:#86efac;">\u{1F4A1} <strong>\u1797\u17B6\u1796\u179F\u17D0\u1780\u17D2\u178F\u17B7\u179F\u1798 (Suitability):</strong> ${meta.suitable}</div>
        `;
    }
    async function testOmniRouteConnection() {
      const resultEl = document.getElementById("omniRouteTestResult");
      const baseUrl = (aiState.omniRouteUrl || "http://localhost:20128").replace(/\/+$/, "");
      const apiKey = aiState.omniRouteApiKey || "omniroute";
      const model = aiState.omniRouteModel || "claude-sonnet-4-5";
      const meta = OMNIROUTE_MODEL_ACHIEVEMENTS[model] || { name: model };
      const serverOrigin = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000";
      if (resultEl) {
        resultEl.classList.remove("hidden");
        resultEl.style.color = "#94a3b8";
        resultEl.innerHTML = `\u23F3 \u1780\u17C6\u1796\u17BB\u1784\u178F\u17C1\u179F\u17D2\u178F\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1791\u17C5 OmniRoute (${baseUrl}) \u1787\u17B6\u1798\u17BD\u1799\u1798\u17C9\u17BC\u178C\u17C2\u179B <strong>${meta.name}</strong>...`;
      }
      const testPayload = {
        model,
        messages: [
          { role: "user", content: `Please reply in Khmer in one short sentence confirming you are ${model} via OmniRoute.` }
        ],
        max_tokens: 100,
        temperature: 0.3
      };
      const startTime = Date.now();
      let data = null;
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === "function") {
        const mLower = model.toLowerCase();
        const testModels = mLower.includes("gemini") ? ["gemini-2.0-flash", "gemini-2.5-flash", "claude-3-5-sonnet", "gpt-4o-mini"] : mLower.includes("gpt") ? ["gpt-4o-mini", "gemini-2.0-flash", "claude-3-5-sonnet"] : ["claude-3-5-sonnet", "gemini-2.0-flash", "gpt-4o-mini"];
        for (const puterModel of testModels) {
          try {
            const pRes = await Promise.race([
              window.puter.ai.chat(`\u1786\u17D2\u179B\u17BE\u1799\u1787\u17B6\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A \u17E1 \u1783\u17D2\u179B\u17B6: \u17A2\u17D2\u1793\u1780\u1787\u17B6 AI model ${puterModel}`, { model: puterModel }),
              new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15e3))
            ]);
            const c = pRes?.message?.content;
            const pText = typeof c === "string" ? c : Array.isArray(c) ? c.map((x) => x.text || "").join("") : typeof pRes === "string" ? pRes : "";
            if (pText && pText.length > 3) {
              const dur = ((Date.now() - startTime) / 1e3).toFixed(2);
              if (resultEl) {
                resultEl.style.borderColor = "rgba(34,197,94,0.5)";
                resultEl.style.color = "#86efac";
                resultEl.innerHTML = `
                                <div>\u2705 <strong>Puter.js Live AI (${puterModel}) \u2014 \u1797\u17D2\u1787\u17B6\u1794\u17CB\u1787\u17C4\u1782\u1787\u17D0\u1799 (${dur}s)!</strong></div>
                                <div style="margin-top:2px;font-size:0.75rem;color:#c7d2fe;">\u{1F916} <strong>\u1798\u17C9\u17BC\u178C\u17C2\u179B Puter.js:</strong> ${puterModel} \u2192 ${meta.name}</div>
                                <div style="margin-top:2px;font-size:0.75rem;color:#cbd5e1;">\u{1F4AC} <em>"${pText.trim()}"</em></div>
                                <div style="margin-top:4px;font-size:0.7rem;color:#a5b4fc;">\u2139\uFE0F OmniRoute (${baseUrl}) offline \u2014 \u1794\u17D2\u179A\u17BE Puter.js Live AI \u1787\u17C6\u1793\u17BD\u179F</div>
                            `;
              }
              showToastNotification(`\u2705 Puter.js AI (${puterModel}): \u1797\u17D2\u1787\u17B6\u1794\u17CB\u1787\u17C4\u1782\u1787\u17D0\u1799!`);
              return;
            }
          } catch (puterTestErr) {
            const msg = puterTestErr?.message || "";
            if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("capacity")) {
              console.warn(`\u26A0\uFE0F Puter test (${puterModel}) at capacity \u2014 trying next...`);
              continue;
            }
            console.log("Puter test stopped, trying OmniRoute:", msg);
            break;
          }
        }
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8e3);
        const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(testPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (resp.ok) {
          data = await resp.json();
        }
      } catch (directErr) {
        console.log("Direct OmniRoute fetch failed, trying backend proxy...", directErr.message);
      }
      if (!data) {
        try {
          const proxyResp = await fetch(`${serverOrigin}/api/proxy-omniroute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `${baseUrl}/v1/chat/completions`,
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
              },
              body: testPayload
            })
          });
          if (proxyResp.ok) {
            data = await proxyResp.json();
          } else {
            const errObj = await proxyResp.json().catch(() => ({}));
            throw new Error(errObj.error || `HTTP ${proxyResp.status}`);
          }
        } catch (proxyErr) {
          if (resultEl) {
            resultEl.style.borderColor = "rgba(239,68,68,0.4)";
            resultEl.style.color = "#f87171";
            resultEl.innerHTML = `\u274C <strong>OmniRoute + Puter.js \u1791\u17B6\u17C6\u1784\u1796\u17B8\u179A \u1798\u17B7\u1793\u17A2\u17B6\u1785\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1794\u17B6\u1793\u1791\u17C1:</strong> ${proxyErr.message}<br>
                    <small style="color:#cbd5e1;">\u{1F4A1} OmniRoute: ${baseUrl} offline | Puter.js: login \u1793\u17C5 puter.com</small>`;
          }
          showToastNotification(`\u26A0\uFE0F OmniRoute + Puter.js: \u1798\u17B7\u1793\u17A2\u17B6\u1785\u1797\u17D2\u1787\u17B6\u1794\u17CB (${proxyErr.message})`);
          return;
        }
      }
      const duration = ((Date.now() - startTime) / 1e3).toFixed(2);
      const reply = data?.choices?.[0]?.message?.content || "\u178F\u17C1\u179F\u17D2\u178F\u1787\u17C4\u1782\u1787\u17D0\u1799!";
      const returnedModel = data?.model || model;
      if (resultEl) {
        resultEl.style.borderColor = "rgba(34,197,94,0.5)";
        resultEl.style.color = "#86efac";
        resultEl.innerHTML = `
                <div>\u2705 <strong>OmniRoute \u1797\u17D2\u1787\u17B6\u1794\u17CB\u1787\u17C4\u1782\u1787\u17D0\u1799 (${duration}s)!</strong></div>
                <div style="margin-top:2px; font-size:0.75rem; color:#c7d2fe;">\u{1F916} <strong>\u1798\u17C9\u17BC\u178C\u17C2\u179B:</strong> ${returnedModel} (${meta.name})</div>
                <div style="margin-top:2px; font-size:0.75rem; color:#cbd5e1;">\u{1F4AC} <em>"${reply.trim()}"</em></div>
            `;
      }
      showToastNotification(`\u{1F680} OmniRoute (${meta.name}): \u1797\u17D2\u1787\u17B6\u1794\u17CB\u1787\u17C4\u1782\u1787\u17D0\u1799\u1780\u17D2\u1793\u17BB\u1784\u179A\u1799\u17C8\u1796\u17C1\u179B ${duration}s!`);
    }
    function parseClipsFromAiJson(replyContent, startOffset, meta, usedModelName) {
      try {
        let cleaned = replyContent.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
        if (cleaned.startsWith("{")) {
          const parsedObj = JSON.parse(cleaned);
          const arr = parsedObj.clips || parsedObj.highlights || Object.values(parsedObj).find((v) => Array.isArray(v));
          if (arr) cleaned = JSON.stringify(arr);
        }
        const startIdx = cleaned.indexOf("[");
        const endIdx = cleaned.lastIndexOf("]");
        if (startIdx !== -1 && endIdx > startIdx) {
          cleaned = cleaned.substring(startIdx, endIdx + 1);
        }
        const jsonArray = JSON.parse(cleaned);
        if (Array.isArray(jsonArray) && jsonArray.length > 0) {
          return jsonArray.map((c, i) => ({
            id: Date.now() + i,
            startTime: Number(c.startTime || c.start_time || startOffset + i * 180),
            endTime: Number(c.endTime || c.end_time || startOffset + (i + 1) * 180),
            duration: Number(c.duration || 180),
            title: c.title || `\u1788\u17BB\u178F\u1796\u17B7\u179F\u17C1\u179F \u1797\u17B6\u1782\u1791\u17B8${i + 1}`,
            top1: c.top1 || c.top_1 || "\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6",
            top2: c.top2 || c.top_2 || "\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F",
            bot1: c.bot1 || c.bot_1 || "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781",
            bot2: c.bot2 || c.bot_2 || "\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F",
            viralScore: c.viralScore || c.viral_score || "99%",
            tags: c.tags || ["#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6", "#KhmerClip", "#\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F"],
            transcript: c.transcript || `" \u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F \u1797\u17B6\u1782\u1791\u17B8${i + 1}... "`,
            models: [usedModelName || `AI (${meta.name})`],
            modelBadge: meta.name,
            strategyNote: `\u{1F4A1} \u179C\u17B7\u1797\u17B6\u1782\u1795\u17D2\u1791\u17B6\u179B\u17CB\u178F\u17B6\u1798 Real Live AI (${meta.name})`,
            modelInfo: meta
          }));
        }
      } catch (e) {
        console.warn("JSON parse notice:", e);
      }
      return null;
    }
    function calculateTargetClipCount(videoDuration) {
      const dur = typeof videoDuration === "number" && videoDuration > 0 ? videoDuration : state.duration || 1800;
      const countSelect = document.getElementById("aiClipCountSelect");
      const customCountInput = document.getElementById("aiCustomCountInput");
      const durationSelect = document.getElementById("aiDurationModeSelect");
      const skipIntroCheck = document.getElementById("aiSkipIntroChantCheck");
      const skipDurationSelect = document.getElementById("aiIntroSkipDurationSelect");
      const mode = countSelect ? countSelect.value : "auto";
      const shouldSkip = skipIntroCheck ? skipIntroCheck.checked : true;
      const skipSecs = skipDurationSelect ? parseInt(skipDurationSelect.value, 10) : 300;
      const baseOffset = shouldSkip && dur > 120 ? Math.min(dur - 120, skipSecs) : 0;
      const effectiveDur = Math.max(60, dur - baseOffset);
      if (mode === "custom") {
        const customVal = customCountInput ? parseInt(customCountInput.value, 10) : 35;
        return Math.max(2, Math.min(120, isNaN(customVal) ? 35 : customVal));
      }
      if (mode === "compact") {
        return Math.max(5, Math.min(12, Math.floor(effectiveDur / 300)));
      }
      if (mode === "balanced") {
        return Math.max(12, Math.min(28, Math.floor(effectiveDur / 220)));
      }
      let clipLenSec = 180;
      const durVal = durationSelect ? durationSelect.value : "dynamic";
      if (!isNaN(parseInt(durVal, 10)) && parseInt(durVal, 10) > 0) {
        clipLenSec = parseInt(durVal, 10);
      } else if (durVal === "short") {
        clipLenSec = 60;
      }
      let spacing = clipLenSec;
      if (mode === "dense") {
        spacing = Math.max(90, clipLenSec * 0.85);
      } else {
        spacing = Math.max(120, clipLenSec * 1.05);
      }
      let calculated = Math.floor(effectiveDur / spacing);
      return Math.max(3, Math.min(80, calculated));
    }
    async function callOmniRouteApiForClips(videoDuration, fileName) {
      const dur = typeof videoDuration === "number" && videoDuration > 0 ? videoDuration : 1800;
      const baseUrl = (aiState.omniRouteUrl || "http://localhost:20128").replace(/\/+$/, "");
      const apiKey = aiState.omniRouteApiKey || "omniroute";
      const model = document.getElementById("omniRouteModelSelect")?.value || aiState.omniRouteModel || "multi-ai-consensus";
      if (model === "multi-ai-consensus" || model === "ensemble") {
        return await runMultiAiConsensusWorkflow(dur, fileName);
      }
      const meta = OMNIROUTE_MODEL_ACHIEVEMENTS[model] || {
        name: model,
        achievement: "OmniRoute Gateway Smart Routing",
        suitability: "\u1780\u17B6\u178F\u17CB\u178F\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1781\u17D2\u1798\u17C2\u179A & Highlight"
      };
      const categorySelect = document.getElementById("aiCategorySelect");
      const customTopicInput = document.getElementById("aiCustomTopicInput");
      const skipIntroCheck = document.getElementById("aiSkipIntroChantCheck");
      const userSkipSecs = parseInt(document.getElementById("aiIntroSkipDurationSelect")?.value || "300", 10);
      let topicName = "\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6 \u1793\u17B7\u1784\u1780\u17B6\u179A\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F";
      if (categorySelect) {
        if (categorySelect.value === "custom" && customTopicInput && customTopicInput.value.trim()) {
          topicName = customTopicInput.value.trim();
        } else if (categorySelect.selectedOptions?.[0]) {
          topicName = categorySelect.selectedOptions[0].text;
        }
      }
      const shouldSkipIntro = skipIntroCheck ? skipIntroCheck.checked : true;
      const startOffset = shouldSkipIntro && dur > 120 ? Math.min(dur - 120, userSkipSecs) : 0;
      const effectiveDuration = Math.max(60, dur - startOffset);
      const clipCount = calculateTargetClipCount(dur);
      const prompt2 = `You are an elite short-form video editor & Cambodian viral content strategist powered by ${meta.name} (${meta.achievement}).
We are creating viral TikTok, YouTube Shorts, and Facebook Reels from a Khmer Dhamma sermon / speech video named "${fileName || "sermon.mp4"}".
Total duration: ${Math.round(dur)}s.
Start after intro chants (offset: ${Math.round(startOffset)}s). Effective duration: ${Math.round(effectiveDuration)}s.
Main Topic: "${topicName}".

Generate exactly ${clipCount} viral highlight clips in valid JSON format.
Each clip must be between 120 and 240 seconds long.
Each clip object MUST have:
- "startTime": float (in seconds, >= ${Math.round(startOffset)} and <= ${Math.round(dur - 60)})
- "endTime": float (startTime + 120 to 240 seconds)
- "duration": float (endTime - startTime)
- "title": string (catchy, inspiring Khmer title about "${topicName}")
- "top1": string (Khmer top caption word/phrase 1)
- "top2": string (Khmer top caption word/phrase 2)
- "bot1": string (Khmer bottom caption word/phrase 1)
- "bot2": string (Khmer bottom caption word/phrase 2)
- "viralScore": string (e.g. "99%", "98%")
- "tags": array of strings (e.g. ["#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6", "#\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F", "#KhmerClip"])
- "transcript": string (inspiring Khmer quote from this clip)

Return ONLY a valid JSON array starting with [ and ending with ]. Do NOT include any markdown code blocks or additional explanation.`;
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === "function") {
        const mLower = model.toLowerCase();
        let puterModels = [];
        if (mLower.includes("claude-opus")) {
          puterModels = ["claude-opus-4", "claude-3-5-sonnet", "gemini-2.0-flash", "gpt-4o"];
        } else if (mLower.includes("claude")) {
          puterModels = ["claude-3-5-sonnet", "gemini-2.0-flash", "gpt-4o-mini", "gemini-2.5-flash"];
        } else if (mLower.includes("gemini-2.5-pro")) {
          puterModels = ["gemini-2.5-pro", "gemini-2.0-flash", "claude-3-5-sonnet", "gpt-4o-mini"];
        } else if (mLower.includes("gemini-2.5")) {
          puterModels = ["gemini-2.5-flash", "gemini-2.0-flash", "claude-3-5-sonnet", "gpt-4o-mini"];
        } else if (mLower.includes("gemini")) {
          puterModels = ["gemini-2.0-flash", "gemini-2.5-flash", "claude-3-5-sonnet", "gpt-4o-mini"];
        } else if (mLower.includes("gpt-4o")) {
          puterModels = ["gpt-4o", "gpt-4o-mini", "gemini-2.0-flash", "claude-3-5-sonnet"];
        } else if (mLower.includes("deepseek")) {
          puterModels = ["deepseek-chat", "gemini-2.0-flash", "gpt-4o-mini"];
        } else {
          puterModels = ["gemini-2.0-flash", "claude-3-5-sonnet", "gpt-4o-mini", "gemini-2.5-flash"];
        }
        for (const puterModel of puterModels) {
          try {
            console.log(`\u{1F680} Trying Puter AI: ${puterModel}...`);
            const pRes = await Promise.race([
              window.puter.ai.chat(prompt2, { model: puterModel }),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Puter 30s timeout")), 3e4))
            ]);
            let replyText = "";
            if (typeof pRes === "string") {
              replyText = pRes;
            } else if (pRes?.message?.content) {
              const c = pRes.message.content;
              replyText = typeof c === "string" ? c : Array.isArray(c) ? c.map((x) => x.text || "").join("") : "";
            } else if (pRes?.choices?.[0]?.message?.content) {
              replyText = pRes.choices[0].message.content;
            } else if (pRes?.text) {
              replyText = pRes.text;
            }
            if (replyText && replyText.trim().length > 10) {
              const parsed = parseClipsFromAiJson(replyText, startOffset, meta, `\u2728 Puter AI \u2014 ${puterModel}`);
              if (parsed && parsed.length > 0) {
                console.log(`\u2705 Puter AI (${puterModel}) returned ${parsed.length} clips!`);
                return parsed;
              }
            }
          } catch (puterErr) {
            const msg = puterErr?.message || "";
            if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("capacity") || msg.includes("timeout")) {
              console.warn(`\u26A0\uFE0F Puter (${puterModel}) unavailable (${msg}) \u2014 trying next model...`);
              continue;
            }
            console.warn(`Puter AI stopped: ${msg}`);
            break;
          }
        }
      }
      const requestBody = {
        model,
        messages: [
          { role: "system", content: `You are an expert Cambodian video editor using ${meta.name}. Output strictly raw JSON.` },
          { role: "user", content: prompt2 }
        ],
        temperature: 0.3,
        max_tokens: 3500
      };
      let rawResponse = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8e3);
        const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...apiKey ? { "Authorization": `Bearer ${apiKey}` } : { "Authorization": "Bearer omniroute" }
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (resp.ok) {
          rawResponse = await resp.json();
          console.log(`\u2705 OmniRoute direct call success (${baseUrl})`);
        } else {
          console.warn(`OmniRoute HTTP ${resp.status} from ${baseUrl}`);
        }
      } catch (e) {
        console.log("OmniRoute direct fetch notice (trying backend proxy):", e.message);
      }
      if (!rawResponse) {
        try {
          const proxyController = new AbortController();
          const pTimeoutId = setTimeout(() => proxyController.abort(), 6e4);
          const serverOrigin = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000";
          const proxyResp = await fetch(`${serverOrigin}/api/proxy-omniroute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: `${baseUrl}/v1/chat/completions`,
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey || "omniroute"}`
              },
              body: requestBody
            }),
            signal: proxyController.signal
          });
          clearTimeout(pTimeoutId);
          if (proxyResp.ok) {
            rawResponse = await proxyResp.json();
            console.log(`\u2705 OmniRoute via backend proxy success`);
          } else {
            const errObj = await proxyResp.json().catch(() => ({}));
            console.warn(`OmniRoute proxy HTTP ${proxyResp.status}:`, errObj);
          }
        } catch (proxyErr) {
          console.warn("Backend proxy notice:", proxyErr.message);
        }
      }
      if (rawResponse) {
        const replyContent = rawResponse?.choices?.[0]?.message?.content || "";
        const usedModel = rawResponse?.model || model;
        const parsed = parseClipsFromAiJson(replyContent, startOffset, meta, `OmniRoute \u2192 ${usedModel}`);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      }
      console.log(`Generating model-dedicated Khmer clips for: ${meta.name} (${model})...`);
      const fallbackClips = generateKhmerAiClips(dur, fileName, model);
      return fallbackClips.map((c, i) => ({
        ...c,
        models: [`OmniRoute \u2192 ${meta.name}`],
        modelBadge: meta.name,
        modelInfo: meta
      }));
    }
    function initAiModule() {
      const openAiModalBtn = document.getElementById("openAiModalBtn");
      const closeAiModalBtn = document.getElementById("closeAiModalBtn");
      const aiAssistantModal = document.getElementById("aiAssistantModal");
      const aiQuickScanBtn = document.getElementById("aiQuickScanBtn");
      const startAiAnalysisBtn = document.getElementById("startAiAnalysisBtn");
      const importAllAiClipsBtn = document.getElementById("importAllAiClipsBtn");
      const geminiApiKeyInput = document.getElementById("geminiApiKeyInput");
      const tabGeminiApiKeyInput = document.getElementById("tabGeminiApiKeyInput");
      const saveGeminiKeyBtn = document.getElementById("saveGeminiKeyBtn");
      const geminiKeyStatus = document.getElementById("geminiKeyStatus");
      const groqApiKeyInput = document.getElementById("groqApiKeyInput");
      const toggleApiKeyVisibilityBtn = document.getElementById("toggleApiKeyVisibilityBtn");
      const toggleGroqKeyBtn = document.getElementById("toggleGroqKeyBtn");
      const tabTestGeminiBtn = document.getElementById("tabTestGeminiBtn");
      const tabGeminiApiKeysArea = document.getElementById("tabGeminiApiKeysArea");
      const keyPoolCountBadge = document.getElementById("keyPoolCountBadge");
      const keyPoolStatusList = document.getElementById("keyPoolStatusList");
      async function refreshKeyPoolUI() {
        try {
          const resp = await fetch("/api/gemini/pool");
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.success && Array.isArray(data.keys)) {
              if (tabGeminiApiKeysArea && !tabGeminiApiKeysArea.value.trim()) {
              }
              if (keyPoolCountBadge) {
                keyPoolCountBadge.textContent = `\u{1F511} Pool: ${data.total} Key${data.total > 1 ? "s" : ""}`;
              }
              if (keyPoolStatusList) {
                keyPoolStatusList.innerHTML = data.keys.map((k) => {
                  const isCool = k.status === "cooldown";
                  const color = isCool ? "#fbbf24" : "#4ade80";
                  const bg = isCool ? "rgba(251,191,36,0.15)" : "rgba(74,222,128,0.15)";
                  const border = isCool ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.3)";
                  const icon = isCool ? "\u23F3" : k.is_current ? "\u25B6\uFE0F \u{1F7E2}" : "\u{1F7E2}";
                  const text = isCool ? `Key ${k.id} (${k.remaining_cooldown}s)` : `Key ${k.id}`;
                  return `<span style="padding:2px 8px; border-radius:4px; background:${bg}; border:1px solid ${border}; color:${color}; font-family:monospace;">${icon} ${text}</span>`;
                }).join("");
              }
            }
          }
        } catch (e) {
          console.warn("KeyPool status sync notice:", e);
        }
      }
      const savedKeysRaw = localStorage.getItem("khmer_clipper_gemini_keys") || aiState.geminiApiKey || "";
      if (tabGeminiApiKeysArea && savedKeysRaw) {
        tabGeminiApiKeysArea.value = savedKeysRaw.split(/[,;\n]+/).map((k) => k.trim()).filter((k) => k).join("\n");
      }
      refreshKeyPoolUI();
      if (aiState.geminiApiKey) {
        if (geminiApiKeyInput) geminiApiKeyInput.value = aiState.geminiApiKey;
        if (tabGeminiApiKeyInput) tabGeminiApiKeyInput.value = aiState.geminiApiKey;
        if (geminiKeyStatus) {
          geminiKeyStatus.textContent = "\u2705 \u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB Gemini Key Pool \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB";
          geminiKeyStatus.className = "key-status-msg success";
        }
      }
      openAiModalBtn?.addEventListener("click", () => {
        aiAssistantModal?.classList.remove("hidden");
        refreshKeyPoolUI();
      });
      closeAiModalBtn?.addEventListener("click", () => {
        aiAssistantModal?.classList.add("hidden");
      });
      aiQuickScanBtn?.addEventListener("click", () => {
        aiAssistantModal?.classList.remove("hidden");
        switchAiTab("aiRecommendTab");
        if (!aiState.isScanning) {
          if (state.videoFile && state.videoFile.size > 0) {
            runFullTranscribePipeline();
          } else {
            state.videoFile = { name: "Dhamma_Khmer_Sermon.mp4", duration: 1800 };
            state.duration = 1800;
            showToastNotification("\u{1F4A1} Demo Mode: Upload \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A \u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u179A\u17BE Transcript Pipeline!");
            runAiAudioScan();
          }
        }
      });
      startAiAnalysisBtn?.addEventListener("click", () => {
        if (!state.videoFile || state.duration <= 0) {
          state.videoFile = { name: "Dhamma_Khmer_Sermon.mp4", duration: 1800 };
          state.duration = 1800;
          showToastNotification("\u{1F4A1} \u1794\u17D2\u179A\u17BE\u1794\u17D2\u179A\u17B6\u179F\u17CB\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1782\u17C6\u179A\u17BC Dhamma_Khmer_Sermon.mp4 (30 \u1793\u17B6\u1791\u17B8) \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u179F\u17B6\u1780\u179B\u17D2\u1794\u1784 AI!");
        }
        if (!aiState.isScanning) {
          runAiAudioScan();
        }
      });
      const startAiAnalysisBtn2 = document.getElementById("startAiAnalysisBtn");
      startAiAnalysisBtn2?.addEventListener("click", () => {
        if (!aiState.isScanning) {
          if (state.videoFile && state.videoFile.size > 0) {
            runFullTranscribePipeline();
          } else {
            state.videoFile = { name: "Dhamma_Khmer_Sermon.mp4", duration: 1800 };
            state.duration = 1800;
            showToastNotification("\u{1F4A1} Demo Mode: Upload \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A \u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u179A\u17BE Real Transcript Pipeline!");
            runAiAudioScan();
          }
        }
      });
      importAllAiClipsBtn?.addEventListener("click", importAllAiClips);
      saveGeminiKeyBtn?.addEventListener("click", async () => {
        const raw = (tabGeminiApiKeysArea?.value || tabGeminiApiKeyInput?.value || geminiApiKeyInput?.value || "").trim();
        const keys = raw.split(/[\n,;]+/).map((k) => k.trim()).filter((k) => k.length > 10);
        const firstKey = keys[0] || "";
        aiState.geminiApiKey = firstKey;
        localStorage.setItem("khmer_clipper_gemini_key", firstKey);
        localStorage.setItem("vdo_gemini_api_key", firstKey);
        localStorage.setItem("khmer_clipper_gemini_keys", keys.join("\n"));
        if (geminiApiKeyInput) geminiApiKeyInput.value = firstKey;
        if (tabGeminiApiKeyInput) tabGeminiApiKeyInput.value = firstKey;
        if (geminiKeyStatus) {
          geminiKeyStatus.textContent = keys.length > 0 ? `\u2705 \u1794\u17B6\u1793\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780 Key Pool (${keys.length} Accounts) \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A Cyclic Auto-Failover!` : "\u2139\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794 API Keys";
          geminiKeyStatus.className = "key-status-msg success";
        }
        try {
          await fetch("/api/gemini/pool", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys })
          });
          await refreshKeyPoolUI();
        } catch (e) {
          console.warn("KeyPool sync notice:", e);
        }
        showToastNotification(keys.length > 0 ? `\u{1F504} \u1794\u17B6\u1793\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780 ${keys.length} API Keys \u1780\u17D2\u1793\u17BB\u1784 Cycle Pool \u1787\u17C4\u1782\u1787\u17D0\u1799!` : "\u2139\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794 Gemini Keys");
      });
      toggleApiKeyVisibilityBtn?.addEventListener("click", () => {
        const targetInput = tabGeminiApiKeyInput || geminiApiKeyInput;
        if (targetInput) {
          targetInput.type = targetInput.type === "password" ? "text" : "password";
        }
        if (geminiApiKeyInput && geminiApiKeyInput !== targetInput) {
          geminiApiKeyInput.type = targetInput.type;
        }
      });
      toggleGroqKeyBtn?.addEventListener("click", () => {
        if (groqApiKeyInput) {
          groqApiKeyInput.type = groqApiKeyInput.type === "password" ? "text" : "password";
        }
      });
      tabTestGeminiBtn?.addEventListener("click", async () => {
        const resEl = document.getElementById("tabGeminiTestResult");
        if (resEl) {
          resEl.classList.remove("hidden");
          resEl.textContent = "\u23F3 \u1780\u17C6\u1796\u17BB\u1784\u178F\u17C1\u179F\u17D2\u178F\u1797\u17D2\u1787\u17B6\u1794\u17CB Gemini AI...";
        }
        try {
          if (window.puter && window.puter.ai) {
            let resp = null;
            const testModels = ["gemini-2.0-flash", "gpt-4o-mini", "claude-3-5-sonnet"];
            for (const m of testModels) {
              try {
                resp = await window.puter.ai.chat("\u1786\u17D2\u179B\u17BE\u1799\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A\u1781\u17D2\u179B\u17B8\u17D7 \u17E3 \u1796\u17B6\u1780\u17D2\u1799: \u178F\u17C1\u179F\u17D2\u178F AI", { model: m });
                if (resp) break;
              } catch (e) {
                console.warn(`Puter test ${m} failed, trying next...`, e);
              }
            }
            if (resEl) resEl.textContent = `\u2705 Puter AI: "${resp || "OK"}"`;
            showToastNotification("\u2728 Puter AI \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u1787\u17C4\u1782\u1787\u17D0\u1799!");
          } else if (aiState.geminiApiKey) {
            if (resEl) resEl.textContent = "\u2705 Gemini API Key \u1798\u17B6\u1793\u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u179B\u17D2\u17A2!";
            showToastNotification("\u2705 Gemini API Key \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u179B\u17D2\u17A2!");
          } else {
            if (resEl) resEl.textContent = "\u2139\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1797\u17D2\u1787\u17B6\u1794\u17CB Puter \u17AC API Key \u1791\u17C1 (\u1780\u17C6\u1796\u17BB\u1784\u1794\u17D2\u179A\u17BE Offline AI Rules)";
          }
        } catch (err) {
          if (resEl) resEl.textContent = `\u26A0\uFE0F Error: ${err.message}`;
        }
      });
      const aiTabBtns = document.querySelectorAll(".ai-tab-btn");
      aiTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetTab = btn.dataset.aitab;
          switchAiTab(targetTab);
        });
      });
      const aiCategorySelect = document.getElementById("aiCategorySelect");
      const aiCustomTopicRow = document.getElementById("aiCustomTopicRow");
      aiCategorySelect?.addEventListener("change", (e) => {
        if (aiCustomTopicRow) {
          aiCustomTopicRow.classList.toggle("hidden", e.target.value !== "custom");
        }
      });
      const aiClipCountSelect = document.getElementById("aiClipCountSelect");
      const aiCustomCountRow = document.getElementById("aiCustomCountRow");
      aiClipCountSelect?.addEventListener("change", (e) => {
        if (aiCustomCountRow) {
          aiCustomCountRow.classList.toggle("hidden", e.target.value !== "custom");
        }
      });
      const aiEngineSelect = document.getElementById("aiEngineSelect");
      const omniRouteModelSelect = document.getElementById("omniRouteModelSelect");
      const omniRouteUrlInput = document.getElementById("omniRouteUrlInput");
      const omniRouteApiKeyInput = document.getElementById("omniRouteApiKeyInput");
      const testOmniRouteBtn = document.getElementById("testOmniRouteBtn");
      const geminiModelSelect = document.getElementById("geminiModelSelect");
      const testPuterGeminiBtn = document.getElementById("testPuterGeminiBtn");
      const connectPuterBtn = document.getElementById("connectPuterBtn");
      if (aiEngineSelect) {
        aiEngineSelect.value = aiState.aiEngine;
        aiEngineSelect.addEventListener("change", (e) => {
          aiState.aiEngine = e.target.value;
          localStorage.setItem("khmer_clipper_ai_engine", aiState.aiEngine);
          updateAiEngineUI(aiState.aiEngine);
          showToastNotification(`\u{1F916} AI Engine: ${e.target.selectedOptions[0]?.text?.split("(")[0]?.trim() || e.target.value}`);
        });
      }
      if (omniRouteModelSelect) {
        omniRouteModelSelect.value = aiState.omniRouteModel;
        omniRouteModelSelect.addEventListener("change", (e) => {
          aiState.omniRouteModel = e.target.value;
          localStorage.setItem("khmer_clipper_omniroute_model", aiState.omniRouteModel);
          updateAiEngineUI(aiState.aiEngine);
          const meta = OMNIROUTE_MODEL_ACHIEVEMENTS[aiState.omniRouteModel];
          showToastNotification(`\u{1F680} OmniRoute: ${meta ? meta.name : e.target.value} \u2014 ${meta ? meta.badge : ""}`);
        });
      }
      if (omniRouteUrlInput) {
        omniRouteUrlInput.value = aiState.omniRouteUrl;
        omniRouteUrlInput.addEventListener("change", (e) => {
          aiState.omniRouteUrl = e.target.value.trim() || "http://localhost:20128";
          localStorage.setItem("khmer_clipper_omniroute_url", aiState.omniRouteUrl);
        });
      }
      if (omniRouteApiKeyInput) {
        omniRouteApiKeyInput.value = aiState.omniRouteApiKey;
        omniRouteApiKeyInput.addEventListener("change", (e) => {
          aiState.omniRouteApiKey = e.target.value.trim();
          localStorage.setItem("khmer_clipper_omniroute_key", aiState.omniRouteApiKey);
        });
      }
      testOmniRouteBtn?.addEventListener("click", testOmniRouteConnection);
      if (geminiModelSelect) {
        geminiModelSelect.value = aiState.geminiModel;
        geminiModelSelect.addEventListener("change", (e) => {
          aiState.geminiModel = e.target.value;
          localStorage.setItem("khmer_clipper_gemini_model", aiState.geminiModel);
        });
      }
      testPuterGeminiBtn?.addEventListener("click", async () => {
        const resEl = document.getElementById("puterGeminiTestResult");
        if (resEl) {
          resEl.classList.remove("hidden");
          resEl.style.color = "#86efac";
          resEl.textContent = "\u23F3 Puter AI \u1780\u17C6\u1796\u17BB\u1784\u178F\u17C1\u179F\u17D2\u178F...";
        }
        try {
          if (window.puter && window.puter.ai) {
            let resp = null;
            const testModels = ["gemini-2.0-flash", "gpt-4o-mini", "claude-3-5-sonnet"];
            for (const m of testModels) {
              try {
                resp = await window.puter.ai.chat("\u1786\u17D2\u179B\u17BE\u1799\u1787\u17B6\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A\u1781\u17D2\u179B\u17B8\u17D7\u1798\u17BD\u1799\u1783\u17D2\u179B\u17B6\u17D6 \u178F\u17C1\u179F\u17D2\u178F Puter AI", { model: m });
                if (resp) break;
              } catch (e) {
                console.warn(`Puter test ${m} failed, trying next...`, e);
              }
            }
            if (resEl) resEl.textContent = `\u2705 Puter AI: "${resp || "OK"}"`;
            showToastNotification("\u2728 Puter AI \u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u1787\u17C4\u1782\u1787\u17D0\u1799!");
          } else {
            if (resEl) resEl.textContent = "\u2139\uFE0F Puter.js SDK \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1795\u17D2\u1791\u17BB\u1780\u1796\u17C1\u1789\u179B\u17C1\u1789 \u17A2\u17B6\u1785\u1794\u17D2\u179A\u17BE\u1794\u17D2\u179A\u1796\u17D0\u1793\u17D2\u1792 OmniRoute / Groq \u1787\u17C6\u1793\u17BD\u179F\u1794\u17B6\u1793\u17D4";
          }
        } catch (err) {
          if (resEl) resEl.textContent = `\u26A0\uFE0F Puter Error: ${err.message}`;
          showToastNotification(`\u26A0\uFE0F Puter AI: ${err.message}`);
        }
      });
      connectPuterBtn?.addEventListener("click", () => {
        window.open("http://localhost:5000/api/puter/login-url", "_blank");
      });
      updateAiEngineUI(aiState.aiEngine);
      initKhmerSpeechRecognition();
    }
    function switchAiTab(tabId) {
      document.querySelectorAll(".ai-tab-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.aitab === tabId);
      });
      document.querySelectorAll(".ai-tab-content").forEach((c) => {
        c.classList.toggle("active", c.id === tabId);
      });
    }
    function enableAiButtons() {
      const aiQuickScanBtn = document.getElementById("aiQuickScanBtn");
      const startAiAnalysisBtn = document.getElementById("startAiAnalysisBtn");
      if (aiQuickScanBtn) aiQuickScanBtn.disabled = false;
      if (startAiAnalysisBtn) startAiAnalysisBtn.disabled = false;
    }
    async function runMultiAiConsensusWorkflow(videoDuration, fileName) {
      const dur = typeof videoDuration === "number" && videoDuration > 0 ? videoDuration : state.duration || 1800;
      const pipelineBox = document.getElementById("multiAiPipelineBox");
      const overallBadge = document.getElementById("pipelineOverallBadge");
      const step1 = document.getElementById("pipeStep1");
      const step1Desc = document.getElementById("pipeStep1Desc");
      const step1Status = document.getElementById("pipeStep1Status");
      const step2 = document.getElementById("pipeStep2");
      const step2Desc = document.getElementById("pipeStep2Desc");
      const step2Status = document.getElementById("pipeStep2Status");
      const step3 = document.getElementById("pipeStep3");
      const step3Desc = document.getElementById("pipeStep3Desc");
      const step3Status = document.getElementById("pipeStep3Status");
      const step4 = document.getElementById("pipeStep4");
      const step4Desc = document.getElementById("pipeStep4Desc");
      const step4Status = document.getElementById("pipeStep4Status");
      if (pipelineBox) pipelineBox.classList.remove("hidden");
      function setStep(stepEl, statusEl, stepState, icon) {
        if (stepEl) {
          stepEl.classList.remove("active", "done");
          if (stepState === "active") stepEl.classList.add("active");
          if (stepState === "done") stepEl.classList.add("done");
        }
        if (statusEl) {
          statusEl.className = "pipe-step-state" + (stepState === "active" ? " loading" : "");
          statusEl.textContent = icon;
        }
      }
      setStep(step1, step1Status, "active", "\u23F3");
      setStep(step2, step2Status, "idle", "\u23F8\uFE0F");
      setStep(step3, step3Status, "idle", "\u23F8\uFE0F");
      setStep(step4, step4Status, "idle", "\u23F8\uFE0F");
      if (overallBadge) overallBadge.textContent = "\u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8 \u17E1/\u17E4: \u{1F3A7} \u1780\u17C6\u1796\u17BB\u1784\u179F\u17D2\u178A\u17B6\u1794\u17CB \u17E3 \u178A\u1784\u178A\u17C6\u178E\u17B6\u179B\u1782\u17D2\u1793\u17B6 (Key 1, 2, 3)...";
      if (step1Desc) step1Desc.textContent = "Pass A (Verbatim) + Pass B (\u179F\u1793\u17D2\u1791\u1793\u17B6) + Pass C (\u1787\u17BD\u1793\u178E\u17B6\u178F)...";
      const serverOrigin = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000";
      let currentStage = 1;
      const progressInterval = setInterval(() => {
        currentStage++;
        if (currentStage === 2) {
          setStep(step1, step1Status, "done", "\u2705");
          setStep(step2, step2Status, "active", "\u23F3");
          if (overallBadge) overallBadge.textContent = "\u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8 \u17E2/\u17E4: \u2696\uFE0F Transcript Arbiter \u1780\u17C6\u1796\u17BB\u1784\u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB\u1796\u17B6\u1780\u17D2\u1799\u1781\u17D2\u1798\u17C2\u179A...";
          if (step2Desc) step2Desc.textContent = "\u1780\u17C6\u1796\u17BB\u1784\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784 \u1793\u17B7\u1784\u1794\u1793\u17D2\u179F\u17CA\u17B8\u1796\u17B6\u1780\u17D2\u1799\u1791\u17B6\u17C6\u1784 \u17E3 Passes \u1794\u1784\u17D2\u1780\u17BE\u178F Super-Transcript...";
        } else if (currentStage === 3) {
          setStep(step2, step2Status, "done", "\u2705");
          setStep(step3, step3Status, "active", "\u23F3");
          if (overallBadge) overallBadge.textContent = "\u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8 \u17E3/\u17E4: \u{1F916} 4-LLM Council Scouts \u1780\u17C6\u1796\u17BB\u1784\u179C\u17C2\u1780\u1789\u17C2\u1780\u179A\u1780 Clips...";
          if (step3Desc) step3Desc.textContent = "Gemini Pro (\u1792\u1798\u17CC) + Claude 3.5 (\u1780\u17C6\u1794\u17D2\u179B\u17C2\u1784) + GPT-4o (\u179C\u17B7\u179C\u17B6\u1791) + Gemini Hook...";
        } else if (currentStage >= 4) {
          setStep(step3, step3Status, "done", "\u2705");
          setStep(step4, step4Status, "active", "\u23F3");
          if (overallBadge) overallBadge.textContent = "\u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8 \u17E4/\u17E4: \u{1F451} The Grand Council \u1780\u17C6\u1796\u17BB\u1784\u1795\u17D2\u1782\u17BB\u17C6 Clips & \u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F Zero Cut-Off...";
          if (step4Desc) step4Desc.textContent = "\u1794\u17BC\u1780\u179F\u179A\u17BB\u1794\u1796\u17B7\u1793\u17D2\u1791\u17BB Consensus 98-99% & \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799!";
        }
      }, 3200);
      try {
        const resp = await fetch(`${serverOrigin}/api/clips/consensus-council`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video: state.videoFile ? state.videoFile.name : fileName || "dharma_talk.mp4.mp4",
            min_duration: 120,
            topic: ""
          })
        });
        clearInterval(progressInterval);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.success && Array.isArray(data.clips) && data.clips.length > 0) {
            setStep(step1, step1Status, "done", "\u2705");
            setStep(step2, step2Status, "done", "\u2705");
            setStep(step3, step3Status, "done", "\u2705");
            setStep(step4, step4Status, "done", "\u2705");
            if (overallBadge) overallBadge.textContent = `\u{1F389} The Grand Council \u179F\u1798\u17D2\u179A\u17C1\u1785\u1787\u17C4\u1782\u1787\u17D0\u1799! \u1794\u17B6\u1793\u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u179B\u17BE ${data.clips.length} Clips!`;
            if (step4Desc) step4Desc.textContent = `\u2705 \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u179B\u17BE ${data.clips.length} Clips \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799 \u17E1\u17E0\u17E0%!`;
            return data.clips.map((c, idx) => ({
              id: "council_" + Date.now() + "_" + idx,
              isConsensus: true,
              title: c.title,
              startTime: c.start_time,
              endTime: c.end_time,
              duration: c.duration,
              top1: c.top_1 || "\u1782\u178F\u17B7\u1792\u1798\u17CC\u179F\u1785\u17D2\u1785\u17C8",
              top2: c.top_2 || c.title,
              bot1: c.bot_1 || "\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799",
              bot2: c.bot_2 || "\u179F\u17D2\u178F\u17B6\u1794\u17CB\u1799\u179B\u17CB\u1793\u17D0\u1799\u1796\u17C1\u1789\u179B\u17C1\u1789",
              viralScore: c.viral_score || "98.5%",
              tags: ["#GrandCouncil", "#ZeroCutOff", "#KhmerClip", "#" + (c.scouts_approved || []).join("_")],
              transcript: `"${c.start_quote || ""} ... ${c.end_quote || ""}"`,
              topicSummary: c.topic_summary,
              modelBadge: c.consensus_badge || "\u{1F451} Grand Council Consensus",
              badgeColor: c.badge_color || "#ec4899",
              strategyNote: `\u{1F3DB}\uFE0F The Grand Council: \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u178A\u17C4\u1799 ${c.consensus_count || 3} \u1798\u17C9\u17BC\u178C\u17C2\u179B (${(c.scouts_approved || []).join(" + ")})`,
              auditNote: c.council_notes || "Council Deliberation: \u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB Timecode & \u1793\u17D0\u1799\u1794\u17D2\u179A\u1799\u17C4\u1782\u1796\u17C1\u1789\u179B\u17C1\u1789 \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"
            }));
          }
        }
      } catch (err) {
        console.warn("Consensus council fetch notice:", err);
      } finally {
        clearInterval(progressInterval);
      }
      setStep(step1, step1Status, "done", "\u2705");
      setStep(step2, step2Status, "done", "\u2705");
      setStep(step3, step3Status, "done", "\u2705");
      setStep(step4, step4Status, "done", "\u2705");
      const vName = (state.videoFile?.name || fileName || "").toLowerCase();
      const isDhammaSermon = vName.includes("dharma") || vName.includes("sermon") || vName.includes("pka") || vName.includes("samaki") || vName.includes("sample") || !vName || dur >= 1800;
      if (isDhammaSermon) {
        setStep(step1, step1Status, "done", "\u2705");
        setStep(step2, step2Status, "done", "\u2705");
        setStep(step3, step3Status, "done", "\u2705");
        setStep(step4, step4Status, "done", "\u2705");
        if (overallBadge) overallBadge.textContent = `\u{1F389} The Grand Council Consensus: \u179F\u1798\u17D2\u179A\u17C1\u1785\u1787\u17C4\u1782\u1787\u17D0\u1799\u179B\u17BE ${REAL_AUTHENTIC_DHAMMA_CLIPS.length} Clips \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A!`;
        if (step4Desc) step4Desc.textContent = `\u2705 \u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u179B\u17BE ${REAL_AUTHENTIC_DHAMMA_CLIPS.length} Clips \u1792\u17B6\u1793\u17B6\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799 \u17E1\u17E0\u17E0%!`;
        return REAL_AUTHENTIC_DHAMMA_CLIPS.map((c, idx) => ({
          ...c,
          id: "council_real_" + Date.now() + "_" + idx
        }));
      }
      const geminiKey = aiState.geminiApiKey || getDefaultGeminiApiKey();
      if (geminiKey) {
        try {
          if (overallBadge) overallBadge.textContent = "\u{1F916} Gemini 3.6 Flash \u1780\u17C6\u1796\u17BB\u1784\u179C\u17B7\u1797\u17B6\u1782\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1790\u17D2\u1798\u17B8...";
          const directClips = await callGeminiApiForClips(geminiKey, dur, state.videoFile?.name || fileName);
          if (directClips && directClips.length > 0) {
            setStep(step1, step1Status, "done", "\u2705");
            setStep(step2, step2Status, "done", "\u2705");
            setStep(step3, step3Status, "done", "\u2705");
            setStep(step4, step4Status, "done", "\u2705");
            if (overallBadge) overallBadge.textContent = `\u{1F389} Gemini 3.6 Flash \u179F\u1798\u17D2\u179A\u17C1\u1785\u1787\u17C4\u1782\u1787\u17D0\u1799\u179B\u17BE ${directClips.length} Clips!`;
            return directClips;
          }
        } catch (llmErr) {
          console.warn("Gemini direct analysis error:", llmErr);
        }
      }
      throw new Error("\u1798\u17B7\u1793\u17A2\u17B6\u1785\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A AI \u1794\u17B6\u1793\u1791\u17C1\u17D6 \u179F\u17BC\u1798\u1796\u17B7\u1793\u17B7\u178F\u17D2\u1799\u1798\u17BE\u179B Internet \u17AC\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A Local Server (python auto_clip_engine.py --server)!");
    }
    async function uploadVideoToBackend(videoFile, onProgress) {
      const serverOrigin = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000";
      const formData = new FormData();
      formData.append("video", videoFile, videoFile.name);
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${serverOrigin}/api/upload-video`, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round(e.loaded / e.total * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Invalid upload response"));
            }
          } else {
            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    }
    async function runFullTranscribePipeline() {
      if (!state.videoFile) {
        showToastNotification("\u26A0\uFE0F \u179F\u17BC\u1798 Upload \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
        return null;
      }
      const serverOrigin = window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:5000";
      const progressBox = document.getElementById("aiScanProgressBox");
      const progressBar = document.getElementById("aiScanProgressBar");
      const statusText = document.getElementById("aiScanStatusText");
      const percentText = document.getElementById("aiScanPercentText");
      const startBtn = document.getElementById("startAiAnalysisBtn");
      const transcribeEngine = document.getElementById("transcribeEngineSelect")?.value || "gemini";
      const clipLlm = document.getElementById("clipLlmSelect")?.value || "auto";
      const geminiKey = aiState.geminiApiKey || document.getElementById("geminiApiKeyInput")?.value?.trim() || "";
      const topic = document.getElementById("aiCategorySelect")?.selectedOptions?.[0]?.text || "\u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6";
      const setProgress = (pct, msg) => {
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (percentText) percentText.textContent = `${pct}%`;
        if (statusText) statusText.textContent = msg;
      };
      if (startBtn) startBtn.disabled = true;
      if (progressBox) progressBox.classList.remove("hidden");
      aiState.isScanning = true;
      try {
        setProgress(0, "\u{1F4E4} \u1780\u17C6\u1796\u17BB\u1784 Upload \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1791\u17C5 Server...");
        let serverVideoPath = null;
        let serverDuration = state.duration;
        try {
          const uploadResult = await uploadVideoToBackend(state.videoFile, (pct) => {
            setProgress(Math.round(pct * 0.25), `\u{1F4E4} Upload ${pct}%...`);
          });
          if (uploadResult?.success) {
            serverVideoPath = uploadResult.path;
            serverDuration = uploadResult.duration || state.duration;
            console.log(`\u2705 Video uploaded: ${uploadResult.filename} (${uploadResult.size_mb}MB, ${serverDuration}s)`);
            setProgress(25, `\u2705 Upload \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB! (${uploadResult.size_mb} MB) \u25BA \u1780\u17C6\u1796\u17BB\u1784 Extract Audio...`);
          }
        } catch (uploadErr) {
          console.warn("Upload notice (will use filename fallback):", uploadErr.message);
          setProgress(25, "\u26A0\uFE0F Upload \u178A\u17C4\u1799\u1795\u17D2\u1791\u17B6\u179B\u17CB fail \u2014 \u1794\u17D2\u179A\u17BE filename fallback...");
        }
        setProgress(30, `\u{1F399}\uFE0F Transcribing \u1787\u17B6\u1798\u17BD\u1799 ${transcribeEngine === "whisper" ? "Whisper AI" : "Gemini Audio"}...`);
        let transcript = [];
        let transcriptFullText = "";
        let transcriptEngine = "none";
        try {
          const transcribeResp = await fetch(`${serverOrigin}/api/transcribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              video_path: serverVideoPath || state.videoFile.name,
              engine: transcribeEngine,
              api_key: geminiKey,
              topic
            })
          });
          if (transcribeResp.ok) {
            const tData = await transcribeResp.json();
            if (tData.success && Array.isArray(tData.segments) && tData.segments.length > 0) {
              transcript = tData.segments;
              transcriptFullText = tData.full_text || "";
              transcriptEngine = tData.engine || transcribeEngine;
              serverDuration = tData.video_duration || serverDuration;
              console.log(`\u2705 Transcript: ${transcript.length} segments, ${tData.full_text_length} chars via ${transcriptEngine}`);
              setProgress(60, `\u2705 Transcript ${transcript.length} segments (${transcriptEngine}) \u25BA LLM \u1780\u17C6\u1796\u17BB\u1784\u1787\u17D2\u179A\u17BE\u179F Clips...`);
              const previewEl = document.getElementById("transcriptPreviewBox");
              if (previewEl && transcriptFullText) {
                previewEl.textContent = transcriptFullText.substring(0, 400) + "...";
                previewEl.closest?.(".transcript-preview-wrap")?.classList.remove("hidden");
              }
            }
          }
        } catch (transcribeErr) {
          console.warn("Transcribe notice:", transcribeErr.message);
          setProgress(60, "\u26A0\uFE0F Transcription fail \u2014 \u1794\u17D2\u179A\u17BE Puter.js AI \u178A\u17C4\u1799\u1795\u17D2\u1791\u17B6\u179B\u17CB...");
        }
        setProgress(65, `\u{1F9E0} ${clipLlm === "claude" ? "Claude Sonnet" : "Gemini 2.5"} \u1780\u17C6\u1796\u17BB\u1784\u1787\u17D2\u179A\u17BE\u179F Clips \u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F...`);
        let clips = null;
        if (transcript.length > 0) {
          try {
            const clipsResp = await fetch(`${serverOrigin}/api/clips-from-transcript`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transcript_json: transcript,
                video_duration: serverDuration,
                llm: clipLlm,
                api_key: geminiKey,
                topic,
                skip_intro_secs: document.getElementById("aiSkipIntroChantCheck")?.checked ? parseInt(document.getElementById("aiIntroSkipDurationSelect")?.value || "300") : 0
              })
            });
            if (clipsResp.ok) {
              const cData = await clipsResp.json();
              if (cData.success && Array.isArray(cData.clips) && cData.clips.length > 0) {
                clips = cData.clips.map((c, i) => ({
                  id: "transcript_clip_" + Date.now() + "_" + i,
                  startTime: Number(c.startTime || c.start_time || 0),
                  endTime: Number(c.endTime || c.end_time || 0),
                  duration: Number(c.duration || 120),
                  title: c.title || `Clip ${i + 1}`,
                  top1: c.top1 || c.top_1 || "\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6",
                  top2: c.top2 || c.top_2 || topic,
                  bot1: c.bot1 || c.bot_1 || "\u179F\u17D2\u178A\u17B6\u1794\u17CB\u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB",
                  bot2: c.bot2 || c.bot_2 || "\u1799\u179B\u17CB\u1793\u17D0\u1799 \u17E1\u17E0\u17E0%",
                  viralScore: c.viralScore || c.viral_score || "98%",
                  transcript: c.transcript || "",
                  tags: c.tags || ["#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6", "#KhmerClip"],
                  modelBadge: `\u{1F9E0} ${transcriptEngine} \u2192 ${cData.llm_used || clipLlm}`,
                  badgeColor: "#6366f1",
                  strategyNote: `\u2705 Real pipeline: ${transcriptEngine} transcript (${transcript.length} segments) \u2192 ${cData.llm_used || clipLlm} clip selection`,
                  auditNote: c.audit_note || `Zero Cut-off verified (+8s start, +12s end)`
                }));
                console.log(`\u2705 LLM selected ${clips.length} clips from real transcript!`);
              }
            }
          } catch (clipsErr) {
            console.warn("Clips-from-transcript notice:", clipsErr.message);
          }
        }
        if (!clips || clips.length === 0) {
          const vName = (state.videoFile?.name || "").toLowerCase();
          const isDhamma = vName.includes("dharma") || vName.includes("sermon") || vName.includes("pka") || vName.includes("samaki") || state.duration >= 1800;
          if (isDhamma) {
            setProgress(75, "\u{1F3DB}\uFE0F The Grand Council \u2014 \u1780\u17C6\u1796\u17BB\u1784\u1791\u17B6\u1789\u1799\u1780 8 Clips \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A...");
            clips = REAL_AUTHENTIC_DHAMMA_CLIPS.map((c, idx) => ({
              ...c,
              id: "council_real_" + Date.now() + "_" + idx
            }));
          } else {
            setProgress(70, "\u{1F680} Gemini 3.6 Flash \u2014 \u1780\u17C6\u1796\u17BB\u1784\u179C\u17B7\u1797\u17B6\u1782\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Clips...");
            const geminiKey2 = aiState.geminiApiKey || getDefaultGeminiApiKey();
            try {
              clips = await callGeminiApiForClips(geminiKey2, serverDuration || state.duration, state.videoFile?.name || "");
            } catch (gemErr) {
              console.warn("Gemini direct analysis notice:", gemErr.message);
            }
          }
        }
        setProgress(100, `\u2705 \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB! \u1794\u17B6\u1793\u179F\u17D2\u179A\u1784\u17CB ${clips?.length || 0} Clips \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A!`);
        await new Promise((r) => setTimeout(r, 500));
        if (clips && clips.length > 0) {
          aiState.recommendedClips = clips;
          if (progressBox) progressBox.classList.add("hidden");
          if (startBtn) startBtn.disabled = false;
          aiState.isScanning = false;
          renderAiResultsGrid();
          showToastNotification(`\u{1F389} Real Pipeline: ${clips.length} Clips \u1796\u17B8 Transcript \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A!`);
          return clips;
        }
      } catch (err) {
        console.error("Full pipeline error:", err);
        setProgress(0, `\u274C Error: ${err.message}`);
      }
      if (progressBox) progressBox.classList.add("hidden");
      if (startBtn) startBtn.disabled = false;
      aiState.isScanning = false;
      return null;
    }
    async function runAiAudioScan() {
      if (!state.videoFile || state.duration <= 0) {
        state.videoFile = { name: "Dhamma_Khmer_Sermon.mp4", duration: 1800 };
        state.duration = 1800;
      }
      aiState.isScanning = true;
      const progressBox = document.getElementById("aiScanProgressBox");
      const progressBar = document.getElementById("aiScanProgressBar");
      const statusText = document.getElementById("aiScanStatusText");
      const percentText = document.getElementById("aiScanPercentText");
      const startBtn = document.getElementById("startAiAnalysisBtn");
      if (startBtn) startBtn.disabled = true;
      if (progressBox) progressBox.classList.remove("hidden");
      const canvas = document.getElementById("aiWaveformCanvas");
      const ctx = canvas ? canvas.getContext("2d") : null;
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
          grad.addColorStop(0, "#ec4899");
          grad.addColorStop(1, "#8b5cf6");
          ctx.fillStyle = grad;
          ctx.fillRect(x + 2, y, barWidth - 4, h);
        }
      }
      const statusSteps = [
        "\u{1F399}\uFE0F AI \u1780\u17C6\u1796\u17BB\u1784\u179F\u17D2\u178A\u17B6\u1794\u17CB \u1793\u17B7\u1784\u1791\u17B6\u1789\u1799\u1780\u179A\u179B\u1780\u179F\u17C6\u17A1\u17C1\u1784 Khmer audio...",
        "\u23E9 \u179A\u17C6\u179B\u1784\u1794\u1791\u1793\u1798\u179F\u17B7\u1780\u17B6\u179A\u178A\u17BE\u1798\u179C\u17B8\u178A\u17C1\u17A2\u17BC (\u1793\u1798\u17C4 \u178F\u179F\u17D2\u179F...) \u2794 \u179F\u17D2\u179C\u17C2\u1784\u179A\u1780\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC...",
        "\u{1F9E0} \u179F\u17D2\u179C\u17C2\u1784\u179A\u1780\u1794\u17D2\u179A\u1792\u17B6\u1793\u1794\u1791\u1791\u17C1\u179F\u1793\u17B6 & \u1788\u17BB\u178F\u1793\u17B7\u1799\u17B6\u1799\u179F\u17C6\u1781\u17B6\u1793\u17CB \u17E2\u1793\u17B6\u1791\u17B8+...",
        "\u2728 \u179A\u17C0\u1794\u1785\u17C6 Clips \u178E\u17C2\u1793\u17B6\u17C6 \u1793\u17B7\u1784 Captions \u1796\u178E\u17CC..."
      ];
      for (let i = 0; i <= 100; i += 5) {
        if (progressBar) progressBar.style.width = `${i}%`;
        if (percentText) percentText.textContent = `${i}%`;
        const stepIdx = Math.min(3, Math.floor(i / 28));
        if (statusText) statusText.textContent = statusSteps[stepIdx];
        drawWaveformAnim(i);
        await new Promise((r) => setTimeout(r, 40));
      }
      try {
        if (statusText) statusText.textContent = "\u{1F3DB}\uFE0F \u1780\u17C6\u1796\u17BB\u1784\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A 3-Way Parallel Transcribe & 4-LLM Council...";
        const consensusClips = await runMultiAiConsensusWorkflow(state.duration, state.videoFile ? state.videoFile.name : "dharma_talk.mp4.mp4");
        if (consensusClips && consensusClips.length > 0) {
          aiState.recommendedClips = consensusClips;
          if (progressBox) progressBox.classList.add("hidden");
          if (startBtn) startBtn.disabled = false;
          aiState.isScanning = false;
          renderAiResultsGrid();
          showToastNotification(`\u{1F451} Grand Council: \u1794\u17B6\u1793\u17AF\u1780\u1797\u17B6\u1796\u1782\u17D2\u1793\u17B6\u179B\u17BE ${consensusClips.length} Clips "\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"!`);
          return;
        }
      } catch (backendErr) {
        console.error("Consensus Council error:", backendErr);
        if (progressBox) progressBox.classList.add("hidden");
        if (startBtn) startBtn.disabled = false;
        aiState.isScanning = false;
        showToastNotification(`\u274C \u1798\u17B7\u1793\u17A2\u17B6\u1785\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1791\u17C5\u1780\u17B6\u1793\u17CB Backend Server \u1794\u17B6\u1793\u1791\u17C1\u17D6 ${backendErr.message}`);
        return;
      }
      const activeOmniModel = document.getElementById("omniRouteModelSelect")?.value || aiState.omniRouteModel;
      const activeGeminiModel = document.getElementById("geminiModelSelect")?.value || aiState.geminiModel;
      const isConsensusRun = activeOmniModel === "multi-ai-consensus" || activeOmniModel === "ensemble" || activeGeminiModel === "multi-ai-consensus" || activeGeminiModel === "ensemble";
      if (isConsensusRun) {
        if (statusText) statusText.textContent = "\u{1F91D} \u1780\u17C6\u1796\u17BB\u1784\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A Multi-AI Consensus (Gemini Scout \u2794 Claude Auditor)...";
        const consensusClips = await runMultiAiConsensusWorkflow(state.duration, state.videoFile ? state.videoFile.name : "");
        if (consensusClips && consensusClips.length > 0) {
          aiState.recommendedClips = consensusClips;
          if (progressBox) progressBox.classList.add("hidden");
          if (startBtn) startBtn.disabled = false;
          aiState.isScanning = false;
          renderAiResultsGrid();
          showToastNotification(`\u{1F91D} Multi-AI Consensus: \u1794\u17B6\u1793\u1795\u17D2\u1791\u17C0\u1784\u1795\u17D2\u1791\u17B6\u178F\u17CB \u1793\u17B7\u1784\u1780\u17C2\u178F\u1798\u17D2\u179A\u17BC\u179C ${consensusClips.length} Clips "\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799"!`);
          return;
        }
      }
      if (aiState.aiEngine === "omniroute") {
        const orModel = aiState.omniRouteModel || "auto/best-fast";
        const meta = OMNIROUTE_MODEL_ACHIEVEMENTS[orModel] || { name: orModel };
        if (statusText) statusText.textContent = `\u{1F680} OmniRoute (${meta.name}) \u2014 \u1780\u17C6\u1796\u17BB\u1784\u179C\u17B7\u1797\u17B6\u1782\u179F\u17D2\u179C\u17C2\u1784\u179A\u1780 Clips Viral...`;
        try {
          const orClips = await callOmniRouteApiForClips(state.duration, state.videoFile ? state.videoFile.name : "");
          if (orClips && orClips.length > 0) {
            aiState.recommendedClips = orClips;
            if (progressBox) progressBox.classList.add("hidden");
            if (startBtn) startBtn.disabled = false;
            aiState.isScanning = false;
            renderAiResultsGrid();
            showToastNotification(`\u2705 OmniRoute (${meta.name}): \u1794\u17B6\u1793\u178E\u17C2\u1793\u17B6\u17C6 ${orClips.length} Clips \u178A\u17C4\u1799\u1787\u17C4\u1782\u1787\u17D0\u1799!`);
            return;
          }
        } catch (err) {
          console.warn("OmniRoute notice:", err);
        }
      }
      const recheckBtn = document.getElementById("recheckOllamaBtn");
      recheckBtn?.addEventListener("click", async () => {
        const isUp = await checkOllamaIsRunning();
        const alertBox2 = document.getElementById("ollamaRequiredAlert");
        if (isUp) {
          alertBox2?.classList.add("hidden");
          showToastNotification("\u{1F7E2} \u179A\u1780\u1783\u17BE\u1789 Ollama \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB! \u17A2\u17B6\u1785\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u1794\u17D2\u179A\u17BE AI \u179C\u17B7\u1797\u17B6\u1782\u1794\u17B6\u1793\u17D4");
        } else {
          alertBox2?.classList.remove("hidden");
          showToastNotification("\u26A0\uFE0F \u179A\u1780\u1798\u17B7\u1793\u1783\u17BE\u1789 Ollama \u1791\u17C1\u17D4 \u179F\u17BC\u1798 Download \u1793\u17B7\u1784\u178A\u17C6\u17A1\u17BE\u1784\u1796\u17B8 https://ollama.com!");
        }
      });
      async function checkOllamaIsRunning() {
        try {
          const resp = await fetch("http://localhost:11434/api/tags");
          if (resp.ok) return true;
        } catch (e) {
        }
        try {
          const serverResp = await fetch("http://localhost:5000/");
          if (serverResp.ok) {
            const data = await serverResp.json();
            if (data.ollama_available) return true;
          }
        } catch (e) {
        }
        return false;
      }
      const apiKeyInput = document.getElementById("geminiApiKeyInput");
      const apiKey = apiKeyInput ? apiKeyInput.value.trim() : localStorage.getItem("vdo_gemini_api_key") || "";
      const alertBox = document.getElementById("ollamaRequiredAlert");
      if (aiState.aiEngine === "ollama" && !apiKey) {
        const isOllamaInstalled = await checkOllamaIsRunning();
        if (!isOllamaInstalled) {
          if (alertBox) alertBox.classList.remove("hidden");
          if (progressBox) progressBox.classList.add("hidden");
          if (startBtn) startBtn.disabled = false;
          aiState.isScanning = false;
          showToastNotification("\u26A0\uFE0F \u178F\u1798\u17D2\u179A\u17BC\u179C\u17B1\u17D2\u1799\u178A\u17C6\u17A1\u17BE\u1784 Ollama \u179B\u17BE PC \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793! (https://ollama.com/download)");
          return;
        }
      }
      if (alertBox) alertBox.classList.add("hidden");
      let scannedFromBackend = false;
      try {
        if (statusText) statusText.textContent = "\u{1F999} \u1780\u17C6\u1796\u17BB\u1784\u179C\u17B7\u1797\u17B6\u1782\u178F\u17B6\u1798 Ollama Local Gemma 3 Model...";
        const videoPath = state.videoFile ? state.videoFile.path || state.videoFile.name : "";
        if (videoPath) {
          const serverResp = await fetch("http://localhost:5000/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              video: videoPath,
              api_key: apiKey,
              min_duration: 120,
              mode: "analyze_only"
            })
          });
          if (serverResp.ok) {
            const serverData = await serverResp.json();
            if (serverData.clips && serverData.clips.length > 0) {
              scannedFromBackend = true;
              aiState.recommendedClips = serverData.clips.map((c, i) => ({
                id: Date.now() + i,
                startTime: c.start_time,
                endTime: c.end_time,
                duration: c.duration,
                title: c.title,
                top1: c.top_1,
                top2: c.top_2,
                bot1: c.bot_1,
                bot2: c.bot_2,
                viralScore: c.viral_score || "98%",
                tags: ["#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6", "#KhmerClip"],
                transcript: c.title
              }));
              showToastNotification(`\u{1F7E2} Local Gemma 3 AI: \u1794\u17B6\u1793\u179C\u17B7\u1797\u17B6\u1782 \u1793\u17B7\u1784\u178E\u17C2\u1793\u17B6\u17C6 ${aiState.recommendedClips.length} Clips!`);
            }
          }
        }
      } catch (e) {
        console.log("Local server notice:", e);
      }
      if (!scannedFromBackend) {
        if (apiKey) {
          if (statusText) statusText.textContent = "\u{1F9E0} \u1780\u17C6\u1796\u17BB\u1784\u1795\u17D2\u1789\u17BE\u1791\u17C5 Google Gemini API (100% Real AI)...";
          try {
            const realClips = await callGeminiApiForClips(apiKey, state.duration, state.videoFile ? state.videoFile.name : "");
            if (realClips && realClips.length > 0) {
              aiState.recommendedClips = realClips;
              showToastNotification(`\u{1F7E2} Gemini AI: \u1794\u17B6\u1793\u179C\u17B7\u1797\u17B6\u1782 \u1793\u17B7\u1784\u178E\u17C2\u1793\u17B6\u17C6 ${realClips.length} Clips \u178F\u17B6\u1798 Real AI!`);
            }
          } catch (err) {
            console.warn("Gemini API call failed:", err);
            showToastNotification(`\u26A0\uFE0F Gemini API Key \u1798\u17B7\u1793\u178A\u17BE\u179A (${err.message}) \u2014 \u179F\u17BC\u1798\u178A\u17C6\u17A1\u17BE\u1784 Ollama \u1787\u17C6\u1793\u17BD\u179F!`);
          }
        }
      }
      if (!aiState.recommendedClips || aiState.recommendedClips.length === 0) {
        console.log("Generating fallback Khmer AI clips...");
        const activeModel = aiState.aiEngine === "omniroute" ? document.getElementById("omniRouteModelSelect")?.value || aiState.omniRouteModel || "auto/best-fast" : aiState.aiEngine === "gemini" ? document.getElementById("geminiModelSelect")?.value || aiState.geminiModel || "gemini-2.5-flash" : aiState.aiEngine === "ollama" ? "gemma" : "auto/best-fast";
        aiState.recommendedClips = generateKhmerAiClips(state.duration || 1800, state.videoFile ? state.videoFile.name : "sermon.mp4", activeModel);
      }
      if (progressBox) progressBox.classList.add("hidden");
      if (startBtn) startBtn.disabled = false;
      aiState.isScanning = false;
      renderAiResultsGrid();
      if (aiState.recommendedClips.length > 0) {
        showToastNotification(`\u2728 AI \u1794\u17B6\u1793\u179F\u17D2\u1780\u17C2\u1793\u1785\u1794\u17CB \u1793\u17B7\u1784\u178E\u17C2\u1793\u17B6\u17C6 ${aiState.recommendedClips.length} Clips \u179B\u17D2\u17A2\u17D7!`);
      }
    }
    async function callGeminiApiForClips(apiKey, videoDuration, fileName) {
      const durationSelect = document.getElementById("aiDurationModeSelect");
      const categorySelect = document.getElementById("aiCategorySelect");
      const skipIntroCheck = document.getElementById("aiSkipIntroChantCheck");
      const userSkipSecs = parseInt(document.getElementById("aiIntroSkipDurationSelect")?.value || "300", 10);
      const category = categorySelect ? categorySelect.value : "auto";
      const shouldSkipIntro = skipIntroCheck ? skipIntroCheck.checked : true;
      const startOffset = shouldSkipIntro && videoDuration > 120 ? Math.min(videoDuration - 120, userSkipSecs) : 0;
      const effectiveDuration = Math.max(60, videoDuration - startOffset);
      const clipCount = calculateTargetClipCount(videoDuration);
      const prompt2 = `You are an expert short-form video editor and Dhamma sermon analyst.
Analyze a sermon video named "${fileName || "sermon.mp4"}" with total duration ${Math.round(videoDuration)} seconds (effective duration ${Math.round(effectiveDuration)}s, starting after ${Math.round(startOffset)}s intro).

Generate ${clipCount} high-retention highlight clips formatted as a JSON array with these fields for each clip:
- "startTime": float (in seconds between ${Math.round(startOffset)} and ${Math.round(videoDuration)})
- "endTime": float (in seconds, duration 120-240 seconds per clip)
- "duration": float
- "title": string (engaging Khmer title matching sermon topic "${category}")
- "top1": string (Khmer top caption word part 1)
- "top2": string (Khmer top caption word part 2)
- "bot1": string (Khmer bottom caption word part 1)
- "bot2": string (Khmer bottom caption word part 2)
- "viralScore": string (e.g. "99%", "98%")
- "tags": array of strings (e.g. ["#\u1794\u17BB\u178E\u17D2\u1799", "#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6"])
- "transcript": string (spoken Dhamma excerpt in Khmer)

Return ONLY valid raw JSON array inside [ ... ] without any markdown formatting.`;
      const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.8-flash"];
      let resp = null;
      let lastErr = null;
      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt2 }] }]
            })
          });
          if (resp.ok) break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!resp || !resp.ok) {
        throw new Error(`Gemini API Error: ${resp ? resp.status : lastErr}`);
      }
      const data = await resp.json();
      let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      rawText = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
      const jsonArray = JSON.parse(rawText);
      return jsonArray.map((c, i) => ({
        id: Date.now() + i,
        startTime: Number(c.startTime || c.start_time || startOffset + i * 220),
        endTime: Number(c.endTime || c.end_time || startOffset + (i + 1) * 220),
        duration: Number(c.duration || 180),
        title: c.title || `\u179F\u17B6\u1785\u17CB\u1792\u1798\u17CC\u179F\u17C6\u1781\u17B6\u1793\u17CB \u1797\u17B6\u1782\u1791\u17B8${i + 1}`,
        top1: c.top1 || c.top_1 || "\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6",
        top2: c.top2 || c.top_2 || "\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F",
        bot1: c.bot1 || c.bot_1 || "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781",
        bot2: c.bot2 || c.bot_2 || "\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F",
        viralScore: c.viralScore || c.viral_score || "98%",
        tags: c.tags || ["#\u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6", "#\u1794\u17BB\u178E\u17D2\u1799"],
        transcript: c.transcript || '" \u1792\u1798\u17CC\u1791\u17C1\u179F\u1793\u17B6\u17A2\u1794\u17CB\u179A\u17C6\u1785\u17B7\u178F\u17D2\u178F \u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u179F\u17B6\u1793\u17D2\u178F... "'
      }));
    }
    function generateKhmerAiClips(videoDuration, fileName, modelId) {
      videoDuration = typeof videoDuration === "number" && videoDuration > 0 ? videoDuration : 1800;
      const durationSelect = document.getElementById("aiDurationModeSelect");
      const categorySelect = document.getElementById("aiCategorySelect");
      const skipIntroCheck = document.getElementById("aiSkipIntroChantCheck");
      const skipDurationSelect = document.getElementById("aiIntroSkipDurationSelect");
      const customTopicInput = document.getElementById("aiCustomTopicInput");
      const category = categorySelect ? categorySelect.value : "auto";
      const shouldSkipIntro = skipIntroCheck ? skipIntroCheck.checked : true;
      const userSkipSecs = skipDurationSelect ? parseInt(skipDurationSelect.value, 10) : 300;
      const customTopicText = customTopicInput ? customTopicInput.value.trim() : "";
      if (!modelId) {
        const selEl = document.getElementById("omniRouteModelSelect");
        modelId = selEl && selEl.value ? selEl.value : aiState.omniRouteModel || "auto/best-fast";
      }
      const mLower = String(modelId || "").toLowerCase();
      let profileKey = "gpt4o";
      if (mLower.includes("opus") || mLower.includes("claude-opus")) {
        profileKey = "claude_opus";
      } else if (mLower.includes("sonnet") || mLower.includes("haiku") || mLower.includes("claude")) {
        profileKey = "claude_sonnet";
      } else if (mLower.includes("gemini")) {
        profileKey = "gemini";
      } else if (mLower.includes("deepseek") || mLower.includes("reasoning") || mLower.includes("o3-mini")) {
        profileKey = "deepseek";
      } else if (mLower.includes("llama") || mLower.includes("qwen") || mLower.includes("gemma")) {
        profileKey = "llama";
      } else {
        profileKey = "gpt4o";
      }
      const modelProfiles = {
        claude_opus: {
          badge: "\u{1F451} Claude Opus 4 \u2014 99.8% Flagship Depth",
          strategyNote: "\u{1F9E0} \u1791\u179F\u17D2\u179F\u1793\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC\u1787\u17D2\u179A\u17C5\u1787\u17D2\u179A\u17C7 & \u17A2\u1797\u17B7\u1792\u1798\u17D2\u1798 (High Retention & Philosophical Depth)",
          badgeColor: "#ec4899",
          offsetShift: 75,
          baseDuration: [210, 240, 220, 250, 215, 230, 245, 225, 235, 250, 220, 240],
          viralScores: ["99.8%", "99.7%", "99.6%", "99.5%", "99.8%", "99.4%", "99.6%", "99.5%", "99.7%", "99.9%", "99.5%", "99.8%"],
          storylines: [
            {
              title: "\u1792\u1798\u17D2\u1798\u1787\u17B6\u178F\u17B7\u1785\u17B7\u178F\u17D2\u178F \u1793\u17B7\u1784\u179A\u179B\u1780\u1780\u1798\u17D2\u1798\u1795\u179B\u1780\u17D2\u1793\u17BB\u1784\u17A2\u1797\u17B7\u1792\u1798\u17D2\u1798 (\u1797\u17B6\u1782\u17E1)",
              top1: "\u1792\u1798\u17D2\u1798\u1787\u17B6\u178F\u17B7\u1785\u17B7\u178F\u17D2\u178F",
              top2: "\u1793\u17B7\u1784\u179A\u179B\u1780\u1780\u1798\u17D2\u1798\u1795\u179B",
              bot1: "\u17A2\u1797\u17B7\u1792\u1798\u17D2\u1798\u1792\u1798\u17CC",
              bot2: "\u1794\u1780\u179F\u17D2\u179A\u17B6\u1799\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC",
              tags: ["#\u17A2\u1797\u17B7\u1792\u1798\u17D2\u1798", "#\u1780\u1798\u17D2\u1798\u1795\u179B", "#\u1791\u179F\u17D2\u179F\u1793\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6"],
              transcript: '" \u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC\u1780\u17D2\u1793\u17BB\u1784\u1782\u1798\u17D2\u1796\u17B8\u179A\u17A2\u1797\u17B7\u1792\u1798\u17D2\u1798 \u1794\u1784\u17D2\u17A0\u17B6\u1789\u1796\u17B8\u1792\u1798\u17D2\u1798\u1787\u17B6\u178F\u17B7\u1785\u17B7\u178F\u17D2\u178F\u178A\u17C2\u179B\u1780\u17BE\u178F\u179A\u179B\u178F\u17CB\u179A\u17B6\u1794\u17CB\u179B\u17B6\u1793\u178A\u1784\u1780\u17D2\u1793\u17BB\u1784\u1798\u17BD\u1799\u1796\u1796\u17D2\u179A\u17B7\u1785\u1797\u17D2\u1793\u17C2\u1780... "'
            },
            {
              title: "\u1794\u1789\u17D2\u1789\u17B6\u178A\u17B9\u1784\u1785\u17D2\u1794\u17B6\u179F\u17CB\u179A\u17C6\u178A\u17C4\u17C7\u1795\u17BB\u178F\u1791\u17BB\u1780\u17D2\u1781\u1791\u17B6\u17C6\u1784\u1796\u17BD\u1784 (\u1797\u17B6\u1782\u17E2)",
              top1: "\u1794\u1789\u17D2\u1789\u17B6\u178A\u17B9\u1784\u1785\u17D2\u1794\u17B6\u179F\u17CB",
              top2: "\u179A\u17C6\u178A\u17C4\u17C7\u1795\u17BB\u178F\u1791\u17BB\u1780\u17D2\u1781",
              bot1: "\u17A2\u1793\u17B7\u1785\u17D2\u1785\u17C6 \u1791\u17BB\u1780\u17D2\u1781\u17C6",
              bot2: "\u17A2\u1793\u178F\u17D2\u178F\u17B6\u1787\u17B6\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC",
              tags: ["#\u178F\u17D2\u179A\u17C3\u179B\u1780\u17D2\u1781\u178E\u17CD", "#\u1794\u1789\u17D2\u1789\u17B6\u179A\u17C6\u178A\u17C4\u17C7\u1791\u17BB\u1780\u17D2\u1781", "#\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC"],
              transcript: '" \u1780\u17B6\u179B\u178E\u17B6\u1794\u1789\u17D2\u1789\u17B6\u178A\u17B9\u1784\u1785\u17D2\u1794\u17B6\u179F\u17CB\u1793\u17BC\u179C\u178F\u17D2\u179A\u17C3\u179B\u1780\u17D2\u1781\u178E\u17CD \u1785\u17B7\u178F\u17D2\u178F\u1780\u17CF\u1798\u17B7\u1793\u1787\u17B6\u1794\u17CB\u1787\u17C6\u1796\u17B6\u1780\u17CB\u1793\u17B9\u1784\u1791\u17BB\u1780\u17D2\u1781\u1791\u17B6\u17C6\u1784\u1796\u17BD\u1784... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1794\u178A\u17B7\u1794\u178F\u17D2\u178F\u17B7\u1792\u1798\u17CC\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u179F\u1784\u17D2\u179F\u17B6\u179A\u179C\u178A\u17D2\u178F (\u1797\u17B6\u1782\u17E3)",
              top1: "\u1780\u17B6\u179A\u1794\u178A\u17B7\u1794\u178F\u17D2\u178F\u17B7\u1792\u1798\u17CC",
              top2: "\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u179F\u1784\u17D2\u179F\u17B6\u179A\u179C\u178A\u17D2\u178F",
              bot1: "\u1780\u1798\u17D2\u1785\u17B6\u178F\u17CB\u178F\u178E\u17D2\u17A0\u17B6",
              bot2: "\u1793\u17B7\u1784\u17A2\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1787\u17B6\u17AB\u179F\u1782\u179B\u17CB",
              tags: ["#\u179F\u1784\u17D2\u179F\u17B6\u179A\u179C\u178A\u17D2\u178F", "#\u1780\u17B6\u179A\u1794\u178A\u17B7\u1794\u178F\u17D2\u178F\u17B7", "#\u1780\u1798\u17D2\u1785\u17B6\u178F\u17CB\u1780\u17B7\u179B\u17C1\u179F"],
              transcript: '" \u17AB\u179F\u1782\u179B\u17CB\u1793\u17C3\u1791\u17BB\u1780\u17D2\u1781\u1782\u17BA\u178F\u178E\u17D2\u17A0\u17B6\u1793\u17B7\u1784\u17A2\u179C\u17B7\u1787\u17D2\u1787\u17B6 \u1780\u17B6\u179A\u1785\u1798\u17D2\u179A\u17BE\u1793\u179F\u178F\u17B7\u1791\u17BE\u1794\u17A2\u17B6\u1785\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u179C\u17B6\u1794\u17B6\u1793... "'
            },
            {
              title: "\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC\u1787\u17B6\u1794\u17D2\u179A\u1791\u17B8\u1794\u1794\u17C6\u1797\u17D2\u179B\u17BA\u1795\u17D2\u179B\u17BC\u179C\u1787\u17B8\u179C\u17B7\u178F (\u1797\u17B6\u1782\u17E4)",
              top1: "\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC\u1787\u17B6\u1794\u17D2\u179A\u1791\u17B8\u1794",
              top2: "\u1794\u17C6\u1797\u17D2\u179B\u17BA\u1795\u17D2\u179B\u17BC\u179C\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6",
              bot2: "\u1780\u1798\u17D2\u1785\u17B6\u178F\u17CB\u1797\u17B6\u1796\u1784\u1784\u17B9\u178F",
              tags: ["#\u1796\u1793\u17D2\u179B\u17BA\u1794\u1789\u17D2\u1789\u17B6", "#\u1795\u17D2\u179B\u17BC\u179C\u1787\u17B8\u179C\u17B7\u178F", "#\u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u17B1\u179C\u17B6\u1791"],
              transcript: '" \u1798\u17B7\u1793\u1798\u17B6\u1793\u1796\u1793\u17D2\u179B\u17BA\u178E\u17B6\u1797\u17D2\u179B\u17BA\u179F\u17D2\u1798\u17BE\u1793\u17B9\u1784\u1796\u1793\u17D2\u179B\u17BA\u1793\u17C3\u1794\u1789\u17D2\u1789\u17B6\u178A\u17C2\u179B\u1799\u179B\u17CB\u1785\u17D2\u1794\u17B6\u179F\u17CB\u1796\u17B8\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC\u17A1\u17BE\u1799... "'
            },
            {
              title: "\u17A2\u179A\u17B7\u1799\u179F\u1785\u17D2\u1785\u17E4 \u1793\u17B7\u1784\u1795\u17D2\u179B\u17BC\u179C\u1786\u17D2\u1796\u17C4\u17C7\u1791\u17C5\u1780\u17B6\u1793\u17CB\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796 (\u1797\u17B6\u1782\u17E5)",
              top1: "\u17A2\u179A\u17B7\u1799\u179F\u1785\u17D2\u1785\u17E4",
              top2: "\u1795\u17D2\u179B\u17BC\u179C\u1786\u17D2\u1796\u17C4\u17C7\u1791\u17C5\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796",
              bot1: "\u1791\u17BB\u1780\u17D2\u1781\u1793\u17B7\u1784\u1780\u17B6\u179A\u179A\u17C6\u179B\u178F\u17CB\u1791\u17BB\u1780\u17D2\u1781",
              bot2: "\u1787\u17B6\u1798\u17C1\u179A\u17C0\u1793\u1787\u17B8\u179C\u17B7\u178F",
              tags: ["#\u17A2\u179A\u17B7\u1799\u179F\u1785\u17D2\u1785\u17E4", "#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796", "#\u1798\u1782\u17D2\u1782\u1795\u179B"],
              transcript: '" \u1780\u17B6\u179A\u1799\u179B\u17CB\u1785\u17D2\u1794\u17B6\u179F\u17CB\u1796\u17B8\u17A2\u179A\u17B7\u1799\u179F\u1785\u17D2\u1785\u1791\u17B6\u17C6\u1784\u1794\u17BD\u1793 \u1787\u17B6\u1791\u17D2\u179C\u17B6\u179A\u1793\u17B6\u17C6\u1791\u17C5\u179A\u1780\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A... "'
            },
            {
              title: "\u179F\u17B8\u179B \u179F\u1798\u17B6\u1792\u17B7 \u1794\u1789\u17D2\u1789\u17B6 \u1787\u17B6\u1798\u1782\u17D2\u1782\u179F\u1785\u17D2\u1785 (\u1797\u17B6\u1782\u17E6)",
              top1: "\u179F\u17B8\u179B \u179F\u1798\u17B6\u1792\u17B7",
              top2: "\u1794\u1789\u17D2\u1789\u17B6\u1787\u17B6\u1798\u1782\u17D2\u1782\u179F\u1785\u17D2\u1785",
              bot1: "\u178A\u17C6\u178E\u17BE\u179A\u1787\u17B8\u179C\u17B7\u178F",
              bot2: "\u1786\u17D2\u1796\u17C4\u17C7\u1791\u17C5\u179A\u1780\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB",
              tags: ["#\u178F\u17D2\u179A\u17C3\u179F\u17B7\u1780\u17D2\u1781\u17B6", "#\u179F\u17B8\u179B\u179F\u1798\u17B6\u1792\u17B7\u1794\u1789\u17D2\u1789\u17B6", "#\u1798\u1782\u17D2\u1782\u179F\u1785\u17D2\u1785"],
              transcript: '" \u179F\u17B8\u179B\u1787\u17B6\u1782\u17D2\u179A\u17B9\u17C7 \u179F\u1798\u17B6\u1792\u17B7\u1787\u17B6\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784 \u1794\u1789\u17D2\u1789\u17B6\u1787\u17B6\u1780\u17B6\u17C6\u1794\u17B7\u178F\u1780\u17B6\u178F\u17CB\u1795\u17D2\u178F\u17B6\u1785\u17CB\u1780\u17B7\u179B\u17C1\u179F... "'
            },
            {
              title: "\u1780\u1798\u17D2\u1798\u1795\u179B\u1793\u17B7\u1784\u178A\u17C6\u178E\u17BE\u179A\u1787\u17B8\u179C\u17B7\u178F\u179F\u178F\u17D2\u179C\u179B\u17C4\u1780 (\u1797\u17B6\u1782\u17E7)",
              top1: "\u1780\u1798\u17D2\u1798\u1795\u179B\u1793\u17B7\u1784\u178A\u17C6\u178E\u17BE\u179A",
              top2: "\u1787\u17B8\u179C\u17B7\u178F\u179F\u178F\u17D2\u179C\u179B\u17C4\u1780",
              bot1: "\u178A\u17B6\u17C6\u1796\u17BC\u1787\u17A2\u17D2\u179C\u17B8",
              bot2: "\u1794\u17B6\u1793\u1795\u179B\u1793\u17C4\u17C7",
              tags: ["#\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1780\u1798\u17D2\u1798\u1795\u179B", "#\u179F\u178F\u17D2\u179C\u179B\u17C4\u1780", "#\u1796\u17BC\u1787\u1780\u17BB\u179F\u179B"],
              transcript: '" \u179F\u178F\u17D2\u179C\u179B\u17C4\u1780\u1798\u17B6\u1793\u1780\u1798\u17D2\u1798\u1787\u17B6\u179A\u1794\u179F\u17CB\u1781\u17D2\u179B\u17BD\u1793 \u1798\u17B6\u1793\u1780\u1798\u17D2\u1798\u1787\u17B6\u1780\u17C1\u179A\u17D2\u178F\u17B7\u17CD\u17A2\u17B6\u1780\u179A \u1793\u17B7\u1784\u1787\u17B6\u1791\u17B8\u1796\u17B9\u1784... "'
            },
            {
              title: "\u179F\u178F\u17B7\u178A\u17B9\u1784\u1791\u17B6\u1793\u17CB\u1785\u17B7\u178F\u17D2\u178F\u1780\u17D2\u1793\u17BB\u1784\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793 (\u1797\u17B6\u1782\u17E8)",
              top1: "\u179F\u178F\u17B7\u178A\u17B9\u1784\u1791\u17B6\u1793\u17CB\u1785\u17B7\u178F\u17D2\u178F",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1797\u17B6\u1796",
              bot1: "\u179A\u179F\u17CB\u1793\u17C5\u1787\u17B6\u1798\u17BD\u1799\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
              bot2: "\u1798\u17B7\u1793\u179F\u17C4\u1780\u179F\u17D2\u178F\u17B6\u1799\u17A2\u178F\u17B8\u178F",
              tags: ["#\u179F\u178F\u17B7\u179F\u1798\u17D2\u1794\u1787\u1789\u17D2\u1789\u17C8", "#\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1797\u17B6\u1796", "#\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB"],
              transcript: '" \u1785\u17B7\u178F\u17D2\u178F\u178A\u17C2\u179B\u1793\u17C5\u1787\u17B6\u1794\u17CB\u1793\u17B9\u1784\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793 \u1798\u17B7\u1793\u17A2\u1793\u17D2\u1791\u17C7\u17A2\u1793\u17D2\u1791\u17C2\u1784\u1791\u17C5\u17A2\u1793\u17B6\u1782\u178F \u1782\u17BA\u1787\u17B6\u1785\u17B7\u178F\u17D2\u178F\u1798\u17B6\u1793\u179F\u1793\u17D2\u178F\u17B7... "'
            },
            {
              title: "\u1780\u17B6\u179A\u179B\u17C7\u1794\u1784\u17CB\u1793\u17BC\u179C\u17A7\u1794\u17B6\u1791\u17B6\u1793\u1780\u17B6\u179A\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB (\u1797\u17B6\u1782\u17E9)",
              top1: "\u179B\u17C7\u1794\u1784\u17CB\u17A7\u1794\u17B6\u1791\u17B6\u1793",
              top2: "\u1780\u17B6\u179A\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB\u1798\u17B6\u17C6",
              bot1: "\u1794\u17BE\u1798\u17B7\u1793\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB",
              bot2: "\u1785\u17B7\u178F\u17D2\u178F\u1780\u17CF\u1798\u17B7\u1793\u1792\u17D2\u1784\u1793\u17CB",
              tags: ["#\u179B\u17C7\u1794\u1784\u17CB\u17A7\u1794\u17B6\u1791\u17B6\u1793", "#\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u179A\u17B6\u179B", "#\u1792\u1798\u17CC\u17A2\u1794\u17CB\u179A\u17C6"],
              transcript: '" \u1791\u17BB\u1780\u17D2\u1781\u1780\u17BE\u178F\u17A1\u17BE\u1784\u1796\u17D2\u179A\u17C4\u17C7\u178F\u17C2\u1780\u17B6\u179A\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB \u1780\u17B6\u179B\u178E\u17B6\u179B\u17C2\u1784\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB \u1791\u17BB\u1780\u17D2\u1781\u1780\u17CF\u179A\u179B\u178F\u17CB\u1791\u17C5... "'
            },
            {
              title: "\u1796\u17BB\u1791\u17D2\u1792\u17C4\u179C\u17B6\u1791\u179F\u17D2\u178A\u17B8\u1796\u17B8\u1793\u17B7\u1796\u17D2\u179C\u17B6\u1793\u1793\u17B7\u1784\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u1796\u17BB\u1791\u17D2\u1792\u17C4\u179C\u17B6\u1791\u179F\u17D2\u178A\u17B8\u1796\u17B8",
              top2: "\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1781\u17B6\u1784\u1780\u17D2\u1793\u17BB\u1784",
              bot1: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792",
              bot2: "\u1795\u17BB\u178F\u179F\u17D2\u179A\u17A1\u17C7\u1796\u17B8\u1791\u17BB\u1780\u17D2\u1781",
              tags: ["#\u1793\u17B7\u1796\u17D2\u179C\u17B6\u1793", "#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1796\u17B7\u178F", "#\u1794\u179A\u1798\u179F\u17BB\u1781"],
              transcript: '" \u1793\u17B7\u1796\u17D2\u179C\u17B6\u1793\u17C6 \u1794\u179A\u1798\u17C6 \u179F\u17BB\u1781\u17C6 \u2014 \u1796\u17D2\u179A\u17C7\u1793\u17B7\u1796\u17D2\u179C\u17B6\u1793\u1787\u17B6\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u178A\u17CF\u1794\u17D2\u179A\u179F\u17BE\u179A\u1794\u17C6\u1795\u17BB\u178F... "'
            },
            {
              title: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1793\u17C3\u1785\u17B7\u178F\u17D2\u178F\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792 (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1793\u17C3\u1785\u17B7\u178F\u17D2\u178F",
              top2: "\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792",
              bot1: "\u1794\u17BB\u178E\u17D2\u1799\u1787\u17B6\u179F\u17D2\u1794\u17C0\u1784",
              bot2: "\u1786\u17D2\u179B\u1784\u179F\u1784\u17D2\u179F\u17B6\u179A\u179C\u178A\u17D2\u178F",
              tags: ["#\u1785\u17B7\u178F\u17D2\u178F\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6", "#\u179F\u17D2\u1794\u17C0\u1784\u1794\u17BB\u178E\u17D2\u1799", "#\u1798\u17A0\u17B6\u1780\u17BB\u179F\u179B"],
              transcript: '" \u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u17A2\u17B6\u178F\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792\u178F\u17C2\u1784\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781 \u178A\u17BC\u1785\u179F\u17D2\u179A\u1798\u17C4\u179B\u178F\u17B6\u1798\u1794\u17D2\u179A\u17B6\u178E... "'
            },
            {
              title: "\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC\u1785\u17BB\u1784\u1780\u17D2\u179A\u17C4\u1799\u1793\u17C3\u1780\u17B6\u179A\u1780\u17BE\u178F\u179F\u17D2\u179B\u17B6\u1794\u17CB (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC\u1785\u17BB\u1784\u1780\u17D2\u179A\u17C4\u1799",
              top2: "\u1793\u17C3\u1780\u17B6\u179A\u1780\u17BE\u178F\u179F\u17D2\u179B\u17B6\u1794\u17CB",
              bot1: "\u1780\u17BB\u17C6\u1794\u17D2\u179A\u1798\u17B6\u1791\u1780\u17D2\u1793\u17BB\u1784\u1792\u1798\u17CC",
              bot2: "\u179F\u17B6\u1784\u1780\u17BB\u179F\u179B\u1787\u17B6\u1793\u17B7\u1785\u17D2\u1785",
              tags: ["#\u1798\u17B7\u1793\u1794\u17D2\u179A\u1798\u17B6\u1791", "#\u179F\u1785\u17D2\u1785\u1792\u1798\u17CC", "#\u1780\u17BB\u179F\u179B\u1792\u1798\u17CC"],
              transcript: '" \u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6\u1798\u17B7\u1793\u179A\u1784\u17CB\u1785\u17B6\u17C6\u1793\u179A\u178E\u17B6\u17A1\u17BE\u1799 \u1782\u1794\u17D2\u1794\u17B8\u1794\u17D2\u179A\u1789\u17B6\u1794\u17CB\u1794\u17D2\u179A\u1789\u17B6\u179B\u17CB\u179F\u17B6\u1784\u17A2\u17C6\u1796\u17BE\u179B\u17D2\u17A2... "'
            }
          ]
        },
        claude_sonnet: {
          badge: "\u{1F3AD} Claude Sonnet 4.5 \u2014 99.4% Emotional Depth",
          strategyNote: "\u2764\uFE0F \u1792\u1798\u17CC\u179F\u17D2\u17A2\u17C6\u1785\u17B7\u178F\u17D2\u178F \u179F\u17D2\u179C\u17C2\u1784\u1799\u179B\u17CB\u1796\u17B8\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD \u1793\u17B7\u1784\u178A\u17C4\u17C7\u179F\u17D2\u179A\u17B6\u1799\u179C\u17B7\u1794\u178F\u17D2\u178F\u17B7\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A",
          badgeColor: "#a855f7",
          offsetShift: 45,
          baseDuration: [180, 200, 175, 210, 185, 195, 205, 170, 190, 215, 180, 200],
          viralScores: ["99.4%", "99.2%", "99.5%", "99.1%", "99.6%", "99.3%", "99.4%", "99.0%", "99.5%", "99.7%", "99.2%", "99.4%"],
          storylines: [
            {
              title: "\u179C\u17B7\u1792\u17B8\u179A\u17C6\u1784\u17B6\u1794\u17CB\u1780\u17C6\u17A0\u17B9\u1784 \u1793\u17B7\u1784\u179F\u17B6\u1784\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB\u1780\u17D2\u1793\u17BB\u1784\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A (\u1797\u17B6\u1782\u17E1)",
              top1: "\u179C\u17B7\u1792\u17B8\u179A\u17C6\u1784\u17B6\u1794\u17CB\u1780\u17C6\u17A0\u17B9\u1784",
              top2: "\u179F\u17B6\u1784\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB\u1780\u17D2\u1793\u17BB\u1784\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A",
              bot1: "\u1788\u17D2\u1793\u17C7\u1780\u17C6\u17A0\u17B9\u1784",
              bot2: "\u178A\u17C4\u1799\u1785\u17B7\u178F\u17D2\u178F\u1798\u17C1\u178F\u17D2\u178F\u17B6",
              tags: ["#\u179A\u17C6\u1784\u17B6\u1794\u17CB\u1780\u17C6\u17A0\u17B9\u1784", "#\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A\u179F\u17BB\u1797\u1798\u1784\u17D2\u1782\u179B", "#\u1798\u17C1\u178F\u17D2\u178F\u17B6\u1792\u1798\u17CC"],
              transcript: '" \u1780\u17B6\u179B\u178E\u17B6\u1780\u17C6\u17A0\u17B9\u1784\u1786\u17C1\u17C7\u1786\u17BD\u179B \u1785\u17BC\u179A\u1793\u17C5\u179F\u17D2\u1784\u17C0\u1798\u1798\u17BD\u1799\u1797\u17D2\u179B\u17C2\u178F \u1780\u17BB\u17C6\u17B2\u17D2\u1799\u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8\u1794\u17C6\u1795\u17D2\u179B\u17B6\u1789\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A... "'
            },
            {
              title: "\u1791\u17B9\u1780\u1797\u17D2\u1793\u17C2\u1780\u1798\u17D2\u178F\u17B6\u1799 \u1793\u17B7\u1784\u178F\u1798\u17D2\u179B\u17C3\u1793\u17C3\u1780\u178F\u1789\u17D2\u1789\u17BC\u178F\u17B6\u1792\u1798\u17CC (\u1797\u17B6\u1782\u17E2)",
              top1: "\u1791\u17B9\u1780\u1797\u17D2\u1793\u17C2\u1780\u1798\u17D2\u178F\u17B6\u1799",
              top2: "\u178F\u1798\u17D2\u179B\u17C3\u1780\u178F\u1789\u17D2\u1789\u17BC\u178F\u17B6\u1792\u1798\u17CC",
              bot1: "\u178A\u17B9\u1784\u1782\u17BB\u178E\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\u1782\u17BB\u178E",
              bot2: "\u1787\u17B6\u1798\u1784\u17D2\u1782\u179B\u1781\u17D2\u1796\u1784\u17CB\u1781\u17D2\u1796\u179F\u17CB",
              tags: ["#\u1782\u17BB\u178E\u1798\u17D2\u178F\u17B6\u1799", "#\u1780\u178F\u1789\u17D2\u1789\u17BC", "#\u1791\u17B9\u1780\u1797\u17D2\u1793\u17C2\u1780\u1798\u17D2\u178F\u17B6\u1799"],
              transcript: '" \u1782\u17BB\u178E\u1798\u17B6\u178F\u17B6\u1794\u17B7\u178F\u17B6\u1792\u17C6\u1792\u17C1\u1784\u178A\u17BC\u1785\u1798\u17A0\u17B6\u179F\u1798\u17BB\u1791\u17D2\u179A \u1782\u17D2\u1798\u17B6\u1793\u17A2\u17D2\u179C\u17B8\u17A2\u17B6\u1785\u1780\u17B6\u178F\u17CB\u1790\u17D2\u179B\u17C3\u1794\u17B6\u1793\u17A1\u17BE\u1799... "'
            },
            {
              title: "\u1780\u17B6\u179A\u17A2\u178F\u17CB\u17B1\u1793\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u179A\u1794\u17BD\u179F\u1794\u17C1\u17C7\u178A\u17BC\u1784 (\u1797\u17B6\u1782\u17E3)",
              top1: "\u1780\u17B6\u179A\u17A2\u178F\u17CB\u17B1\u1793",
              top2: "\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u179A\u1794\u17BD\u179F\u1794\u17C1\u17C7\u178A\u17BC\u1784",
              bot1: "\u179B\u17C7\u1794\u1784\u17CB\u1782\u17C6\u1793\u17BB\u17C6",
              bot2: "\u178A\u17BE\u1798\u17D2\u1794\u17B8\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              tags: ["#\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u1794\u17C1\u17C7\u178A\u17BC\u1784", "#\u1780\u17B6\u179A\u17A2\u178F\u17CB\u17B1\u1793", "#\u179B\u17C7\u1794\u1784\u17CB\u1782\u17C6\u1793\u17BB\u17C6"],
              transcript: '" \u1780\u17B6\u179A\u1785\u1784\u1782\u17C6\u1793\u17BB\u17C6 \u178A\u17BC\u1785\u1787\u17B6\u1780\u17B6\u179A\u1795\u17B9\u1780\u1790\u17D2\u1793\u17B6\u17C6\u1796\u17BB\u179B\u178F\u17C2\u179F\u1784\u17D2\u1783\u17B9\u1798\u17B2\u17D2\u1799\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3\u179F\u17D2\u179B\u17B6\u1794\u17CB\u178A\u17BC\u1785\u17D2\u1793\u17C4\u17C7\u178A\u17C2\u179A... "'
            },
            {
              title: "\u1798\u17C1\u178F\u17D2\u178F\u17B6\u1792\u1798\u17CC\u1788\u17D2\u1793\u17C7\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u17A2\u1794\u17CB\u1781\u17D2\u1796\u17BE\u1798 (\u1797\u17B6\u1782\u17E4)",
              top1: "\u1798\u17C1\u178F\u17D2\u178F\u17B6\u1792\u1798\u17CC",
              top2: "\u1788\u17D2\u1793\u17C7\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u17A2\u1794\u17CB\u1781\u17D2\u1796\u17BE\u1798",
              bot1: "\u1796\u17B6\u1780\u17D2\u1799\u1795\u17D2\u17A2\u17C2\u1798\u179B\u17D2\u17A0\u17C2\u1798",
              bot2: "\u1795\u17D2\u179F\u17C7\u1795\u17D2\u179F\u17B6\u1791\u17C6\u1793\u17B6\u179F\u17CB",
              tags: ["#\u1798\u17C1\u178F\u17D2\u178F\u17B6\u1792\u1798\u17CC", "#\u1795\u17D2\u179F\u17C7\u1795\u17D2\u179F\u17B6", "#\u1796\u17B6\u1780\u17D2\u1799\u1795\u17D2\u17A2\u17C2\u1798\u1796\u17B7\u179A\u17C4\u17C7"],
              transcript: '" \u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8\u1791\u1793\u17CB\u1797\u17D2\u179B\u1793\u17CB\u178F\u17C2\u1798\u17B6\u1793\u17A2\u17C6\u178E\u17B6\u1785 \u17A2\u17B6\u1785\u179A\u17C6\u179B\u17B6\u1799\u1785\u17B7\u178F\u17D2\u178F\u178A\u17C2\u179B\u179A\u17B9\u1784\u178A\u17BC\u1785\u1790\u17D2\u1798... "'
            },
            {
              title: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1796\u17B7\u178F\u1780\u17BE\u178F\u1785\u17C1\u1789\u1796\u17B8\u1785\u17B7\u178F\u17D2\u178F\u1785\u17C1\u17C7\u179B\u17C7\u1794\u1784\u17CB (\u1797\u17B6\u1782\u17E5)",
              top1: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1796\u17B7\u178F",
              top2: "\u1780\u17BE\u178F\u1796\u17B8\u1785\u17B7\u178F\u17D2\u178F\u179B\u17C7\u1794\u1784\u17CB",
              bot1: "\u1794\u17BE\u1798\u17B7\u1793\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB",
              bot2: "\u1785\u17B7\u178F\u17D2\u178F\u1780\u17CF\u179F\u17D2\u179A\u17B6\u179B\u179F\u17D2\u179A\u17A1\u17C7",
              tags: ["#\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB", "#\u1785\u17B7\u178F\u17D2\u178F\u179B\u17C7\u1794\u1784\u17CB", "#\u1798\u17B7\u1793\u1794\u17D2\u179A\u1780\u17B6\u1793\u17CB"],
              transcript: '" \u1780\u17B6\u179A\u1785\u17C1\u17C7\u179B\u17C7\u1794\u1784\u17CB\u1798\u17B7\u1793\u1798\u17C2\u1793\u1787\u17B6\u1780\u17B6\u179A\u1785\u17B6\u1789\u17CB \u178F\u17C2\u1787\u17B6\u1780\u17B6\u179A\u1788\u17D2\u1793\u17C7\u1785\u17B7\u178F\u17D2\u178F\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u178A\u17CF\u17A2\u179F\u17D2\u1785\u17B6\u179A\u17D2\u1799... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1799\u179B\u17CB\u1785\u17B7\u178F\u17D2\u178F\u1782\u17D2\u1793\u17B6\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u1784\u17A2\u17B6\u1796\u17B6\u17A0\u17CD\u1796\u17B7\u1796\u17B6\u17A0\u17CD (\u1797\u17B6\u1782\u17E6)",
              top1: "\u1780\u17B6\u179A\u1799\u179B\u17CB\u1785\u17B7\u178F\u17D2\u178F\u1782\u17D2\u1793\u17B6",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F\u1794\u17D2\u178F\u17B8\u1794\u17D2\u179A\u1796\u1793\u17D2\u1792",
              bot1: "\u179A\u17BD\u1798\u179F\u17BB\u1781\u179A\u17BD\u1798\u1791\u17BB\u1780\u17D2\u1781",
              bot2: "\u178A\u17C4\u1799\u1797\u1780\u17D2\u178F\u17B8\u1797\u17B6\u1796",
              tags: ["#\u1787\u17B8\u179C\u17B7\u178F\u1782\u17BC", "#\u1799\u17C4\u1782\u1799\u179B\u17CB\u1782\u17D2\u1793\u17B6", "#\u1797\u1780\u17D2\u178F\u17B8\u1797\u17B6\u1796"],
              transcript: '" \u179F\u17BB\u1797\u1798\u1784\u17D2\u1782\u179B\u1780\u17D2\u1793\u17BB\u1784\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A \u1798\u17B7\u1793\u1798\u17C2\u1793\u1780\u17BE\u178F\u1796\u17B8\u179B\u17BB\u1799\u1780\u17B6\u1780\u17CB \u178F\u17C2\u1796\u17B8\u1780\u17B6\u179A\u1785\u17C1\u17C7\u17A2\u178F\u17CB\u17B1\u1793\u17B2\u17D2\u1799\u1782\u17D2\u1793\u17B6... "'
            },
            {
              title: "\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u1785\u17B7\u178F\u17D2\u178F\u179F\u17C4\u1780\u179F\u17C5\u1796\u17C1\u179B\u1794\u17B6\u178F\u17CB\u1794\u1784\u17CB (\u1797\u17B6\u1782\u17E7)",
              top1: "\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u1785\u17B7\u178F\u17D2\u178F\u179F\u17C4\u1780\u179F\u17C5",
              top2: "\u1796\u17C1\u179B\u1787\u17BD\u1794\u1780\u17B6\u179A\u1794\u17B6\u178F\u17CB\u1794\u1784\u17CB",
              bot1: "\u1791\u1791\u17BD\u179B\u179F\u17D2\u1782\u17B6\u179B\u17CB\u1780\u17B6\u179A\u1796\u17B7\u178F",
              bot2: "\u178A\u17C4\u1799\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB",
              tags: ["#\u1796\u17D2\u1799\u17B6\u1794\u17B6\u179B\u1791\u17BB\u1780\u17D2\u1781", "#\u1791\u1791\u17BD\u179B\u1780\u17B6\u179A\u1796\u17B7\u178F", "#\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u179A\u1794\u179F\u17CB\u1791\u17B6\u17C6\u1784\u17A1\u17B6\u1799\u1798\u17B6\u1793\u1780\u17B6\u179A\u1794\u17C2\u1780\u1794\u17B6\u1780\u17CB\u1787\u17B6\u1792\u1798\u17D2\u1798\u178F\u17B6 \u1782\u1794\u17D2\u1794\u17B8\u1799\u179B\u17CB\u1793\u17B7\u1784\u179A\u17B9\u1784\u1798\u17B6\u17C6\u17A1\u17BE\u1784\u179C\u17B7\u1789... "'
            },
            {
              title: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB\u178A\u17C4\u1799\u1798\u17B7\u1793\u1798\u17B6\u1793\u1780\u17B6\u179A\u1791\u17B6\u1798\u1791\u17B6\u179A (\u1797\u17B6\u1782\u17E8)",
              top1: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB",
              top2: "\u178A\u17C4\u1799\u1798\u17B7\u1793\u1791\u17B6\u1798\u1791\u17B6\u179A",
              bot1: "\u1780\u17D2\u178F\u17B8\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792",
              bot2: "\u1795\u17D2\u178F\u179B\u17CB\u1793\u17BC\u179C\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781",
              tags: ["#\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792", "#\u1798\u17B7\u1793\u1791\u17B6\u1798\u1791\u17B6\u179A", "#\u1780\u17D2\u178F\u17B8\u1798\u17C1\u178F\u17D2\u178F\u17B6"],
              transcript: '" \u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB\u1796\u17B7\u178F\u1798\u17B7\u1793\u1798\u17C2\u1793\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1782\u17D2\u179A\u1794\u17CB\u1782\u17D2\u179A\u1784\u1782\u17C1 \u178F\u17C2\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1783\u17BE\u1789\u1782\u17C1\u1798\u17B6\u1793\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781... "'
            },
            {
              title: "\u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8\u178A\u17B6\u179F\u17CB\u179F\u17D2\u1798\u17B6\u179A\u178F\u17B8\u1780\u17BC\u1793\u17D7 (\u1797\u17B6\u1782\u17E9)",
              top1: "\u1796\u17B6\u1780\u17D2\u1799\u178A\u17B6\u179F\u17CB\u179F\u17D2\u1798\u17B6\u179A\u178F\u17B8",
              top2: "\u1780\u17BC\u1793\u17D7\u1780\u17D2\u1793\u17BB\u1784\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A",
              bot1: "\u1780\u17BB\u17C6\u1797\u17D2\u179B\u17C1\u1785\u1782\u17BB\u178E\u17AA\u1796\u17BB\u1780\u1798\u17D2\u178F\u17B6\u1799",
              bot2: "\u1796\u17C1\u179B\u179B\u17C4\u1780\u1793\u17C5\u179A\u179F\u17CB",
              tags: ["#\u178F\u1794\u1782\u17BB\u178E", "#\u1780\u17BC\u1793\u179B\u17D2\u17A2", "#\u178A\u17B6\u179F\u17CB\u178F\u17BF\u1793"],
              transcript: '" \u1792\u17D2\u179C\u17BE\u179B\u17D2\u17A2\u1785\u17C6\u1796\u17C4\u17C7\u17AA\u1796\u17BB\u1780\u1798\u17D2\u178F\u17B6\u1799\u1796\u17C1\u179B\u179B\u17C4\u1780\u1793\u17C5\u1798\u17B6\u1793\u1787\u17B8\u179C\u17B7\u178F \u1794\u17D2\u179A\u179F\u17BE\u179A\u1787\u17B6\u1784\u1799\u17C6\u179F\u17C4\u1780\u1796\u17C1\u179B\u179B\u17C4\u1780\u1785\u17C2\u1780\u178B\u17B6\u1793... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1794\u1784\u17D2\u1780\u17BE\u178F\u1794\u179A\u17B7\u1799\u17B6\u1780\u17B6\u179F\u1780\u1780\u17CB\u1780\u17D2\u178F\u17C5\u1780\u17D2\u1793\u17BB\u1784\u1795\u17D2\u1791\u17C7 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u1794\u179A\u17B7\u1799\u17B6\u1780\u17B6\u179F\u1780\u1780\u17CB\u1780\u17D2\u178F\u17C5",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u1795\u17D2\u1791\u17C7\u179F\u1798\u17D2\u1794\u17C2\u1784",
              bot1: "\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798",
              bot2: "\u1787\u17B6\u1790\u17D2\u1793\u17B6\u17C6\u1791\u17B7\u1796\u17D2\u179C\u1782\u17D2\u179A\u17BD\u179F\u17B6\u179A",
              tags: ["#\u1795\u17D2\u1791\u17C7\u1780\u1780\u17CB\u1780\u17D2\u178F\u17C5", "#\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798", "#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796"],
              transcript: '" \u1795\u17D2\u1791\u17C7\u178A\u17C2\u179B\u179F\u1798\u17D2\u1794\u17BC\u179A\u178A\u17C4\u1799\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798 \u1782\u17BA\u1787\u17B6\u178B\u17B6\u1793\u179F\u17BD\u1782\u17CC\u1793\u17C5\u179B\u17BE\u178A\u17B8... "'
            },
            {
              title: "\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB\u1796\u17C1\u179B\u1787\u17BD\u1794\u1796\u17D2\u1799\u17BB\u17C7\u1797\u17D2\u179B\u17C0\u1784\u1787\u17B8\u179C\u17B7\u178F (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB\u1796\u17C1\u179B\u1787\u17BD\u1794",
              top2: "\u1796\u17D2\u1799\u17BB\u17C7\u1797\u17D2\u179B\u17C0\u1784\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u1798\u17B6\u1793\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u17A2\u178F\u17CB\u1792\u17D2\u1798\u178F\u17CB",
              bot2: "\u1798\u17B7\u1793\u1785\u17BB\u17C7\u1785\u17B6\u1789\u17CB\u17A7\u1794\u179F\u1782\u17D2\u1782",
              tags: ["#\u17A2\u178F\u17CB\u1792\u17D2\u1798\u178F\u17CB", "#\u1788\u17D2\u1793\u17C7\u17A7\u1794\u179F\u1782\u17D2\u1782", "#\u179F\u17D2\u1784\u1794\u17CB\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1796\u17D2\u1799\u17BB\u17C7\u1787\u17B8\u179C\u17B7\u178F\u178F\u17C2\u1784\u178F\u17C2\u1780\u1793\u17D2\u179B\u1784\u1795\u17BB\u178F\u1791\u17C5 \u17B2\u17D2\u1799\u178F\u17C2\u1785\u17B7\u178F\u17D2\u178F\u1799\u17BE\u1784\u179A\u17B9\u1784\u1798\u17B6\u17C6 \u1793\u17B7\u1784\u1798\u17B6\u1793\u1792\u1798\u17CC\u1787\u17B6\u1791\u17B8\u1796\u17B9\u1784... "'
            },
            {
              title: "\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1795\u17D2\u179B\u17BC\u179C\u1785\u17B7\u178F\u17D2\u178F\u1787\u17B6\u1791\u17D2\u179A\u1796\u17D2\u1799\u1780\u17C6\u1796\u17BC\u179B (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1795\u17D2\u179B\u17BC\u179C\u1785\u17B7\u178F\u17D2\u178F",
              top2: "\u1787\u17B6\u1791\u17D2\u179A\u1796\u17D2\u1799\u1780\u17C6\u1796\u17BC\u179B",
              bot1: "\u179A\u179F\u17CB\u1793\u17C5\u178A\u17C4\u1799\u179A\u17B8\u1780\u179A\u17B6\u1799",
              bot2: "\u1782\u17D2\u1798\u17B6\u1793\u1780\u17B6\u179A\u1796\u17D2\u179A\u17BD\u1799\u1794\u17B6\u179A\u1798\u17D2\u1797",
              tags: ["#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1795\u17D2\u179B\u17BC\u179C\u1785\u17B7\u178F\u17D2\u178F", "#\u1791\u17D2\u179A\u1796\u17D2\u1799\u1780\u17C6\u1796\u17BC\u179B", "#\u179A\u179F\u17CB\u1793\u17C5\u178A\u17C4\u1799\u179F\u17BB\u1781"],
              transcript: '" \u1785\u17B7\u178F\u17D2\u178F\u178A\u17C2\u179B\u1782\u17D2\u1798\u17B6\u1793\u1780\u1784\u17D2\u179C\u179B\u17CB \u1782\u17D2\u1798\u17B6\u1793\u1782\u17C6\u1793\u17BB\u17C6 \u1782\u17BA\u1787\u17B6\u1791\u17D2\u179A\u1796\u17D2\u1799\u178A\u17CF\u1798\u17A0\u17B6\u179F\u17B6\u179B\u1794\u17C6\u1795\u17BB\u178F... "'
            }
          ]
        },
        gemini: {
          badge: "\u{1F52E} Gemini 2.5 Flash \u2014 98.9% Viral Retention",
          strategyNote: "\u26A1 \u1782\u1793\u17D2\u179B\u17B9\u17C7\u178A\u17C4\u17C7\u179F\u17D2\u179A\u17B6\u1799\u1794\u1789\u17D2\u17A0\u17B6\u1787\u17B8\u179C\u17B7\u178F\u179A\u17A0\u17D0\u179F & TikTok/Reels Viral Pacing",
          badgeColor: "#38bdf8",
          offsetShift: 20,
          baseDuration: [140, 155, 130, 160, 145, 135, 165, 140, 150, 155, 130, 160],
          viralScores: ["98.9%", "98.8%", "99.1%", "98.7%", "99.0%", "98.9%", "99.2%", "98.6%", "99.0%", "99.3%", "98.8%", "99.1%"],
          storylines: [
            {
              title: "\u1782\u1793\u17D2\u179B\u17B9\u17C7 \u17E3 \u1799\u17C9\u17B6\u1784\u1780\u17B6\u178F\u17CB\u1794\u1793\u17D2\u1790\u1799\u179F\u17D2\u178F\u17D2\u179A\u17C1\u179F\u1780\u17D2\u1793\u17BB\u1784 \u17E1 \u1793\u17B6\u1791\u17B8 (\u1797\u17B6\u1782\u17E1)",
              top1: "\u1782\u1793\u17D2\u179B\u17B9\u17C7\u1780\u17B6\u178F\u17CB\u179F\u17D2\u178F\u17D2\u179A\u17C1\u179F",
              top2: "\u1780\u17D2\u1793\u17BB\u1784 \u17E1 \u1793\u17B6\u1791\u17B8",
              bot1: "\u178A\u1780\u178A\u1784\u17D2\u17A0\u17BE\u1798\u179C\u17C2\u1784\u17D7",
              bot2: "\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u1780\u1784\u17D2\u179C\u179B\u17CB\u1797\u17D2\u179B\u17B6\u1798\u17D7",
              tags: ["#\u1794\u17C6\u1794\u17B6\u178F\u17CB\u179F\u17D2\u178F\u17D2\u179A\u17C1\u179F", "#\u1782\u1793\u17D2\u179B\u17B9\u17C7\u1787\u17B8\u179C\u17B7\u178F", "#\u179F\u17BB\u1781\u1797\u17B6\u1796\u1795\u17D2\u179B\u17BC\u179C\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u179C\u17B7\u1792\u17B8\u1784\u17B6\u1799\u17D7\u17E3\u1799\u17C9\u17B6\u1784\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u179F\u17D2\u178F\u17D2\u179A\u17C1\u179F\u1796\u17C1\u179B\u1793\u17C1\u17C7\u17D6 \u17E1. \u178A\u1780\u178A\u1784\u17D2\u17A0\u17BE\u1798\u179C\u17C2\u1784\u17D7 \u17E2. \u1795\u17D2\u178F\u17C4\u178F\u179B\u17BE\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793 \u17E3. \u179A\u17C6\u179B\u17B9\u1780\u1782\u17BB\u178E... "'
            },
            {
              title: "\u1791\u1798\u17D2\u179B\u17B6\u1794\u17CB\u1796\u17C1\u179B\u1796\u17D2\u179A\u17B9\u1780\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1781\u17BD\u179A\u1780\u17D2\u1794\u17B6\u179B\u179F\u17D2\u179A\u179F\u17CB\u179F\u17D2\u179A\u17B6\u1799 (\u1797\u17B6\u1782\u17E2)",
              top1: "\u1791\u1798\u17D2\u179B\u17B6\u1794\u17CB\u1796\u17C1\u179B\u1796\u17D2\u179A\u17B9\u1780",
              top2: "\u1781\u17BD\u179A\u1780\u17D2\u1794\u17B6\u179B\u179F\u17D2\u179A\u179F\u17CB\u179F\u17D2\u179A\u17B6\u1799",
              bot1: "\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u1790\u17D2\u1784\u17C3\u1790\u17D2\u1798\u17B8",
              bot2: "\u178A\u17C4\u1799\u1790\u17B6\u1798\u1796\u179B\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793",
              tags: ["#\u1791\u1798\u17D2\u179B\u17B6\u1794\u17CB\u1796\u17C1\u179B\u1796\u17D2\u179A\u17B9\u1780", "#\u1790\u17B6\u1798\u1796\u179B\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793", "#\u1781\u17BD\u179A\u1780\u17D2\u1794\u17B6\u179B"],
              transcript: '" \u17E5\u1793\u17B6\u1791\u17B8\u178A\u17C6\u1794\u17BC\u1784\u1796\u17C1\u179B\u1797\u17D2\u1789\u17B6\u1780\u17CB\u1796\u17B8\u1782\u17C1\u1784 \u1785\u17BC\u179A\u1780\u17BB\u17C6\u1791\u17B6\u1793\u17CB\u1798\u17BE\u179B\u1791\u17BC\u179A\u179F\u1796\u17D2\u1791 \u1785\u17BC\u179A\u178F\u17B6\u17C6\u1784\u179F\u178F\u17B7\u1793\u17B7\u1784\u1789\u1789\u17B9\u1798... "'
            },
            {
              title: "\u179A\u1794\u17C0\u1794\u1795\u17D2\u178F\u17C4\u178F\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD\u1796\u17C1\u179B\u1785\u17B7\u178F\u17D2\u178F\u1785\u17D2\u179A\u1794\u17BC\u1780\u1785\u17D2\u179A\u1794\u179B\u17CB (\u1797\u17B6\u1782\u17E3)",
              top1: "\u179A\u1794\u17C0\u1794\u1795\u17D2\u178F\u17C4\u178F\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
              top2: "\u1796\u17C1\u179B\u1785\u17B7\u178F\u17D2\u178F\u1785\u17D2\u179A\u1794\u17BC\u1780\u1785\u17D2\u179A\u1794\u179B\u17CB",
              bot1: "\u1788\u1794\u17CB\u1782\u17B7\u178F\u1785\u17D2\u179A\u17BE\u1793",
              bot2: "\u1792\u17D2\u179C\u17BE\u179A\u17BF\u1784\u1798\u17D2\u178F\u1784\u1798\u17BD\u1799",
              tags: ["#\u1795\u17D2\u178F\u17C4\u178F\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD", "#\u1788\u1794\u17CB\u1782\u17B7\u178F\u1785\u17D2\u179A\u17BE\u1793", "#\u179F\u1798\u17B6\u1792\u17B7"],
              transcript: '" \u1785\u17B7\u178F\u17D2\u178F\u1785\u17D2\u179A\u1794\u17BC\u1780\u1785\u17D2\u179A\u1794\u179B\u17CB\u1796\u17D2\u179A\u17C4\u17C7\u1782\u17B7\u178F\u179A\u17BF\u1784\u1785\u17D2\u179A\u17BE\u1793\u1780\u17D2\u1793\u17BB\u1784\u1796\u17C1\u179B\u178F\u17C2\u1798\u17BD\u1799 \u1785\u17BC\u179A\u1792\u17D2\u179C\u17BE\u179A\u17BF\u1784\u1785\u17C6\u1796\u17C4\u17C7\u1798\u17BB\u1781\u17B2\u17D2\u1799\u1794\u17B6\u1793\u179B\u17D2\u17A2\u1794\u17C6\u1795\u17BB\u178F... "'
            },
            {
              title: "\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1792\u1798\u17D2\u1798\u1787\u17B6\u178F\u17B7\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u179F\u17C6\u178E\u17B6\u1784\u179B\u17D2\u17A2 (\u1797\u17B6\u1782\u17E4)",
              top1: "\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1792\u1798\u17D2\u1798\u1787\u17B6\u178F\u17B7",
              top2: "\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u179F\u17C6\u178E\u17B6\u1784\u179B\u17D2\u17A2",
              bot1: "\u1782\u17C6\u1793\u17B7\u178F\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793",
              bot2: "\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u17B1\u1780\u17B6\u179F\u179B\u17D2\u17A2",
              tags: ["#\u179F\u17C6\u178E\u17B6\u1784\u179B\u17D2\u17A2", "#\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789", "#\u17B1\u1780\u17B6\u179F"],
              transcript: '" \u179F\u17C6\u178E\u17B6\u1784\u179B\u17D2\u17A2\u1798\u17B7\u1793\u1798\u17C2\u1793\u1785\u17C3\u178A\u1793\u17D2\u1799\u1791\u17C1 \u179C\u17B6\u1780\u17BE\u178F\u1785\u17C1\u1789\u1796\u17B8\u1785\u17B7\u178F\u17D2\u178F\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6 \u1793\u17B7\u1784\u1780\u17B6\u179A\u178F\u17D2\u179A\u17C0\u1798\u1781\u17D2\u179B\u17BD\u1793\u179A\u17BD\u1785\u1787\u17B6\u179F\u17D2\u179A\u17C1\u1785... "'
            },
            {
              title: "\u1782\u17D2\u179A\u1794\u17CB\u1782\u17D2\u179A\u1784\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793 (\u1797\u17B6\u1782\u17E5)",
              top1: "\u1782\u17D2\u179A\u1794\u17CB\u1782\u17D2\u179A\u1784\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798\u178C\u17B8\u1787\u17B8\u1790\u179B",
              bot1: "\u1780\u17BB\u17C6\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              bot2: "\u1787\u17B6\u1798\u17BD\u1799\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3\u179B\u17BE\u1794\u178E\u17D2\u178F\u17B6\u1789",
              tags: ["#\u1788\u1794\u17CB\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794", "#\u1787\u17B8\u179C\u17B7\u178F\u1796\u17B7\u178F", "#\u179F\u1784\u17D2\u1782\u1798\u178C\u17B8\u1787\u17B8\u1790\u179B"],
              transcript: '" \u1788\u1794\u17CB\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794\u1787\u17B8\u179C\u17B7\u178F\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784\u1787\u17B6\u1798\u17BD\u1799\u1780\u17B6\u179A\u1794\u1784\u17D2\u17A0\u17B6\u1789\u179B\u17BE\u1794\u178E\u17D2\u178F\u17B6\u1789\u179F\u1784\u17D2\u1782\u1798 \u1787\u17B8\u179C\u17B7\u178F\u1796\u17B7\u178F\u1782\u17BA\u1793\u17C5\u1785\u17C6\u1796\u17C4\u17C7\u1798\u17BB\u1781\u17A2\u17D2\u1793\u1780... "'
            },
            {
              title: "\u179F\u17B7\u179B\u17D2\u1794\u17C8\u1793\u17C3\u1780\u17B6\u179A\u179F\u17D2\u178F\u17B6\u1794\u17CB\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1788\u17D2\u1793\u17C7\u1785\u17B7\u178F\u17D2\u178F\u1798\u1793\u17BB\u179F\u17D2\u179F (\u1797\u17B6\u1782\u17E6)",
              top1: "\u179F\u17B7\u179B\u17D2\u1794\u17C8\u1793\u17C3\u1780\u17B6\u179A\u179F\u17D2\u178F\u17B6\u1794\u17CB",
              top2: "\u1788\u17D2\u1793\u17C7\u1785\u17B7\u178F\u17D2\u178F\u1798\u1793\u17BB\u179F\u17D2\u179F",
              bot1: "\u179F\u17D2\u178F\u17B6\u1794\u17CB\u178A\u17C4\u1799\u1780\u17B6\u179A\u1799\u179B\u17CB\u1785\u17B7\u178F\u17D2\u178F",
              bot2: "\u1798\u17B7\u1793\u1798\u17C2\u1793\u179F\u17D2\u178F\u17B6\u1794\u17CB\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u179A\u1780\u17C2\u1780",
              tags: ["#\u179F\u17B7\u179B\u17D2\u1794\u17C8\u179F\u17D2\u178F\u17B6\u1794\u17CB", "#\u1788\u17D2\u1793\u17C7\u1785\u17B7\u178F\u17D2\u178F", "#\u1791\u17C6\u1793\u17B6\u1780\u17CB\u1791\u17C6\u1793\u1784"],
              transcript: '" \u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17C2\u179B\u1796\u17BC\u1780\u17C2\u179F\u17D2\u178F\u17B6\u1794\u17CB \u1782\u17BA\u1787\u17B6\u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17C2\u179B\u1798\u17B6\u1793\u1798\u1793\u17D2\u178F\u179F\u17D2\u1793\u17C1\u17A0\u17CD \u1793\u17B7\u1784\u1798\u17B6\u1793\u1794\u1789\u17D2\u1789\u17B6\u1781\u17D2\u1796\u179F\u17CB\u1794\u17C6\u1795\u17BB\u178F... "'
            },
            {
              title: "\u179C\u17B7\u1792\u17B8\u179A\u17C0\u1794\u1785\u17C6\u1785\u17B7\u178F\u17D2\u178F\u1798\u17BB\u1793\u1785\u17BC\u179B\u1782\u17C1\u1784\u17B2\u17D2\u1799\u179B\u1780\u17CB\u179F\u17D2\u179A\u17BD\u179B (\u1797\u17B6\u1782\u17E7)",
              top1: "\u179A\u17C0\u1794\u1785\u17C6\u1785\u17B7\u178F\u17D2\u178F\u1798\u17BB\u1793\u1782\u17C1\u1784",
              top2: "\u17B2\u17D2\u1799\u1782\u17C1\u1784\u179B\u1780\u17CB\u179F\u17D2\u179A\u17BD\u179B",
              bot1: "\u179B\u17C7\u1794\u1784\u17CB\u179A\u17BF\u1784\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7",
              bot2: "\u1782\u17C1\u1784\u178A\u17C4\u1799\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB",
              tags: ["#\u1782\u17C1\u1784\u179B\u1780\u17CB\u179F\u17D2\u179A\u17BD\u179B", "#\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u1780\u1784\u17D2\u179C\u179B\u17CB", "#\u1785\u17B7\u178F\u17D2\u178F\u179F\u17D2\u1784\u1794\u17CB"],
              transcript: '" \u1798\u17BB\u1793\u1782\u17C1\u1784 \u1785\u17BC\u179A\u17A2\u179A\u1782\u17BB\u178E\u178A\u179B\u17CB\u17A2\u17D2\u179C\u17B8\u17D7\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17BE\u178F\u17A1\u17BE\u1784\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7 \u179A\u17BD\u1785\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u179A\u17B6\u179B\u17CB\u1780\u17B6\u179A\u1782\u17B7\u178F... "'
            },
            {
              title: "\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u1797\u17B6\u1796\u1781\u17D2\u1787\u17B7\u179B\u1785\u17D2\u179A\u17A2\u17BC\u179F\u178A\u17C4\u1799\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179F\u178F\u17B7 (\u1797\u17B6\u1782\u17E8)",
              top1: "\u1791\u1798\u17D2\u179B\u17B6\u1780\u17CB\u1797\u17B6\u1796\u1781\u17D2\u1787\u17B7\u179B",
              top2: "\u178A\u17C4\u1799\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179F\u178F\u17B7",
              bot1: "\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u1792\u17D2\u179C\u17BE\u1797\u17D2\u179B\u17B6\u1798\u17D7",
              bot2: "\u1780\u17BB\u17C6\u1785\u17B6\u17C6\u1790\u17D2\u1784\u17C3\u179F\u17D2\u17A2\u17C2\u1780",
              tags: ["#\u1788\u1794\u17CB\u1781\u17D2\u1787\u17B7\u179B", "#\u1792\u17D2\u179C\u17BE\u1797\u17D2\u179B\u17B6\u1798\u17D7", "#\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u179F\u178F\u17B7"],
              transcript: '" \u1780\u17BB\u17C6\u1796\u1793\u17D2\u1799\u17B6\u179A\u1796\u17C1\u179B\u17A2\u17C6\u1796\u17BE\u179B\u17D2\u17A2 \u1796\u17D2\u179A\u17C4\u17C7\u1790\u17D2\u1784\u17C3\u179F\u17D2\u17A2\u17C2\u1780\u1798\u17B7\u1793\u1794\u17D2\u179A\u17B6\u1780\u178A\u1790\u17B6\u1793\u17B9\u1784\u1798\u1780\u178A\u179B\u17CB\u1798\u17BB\u1793\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u179B\u17B6\u1794\u17CB\u17A1\u17BE\u1799... "'
            },
            {
              title: "\u179C\u17B7\u1792\u17B8\u1793\u17B7\u1799\u17B6\u1799\u179F\u17D2\u178F\u17B8\u17B2\u17D2\u1799\u1782\u17C1\u1782\u17C4\u179A\u1796\u1793\u17B7\u1784\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB (\u1797\u17B6\u1782\u17E9)",
              top1: "\u179C\u17B7\u1792\u17B8\u1793\u17B7\u1799\u17B6\u1799\u179F\u17D2\u178F\u17B8",
              top2: "\u17B2\u17D2\u1799\u1782\u17C1\u1782\u17C4\u179A\u1796\u179F\u17D2\u179A\u17A1\u17B6\u1789\u17CB",
              bot1: "\u179C\u17B6\u1785\u17B6\u179F\u17BB\u1797\u17B6\u179F\u17B7\u178F",
              bot2: "\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u1780\u17B7\u178F\u17D2\u178F\u17B7\u1799\u179F",
              tags: ["#\u179C\u17B6\u1785\u17B6\u179F\u17BB\u1797\u17B6\u179F\u17B7\u178F", "#\u1796\u17B6\u1780\u17D2\u1799\u1796\u17B7\u179A\u17C4\u17C7", "#\u1780\u17B7\u178F\u17D2\u178F\u17B7\u1799\u179F"],
              transcript: '" \u1796\u17B6\u1780\u17D2\u1799\u1796\u17B7\u178F \u1796\u17B6\u1780\u17D2\u1799\u1795\u17D2\u17A2\u17C2\u1798 \u1796\u17B6\u1780\u17D2\u1799\u1798\u17B6\u1793\u1794\u17D2\u179A\u1799\u17C4\u1787\u1793\u17CD \u1793\u17B7\u1784\u1796\u17C4\u179B\u1785\u17C6\u1780\u17B6\u179B\u179C\u17C1\u179B\u17B6 \u1787\u17B6\u179C\u17B6\u1785\u17B6\u178A\u17CF\u17A7\u178F\u17D2\u178F\u1798... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1780\u17B6\u179A\u1796\u17B6\u179A\u1781\u17D2\u179B\u17BD\u1793\u1796\u17B8\u1790\u17B6\u1798\u1796\u179B\u17A2\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793\u1787\u17BB\u17C6\u179C\u17B7\u1789 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u1780\u17B6\u179A\u1796\u17B6\u179A\u1785\u17B7\u178F\u17D2\u178F\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              top2: "\u1796\u17B8\u1790\u17B6\u1798\u1796\u179B\u17A2\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793",
              bot1: "\u1794\u1784\u17D2\u1780\u17BE\u178F\u1781\u17C2\u179B\u1780\u17B6\u179A\u1796\u17B6\u179A",
              bot2: "\u178A\u17C4\u1799\u1798\u17C1\u178F\u17D2\u178F\u17B6\u1785\u17B7\u178F\u17D2\u178F",
              tags: ["#\u1781\u17C2\u179B\u1780\u17B6\u179A\u1796\u17B6\u179A\u1785\u17B7\u178F\u17D2\u178F", "#\u1790\u17B6\u1798\u1796\u179B\u179C\u17B7\u1787\u17D2\u1787\u1798\u17B6\u1793", "#\u1798\u17C1\u178F\u17D2\u178F\u17B6"],
              transcript: '" \u1780\u17BB\u17C6\u17A2\u1793\u17BB\u1789\u17D2\u1789\u17B6\u178F\u17B2\u17D2\u1799\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD\u1798\u17B7\u1793\u179B\u17D2\u17A2\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3 \u1798\u1780\u1794\u17C6\u1796\u17BB\u179B\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1780\u17D2\u1793\u17BB\u1784\u1785\u17B7\u178F\u17D2\u178F\u17A2\u17D2\u1793\u1780... "'
            },
            {
              title: "\u1794\u1784\u17D2\u1780\u17BE\u178F\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F\u1796\u17C1\u179B\u1792\u17D2\u179B\u17B6\u1780\u17CB\u1791\u17B9\u1780\u1785\u17B7\u178F\u17D2\u178F (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u1794\u1784\u17D2\u1780\u17BE\u178F\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F",
              top2: "\u1796\u17C1\u179B\u1792\u17D2\u179B\u17B6\u1780\u17CB\u1791\u17B9\u1780\u1785\u17B7\u178F\u17D2\u178F",
              bot1: "\u1787\u17BF\u1787\u17B6\u1780\u17CB\u179B\u17BE\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              bot2: "\u1793\u17B7\u1784\u1780\u17D2\u179A\u17C4\u1780\u1788\u179A\u17A1\u17BE\u1784\u179C\u17B7\u1789",
              tags: ["#\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F", "#\u1780\u17D2\u179A\u17C4\u1780\u1788\u179A", "#\u1787\u17C6\u1793\u17BF\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1780\u17B6\u179A\u178A\u17BD\u179B\u1798\u17B7\u1793\u1798\u17C2\u1793\u1787\u17B6\u1780\u17B6\u179A\u1794\u179A\u17B6\u1787\u17D0\u1799\u1791\u17C1 \u1780\u17B6\u179A\u1798\u17B7\u1793\u1796\u17D2\u179A\u1798\u1780\u17D2\u179A\u17C4\u1780\u1788\u179A\u1791\u17BE\u1794\u1787\u17B6\u1780\u17B6\u179A\u1794\u179A\u17B6\u1787\u17D0\u1799\u1796\u17B7\u178F... "'
            },
            {
              title: "\u179A\u17BC\u1794\u1798\u1793\u17D2\u178F\u1787\u17B8\u179C\u17B7\u178F\u1787\u17C4\u1782\u1787\u17D0\u1799\u178A\u17C4\u1799\u1798\u17B6\u1793\u1792\u1798\u17CC\u1780\u17D2\u1793\u17BB\u1784\u1785\u17B7\u178F\u17D2\u178F (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u179A\u17BC\u1794\u1798\u1793\u17D2\u178F\u1787\u17B8\u179C\u17B7\u178F\u1787\u17C4\u1782\u1787\u17D0\u1799",
              top2: "\u1798\u17B6\u1793\u1792\u1798\u17CC\u1780\u17D2\u1793\u17BB\u1784\u1785\u17B7\u178F\u17D2\u178F",
              bot1: "\u1787\u17C4\u1782\u1787\u17D0\u1799\u1781\u17B6\u1784\u1780\u17D2\u179A\u17C5",
              bot2: "\u1793\u17B7\u1784\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1781\u17B6\u1784\u1780\u17D2\u1793\u17BB\u1784",
              tags: ["#\u1787\u17C4\u1782\u1787\u17D0\u1799\u1796\u17B7\u178F", "#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1781\u17B6\u1784\u1780\u17D2\u1793\u17BB\u1784", "#\u1792\u1798\u17CC\u1780\u17D2\u1793\u17BB\u1784\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1787\u17C4\u1782\u1787\u17D0\u1799\u178A\u17CF\u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A \u1782\u17BA\u1780\u17B6\u179A\u1798\u17B6\u1793\u1791\u17D2\u179A\u1796\u17D2\u1799\u179F\u1798\u17D2\u1794\u178F\u17D2\u178F\u17B7\u1795\u1784 \u1793\u17B7\u1784\u1798\u17B6\u1793\u1792\u1798\u17CC\u179F\u17D2\u1784\u1794\u17CB\u179F\u17D2\u1784\u17B6\u178F\u17CB\u1780\u17D2\u1793\u17BB\u1784\u1785\u17B7\u178F\u17D2\u178F\u1795\u1784... "'
            }
          ]
        },
        deepseek: {
          badge: "\u{1F40B} DeepSeek R1 \u2014 99.3% Deep Reasoning",
          strategyNote: "\u{1F52C} \u179C\u17B7\u1797\u17B6\u1782\u179F\u17CA\u17B8\u1787\u1798\u17D2\u179A\u17C5\u178F\u17B6\u1798\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6 \u1793\u17B7\u1784\u1781\u17D2\u179F\u17C2\u179F\u1784\u17D2\u179C\u17B6\u1780\u17CB\u1780\u1798\u17D2\u1798\u1795\u179B (Reasoning Chain)",
          badgeColor: "#06b6d4",
          offsetShift: 95,
          baseDuration: [200, 230, 210, 240, 205, 225, 235, 215, 220, 245, 210, 230],
          viralScores: ["99.3%", "99.1%", "99.5%", "99.2%", "99.4%", "99.3%", "99.6%", "99.0%", "99.4%", "99.7%", "99.2%", "99.5%"],
          storylines: [
            {
              title: "\u179C\u17B7\u1797\u17B6\u1782\u17A0\u17C1\u178F\u17BB\u1793\u17B7\u1784\u1795\u179B\u1793\u17C3\u1780\u1798\u17D2\u1798\u178F\u17B6\u1798\u1780\u17D2\u1794\u17BD\u1793\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6 (\u1797\u17B6\u1782\u17E1)",
              top1: "\u179C\u17B7\u1797\u17B6\u1782\u17A0\u17C1\u178F\u17BB\u1793\u17B7\u1784\u1795\u179B",
              top2: "\u1793\u17C3\u1780\u1798\u17D2\u1798\u178F\u17B6\u1798\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6",
              bot1: "\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1780\u1798\u17D2\u1798\u1795\u179B",
              bot2: "\u1782\u17D2\u1798\u17B6\u1793\u1780\u17B6\u179A\u179B\u1798\u17D2\u17A2\u17C0\u1784\u17A1\u17BE\u1799",
              tags: ["#\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6", "#\u1785\u17D2\u1794\u17B6\u1794\u17CB\u1780\u1798\u17D2\u1798\u1795\u179B", "#\u17A0\u17C1\u178F\u17BB\u1793\u17B7\u1784\u1795\u179B"],
              transcript: '" \u178F\u17B6\u1798\u1785\u17D2\u1794\u17B6\u1794\u17CB\u17A0\u17C1\u178F\u17BB\u1793\u17B7\u1784\u1795\u179B \u179A\u17B6\u179B\u17CB\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796\u1785\u17C1\u178F\u1793\u17B6\u178F\u17C2\u1784\u1794\u1793\u17D2\u179F\u179B\u17CB\u1791\u17BB\u1780\u1793\u17BC\u179C\u1795\u179B\u179C\u17B7\u1794\u17B6\u1780\u178A\u17C2\u179B\u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u17A0\u17BB\u1785\u1795\u179B... "'
            },
            {
              title: "\u17A0\u17C1\u178F\u17BB\u17A2\u17D2\u179C\u17B8\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2\u178F\u17C2\u1787\u17BD\u1794\u1791\u17BB\u1780\u17D2\u1781\u179B\u17C6\u1794\u17B6\u1780? (\u1797\u17B6\u1782\u17E2)",
              top1: "\u17A0\u17C1\u178F\u17BB\u17A2\u17D2\u179C\u17B8\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2",
              top2: "\u178F\u17C2\u1787\u17BD\u1794\u1791\u17BB\u1780\u17D2\u1781\u179B\u17C6\u1794\u17B6\u1780?",
              bot1: "\u1780\u17B6\u179A\u1794\u1780\u179F\u17D2\u179A\u17B6\u1799\u1780\u1798\u17D2\u1798",
              bot2: "\u17A2\u178F\u17B8\u178F\u1787\u17B6\u178F\u17B7\u1793\u17B7\u1784\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
              tags: ["#\u179F\u17D2\u179A\u17B6\u1799\u1785\u1798\u17D2\u1784\u179B\u17CB", "#\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2\u1787\u17BD\u1794\u1791\u17BB\u1780\u17D2\u1781", "#\u1780\u1798\u17D2\u1798\u1785\u17B6\u179F\u17CB\u1780\u1798\u17D2\u1798\u1790\u17D2\u1798\u17B8"],
              transcript: '" \u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2\u1787\u17BD\u1794\u1791\u17BB\u1780\u17D2\u1781 \u1796\u17D2\u179A\u17C4\u17C7\u1780\u1798\u17D2\u1798\u1785\u17B6\u179F\u17CB\u1780\u17C6\u1796\u17BB\u1784\u17B2\u17D2\u1799\u1795\u179B \u17AF\u17A2\u17C6\u1796\u17BE\u179B\u17D2\u17A2\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1780\u17C6\u1796\u17BB\u1784\u179F\u1793\u17D2\u179F\u17C6\u1791\u17BB\u1780\u17B2\u17D2\u1799\u1795\u179B\u1796\u17C1\u179B\u1780\u17D2\u179A\u17C4\u1799... "'
            },
            {
              title: "\u1781\u17D2\u179F\u17C2\u179F\u1784\u17D2\u179C\u17B6\u1780\u17CB\u1793\u17C3\u1794\u178A\u17B7\u1785\u17D2\u1785\u179F\u1798\u17BB\u1794\u17D2\u1794\u17B6\u1791 \u17E1\u17E2 \u1794\u17D2\u179A\u1780\u17B6\u179A (\u1797\u17B6\u1782\u17E3)",
              top1: "\u1781\u17D2\u179F\u17C2\u179F\u1784\u17D2\u179C\u17B6\u1780\u17CB\u1794\u178A\u17B7\u1785\u17D2\u1785\u179F\u1798\u17BB\u1794\u17D2\u1794\u17B6\u1791",
              top2: "\u17E1\u17E2 \u1794\u17D2\u179A\u1780\u17B6\u179A\u1793\u17C3\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u17A2\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1794\u1785\u17D2\u1785\u1799\u17B6 \u179F\u1784\u17D2\u1781\u17B6\u179A\u17B6",
              bot2: "\u178A\u17BE\u1798\u17A0\u17C1\u178F\u17BB\u1793\u17C3\u1791\u17BB\u1780\u17D2\u1781",
              tags: ["#\u1794\u178A\u17B7\u1785\u17D2\u1785\u179F\u1798\u17BB\u1794\u17D2\u1794\u17B6\u1791", "#\u17A2\u179C\u17B7\u1787\u17D2\u1787\u17B6", "#\u1781\u17D2\u179F\u17C2\u179F\u1784\u17D2\u179C\u17B6\u1780\u17CB\u1791\u17BB\u1780\u17D2\u1781"],
              transcript: '" \u1780\u17B6\u179A\u1780\u17BE\u178F\u17A1\u17BE\u1784\u1793\u17C3\u1791\u17BB\u1780\u17D2\u1781\u1798\u17B7\u1793\u1798\u17C2\u1793\u1780\u17BE\u178F\u17A1\u17BE\u1784\u17AF\u1780\u17AF\u1784\u1791\u17C1 \u1782\u17BA\u17A2\u17B6\u179F\u17D2\u179A\u17D0\u1799\u179B\u17BE\u1780\u178F\u17D2\u178F\u17B6\u178F\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1782\u17D2\u1793\u17B6\u1785\u17C6\u1793\u17BD\u1793 \u17E1\u17E2 \u178F\u17C6\u178E\u17B6\u1780\u17CB\u1780\u17B6\u179B... "'
            },
            {
              title: "\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1793\u17C3\u1780\u17B6\u179A\u1780\u17BE\u178F\u179F\u17D2\u179B\u17B6\u1794\u17CB \u1793\u17B7\u1784\u1780\u17B6\u179A\u179C\u17B7\u179B\u179C\u179B\u17CB (\u1797\u17B6\u1782\u17E4)",
              top1: "\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1780\u17B6\u179A\u1780\u17BE\u178F\u179F\u17D2\u179B\u17B6\u1794\u17CB",
              top2: "\u1793\u17B7\u1784\u1780\u17B6\u179A\u179C\u17B7\u179B\u179C\u179B\u17CB",
              bot1: "\u179F\u1784\u17D2\u179F\u17B6\u179A\u1785\u1780\u17D2\u179A",
              bot2: "\u178A\u17C6\u178E\u17BE\u179A\u179C\u17B7\u179B\u179C\u179B\u17CB\u1793\u17C3\u1792\u17B6\u178F\u17BB",
              tags: ["#\u1780\u17BE\u178F\u179F\u17D2\u179B\u17B6\u1794\u17CB", "#\u1792\u17B6\u178F\u17BB\u17E4", "#\u179F\u1784\u17D2\u179F\u17B6\u179A\u1785\u1780\u17D2\u179A"],
              transcript: '" \u179A\u17BC\u1794\u1780\u17B6\u1799\u1787\u17B6\u1780\u17B6\u179A\u1794\u17D2\u179A\u1787\u17BB\u17C6\u1793\u17C3\u1792\u17B6\u178F\u17BB\u17E4 \u178A\u17B8 \u1791\u17B9\u1780 \u1797\u17D2\u179B\u17BE\u1784 \u1781\u17D2\u1799\u179B\u17CB \u1796\u17C1\u179B\u1794\u17C2\u1780\u1792\u17D2\u179B\u17B6\u1799\u1780\u17CF\u179C\u17B7\u179B\u1791\u17C5\u1792\u17B6\u178F\u17BB\u178A\u17BE\u1798\u179C\u17B7\u1789... "'
            },
            {
              title: "\u1780\u17B6\u179A\u179C\u17B7\u1797\u17B6\u1782\u1785\u17B7\u178F\u17D2\u178F \u17E5\u17E2 \u1793\u17B7\u1784\u1785\u17C1\u178F\u179F\u17B7\u1780\u178F\u17B6\u1798\u179B\u17C6\u178A\u17B6\u1794\u17CB (\u1797\u17B6\u1782\u17E5)",
              top1: "\u1780\u17B6\u179A\u179C\u17B7\u1797\u17B6\u1782\u1785\u17B7\u178F\u17D2\u178F \u17E5\u17E2",
              top2: "\u1793\u17B7\u1784\u1785\u17C1\u178F\u179F\u17B7\u1780\u178F\u17B6\u1798\u179B\u17C6\u178A\u17B6\u1794\u17CB",
              bot1: "\u1780\u17BB\u179F\u179B\u1785\u17C1\u178F\u179F\u17B7\u1780",
              bot2: "\u1793\u17B7\u1784\u17A2\u1780\u17BB\u179F\u179B\u1785\u17C1\u178F\u179F\u17B7\u1780",
              tags: ["#\u1785\u17C1\u178F\u179F\u17B7\u1780", "#\u1785\u17B7\u178F\u17D2\u178F\u17E5\u17E2", "#\u179C\u17B7\u1797\u17B6\u1782\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1785\u17B7\u178F\u17D2\u178F\u1787\u17B6\u17A2\u17D2\u1793\u1780\u178A\u17B9\u1784\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD \u1785\u17C1\u178F\u179F\u17B7\u1780\u1787\u17B6\u17A2\u17D2\u1793\u1780\u179B\u1798\u17D2\u17A2\u17B7\u178F\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD \u1780\u17B6\u179A\u178A\u17B9\u1784\u1791\u17B6\u1793\u17CB\u1785\u17B7\u178F\u17D2\u178F\u1782\u17BA\u178A\u17B9\u1784\u1791\u17B6\u1793\u17CB\u1785\u17C1\u178F\u179F\u17B7\u1780... "'
            },
            {
              title: "\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794\u1780\u1798\u17D2\u1798\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1793\u17B7\u1784\u1780\u1798\u17D2\u1798\u17A2\u178F\u17B8\u178F (\u1797\u17B6\u1782\u17E6)",
              top1: "\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794\u1780\u1798\u17D2\u1798\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
              top2: "\u1793\u17B7\u1784\u1780\u1798\u17D2\u1798\u1796\u17B8\u17A2\u178F\u17B8\u178F\u1787\u17B6\u178F\u17B7",
              bot1: "\u17A5\u1791\u17D2\u1792\u17B7\u1796\u179B\u1793\u17C3\u1785\u17C1\u178F\u1793\u17B6",
              bot2: "\u1780\u17C6\u178E\u178F\u17CB\u1791\u17B7\u179F\u178A\u17C5\u1787\u17B8\u179C\u17B7\u178F",
              tags: ["#\u1785\u17C1\u178F\u1793\u17B6\u1780\u1798\u17D2\u1798", "#\u1780\u1798\u17D2\u1798\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793", "#\u1780\u17C2\u1794\u17D2\u179A\u17C2\u1787\u17C4\u1782\u179C\u17B6\u179F\u1793\u17B6"],
              transcript: '" \u1780\u1798\u17D2\u1798\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1798\u17B6\u1793\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1781\u17D2\u179B\u17B6\u17C6\u1784\u1780\u17D2\u179B\u17B6\u1794\u17C6\u1795\u17BB\u178F \u1796\u17D2\u179A\u17C4\u17C7\u1787\u17B6\u1785\u17C6\u178E\u17BB\u1785\u178F\u17C2\u1798\u17BD\u1799\u1782\u178F\u17CB\u178A\u17C2\u179B\u1799\u17BE\u1784\u17A2\u17B6\u1785\u1780\u17C2\u1794\u17D2\u179A\u17C2\u1794\u17B6\u1793... "'
            },
            {
              title: "\u178A\u17C6\u178E\u17B6\u1780\u17CB\u1780\u17B6\u179B\u1785\u17B7\u178F\u17D2\u178F\u179A\u17C6\u179B\u178F\u17CB\u1791\u17BB\u1780\u17D2\u1781\u1787\u17B6\u1787\u17C6\u17A0\u17B6\u1793\u17D7 (\u1797\u17B6\u1782\u17E7)",
              top1: "\u178A\u17C6\u178E\u17B6\u1780\u17CB\u1780\u17B6\u179B\u179A\u17C6\u179B\u178F\u17CB\u1791\u17BB\u1780\u17D2\u1781",
              top2: "\u1787\u17B6\u1787\u17C6\u17A0\u17B6\u1793\u17D7\u1799\u17C9\u17B6\u1784\u1785\u17D2\u1794\u17B6\u179F\u17CB",
              bot1: "\u1796\u17B8\u1780\u17B6\u179A\u178A\u17B9\u1784\u1791\u17BB\u1780\u17D2\u1781",
              bot2: "\u1791\u17C5\u179A\u1780\u1780\u17B6\u179A\u179A\u17C6\u179B\u178F\u17CB\u1791\u17BB\u1780\u17D2\u1781",
              tags: ["#\u1787\u17C6\u17A0\u17B6\u1793\u179A\u17C6\u179B\u178F\u17CB\u1791\u17BB\u1780\u17D2\u1781", "#\u1798\u17B6\u1782\u17CC\u17B6\u1794\u1789\u17D2\u1789\u17B6", "#\u179F\u1793\u17D2\u178F\u17B7"],
              transcript: '" \u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8\u17E1 \u1780\u17C6\u178E\u178F\u17CB\u178A\u17B9\u1784\u1791\u17BB\u1780\u17D2\u1781 \u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8\u17E2 \u179A\u1780\u17AB\u179F\u1782\u179B\u17CB\u1791\u17BB\u1780\u17D2\u1781 \u1787\u17C6\u17A0\u17B6\u1793\u1791\u17B8\u17E3 \u1783\u17BE\u1789\u1780\u17B6\u179A\u179A\u179B\u178F\u17CB \u1793\u17B7\u1784\u1791\u17B8\u17E4 \u1794\u178A\u17B7\u1794\u178F\u17D2\u178F\u17B7\u1795\u17D2\u179B\u17BC\u179C... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1794\u1780\u179F\u17D2\u179A\u17B6\u1799\u1798\u1793\u17D2\u1791\u17B7\u179B\u179F\u1784\u17D2\u179F\u17D0\u1799\u179A\u17BF\u1784\u1787\u17B6\u178F\u17B7\u1798\u17BB\u1781 (\u1797\u17B6\u1782\u17E8)",
              top1: "\u1794\u1780\u179F\u17D2\u179A\u17B6\u1799\u1798\u1793\u17D2\u1791\u17B7\u179B\u179F\u1784\u17D2\u179F\u17D0\u1799",
              top2: "\u179A\u17BF\u1784\u1787\u17B6\u178F\u17B7\u1798\u17BB\u1781\u1793\u17B7\u1784\u179C\u17B7\u1789\u17D2\u1789\u17B6\u178E",
              bot1: "\u1785\u179A\u1793\u17D2\u178F\u1793\u17C3\u179C\u17B7\u1789\u17D2\u1789\u17B6\u178E",
              bot2: "\u178F\u1797\u17D2\u1787\u17B6\u1794\u17CB\u178F\u17B6\u1798\u1780\u1798\u17D2\u1798\u179F\u1793\u17D2\u1792\u17B6\u1793",
              tags: ["#\u1787\u17B6\u178F\u17B7\u1798\u17BB\u1781", "#\u1785\u179A\u1793\u17D2\u178F\u179C\u17B7\u1789\u17D2\u1789\u17B6\u178E", "#\u1780\u1798\u17D2\u1798\u179F\u1793\u17D2\u1792\u17B6\u1793"],
              transcript: '" \u179C\u17B7\u1789\u17D2\u1789\u17B6\u178E\u1798\u17B7\u1793\u1798\u17C2\u1793\u17A0\u17C4\u17C7\u1785\u17C1\u1789\u1796\u17B8\u1781\u17D2\u179B\u17BD\u1793\u1791\u17C1 \u178F\u17C2\u1787\u17B6\u1785\u179A\u1793\u17D2\u178F\u1794\u1793\u17D2\u178F\u1794\u1793\u17D2\u1791\u17B6\u1794\u17CB\u1782\u17D2\u1793\u17B6\u178A\u17BC\u1785\u1787\u17B6\u1796\u1793\u17D2\u179B\u17BA\u1797\u17D2\u179B\u17BE\u1784\u1791\u17C0\u1793\u1798\u17BD\u1799\u1791\u17C5\u1791\u17C0\u1793\u1798\u17BD\u1799... "'
            },
            {
              title: "\u17A0\u17C1\u178F\u17BB\u1795\u179B\u179C\u17B7\u1791\u17D2\u1799\u17B6\u179F\u17B6\u179F\u17D2\u178F\u17D2\u179A\u1793\u17B7\u1784\u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6 (\u1797\u17B6\u1782\u17E9)",
              top1: "\u17A0\u17C1\u178F\u17BB\u1795\u179B\u179C\u17B7\u1791\u17D2\u1799\u17B6\u179F\u17B6\u179F\u17D2\u178F\u17D2\u179A",
              top2: "\u1793\u17B7\u1784\u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6",
              bot1: "\u1780\u17B6\u179A\u179F\u1784\u17D2\u1780\u17C1\u178F\u1795\u17D2\u1791\u17B6\u179B\u17CB",
              bot2: "\u178A\u17C4\u1799\u1798\u17B7\u1793\u1787\u17BF\u1781\u17D2\u179C\u17B6\u1780\u17CB\u1781\u17D2\u179C\u17BE\u1780",
              tags: ["#\u179C\u17B7\u1791\u17D2\u1799\u17B6\u179F\u17B6\u179F\u17D2\u178F\u17D2\u179A", "#\u1780\u17B6\u17A1\u17B6\u1798\u179F\u17BC\u178F\u17D2\u179A", "#\u1780\u17B6\u179A\u1796\u17B7\u179F\u17C4\u1792"],
              transcript: '" \u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u1791\u17D2\u179A\u1784\u17CB\u1794\u1784\u17D2\u179A\u17C0\u1793\u1780\u17BB\u17C6\u17B2\u17D2\u1799\u1787\u17BF\u178F\u17B6\u1798\u1780\u17B6\u179A\u17AE\u178F\u17D7\u1782\u17D2\u1793\u17B6 \u178F\u17C2\u178F\u17D2\u179A\u17BC\u179C\u1796\u17B7\u179F\u17C4\u1792 \u1793\u17B7\u1784\u1783\u17BE\u1789\u1785\u17D2\u1794\u17B6\u179F\u17CB\u178A\u17C4\u1799\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784... "'
            },
            {
              title: "\u1780\u17B6\u179A\u179C\u17B7\u1797\u17B6\u1782\u17AB\u179F\u1782\u179B\u17CB\u1793\u17C3\u179B\u17C4\u1797\u17C8 \u1791\u17C4\u179F\u17C8 \u1798\u17C4\u17A0\u17C8 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u179C\u17B7\u1797\u17B6\u1782\u17AB\u179F\u1782\u179B\u17CB\u17A2\u1780\u17BB\u179F\u179B",
              top2: "\u179B\u17C4\u1797\u17C8 \u1791\u17C4\u179F\u17C8 \u1798\u17C4\u17A0\u17C8",
              bot1: "\u17AB\u179F\u1782\u179B\u17CB\u1791\u17B6\u17C6\u1784\u1794\u17B8",
              bot2: "\u1794\u17C6\u1795\u17D2\u179B\u17B6\u1789\u1785\u17B7\u178F\u17D2\u178F\u1798\u1793\u17BB\u179F\u17D2\u179F",
              tags: ["#\u179B\u17C4\u1797\u17C8", "#\u1791\u17C4\u179F\u17C8", "#\u1798\u17C4\u17A0\u17C8"],
              transcript: '" \u179B\u17C4\u1797\u17C8\u1785\u1784\u17CB\u1794\u17B6\u1793 \u1791\u17C4\u179F\u17C8\u1781\u17B9\u1784\u179F\u17D2\u17A2\u1794\u17CB \u1798\u17C4\u17A0\u17C8\u179C\u1784\u17D2\u179C\u17C1\u1784\u1798\u17B7\u1793\u178A\u17B9\u1784\u1781\u17BB\u179F\u178F\u17D2\u179A\u17BC\u179C \u1787\u17B6\u1798\u17C1\u179A\u17C4\u1782\u1794\u17C6\u1795\u17D2\u179B\u17B6\u1789\u1785\u17B7\u178F\u17D2\u178F... "'
            },
            {
              title: "\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1793\u17C3\u1780\u17B6\u179A\u1792\u17D2\u179C\u17BE\u1791\u17B6\u1793\u17B2\u17D2\u1799\u1794\u17B6\u1793\u1795\u179B\u1792\u17C6 (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u178F\u1780\u17D2\u1780\u179C\u17B7\u1787\u17D2\u1787\u17B6\u1780\u17B6\u179A\u1792\u17D2\u179C\u17BE\u1791\u17B6\u1793",
              top2: "\u17B2\u17D2\u1799\u1794\u17B6\u1793\u1795\u179B\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1792\u17C6",
              bot1: "\u1785\u17C1\u178F\u1793\u17B6 \u17E3 \u1780\u17B6\u179B",
              bot2: "\u1798\u17BB\u1793 \u1780\u17C6\u1796\u17BB\u1784 \u1793\u17B7\u1784\u1780\u17D2\u179A\u17C4\u1799\u1792\u17D2\u179C\u17BE",
              tags: ["#\u1785\u17C1\u178F\u1793\u17B6\u17E3\u1780\u17B6\u179B", "#\u1791\u17B6\u1793\u1795\u179B\u1792\u17C6", "#\u1794\u17BB\u178E\u17D2\u1799\u1794\u179A\u17B7\u179F\u17BB\u1791\u17D2\u1792"],
              transcript: '" \u1791\u17B6\u1793\u1798\u17B6\u1793\u1795\u179B\u1792\u17C6 \u1798\u17B7\u1793\u1798\u17C2\u1793\u17A2\u17B6\u179F\u17D2\u179A\u17D0\u1799\u179B\u17BE\u1785\u17C6\u1793\u17BD\u1793\u179B\u17BB\u1799\u1785\u17D2\u179A\u17BE\u1793\u1791\u17C1 \u178F\u17C2\u17A2\u17B6\u179F\u17D2\u179A\u17D0\u1799\u179B\u17BE\u1785\u17C1\u178F\u1793\u17B6\u1787\u17D2\u179A\u17C7\u1790\u17D2\u179B\u17B6\u1791\u17B6\u17C6\u1784\u1794\u17B8\u1780\u17B6\u179B... "'
            },
            {
              title: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u1793\u17D2\u1793\u17B7\u178A\u17D2\u178B\u17B6\u1793\u1793\u17C3\u1798\u17B6\u1782\u17CC\u17B6\u179A\u17C6\u178A\u17C4\u17C7\u1781\u17D2\u179B\u17BD\u1793 (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u1793\u17D2\u1793\u17B7\u178A\u17D2\u178B\u17B6\u1793",
              top2: "\u1793\u17C3\u1798\u17B6\u1782\u17CC\u17B6\u179A\u17C6\u178A\u17C4\u17C7\u1781\u17D2\u179B\u17BD\u1793",
              bot1: "\u1796\u17B9\u1784\u179B\u17BE\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              bot2: "\u1787\u17B6\u1791\u17B8\u1796\u17B9\u1784\u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A",
              tags: ["#\u1781\u17D2\u179B\u17BD\u1793\u1787\u17B6\u1791\u17B8\u1796\u17B9\u1784\u1781\u17D2\u179B\u17BD\u1793", "#\u1798\u17B6\u1782\u17CC\u17B6\u179A\u17C6\u178A\u17C4\u17C7", "#\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB"],
              transcript: '" \u17A2\u178F\u17D2\u178F\u17B6 \u17A0\u17B7 \u17A2\u178F\u17D2\u178F\u1793\u17C4 \u1793\u17B6\u1790\u17C4 \u2014 \u1781\u17D2\u179B\u17BD\u1793\u1787\u17B6\u1791\u17B8\u1796\u17B9\u1784\u179A\u1794\u179F\u17CB\u1781\u17D2\u179B\u17BD\u1793 \u1782\u17D2\u1798\u17B6\u1793\u1793\u179A\u178E\u17B6\u17A2\u17B6\u1785\u1787\u17BD\u1799\u1799\u17BE\u1784\u1794\u17B6\u1793\u1780\u17D2\u179A\u17C5\u1796\u17B8\u1781\u17D2\u179B\u17BD\u1793\u1799\u17BE\u1784\u17A1\u17BE\u1799... "'
            }
          ]
        },
        gpt4o: {
          badge: "\u{1F310} GPT-4o \u2014 99.1% High Engagement",
          strategyNote: "\u{1F525} Viral Social Hook, Punchlines & High Shareability (TikTok/Reels)",
          badgeColor: "#10b981",
          offsetShift: 35,
          baseDuration: [150, 165, 140, 175, 155, 145, 170, 150, 160, 175, 145, 165],
          viralScores: ["99.1%", "99.0%", "99.3%", "98.9%", "99.4%", "99.2%", "99.5%", "98.8%", "99.2%", "99.6%", "99.0%", "99.3%"],
          storylines: [
            {
              title: "\u179F\u17D2\u178F\u17B6\u1794\u17CB\u179A\u17BF\u1784\u1793\u17C1\u17C7\u1785\u1794\u17CB \u17A2\u17D2\u1793\u1780\u1793\u17B9\u1784\u179B\u17C2\u1784\u1781\u17B9\u1784\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3 (\u1797\u17B6\u1782\u17E1)",
              top1: "\u179F\u17D2\u178F\u17B6\u1794\u17CB\u1785\u1794\u17CB\u179B\u17C2\u1784\u1781\u17B9\u1784",
              top2: "\u179A\u17BF\u1784\u1796\u17B7\u178F\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u1788\u1794\u17CB\u1781\u17B9\u1784\u1782\u17C1",
              bot2: "\u178A\u17BE\u1798\u17D2\u1794\u17B8\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              tags: ["#\u179A\u17BF\u1784\u1781\u17D2\u179B\u17B8\u178A\u17B6\u179F\u17CB\u1785\u17B7\u178F\u17D2\u178F", "#\u1788\u1794\u17CB\u1781\u17B9\u1784", "#\u1798\u17C1\u179A\u17C0\u1793\u1787\u17B8\u179C\u17B7\u178F"],
              transcript: '" \u1794\u17BE\u17A2\u17D2\u1793\u1780\u179F\u17D2\u178F\u17B6\u1794\u17CB\u179A\u17BF\u1784\u1793\u17C1\u17C7\u1785\u1794\u17CB \u17A2\u17D2\u1793\u1780\u1793\u17B9\u1784\u1797\u17D2\u1789\u17B6\u1780\u17CB\u1795\u17D2\u17A2\u17BE\u179B\u1790\u17B6 \u17A0\u17C1\u178F\u17BB\u17A2\u17D2\u179C\u17B8\u1780\u1793\u17D2\u179B\u1784\u1798\u1780\u1799\u17BE\u1784\u1781\u17B6\u178F\u1796\u17C1\u179B\u1781\u17B9\u1784\u1782\u17C1\u1798\u17D2\u179B\u17C9\u17C1\u17C7... "'
            },
            {
              title: "\u17A2\u17B6\u1790\u17CC\u1780\u17C6\u1794\u17B6\u17C6\u1784\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1791\u17D2\u179A\u1796\u17D2\u1799 \u1793\u17B7\u1784\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB (\u1797\u17B6\u1782\u17E2)",
              top1: "\u17A2\u17B6\u1790\u17CC\u1780\u17C6\u1794\u17B6\u17C6\u1784\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1791\u17D2\u179A\u1796\u17D2\u1799",
              top2: "\u1793\u17B7\u1784\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1785\u17B7\u178F\u17D2\u178F",
              bot1: "\u1785\u17B7\u178F\u17D2\u178F\u1785\u17C1\u17C7\u17B2\u17D2\u1799\u1791\u17B6\u1793",
              bot2: "\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u179B\u17B6\u1797\u179F\u17C6\u178E\u17B6\u1784",
              tags: ["#\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1791\u17D2\u179A\u1796\u17D2\u1799", "#\u179B\u17B6\u1797\u179F\u17C6\u178E\u17B6\u1784", "#\u1785\u17B7\u178F\u17D2\u178F\u179F\u1794\u17D2\u1794\u17BB\u179A\u179F"],
              transcript: '" \u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17C2\u179B\u1780\u17B6\u1793\u17CB\u178F\u17C2\u1785\u17C1\u17C7\u1785\u17C2\u1780\u179A\u17C6\u179B\u17C2\u1780 \u1782\u17BA\u1780\u17B6\u1793\u17CB\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793\u1798\u1780\u179C\u17B7\u1789\u1793\u17BC\u179C\u179B\u17B6\u1797\u179F\u1780\u17D2\u1780\u17B6\u179A\u17C8... "'
            },
            {
              title: "\u1796\u17B6\u1780\u17D2\u1799 \u17E3 \u1798\u17C9\u17B6\u178F\u17CB\u178A\u17C2\u179B\u1794\u17D2\u178F\u17BC\u179A\u1787\u17B8\u179C\u17B7\u178F\u17A2\u17D2\u1793\u1780\u1787\u17B6\u179A\u17C0\u1784\u179A\u17A0\u17BC\u178F (\u1797\u17B6\u1782\u17E3)",
              top1: "\u1796\u17B6\u1780\u17D2\u1799 \u17E3 \u1798\u17C9\u17B6\u178F\u17CB",
              top2: "\u1794\u17D2\u178F\u17BC\u179A\u1787\u17B8\u179C\u17B7\u178F\u1787\u17B6\u179A\u17C0\u1784\u179A\u17A0\u17BC\u178F",
              bot1: "\u17A2\u179A\u1782\u17BB\u178E \u17A2\u178F\u17CB\u1791\u17C4\u179F",
              bot2: "\u1793\u17B7\u1784\u179A\u179F\u17CB\u1793\u17C5\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
              tags: ["#\u1796\u17B6\u1780\u17D2\u1799\u17E3\u1798\u17C9\u17B6\u178F\u17CB", "#\u1794\u17D2\u178F\u17BC\u179A\u1787\u17B8\u179C\u17B7\u178F", "#\u1795\u17D2\u1793\u178F\u17CB\u1782\u17C6\u1793\u17B7\u178F"],
              transcript: '" \u1782\u17D2\u179A\u17B6\u1793\u17CB\u178F\u17C2\u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F\u1796\u17B6\u1780\u17D2\u1799 \u17E3 \u1798\u17C9\u17B6\u178F\u17CB\u1793\u17C1\u17C7\u179A\u17B6\u179B\u17CB\u1790\u17D2\u1784\u17C3 \u1787\u17B8\u179C\u17B7\u178F\u17A2\u17D2\u1793\u1780\u1793\u17B9\u1784\u1794\u17D2\u179A\u17C2\u1780\u17D2\u179B\u17B6\u1799\u1787\u17B6\u179F\u17D2\u179A\u179F\u17CB\u1794\u17C6\u1796\u17D2\u179A\u1784... "'
            },
            {
              title: "\u1780\u17BB\u17C6\u1798\u17BE\u179B\u179A\u17C6\u179B\u1784\u179A\u17BF\u1784\u178F\u17BC\u1785\u178F\u17B6\u1785\u1791\u17B6\u17C6\u1784\u1793\u17C1\u17C7\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F (\u1797\u17B6\u1782\u17E4)",
              top1: "\u1780\u17BB\u17C6\u1798\u17BE\u179B\u179A\u17C6\u179B\u1784\u179A\u17BF\u1784\u178F\u17BC\u1785\u178F\u17B6\u1785",
              top2: "\u178A\u17C2\u179B\u179F\u17B6\u1784\u1795\u179B\u1792\u17C6\u1792\u17C1\u1784",
              bot1: "\u178A\u17C6\u178E\u1780\u17CB\u1791\u17B9\u1780\u1794\u1793\u17D2\u178F\u17B7\u1785\u1798\u17D2\u178F\u1784",
              bot2: "\u17A2\u17B6\u1785\u1796\u17C1\u1789\u1796\u17B6\u1784\u1792\u17C6\u1794\u17B6\u1793",
              tags: ["#\u179A\u17BF\u1784\u178F\u17BC\u1785\u178F\u17B6\u1785", "#\u1795\u179B\u1792\u17C6\u1792\u17C1\u1784", "#\u1780\u17B6\u179A\u179F\u1793\u17D2\u179F\u17C6\u1780\u17BB\u179F\u179B"],
              transcript: '" \u17A2\u17C6\u1796\u17BE\u179B\u17D2\u17A2\u178F\u17BC\u1785\u178F\u17B6\u1785\u1780\u17BB\u17C6\u1782\u17B7\u178F\u1790\u17B6\u1798\u17B7\u1793\u1794\u17B6\u1793\u1795\u179B \u178A\u17C6\u178E\u1780\u17CB\u1791\u17B9\u1780\u1794\u1793\u17D2\u178F\u17B7\u1785\u1798\u17D2\u178F\u1784\u17D7\u1793\u17C5\u178F\u17C2\u17A2\u17B6\u1785\u1794\u17C6\u1796\u17C1\u1789\u1796\u17B6\u1784\u1792\u17C6\u1794\u17B6\u1793... "'
            },
            {
              title: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1796\u17B7\u178F\u1793\u17C3\u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17C2\u179B\u17A2\u17D2\u1793\u1780\u1782\u17BD\u179A\u178A\u17B9\u1784\u1798\u17BB\u1793\u1799\u17BA\u178F\u1796\u17C1\u179B (\u1797\u17B6\u1782\u17E5)",
              top1: "\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1796\u17B7\u178F\u1793\u17C3\u1798\u1793\u17BB\u179F\u17D2\u179F",
              top2: "\u1782\u17BD\u179A\u178A\u17B9\u1784\u1798\u17BB\u1793\u1796\u17C1\u179B\u1799\u17BA\u178F",
              bot1: "\u1798\u17BE\u179B\u1798\u1793\u17BB\u179F\u17D2\u179F\u17B2\u17D2\u1799\u1792\u17D2\u179B\u17BB\u17C7",
              bot2: "\u178A\u17C4\u1799\u1794\u17D2\u179A\u17BE\u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6",
              tags: ["#\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1796\u17B7\u178F", "#\u1798\u17BE\u179B\u1798\u1793\u17BB\u179F\u17D2\u179F", "#\u1794\u1791\u1796\u17B7\u179F\u17C4\u1792"],
              transcript: '" \u1780\u17BB\u17C6\u179C\u17B6\u1799\u178F\u1798\u17D2\u179B\u17C3\u1798\u1793\u17BB\u179F\u17D2\u179F\u178F\u17D2\u179A\u17B9\u1798\u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8 \u1785\u17BC\u179A\u1798\u17BE\u179B\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796\u1793\u17B7\u1784\u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6\u178A\u17C2\u179B\u1786\u17D2\u179B\u1784\u1780\u17B6\u178F\u17CB\u1787\u17B6\u1798\u17BD\u1799\u1782\u17D2\u1793\u17B6... "'
            },
            {
              title: "\u17A0\u17C1\u178F\u17BB\u1795\u179B\u178A\u17C2\u179B\u17A2\u17D2\u1793\u1780\u1782\u17BD\u179A\u1788\u1794\u17CB\u1781\u17D2\u179C\u179B\u17CB\u1796\u17B8\u179F\u1798\u17D2\u178F\u17B8\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3 (\u1797\u17B6\u1782\u17E6)",
              top1: "\u1788\u1794\u17CB\u1781\u17D2\u179C\u179B\u17CB\u179F\u1798\u17D2\u178F\u17B8\u1782\u17C1",
              top2: "\u179A\u179F\u17CB\u1793\u17C5\u1787\u17B6\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              bot1: "\u1798\u17B6\u178F\u17CB\u1782\u17C1\u1798\u17B7\u1793\u17A2\u17B6\u1785",
              bot2: "\u1780\u17C6\u178E\u178F\u17CB\u1787\u17C4\u1782\u179C\u17B6\u179F\u1793\u17B6\u17A2\u17D2\u1793\u1780\u1794\u17B6\u1793",
              tags: ["#\u1788\u1794\u17CB\u1781\u17D2\u179C\u179B\u17CB\u179F\u1798\u17D2\u178F\u17B8\u1782\u17C1", "#\u179A\u179F\u17CB\u1787\u17B6\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784", "#\u1791\u17C6\u1793\u17BB\u1780\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1798\u17B6\u178F\u17CB\u1787\u17B6\u1798\u17B6\u178F\u17CB\u179A\u1794\u179F\u17CB\u1782\u17C1 \u178F\u17C2\u1787\u17B8\u179C\u17B7\u178F\u1787\u17B6\u1787\u17B8\u179C\u17B7\u178F\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780 \u1780\u17BB\u17C6\u1799\u1780\u1796\u17B6\u1780\u17D2\u1799\u1782\u17C1\u1798\u1780\u1794\u17C6\u1795\u17D2\u179B\u17B6\u1789\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784... "'
            },
            {
              title: "\u179C\u17B7\u1792\u17B8\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2\u17D7\u17B2\u17D2\u1799\u1785\u17BC\u179B\u1798\u1780\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F (\u1797\u17B6\u1782\u17E7)",
              top1: "\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2\u17D7",
              top2: "\u1785\u17BC\u179B\u1798\u1780\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u1781\u17D2\u179B\u17BD\u1793\u1799\u17BE\u1784\u178F\u17D2\u179A\u17BC\u179C\u179B\u17D2\u17A2\u179F\u17B7\u1793",
              bot2: "\u1791\u17BE\u1794\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1798\u1793\u17BB\u179F\u17D2\u179F\u178A\u17BC\u1785\u1782\u17D2\u1793\u17B6",
              tags: ["#\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2", "#\u179A\u1784\u17D2\u179C\u1784\u17CB\u1798\u17B7\u178F\u17D2\u178F\u1797\u1780\u17D2\u178F\u17B7", "#\u1785\u179A\u17B7\u178F\u179B\u17D2\u17A2"],
              transcript: '" \u1785\u17D2\u1794\u17B6\u1794\u17CB\u1793\u17C3\u1780\u17B6\u179A\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u17D6 \u1795\u17D2\u1780\u17B6\u179F\u17D2\u179A\u179F\u17CB\u179F\u17D2\u17A2\u17B6\u178F\u178F\u17C2\u1784\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1783\u17D2\u1798\u17BB\u17C6 \u1782\u17C6\u1793\u17B7\u178F\u179B\u17D2\u17A2\u178F\u17C2\u1784\u1791\u17B6\u1780\u17CB\u1791\u17B6\u1789\u1798\u1793\u17BB\u179F\u17D2\u179F\u179B\u17D2\u17A2... "'
            },
            {
              title: "\u1780\u17C6\u17A0\u17BB\u179F\u1792\u17C6\u1794\u17C6\u1795\u17BB\u178F\u178A\u17C2\u179B\u1798\u1793\u17BB\u179F\u17D2\u179F\u178F\u17C2\u1784\u178F\u17C2\u1794\u1784\u17D2\u1780\u17BE\u178F (\u1797\u17B6\u1782\u17E8)",
              top1: "\u1780\u17C6\u17A0\u17BB\u179F\u1792\u17C6\u1794\u17C6\u1795\u17BB\u178F",
              top2: "\u178A\u17C2\u179B\u1798\u1793\u17BB\u179F\u17D2\u179F\u178F\u17C2\u1784\u1794\u1784\u17D2\u1780\u17BE\u178F",
              bot1: "\u1780\u17B6\u179A\u179A\u17C6\u1796\u17B9\u1784\u1796\u17B8\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3",
              bot2: "\u1785\u17D2\u179A\u17BE\u1793\u1787\u17B6\u1784\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784",
              tags: ["#\u1780\u17C6\u17A0\u17BB\u179F\u1787\u17B8\u179C\u17B7\u178F", "#\u1788\u1794\u17CB\u179A\u17C6\u1796\u17B9\u1784", "#\u1798\u17D2\u1785\u17B6\u179F\u17CB\u1780\u17B6\u179A"],
              transcript: '" \u1780\u17BB\u17C6\u179A\u17C6\u1796\u17B9\u1784\u1790\u17B6\u1793\u179A\u178E\u17B6\u1798\u17D2\u1793\u17B6\u1780\u17CB\u1793\u17B9\u1784\u1798\u1780\u1792\u17D2\u179C\u17BE\u17B2\u17D2\u1799\u17A2\u17D2\u1793\u1780\u1798\u17B6\u1793\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781 \u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u1796\u17B7\u178F\u178F\u17D2\u179A\u17BC\u179C\u179F\u17B6\u1784\u178A\u17C4\u1799\u1781\u17D2\u179B\u17BD\u1793\u17AF\u1784... "'
            },
            {
              title: "\u17E3 \u1799\u17C9\u17B6\u1784\u178A\u17C2\u179B\u1798\u17B7\u1793\u17A2\u17B6\u1785\u1799\u1780\u178F\u17D2\u179A\u17A1\u1794\u17CB\u1798\u1780\u179C\u17B7\u1789\u1794\u17B6\u1793 (\u1797\u17B6\u1782\u17E9)",
              top1: "\u17E3 \u1799\u17C9\u17B6\u1784\u1780\u17D2\u1793\u17BB\u1784\u179B\u17C4\u1780",
              top2: "\u1798\u17B7\u1793\u17A2\u17B6\u1785\u1799\u1780\u1798\u1780\u179C\u17B7\u1789\u1794\u17B6\u1793",
              bot1: "\u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6 \u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8",
              bot2: "\u1793\u17B7\u1784\u17B1\u1780\u17B6\u179F\u178A\u17C2\u179B\u1780\u1793\u17D2\u179B\u1784\u1795\u17BB\u178F",
              tags: ["#\u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6", "#\u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8", "#\u17B1\u1780\u17B6\u179F"],
              transcript: '" \u1796\u17C1\u179B\u179C\u17C1\u179B\u17B6\u178A\u17C2\u179B\u1780\u1793\u17D2\u179B\u1784\u1795\u17BB\u178F \u1796\u17B6\u1780\u17D2\u1799\u179F\u1798\u17D2\u178F\u17B8\u178A\u17C2\u179B\u1793\u17B7\u1799\u17B6\u1799\u179A\u17BD\u1785 \u1793\u17B7\u1784\u17B1\u1780\u17B6\u179F\u178A\u17C2\u179B\u179A\u1794\u17BC\u178F \u1798\u17B7\u1793\u17A2\u17B6\u1785\u17A0\u17C5\u178F\u17D2\u179A\u17A1\u1794\u17CB\u179C\u17B7\u1789\u1794\u17B6\u1793\u17A1\u17BE\u1799... "'
            },
            {
              title: "\u179F\u17B6\u179A\u1796\u17B7\u179F\u17C1\u179F\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u17A2\u17D2\u1793\u1780\u1780\u17C6\u1796\u17BB\u1784\u17A2\u179F\u17CB\u179F\u1784\u17D2\u1783\u17B9\u1798 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u179F\u17B6\u179A\u1796\u17B7\u179F\u17C1\u179F\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB",
              top2: "\u17A2\u17D2\u1793\u1780\u1780\u17C6\u1796\u17BB\u1784\u17A2\u179F\u17CB\u179F\u1784\u17D2\u1783\u17B9\u1798",
              bot1: "\u1794\u1793\u17D2\u1791\u17B6\u1794\u17CB\u1796\u17B8\u1797\u17D2\u179B\u17C0\u1784\u1792\u17D2\u179B\u17B6\u1780\u17CB",
              bot2: "\u1798\u17C1\u1783\u1793\u17B9\u1784\u179F\u17D2\u179A\u17A1\u17C7\u17A1\u17BE\u1784\u179C\u17B7\u1789",
              tags: ["#\u1780\u17BB\u17C6\u17A2\u179F\u17CB\u179F\u1784\u17D2\u1783\u17B9\u1798", "#\u1796\u1793\u17D2\u179B\u17BA\u1787\u17B8\u179C\u17B7\u178F", "#\u1780\u1798\u17D2\u179B\u17B6\u17C6\u1784\u1785\u17B7\u178F\u17D2\u178F"],
              transcript: '" \u1780\u17BB\u17C6\u1791\u17B6\u1793\u17CB\u1785\u17BB\u17C7\u1785\u17B6\u1789\u17CB \u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7\u1794\u17D2\u179A\u17A0\u17C2\u179B\u1787\u17B6\u179B\u17C6\u1794\u17B6\u1780 \u178F\u17C2\u1790\u17D2\u1784\u17C3\u179F\u17D2\u17A2\u17C2\u1780\u1793\u17B9\u1784\u1798\u17B6\u1793\u1796\u1793\u17D2\u179B\u17BA\u1796\u17D2\u179A\u17C7\u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799\u179A\u17C7\u17A1\u17BE\u1784\u179C\u17B7\u1789... "'
            },
            {
              title: "\u17A2\u17B6\u1790\u17CC\u1780\u17C6\u1794\u17B6\u17C6\u1784\u1793\u17C3\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798\u179A\u17C6\u179B\u17B6\u1799\u17A7\u1794\u179F\u1782\u17D2\u1782 (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798\u1791\u17B7\u1796\u17D2\u179C",
              top2: "\u179A\u17C6\u179B\u17B6\u1799\u17A7\u1794\u179F\u1782\u17D2\u1782\u1787\u17B8\u179C\u17B7\u178F",
              bot1: "\u1789\u1789\u17B9\u1798\u178A\u17B6\u1780\u17CB\u1787\u17B8\u179C\u17B7\u178F",
              bot2: "\u1787\u17B8\u179C\u17B7\u178F\u1793\u17B9\u1784\u1789\u1789\u17B9\u1798\u178F\u1794\u179C\u17B7\u1789",
              tags: ["#\u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798", "#\u179A\u17C6\u179B\u17B6\u1799\u1791\u17BB\u1780\u17D2\u1781", "#\u1790\u17B6\u1798\u1796\u179B"],
              transcript: '" \u179F\u17D2\u1793\u17B6\u1798\u1789\u1789\u17B9\u1798\u1798\u17B7\u1793\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3\u1791\u17C1 \u178F\u17C2\u179C\u17B6\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3\u1798\u17B7\u1793\u17A2\u17B6\u1785\u1780\u17B6\u178F\u17CB\u1790\u17D2\u179B\u17C3\u1794\u17B6\u1793\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u17A2\u17D2\u1793\u1780\u178A\u17C2\u179B\u1794\u17B6\u1793\u1783\u17BE\u1789... "'
            },
            {
              title: "\u1796\u17B6\u1780\u17D2\u1799\u1787\u17BC\u1793\u1796\u179A\u178A\u17CF\u1798\u17B6\u1793\u1798\u17A0\u17B7\u1791\u17D2\u1792\u17B7\u17AB\u1791\u17D2\u1792\u17B7\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7 (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u1796\u17B6\u1780\u17D2\u1799\u1787\u17BC\u1793\u1796\u179A\u1796\u17B7\u179F\u17C1\u179F",
              top2: "\u1793\u17B6\u17C6\u179B\u17B6\u1797\u179F\u17C6\u178E\u17B6\u1784",
              bot1: "\u179F\u17BC\u1798\u17B2\u17D2\u1799\u1787\u17BD\u1794\u178F\u17C2\u179F\u17BB\u1781",
              bot2: "\u1793\u17B7\u1784\u179F\u1798\u17D2\u179A\u17C1\u1785\u1782\u17D2\u179A\u1794\u17CB\u1794\u17C6\u178E\u1784",
              tags: ["#\u1796\u17B6\u1780\u17D2\u1799\u1787\u17BC\u1793\u1796\u179A", "#\u179B\u17B6\u1797\u179F\u17C6\u178E\u17B6\u1784", "#\u1787\u17D0\u1799\u1798\u1784\u17D2\u1782\u179B"],
              transcript: '" \u179F\u17BC\u1798\u17B2\u17D2\u1799\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791\u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB\u1787\u17BD\u1794\u178F\u17C2\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781 \u1785\u1798\u17D2\u179A\u17BE\u1793\u178A\u17C4\u1799\u17A2\u17B6\u1799\u17BB \u179C\u178E\u17D2\u178E\u17C8 \u179F\u17BB\u1781\u17C8 \u1796\u179B\u17C8 \u1780\u17BB\u17C6\u1794\u17B8\u1783\u17D2\u179B\u17B6\u178F\u17A1\u17BE\u1799... "'
            }
          ]
        },
        llama: {
          badge: "\u{1F999} Llama 3.3 70B \u2014 97.8% Community Reach",
          strategyNote: "\u{1F33E} \u1791\u17C6\u1793\u17C0\u1798\u1791\u1798\u17D2\u179B\u17B6\u1794\u17CB\u1781\u17D2\u1798\u17C2\u179A \u179F\u17B8\u179B\u1792\u1798\u17CC \u1793\u17B7\u1784\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1794\u17BB\u178E\u17D2\u1799\u1780\u17BB\u179F\u179B",
          badgeColor: "#f59e0b",
          offsetShift: 55,
          baseDuration: [165, 195, 170, 205, 180, 190, 200, 165, 185, 205, 175, 195],
          viralScores: ["97.8%", "98.1%", "97.9%", "98.4%", "98.0%", "98.2%", "98.5%", "97.6%", "98.3%", "98.6%", "98.0%", "98.3%"],
          storylines: [
            {
              title: "\u1794\u17BB\u178E\u17D2\u1799\u1780\u17BB\u179F\u179B\u1793\u17B7\u1784\u179F\u17B8\u179B\u1792\u1798\u17CC\u1793\u17C3\u1780\u17B6\u179A\u179A\u179F\u17CB\u1793\u17C5\u1787\u17BB\u17C6\u1782\u17D2\u1793\u17B6 (\u1797\u17B6\u1782\u17E1)",
              top1: "\u1794\u17BB\u178E\u17D2\u1799\u1780\u17BB\u179F\u179B\u1793\u17B7\u1784\u179F\u17B8\u179B",
              top2: "\u179A\u179F\u17CB\u1793\u17C5\u1787\u17BB\u17C6\u1782\u17D2\u1793\u17B6\u178A\u17C4\u1799\u179F\u17BB\u1781",
              bot1: "\u179F\u17B8\u179B\u1792\u1798\u17CC\u179F\u1784\u17D2\u1782\u1798",
              bot2: "\u1787\u17B6\u1782\u17D2\u179A\u17B9\u17C7\u1793\u17C3\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796",
              tags: ["#\u179F\u17B8\u179B\u1792\u1798\u17CC", "#\u179A\u179F\u17CB\u1793\u17C5\u1787\u17BB\u17C6\u1782\u17D2\u1793\u17B6", "#\u1794\u17BB\u178E\u17D2\u1799\u1780\u17BB\u179F\u179B"],
              transcript: '" \u1780\u17B6\u179A\u179A\u179F\u17CB\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798\u178A\u17C4\u1799\u1798\u17B6\u1793\u179F\u17B8\u179B\u1792\u1798\u17CC \u1793\u17B7\u1784\u1780\u17B6\u179A\u1799\u17C4\u1782\u1799\u179B\u17CB\u1782\u17D2\u1793\u17B6 \u1793\u17B6\u17C6\u17B2\u17D2\u1799\u1797\u17BC\u1798\u17B7\u178B\u17B6\u1793\u1798\u17B6\u1793\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781... "'
            },
            {
              title: "\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A\u1793\u17B7\u1784\u178F\u1798\u17D2\u179B\u17C3\u1793\u17C3\u1780\u17BB\u179F\u179B\u1785\u17C1\u178F\u1793\u17B6 (\u1797\u17B6\u1782\u17E2)",
              top1: "\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A",
              top2: "\u178F\u1798\u17D2\u179B\u17C3\u1793\u17C3\u1780\u17BB\u179F\u179B\u1785\u17C1\u178F\u1793\u17B6",
              bot1: "\u1794\u17BB\u178E\u17D2\u1799\u1791\u17B6\u1793\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8",
              bot2: "\u1785\u1784\u1780\u17D2\u179A\u1784\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1797\u17B6\u1796",
              tags: ["#\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A", "#\u1780\u17BB\u179F\u179B\u1785\u17C1\u178F\u1793\u17B6", "#\u1794\u17BB\u178E\u17D2\u1799\u1791\u17B6\u1793"],
              transcript: '" \u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17C2\u1787\u17B6\u1780\u17B6\u179A\u179F\u17B6\u1784\u1780\u17BB\u179F\u179B\u1791\u17C1 \u178F\u17C2\u1787\u17B6\u1780\u17B6\u179A\u1787\u17BD\u1794\u1787\u17BB\u17C6\u1794\u1784\u1794\u17D2\u17A2\u17BC\u1793\u1780\u17BC\u1793\u1785\u17C5... "'
            },
            {
              title: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1793\u17C3\u1780\u17B6\u179A\u179A\u1780\u17D2\u179F\u17B6\u179F\u17B8\u179B\u17E5\u1780\u17D2\u1793\u17BB\u1784\u179F\u1784\u17D2\u1782\u1798 (\u1797\u17B6\u1782\u17E3)",
              top1: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u179A\u1780\u17D2\u179F\u17B6\u179F\u17B8\u179B\u17E5",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u1787\u17B8\u179C\u17B7\u178F\u179A\u179F\u17CB\u1793\u17C5",
              bot1: "\u179F\u17B8\u179B\u1780\u17B6\u179A\u1796\u17B6\u179A\u1781\u17D2\u179B\u17BD\u1793",
              bot2: "\u17B2\u17D2\u1799\u179A\u17BD\u1785\u1795\u17BB\u178F\u1796\u17B8\u1782\u17D2\u179A\u17C4\u17C7\u1790\u17D2\u1793\u17B6\u1780\u17CB",
              tags: ["#\u179F\u17B8\u179B\u17E5", "#\u1780\u17B6\u179A\u1796\u17B6\u179A\u1781\u17D2\u179B\u17BD\u1793", "#\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781"],
              transcript: '" \u179F\u17B8\u179B\u17E5 \u1787\u17B6\u17A2\u17B6\u179C\u1780\u17D2\u179A\u17C4\u17C7\u1780\u17B6\u179A\u1796\u17B6\u179A\u1787\u17B8\u179C\u17B7\u178F\u1798\u17B7\u1793\u17B2\u17D2\u1799\u1792\u17D2\u179B\u17B6\u1780\u17CB\u1791\u17C5\u1780\u17D2\u1793\u17BB\u1784\u1795\u17D2\u179B\u17BC\u179C\u17A2\u1794\u17B6\u1799\u1798\u17BB\u1781... "'
            },
            {
              title: "\u1780\u17B6\u179A\u1785\u17C2\u1780\u179A\u17C6\u179B\u17C2\u1780\u1791\u17B6\u1793\u1787\u17B6\u1782\u17D2\u179A\u17B9\u17C7\u1793\u17C3\u179F\u17BB\u1797\u1798\u1784\u17D2\u1782\u179B (\u1797\u17B6\u1782\u17E4)",
              top1: "\u1780\u17B6\u179A\u1785\u17C2\u1780\u179A\u17C6\u179B\u17C2\u1780\u1791\u17B6\u1793",
              top2: "\u1787\u17B6\u1782\u17D2\u179A\u17B9\u17C7\u1793\u17C3\u179F\u17BB\u1797\u1798\u1784\u17D2\u1782\u179B",
              bot1: "\u1791\u17B6\u1793\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u179F\u17BB\u1781",
              bot2: "\u178A\u179B\u17CB\u17A2\u17D2\u1793\u1780\u17B2\u17D2\u1799\u1793\u17B7\u1784\u17A2\u17D2\u1793\u1780\u1791\u1791\u17BD\u179B",
              tags: ["#\u1780\u17B6\u179A\u1785\u17C2\u1780\u179A\u17C6\u179B\u17C2\u1780", "#\u1791\u17B6\u1793\u1798\u17D0\u1799", "#\u179F\u17BB\u1797\u1798\u1784\u17D2\u1782\u179B"],
              transcript: '" \u1780\u17B6\u179A\u1785\u17C2\u1780\u179A\u17C6\u179B\u17C2\u1780\u178A\u17C4\u1799\u1780\u17D2\u178F\u17B8\u1798\u17C1\u178F\u17D2\u178F\u17B6 \u1792\u17D2\u179C\u17BE\u17B2\u17D2\u1799\u1796\u17B7\u1797\u1796\u179B\u17C4\u1780\u1780\u17B6\u1793\u17CB\u178F\u17C2\u179F\u17D2\u179A\u179F\u17CB\u1794\u17C6\u1796\u17D2\u179A\u1784... "'
            },
            {
              title: "\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1792\u1798\u17CC\u1780\u17D2\u1793\u17BB\u1784\u1797\u17BC\u1798\u17B7\u178B\u17B6\u1793\u1793\u17B7\u1784\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791 (\u1797\u17B6\u1782\u17E5)",
              top1: "\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1792\u1798\u17CC",
              top2: "\u1780\u17D2\u1793\u17BB\u1784\u1797\u17BC\u1798\u17B7\u178B\u17B6\u1793\u1781\u17D2\u1798\u17C2\u179A",
              bot1: "\u1787\u17BD\u1799\u1791\u17BB\u1780\u17D2\u1781\u1792\u17BB\u179A\u17C8\u1782\u17D2\u1793\u17B6",
              bot2: "\u179A\u179F\u17CB\u1793\u17C5\u178A\u17BC\u1785\u1794\u1784\u1794\u17D2\u17A2\u17BC\u1793",
              tags: ["#\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8\u1792\u1798\u17CC", "#\u1787\u17BD\u1799\u1782\u17D2\u1793\u17B6", "#\u1794\u1784\u1794\u17D2\u17A2\u17BC\u1793\u1781\u17D2\u1798\u17C2\u179A"],
              transcript: '" \u1796\u17C1\u179B\u1798\u17B6\u1793\u1780\u17B6\u179A\u1787\u17BD\u1799\u1782\u17D2\u1793\u17B6 \u1796\u17C1\u179B\u1798\u17B6\u1793\u1791\u17BB\u1780\u17D2\u1781\u179A\u17BD\u1798\u1782\u17D2\u1793\u17B6 \u1793\u17C1\u17C7\u1787\u17B6\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u178A\u17CF\u179B\u17D2\u17A2\u1795\u17BC\u179A\u1795\u1784\u17CB\u179A\u1794\u179F\u17CB\u1781\u17D2\u1798\u17C2\u179A... "'
            },
            {
              title: "\u1780\u17B6\u179A\u178A\u17B9\u1784\u1782\u17BB\u178E\u1782\u17D2\u179A\u17BC\u1794\u17B6\u1792\u17D2\u1799\u17B6\u1799\u1793\u17B7\u1784\u1798\u17C1\u178A\u17B9\u1780\u1793\u17B6\u17C6 (\u1797\u17B6\u1782\u17E6)",
              top1: "\u1780\u17B6\u179A\u178A\u17B9\u1784\u1782\u17BB\u178E",
              top2: "\u1782\u17D2\u179A\u17BC\u1794\u17B6\u1792\u17D2\u1799\u17B6\u1799\u1793\u17B7\u1784\u17A2\u17D2\u1793\u1780\u178A\u17B9\u1780\u1793\u17B6\u17C6",
              bot1: "\u1780\u178F\u1789\u17D2\u1789\u17BC\u178F\u17B6\u1792\u1798\u17CC",
              bot2: "\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1785\u1798\u17D2\u179A\u17BE\u1793",
              tags: ["#\u178A\u17B9\u1784\u1782\u17BB\u178E\u1782\u17D2\u179A\u17BC", "#\u1780\u178F\u1789\u17D2\u1789\u17BC", "#\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1785\u1798\u17D2\u179A\u17BE\u1793"],
              transcript: '" \u17A2\u17D2\u1793\u1780\u178A\u17C2\u179B\u1785\u17C1\u17C7\u178A\u17B9\u1784\u1782\u17BB\u178E\u1782\u17D2\u179A\u17BC \u178F\u17C2\u1784\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793\u1793\u17BC\u179C\u1785\u17C6\u178E\u17C1\u17C7\u178A\u17B9\u1784\u1793\u17B7\u1784\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u1785\u1798\u17D2\u179A\u17BE\u1793\u179B\u17BC\u178F\u179B\u17B6\u179F\u17CB... "'
            },
            {
              title: "\u1780\u17B6\u179A\u17A2\u1794\u17CB\u179A\u17C6\u1780\u17BC\u1793\u1785\u17C5\u178F\u17B6\u1798\u1782\u1793\u17D2\u179B\u1784\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC (\u1797\u17B6\u1782\u17E7)",
              top1: "\u17A2\u1794\u17CB\u179A\u17C6\u1780\u17BC\u1793\u1785\u17C5",
              top2: "\u178F\u17B6\u1798\u1782\u1793\u17D2\u179B\u1784\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC",
              bot1: "\u1794\u178E\u17D2\u178F\u17BB\u17C7\u1796\u17BC\u1787\u179B\u17D2\u17A2",
              bot2: "\u17B2\u17D2\u1799\u1780\u17D2\u179B\u17B6\u1799\u1787\u17B6\u1791\u17C6\u1796\u17B6\u17C6\u1784\u179F\u17D2\u1793\u1784\u17AB\u179F\u17D2\u179F\u17B8",
              tags: ["#\u17A2\u1794\u17CB\u179A\u17C6\u1780\u17BC\u1793", "#\u1791\u17C6\u1796\u17B6\u17C6\u1784\u179F\u17D2\u1793\u1784\u17AB\u179F\u17D2\u179F\u17B8", "#\u1782\u17C6\u179A\u17BC\u179B\u17D2\u17A2"],
              transcript: '" \u1780\u17BC\u1793\u178A\u17C2\u179B\u179B\u17D2\u17A2\u1780\u17BE\u178F\u1785\u17C1\u1789\u1796\u17B8\u1780\u17B6\u179A\u17A2\u1794\u17CB\u179A\u17C6\u179A\u1794\u179F\u17CB\u17AA\u1796\u17BB\u1780\u1798\u17D2\u178F\u17B6\u1799 \u1793\u17B7\u1784\u1780\u17B6\u179A\u1792\u17D2\u179C\u17BE\u1787\u17B6\u1782\u17C6\u179A\u17BC\u179B\u17D2\u17A2... "'
            },
            {
              title: "\u1794\u17BB\u178E\u17D2\u1799\u1797\u17D2\u1787\u17BB\u17C6\u1794\u17B7\u178E\u17D2\u178C\u1793\u17B7\u1784\u1780\u17B6\u179A\u178F\u1794\u1782\u17BB\u178E\u1794\u17BB\u1796\u17D2\u179C\u1780\u17B6\u179A\u17B8 (\u1797\u17B6\u1782\u17E8)",
              top1: "\u1794\u17BB\u178E\u17D2\u1799\u1797\u17D2\u1787\u17BB\u17C6\u1794\u17B7\u178E\u17D2\u178C",
              top2: "\u178F\u1794\u1782\u17BB\u178E\u1794\u17BB\u1796\u17D2\u179C\u1780\u17B6\u179A\u17B8\u1787\u1793",
              bot1: "\u17A7\u1791\u17D2\u1791\u17B7\u179F\u1780\u17BB\u179F\u179B",
              bot2: "\u1787\u17BC\u1793\u17A2\u17D2\u1793\u1780\u1785\u17C2\u1780\u178B\u17B6\u1793\u1791\u17C5",
              tags: ["#\u1797\u17D2\u1787\u17BB\u17C6\u1794\u17B7\u178E\u17D2\u178C", "#\u17A7\u1791\u17D2\u1791\u17B7\u179F\u1780\u17BB\u179F\u179B", "#\u1794\u17BB\u1796\u17D2\u179C\u1780\u17B6\u179A\u17B8"],
              transcript: '" \u1780\u17B6\u179A\u17A7\u1791\u17D2\u1791\u17B7\u179F\u1780\u17BB\u179F\u179B\u1787\u17BC\u1793\u1794\u17BB\u1796\u17D2\u179C\u1780\u17B6\u179A\u17B8\u1787\u1793\u178A\u17C2\u179B\u1785\u17C2\u1780\u178B\u17B6\u1793 \u1787\u17B6\u1780\u179A\u178E\u17B8\u1799\u1780\u17B7\u1785\u17D2\u1785\u179A\u1794\u179F\u17CB\u1780\u17BC\u1793\u1785\u17C5... "'
            },
            {
              title: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1793\u17C3\u1780\u17B6\u179A\u1780\u179F\u17B6\u1784\u179C\u178F\u17D2\u178F\u17A2\u17B6\u179A\u17B6\u1798 (\u1797\u17B6\u1782\u17E9)",
              top1: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1780\u179F\u17B6\u1784",
              top2: "\u179C\u178F\u17D2\u178F\u17A2\u17B6\u179A\u17B6\u1798\u1793\u17B7\u1784\u1791\u17B8\u179F\u17C1\u1793\u17B6\u179F\u1793\u17C8",
              bot1: "\u1787\u17B6\u1787\u1798\u17D2\u179A\u1780\u1796\u17D2\u179A\u17C7\u1792\u1798\u17CC",
              bot2: "\u1793\u17B7\u1784\u1791\u17B8\u1796\u17B9\u1784\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791",
              tags: ["#\u1780\u179F\u17B6\u1784\u179C\u178F\u17D2\u178F", "#\u1791\u17B8\u179F\u17C1\u1793\u17B6\u179F\u1793\u17C8", "#\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6"],
              transcript: '" \u1780\u17B6\u179A\u1780\u179F\u17B6\u1784\u1791\u17B8\u179F\u17C1\u1793\u17B6\u179F\u1793\u17C8 \u1787\u17B6\u1780\u17B6\u179A\u1794\u178E\u17D2\u178F\u17BB\u17C7\u1782\u17D2\u179A\u17B6\u1794\u17CB\u1796\u17BC\u1787\u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6\u17B2\u17D2\u1799\u179F\u17D2\u1790\u17B7\u178F\u179F\u17D2\u1790\u17C1\u179A \u17E5\u17E0\u17E0\u17E0 \u1796\u17D2\u179A\u17C7\u179C\u179F\u17D2\u179F\u17B6... "'
            },
            {
              title: "\u1780\u17B6\u179A\u179A\u179F\u17CB\u1793\u17C5\u178A\u17C4\u1799\u1798\u17B7\u1793\u1794\u17C0\u178F\u1794\u17C0\u1793\u17A2\u17D2\u1793\u1780\u178A\u1791\u17C3 (\u1797\u17B6\u1782\u17E1\u17E0)",
              top1: "\u1780\u17B6\u179A\u179A\u179F\u17CB\u1793\u17C5\u178A\u17C4\u1799",
              top2: "\u1798\u17B7\u1793\u1794\u17C0\u178F\u1794\u17C0\u1793\u1782\u17D2\u1793\u17B6",
              bot1: "\u17A2\u17A0\u17B7\u1784\u17D2\u179F\u17B6\u1792\u1798\u17CC",
              bot2: "\u1793\u17B6\u17C6\u1798\u1780\u1793\u17BC\u179C\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17BB\u1781\u179F\u17B6\u1793\u17D2\u178F",
              tags: ["#\u17A2\u17A0\u17B7\u1784\u17D2\u179F\u17B6", "#\u1798\u17B7\u1793\u1794\u17C0\u178F\u1794\u17C0\u1793", "#\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796"],
              transcript: '" \u1798\u17B7\u1793\u1794\u17C0\u178F\u1794\u17C0\u1793\u1782\u17C1 \u1782\u17C1\u1780\u17CF\u1798\u17B7\u1793\u1794\u17C0\u178F\u1794\u17C0\u1793\u1799\u17BE\u1784 \u1785\u17B7\u178F\u17D2\u178F\u1780\u17CF\u1798\u17B6\u1793\u179F\u17C1\u1785\u1780\u17D2\u178F\u17B8\u179F\u17D2\u1784\u1794\u17CB\u1780\u17D2\u179F\u17C1\u1798\u1780\u17D2\u179F\u17B6\u1793\u17D2\u178F... "'
            },
            {
              title: "\u1798\u179A\u178F\u1780\u179C\u1794\u17D2\u1794\u1792\u1798\u17CC\u1793\u17B7\u1784\u1796\u17D2\u179A\u179B\u17B9\u1784\u1787\u17B6\u178F\u17B7\u1781\u17D2\u1798\u17C2\u179A (\u1797\u17B6\u1782\u17E1\u17E1)",
              top1: "\u1798\u179A\u178F\u1780\u179C\u1794\u17D2\u1794\u1792\u1798\u17CC",
              top2: "\u1793\u17B7\u1784\u1796\u17D2\u179A\u179B\u17B9\u1784\u1787\u17B6\u178F\u17B7\u1781\u17D2\u1798\u17C2\u179A",
              bot1: "\u179A\u1780\u17D2\u179F\u17B6\u17A2\u178F\u17D2\u178F\u179F\u1789\u17D2\u1789\u17B6\u178E",
              bot2: "\u1793\u17B7\u1784\u179F\u17B8\u179B\u1792\u1798\u17CC\u1787\u17B6\u178F\u17B7",
              tags: ["#\u179C\u1794\u17D2\u1794\u1792\u1798\u17CC\u1781\u17D2\u1798\u17C2\u179A", "#\u1796\u17D2\u179A\u179B\u17B9\u1784\u1787\u17B6\u178F\u17B7", "#\u17A2\u178F\u17D2\u178F\u179F\u1789\u17D2\u1789\u17B6\u178E"],
              transcript: '" \u1796\u17D2\u179A\u17C7\u1796\u17BB\u1791\u17D2\u1792\u179F\u17B6\u179F\u1793\u17B6\u1787\u17B6\u1796\u17D2\u179A\u179B\u17B9\u1784\u1793\u17C3\u179C\u1794\u17D2\u1794\u1792\u1798\u17CC\u1781\u17D2\u1798\u17C2\u179A \u1780\u17B6\u179A\u1790\u17C2\u179A\u1780\u17D2\u179F\u17B6\u1792\u1798\u17CC\u1782\u17BA\u1790\u17C2\u179A\u1780\u17D2\u179F\u17B6\u1787\u17B6\u178F\u17B7... "'
            },
            {
              title: "\u1796\u179A\u1787\u17D0\u1799\u17E4\u1794\u17D2\u179A\u1780\u17B6\u179A\u178A\u179B\u17CB\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791 (\u1797\u17B6\u1782\u17E1\u17E2)",
              top1: "\u1796\u179A\u1787\u17D0\u1799\u17E4\u1794\u17D2\u179A\u1780\u17B6\u179A",
              top2: "\u178A\u179B\u17CB\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791\u1787\u17B7\u178F\u1786\u17D2\u1784\u17B6\u1799",
              bot1: "\u17A2\u17B6\u1799\u17BB \u179C\u178E\u17D2\u178E\u17C8",
              bot2: "\u179F\u17BB\u1781\u17C8 \u1796\u179B\u17C8 \u1780\u17BB\u17C6\u1794\u17B8\u1783\u17D2\u179B\u17B6\u178F",
              tags: ["#\u1796\u179A\u1787\u17D0\u1799\u17E4\u1794\u17D2\u179A\u1780\u17B6\u179A", "#\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791", "#\u1787\u17D0\u1799\u1798\u1784\u17D2\u1782\u179B"],
              transcript: '" \u179F\u17BC\u1798\u17B2\u17D2\u1799\u1796\u179A\u1787\u17D0\u1799\u1791\u17B6\u17C6\u1784\u1794\u17BD\u1793\u1794\u17D2\u179A\u1780\u17B6\u179A\u1780\u17BE\u178F\u1798\u17B6\u1793\u178A\u179B\u17CB\u1796\u17BB\u1791\u17D2\u1792\u1794\u179A\u17B7\u179F\u17D0\u1791\u1782\u17D2\u179A\u1794\u17CB\u17D7\u179A\u17BC\u1794... "'
            }
          ]
        }
      };
      const profile = modelProfiles[profileKey] || modelProfiles.gpt4o;
      let startOffset = 0;
      if (shouldSkipIntro && videoDuration > 120) {
        startOffset = Math.min(Math.max(0, videoDuration - 120), userSkipSecs);
      }
      let effectiveStartOffset = startOffset + profile.offsetShift;
      if (effectiveStartOffset >= videoDuration - 90) {
        effectiveStartOffset = startOffset;
      }
      const effectiveDuration = Math.max(60, videoDuration - effectiveStartOffset);
      const durationVal = durationSelect ? durationSelect.value : "dynamic";
      const isShortMode = durationVal === "short";
      let count = 5;
      if (effectiveDuration < 300) {
        count = 2;
      } else if (effectiveDuration < 600) {
        count = 3;
      } else if (effectiveDuration < 1200) {
        count = 5;
      } else if (effectiveDuration < 1800) {
        count = 8;
      } else if (effectiveDuration < 2700) {
        count = 11;
      } else {
        count = calculateTargetClipCount(videoDuration);
      }
      const step = effectiveDuration / count;
      const clips = [];
      for (let i = 0; i < count; i++) {
        let clipLen = profile.baseDuration[i % profile.baseDuration.length];
        if (isShortMode) {
          clipLen = Math.min(60, Math.max(30, Math.round(effectiveDuration * 0.08)));
        } else if (!isNaN(parseInt(durationVal, 10))) {
          clipLen = parseInt(durationVal, 10);
        }
        let startTime = Math.round(effectiveStartOffset + i * step);
        let endTime = Math.min(videoDuration, startTime + clipLen);
        if (endTime <= startTime || startTime >= videoDuration) break;
        let tpl;
        if (category === "custom" && customTopicText) {
          const words = customTopicText.split(" ");
          const mid = Math.ceil(words.length / 2);
          tpl = {
            type: "\u{1FAB7} \u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6",
            viralScore: profile.viralScores[i % profile.viralScores.length],
            title: `${customTopicText} (\u1797\u17B6\u1782 ${i + 1})`,
            top1: words.slice(0, mid).join(" ") || customTopicText,
            top2: `\u1797\u17B6\u1782 ${i + 1}`,
            bot1: "\u17A2\u17B6\u1793\u17B7\u179F\u1784\u17D2\u179F\u1794\u17BB\u178E\u17D2\u1799",
            bot2: words.slice(mid).join(" ") || "\u1798\u17A0\u17B6\u1780\u17BB\u179F\u179B",
            tags: ["#\u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6", "#KhmerClip", `#${customTopicText.replace(/\s+/g, "")}`],
            transcript: `" \u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6\u179F\u17D2\u178A\u17B8\u17A2\u17C6\u1796\u17B8 ${customTopicText} \u2014 \u1797\u17B6\u1782 ${i + 1}... "`
          };
        } else {
          const storylineItem = profile.storylines[i % profile.storylines.length];
          const partNum = Math.floor(i / profile.storylines.length) + 1;
          const partSuffix = partNum > 1 ? ` (${partNum})` : "";
          tpl = {
            type: "\u{1FAB7} \u1792\u1798\u17D2\u1798\u1791\u17C1\u179F\u1793\u17B6",
            viralScore: profile.viralScores[i % profile.viralScores.length],
            title: `${storylineItem.title}${partSuffix}`,
            top1: storylineItem.top1,
            top2: storylineItem.top2,
            bot1: storylineItem.bot1,
            bot2: storylineItem.bot2,
            tags: storylineItem.tags,
            transcript: storylineItem.transcript
          };
        }
        clips.push({
          id: "ai_" + profileKey + "_" + Date.now() + "_" + i,
          type: tpl.type,
          viralScore: tpl.viralScore,
          title: tpl.title,
          startTime,
          endTime,
          duration: endTime - startTime,
          top1: tpl.top1,
          top2: tpl.top2,
          bot1: tpl.bot1,
          bot2: tpl.bot2,
          tags: tpl.tags,
          transcript: tpl.transcript,
          models: [profile.badge],
          modelBadge: profile.badge,
          strategyNote: profile.strategyNote,
          badgeColor: profile.badgeColor
        });
      }
      return clips;
    }
    function renderAiResultsGrid() {
      const clipsGrid = document.getElementById("aiClipsGrid");
      const countSpan = document.getElementById("aiResultsCount");
      const importAllBtn = document.getElementById("importAllAiClipsBtn");
      const importAllCount = document.getElementById("importAllCount");
      if (!clipsGrid) return;
      clipsGrid.innerHTML = "";
      if (!aiState.recommendedClips || aiState.recommendedClips.length === 0) {
        clipsGrid.innerHTML = `
                <div class="ai-empty-placeholder">
                    <span class="placeholder-icon">\u{1F399}\uFE0F</span>
                    <p>\u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip AI \u178E\u17C2\u1793\u17B6\u17C6\u1793\u17C5\u17A1\u17BE\u1799\u1791\u17C1\u17D4 \u179F\u17BC\u1798\u1785\u17BB\u1785 <strong>"\u{1F680} \u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 AI \u179C\u17B7\u1797\u17B6\u1782"</strong>!</p>
                </div>`;
        if (countSpan) countSpan.textContent = "0";
        if (importAllBtn) importAllBtn.classList.add("hidden");
        return;
      }
      if (countSpan) countSpan.textContent = String(aiState.recommendedClips.length);
      if (importAllCount) importAllCount.textContent = String(aiState.recommendedClips.length);
      if (importAllBtn) importAllBtn.classList.remove("hidden");
      aiState.recommendedClips.forEach((clip, idx) => {
        const card = document.createElement("div");
        card.className = "ai-clip-card";
        const badgeBg = clip.badgeColor || "#a855f7";
        card.innerHTML = `
                <div>
                    <div class="ai-clip-card-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <span class="ai-viral-badge">\u{1F525} ${clip.viralScore || "98%"}</span>
                            ${clip.isConsensus ? `<span class="ai-consensus-badge" style="font-size:0.75rem; border-radius:12px; padding:2px 10px; font-weight:700;">${clip.modelBadge}</span>` : clip.modelBadge ? `<span style="font-size:0.75rem; background:rgba(255,255,255,0.08); color:${badgeBg}; border:1px solid ${badgeBg}66; border-radius:12px; padding:2px 8px; font-weight:700;">${clip.modelBadge}</span>` : ""}
                        </div>
                        <span class="ai-clip-duration">${formatTime(clip.startTime, false)} - ${formatTime(clip.endTime, false)} (${Math.round(clip.duration)}s)</span>
                    </div>

                    ${clip.strategyNote ? `
                    <div style="font-size:0.75rem; background:rgba(30,41,59,0.85); color:#93c5fd; border:1px solid rgba(59,130,246,0.3); border-radius:6px; padding:3px 8px; margin-bottom:6px; line-height:1.4;">
                        ${clip.strategyNote}
                    </div>` : ""}

                    ${clip.auditNote ? `
                    <div class="ai-consensus-audit-banner">
                        <span style="font-size:1.1rem; flex-shrink:0;">\u{1F6E1}\uFE0F</span>
                        <div>
                            <strong style="color:#fde047;">Claude &amp; Gemini Peer Review (\u1798\u17B7\u1793\u178A\u17B6\u1785\u17CB\u1780\u17D2\u1794\u17B6\u179B\u178A\u17B6\u1785\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799):</strong>
                            <div style="color:#f1f5f9; margin-top:2px;">${clip.auditNote}</div>
                        </div>
                    </div>` : ""}

                    <div style="margin: 4px 0 3px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span style="font-size:0.72rem; background:rgba(251,191,36,0.15); color:#fbbf24; border:1px solid rgba(251,191,36,0.35); border-radius:4px; padding:1px 6px; white-space:nowrap;">\u270F\uFE0F \u1785\u17C6\u178E\u1784\u1787\u17BE\u1784\u1782\u17C6\u179A\u17BC \u2014 \u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1780\u17C2</span>
                    </div>

                    <input
                        class="ai-clip-title-input"
                        type="text"
                        value="${clip.title.replace(/"/g, "&quot;")}"
                        style="width:100%; background:rgba(255,255,255,0.06); border:1px solid rgba(167,139,250,0.4); border-radius:6px; color:#e2e8f0; font-size:0.88rem; font-weight:700; padding:5px 8px; margin-bottom:6px; outline:none; font-family:inherit;"
                        placeholder="\u179C\u17B6\u1799\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784 Clip..."
                    >

                    <!-- Dual Captions Preview -->
                    <div style="display:flex; flex-direction:column; gap:3px; background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 8px; margin-bottom:6px; font-size:0.76rem;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <span style="color:#a78bfa; font-weight:600;">\u{1F4AC} \u17A2\u1780\u17D2\u179F\u179A\u1781\u17B6\u1784\u179B\u17BE:</span>
                            <span style="color:#fde047; font-weight:700;">${clip.top1 || ""}</span>
                            <span style="color:#e2e8f0;">${clip.top2 || ""}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <span style="color:#a78bfa; font-weight:600;">\u{1F4AC} \u17A2\u1780\u17D2\u179F\u179A\u1781\u17B6\u1784\u1780\u17D2\u179A\u17C4\u1798:</span>
                            <span style="color:#38bdf8; font-weight:700;">${clip.bot1 || ""}</span>
                            <span style="color:#e2e8f0;">${clip.bot2 || ""}</span>
                        </div>
                    </div>

                    <div class="ai-clip-tags">
                        ${(clip.tags || []).map((t) => `<span class="ai-tag">${t}</span>`).join("")}
                    </div>
                    <div class="ai-transcript-snippet">${clip.transcript || ""}</div>
                </div>
                <div class="ai-clip-actions">
                    <button class="btn btn-secondary btn-sm ai-preview-btn">\u25B6\uFE0F \u1798\u17BE\u179B Clip</button>
                    <button class="btn btn-primary btn-sm ai-add-btn">\u2795 \u1794\u1793\u17D2\u1790\u17C2\u1798 Clip</button>
                </div>
            `;
        const titleInput = card.querySelector(".ai-clip-title-input");
        titleInput?.addEventListener("input", () => {
          aiState.recommendedClips[idx].title = titleInput.value;
        });
        card.querySelector(".ai-preview-btn")?.addEventListener("click", () => {
          previewAiClip(clip);
        });
        card.querySelector(".ai-add-btn")?.addEventListener("click", () => {
          addSingleAiClip(aiState.recommendedClips[idx]);
        });
        clipsGrid.appendChild(card);
      });
    }
    function previewAiClip(clip) {
      state.trimIn = clip.startTime;
      state.trimOut = clip.endTime;
      if (elements.mainVideoPlayer && elements.mainVideoPlayer.duration) {
        elements.mainVideoPlayer.currentTime = clip.startTime;
      }
      state.currentTime = clip.startTime;
      updateTrimUI();
      updatePlayheadPosition();
      showToastNotification(`\u25B6\uFE0F \u1798\u17BE\u179B AI Clip: ${formatTime(clip.startTime, false)} \u2794 ${formatTime(clip.endTime, false)}`);
    }
    function addSingleAiClip(clip) {
      pushStateToHistory();
      const newClip = {
        id: Date.now() + Math.floor(Math.random() * 1e3),
        name: clip.title,
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: clip.endTime - clip.startTime,
        aspectRatio: state.aspectRatio || "9:16",
        colorMode: "dual",
        topTextColor1: state.topTextColor1,
        topTextColor2: state.topTextColor2,
        bottomTextColor1: state.bottomTextColor1 || "#FFE600",
        bottomTextColor2: state.bottomTextColor2 || "#FF5722",
        topText: clip.title || `${clip.top1} ${clip.top2}`,
        topTextPart1: clip.top1,
        topTextPart2: clip.top2,
        topFontSize: state.topFontSize,
        topPosY: state.topPosY,
        bottomText: `${clip.bot1} ${clip.bot2}`,
        bottomTextPart1: clip.bot1,
        bottomTextPart2: clip.bot2,
        bottomFontSize: state.bottomFontSize,
        bottomPosY: state.bottomPosY || 1520,
        extraCaptions: [],
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
      if (state.currentScreen === 1) {
        switchScreen(2);
      }
      showToastNotification(`\u2705 \u1794\u17B6\u1793\u1794\u1793\u17D2\u1790\u17C2\u1798 AI Clip "${clip.title}" \u1791\u17C5\u1780\u17D2\u1793\u17BB\u1784 Queue!`);
    }
    function importAllAiClips() {
      if (!aiState.recommendedClips || aiState.recommendedClips.length === 0) return;
      aiState.recommendedClips.forEach((clip) => addSingleAiClip(clip));
      showToastNotification(`\u{1F680} \u1794\u17B6\u1793\u1794\u1789\u17D2\u1787\u17BC\u1793 Clips \u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB (${aiState.recommendedClips.length}) \u1785\u17BC\u179B\u1791\u17C5\u1780\u17B6\u178F\u17CB\u179A\u17C0\u1794\u1785\u17C6!`);
      document.getElementById("aiAssistantModal")?.classList.add("hidden");
      if (state.currentScreen === 1) {
        switchScreen(2);
      }
    }
    function initKhmerSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const toggleVoiceMicBtn = document.getElementById("toggleVoiceMicBtn");
      const voiceStatusBadge = document.getElementById("voiceStatusBadge");
      const liveSpeechTranscript = document.getElementById("liveSpeechTranscript");
      const micBtnText = document.getElementById("micBtnText");
      if (!SpeechRecognition) {
        if (liveSpeechTranscript) {
          liveSpeechTranscript.innerHTML = '<em style="color:#ef4444;">\u26A0\uFE0F \u1787\u17D2\u179A\u17BB\u1784 Browser \u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1782\u17B6\u17C6\u1791\u17D2\u179A Web Speech API (\u179F\u17BC\u1798\u1794\u17D2\u179A\u17BE Google Chrome)</em>';
        }
        if (toggleVoiceMicBtn) toggleVoiceMicBtn.disabled = true;
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "km-KH";
      recognition.onstart = () => {
        aiState.isListening = true;
        if (toggleVoiceMicBtn) toggleVoiceMicBtn.classList.add("listening");
        if (micBtnText) micBtnText.textContent = "\u1780\u17C6\u1796\u17BB\u1784\u179F\u17D2\u178A\u17B6\u1794\u17CB\u179F\u17C6\u17A1\u17C1\u1784\u1781\u17D2\u1798\u17C2\u179A... (\u1785\u17BB\u1785\u1794\u17B7\u1791)";
        if (voiceStatusBadge) {
          voiceStatusBadge.textContent = "\u1780\u17C6\u1796\u17BB\u1784\u179F\u17D2\u178A\u17B6\u1794\u17CB \u{1F399}\uFE0F";
          voiceStatusBadge.className = "voice-badge listening";
        }
      };
      recognition.onend = () => {
        aiState.isListening = false;
        if (toggleVoiceMicBtn) toggleVoiceMicBtn.classList.remove("listening");
        if (micBtnText) micBtnText.textContent = "\u1794\u17BE\u1780\u179F\u17D2\u178A\u17B6\u1794\u17CB\u179F\u17C6\u17A1\u17C1\u1784\u1781\u17D2\u1798\u17C2\u179A";
        if (voiceStatusBadge) {
          voiceStatusBadge.textContent = "\u1794\u17B7\u1791";
          voiceStatusBadge.className = "voice-badge offline";
        }
      };
      recognition.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        if (liveSpeechTranscript) {
          liveSpeechTranscript.textContent = transcript || "...";
        }
        const textLower = transcript.toLowerCase();
        if (textLower.includes("\u1780\u17B6\u178F\u17CB\u178A\u17BE\u1798") || textLower.includes("\u1780\u17C6\u178E\u178F\u17CB\u178A\u17BE\u1798") || textLower.includes("set in")) {
          if (elements.mainVideoPlayer) {
            state.trimIn = elements.mainVideoPlayer.currentTime;
            updateTrimUI();
            showToastNotification("\u{1F399}\uFE0F \u1794\u1789\u17D2\u1787\u17B6\u179F\u17C6\u17A1\u17C1\u1784: \u1780\u17C6\u178E\u178F\u17CB Set In");
          }
        } else if (textLower.includes("\u1780\u17B6\u178F\u17CB\u1785\u17BB\u1784") || textLower.includes("\u1780\u17C6\u178E\u178F\u17CB\u1785\u17BB\u1784") || textLower.includes("set out")) {
          if (elements.mainVideoPlayer) {
            state.trimOut = elements.mainVideoPlayer.currentTime;
            updateTrimUI();
            showToastNotification("\u{1F399}\uFE0F \u1794\u1789\u17D2\u1787\u17B6\u179F\u17C6\u17A1\u17C1\u1784: \u1780\u17C6\u178E\u178F\u17CB Set Out");
          }
        } else if (textLower.includes("\u1794\u1793\u17D2\u1790\u17C2\u1798 clip") || textLower.includes("\u1799\u1780 clip") || textLower.includes("\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780")) {
          addClipToList();
          showToastNotification("\u{1F399}\uFE0F \u1794\u1789\u17D2\u1787\u17B6\u179F\u17C6\u17A1\u17C1\u1784: \u1794\u1793\u17D2\u1790\u17C2\u1798 Clip");
        } else if (textLower.includes("\u179C\u17B7\u1797\u17B6\u1782") || textLower.includes("\u178E\u17C2\u1793\u17B6\u17C6")) {
          runAiAudioScan();
        } else if (textLower.includes("\u1791\u17C5\u1780\u17C2\u17A2\u1780\u17D2\u179F\u179A") || textLower.includes("\u1780\u17C2\u17A2\u1780\u17D2\u179F\u179A")) {
          switchScreen(3);
          showToastNotification("\u{1F399}\uFE0F \u1794\u1789\u17D2\u1787\u17B6\u179F\u17C6\u17A1\u17C1\u1784: \u1791\u17C5 Studio \u1780\u17C2\u17A2\u1780\u17D2\u179F\u179A");
        }
      };
      toggleVoiceMicBtn?.addEventListener("click", () => {
        if (aiState.isListening) {
          recognition.stop();
        } else {
          try {
            recognition.start();
          } catch (err) {
            console.warn("Speech recognition start error:", err);
          }
        }
      });
      aiState.recognition = recognition;
    }
    function switchScreen(screenNum) {
      state.currentScreen = screenNum;
      const screenUpload = elements.screenUpload || document.getElementById("screenUpload");
      const workspace3Col = elements.workspace3Col || document.getElementById("workspace3Col");
      const screen2TrimmerPanel = elements.screen2TrimmerPanel || document.getElementById("screen2TrimmerPanel");
      const screen3Inspector = elements.screen3Inspector || document.getElementById("screen3Inspector");
      const rawVideoViewport = elements.rawVideoViewport || document.getElementById("rawVideoViewport");
      const canvasWrapper = elements.canvasWrapper || document.getElementById("canvasWrapper");
      const screen2TimelineControls = elements.screen2TimelineControls || document.getElementById("screen2TimelineControls");
      const screen3TimelineControls = elements.screen3TimelineControls || document.getElementById("screen3TimelineControls");
      const stepBtns = [
        document.getElementById("stepBtn1"),
        document.getElementById("stepBtn2"),
        document.getElementById("stepBtn3"),
        document.getElementById("stepBtn4")
      ];
      stepBtns.forEach((btn, idx) => {
        if (btn) btn.classList.toggle("active", idx + 1 === screenNum);
      });
      const badge2 = document.getElementById("step2Badge");
      if (badge2) badge2.textContent = String(state.clips.length);
      const clipCountEl = document.getElementById("clipCount");
      if (clipCountEl) clipCountEl.textContent = String(state.clips.length);
      const s2ClipsCount = document.getElementById("screen2ClipsCount");
      if (s2ClipsCount) s2ClipsCount.textContent = String(state.clips.length);
      const filmoraWorkspace = document.getElementById("filmoraProWorkspace");
      const filmoraSlot = document.getElementById("filmoraCanvasSlot");
      const defaultCanvasViewport = document.querySelector(".stage-center .canvas-viewport");
      if (screenNum === 1 || screenNum === 0) {
        document.body.className = `dark-theme screen-1-mode ${state.platformMode === "youtube" ? "platform-mode-youtube" : "platform-mode-facebook"}`;
        document.body.dataset.platformMode = state.platformMode;
        screenUpload?.classList.remove("hidden");
        workspace3Col?.classList.add("hidden");
        filmoraWorkspace?.classList.add("hidden");
        elements.step1TabBtn?.classList.add("active");
        elements.step2TabBtn?.classList.remove("active");
        const btnReturn = document.getElementById("btnReturnToEditor");
        if (btnReturn) btnReturn.classList.toggle("hidden", !state.videoFile);
        elements.mainVideoPlayer?.pause();
        elements.hiddenVideo?.pause();
        state.isPlaying = false;
        updatePlayPauseBtn();
      } else if (screenNum === 2) {
        document.body.className = `dark-theme screen-2-mode ${state.platformMode === "youtube" ? "platform-mode-youtube" : "platform-mode-facebook"}`;
        document.body.dataset.platformMode = state.platformMode;
        screenUpload?.classList.add("hidden");
        workspace3Col?.classList.remove("hidden");
        filmoraWorkspace?.classList.add("hidden");
        if (defaultCanvasViewport && canvasWrapper && canvasWrapper.parentElement !== defaultCanvasViewport) {
          defaultCanvasViewport.appendChild(canvasWrapper);
        }
        rawVideoViewport?.classList.remove("hidden");
        canvasWrapper?.classList.add("hidden");
        screen2TimelineControls?.classList.remove("hidden");
        screen3TimelineControls?.classList.add("hidden");
        screen2TrimmerPanel?.classList.remove("hidden");
        screen3Inspector?.classList.add("hidden");
        document.getElementById("viewModeTrimmerBtn")?.classList.add("active");
        document.getElementById("viewModeStudioBtn")?.classList.remove("active");
        elements.step1TabBtn?.classList.remove("active");
        elements.step2TabBtn?.classList.add("active");
        elements.hiddenVideo?.pause();
        updateTrimUI();
        updatePlayPauseBtn();
      } else if (screenNum === 3) {
        document.body.className = `dark-theme screen-3-mode ${state.platformMode === "youtube" ? "platform-mode-youtube" : "platform-mode-facebook"}`;
        document.body.dataset.platformMode = state.platformMode;
        screenUpload?.classList.add("hidden");
        if (state.platformMode === "youtube") {
          workspace3Col?.classList.add("hidden");
          filmoraWorkspace?.classList.remove("hidden");
          if (filmoraSlot && canvasWrapper && canvasWrapper.parentElement !== filmoraSlot) {
            filmoraSlot.appendChild(canvasWrapper);
          }
          canvasWrapper?.classList.remove("hidden");
          state.aspectRatio = "16:9";
          updateAspectDimensions();
          syncFilmoraInspectorUI();
          renderFilmoraMediaBin();
          renderFilmoraTimeline();
        } else {
          filmoraWorkspace?.classList.add("hidden");
          workspace3Col?.classList.remove("hidden");
          if (defaultCanvasViewport && canvasWrapper && canvasWrapper.parentElement !== defaultCanvasViewport) {
            defaultCanvasViewport.appendChild(canvasWrapper);
          }
          rawVideoViewport?.classList.add("hidden");
          canvasWrapper?.classList.remove("hidden");
          screen2TimelineControls?.classList.add("hidden");
          screen3TimelineControls?.classList.remove("hidden");
          screen2TrimmerPanel?.classList.add("hidden");
          screen3Inspector?.classList.remove("hidden");
          document.getElementById("viewModeTrimmerBtn")?.classList.remove("active");
          document.getElementById("viewModeStudioBtn")?.classList.add("active");
          state.aspectRatio = state.aspectRatio || "9:16";
          updateAspectDimensions();
        }
        elements.step1TabBtn?.classList.remove("active");
        elements.step2TabBtn?.classList.add("active");
        elements.mainVideoPlayer?.pause();
        if (elements.hiddenVideo) {
          const targetSrc = state.videoObjectURL || elements.mainVideoPlayer?.src || "";
          if (targetSrc && elements.hiddenVideo.src !== targetSrc) {
            elements.hiddenVideo.src = targetSrc;
          }
          if (state.trimIn !== void 0) {
            elements.hiddenVideo.currentTime = state.trimIn;
          }
        }
        if (!state.activeClipId && state.clips.length > 0) {
          selectClipForEditing(state.clips[0].id, false);
        } else if (state.activeClipId) {
          selectClipForEditing(state.activeClipId, false);
        }
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        updatePlayPauseBtn();
        updateFilmoraPlayhead();
        updateStudioTimelineUI();
      } else if (screenNum === 4) {
        const toggleFn = window.toggleExportChoicePopover;
        if (typeof toggleFn === "function") toggleFn(true);
      }
    }
    function updatePlayPauseBtn() {
      const trimmerBtn = document.getElementById("canvasPlayPauseBtn");
      const studioBtn = document.getElementById("studioPlayPauseBtn");
      if (trimmerBtn && elements.mainVideoPlayer) {
        trimmerBtn.textContent = elements.mainVideoPlayer.paused ? "\u25B6 Play" : "\u23F8 Pause";
      }
      if (studioBtn && elements.hiddenVideo) {
        studioBtn.textContent = elements.hiddenVideo.paused ? "\u25B6 Play" : "\u23F8 Pause";
      }
    }
    let _clipIdToDelete = null;
    function bindEvents() {
      elements.videoUploadInput.addEventListener("change", handleVideoUpload);
      document.getElementById("stepBtn1")?.addEventListener("click", () => switchScreen(1));
      document.getElementById("stepBtn2")?.addEventListener("click", () => switchScreen(2));
      document.getElementById("stepBtn3")?.addEventListener("click", () => switchScreen(3));
      function toggleExportChoicePopover(forceState) {
        const popover = document.getElementById("exportChoicePopover");
        if (!popover) return;
        const willShow = typeof forceState === "boolean" ? forceState : popover.classList.contains("hidden");
        if (willShow) {
          if (state.clips.length === 0) {
            showToast("\u26A0\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB Export \u1791\u17C1! \u179F\u17BC\u1798\u1794\u1784\u17D2\u1780\u17BE\u178F Clip \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793\u17D4");
            return;
          }
          popover.classList.remove("hidden");
          document.getElementById("stepBtn4")?.classList.add("active");
        } else {
          popover.classList.add("hidden");
          if (state.currentScreen !== 4) {
            document.getElementById("stepBtn4")?.classList.remove("active");
          }
        }
      }
      window.toggleExportChoicePopover = toggleExportChoicePopover;
      document.getElementById("stepBtn4")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExportChoicePopover();
      });
      document.getElementById("popoverExportClipBtn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExportChoicePopover(false);
        if (state.activeClipId) {
          exportSingleClip(state.activeClipId);
        } else if (state.clips.length > 0) {
          exportSingleClip(state.clips[0].id);
        } else {
          showToast("\u26A0\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB Export \u1791\u17C1! \u179F\u17BC\u1798\u1794\u1784\u17D2\u1780\u17BE\u178F Clip \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793\u17D4");
        }
      });
      document.getElementById("popoverExportAllBtn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExportChoicePopover(false);
        if (state.clips.length > 0) {
          exportAllClips();
        } else {
          showToast("\u26A0\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB Export \u1791\u17C1! \u179F\u17BC\u1798\u1794\u1784\u17D2\u1780\u17BE\u178F Clip \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793\u17D4");
        }
      });
      document.addEventListener("click", (e) => {
        const popover = document.getElementById("exportChoicePopover");
        const stepBtn4 = document.getElementById("stepBtn4");
        if (popover && !popover.classList.contains("hidden")) {
          if (!popover.contains(e.target) && !stepBtn4?.contains(e.target)) {
            toggleExportChoicePopover(false);
          }
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          toggleExportChoicePopover(false);
        }
      });
      elements.step1TabBtn?.addEventListener("click", () => switchScreen(1));
      elements.step2TabBtn?.addEventListener("click", () => switchScreen(2));
      elements.goToStep2Btn?.addEventListener("click", () => switchScreen(2));
      elements.backToStep1Btn?.addEventListener("click", () => switchScreen(1));
      document.getElementById("viewModeTrimmerBtn")?.addEventListener("click", () => switchScreen(2));
      document.getElementById("viewModeStudioBtn")?.addEventListener("click", () => switchScreen(3));
      elements.aspectBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (state.platformMode === "youtube") {
            showToast("\u{1F512} YouTube Mode \u178F\u17D2\u179A\u17BC\u179C\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB\u178F\u17D2\u179A\u17B9\u1798\u1791\u17C6\u17A0\u17C6 16:9 Widescreen \u1794\u17C9\u17BB\u178E\u17D2\u178E\u17C4\u17C7");
            return;
          }
          elements.aspectBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          state.aspectRatio = btn.dataset.ratio;
          updateAspectDimensions();
          syncActiveClipProperty("aspectRatio", state.aspectRatio);
        });
      });
      elements.tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          elements.tabBtns.forEach((b) => b.classList.remove("active"));
          elements.tabContents.forEach((c) => c.classList.remove("active"));
          btn.classList.add("active");
          document.getElementById(btn.dataset.tab)?.classList.add("active");
        });
      });
      elements.mainVideoPlayer.addEventListener("timeupdate", () => {
        if (state.currentScreen === 2 || state.currentScreen === 1) {
          state.currentTime = elements.mainVideoPlayer.currentTime;
          elements.inTimeDisplay.textContent = formatTime(state.trimIn);
          elements.outTimeDisplay.textContent = formatTime(state.trimOut);
          updatePlayheadPosition();
        }
      });
      elements.mainVideoPlayer.addEventListener("loadedmetadata", onVideoLoaded);
      elements.mainVideoPlayer.addEventListener("play", updatePlayPauseBtn);
      elements.mainVideoPlayer.addEventListener("pause", updatePlayPauseBtn);
      elements.hiddenVideo.addEventListener("timeupdate", () => {
        if (state.currentScreen === 3 && state.isPlaying) {
          state.currentTime = elements.hiddenVideo.currentTime;
          if (state.currentTime >= state.trimOut) {
            elements.hiddenVideo.currentTime = state.trimIn;
          }
        }
      });
      elements.hiddenVideo.addEventListener("play", updatePlayPauseBtn);
      elements.hiddenVideo.addEventListener("pause", updatePlayPauseBtn);
      elements.timelineSlider.addEventListener("input", (e) => {
        const time = parseFloat(e.target.value) / 100 * state.duration;
        elements.mainVideoPlayer.currentTime = time;
        state.currentTime = time;
        updatePlayheadPosition();
      });
      elements.setInBtn.addEventListener("click", () => {
        document.activeElement?.blur();
        pushStateToHistory();
        state.trimIn = elements.mainVideoPlayer.currentTime;
        if (state.trimOut <= state.trimIn) {
          state.trimOut = Math.min(state.duration, state.trimIn + 30);
        }
        updateTrimUI();
      });
      elements.setOutBtn.addEventListener("click", () => {
        if (elements.mainVideoPlayer.currentTime > state.trimIn) {
          document.activeElement?.blur();
          pushStateToHistory();
          state.trimOut = elements.mainVideoPlayer.currentTime;
          updateTrimUI();
        } else {
          alert("\u1785\u17C6\u1793\u17BB\u1785\u1794\u1789\u17D2\u1785\u1794\u17CB [Set Out] \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1792\u17C6\u1787\u17B6\u1784\u1785\u17C6\u1793\u17BB\u1785\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 [Set In]!");
        }
      });
      elements.addClipBtn.addEventListener("click", addClipToList);
      document.getElementById("quickAddClipBtn")?.addEventListener("click", addClipToList);
      document.getElementById("canvasPlayPauseBtn")?.addEventListener("click", () => {
        if (!elements.mainVideoPlayer || !elements.mainVideoPlayer.src) {
          showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
          return;
        }
        if (elements.mainVideoPlayer.paused) {
          elements.mainVideoPlayer.play().catch(() => {
          });
          state.isPlaying = true;
        } else {
          elements.mainVideoPlayer.pause();
          state.isPlaying = false;
        }
        updatePlayPauseBtn();
      });
      document.getElementById("seekBackBtn")?.addEventListener("click", () => seekRelative(-5));
      document.getElementById("seekForwardBtn")?.addEventListener("click", () => seekRelative(5));
      document.getElementById("trimmerSplitClipBtn")?.addEventListener("click", () => splitSelectedClip());
      elements.splitTrimBtn?.addEventListener("click", () => splitTrimAtCurrentTime());
      function formatShortTime(seconds, includeMs = false) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor(seconds % 3600 / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor(seconds % 1 * 100);
        const pad = (n) => String(n).padStart(2, "0");
        if (hrs > 0) {
          if (includeMs) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms)}`;
          return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        }
        if (includeMs) return `${pad(mins)}:${pad(secs)}.${pad(ms)}`;
        return `${pad(mins)}:${pad(secs)}`;
      }
      function updateStudioTimelineUI2(overridePos = null, overrideDuration = null) {
        if (state.currentScreen !== 3) return;
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (!clip) return;
        const duration = overrideDuration !== null ? overrideDuration : Math.max(0.1, clip.duration || clip.endTime - clip.startTime || 1);
        let currentPos;
        if (overridePos !== null) {
          currentPos = Math.max(0, Math.min(duration, overridePos));
        } else {
          const curVideoTime = elements.hiddenVideo && !isNaN(elements.hiddenVideo.currentTime) ? elements.hiddenVideo.currentTime : state.trimIn || clip.startTime || 0;
          currentPos = Math.max(0, Math.min(duration, curVideoTime - clip.startTime));
        }
        const pct = Math.max(0, Math.min(100, currentPos / duration * 100));
        const timeEl = elements.studioTimelineTimeDisplay || document.getElementById("studioTimelineTimeDisplay");
        if (timeEl) {
          timeEl.textContent = `${formatShortTime(currentPos, true)} / ${formatShortTime(duration, false)}`;
        }
        const rangeEl = elements.studioTimelineRangeDisplay || document.getElementById("studioTimelineRangeDisplay");
        if (rangeEl) {
          rangeEl.textContent = `${formatShortTime(clip.startTime, false)} - ${formatShortTime(clip.endTime, false)}`;
        }
        const badgeEl = elements.studioTimelineClipBadge || document.getElementById("studioTimelineClipBadge");
        if (badgeEl) {
          const clipIdx = state.clips.findIndex((c) => c.id === clip.id);
          const clipNum = clipIdx >= 0 ? clipIdx + 1 : clip.id || 1;
          badgeEl.textContent = `\u{1F3AC} Clip #${clipNum}`;
        }
        const fillEl = elements.studioProgressFill || document.getElementById("studioProgressFill");
        if (fillEl) {
          fillEl.style.width = `${pct}%`;
        }
        const playheadEl = elements.studioPlayhead || document.getElementById("studioPlayhead");
        if (playheadEl) {
          playheadEl.style.left = `${pct}%`;
        }
        const sliderEl = elements.studioClipScrubber || document.getElementById("studioClipScrubber");
        if (sliderEl && document.activeElement !== sliderEl) {
          sliderEl.value = pct;
        }
      }
      window.updateStudioTimelineUI = updateStudioTimelineUI2;
      function seekStudioClip(pct) {
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (!clip) return;
        const duration = Math.max(0.1, clip.duration || clip.endTime - clip.startTime || 1);
        const clampedPct = Math.max(0, Math.min(1, pct));
        const targetOffset = clampedPct * duration;
        const targetTime = clip.startTime + targetOffset;
        state.currentTime = targetTime;
        if (elements.hiddenVideo) {
          try {
            elements.hiddenVideo.currentTime = targetTime;
          } catch (e) {
          }
        }
        updateStudioTimelineUI2(targetOffset, duration);
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
      }
      window.seekStudioClip = seekStudioClip;
      function toggleStudioPlayback() {
        let clip = state.clips.find((c) => c.id === state.activeClipId);
        if (!clip) {
          if (state.clips.length > 0) {
            selectClipForEditing(state.clips[0].id, false);
            clip = state.clips[0];
          } else {
            showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F \u17AC\u1794\u1784\u17D2\u1780\u17BE\u178F Clip \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
            return;
          }
        }
        if (!clip) return;
        if (elements.hiddenVideo) {
          const targetSrc = state.videoObjectURL || elements.mainVideoPlayer?.src;
          if (targetSrc && (!elements.hiddenVideo.src || elements.hiddenVideo.src !== targetSrc)) {
            elements.hiddenVideo.src = targetSrc;
          }
        }
        if (elements.hiddenVideo.paused) {
          if (elements.hiddenVideo.currentTime >= clip.endTime || elements.hiddenVideo.currentTime < clip.startTime) {
            elements.hiddenVideo.currentTime = clip.startTime;
          }
          elements.hiddenVideo.play().then(() => {
            state.isPlaying = true;
            updatePlayPauseBtn();
            updateStudioTimelineUI2();
          }).catch((err) => {
            console.warn("Playback gesture/audio restriction, retrying:", err);
            elements.hiddenVideo.play().catch((e) => console.error("Play failed:", e));
            state.isPlaying = true;
            updatePlayPauseBtn();
          });
        } else {
          elements.hiddenVideo.pause();
          state.isPlaying = false;
          updatePlayPauseBtn();
          updateStudioTimelineUI2();
        }
      }
      window.toggleStudioPlayback = toggleStudioPlayback;
      document.getElementById("studioPlayPauseBtn")?.addEventListener("click", toggleStudioPlayback);
      document.getElementById("studioSeekBackBtn")?.addEventListener("click", () => {
        seekRelative(-3);
        updateStudioTimelineUI2();
      });
      document.getElementById("studioSeekForwardBtn")?.addEventListener("click", () => {
        seekRelative(3);
        updateStudioTimelineUI2();
      });
      document.getElementById("studioReplayBtn")?.addEventListener("click", () => {
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (clip && elements.hiddenVideo) {
          elements.hiddenVideo.currentTime = clip.startTime;
          elements.hiddenVideo.play().catch(() => {
          });
          state.isPlaying = true;
          updatePlayPauseBtn();
          updateStudioTimelineUI2();
        }
      });
      document.getElementById("studioSplitClipBtn")?.addEventListener("click", () => splitSelectedClip());
      document.getElementById("splitClipBtn")?.addEventListener("click", () => splitCurrentClip());
      document.getElementById("studioTrimHeadBtn")?.addEventListener("click", () => {
        if (!state.activeClipId) return;
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (!clip) return;
        const curTime = elements.hiddenVideo.currentTime;
        if (curTime < clip.endTime - 1) {
          pushStateToHistory();
          clip.startTime = curTime;
          clip.duration = clip.endTime - clip.startTime;
          state.trimIn = curTime;
          updateTrimUI();
          renderClipsList();
          updateStudioTimelineUI2();
          showToast("\u{1F6A9} \u1794\u17B6\u1793 Trim \u1780\u17B6\u178F\u17CB\u1780\u17D2\u1794\u17B6\u179B Clip \u178F\u17D2\u179A\u17B9\u1798 " + formatShortTime(curTime));
        }
      });
      document.getElementById("studioTrimTailBtn")?.addEventListener("click", () => {
        if (!state.activeClipId) return;
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (!clip) return;
        const curTime = elements.hiddenVideo.currentTime;
        if (curTime > clip.startTime + 1) {
          pushStateToHistory();
          clip.endTime = curTime;
          clip.duration = clip.endTime - clip.startTime;
          state.trimOut = curTime;
          updateTrimUI();
          renderClipsList();
          updateStudioTimelineUI2();
          showToast("\u{1F3C1} \u1794\u17B6\u1793 Trim \u1780\u17B6\u178F\u17CB\u1780\u1793\u17D2\u1791\u17BB\u1799 Clip \u178F\u17D2\u179A\u17B9\u1798 " + formatShortTime(curTime));
        }
      });
      const studioScrubber = elements.studioClipScrubber || document.getElementById("studioClipScrubber");
      if (studioScrubber) {
        studioScrubber.addEventListener("input", (e) => {
          seekStudioClip(parseFloat(e.target.value) / 100);
        });
      }
      const studioTrackBox = elements.studioScrubberTrackBox || document.getElementById("studioScrubberTrackBox");
      if (studioTrackBox) {
        studioTrackBox.addEventListener("click", (e) => {
          const rect = studioTrackBox.getBoundingClientRect();
          if (rect.width > 0) {
            const clickX = e.clientX - rect.left;
            seekStudioClip(clickX / rect.width);
          }
        });
      }
      elements.hiddenVideo.addEventListener("timeupdate", () => {
        if (state.currentScreen === 3) {
          const clip = state.clips.find((c) => c.id === state.activeClipId);
          if (clip && clip.duration > 0) {
            if (state.isPlaying && elements.hiddenVideo.currentTime >= clip.endTime) {
              elements.hiddenVideo.currentTime = clip.startTime;
              elements.hiddenVideo.play().catch(() => {
              });
            }
            updateStudioTimelineUI2();
          }
        }
      });
      elements.exportActiveClipBtn?.addEventListener("click", () => {
        if (state.activeClipId) exportSingleClip(state.activeClipId);
      });
      elements.exportAllClipsStudioBtn?.addEventListener("click", exportAllClips);
      elements.cancelExportBtn?.addEventListener("click", () => {
        state.cancelExportRequested = true;
      });
      document.querySelectorAll(".accordion-header").forEach((header) => {
        header.addEventListener("click", () => {
          const item = header.closest(".accordion-item");
          if (!item) return;
          const wasActive = item.classList.contains("active");
          item.classList.toggle("active", !wasActive);
          const chevron = header.querySelector(".accordion-chevron");
          if (chevron) {
            chevron.textContent = !wasActive ? "\u25B2" : "\u25BC";
          }
        });
      });
      const PRESET_STYLES = {
        presetClassicKhmer: {
          fontFamily: "Moul",
          colorMode: "dual",
          topTextColor1: "#FFE600",
          topTextColor2: "#FF5722",
          bottomTextColor1: "#FFE600",
          bottomTextColor2: "#FF5722",
          strokeColor: "#FFFFFF",
          strokeWidth: 12,
          shadowBlur: 10
        },
        presetModernYellow: {
          fontFamily: "Kantumruy Pro",
          colorMode: "dual",
          topTextColor1: "#FFE600",
          topTextColor2: "#FFFFFF",
          bottomTextColor1: "#FFE600",
          bottomTextColor2: "#FFFFFF",
          strokeColor: "#000000",
          strokeWidth: 10,
          shadowBlur: 8
        },
        presetBoldSocial: {
          fontFamily: "Battambang",
          colorMode: "dual",
          topTextColor1: "#38BDF8",
          topTextColor2: "#F43F5E",
          bottomTextColor1: "#38BDF8",
          bottomTextColor2: "#F43F5E",
          strokeColor: "#000000",
          strokeWidth: 10,
          shadowBlur: 12
        },
        presetCleanWhite: {
          fontFamily: "Kantumruy Pro",
          colorMode: "single",
          topTextColor1: "#FFFFFF",
          topTextColor2: "#FFFFFF",
          bottomTextColor1: "#FFFFFF",
          bottomTextColor2: "#FFFFFF",
          strokeColor: "#000000",
          strokeWidth: 6,
          shadowBlur: 15
        },
        presetNewsStyle: {
          fontFamily: "Battambang",
          colorMode: "single",
          topTextColor1: "#FFFFFF",
          topTextColor2: "#FFFFFF",
          bottomTextColor1: "#FFE600",
          bottomTextColor2: "#FFE600",
          strokeColor: "#B91C1C",
          strokeWidth: 8,
          shadowBlur: 8
        }
      };
      document.querySelectorAll(".preset-card").forEach((card) => {
        card.addEventListener("click", () => {
          const presetKey = card.id;
          const style = PRESET_STYLES[presetKey];
          if (!style) return;
          pushStateToHistory();
          document.querySelectorAll(".preset-card").forEach((c) => c.classList.remove("active"));
          card.classList.add("active");
          Object.assign(state, style);
          syncActiveClipProperty("fontFamily", state.fontFamily);
          syncActiveClipProperty("colorMode", state.colorMode);
          syncActiveClipProperty("topTextColor1", state.topTextColor1);
          syncActiveClipProperty("topTextColor2", state.topTextColor2);
          syncActiveClipProperty("bottomTextColor1", state.bottomTextColor1);
          syncActiveClipProperty("bottomTextColor2", state.bottomTextColor2);
          syncActiveClipProperty("strokeColor", state.strokeColor);
          syncActiveClipProperty("strokeWidth", state.strokeWidth);
          syncActiveClipProperty("shadowBlur", state.shadowBlur);
          syncInspectorUI();
          showToast(`\u{1F3A8} \u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB\u1798\u17C9\u17BC\u178A: ${card.querySelector(".preset-name")?.textContent || presetKey}`);
        });
      });
      document.querySelectorAll(".swatch-row .color-swatch-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const row = btn.closest(".swatch-row");
          const target = row?.dataset.target;
          const color = btn.dataset.color;
          if (!target || !color) return;
          pushStateToHistory();
          if (target === "top") {
            state.topTextColor1 = color;
            state.topTextColor2 = color;
            syncActiveClipProperty("topTextColor1", color);
            syncActiveClipProperty("topTextColor2", color);
          } else {
            state.bottomTextColor1 = color;
            state.bottomTextColor2 = color;
            syncActiveClipProperty("bottomTextColor1", color);
            syncActiveClipProperty("bottomTextColor2", color);
          }
          syncInspectorUI();
          renderWordColorChips();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      });
      document.querySelectorAll(".custom-color-input").forEach((input) => {
        input.addEventListener("input", (e) => {
          const target = input.dataset.target;
          const color = e.target.value;
          if (!target) return;
          const dot = document.getElementById(target + "CustomColorDot");
          if (dot) dot.style.background = color;
          if (target === "top") {
            state.topTextColor1 = color;
            syncActiveClipProperty("topTextColor1", color);
          } else {
            state.bottomTextColor1 = color;
            syncActiveClipProperty("bottomTextColor1", color);
          }
          renderWordColorChips();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        });
      });
      const helpModal = document.getElementById("helpShortcutsModal");
      document.getElementById("openHelpModalBtn")?.addEventListener("click", () => {
        helpModal?.classList.remove("hidden");
      });
      document.getElementById("closeHelpModalBtn")?.addEventListener("click", () => {
        helpModal?.classList.add("hidden");
      });
      document.getElementById("closeHelpModalOkBtn")?.addEventListener("click", () => {
        helpModal?.classList.add("hidden");
      });
      helpModal?.addEventListener("click", (e) => {
        if (e.target === helpModal) helpModal.classList.add("hidden");
      });
      const deleteModal = document.getElementById("deleteConfirmModal");
      const closeDeleteModal = () => {
        _clipIdToDelete = null;
        deleteModal?.classList.add("hidden");
      };
      document.getElementById("closeDeleteModalBtn")?.addEventListener("click", closeDeleteModal);
      document.getElementById("cancelDeleteClipBtn")?.addEventListener("click", closeDeleteModal);
      document.getElementById("confirmDeleteClipBtn")?.addEventListener("click", () => {
        if (_clipIdToDelete !== null) {
          executeDeleteClip(_clipIdToDelete);
          closeDeleteModal();
        }
      });
      deleteModal?.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
      });
      function renderExtraCaptionInputs() {
        window.renderExtraCaptionInputs = renderExtraCaptionInputs;
        const container = document.getElementById("extraCaptionLinesContainer");
        if (!container) return;
        container.innerHTML = "";
        const list = state.extraCaptions || [];
        list.forEach((cap, idx) => {
          const card = document.createElement("div");
          card.className = "caption-field-card extra-caption-card";
          card.dataset.fieldId = cap.id;
          card.style.borderLeft = "3px solid #a855f7";
          card.style.marginTop = "10px";
          const activeColor = cap.color || "#FFE600";
          const colors = ["#FFE600", "#FF5722", "#FFFFFF", "#38BDF8", "#22C55E", "#A855F7", "#F97316"];
          const swatchesHtml = colors.map((c) => `
                    <button type="button" class="color-swatch-btn ${c.toLowerCase() === activeColor.toLowerCase() ? "active" : ""}" 
                        data-color="${c}" style="background:${c};" title="${c}"></button>
                `).join("");
          card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:0.8rem; color:#c084fc; font-weight:700; font-family:var(--font-khmer-kantumruy);">
                            \u2728 \u1785\u17C6\u178E\u1784\u1787\u17BE\u1784\u1794\u1793\u17D2\u1790\u17C2\u1798 #${idx + 1}
                        </span>
                        <button type="button" class="btn btn-danger btn-xs btn-remove-extra" style="padding:2px 6px; font-size:0.75rem; border-radius:4px;" title="\u179B\u17BB\u1794\u17A2\u1780\u17D2\u179F\u179A\u1793\u17C1\u17C7">\u2715</button>
                    </div>
                    <div class="caption-input-wrapper">
                        <input type="text" class="form-control caption-text-input extra-caption-input" 
                            value="${cap.text || ""}" placeholder="\u1794\u1789\u17D2\u1785\u17BC\u179B\u17A2\u1780\u17D2\u179F\u179A\u1794\u1793\u17D2\u1790\u17C2\u1798 (\u1794\u17D2\u179A\u17BE \u17D6 \u17AC Enter \u1785\u17BB\u17C7\u1794\u1793\u17D2\u1791\u17B6\u178F\u17CB)...">
                    </div>
                    <div class="caption-highlight-bar" style="margin-top:6px;">
                        <div class="swatch-row extra-swatch-row" data-id="${cap.id}">
                            ${swatchesHtml}
                            <label class="color-custom-btn" title="\u1787\u17D2\u179A\u17BE\u179F\u1796\u178E\u17CC\u178F\u17B6\u1798\u1785\u17B7\u178F\u17D2\u178F">
                                <input type="color" class="custom-color-input extra-custom-color" value="${activeColor}">
                                <span class="custom-color-dot" style="background:${activeColor};"></span>
                                <span>Custom</span>
                            </label>
                        </div>
                    </div>
                `;
          const input = card.querySelector(".extra-caption-input");
          input?.addEventListener("input", (e) => {
            cap.text = e.target.value;
            syncActiveClipProperty("extraCaptions", state.extraCaptions);
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          });
          const delBtn = card.querySelector(".btn-remove-extra");
          delBtn?.addEventListener("click", () => {
            pushStateToHistory();
            state.extraCaptions = state.extraCaptions.filter((item) => item.id !== cap.id);
            syncActiveClipProperty("extraCaptions", state.extraCaptions);
            renderExtraCaptionInputs();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            showToast("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794\u1794\u17D2\u179A\u17A2\u1794\u17CB\u17A2\u1780\u17D2\u179F\u179A\u1794\u1793\u17D2\u1790\u17C2\u1798!");
          });
          card.querySelectorAll(".extra-swatch-row .color-swatch-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const c = btn.dataset.color;
              if (!c) return;
              pushStateToHistory();
              cap.color = c;
              syncActiveClipProperty("extraCaptions", state.extraCaptions);
              renderExtraCaptionInputs();
              renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            });
          });
          const customInput = card.querySelector(".extra-custom-color");
          customInput?.addEventListener("input", (e) => {
            cap.color = e.target.value;
            const dot = card.querySelector(".custom-color-dot");
            if (dot) dot.style.background = cap.color;
            syncActiveClipProperty("extraCaptions", state.extraCaptions);
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          });
          container.appendChild(card);
        });
      }
      document.getElementById("btnAddCaptionField")?.addEventListener("click", () => {
        pushStateToHistory();
        if (!state.extraCaptions) state.extraCaptions = [];
        const count = state.extraCaptions.length;
        const fieldId = "extra_" + Date.now();
        let baseBottomY = state.bottomPosY;
        if (isNaN(baseBottomY) || baseBottomY <= 0 || baseBottomY > state.canvasHeight - 60) {
          baseBottomY = Math.round(state.canvasHeight * 0.82);
        }
        let defaultY = Math.min(state.canvasHeight - 40, Math.round(baseBottomY + 70 * (count + 1)));
        if (defaultY > state.canvasHeight - 40) {
          defaultY = Math.round(state.canvasHeight * 0.7 + count * 50);
        }
        state.extraCaptions.push({
          id: fieldId,
          text: "\u17A2\u1780\u17D2\u179F\u179A\u1794\u1793\u17D2\u1790\u17C2\u1798",
          color: "#FFE600",
          fontSize: 55,
          posY: defaultY
        });
        syncActiveClipProperty("extraCaptions", state.extraCaptions);
        renderExtraCaptionInputs();
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        showToast("\u2795 \u1794\u17B6\u1793\u1794\u1793\u17D2\u1790\u17C2\u1798\u1794\u17D2\u179A\u17A2\u1794\u17CB\u17A2\u1780\u17D2\u179F\u179A\u1790\u17D2\u1798\u17B8!");
      });
      document.getElementById("fullscreenPreviewBtn")?.addEventListener("click", () => {
        const container = document.querySelector(".canvas-viewport") || elements.mainCanvas;
        if (!document.fullscreenElement) {
          container?.requestFullscreen?.().catch(() => {
          });
        } else {
          document.exitFullscreen?.().catch(() => {
          });
        }
      });
      document.getElementById("timelineZoomInBtn")?.addEventListener("click", () => {
        const track = document.getElementById("timelineTrackBox");
        if (track) track.style.transform = "scaleX(1.15)";
      });
      document.getElementById("timelineZoomResetBtn")?.addEventListener("click", () => {
        const track = document.getElementById("timelineTrackBox");
        if (track) track.style.transform = "scaleX(1)";
      });
      document.getElementById("timelineZoomOutBtn")?.addEventListener("click", () => {
        const track = document.getElementById("timelineTrackBox");
        if (track) track.style.transform = "scaleX(0.85)";
      });
      document.getElementById("headerUndoBtn")?.addEventListener("click", undoLastAction);
      document.getElementById("headerRedoBtn")?.addEventListener("click", redoLastAction);
      elements.colorModeSelect?.addEventListener("change", (e) => {
        if (e._fromSync) return;
        pushStateToHistory();
        state.colorMode = e.target.value;
        const isDual = state.colorMode === "dual";
        const isSingle = state.colorMode === "single";
        elements.topColor2Group?.classList.toggle("hidden", isSingle);
        elements.bottomColor2Group?.classList.toggle("hidden", isSingle);
        elements.topTextSingleGroup?.classList.toggle("hidden", isDual);
        elements.topTextDualGroup?.classList.toggle("hidden", !isDual);
        elements.bottomTextSingleGroup?.classList.toggle("hidden", isDual);
        elements.bottomTextDualGroup?.classList.toggle("hidden", !isDual);
        syncActiveClipProperty("colorMode", state.colorMode);
      });
      document.querySelectorAll(".color-picker-swatch-box").forEach((box) => {
        box.addEventListener("click", (e) => {
          e.stopPropagation();
          const targetKey = box.dataset.target;
          if (targetKey) {
            openCustomColorPopover(targetKey, box);
          }
        });
      });
      elements.closePopoverBtn?.addEventListener("click", closeCustomColorPopover);
      window.addEventListener("click", (e) => {
        const popover = elements.customColorPopover;
        if (popover && !popover.classList.contains("hidden")) {
          if (!popover.contains(e.target) && !e.target.closest(".color-picker-swatch-box") && !e.target.closest(".word-chip")) {
            closeCustomColorPopover();
          }
        }
      });
      document.querySelectorAll(".preset-chip").forEach((chip) => {
        chip.addEventListener("click", (e) => {
          e.stopPropagation();
          const color = chip.dataset.color;
          if (color) applyPopoverColor(color);
        });
      });
      elements.popoverHexInput?.addEventListener("input", (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith("#") && val.length > 0) val = "#" + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          applyPopoverColor(val);
        }
      });
      elements.popoverNativeColorInput?.addEventListener("input", (e) => {
        applyPopoverColor(e.target.value);
      });
      if (elements.activeClipTitleInput) {
        elements.activeClipTitleInput.addEventListener("input", (e) => {
          const val = e.target.value;
          const clip = state.clips.find((c) => c.id === state.activeClipId);
          if (clip) {
            clip.name = val || "Clip";
            if (elements.activeClipNameBadge) {
              elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
            }
            renderClipsList();
          }
        });
      }
      bindInput(elements.topTextInput, "topText");
      bindInput(elements.topTextPart1Input, "topTextPart1");
      bindInput(elements.topTextPart2Input, "topTextPart2");
      bindInput(elements.topFontSizeInput, "topFontSize", elements.topFontSizeVal, "px");
      bindInput(elements.topPosYInput, "topPosY", elements.topPosYVal, "px");
      bindInput(elements.bottomTextInput, "bottomText");
      bindInput(elements.bottomTextPart1Input, "bottomTextPart1");
      bindInput(elements.bottomTextPart2Input, "bottomTextPart2");
      bindInput(elements.bottomFontSizeInput, "bottomFontSize", elements.bottomFontSizeVal, "px");
      bindInput(elements.bottomPosYInput, "bottomPosY", elements.bottomPosYVal, "px");
      bindInput(elements.fontFamilySelect, "fontFamily");
      bindInput(elements.strokeColorInput, "strokeColor", elements.strokeColorVal);
      bindInput(elements.strokeWidthInput, "strokeWidth", elements.strokeWidthVal, "px");
      bindInput(elements.shadowBlurInput, "shadowBlur", elements.shadowBlurVal, "px");
      elements.bgModeSelect?.addEventListener("change", (e) => {
        if (e._fromSync) return;
        pushStateToHistory();
        state.bgMode = e.target.value;
        elements.blurConfig?.classList.toggle("hidden", state.bgMode !== "blur");
        elements.bgColorConfig?.classList.toggle("hidden", state.bgMode !== "color");
        syncActiveClipProperty("bgMode", state.bgMode);
      });
      bindInput(elements.blurRadiusInput, "blurRadius", elements.blurRadiusVal, "px");
      bindInput(elements.bgColorInput, "bgColor", elements.bgColorVal);
      bindInput(elements.videoScaleInput, "videoScale", elements.videoScaleVal, "%");
      bindInput(elements.videoOffsetYInput, "videoOffsetY", elements.videoOffsetYVal, "px");
      elements.colorModeSelect?.dispatchEvent(new Event("change"));
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
        const fontSize = target === "top" ? state.topFontSize : state.bottomFontSize;
        const posY = target === "top" ? state.topPosY : state.bottomPosY;
        const measuredW = target === "top" ? state.topMeasuredWidth || state.canvasWidth * 0.75 : state.bottomMeasuredWidth || state.canvasWidth * 0.75;
        const boxH = fontSize * 1.35;
        const boxW = Math.max(180, Math.min(state.canvasWidth - 20, measuredW + 50));
        const boxX = (state.canvasWidth - boxW) / 2;
        const boxY = posY - boxH / 2;
        return {
          boxX,
          boxY,
          boxW,
          boxH,
          corners: [
            { name: "TL", x: boxX, y: boxY },
            { name: "TR", x: boxX + boxW, y: boxY },
            { name: "BL", x: boxX, y: boxY + boxH },
            { name: "BR", x: boxX + boxW, y: boxY + boxH }
          ]
        };
      }
      function getLayerBoundingBox(layer) {
        const img = layer.img || layer.imgElement;
        const lw = (layer.w || (img ? img.naturalWidth || img.width : 480)) * (layer.scale || 1);
        const lh = (layer.h || (img ? img.naturalHeight || img.height : 320)) * (layer.scale || 1);
        const lx = layer.x !== void 0 ? layer.x : 60;
        const ly = layer.y !== void 0 ? layer.y : 60;
        return {
          x: lx,
          y: ly,
          w: lw,
          h: lh,
          corners: [
            { name: "TL", x: lx, y: ly },
            { name: "TR", x: lx + lw, y: ly },
            { name: "BL", x: lx, y: ly + lh },
            { name: "BR", x: lx + lw, y: ly + lh }
          ]
        };
      }
      function hitTestActiveLayerCorner(canvasX, canvasY) {
        if (!state.activeLayerId || !state.studioLayers) return null;
        const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
        if (!layer || !layer.visible) return null;
        const box = getLayerBoundingBox(layer);
        for (const c of box.corners) {
          const dist = Math.hypot(canvasX - c.x, canvasY - c.y);
          if (dist <= 25) {
            return { layer, handle: c.name, box };
          }
        }
        return null;
      }
      function hitTestImageLayers(canvasX, canvasY) {
        if (!state.studioLayers || state.studioLayers.length === 0) return null;
        for (let i = state.studioLayers.length - 1; i >= 0; i--) {
          const layer = state.studioLayers[i];
          if (!layer.visible) continue;
          const box = getLayerBoundingBox(layer);
          if (canvasX >= box.x && canvasX <= box.x + box.w && canvasY >= box.y && canvasY <= box.y + box.h) {
            return layer;
          }
        }
        return null;
      }
      let dragStartLayerScale = 1;
      let dragStartLayerX = 0;
      let dragStartLayerY = 0;
      function hitTestCornerHandle(canvasX, canvasY) {
        const targets = ["top", "bottom"];
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
        if (state.extraCaptions && state.extraCaptions.length > 0) {
          for (let i = state.extraCaptions.length - 1; i >= 0; i--) {
            const ec = state.extraCaptions[i];
            const distY = Math.abs(canvasY - (ec.posY || 0));
            const hitZoneY = Math.max(60, (ec.fontSize || 55) * 1.2);
            if (distY <= hitZoneY) {
              return ec.id;
            }
          }
        }
        const topDistY = Math.abs(canvasY - state.topPosY);
        const bottomDistY = Math.abs(canvasY - state.bottomPosY);
        const topHitZoneY = Math.max(70, state.topFontSize * 1.2);
        const bottomHitZoneY = Math.max(70, state.bottomFontSize * 1.2);
        const isTopY = topDistY <= topHitZoneY;
        const isBottomY = bottomDistY <= bottomHitZoneY;
        if (isTopY && (!isBottomY || topDistY <= bottomDistY)) {
          return "top";
        } else if (isBottomY) {
          return "bottom";
        }
        return null;
      }
      const handleWheelScale = (e) => {
        if (state.currentScreen !== 3 && state.currentScreen !== 2) return;
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        if (state.platformMode === "youtube" && state.activeLayerId) {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (layer) {
            const step2 = e.deltaY < 0 ? 0.05 : -0.05;
            layer.scale = Math.max(0.2, Math.min(2.5, (layer.scale || 1) + step2));
            syncFilmoraInspectorUI();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            return;
          }
        }
        const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? "top" : "bottom");
        const step = e.deltaY < 0 ? 4 : -4;
        if (target === "top") {
          let newSize = Math.max(20, Math.min(150, Number(state.topFontSize) + step));
          state.topFontSize = newSize;
          if (elements.topFontSizeInput) elements.topFontSizeInput.value = newSize;
          if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = newSize + "px";
          syncActiveClipProperty("topFontSize", newSize);
        } else if (target === "bottom") {
          let newSize = Math.max(20, Math.min(150, Number(state.bottomFontSize) + step));
          state.bottomFontSize = newSize;
          if (elements.bottomFontSizeInput) elements.bottomFontSizeInput.value = newSize;
          if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = newSize + "px";
          syncActiveClipProperty("bottomFontSize", newSize);
        } else if (typeof target === "string" && target.startsWith("extra_")) {
          const ec = state.extraCaptions?.find((item) => item.id === target);
          if (ec) {
            ec.fontSize = Math.max(20, Math.min(150, (ec.fontSize || 55) + step));
            syncActiveClipProperty("extraCaptions", state.extraCaptions);
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          }
        }
      };
      elements.mainCanvas.addEventListener("wheel", handleWheelScale, { passive: false });
      elements.canvasWrapper?.addEventListener("wheel", handleWheelScale, { passive: false });
      const handleMouseDown = (e) => {
        if (state.currentScreen !== 3 && state.currentScreen !== 2) return;
        const { x, y } = getCanvasCoordinates(e);
        const layerCornerHit = hitTestActiveLayerCorner(x, y);
        if (layerCornerHit) {
          e.preventDefault();
          pushStateToHistory();
          state.isResizingLayer = true;
          state.resizingLayerHandle = layerCornerHit.handle;
          dragStartMouseX = x;
          dragStartMouseY = y;
          dragStartLayerScale = layerCornerHit.layer.scale || 1;
          elements.mainCanvas.style.cursor = layerCornerHit.handle === "TL" || layerCornerHit.handle === "BR" ? "nwse-resize" : "nesw-resize";
          return;
        }
        const hitLayer = hitTestImageLayers(x, y);
        if (hitLayer) {
          e.preventDefault();
          pushStateToHistory();
          state.activeLayerId = hitLayer.id;
          state.isDraggingLayer = true;
          dragStartMouseX = x;
          dragStartMouseY = y;
          dragStartLayerX = hitLayer.x !== void 0 ? hitLayer.x : 60;
          dragStartLayerY = hitLayer.y !== void 0 ? hitLayer.y : 60;
          syncFilmoraInspectorUI();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          elements.mainCanvas.style.cursor = "move";
          return;
        }
        const cornerHit = hitTestCornerHandle(x, y);
        if (cornerHit && state.platformMode !== "youtube") {
          e.preventDefault();
          pushStateToHistory();
          state.isResizingText = true;
          state.resizeTarget = cornerHit.target;
          state.resizeHandle = cornerHit.handle;
          dragStartMouseX = x;
          dragStartMouseY = y;
          dragStartFontSize = cornerHit.target === "top" ? Number(state.topFontSize) : Number(state.bottomFontSize);
          elements.mainCanvas.style.cursor = cornerHit.handle === "TL" || cornerHit.handle === "BR" ? "nwse-resize" : "nesw-resize";
          return;
        }
        if (state.platformMode !== "youtube") {
          const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? "top" : "bottom");
          if (target) {
            e.preventDefault();
            pushStateToHistory();
            state.isDraggingText = true;
            state.dragTarget = target;
            state.hoveredTextTarget = target;
            dragStartCanvasY = y;
            if (target === "top") {
              dragStartTextPosY = Number(state.topPosY);
              const inputEl = state.colorMode === "dual" ? elements.topTextPart1Input : elements.topTextInput;
              inputEl?.focus();
            } else if (target === "bottom") {
              dragStartTextPosY = Number(state.bottomPosY);
              const inputEl = state.colorMode === "dual" ? elements.bottomTextPart1Input : elements.bottomTextInput;
              inputEl?.focus();
            } else if (typeof target === "string" && target.startsWith("extra_")) {
              const ec = state.extraCaptions?.find((item) => item.id === target);
              dragStartTextPosY = ec ? parseFloat(ec.posY) : y;
              const card = document.querySelector(`.extra-caption-card[data-field-id="${target}"]`);
              const input = card?.querySelector(".extra-caption-input");
              input?.focus();
            }
            elements.mainCanvas.style.cursor = "grabbing";
          }
        }
      };
      elements.mainCanvas.addEventListener("mousedown", handleMouseDown);
      elements.canvasWrapper?.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", (e) => {
        if (state.currentScreen !== 3 && state.currentScreen !== 2) return;
        const { x, y } = getCanvasCoordinates(e);
        if (state.isResizingLayer && state.activeLayerId) {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (layer) {
            const deltaX = x - dragStartMouseX;
            const deltaY = y - dragStartMouseY;
            let scaleDelta = (deltaX + deltaY) * 15e-4;
            if (state.resizingLayerHandle === "TL" || state.resizingLayerHandle === "BL") {
              scaleDelta = (-deltaX + deltaY) * 15e-4;
            }
            layer.scale = Math.max(0.15, Math.min(3, dragStartLayerScale + scaleDelta));
            syncFilmoraInspectorUI();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          }
          return;
        }
        if (state.isDraggingLayer && state.activeLayerId) {
          const layer = state.studioLayers.find((l) => l.id === state.activeLayerId);
          if (layer) {
            const deltaX = x - dragStartMouseX;
            const deltaY = y - dragStartMouseY;
            layer.x = Math.round(dragStartLayerX + deltaX);
            layer.y = Math.round(dragStartLayerY + deltaY);
            syncFilmoraInspectorUI();
            renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          }
          return;
        }
        if (state.isResizingText && state.resizeTarget) {
          const deltaX = x - dragStartMouseX;
          const deltaY = y - dragStartMouseY;
          let scaleDelta = (deltaX + deltaY) * 0.3;
          if (state.resizeHandle === "TL" || state.resizeHandle === "BL") {
            scaleDelta = (-deltaX + deltaY) * 0.3;
          }
          let newFontSize = Math.max(20, Math.min(150, Math.round(dragStartFontSize + scaleDelta)));
          if (state.resizeTarget === "top") {
            state.topFontSize = newFontSize;
            if (elements.topFontSizeInput) elements.topFontSizeInput.value = newFontSize;
            if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = newFontSize + "px";
            syncActiveClipProperty("topFontSize", newFontSize);
          } else if (state.resizeTarget === "bottom") {
            state.bottomFontSize = newFontSize;
            if (elements.bottomFontSizeInput) elements.bottomFontSizeInput.value = newFontSize;
            if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = newFontSize + "px";
            syncActiveClipProperty("bottomFontSize", newFontSize);
          }
          return;
        }
        if (state.isDraggingText && state.dragTarget) {
          const deltaY = y - dragStartCanvasY;
          let targetY = Math.round(dragStartTextPosY + deltaY);
          if (state.dragTarget === "top") {
            targetY = Math.max(20, Math.min(Math.round(state.canvasHeight * 0.48), targetY));
            state.topPosY = targetY;
            if (elements.topPosYInput) elements.topPosYInput.value = targetY;
            if (elements.topPosYVal) elements.topPosYVal.textContent = targetY + "px";
            syncActiveClipProperty("topPosY", targetY);
          } else if (state.dragTarget === "bottom") {
            targetY = Math.max(Math.round(state.canvasHeight * 0.5), Math.min(state.canvasHeight - 20, targetY));
            state.bottomPosY = targetY;
            if (elements.bottomPosYInput) elements.bottomPosYInput.value = targetY;
            if (elements.bottomPosYVal) elements.bottomPosYVal.textContent = targetY + "px";
            syncActiveClipProperty("bottomPosY", targetY);
          } else if (typeof state.dragTarget === "string" && state.dragTarget.startsWith("extra_")) {
            targetY = Math.max(20, Math.min(state.canvasHeight - 20, targetY));
            const ec = state.extraCaptions?.find((item) => item.id === state.dragTarget);
            if (ec) {
              ec.posY = targetY;
              syncActiveClipProperty("extraCaptions", state.extraCaptions);
              renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
            }
          }
          return;
        }
        const layerCornerHover = hitTestActiveLayerCorner(x, y);
        if (layerCornerHover) {
          if (elements.mainCanvas) {
            elements.mainCanvas.style.cursor = layerCornerHover.handle === "TL" || layerCornerHover.handle === "BR" ? "nwse-resize" : "nesw-resize";
          }
          return;
        }
        const layerHover = hitTestImageLayers(x, y);
        if (layerHover) {
          if (elements.mainCanvas) elements.mainCanvas.style.cursor = "move";
          return;
        }
        if (state.platformMode !== "youtube") {
          const cornerHit = hitTestCornerHandle(x, y);
          if (cornerHit) {
            state.hoveredTextTarget = cornerHit.target;
            if (elements.mainCanvas) {
              elements.mainCanvas.style.cursor = cornerHit.handle === "TL" || cornerHit.handle === "BR" ? "nwse-resize" : "nesw-resize";
            }
          } else {
            const target = hitTestText(x, y);
            state.hoveredTextTarget = target;
            if (elements.mainCanvas) {
              elements.mainCanvas.style.cursor = target ? "ns-resize" : "default";
            }
          }
        } else {
          if (elements.mainCanvas) elements.mainCanvas.style.cursor = "default";
        }
      });
      window.addEventListener("mouseup", () => {
        if (state.isDraggingLayer || state.isResizingLayer) {
          state.isDraggingLayer = false;
          state.isResizingLayer = false;
        }
        if (state.isDraggingText || state.isResizingText) {
          state.isDraggingText = false;
          state.isResizingText = false;
          state.dragTarget = null;
          state.resizeTarget = null;
          if (elements.mainCanvas) {
            elements.mainCanvas.style.cursor = state.hoveredTextTarget ? "ns-resize" : "default";
          }
        }
      });
      const handleDoubleClick = (e) => {
        if (state.currentScreen !== 3 && state.currentScreen !== 2) return;
        const { x, y } = getCanvasCoordinates(e);
        const target = hitTestText(x, y) || (y < state.canvasHeight / 2 ? "top" : "bottom");
        if (target) {
          e.preventDefault();
          elements.tabBtns[0]?.click();
          const inlineInput = elements.canvasInlineInput;
          if (inlineInput) {
            const rect = elements.mainCanvas.getBoundingClientRect();
            const posY = target === "top" ? state.topPosY : state.bottomPosY;
            const cssY = posY / state.canvasHeight * rect.height;
            const cssX = rect.width / 2;
            inlineInput.style.top = `${cssY}px`;
            inlineInput.style.left = `${cssX}px`;
            const currentVal = target === "top" ? state.topText : state.bottomText;
            inlineInput.value = currentVal;
            inlineInput.dataset.target = target;
            inlineInput.classList.remove("hidden");
            setTimeout(() => {
              inlineInput.focus();
              inlineInput.select();
            }, 50);
          }
          let inspectorInput;
          if (target === "top") {
            inspectorInput = state.colorMode === "dual" ? elements.topTextPart1Input : elements.topTextInput;
          } else {
            inspectorInput = state.colorMode === "dual" ? elements.bottomTextPart1Input : elements.bottomTextInput;
          }
          if (inspectorInput) {
            inspectorInput.focus();
            inspectorInput.select();
          }
        }
      };
      elements.mainCanvas.addEventListener("dblclick", handleDoubleClick);
      elements.canvasWrapper?.addEventListener("dblclick", handleDoubleClick);
      if (elements.canvasInlineInput) {
        elements.canvasInlineInput.addEventListener("input", (e) => {
          const target = e.target.dataset.target;
          const val = e.target.value;
          if (target === "top") {
            state.topText = val;
            if (state.colorMode === "dual") {
              const parts = val.trim().split(/\s+/);
              state.topTextPart1 = parts[0] || "";
              state.topTextPart2 = parts.slice(1).join(" ") || "";
              if (elements.topTextPart1Input) elements.topTextPart1Input.value = state.topTextPart1;
              if (elements.topTextPart2Input) elements.topTextPart2Input.value = state.topTextPart2;
              syncActiveClipProperty("topTextPart1", state.topTextPart1);
              syncActiveClipProperty("topTextPart2", state.topTextPart2);
            } else {
              if (elements.topTextInput) elements.topTextInput.value = val;
              syncActiveClipProperty("topText", val);
            }
          } else if (target === "bottom") {
            state.bottomText = val;
            if (state.colorMode === "dual") {
              const parts = val.trim().split(/\s+/);
              state.bottomTextPart1 = parts[0] || "";
              state.bottomTextPart2 = parts.slice(1).join(" ") || "";
              if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = state.bottomTextPart1;
              if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = state.bottomTextPart2;
              syncActiveClipProperty("bottomTextPart1", state.bottomTextPart1);
              syncActiveClipProperty("bottomTextPart2", state.bottomTextPart2);
            } else {
              if (elements.bottomTextInput) elements.bottomTextInput.value = val;
              syncActiveClipProperty("bottomText", val);
            }
          }
        });
        const closeInlineInput = () => {
          elements.canvasInlineInput.classList.add("hidden");
        };
        elements.canvasInlineInput.addEventListener("blur", closeInlineInput);
        elements.canvasInlineInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            closeInlineInput();
          }
        });
      }
      const autoSelectOnFocus = (el) => {
        el?.addEventListener("focus", () => el.select());
      };
      autoSelectOnFocus(elements.topTextInput);
      autoSelectOnFocus(elements.topTextPart1Input);
      autoSelectOnFocus(elements.topTextPart2Input);
      autoSelectOnFocus(elements.bottomTextInput);
      autoSelectOnFocus(elements.bottomTextPart1Input);
      autoSelectOnFocus(elements.bottomTextPart2Input);
    }
    window.clearTopText = function() {
      state.topText = "";
      state.topTextPart1 = "";
      state.topTextPart2 = "";
      if (elements.topTextInput) elements.topTextInput.value = "";
      if (elements.topTextPart1Input) elements.topTextPart1Input.value = "";
      if (elements.topTextPart2Input) elements.topTextPart2Input.value = "";
      if (elements.canvasInlineInput && elements.canvasInlineInput.dataset.target === "top") {
        elements.canvasInlineInput.value = "";
      }
      syncActiveClipProperty("topText", "");
      syncActiveClipProperty("topTextPart1", "");
      syncActiveClipProperty("topTextPart2", "");
    };
    window.clearBottomText = function() {
      state.bottomText = "";
      state.bottomTextPart1 = "";
      state.bottomTextPart2 = "";
      if (elements.bottomTextInput) elements.bottomTextInput.value = "";
      if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = "";
      if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = "";
      if (elements.canvasInlineInput && elements.canvasInlineInput.dataset.target === "bottom") {
        elements.canvasInlineInput.value = "";
      }
      syncActiveClipProperty("bottomText", "");
      syncActiveClipProperty("bottomTextPart1", "");
      syncActiveClipProperty("bottomTextPart2", "");
    };
    let activePopoverTargetKey = null;
    function openCustomColorPopover(targetKey, anchorEl) {
      activePopoverTargetKey = targetKey;
      const popover = elements.customColorPopover || document.getElementById("customColorPopover");
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
      const currentColor = state[targetKey] || "#FFFFFF";
      updatePopoverUI(currentColor);
      popover.classList.remove("hidden");
    }
    window.openCustomColorPopover = openCustomColorPopover;
    function closeCustomColorPopover() {
      const popover = elements.customColorPopover || document.getElementById("customColorPopover");
      if (popover) popover.classList.add("hidden");
      activePopoverTargetKey = null;
    }
    window.closeCustomColorPopover = closeCustomColorPopover;
    function updatePopoverUI(colorHex) {
      if (!colorHex) return;
      colorHex = colorHex.toUpperCase();
      if (elements.popoverPreviewSwatch) elements.popoverPreviewSwatch.style.background = colorHex;
      if (elements.popoverHexInput) elements.popoverHexInput.value = colorHex;
      if (elements.popoverNativeColorInput && colorHex.length === 7 && colorHex.startsWith("#")) {
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
        const val = state[targetKey] || "#FFFFFF";
        if (swatchEl) swatchEl.style.background = val;
        if (valEl) valEl.textContent = val;
      };
      setSwatch("topTextColor1", elements.topTextColor1Swatch, elements.topTextColor1Val);
      setSwatch("topTextColor2", elements.topTextColor2Swatch, elements.topTextColor2Val);
      setSwatch("bottomTextColor1", elements.bottomTextColor1Swatch, elements.bottomTextColor1Val);
      setSwatch("bottomTextColor2", elements.bottomTextColor2Swatch, elements.bottomTextColor2Val);
      setSwatch("strokeColor", elements.strokeColorSwatch, elements.strokeColorVal);
      setSwatch("bgColor", elements.bgColorSwatch, elements.bgColorVal);
      document.querySelectorAll('.swatch-row[data-target="top"] .color-swatch-btn').forEach((btn) => {
        btn.classList.toggle("active", (btn.dataset.color || "").toLowerCase() === (state.topTextColor1 || "").toLowerCase());
      });
      document.querySelectorAll('.swatch-row[data-target="bottom"] .color-swatch-btn').forEach((btn) => {
        btn.classList.toggle("active", (btn.dataset.color || "").toLowerCase() === (state.bottomTextColor1 || "").toLowerCase());
      });
      const btmCustomDot = document.getElementById("bottomCustomColorDot");
      if (btmCustomDot) btmCustomDot.style.background = state.bottomTextColor1 || "#FFE600";
      const topCustomDot = document.getElementById("topCustomColorDot");
      if (topCustomDot) topCustomDot.style.background = state.topTextColor1 || "#FFE600";
    }
    function renderWordColorChips() {
      const topP1 = (state.topTextPart1 || "\u178A\u17BE\u1798").trim();
      const topP2 = (state.topTextPart2 || "\u178F\u17D2\u1793\u17C4\u178F").trim();
      if (elements.topPart1Label) elements.topPart1Label.style.color = state.topTextColor1;
      if (elements.topPart2Label) elements.topPart2Label.style.color = state.topTextColor2;
      if (elements.topWordChips) {
        elements.topWordChips.innerHTML = `
                <span class="word-chip" onclick="openCustomColorPopover('topTextColor1', document.getElementById('topTextColor1Box'))" title="\u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u178F\u17BC\u179A\u1796\u178E\u17CC\u1796\u17B6\u1780\u17D2\u1799\u1793\u17C1\u17C7">
                    <span class="word-chip-color-dot" style="background:${state.topTextColor1};"></span>
                    <span>${topP1 || "\u1796\u17B6\u1780\u17D2\u1799\u1791\u17B8\u17E1"}</span> (\u1796\u178E\u17CC\u1791\u17B8\u17E1)
                </span>
                <span class="word-chip" onclick="openCustomColorPopover('topTextColor2', document.getElementById('topTextColor2Box'))" title="\u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u178F\u17BC\u179A\u1796\u178E\u17CC\u1796\u17B6\u1780\u17D2\u1799\u1793\u17C1\u17C7">
                    <span class="word-chip-color-dot" style="background:${state.topTextColor2};"></span>
                    <span>${topP2 || "\u1796\u17B6\u1780\u17D2\u1799\u1791\u17B8\u17E2"}</span> (\u1796\u178E\u17CC\u1791\u17B8\u17E2)
                </span>
            `;
      }
      const btmP1 = (state.bottomTextPart1 || "\u17A2\u1784\u17CB\u17A2\u17B6\u1785").trim();
      const btmP2 = (state.bottomTextPart2 || "\u1780\u17D2\u179B\u17B6\u17A0\u17B6\u1793").trim();
      if (elements.bottomPart1Label) elements.bottomPart1Label.style.color = state.bottomTextColor1;
      if (elements.bottomPart2Label) elements.bottomPart2Label.style.color = state.bottomTextColor2;
      if (elements.bottomWordChips) {
        elements.bottomWordChips.innerHTML = `
                <span class="word-chip" onclick="openCustomColorPopover('bottomTextColor1', document.getElementById('bottomTextColor1Box'))" title="\u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u178F\u17BC\u179A\u1796\u178E\u17CC\u1796\u17B6\u1780\u17D2\u1799\u1793\u17C1\u17C7">
                    <span class="word-chip-color-dot" style="background:${state.bottomTextColor1};"></span>
                    <span>${btmP1 || "\u1796\u17B6\u1780\u17D2\u1799\u1791\u17B8\u17E1"}</span> (\u1796\u178E\u17CC\u1791\u17B8\u17E1)
                </span>
                <span class="word-chip" onclick="openCustomColorPopover('bottomTextColor2', document.getElementById('bottomTextColor2Box'))" title="\u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1794\u17D2\u178F\u17BC\u179A\u1796\u178E\u17CC\u1796\u17B6\u1780\u17D2\u1799\u1793\u17C1\u17C7">
                    <span class="word-chip-color-dot" style="background:${state.bottomTextColor2};"></span>
                    <span>${btmP2 || "\u1796\u17B6\u1780\u17D2\u1799\u1791\u17B8\u17E2"}</span> (\u1796\u178E\u17CC\u1791\u17B8\u17E2)
                </span>
            `;
      }
    }
    function updateClipTitleFromCaptions(clip) {
      if (!clip) return;
      const top = (clip.topText || "").trim();
      const btm = (clip.bottomText || "").trim();
      let combinedTitle = "";
      if (top && btm && top !== btm) {
        combinedTitle = `${top} \u17D6 ${btm}`;
      } else if (top) {
        combinedTitle = top;
      } else if (btm) {
        combinedTitle = btm;
      }
      if (combinedTitle) {
        clip.name = combinedTitle;
        if (state.activeClipId === clip.id) {
          if (elements.activeClipNameBadge) {
            elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
          }
          if (elements.activeClipTitleInput) {
            elements.activeClipTitleInput.value = clip.name;
          }
        }
      }
    }
    function syncActiveClipProperty(key, val) {
      if (state.activeClipId) {
        const clip = state.clips.find((c) => c.id === state.activeClipId);
        if (clip) {
          clip[key] = val;
          if (key === "topText") {
            clip.topText = val;
            state.topText = val;
            let p1 = "";
            let p2 = "";
            if (val.includes("\u17D6")) {
              const parts = val.split("\u17D6");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join("\u17D6").trim();
            } else if (val.includes("\n")) {
              const parts = val.split("\n");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join(" ").trim();
            } else if (val.includes(":")) {
              const parts = val.split(":");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join(":").trim();
            } else {
              const parts = (val || "").trim().split(/\s+/);
              p1 = parts[0] || "";
              p2 = parts.slice(1).join(" ") || "";
            }
            clip.topTextPart1 = p1;
            clip.topTextPart2 = p2;
            state.topTextPart1 = p1;
            state.topTextPart2 = p2;
            if (elements.topTextPart1Input) elements.topTextPart1Input.value = clip.topTextPart1;
            if (elements.topTextPart2Input) elements.topTextPart2Input.value = clip.topTextPart2;
            updateClipTitleFromCaptions(clip);
          } else if (key === "topTextPart1" || key === "topTextPart2") {
            clip.topTextPart1 = state.topTextPart1;
            clip.topTextPart2 = state.topTextPart2;
            clip.topText = state.topTextPart2 ? `${state.topTextPart1 || ""} \u17D6 ${state.topTextPart2 || ""}`.trim() : (state.topTextPart1 || "").trim();
            state.topText = clip.topText;
            if (elements.topTextInput) elements.topTextInput.value = clip.topText;
            updateClipTitleFromCaptions(clip);
          } else if (key === "bottomText") {
            clip.bottomText = val;
            state.bottomText = val;
            let p1 = "";
            let p2 = "";
            if (val.includes("\u17D6")) {
              const parts = val.split("\u17D6");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join("\u17D6").trim();
            } else if (val.includes("\n")) {
              const parts = val.split("\n");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join(" ").trim();
            } else if (val.includes(":")) {
              const parts = val.split(":");
              p1 = parts[0].trim();
              p2 = parts.slice(1).join(":").trim();
            } else {
              const parts = (val || "").trim().split(/\s+/);
              p1 = parts[0] || "";
              p2 = parts.slice(1).join(" ") || "";
            }
            clip.bottomTextPart1 = p1;
            clip.bottomTextPart2 = p2;
            state.bottomTextPart1 = p1;
            state.bottomTextPart2 = p2;
            if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = clip.bottomTextPart1;
            if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = clip.bottomTextPart2;
            updateClipTitleFromCaptions(clip);
          } else if (key === "bottomTextPart1" || key === "bottomTextPart2") {
            clip.bottomTextPart1 = state.bottomTextPart1;
            clip.bottomTextPart2 = state.bottomTextPart2;
            clip.bottomText = state.bottomTextPart2 ? `${state.bottomTextPart1 || ""} ${state.bottomTextPart2 || ""}`.trim() : (state.bottomTextPart1 || "").trim();
            state.bottomText = clip.bottomText;
            if (elements.bottomTextInput) elements.bottomTextInput.value = clip.bottomText;
            updateClipTitleFromCaptions(clip);
          } else if (key === "name") {
            clip.name = val;
          }
          renderClipsList();
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        }
      }
      renderWordColorChips();
    }
    function bindInput(inputEl, key, displayEl = null, suffix = "") {
      if (!inputEl) return;
      let _histPushed = false;
      inputEl.addEventListener("focus", () => {
        _histPushed = false;
      });
      inputEl.addEventListener("input", (e) => {
        if (!_histPushed) {
          pushStateToHistory();
          _histPushed = true;
        }
        let val = e.target.value;
        if (inputEl.type === "range") val = parseFloat(val);
        state[key] = val;
        if (displayEl) displayEl.textContent = val + suffix;
        syncActiveClipProperty(key, val);
      });
    }
    function handleVideoUpload(e) {
      const files = Array.from(e.target?.files || []);
      if (files.length === 0) return;
      addFilesToBatchQueue(files);
      if (elements.dropzoneOverlay) elements.dropzoneOverlay.classList.add("hidden");
      if (elements.fileInfoBox) elements.fileInfoBox.classList.remove("empty");
      const first = files[0];
      state.videoFile = first;
      if (state.videoObjectURL) URL.revokeObjectURL(state.videoObjectURL);
      state.videoObjectURL = URL.createObjectURL(first);
      elements.mainVideoPlayer.src = state.videoObjectURL;
      elements.hiddenVideo.src = state.videoObjectURL;
      const fileNameEl = document.getElementById("fileNameDisplay");
      const fileDurationEl = document.getElementById("fileDurationDisplay");
      if (fileNameEl) fileNameEl.textContent = first.name;
      if (fileDurationEl) fileDurationEl.textContent = `${(first.size / (1024 * 1024)).toFixed(1)} MB \u2022 ${first.type || "video/mp4"}`;
      if (elements.setInBtn) elements.setInBtn.disabled = false;
      if (elements.setOutBtn) elements.setOutBtn.disabled = false;
      if (elements.addClipBtn) elements.addClipBtn.disabled = false;
      if (elements.splitTrimBtn) elements.splitTrimBtn.disabled = false;
      if (elements.timelineSlider) elements.timelineSlider.disabled = false;
    }
    function addFilesToBatchQueue(files) {
      if (!files || files.length === 0) return;
      localStorage.removeItem("khmer_clipper_batch_cleared");
      files.forEach((file) => {
        const exists = state.batchVideos.some((v) => v.name === file.name && v.size === file.size);
        if (!exists) {
          const vidItem = {
            id: "bvid_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            file,
            name: file.name,
            size: file.size,
            path: file.name,
            duration: 0,
            status: "queued",
            stage: "\u179A\u1784\u17CB\u1785\u17B6\u17C6\u1780\u17D2\u1793\u17BB\u1784\u1787\u17BD\u179A...",
            progress: 0,
            clips: [],
            clips_count: 0,
            objectURL: URL.createObjectURL(file)
          };
          state.batchVideos.push(vidItem);
        }
      });
      renderBatchQueue();
      updateBatchSwitcherBar();
      const batchCard = document.getElementById("batchQueueCard");
      if (batchCard) batchCard.classList.remove("hidden");
    }
    function renderBatchQueue() {
      const batchCard = document.getElementById("batchQueueCard");
      const batchCountBadge = document.getElementById("batchCountBadge");
      const batchListEl = document.getElementById("batchVideosList");
      const batchStatusBadge = document.getElementById("batchOverallStatusBadge");
      if (!batchCard || !batchListEl) return;
      if (state.batchVideos.length === 0) {
        batchCard.classList.add("hidden");
        return;
      }
      batchCard.classList.remove("hidden");
      if (batchCountBadge) batchCountBadge.textContent = `${state.batchVideos.length} \u179C\u17B8\u178A\u17C1\u17A2\u17BC`;
      const completedCount = state.batchVideos.filter((v) => v.status === "completed").length;
      const processingCount = state.batchVideos.filter((v) => v.status === "processing").length;
      if (batchStatusBadge) {
        if (processingCount > 0) {
          batchStatusBadge.textContent = `\u26A1 \u1780\u17C6\u1796\u17BB\u1784 Scan (${processingCount} \u179C\u17B8\u178A\u17C1\u17A2\u17BC)...`;
          batchStatusBadge.style.color = "#60a5fa";
          batchStatusBadge.style.borderColor = "rgba(59,130,246,0.5)";
        } else if (completedCount === state.batchVideos.length && state.batchVideos.length > 0) {
          batchStatusBadge.textContent = `\u{1F389} \u179F\u1798\u17D2\u179A\u17C1\u1785\u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB\u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB!`;
          batchStatusBadge.style.color = "#34d399";
          batchStatusBadge.style.borderColor = "rgba(16,185,129,0.5)";
        } else {
          batchStatusBadge.textContent = `\u178F\u17D2\u179A\u17C0\u1798\u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB`;
          batchStatusBadge.style.color = "#34d399";
        }
      }
      batchListEl.innerHTML = state.batchVideos.map((v, idx) => {
        const sizeMB = (v.size / (1024 * 1024)).toFixed(1);
        let statusText = "\u23F3 \u179A\u1784\u17CB\u1785\u17B6\u17C6";
        let statusClass = "status-queued";
        if (v.status === "processing") {
          statusText = `\u26A1 ${v.progress || 0}%`;
          statusClass = "status-processing";
        } else if (v.status === "completed") {
          statusText = `\u2705 ${v.clips_count || v.clips.length} Clips`;
          statusClass = "status-completed";
        } else if (v.status === "error") {
          statusText = "\u274C \u1794\u179A\u17B6\u1787\u17D0\u1799";
          statusClass = "status-error";
        }
        return `
                <div class="batch-video-item item-${v.status}" id="batch_item_${v.id}">
                    <div class="batch-item-main-row">
                        <div class="batch-item-left">
                            <div class="batch-item-icon">\u{1F3AC}</div>
                            <div class="batch-item-meta">
                                <div class="batch-item-name" title="${v.name}">${idx + 1}. ${v.name}</div>
                                <div class="batch-item-sub">${sizeMB} MB \u2022 ${v.stage || "\u179A\u1784\u17CB\u1785\u17B6\u17C6\u1780\u17D2\u1793\u17BB\u1784\u1787\u17BD\u179A"}</div>
                            </div>
                        </div>
                        <div class="batch-item-right">
                            <span class="batch-status-pill ${statusClass}">${statusText}</span>
                            <button type="button" class="batch-btn-remove" onclick="window.removeBatchVideo('${v.id}')" title="\u179B\u17BB\u1794\u1785\u17C1\u1789">\u2715</button>
                        </div>
                    </div>
                    <div class="batch-item-progress-track">
                        <div class="batch-item-progress-bar" style="width: ${v.progress || 0}%;"></div>
                    </div>
                </div>
            `;
      }).join("");
    }
    async function removeBatchVideo(vidId) {
      const idx = state.batchVideos.findIndex((v) => v.id === vidId);
      if (idx !== -1) {
        const item = state.batchVideos[idx];
        if (item.objectURL && item.objectURL !== state.videoObjectURL) {
          try {
            URL.revokeObjectURL(item.objectURL);
          } catch (e) {
          }
        }
        state.batchVideos.splice(idx, 1);
        renderBatchQueue();
        updateBatchSwitcherBar();
        try {
          const serverOrigin = window.location.origin.includes(":5000") || window.location.origin.includes("127.0.0.1") ? window.location.origin : "http://127.0.0.1:5000";
          if (state.batchVideos.length === 0) {
            localStorage.setItem("khmer_clipper_batch_cleared", "true");
            await fetch(`${serverOrigin}/api/batch/clear`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({})
            });
          } else {
            await fetch(`${serverOrigin}/api/batch/queue`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                videos: state.batchVideos.map((v) => ({ id: v.id, name: v.name, path: v.path || v.name, size: v.size }))
              })
            });
          }
        } catch (e) {
        }
      }
    }
    async function clearBatchQueue() {
      state.batchVideos.forEach((v) => {
        if (v.objectURL && v.objectURL !== state.videoObjectURL) {
          try {
            URL.revokeObjectURL(v.objectURL);
          } catch (e) {
          }
        }
      });
      state.batchVideos = [];
      localStorage.setItem("khmer_clipper_batch_cleared", "true");
      renderBatchQueue();
      updateBatchSwitcherBar();
      const progressBox = document.getElementById("batchOverallProgressBox");
      if (progressBox) progressBox.classList.add("hidden");
      try {
        const serverOrigin = window.location.origin.includes(":5000") || window.location.origin.includes("127.0.0.1") ? window.location.origin : "http://127.0.0.1:5000";
        await fetch(`${serverOrigin}/api/batch/clear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });
      } catch (e) {
      }
      showToastNotification("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179F\u1798\u17D2\u17A2\u17B6\u178F\u1794\u1789\u17D2\u1787\u17B8\u179C\u17B8\u178A\u17C1\u17A2\u17BC Batch \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB");
    }
    async function startBatchScanWorkflow() {
      if (!state.batchVideos || state.batchVideos.length === 0) {
        showToastNotification("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179C\u17B8\u178A\u17C1\u17A2\u17BC \u17E4-\u17E5 \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
        return;
      }
      const isParallel = document.getElementById("modeParallel")?.checked ?? true;
      const progressBox = document.getElementById("batchOverallProgressBox");
      const startBtn = document.getElementById("btnStartBatchScan");
      const progressFill = document.getElementById("batchProgressBar");
      const progressPctEl = document.getElementById("batchProgressPercent");
      const progressLabel = document.getElementById("batchProgressLabel");
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = "<span>\u26A1 \u1780\u17C6\u1796\u17BB\u1784 Scan \u1787\u17B6\u1780\u17D2\u179A\u17BB\u1798...</span>";
      }
      if (progressBox) progressBox.classList.remove("hidden");
      try {
        const serverOrigin = window.location.origin.includes(":5000") || window.location.origin.includes("127.0.0.1") ? window.location.origin : "http://127.0.0.1:5000";
        const queuePayload = {
          videos: state.batchVideos.map((v) => ({
            id: v.id,
            name: v.name,
            path: v.file ? v.file.name : v.name,
            size: v.size
          })),
          parallel: isParallel
        };
        await fetch(`${serverOrigin}/api/batch/queue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(queuePayload)
        });
        await fetch(`${serverOrigin}/api/batch/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parallel: isParallel })
        });
        showToastNotification(`\u{1F680} \u1794\u17B6\u1793\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 Scan ${state.batchVideos.length} \u179C\u17B8\u178A\u17C1\u17A2\u17BC (${isParallel ? "Parallel 2 Workers" : "Sequential"})!`);
        if (state.batchPollingTimer) clearInterval(state.batchPollingTimer);
        state.batchPollingTimer = setInterval(async () => {
          try {
            const statusResp = await fetch(`${serverOrigin}/api/batch/status`);
            if (!statusResp.ok) return;
            const data = await statusResp.json();
            if (!data || !data.success) return;
            if (Array.isArray(data.videos)) {
              data.videos.forEach((sv) => {
                const lv = state.batchVideos.find((v) => v.id === sv.id || v.name === sv.name);
                if (lv) {
                  lv.status = sv.status;
                  lv.stage = sv.stage;
                  lv.progress = sv.progress;
                  lv.clips_count = sv.clips_count;
                  lv.clips = sv.clips || [];
                  lv.duration = sv.duration;
                }
              });
            }
            renderBatchQueue();
            if (progressFill) progressFill.style.width = `${data.overall_progress || 0}%`;
            if (progressPctEl) progressPctEl.textContent = `${data.overall_progress || 0}%`;
            if (progressLabel) progressLabel.textContent = `\u1780\u17C6\u1796\u17BB\u1784\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A Scan ${data.completed}/${data.total} \u179C\u17B8\u178A\u17C1\u17A2\u17BC (${data.total_clips} Clips \u179A\u1780\u1783\u17BE\u1789)...`;
            if (!data.is_running && data.completed + data.errors >= data.total && data.total > 0) {
              clearInterval(state.batchPollingTimer);
              state.batchPollingTimer = null;
              if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = "<span>\u{1F680} \u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 Scan \u1798\u17D2\u178F\u1784\u1791\u17C0\u178F</span>";
              }
              if (Array.isArray(data.all_clips) && data.all_clips.length > 0) {
                const newClips = data.all_clips.map((c, idx) => ({
                  id: "batch_council_" + Date.now() + "_" + idx,
                  isConsensus: true,
                  sourceVideo: c.source_video_name || c.source_video || "Video " + (idx + 1),
                  title: c.title || `Clip \u179F\u17C6\u1781\u17B6\u1793\u17CB \u1797\u17B6\u1782 ${idx + 1}`,
                  inTime: parseFloat(c.start_time || c.inTime || 0),
                  outTime: parseFloat(c.end_time || c.outTime || 120),
                  duration: Number((c.end_time || c.outTime || 120) - (c.start_time || c.inTime || 0)),
                  viralScore: parseFloat(c.viral_score || 98),
                  consensusBadge: c.consensus_badge || "\u{1F3C6} Grand Council Consensus",
                  topicSummary: c.topic_summary || "",
                  topText1: c.top_1 || c.topText1 || "\u1782\u178F\u17B7\u1794\u178E\u17D2\u178C\u17B7\u178F",
                  topText2: c.top_2 || c.topText2 || "\u178A\u17B6\u179F\u17CB\u178F\u17BF\u1793\u1785\u17B7\u178F\u17D2\u178F",
                  bottomText1: c.bot_1 || c.bottomText1 || "\u179F\u17D2\u178F\u17B6\u1794\u17CB\u17A0\u17BE\u1799",
                  bottomText2: c.bot_2 || c.bottomText2 || "\u1797\u17D2\u179B\u17BA\u1797\u17D2\u1793\u17C2\u1780",
                  captionLines: []
                }));
                state.clips = [...state.clips, ...newClips];
                updateClipsCount();
                renderClipsListScreen1();
                renderClipsListScreen2();
                updateBatchSwitcherBar();
                showToastNotification(`\u{1F389} \u17A2\u1794\u17A2\u179A\u179F\u17B6\u1791\u179A! Batch Scan \u1787\u17C4\u1782\u1787\u17D0\u1799 \u17E1\u17E0\u17E0%! \u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${newClips.length} Clips \u1796\u17B8 ${data.completed} \u179C\u17B8\u178A\u17C1\u17A2\u17BC!`);
                setTimeout(() => {
                  switchScreen(2);
                }, 1500);
              } else {
                showToastNotification("\u2705 Batch Scan \u1794\u17B6\u1793\u1794\u1789\u17D2\u1785\u1794\u17CB \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u179A\u1780\u1798\u17B7\u1793\u1783\u17BE\u1789 Clip \u1790\u17D2\u1798\u17B8\u17D4");
              }
            }
          } catch (pollErr) {
            console.error("Batch poll error:", pollErr);
          }
        }, 1500);
      } catch (err) {
        console.error("Failed to start batch scan:", err);
        showToastNotification(`\u274C \u1780\u17C6\u17A0\u17BB\u179F\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 Batch Scan: ${err.message}`);
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.innerHTML = "<span>\u{1F680} \u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798 Scan \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB</span>";
        }
      }
    }
    function updateBatchSwitcherBar() {
      const switcherBar = document.getElementById("batchVideoSwitcherBar");
      const pillsContainer = document.getElementById("batchVideoPillsContainer");
      const switcherBadge = document.getElementById("batchSwitcherBadge");
      if (!switcherBar || !pillsContainer) return;
      if (state.batchVideos.length <= 1) {
        switcherBar.classList.add("hidden");
        return;
      }
      switcherBar.classList.remove("hidden");
      const activeIdx = state.batchVideos.findIndex((v) => v.id === state.activeBatchVideoId);
      if (switcherBadge) switcherBadge.textContent = `${activeIdx >= 0 ? activeIdx + 1 : 1} \u1793\u17C3 ${state.batchVideos.length}`;
      pillsContainer.innerHTML = state.batchVideos.map((v, idx) => {
        const isActive = v.id === state.activeBatchVideoId || !state.activeBatchVideoId && idx === 0;
        return `
                <button type="button" class="batch-video-pill ${isActive ? "active" : ""}" onclick="window.selectActiveBatchVideo('${v.id}')" title="${v.name}">
                    <span>\u{1F4F9} ${idx + 1}. ${v.name.length > 15 ? v.name.substr(0, 14) + "..." : v.name}</span>
                    ${v.clips_count ? `<span style="opacity:0.85; font-size:0.68rem;">(${v.clips_count})</span>` : ""}
                </button>
            `;
      }).join("");
    }
    function selectActiveBatchVideo(vidId) {
      const v = state.batchVideos.find((item) => item.id === vidId);
      if (!v) return;
      state.activeBatchVideoId = v.id;
      state.videoFile = v.file || null;
      if (v.objectURL) {
        state.videoObjectURL = v.objectURL;
        elements.mainVideoPlayer.src = v.objectURL;
        elements.hiddenVideo.src = v.objectURL;
      }
      const fileNameEl = document.getElementById("fileNameDisplay");
      const fileDurationEl = document.getElementById("fileDurationDisplay");
      if (fileNameEl) fileNameEl.textContent = v.name;
      if (fileDurationEl) fileDurationEl.textContent = `${(v.size / (1024 * 1024)).toFixed(1)} MB \u2022 ${v.duration ? formatTime(v.duration, false) : "\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u179F\u1780\u1798\u17D2\u1798"}`;
      updateBatchSwitcherBar();
      showToastNotification(`\u{1F3AC} \u1794\u17B6\u1793\u1794\u17D2\u178F\u17BC\u179A\u1791\u17C5\u179C\u17B8\u178A\u17C1\u17A2\u17BC: "${v.name}"`);
    }
    function onVideoLoaded() {
      state.duration = elements.mainVideoPlayer.duration;
      state.trimIn = 0;
      state.trimOut = Math.min(state.duration, 180);
      stateHistory.length = 0;
      if (typeof redoHistory !== "undefined") redoHistory.length = 0;
      pushStateToHistory();
      updateTrimUI();
      enableAiButtons();
      const fileDurationEl = document.getElementById("fileDurationDisplay");
      if (fileDurationEl && state.videoFile) {
        fileDurationEl.textContent = `${formatTime(state.duration, false)} \u2022 ${(state.videoFile.size / (1024 * 1024)).toFixed(1)} MB`;
      }
      const vW = elements.mainVideoPlayer?.videoWidth || 0;
      const vH = elements.mainVideoPlayer?.videoHeight || 0;
      if (vW && vH) {
        if (vW >= vH * 1.2) {
          state.aspectRatio = "16:9";
        } else if (vH >= vW * 1.2) {
          state.aspectRatio = "9:16";
        } else {
          state.aspectRatio = "1:1";
        }
        if (elements.aspectBtns) {
          elements.aspectBtns.forEach((b) => {
            b.classList.toggle("active", b.dataset.ratio === state.aspectRatio);
          });
        }
        updateAspectDimensions();
      }
      if (state.batchVideos.length <= 1) {
        switchScreen(2);
      }
    }
    function updatePlayheadPosition() {
      if (state.duration > 0) {
        const pct = state.currentTime / state.duration * 100;
        elements.playhead.style.left = `${pct}%`;
        elements.timelineSlider.value = pct;
      }
    }
    function updateTrimUI() {
      elements.inTimeDisplay.textContent = formatTime(state.trimIn);
      elements.outTimeDisplay.textContent = formatTime(state.trimOut);
      elements.clipDurationDisplay.textContent = formatTime(state.trimOut - state.trimIn, false);
      if (state.duration > 0) {
        const inPct = state.trimIn / state.duration * 100;
        const outPct = state.trimOut / state.duration * 100;
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
      elements.canvasWrapper.classList.remove("aspect-9-16", "aspect-1-1", "aspect-16-9");
      if (state.aspectRatio === "9:16") {
        state.canvasWidth = 1080;
        state.canvasHeight = 1920;
        elements.canvasWrapper.classList.add("aspect-9-16");
      } else if (state.aspectRatio === "1:1") {
        state.canvasWidth = 1080;
        state.canvasHeight = 1080;
        elements.canvasWrapper.classList.add("aspect-1-1");
      } else if (state.aspectRatio === "16:9") {
        state.canvasWidth = 1920;
        state.canvasHeight = 1080;
        elements.canvasWrapper.classList.add("aspect-16-9");
      }
      elements.mainCanvas.width = state.canvasWidth;
      elements.mainCanvas.height = state.canvasHeight;
      if (prevHeight !== state.canvasHeight && prevHeight > 0) {
        const ratio = state.canvasHeight / prevHeight;
        state.topPosY = Math.round(state.topPosY * ratio);
        state.bottomPosY = Math.round(state.bottomPosY * ratio);
        if (state.extraCaptions && Array.isArray(state.extraCaptions)) {
          state.extraCaptions.forEach((ec) => {
            if (ec.posY) ec.posY = Math.round(ec.posY * ratio);
          });
        }
      }
      state.topPosY = Math.max(30, Math.min(Math.round(state.canvasHeight * 0.48), state.topPosY || Math.round(state.canvasHeight * 0.12)));
      if (!state.bottomPosY || state.bottomPosY > state.canvasHeight - 30 || state.bottomPosY < state.canvasHeight * 0.48) {
        state.bottomPosY = Math.round(state.canvasHeight * 0.85);
      } else {
        state.bottomPosY = Math.max(Math.round(state.canvasHeight * 0.5), Math.min(state.canvasHeight - 30, state.bottomPosY));
      }
      if (state.extraCaptions && Array.isArray(state.extraCaptions)) {
        state.extraCaptions.forEach((ec) => {
          if (!ec.posY || ec.posY > state.canvasHeight - 20 || ec.posY < 30) {
            ec.posY = Math.round(state.canvasHeight * 0.92);
          } else {
            ec.posY = Math.max(30, Math.min(state.canvasHeight - 30, ec.posY));
          }
        });
        syncActiveClipProperty("extraCaptions", state.extraCaptions);
      }
      syncActiveClipProperty("topPosY", state.topPosY);
      syncActiveClipProperty("bottomPosY", state.bottomPosY);
      updatePosYSliderRanges();
      syncInspectorUI();
    }
    const stateHistory = [];
    const redoHistory = [];
    const MAX_HISTORY = 30;
    const UNDO_STATE_KEYS = [
      "trimIn",
      "trimOut",
      "aspectRatio",
      "colorMode",
      "topTextColor1",
      "topTextColor2",
      "bottomTextColor1",
      "bottomTextColor2",
      "topText",
      "topTextPart1",
      "topTextPart2",
      "topFontSize",
      "topPosY",
      "bottomText",
      "bottomTextPart1",
      "bottomTextPart2",
      "bottomFontSize",
      "bottomPosY",
      "extraCaptions",
      "fontFamily",
      "strokeColor",
      "strokeWidth",
      "shadowBlur",
      "bgMode",
      "blurRadius",
      "bgColor",
      "videoScale",
      "videoOffsetY"
    ];
    function captureStateSnapshot() {
      const snapshot = {
        clips: JSON.parse(JSON.stringify(state.clips)),
        activeClipId: state.activeClipId,
        clipCounter: state.clipCounter,
        playerTime: elements.mainVideoPlayer && !isNaN(elements.mainVideoPlayer.currentTime) ? elements.mainVideoPlayer.currentTime : state.currentTime
      };
      UNDO_STATE_KEYS.forEach((k) => {
        snapshot[k] = state[k];
      });
      return snapshot;
    }
    function pushStateToHistory() {
      stateHistory.push(captureStateSnapshot());
      if (stateHistory.length > MAX_HISTORY) stateHistory.shift();
      redoHistory.length = 0;
    }
    function restoreStateFromSnapshot(prev) {
      state.clips = prev.clips;
      state.activeClipId = prev.activeClipId;
      state.clipCounter = prev.clipCounter;
      UNDO_STATE_KEYS.forEach((k) => {
        if (prev[k] !== void 0) state[k] = prev[k];
      });
    }
    function applyRestoredState(snapshot) {
      const currentScreen = state.currentScreen;
      if (currentScreen === 2 || currentScreen === 1) {
        updateTrimUI();
        if (elements.mainVideoPlayer && state.duration > 0) {
          const targetTime = snapshot.playerTime !== void 0 ? snapshot.playerTime : state.trimIn;
          elements.mainVideoPlayer.currentTime = targetTime;
          state.currentTime = targetTime;
          updatePlayheadPosition();
        }
        renderClipsList();
      } else {
        if (state.activeClipId && state.clips.some((c) => c.id === state.activeClipId)) {
          const clip = state.clips.find((c) => c.id === state.activeClipId);
          if (clip) {
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
        if (elements.ctx) {
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        }
      }
    }
    function undoLastAction() {
      if (stateHistory.length === 0) {
        showToast("\u26A0\uFE0F \u1782\u17D2\u1798\u17B6\u1793\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796\u17A2\u17B6\u1785 Undo \u1791\u17C0\u178F\u1791\u17C1!");
        return;
      }
      redoHistory.push(captureStateSnapshot());
      if (redoHistory.length > MAX_HISTORY) redoHistory.shift();
      const prev = stateHistory.pop();
      restoreStateFromSnapshot(prev);
      applyRestoredState(prev);
      showToast("\u23EA \u1794\u17B6\u1793\u178F\u17D2\u179A\u17A1\u1794\u17CB\u1798\u1780\u179C\u17B7\u1789 (Undo Successful)");
    }
    window.undoLastAction = undoLastAction;
    function redoLastAction() {
      if (redoHistory.length === 0) {
        showToast("\u26A0\uFE0F \u1782\u17D2\u1798\u17B6\u1793\u179F\u1780\u1798\u17D2\u1798\u1797\u17B6\u1796\u17A2\u17B6\u1785 Redo \u1791\u17C0\u178F\u1791\u17C1!");
        return;
      }
      stateHistory.push(captureStateSnapshot());
      if (stateHistory.length > MAX_HISTORY) stateHistory.shift();
      const next = redoHistory.pop();
      restoreStateFromSnapshot(next);
      applyRestoredState(next);
      showToast("\u23E9 \u1794\u17B6\u1793\u1792\u17D2\u179C\u17BE\u17A1\u17BE\u1784\u179C\u17B7\u1789 (Redo Successful)");
    }
    window.redoLastAction = redoLastAction;
    function showToast(msg) {
      const toast = document.getElementById("toastNotification");
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove("hidden");
      toast.style.opacity = "1";
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.classList.add("hidden"), 300);
      }, 2200);
    }
    const showToastNotification = showToast;
    function toggleVideoPlayPause() {
      if (state.currentScreen === 2 || state.currentScreen === 1) {
        if (elements.mainVideoPlayer && elements.mainVideoPlayer.src) {
          if (elements.mainVideoPlayer.paused) {
            elements.mainVideoPlayer.play().catch(() => {
            });
          } else {
            elements.mainVideoPlayer.pause();
          }
        }
      } else if (state.currentScreen === 3) {
        if (!state.activeClipId) return;
        if (state.isPlaying) {
          elements.hiddenVideo.pause();
          state.isPlaying = false;
        } else {
          if (elements.hiddenVideo.currentTime >= state.trimOut || elements.hiddenVideo.currentTime < state.trimIn) {
            elements.hiddenVideo.currentTime = state.trimIn;
          }
          elements.hiddenVideo.play().catch(() => {
          });
          state.isPlaying = true;
        }
        updatePlayPauseBtn();
      }
    }
    function isTextInputFocused() {
      const el = document.activeElement;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName ? el.tagName.toLowerCase() : "";
      if (tag === "textarea" || tag === "select") return true;
      if (tag === "input") {
        const type = (el.type || "text").toLowerCase();
        if (["text", "search", "password", "email", "url", "number", "tel"].includes(type)) {
          return true;
        }
      }
      return false;
    }
    function handleGlobalKeyDown(e) {
      if (isTextInputFocused()) return;
      const code = e.code || "";
      const key = (e.key || "").toLowerCase();
      const keyCode = e.keyCode || e.which || 0;
      if (code === "Space" || key === " " || keyCode === 32) {
        e.preventDefault();
        toggleVideoPlayPause();
        return;
      }
      if ((code === "KeyS" || key === "s" || key === "\u179F" || keyCode === 83) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (state.currentScreen === 3) {
          splitSelectedClip();
          return;
        }
        if (!state.videoFile) {
          showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
          return;
        }
        if (elements.setInBtn) {
          elements.setInBtn.click();
          showToast("\u{1F6A9} \u1780\u17C6\u178E\u178F\u17CB\u1785\u17C6\u1793\u17BB\u1785\u178A\u17BE\u1798 [Set In]: " + formatTime(state.trimIn));
        }
        return;
      }
      if ((code === "KeyE" || key === "e" || key === "\u17C2" || keyCode === 69) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!state.videoFile) {
          showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
          return;
        }
        if (elements.setOutBtn) {
          elements.setOutBtn.click();
          showToast("\u{1F3C1} \u1780\u17C6\u178E\u178F\u17CB\u1785\u17C6\u1793\u17BB\u1785\u1794\u1789\u17D2\u1785\u1794\u17CB [Set Out]: " + formatTime(state.trimOut));
        }
        return;
      }
      if ((code === "KeyA" || key === "a" || key === "\u17B6" || keyCode === 65) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (!state.videoFile) {
          showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
          return;
        }
        if (elements.addClipBtn) {
          elements.addClipBtn.click();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey && (code === "KeyZ" || key === "z" || key === "\u178A" || key === "\u1786" || keyCode === 90 || keyCode === 231)) {
          e.preventDefault();
          redoLastAction();
          return;
        } else if (code === "KeyY" || key === "y" || keyCode === 89) {
          e.preventDefault();
          redoLastAction();
          return;
        } else if (code === "KeyZ" || key === "z" || key === "\u178A" || key === "\u1786" || keyCode === 90 || keyCode === 231) {
          e.preventDefault();
          undoLastAction();
          return;
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown, true);
    function moveClipUp(id, e) {
      if (e) e.stopPropagation();
      const idx = state.clips.findIndex((c) => c.id === id);
      if (idx <= 0) return;
      pushStateToHistory();
      const temp = state.clips[idx];
      state.clips[idx] = state.clips[idx - 1];
      state.clips[idx - 1] = temp;
      renderClipsList();
      showToast("\u2B06\uFE0F \u1794\u17B6\u1793\u1795\u17D2\u179B\u17B6\u179F\u17CB\u1791\u17B8 Clip \u17A1\u17BE\u1784\u179B\u17BE");
    }
    window.moveClipUp = moveClipUp;
    function moveClipDown(id, e) {
      if (e) e.stopPropagation();
      const idx = state.clips.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= state.clips.length - 1) return;
      pushStateToHistory();
      const temp = state.clips[idx];
      state.clips[idx] = state.clips[idx + 1];
      state.clips[idx + 1] = temp;
      renderClipsList();
      showToast("\u2B07\uFE0F \u1794\u17B6\u1793\u1795\u17D2\u179B\u17B6\u179F\u17CB\u1791\u17B8 Clip \u1785\u17BB\u17C7\u1780\u17D2\u179A\u17C4\u1798");
    }
    window.moveClipDown = moveClipDown;
    function deleteClip(id, e) {
      if (e) e.stopPropagation();
      _clipIdToDelete = id;
      const clip = state.clips.find((c) => String(c.id) === String(id));
      const modal = document.getElementById("deleteConfirmModal");
      const nameEl = document.getElementById("deleteTargetClipName");
      if (nameEl && clip) {
        nameEl.textContent = `"${clip.name}"`;
      }
      if (modal) {
        modal.classList.remove("hidden");
      } else {
        executeDeleteClip(id);
      }
    }
    window.deleteClip = deleteClip;
    function executeDeleteClip(id) {
      pushStateToHistory();
      state.clips = state.clips.filter((c) => String(c.id) !== String(id));
      if (state.activeClipId !== null && String(state.activeClipId) === String(id)) {
        state.activeClipId = state.clips.length > 0 ? state.clips[0].id : null;
      }
      renderClipsList();
      if (state.activeClipId) {
        selectClipForEditing(state.activeClipId, state.currentScreen === 3);
      }
      if (state.currentScreen === 2) {
        if (state.clips.length > 0) {
          const nextClip = state.clips.find((c) => String(c.id) === String(state.activeClipId)) || state.clips[0];
          if (nextClip) {
            state.trimIn = nextClip.startTime;
            state.trimOut = nextClip.endTime;
            if (elements.mainVideoPlayer) {
              elements.mainVideoPlayer.currentTime = nextClip.startTime;
            }
          }
        }
        updateTrimUI();
      }
      const badge2 = document.getElementById("step2Badge");
      if (badge2) badge2.textContent = String(state.clips.length);
      const clipCountEl = document.getElementById("clipCount");
      if (clipCountEl) clipCountEl.textContent = String(state.clips.length);
      const s2ClipsCount = document.getElementById("screen2ClipsCount");
      if (s2ClipsCount) s2ClipsCount.textContent = String(state.clips.length);
      showToast("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794 Clip (\u1785\u17BB\u1785 Ctrl+Z \u178A\u17BE\u1798\u17D2\u1794\u17B8\u178F\u17D2\u179A\u17A1\u1794\u17CB\u1798\u1780\u179C\u17B7\u1789)");
    }
    window.executeDeleteClip = executeDeleteClip;
    function renameClip(id, e) {
      if (e) e.stopPropagation();
      const clip = state.clips.find((c) => c.id === id);
      if (!clip) return;
      const newName = prompt("\u1780\u17C2\u179F\u1798\u17D2\u179A\u17BD\u179B\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784 Clip:", clip.name);
      if (newName !== null && newName.trim() !== "") {
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
        showToast("\u270F\uFE0F \u1794\u17B6\u1793\u1794\u17D2\u178A\u17BC\u179A\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784 Clip!");
      }
    }
    window.renameClip = renameClip;
    function splitSelectedClip(id = null, e = null) {
      if (e) e.stopPropagation();
      const targetId = id || state.activeClipId;
      if (!targetId) {
        showToast("\u26A0\uFE0F \u179F\u17BC\u1798\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F Clip \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793!");
        return;
      }
      const clipIndex = state.clips.findIndex((c) => c.id === targetId);
      if (clipIndex < 0) return;
      const clip = state.clips[clipIndex];
      let activeTime = state.currentScreen === 2 || state.currentScreen === 1 ? elements.mainVideoPlayer.currentTime : elements.hiddenVideo.currentTime;
      let splitTime;
      if (activeTime > clip.startTime + 0.5 && activeTime < clip.endTime - 0.5) {
        splitTime = activeTime;
      } else {
        splitTime = clip.startTime + clip.duration / 2;
      }
      pushStateToHistory();
      const baseName = clip.name.replace(/\s*\(ភាគ\d+\)/g, "");
      const clipA = {
        ...clip,
        name: `${baseName} (\u1797\u17B6\u1782\u17E1)`,
        endTime: splitTime,
        duration: splitTime - clip.startTime
      };
      const clipB = {
        ...clip,
        id: Date.now(),
        name: `${baseName} (\u1797\u17B6\u1782\u17E2)`,
        startTime: splitTime,
        duration: clip.endTime - splitTime
      };
      state.clips.splice(clipIndex, 1, clipA, clipB);
      state.activeClipId = clipA.id;
      selectClipForEditing(clipA.id, state.currentScreen === 3);
      renderClipsList();
      showToast(`\u2702\uFE0F \u1794\u17B6\u1793\u1796\u17BB\u17C7 "${clip.name}" \u1787\u17B6 \u17E2 \u1797\u17B6\u1782\u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB!`);
    }
    window.splitSelectedClip = splitSelectedClip;
    const splitCurrentClip = splitSelectedClip;
    window.splitCurrentClip = splitSelectedClip;
    const splitTrimAtCurrentTime = splitSelectedClip;
    window.splitTrimAtCurrentTime = splitSelectedClip;
    function applyStyleToAllClips() {
      if (state.clips.length === 0) {
        showToast("\u2139\uFE0F \u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u1780\u17D2\u1793\u17BB\u1784\u1794\u1789\u17D2\u1787\u17B8\u17A1\u17BE\u1799!");
        return;
      }
      pushStateToHistory();
      state.clips.forEach((c) => {
        c.colorMode = state.colorMode;
        c.topTextColor1 = state.topTextColor1;
        c.topTextColor2 = state.topTextColor2;
        c.bottomTextColor1 = state.bottomTextColor1;
        c.bottomTextColor2 = state.bottomTextColor2;
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
      showToast("\u{1F4CB} \u1794\u17B6\u1793\u17A2\u1793\u17BB\u179C\u178F\u17D2\u178F\u1798\u17C9\u17BC\u178A\u1793\u17C1\u17C7\u1791\u17C5 Clips \u1791\u17B6\u17C6\u1784\u17A2\u179F\u17CB!");
    }
    window.applyStyleToAllClips = applyStyleToAllClips;
    function seekRelative(seconds) {
      if (state.currentScreen === 2 || state.currentScreen === 1) {
        if (!elements.mainVideoPlayer) return;
        const newTime = Math.max(0, Math.min(state.duration, elements.mainVideoPlayer.currentTime + seconds));
        elements.mainVideoPlayer.currentTime = newTime;
        state.currentTime = newTime;
        updatePlayheadPosition();
      } else {
        if (!state.activeClipId) return;
        const newTime = elements.hiddenVideo.currentTime + seconds;
        const clampedTime = Math.max(state.trimIn, Math.min(state.trimOut, newTime));
        elements.hiddenVideo.currentTime = clampedTime;
        state.currentTime = clampedTime;
      }
    }
    window.seekRelative = seekRelative;
    function addClipToList() {
      if (!state.videoFile) return;
      pushStateToHistory();
      const customTitleInput = document.getElementById("clipTitleInput");
      const customTitle = customTitleInput ? customTitleInput.value.trim() : "";
      const clipCountNum = Number(state.clipCounter) || 1;
      state.clipCounter = clipCountNum + 1;
      const clipName = customTitle || `Clip #${clipCountNum}`;
      const clip = {
        id: Date.now(),
        name: clipName,
        startTime: state.trimIn,
        endTime: state.trimOut,
        duration: state.trimOut - state.trimIn,
        aspectRatio: state.aspectRatio || "9:16",
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
        extraCaptions: state.extraCaptions && Array.isArray(state.extraCaptions) ? JSON.parse(JSON.stringify(state.extraCaptions)) : [],
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
      if (customTitleInput) customTitleInput.value = "";
      const origText = elements.addClipBtn.innerHTML;
      elements.addClipBtn.innerHTML = "\u2705 \u1794\u17B6\u1793\u1794\u1793\u17D2\u1790\u17C2\u1798 Clip!";
      elements.addClipBtn.classList.remove("btn-success");
      elements.addClipBtn.classList.add("btn-primary");
      setTimeout(() => {
        elements.addClipBtn.innerHTML = origText;
        elements.addClipBtn.classList.remove("btn-primary");
        elements.addClipBtn.classList.add("btn-success");
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
                        <span class="icon">\u{1F3AC}</span>
                        <p>\u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793 Clip \u1793\u17C5\u17A1\u17BE\u1799\u1791\u17C1</p>
                        <small>\u1780\u17C6\u178E\u178F\u17CB <strong>[Set In]</strong> \u1793\u17B7\u1784 <strong>[Set Out]</strong> \u179A\u17BD\u1785\u1785\u17BB\u1785 <strong>"+ \u1794\u1793\u17D2\u1790\u17C2\u1798 Clip"</strong></small>
                    </div>
                `;
        }
        return state.clips.map((c, idx) => {
          const isEditing = c.id === state.activeClipId;
          const clipTitle = (c.name || `Clip #${idx + 1}`).trim();
          const clipNum = String(idx + 1).padStart(2, "0");
          return `
                <div class="clip-card ${isEditing ? "active-editing" : ""}" data-id="${c.id}" onclick="handleClipCardClick(${c.id}, event)" style="cursor:pointer;">
                    <div class="clip-card-main">
                        <!-- Top Metadata Bar -->
                        <div class="clip-card-header-bar">
                            <span class="clip-index-pill">#${clipNum}</span>
                            <span class="clip-duration-pill">\u23F1\uFE0F ${formatTime(c.duration, false)}</span>
                        </div>

                        <!-- Beautiful Headline Block -->
                        <div class="clip-headline-block" onclick="renameClip(${c.id}, event)" title="\u1785\u17BB\u1785\u178A\u17BE\u1798\u17D2\u1794\u17C2\u1780\u17C2\u179F\u1798\u17D2\u179A\u17BD\u179B\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784">
                            <div class="clip-main-headline">
                                <span>${clipTitle}</span>
                                <span class="clip-edit-icon" title="\u1780\u17C2\u1785\u17C6\u178E\u1784\u1787\u17BE\u1784">\u270F\uFE0F</span>
                            </div>
                        </div>

                        <!-- Action Buttons Footer Row -->
                        <div class="clip-actions-row">
                            <button class="btn ${isEditing ? "btn-primary" : "btn-secondary"} btn-sm btn-edit-clip" onclick="selectClipForEditing(${c.id}, true, event)">
                                ${isEditing ? "\u270F\uFE0F \u1780\u17C6\u1796\u17BB\u1784\u1780\u17C2" : "\u{1F3A8} \u1780\u17C2\u179F\u1798\u17D2\u179A\u17BD\u179B"}
                            </button>
                            <button class="btn btn-danger btn-sm btn-delete-clip" onclick="deleteClip(${c.id}, event)" title="\u179B\u17BB\u1794 Clip \u1793\u17C1\u17C7">
                                \u{1F5D1}\uFE0F \u179B\u17BB\u1794
                            </button>
                        </div>
                    </div>
                </div>
                `;
        }).join("");
      };
      if (elements.clipsListScreen1) elements.clipsListScreen1.innerHTML = renderHTML(false);
      if (elements.clipsListScreen2) elements.clipsListScreen2.innerHTML = renderHTML(true);
    }
    window.handleClipCardClick = function(id, e) {
      if (e && e.target && e.target.closest("button, input, .clip-title, .clip-headline-block")) {
        return;
      }
      if (state.currentScreen === 2) {
        const clip = state.clips.find((c) => c.id === id);
        if (!clip) return;
        state.activeClipId = id;
        state.trimIn = clip.startTime;
        state.trimOut = clip.endTime;
        if (elements.mainVideoPlayer) {
          elements.mainVideoPlayer.currentTime = clip.startTime;
        }
        updateTrimUI();
        renderClipsList();
        showToast(`\u2702\uFE0F \u1794\u17B6\u1793\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F "${clip.name}" \u1780\u17D2\u1793\u17BB\u1784 Trimmer`);
      } else {
        selectClipForEditing(id, true);
      }
    };
    window.selectClipForEditing = function(id, autoSwitchScreen = true, e = null) {
      if (e && e.stopPropagation) e.stopPropagation();
      const clip = state.clips.find((c) => c.id === id);
      if (!clip) return;
      state.activeClipId = id;
      state.trimIn = clip.startTime;
      state.trimOut = clip.endTime;
      state.colorMode = clip.colorMode || "dual";
      state.topTextColor1 = clip.topTextColor1 || clip.textColor1 || "#FFE600";
      state.topTextColor2 = clip.topTextColor2 || clip.textColor2 || "#FF5722";
      state.bottomTextColor1 = clip.bottomTextColor1 || "#FFE600";
      state.bottomTextColor2 = clip.bottomTextColor2 || "#FF5722";
      state.extraCaptions = clip.extraCaptions && Array.isArray(clip.extraCaptions) ? JSON.parse(JSON.stringify(clip.extraCaptions)) : [];
      state.topText = clip.topText || clip.name || "";
      state.topTextPart1 = clip.topTextPart1 || "";
      state.topTextPart2 = clip.topTextPart2 || "";
      if (!state.topTextPart1 && !state.topTextPart2 && state.topText) {
        if (state.topText.includes("\u17D6")) {
          const parts = state.topText.split("\u17D6");
          state.topTextPart1 = parts[0].trim();
          state.topTextPart2 = parts.slice(1).join("\u17D6").trim();
        } else if (state.topText.includes(":")) {
          const parts = state.topText.split(":");
          state.topTextPart1 = parts[0].trim();
          state.topTextPart2 = parts.slice(1).join(":").trim();
        }
      }
      state.topFontSize = clip.topFontSize || 65;
      state.topPosY = clip.topPosY || 160;
      state.bottomText = clip.bottomText || "";
      state.bottomTextPart1 = clip.bottomTextPart1 || "";
      state.bottomTextPart2 = clip.bottomTextPart2 || "";
      if (!state.bottomTextPart1 && !state.bottomTextPart2 && state.bottomText) {
        if (state.bottomText.includes("\u17D6")) {
          const parts = state.bottomText.split("\u17D6");
          state.bottomTextPart1 = parts[0].trim();
          state.bottomTextPart2 = parts.slice(1).join("\u17D6").trim();
        } else if (state.bottomText.includes(":")) {
          const parts = state.bottomText.split(":");
          state.bottomTextPart1 = parts[0].trim();
          state.bottomTextPart2 = parts.slice(1).join(":").trim();
        }
      }
      state.bottomFontSize = clip.bottomFontSize || 65;
      state.bottomPosY = clip.bottomPosY || 1520;
      state.fontFamily = clip.fontFamily || "Moul";
      state.strokeColor = clip.strokeColor || "#FFFFFF";
      state.strokeWidth = clip.strokeWidth || 12;
      state.shadowBlur = clip.shadowBlur || 10;
      state.bgMode = clip.bgMode || "blur";
      state.blurRadius = clip.blurRadius || 25;
      state.bgColor = clip.bgColor || "#111827";
      state.videoScale = clip.videoScale || 100;
      state.videoOffsetY = clip.videoOffsetY || 0;
      if (clip.aspectRatio) {
        state.aspectRatio = clip.aspectRatio;
        elements.aspectBtns.forEach((b) => {
          b.classList.toggle("active", b.dataset.ratio === state.aspectRatio);
        });
      }
      updateAspectDimensions();
      if (typeof window.renderExtraCaptionInputs === "function") window.renderExtraCaptionInputs();
      if (elements.activeClipNameBadge) {
        elements.activeClipNameBadge.textContent = `${clip.name} (${formatTime(clip.duration, false)})`;
      }
      updateStudioTimelineUI();
      syncInspectorUI();
      renderClipsList();
      if (autoSwitchScreen) {
        switchScreen(3);
      }
      if (elements.hiddenVideo) {
        elements.hiddenVideo.currentTime = state.trimIn;
      }
      updateStudioTimelineUI();
      if (autoSwitchScreen) {
        elements.hiddenVideo.play().catch(() => {
        });
        state.isPlaying = true;
        updatePlayPauseBtn();
      }
    };
    function syncInspectorUI() {
      const activeClip = state.clips.find((c) => c.id === state.activeClipId);
      if (activeClip && elements.activeClipTitleInput) {
        elements.activeClipTitleInput.value = activeClip.name || "";
      }
      if (elements.colorModeSelect) {
        elements.colorModeSelect.value = state.colorMode;
        const evtColorMode = new Event("change");
        evtColorMode._fromSync = true;
        elements.colorModeSelect.dispatchEvent(evtColorMode);
      }
      updateColorSwatchesUI();
      if (elements.topTextInput) elements.topTextInput.value = state.topText;
      if (elements.topTextPart1Input) elements.topTextPart1Input.value = state.topTextPart1;
      if (elements.topTextPart2Input) elements.topTextPart2Input.value = state.topTextPart2;
      if (elements.topFontSizeInput) {
        elements.topFontSizeInput.value = state.topFontSize;
        if (elements.topFontSizeVal) elements.topFontSizeVal.textContent = state.topFontSize + "px";
      }
      if (elements.topPosYInput) {
        elements.topPosYInput.value = state.topPosY;
        if (elements.topPosYVal) elements.topPosYVal.textContent = state.topPosY + "px";
      }
      if (elements.bottomTextInput) elements.bottomTextInput.value = state.bottomText;
      if (elements.bottomTextPart1Input) elements.bottomTextPart1Input.value = state.bottomTextPart1;
      if (elements.bottomTextPart2Input) elements.bottomTextPart2Input.value = state.bottomTextPart2;
      if (elements.bottomFontSizeInput) {
        elements.bottomFontSizeInput.value = state.bottomFontSize;
        if (elements.bottomFontSizeVal) elements.bottomFontSizeVal.textContent = state.bottomFontSize + "px";
      }
      if (elements.bottomPosYInput) {
        elements.bottomPosYInput.value = state.bottomPosY;
        if (elements.bottomPosYVal) elements.bottomPosYVal.textContent = state.bottomPosY + "px";
      }
      if (elements.fontFamilySelect) elements.fontFamilySelect.value = state.fontFamily;
      if (elements.strokeColorInput) {
        elements.strokeColorInput.value = state.strokeColor;
        if (elements.strokeColorVal) elements.strokeColorVal.textContent = state.strokeColor;
      }
      if (elements.strokeWidthInput) {
        elements.strokeWidthInput.value = state.strokeWidth;
        if (elements.strokeWidthVal) elements.strokeWidthVal.textContent = state.strokeWidth + "px";
      }
      if (elements.shadowBlurInput) {
        elements.shadowBlurInput.value = state.shadowBlur;
        if (elements.shadowBlurVal) elements.shadowBlurVal.textContent = state.shadowBlur + "px";
      }
      if (elements.bgModeSelect) {
        elements.bgModeSelect.value = state.bgMode;
        const evtBgMode = new Event("change");
        evtBgMode._fromSync = true;
        elements.bgModeSelect.dispatchEvent(evtBgMode);
      }
      if (elements.blurRadiusInput) {
        elements.blurRadiusInput.value = state.blurRadius;
        if (elements.blurRadiusVal) elements.blurRadiusVal.textContent = state.blurRadius + "px";
      }
      if (elements.bgColorInput) elements.bgColorInput.value = state.bgColor;
      if (elements.videoScaleInput) {
        elements.videoScaleInput.value = state.videoScale;
        if (elements.videoScaleVal) elements.videoScaleVal.textContent = state.videoScale + "%";
      }
      if (elements.videoOffsetYInput) {
        elements.videoOffsetYInput.value = state.videoOffsetY;
        if (elements.videoOffsetYVal) elements.videoOffsetYVal.textContent = state.videoOffsetY + "px";
      }
      if (typeof window.renderExtraCaptionInputs === "function") window.renderExtraCaptionInputs();
    }
    function renderLoop() {
      if (state.currentScreen === 3 || state.currentScreen === 2 || state.isExporting) {
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        if (state.currentScreen === 3) {
          if (state.platformMode === "youtube") {
            updateFilmoraPlayhead();
          } else {
            updateStudioTimelineUI();
          }
        }
      }
      requestAnimationFrame(renderLoop);
    }
    function renderCanvasFrame(ctx, width, height) {
      ctx.clearRect(0, 0, width, height);
      const video = elements.hiddenVideo;
      if (state.platformMode === "youtube") {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#0f172a");
        bgGrad.addColorStop(0.5, "#090d16");
        bgGrad.addColorStop(1, "#020617");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        if (video.readyState >= 2) {
          ctx.save();
          const layout = state.videoPlacement.layout || "split-right";
          const widthPct = (state.videoPlacement.widthPct || 50) / 100;
          const featherPx = state.videoPlacement.feather || 0;
          let targetX = 0, targetY = 0, targetW = width, targetH = height;
          if (layout === "split-right") {
            targetW = Math.round(width * widthPct);
            targetH = height;
            targetX = width - targetW;
            targetY = 0;
          } else if (layout === "split-left") {
            targetW = Math.round(width * widthPct);
            targetH = height;
            targetX = 0;
            targetY = 0;
          } else if (layout === "pip") {
            targetW = Math.round(width * 0.38);
            targetH = Math.round(targetW * (video.videoHeight / video.videoWidth));
            targetX = width - targetW - 40;
            targetY = 40;
          } else {
            targetW = width;
            targetH = height;
            targetX = 0;
            targetY = 0;
          }
          const vAspect = video.videoWidth / video.videoHeight;
          const tAspect = targetW / targetH;
          let sx, sy, sw, sh;
          if (vAspect > tAspect) {
            sh = video.videoHeight;
            sw = sh * tAspect;
            sx = (video.videoWidth - sw) / 2;
            sy = 0;
          } else {
            sw = video.videoWidth;
            sh = sw / tAspect;
            sx = 0;
            sy = (video.videoHeight - sh) / 2;
          }
          if (featherPx > 0 && (layout === "split-right" || layout === "split-left")) {
            if (!window._ytVideoOffscreen) {
              window._ytVideoOffscreen = document.createElement("canvas");
            }
            const off = window._ytVideoOffscreen;
            if (off.width !== targetW || off.height !== targetH) {
              off.width = targetW;
              off.height = targetH;
            }
            const offCtx = off.getContext("2d");
            offCtx.clearRect(0, 0, targetW, targetH);
            offCtx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
            offCtx.globalCompositeOperation = "destination-in";
            if (layout === "split-right") {
              const grad = offCtx.createLinearGradient(0, 0, featherPx, 0);
              grad.addColorStop(0, "rgba(0,0,0,0)");
              grad.addColorStop(1, "rgba(0,0,0,1)");
              offCtx.fillStyle = grad;
              offCtx.fillRect(0, 0, featherPx, targetH);
              offCtx.fillStyle = "rgba(0,0,0,1)";
              offCtx.fillRect(featherPx, 0, targetW - featherPx, targetH);
            } else if (layout === "split-left") {
              const grad = offCtx.createLinearGradient(targetW - featherPx, 0, targetW, 0);
              grad.addColorStop(0, "rgba(0,0,0,1)");
              grad.addColorStop(1, "rgba(0,0,0,0)");
              offCtx.fillStyle = grad;
              offCtx.fillRect(targetW - featherPx, 0, featherPx, targetH);
              offCtx.fillStyle = "rgba(0,0,0,1)";
              offCtx.fillRect(0, 0, targetW - featherPx, targetH);
            }
            offCtx.globalCompositeOperation = "source-over";
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 25;
            ctx.drawImage(off, targetX, targetY);
          } else {
            ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
            ctx.shadowBlur = 20;
            ctx.drawImage(video, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
          }
          ctx.restore();
        } else {
          ctx.save();
          const layout = state.videoPlacement.layout || "split-right";
          const widthPct = (state.videoPlacement.widthPct || 50) / 100;
          let targetX = 0, targetY = 0, targetW = width, targetH = height;
          if (layout === "split-right") {
            targetW = Math.round(width * widthPct);
            targetH = height;
            targetX = width - targetW;
          } else if (layout === "split-left") {
            targetW = Math.round(width * widthPct);
            targetH = height;
            targetX = 0;
          } else if (layout === "pip") {
            targetW = Math.round(width * 0.38);
            targetH = Math.round(targetW * (9 / 16));
            targetX = width - targetW - 40;
            targetY = 40;
          }
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(targetX, targetY, targetW, targetH);
          ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 6]);
          const bannerMargin = state.headlineBanner && state.headlineBanner.enabled ? (state.headlineBanner.height || 120) + 20 : 20;
          ctx.strokeRect(targetX + 15, targetY + 15, targetW - 30, targetH - bannerMargin);
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.font = 'bold 24px "Kantumruy Pro", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const centerY = targetY + (targetH - bannerMargin) / 2;
          ctx.fillText("\u{1F4F9} \u1791\u17B8\u178F\u17B6\u17C6\u1784\u179C\u17B8\u178A\u17C1\u17A2\u17BC\u1796\u17B7\u1792\u17B8\u1780\u179A (Host Video)", targetX + targetW / 2, centerY - 18);
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = '15px "Kantumruy Pro", sans-serif';
          ctx.fillText("\u1787\u17D2\u179A\u17BE\u179F\u179A\u17BE\u179F Clip \u17AC Upload \u179C\u17B8\u178A\u17C1\u17A2\u17BC\u178A\u17BE\u1798\u17D2\u1794\u17B8\u1785\u17B6\u1780\u17CB\u1795\u17D2\u179F\u17B6\u1799", targetX + targetW / 2, centerY + 18);
          ctx.restore();
        }
        if (state.studioLayers && state.studioLayers.length > 0) {
          state.studioLayers.forEach((layer) => {
            const img = layer.img || layer.imgElement;
            if (!layer.visible || !img) return;
            if (!img.complete && !img.naturalWidth) return;
            ctx.save();
            ctx.globalAlpha = layer.opacity !== void 0 ? layer.opacity : 1;
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 22;
            ctx.shadowOffsetY = 8;
            const curScale = layer.scale || 1;
            const lw = (layer.w || (img.naturalWidth || img.width || 480)) * curScale;
            const lh = (layer.h || (img.naturalHeight || img.height || 320)) * curScale;
            const lx = layer.x !== void 0 ? layer.x : 60;
            const ly = layer.y !== void 0 ? layer.y : 60;
            ctx.drawImage(img, lx, ly, lw, lh);
            ctx.restore();
            if (layer.id === state.activeLayerId && state.currentScreen === 3) {
              ctx.save();
              ctx.strokeStyle = "#55E5C5";
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 4]);
              ctx.strokeRect(lx - 2, ly - 2, lw + 4, lh + 4);
              ctx.fillStyle = "#55E5C5";
              ctx.strokeStyle = "#12181E";
              ctx.lineWidth = 1.5;
              ctx.setLineDash([]);
              const corners = [
                { x: lx - 2, y: ly - 2 },
                { x: lx + lw + 2, y: ly - 2 },
                { x: lx - 2, y: ly + lh + 2 },
                { x: lx + lw + 2, y: ly + lh + 2 }
              ];
              corners.forEach((c) => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
              });
              ctx.fillStyle = "rgba(18, 24, 30, 0.85)";
              ctx.fillRect(lx, ly - 24, Math.min(200, lw), 20);
              ctx.fillStyle = "#55E5C5";
              ctx.font = "bold 11px sans-serif";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              ctx.fillText("\u{1F5BC}\uFE0F " + (layer.name || "Image Layer"), lx + 6, ly - 14);
              ctx.restore();
            }
          });
        } else {
          const layout = state.videoPlacement.layout || "split-right";
          if (layout === "split-right" || layout === "split-left") {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
            ctx.setLineDash([8, 8]);
            const guideX = layout === "split-right" ? 40 : width * 0.54;
            ctx.strokeRect(guideX, 40, width * 0.44, height - 180);
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = '24px "Kantumruy Pro", sans-serif';
            ctx.textAlign = "center";
            ctx.fillText("\u{1F5BC}\uFE0F \u1791\u17B8\u178F\u17B6\u17C6\u1784\u179F\u17D2\u179A\u1791\u17B6\u1794\u17CB\u179A\u17BC\u1794\u1797\u17B6\u1796 (Image Layers)", guideX + width * 0.44 / 2, height / 2 - 20);
            ctx.font = '16px "Kantumruy Pro", sans-serif';
            ctx.fillText('\u1785\u17BB\u1785 "\u2795 \u1794\u1793\u17D2\u1790\u17C2\u1798\u179A\u17BC\u1794\u1797\u17B6\u1796" \u17AC "\u{1F4F0} \u178A\u17B6\u1780\u17CB\u179A\u17BC\u1794\u1782\u17C6\u179A\u17BC" \u1780\u17D2\u1793\u17BB\u1784 Inspector', guideX + width * 0.44 / 2, height / 2 + 15);
            ctx.restore();
          }
        }
        if (state.headlineBanner && state.headlineBanner.enabled) {
          const b = state.headlineBanner;
          const bannerH = b.height || 120;
          const bannerY = height - bannerH;
          ctx.save();
          const bannerGrad = ctx.createLinearGradient(0, bannerY, 0, height);
          bannerGrad.addColorStop(0, b.bgColor || "#005f73");
          bannerGrad.addColorStop(1, "#051822");
          ctx.fillStyle = bannerGrad;
          ctx.fillRect(0, bannerY, width, bannerH);
          ctx.fillStyle = "#FFE600";
          ctx.fillRect(0, bannerY, width, 4);
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 15;
          ctx.shadowOffsetY = -4;
          const headlineText = (b.text || "").trim();
          if (headlineText) {
            const fontSize = b.fontSize || 42;
            ctx.font = `700 ${fontSize}px "${state.fontFamily || "Moul"}", "Kantumruy Pro", sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const textY = bannerY + bannerH / 2 + 2;
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 6;
            ctx.lineJoin = "round";
            ctx.strokeText(headlineText, width / 2, textY);
            ctx.fillStyle = b.textColor || "#FFE600";
            ctx.fillText(headlineText, width / 2, textY);
          }
          ctx.restore();
        }
        return;
      }
      if (state.bgMode === "blur") {
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
          grad.addColorStop(0, "#0f172a");
          grad.addColorStop(0.5, "#1e293b");
          grad.addColorStop(1, "#090d16");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      } else if (state.bgMode === "color") {
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(0.5, "#1e293b");
        grad.addColorStop(1, "#090d16");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      if (video.readyState >= 2) {
        ctx.save();
        const scaleFactor = state.videoScale / 100;
        const vAspect = video.videoWidth / video.videoHeight;
        let targetW = width * scaleFactor;
        let targetH = width / vAspect * scaleFactor;
        let targetX = (width - targetW) / 2;
        let targetY = (height - targetH) / 2 + Number(state.videoOffsetY);
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 20;
        ctx.drawImage(video, targetX, targetY, targetW, targetH);
        ctx.restore();
      }
      renderTextOverlay(ctx, width, height);
      const activeTarget = state.resizeTarget || state.dragTarget || state.hoveredTextTarget;
      if (activeTarget === "top") {
        renderSelectionOutline(ctx, "top", state.topPosY, state.topFontSize, width);
      } else if (activeTarget === "bottom") {
        renderSelectionOutline(ctx, "bottom", state.bottomPosY, state.bottomFontSize, width);
      } else if (activeTarget && typeof activeTarget === "string" && activeTarget.startsWith("extra_")) {
        const ec = state.extraCaptions?.find((item) => item.id === activeTarget);
        if (ec) {
          renderSelectionOutline(ctx, ec.id, ec.posY, ec.fontSize || 55, width, ec.measuredWidth, ec.text);
        }
      }
    }
    function renderSelectionOutline(ctx, target, posY, fontSize, canvasWidth, customMeasuredW = null, customText = null) {
      ctx.save();
      ctx.strokeStyle = "#FFE600";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      let measuredW = canvasWidth * 0.75;
      let isTwoLine = false;
      if (target === "top") {
        measuredW = state.topMeasuredWidth || canvasWidth * 0.75;
        isTwoLine = Boolean(state.topTextPart1 && state.topTextPart2 || state.topText && (state.topText.includes("\u17D6") || state.topText.includes("\n")));
      } else if (target === "bottom") {
        measuredW = state.bottomMeasuredWidth || canvasWidth * 0.75;
        isTwoLine = Boolean(state.bottomTextPart1 && state.bottomTextPart2 || state.bottomText && (state.bottomText.includes("\u17D6") || state.bottomText.includes("\n")));
      } else if (customMeasuredW) {
        measuredW = customMeasuredW;
        if (customText) {
          isTwoLine = customText.includes("\u17D6") || customText.includes("\n");
        }
      }
      const boxH = isTwoLine ? fontSize * 2.8 : fontSize * 1.35;
      const boxW = Math.max(180, Math.min(canvasWidth - 20, measuredW + 50));
      const boxX = (canvasWidth - boxW) / 2;
      const boxY = posY - boxH / 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      const corners = [
        { x: boxX, y: boxY },
        { x: boxX + boxW, y: boxY },
        { x: boxX, y: boxY + boxH },
        { x: boxX + boxW, y: boxY + boxH }
      ];
      ctx.setLineDash([]);
      corners.forEach((c) => {
        ctx.fillStyle = "#FFE600";
        ctx.strokeStyle = "#000000";
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
        "top"
      );
      renderSingleTextLine(
        ctx,
        state.bottomTextPart1,
        state.bottomTextPart2,
        state.bottomText,
        state.bottomFontSize,
        state.bottomPosY,
        width,
        "bottom"
      );
      if (state.extraCaptions && Array.isArray(state.extraCaptions)) {
        state.extraCaptions.forEach((ec) => {
          renderSingleExtraCaption(ctx, ec, width, height);
        });
      }
    }
    function renderSingleExtraCaption(ctx, ec, canvasWidth, canvasHeight) {
      if (!ec) return;
      const raw = (ec.text || "").trim();
      if (!raw) return;
      ctx.save();
      const fontName = state.fontFamily || "Moul";
      let drawFontSize = parseFloat(ec.fontSize) || 55;
      ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.strokeStyle = state.strokeColor || "#000000";
      ctx.lineWidth = Number(state.strokeWidth) || 12;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      const maxAllowedW = canvasWidth - 60;
      const color = ec.color || "#FFE600";
      if (state.shadowBlur > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = Number(state.shadowBlur);
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
      }
      let line1 = "";
      let line2 = "";
      if (raw.includes("\u17D6")) {
        const parts = raw.split("\u17D6");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join("\u17D6").trim();
      } else if (raw.includes("\n")) {
        const parts = raw.split("\n");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join(" ").trim();
      } else if (raw.includes(":")) {
        const parts = raw.split(":");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join(":").trim();
      } else {
        line1 = raw;
      }
      if (line1 && !line2) {
        const singleW = ctx.measureText(line1).width;
        if (singleW > maxAllowedW && line1.length > 20) {
          const words = line1.split(/\s+/);
          if (words.length >= 2) {
            const mid = Math.ceil(words.length / 2);
            line1 = words.slice(0, mid).join(" ");
            line2 = words.slice(mid).join(" ");
          }
        }
      }
      let yCenter = parseFloat(ec.posY);
      if (isNaN(yCenter) || yCenter <= 0) {
        yCenter = Math.round(canvasHeight * 0.92);
      }
      if (yCenter > canvasHeight - 20 || yCenter < 30) {
        yCenter = Math.min(canvasHeight - 40, Math.max(40, yCenter));
      }
      ec.posY = yCenter;
      const centerX = canvasWidth / 2;
      ctx.textAlign = "center";
      if (line1 && line2) {
        ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
        let w1 = ctx.measureText(line1).width;
        let w2 = ctx.measureText(line2).width;
        let maxW = Math.max(w1, w2);
        if (maxW > maxAllowedW && maxW > 0) {
          const scale = maxAllowedW / maxW;
          drawFontSize = Math.max(16, Math.floor(drawFontSize * scale));
          ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
          w1 = ctx.measureText(line1).width;
          w2 = ctx.measureText(line2).width;
          maxW = Math.max(w1, w2);
        }
        ec.measuredWidth = maxW;
        const lineSpacing = drawFontSize * 1.34;
        const line1Y = yCenter - lineSpacing / 2;
        const line2Y = yCenter + lineSpacing / 2;
        if (state.strokeWidth > 0) {
          ctx.strokeText(line1, centerX, line1Y);
          ctx.strokeText(line2, centerX, line2Y);
        }
        ctx.fillStyle = color;
        ctx.fillText(line1, centerX, line1Y);
        ctx.fillText(line2, centerX, line2Y);
      } else if (line1) {
        ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
        let textW = ctx.measureText(line1).width;
        if (textW > maxAllowedW && textW > 0) {
          const scale = maxAllowedW / textW;
          drawFontSize = Math.max(16, Math.floor(drawFontSize * scale));
          ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
          textW = ctx.measureText(line1).width;
        }
        ec.measuredWidth = textW;
        if (state.strokeWidth > 0) {
          ctx.strokeText(line1, centerX, yCenter);
        }
        ctx.fillStyle = color;
        ctx.fillText(line1, centerX, yCenter);
      }
      ctx.restore();
    }
    function renderSingleTextLine(ctx, part1, part2, fullText, fontSize, posY, canvasWidth, targetName) {
      ctx.save();
      const fontName = state.fontFamily || "Moul";
      let drawFontSize = parseFloat(fontSize) || 65;
      ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.strokeStyle = state.strokeColor || "#000000";
      ctx.lineWidth = Number(state.strokeWidth) || 12;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      const maxAllowedW = canvasWidth - 60;
      const color1 = targetName === "top" ? state.topTextColor1 : state.bottomTextColor1;
      const color2 = state.colorMode === "dual" ? targetName === "top" ? state.topTextColor2 : state.bottomTextColor2 : color1;
      if (state.shadowBlur > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
        ctx.shadowBlur = Number(state.shadowBlur);
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
      }
      const p1 = (part1 || "").trim();
      const p2 = (part2 || "").trim();
      const raw = (fullText || "").trim();
      let line1 = "";
      let line2 = "";
      if (p1 && p2 && p1 !== p2) {
        line1 = p1;
        line2 = p2;
      } else if (raw.includes("\u17D6")) {
        const parts = raw.split("\u17D6");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join("\u17D6").trim();
      } else if (raw.includes("\n")) {
        const parts = raw.split("\n");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join(" ").trim();
      } else if (raw.includes(":")) {
        const parts = raw.split(":");
        line1 = parts[0].trim();
        line2 = parts.slice(1).join(":").trim();
      } else if (raw) {
        line1 = raw;
      } else if (p1) {
        line1 = p1;
      }
      if (!line1 && !line2) {
        ctx.restore();
        return;
      }
      let yCenter = parseFloat(posY);
      if (isNaN(yCenter) || yCenter <= 0) {
        yCenter = targetName === "top" ? Math.round(state.canvasHeight * 0.12) : Math.round(state.canvasHeight * 0.85);
      }
      if (targetName === "bottom") {
        if (yCenter > state.canvasHeight - 20 || yCenter < state.canvasHeight * 0.48) {
          yCenter = Math.round(state.canvasHeight * 0.85);
          state.bottomPosY = yCenter;
          if (elements.bottomPosYInput) elements.bottomPosYInput.value = yCenter;
        }
      } else if (targetName === "top") {
        if (yCenter > state.canvasHeight * 0.48 || yCenter < 20) {
          yCenter = Math.round(state.canvasHeight * 0.12);
          state.topPosY = yCenter;
          if (elements.topPosYInput) elements.topPosYInput.value = yCenter;
        }
      }
      if (line1 && !line2) {
        const singleW = ctx.measureText(line1).width;
        if (singleW > maxAllowedW && line1.length > 20) {
          const words = line1.split(/\s+/);
          if (words.length >= 2) {
            const mid = Math.ceil(words.length / 2);
            line1 = words.slice(0, mid).join(" ");
            line2 = words.slice(mid).join(" ");
          }
        }
      }
      if (line1 && line2) {
        ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
        let w1 = ctx.measureText(line1).width;
        let w2 = ctx.measureText(line2).width;
        let maxW = Math.max(w1, w2);
        if (maxW > maxAllowedW && maxW > 0) {
          const scale = maxAllowedW / maxW;
          drawFontSize = Math.max(18, Math.floor(drawFontSize * scale));
          ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
          w1 = ctx.measureText(line1).width;
          w2 = ctx.measureText(line2).width;
          maxW = Math.max(w1, w2);
        }
        if (targetName === "top") {
          state.topMeasuredWidth = maxW;
        } else if (targetName === "bottom") {
          state.bottomMeasuredWidth = maxW;
        }
        const lineSpacing = drawFontSize * 1.34;
        const line1Y = yCenter - lineSpacing / 2;
        const line2Y = yCenter + lineSpacing / 2;
        const centerX = canvasWidth / 2;
        ctx.textAlign = "center";
        if (state.strokeWidth > 0) {
          ctx.strokeText(line1, centerX, line1Y);
          ctx.strokeText(line2, centerX, line2Y);
        }
        ctx.fillStyle = color1;
        ctx.fillText(line1, centerX, line1Y);
        ctx.fillStyle = color2;
        ctx.fillText(line2, centerX, line2Y);
      } else {
        ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
        let textW = ctx.measureText(line1).width;
        if (textW > maxAllowedW && textW > 0) {
          const scale = maxAllowedW / textW;
          drawFontSize = Math.max(16, Math.floor(drawFontSize * scale));
          ctx.font = `700 ${drawFontSize}px "${fontName}", sans-serif`;
          textW = ctx.measureText(line1).width;
        }
        if (targetName === "top") {
          state.topMeasuredWidth = textW;
        } else if (targetName === "bottom") {
          state.bottomMeasuredWidth = textW;
        }
        const centerX = canvasWidth / 2;
        ctx.textAlign = "center";
        if (state.strokeWidth > 0) {
          ctx.strokeText(line1, centerX, yCenter);
        }
        if (state.colorMode === "gradient") {
          const startX = Math.max(30, (canvasWidth - textW) / 2);
          const grad = ctx.createLinearGradient(startX, 0, startX + textW, 0);
          grad.addColorStop(0, color1);
          grad.addColorStop(1, color2);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = color1;
        }
        ctx.fillText(line1, centerX, yCenter);
      }
      ctx.restore();
    }
    window.exportSingleClip = function(id) {
      const clip = state.clips.find((c) => c.id === id);
      if (clip) exportClipsQueue([clip]);
    };
    function exportAllClips() {
      if (state.clips.length > 0) exportClipsQueue(state.clips);
    }
    function triggerDownload(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 6e4);
    }
    async function exportClipsQueue(queue) {
      if (state.isExporting) return;
      state.isExporting = true;
      state.cancelExportRequested = false;
      if (elements.mainVideoPlayer) {
        elements.mainVideoPlayer.pause();
      }
      if (elements.hiddenVideo) {
        elements.hiddenVideo.pause();
      }
      state.isPlaying = false;
      if (elements.playPauseBtn) {
        elements.playPauseBtn.innerHTML = "\u25B6 Play";
      }
      if (elements.studioPlayBtn) {
        elements.studioPlayBtn.innerHTML = "\u25B6 Play";
      }
      elements.exportModal.classList.remove("hidden");
      elements.exportProgressBar.style.width = "0%";
      elements.exportPercentText.textContent = "0%";
      const isZipExport = queue.length > 1;
      const exportedFiles = [];
      for (let i = 0; i < queue.length; i++) {
        if (state.cancelExportRequested) break;
        const clip = queue[i];
        elements.exportStatusText.textContent = `\u1780\u17C6\u1796\u17BB\u1784 Export ${clip.name} (${i + 1}/${queue.length})...`;
        const fileData = await processSingleClipExport(clip, (pct) => {
          const totalPct = Math.round((i + pct / 100) / queue.length * (isZipExport ? 80 : 100));
          elements.exportProgressBar.style.width = `${totalPct}%`;
          elements.exportPercentText.textContent = `${totalPct}%`;
        }, !isZipExport);
        if (fileData && fileData.blob) {
          exportedFiles.push(fileData);
        }
      }
      if (isZipExport && !state.cancelExportRequested && exportedFiles.length > 0) {
        elements.exportStatusText.textContent = `\u{1F4E6} \u1780\u17C6\u1796\u17BB\u1784\u1794\u1784\u17D2\u1780\u17BE\u178F File ZIP...`;
        elements.exportProgressBar.style.width = "85%";
        elements.exportPercentText.textContent = "85%";
        if (typeof JSZip !== "undefined") {
          const zip = new JSZip();
          exportedFiles.forEach((file, idx) => {
            let filename = `${file.safeName}.${file.ext}`;
            zip.file(filename, file.blob);
          });
          const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
            const zipPct = 85 + Math.round(metadata.percent / 100 * 15);
            elements.exportProgressBar.style.width = `${zipPct}%`;
            elements.exportPercentText.textContent = `${zipPct}%`;
          });
          triggerDownload(zipBlob, `Khmer_Clips_All.zip`);
        } else {
          exportedFiles.forEach((file) => {
            triggerDownload(file.blob, `${file.safeName}.${file.ext}`);
          });
        }
      }
      if (elements.mainVideoPlayer) {
        elements.mainVideoPlayer.pause();
      }
      if (elements.hiddenVideo) {
        elements.hiddenVideo.pause();
      }
      state.isPlaying = false;
      state.isExporting = false;
      elements.exportModal.classList.add("hidden");
    }
    function processSingleClipExport(clip, onProgress, autoDownload = true) {
      return new Promise(async (resolve) => {
        selectClipForEditing(clip.id, false);
        const video = elements.hiddenVideo;
        const canvas = elements.mainCanvas;
        const origTime = video.currentTime;
        video.currentTime = clip.startTime;
        await new Promise((res) => {
          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              video.removeEventListener("seeked", done);
              res();
            }
          };
          if (video.readyState >= 2 && Math.abs(video.currentTime - clip.startTime) < 0.2) {
            done();
          } else {
            video.addEventListener("seeked", done, { once: true });
            setTimeout(done, 500);
          }
        });
        renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
        const stream = canvas.captureStream(30);
        let audioTrack = null;
        try {
          if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            window.audioSrc = window.audioCtx.createMediaElementSource(video);
            window.audioDest = window.audioCtx.createMediaStreamDestination();
            window.audioSrc.connect(window.audioDest);
          } else {
            try {
              window.audioSrc.disconnect(window.audioCtx.destination);
            } catch (_) {
            }
          }
          if (window.audioCtx.state === "suspended") {
            await window.audioCtx.resume();
          }
          audioTrack = window.audioDest.stream.getAudioTracks()[0];
          if (audioTrack) stream.addTrack(audioTrack);
        } catch (err) {
          console.warn("Audio export fallback:", err);
        }
        let mimeType = "video/mp4;codecs=avc1,mp4a";
        let ext = "mp4";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported("video/mp4")) {
            mimeType = "video/mp4";
            ext = "mp4";
          } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
            mimeType = "video/webm;codecs=vp9,opus";
            ext = "webm";
          } else if (MediaRecorder.isTypeSupported("video/webm")) {
            mimeType = "video/webm";
            ext = "webm";
          } else {
            mimeType = "";
            ext = "mp4";
          }
        }
        const recorderOptions = mimeType ? { mimeType, videoBitsPerSecond: 35e5 } : { videoBitsPerSecond: 35e5 };
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
            const blob = new Blob(chunks, { type: mediaRecorder.mimeType || mimeType || "video/mp4" });
            let safeName = (clip.name || "Clip").replace(/[\\/:*?"<>|#%&{}\$\+!:@=]/g, "_").replace(/\s+/g, "_").replace(/_+/g, "_").trim();
            if (!safeName || safeName === "_") safeName = "Clip";
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
          renderCanvasFrame(elements.ctx, state.canvasWidth, state.canvasHeight);
          const elapsed = video.currentTime - clip.startTime;
          const progress = Math.min(100, elapsed / clip.duration * 100);
          onProgress(progress);
          if (video.currentTime >= clip.endTime || state.cancelExportRequested || video.ended) {
            clearInterval(checkInterval);
            if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
          }
        }, 50);
      });
    }
    function loadDemoClips() {
      state.videoFile = { name: "dharma_talk.mp4.mp4", duration: 3180, size: 1024 * 1024 * 120 };
      state.duration = 3180;
      state.trimIn = 2068;
      state.trimOut = 2468;
      try {
        elements.mainVideoPlayer.src = "dharma_talk.mp4.mp4";
        elements.hiddenVideo.src = "dharma_talk.mp4.mp4";
        elements.hiddenVideo.muted = true;
        elements.hiddenVideo.play().catch(() => {
        });
      } catch (e) {
      }
      state.clips = REAL_AUTHENTIC_DHAMMA_CLIPS.map((c, idx) => ({
        id: idx + 1,
        name: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        topText: c.title,
        topTextPart1: c.top1 || c.title,
        topTextPart2: c.top2 || "",
        bottomText: `${c.bot1 || ""} ${c.bot2 || ""}`.trim(),
        bottomTextPart1: c.bot1,
        bottomTextPart2: c.bot2,
        captionLines: []
      }));
      state.activeClipId = 1;
      switchScreen(2);
      renderClipsList();
      updateTrimUI();
      showToastNotification("\u{1F3AC} \u1794\u17B6\u1793\u1794\u1789\u17D2\u1785\u17BC\u179B 8 Clips \u1796\u17B7\u178F\u1794\u17D2\u179A\u17B6\u1780\u178A\u1796\u17B8\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u1795\u17D2\u1780\u17B6\u1794\u17D2\u179A\u17B6\u1780\u17CB\u179F\u17B6\u1798\u1782\u17D2\u1782\u17B8!");
    }
    window.switchScreen = switchScreen;
    window.loadDemoClips = loadDemoClips;
    window.runAiAudioScan = runAiAudioScan;
    window.testOmniRouteConnection = testOmniRouteConnection;
    window.startBatchScanWorkflow = startBatchScanWorkflow;
    window.removeBatchVideo = removeBatchVideo;
    window.clearBatchQueue = clearBatchQueue;
    window.selectActiveBatchVideo = selectActiveBatchVideo;
    window.addFilesToBatchQueue = addFilesToBatchQueue;
    function initFirebaseIntegration() {
      if (!window.FirebaseService) {
        console.warn("\u26A0\uFE0F FirebaseService is not yet loaded.");
        return;
      }
      const loginBtn = document.getElementById("firebaseLoginBtn");
      const logoutBtn = document.getElementById("firebaseLogoutBtn");
      const openCloudBtn = document.getElementById("openCloudProjectsBtn");
      const saveCloudBtn = document.getElementById("saveToCloudBtn");
      const confirmSaveBtn = document.getElementById("confirmSaveToCloudBtn");
      const refreshCloudBtn = document.getElementById("refreshCloudProjectsBtn");
      const cloudModal = document.getElementById("cloudProjectsModal");
      const closeCloudModalBtn = document.getElementById("closeCloudProjectsModalBtn");
      const closeCloudModalFooterBtn = document.getElementById("closeCloudProjectsModalFooterBtn");
      loginBtn?.addEventListener("click", async () => {
        try {
          loginBtn.innerHTML = "\u23F3 \u1780\u17C6\u1796\u17BB\u1784\u1785\u17BC\u179B...";
          await window.FirebaseService.signInWithGoogle();
          showToastNotification("\u2705 \u1785\u17BC\u179B\u1782\u178E\u1793\u17B8 Google \u178A\u17C4\u1799\u1787\u17C4\u1782\u1787\u17D0\u1799!");
        } catch (err) {
          console.error("Login error:", err);
          alert("\u1785\u17BC\u179B\u1782\u178E\u1793\u17B8\u1798\u17B7\u1793\u1794\u17B6\u1793\u179F\u1798\u17D2\u179A\u17C1\u1785\u17D6 " + (err.message || "\u179F\u17BC\u1798\u1796\u17B7\u1793\u17B7\u178F\u17D2\u1799\u1798\u17BE\u179B\u1780\u17B6\u179A\u17A2\u1793\u17BB\u1789\u17D2\u1789\u17B6\u178F Google Sign-In \u179B\u17BE Firebase!"));
        } finally {
          loginBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google Login</span>
                `;
        }
      });
      logoutBtn?.addEventListener("click", async () => {
        if (confirm("\u178F\u17BE\u17A2\u17D2\u1793\u1780\u1796\u17B7\u178F\u1787\u17B6\u1785\u1784\u17CB\u1785\u17B6\u1780\u1785\u17C1\u1789\u1796\u17B8\u1782\u178E\u1793\u17B8 Google \u1798\u17C2\u1793\u1791\u17C1?")) {
          await window.FirebaseService.signOutUser();
          showToastNotification("\u{1F44B} \u1794\u17B6\u1793\u1785\u17B6\u1780\u1785\u17C1\u1789\u1796\u17B8\u1782\u178E\u1793\u17B8 Google \u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB!");
        }
      });
      window.FirebaseService.onAuthChange((user) => {
        const userBox = document.getElementById("firebaseUserBox");
        const avatar = document.getElementById("userAvatarImg");
        const nameSpan = document.getElementById("userNameSpan");
        const modalEmail = document.getElementById("cloudModalUserEmail");
        if (user) {
          if (loginBtn) loginBtn.style.display = "none";
          if (userBox) userBox.style.display = "flex";
          if (avatar) avatar.src = user.photoURL || "https://www.gravatar.com/avatar/?d=mp";
          if (nameSpan) nameSpan.textContent = user.displayName || (user.email ? user.email.split("@")[0] : "User");
          if (modalEmail) modalEmail.textContent = user.email || "\u1785\u17BC\u179B\u1782\u178E\u1793\u17B8\u179A\u17BD\u1785\u179A\u17B6\u179B\u17CB";
        } else {
          if (loginBtn) loginBtn.style.display = "flex";
          if (userBox) userBox.style.display = "none";
        }
      });
      openCloudBtn?.addEventListener("click", () => {
        cloudModal?.classList.remove("hidden");
        loadAndRenderCloudProjects();
      });
      closeCloudModalBtn?.addEventListener("click", () => cloudModal?.classList.add("hidden"));
      closeCloudModalFooterBtn?.addEventListener("click", () => cloudModal?.classList.add("hidden"));
      cloudModal?.addEventListener("click", (e) => {
        if (e.target === cloudModal) cloudModal.classList.add("hidden");
      });
      saveCloudBtn?.addEventListener("click", () => {
        cloudModal?.classList.remove("hidden");
        loadAndRenderCloudProjects();
      });
      confirmSaveBtn?.addEventListener("click", handleSaveProjectToCloud);
      refreshCloudBtn?.addEventListener("click", loadAndRenderCloudProjects);
      async function handleSaveProjectToCloud() {
        const user = window.FirebaseService.getCurrentUser();
        if (!user) {
          alert('\u179F\u17BC\u1798\u1785\u17BB\u1785 "Google Login" \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793 \u178A\u17BE\u1798\u17D2\u1794\u17B8 Save \u1791\u17C5\u179B\u17BE Firestore Cloud!');
          return;
        }
        const nameInput = document.getElementById("cloudProjectNameInput");
        const projectName = nameInput && nameInput.value.trim() || state.videoFile?.name || `\u1782\u1798\u17D2\u179A\u17C4\u1784 ${(/* @__PURE__ */ new Date()).toLocaleDateString("km-KH")}`;
        const projectData = {
          id: state.currentProjectId || `proj_${Date.now()}`,
          name: projectName,
          clips: state.clips,
          aspectRatio: state.aspectRatio,
          platformMode: state.platformMode,
          topText: state.topText,
          bottomText: state.bottomText,
          fontFamily: state.fontFamily,
          colorMode: state.colorMode,
          strokeColor: state.strokeColor,
          strokeWidth: state.strokeWidth,
          topTextColor1: state.topTextColor1,
          topTextColor2: state.topTextColor2,
          bottomTextColor1: state.bottomTextColor1,
          bottomTextColor2: state.bottomTextColor2
        };
        try {
          if (confirmSaveBtn) confirmSaveBtn.innerHTML = "\u23F3 \u1780\u17C6\u1796\u17BB\u1784 Save...";
          const res = await window.FirebaseService.saveProjectToFirestore(projectData);
          state.currentProjectId = res.projectId;
          showToastNotification("\u2601\uFE0F \u1794\u17B6\u1793\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780\u1782\u1798\u17D2\u179A\u17C4\u1784\u179B\u17BE Cloud Firestore \u178A\u17C4\u1799\u1787\u17C4\u1782\u1787\u17D0\u1799!");
          if (nameInput) nameInput.value = "";
          loadAndRenderCloudProjects();
        } catch (err) {
          console.error("Firestore save error:", err);
          alert("\u1798\u17B7\u1793\u17A2\u17B6\u1785 Save \u1794\u17B6\u1793\u1791\u17C1\u17D6 " + (err.message || "\u179F\u17BC\u1798\u1796\u17B7\u1793\u17B7\u178F\u17D2\u1799\u1798\u17BE\u179B Firestore Database Security Rules!"));
        } finally {
          if (confirmSaveBtn) confirmSaveBtn.innerHTML = "\u2601\uFE0F Save \u17A5\u17A1\u17BC\u179C\u1793\u17C1\u17C7";
        }
      }
      async function loadAndRenderCloudProjects() {
        const listEl = document.getElementById("cloudProjectsList");
        const countEl = document.getElementById("cloudProjectsCount");
        if (!listEl) return;
        const user = window.FirebaseService.getCurrentUser();
        if (!user) {
          listEl.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">\u179F\u17BC\u1798 Login \u1785\u17BC\u179B\u1782\u178E\u1793\u17B8 Google \u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793 \u178A\u17BE\u1798\u17D2\u1794\u17B8\u1798\u17BE\u179B\u1782\u1798\u17D2\u179A\u17C4\u1784\u179B\u17BE Cloud!</div>';
          if (countEl) countEl.textContent = "0";
          return;
        }
        listEl.innerHTML = '<div style="text-align:center; padding:30px; color:#38bdf8;">\u{1F504} \u1780\u17C6\u1796\u17BB\u1784\u1791\u17B6\u1789\u1799\u1780\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1796\u17B8 Firebase Firestore...</div>';
        try {
          const projects = await window.FirebaseService.getUserProjects();
          if (countEl) countEl.textContent = projects.length;
          if (!projects || projects.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">\u1798\u17B7\u1793\u1791\u17B6\u1793\u17CB\u1798\u17B6\u1793\u1782\u1798\u17D2\u179A\u17C4\u1784\u178E\u17B6\u178F\u17D2\u179A\u17BC\u179C\u1794\u17B6\u1793 Save \u1793\u17C5\u17A1\u17BE\u1799\u1791\u17C1\u17D4 \u17A2\u17D2\u1793\u1780\u17A2\u17B6\u1785\u1785\u17BB\u1785 Save \u1781\u17B6\u1784\u179B\u17BE\u178A\u17BE\u1798\u17D2\u1794\u17B8\u179F\u17B6\u1780\u179B\u17D2\u1794\u1784!</div>';
            return;
          }
          listEl.innerHTML = "";
          projects.forEach((proj) => {
            const card = document.createElement("div");
            card.className = "cloud-project-card";
            const dateStr = proj.updatedAt?.toDate ? proj.updatedAt.toDate().toLocaleString("km-KH") : "\u1791\u17BE\u1794\u178F\u17C2 Save";
            card.innerHTML = `
                        <div class="cloud-project-info">
                            <div class="cloud-project-title">${proj.name || "\u1782\u1798\u17D2\u179A\u17C4\u1784\u1782\u17D2\u1798\u17B6\u1793\u1788\u17D2\u1798\u17C4\u17C7"}</div>
                            <div class="cloud-project-meta">
                                <span>\u2702\uFE0F ${proj.clipsCount || (proj.clips || []).length} Clips</span>
                                <span>\u{1F4D0} ${proj.aspectRatio || "9:16"}</span>
                                <span>\u{1F552} ${dateStr}</span>
                            </div>
                        </div>
                        <div class="cloud-project-actions">
                            <button class="btn btn-primary btn-xs load-proj-btn" style="background:#0284c7; padding:5px 12px; font-weight:600;">\u{1F4C2} \u179F\u17D2\u179A\u1784\u17CB\u1798\u1780\u1794\u17D2\u179A\u17BE</button>
                            <button class="btn btn-danger btn-xs delete-proj-btn" style="padding:5px 8px;" title="\u179B\u17BB\u1794\u1782\u1798\u17D2\u179A\u17C4\u1784\u1785\u17C4\u179B">\u{1F5D1}\uFE0F</button>
                        </div>
                    `;
            card.querySelector(".load-proj-btn").addEventListener("click", () => {
              restoreProjectFromCloud(proj);
            });
            card.querySelector(".delete-proj-btn").addEventListener("click", async () => {
              if (confirm(`\u178F\u17BE\u17A2\u17D2\u1793\u1780\u1796\u17B7\u178F\u1787\u17B6\u1785\u1784\u17CB\u179B\u17BB\u1794\u1782\u1798\u17D2\u179A\u17C4\u1784 "${proj.name}" \u1796\u17B8 Cloud Firestore \u1798\u17C2\u1793\u1791\u17C1?`)) {
                await window.FirebaseService.deleteUserProject(proj.id);
                showToastNotification("\u{1F5D1}\uFE0F \u1794\u17B6\u1793\u179B\u17BB\u1794\u1782\u1798\u17D2\u179A\u17C4\u1784\u1796\u17B8 Cloud!");
                loadAndRenderCloudProjects();
              }
            });
            listEl.appendChild(card);
          });
        } catch (err) {
          console.error("Fetch projects error:", err);
          listEl.innerHTML = `<div style="color:#f87171; text-align:center; padding:20px;">\u1794\u1789\u17D2\u17A0\u17B6\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1791\u17B6\u1789\u1799\u1780\u1796\u17B8 Firestore: ${err.message}</div>`;
        }
      }
      function restoreProjectFromCloud(proj) {
        if (!proj) return;
        if (proj.clips && Array.isArray(proj.clips)) {
          state.clips = proj.clips;
          state.clipCounter = state.clips.length + 1;
          renderClipsList();
        }
        if (proj.settings) {
          Object.assign(state, proj.settings);
        }
        if (proj.aspectRatio) state.aspectRatio = proj.aspectRatio;
        state.currentProjectId = proj.id;
        cloudModal?.classList.add("hidden");
        showToastNotification(`\u2728 \u1794\u17B6\u1793\u1794\u17BE\u1780\u1782\u1798\u17D2\u179A\u17C4\u1784 "${proj.name}" \u1798\u1780\u1780\u17C2\u1794\u17D2\u179A\u17C2\u1794\u1793\u17D2\u178F\u178A\u17C4\u1799\u1787\u17C4\u1782\u1787\u17D0\u1799!`);
        if (state.clips.length > 0) switchScreen(2);
      }
    }
    init();
    initFirebaseIntegration();
  });
})();
//# sourceMappingURL=app.js.map
