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
analyzeBtn.textContent = 'Analyze';
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

    const apiData = {
        countries: window.foodWasteData.filter(country => 
            selectedCountries.includes(country.country)
        ),
        globalAvg: window.GLOBAL_AVG
    }

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

const themeToggle = document.getElementById('darkModeToggle');

function applyTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    document.body.style.background = isLight ? '#eef2ff' : '#050811';
    themeToggle.innerHTML = isLight
        ? '<i class="fas fa-moon"></i> Dark Mode'
        : '<i class="fas fa-sun"></i> Light Mode';

    if (window.currentScene) {
        window.currentScene.background.setHex(isLight ? 0xeef2ff : 0x050811);
    }
}

applyTheme(localStorage.getItem('theme') === 'light');

themeToggle.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light-mode');
    applyTheme(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('analysisModal').classList.remove('active');
});
