import { highlightSelectedMarkers } from './markers.js';
import { updateConnectionCurves } from './analysis.js';

export let selectedCountries = [];

export function handleCountrySelection(countryName, scene) {
    console.log('[UI] Selecting country:', countryName);
    
    const index = selectedCountries.indexOf(countryName);
    if (index !== -1) {
        selectedCountries.splice(index, 1);
        console.log('[UI] Removed', countryName, '- now', selectedCountries.length, 'selected');
    } else {
        if (selectedCountries.length >= 5) selectedCountries.shift();
        selectedCountries.push(countryName);
        console.log('[UI] Added', countryName, '- now', selectedCountries.length, 'selected');
    }
    updateSelectionUI();
    highlightSelectedMarkers(selectedCountries);
    updateConnectionCurves(scene, selectedCountries);
    
    const analyzeBtn = document.getElementById('analyzeNowBtn');
    if (analyzeBtn) analyzeBtn.disabled = selectedCountries.length < 2;
}

export function updateSelectionUI() {
    const container = document.getElementById('selectedCountriesList');
    const data = window.foodWasteData;
    
    if (!container) return;
    
    if (selectedCountries.length === 0) {
        container.innerHTML = `<span style="opacity:0.7;"><i class="fas fa-globe"></i> Rotate the Earth, click on flags to select countries (max 5)</span>`;
    } else {
        let html = '';
        selectedCountries.forEach(c => {
            const countryData = data?.find(d => d.country === c);
            if (countryData) {
                html += `
                    <div class="country-chip">
                        <img src="${countryData.flagUrl}" alt="${c}" style="width:24px;height:18px;border-radius:3px;">
                        <span><strong>${c}</strong> · ${countryData.combined} kg/person/year</span>
                        <button class="remove-btn" data-country="${c}"><i class="fas fa-times"></i></button>
                    </div>
                `;
            }
        });
        container.innerHTML = html;
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const country = btn.getAttribute('data-country');
                const index = selectedCountries.indexOf(country);
                if (index !== -1) selectedCountries.splice(index, 1);
                updateSelectionUI();
                highlightSelectedMarkers(selectedCountries);
                const scene = window.currentScene;
                if (scene) updateConnectionCurves(scene, selectedCountries);
                const analyzeBtn = document.getElementById('analyzeNowBtn');
                if (analyzeBtn) analyzeBtn.disabled = selectedCountries.length < 2;
            });
        });
    }
}