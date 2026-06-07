import { initGlobe } from './globe.js';
import { selectedCountries, updateSelectionUI } from './ui.js';
import { renderDynamicAnalysis } from './analysis.js';
import { initSourcePanel } from './source-panel.js';
import { loadCSVData } from './csv-loader.js';

// Chart instances
const charts = {
    barChart: null,
    radarChart: null,
    lineChart: null,
    ctxBar: document.getElementById('barChartCanvas').getContext('2d'),
    ctxRadar: document.getElementById('radarChartCanvas').getContext('2d'),
    ctxLine: document.getElementById('lineChartCanvas').getContext('2d')
};

// Show loading indicator
const analyzeBtn = document.getElementById('analyzeNowBtn');
analyzeBtn.textContent = 'Loading Data...';
analyzeBtn.disabled = true;

// Load CSV data first, then initialize everything
loadCSVData().then((data) => {
    console.log("Function being used:", loadCSVData);

    console.log('[App] Data loaded:', data.length);

    window.foodWasteData = data;

    // recompute avg here (since API doesn’t send it)
    window.GLOBAL_AVG = Math.round(
        data.reduce((s, d) => s + d.combined, 0) / data.length
    );

    initGlobe();
    initSourcePanel();
    updateSelectionUI();
});

// Event Listeners
document.getElementById('analyzeNowBtn').addEventListener('click', async () => {
    if (selectedCountries.length < 2) {
        alert("Please select at least 2 countries");
        return;
    }

    const res = await fetch("https://rpymqbayaa.execute-api.ap-southeast-2.amazonaws.com/prod/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countries: selectedCountries })
    });

    const apiData = await res.json();

    renderDynamicAnalysis(apiData, charts);

    document.getElementById('analysisModal').classList.add('active');
});

document.getElementById('resetSelectionBtn').addEventListener('click', () => {
    selectedCountries.length = 0;
    updateSelectionUI();
    document.getElementById('analyzeNowBtn').disabled = true;
    if (window.currentScene) {
        import('./analysis.js').then(module => {
            module.updateConnectionCurves(window.currentScene, []);
        });
        import('./markers.js').then(module => {
            module.highlightSelectedMarkers([]);
        });
    }
});

document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.body.style.background = isLight ? "#eef2ff" : "#050811";
    if (window.currentScene) window.currentScene.background.setHex(isLight ? 0xeef2ff : 0x050811);
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('analysisModal').classList.remove('active');
});