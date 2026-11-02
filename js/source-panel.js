import { fetchDataFromAWS } from './aws-integration.js';

const sources = [
    { id: 'unep', name: 'UNEP Food Waste Index', desc: 'Primary Source · 2024', icon: 'fa-university' },
    { id: 'fao', name: 'FAO Statistics', desc: 'Secondary · Consumption Data', icon: 'fa-leaf' },
    { id: 'wb', name: 'World Bank', desc: 'Tertiary · Economic Data', icon: 'fa-chart-line' }
];

let currentSourceIndex = 0;
let panelOpen = false;

export function updateSourceDisplay() {
    const source = sources[currentSourceIndex];
    document.getElementById('currentSourceName').textContent = source.name;
    document.getElementById('currentSourceDesc').textContent = source.desc;
    
    document.querySelectorAll('.source-badge').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.source === source.id) {
            el.classList.add('active');
            const checkIcon = el.querySelector('.fa-check-circle');
            if (checkIcon) checkIcon.style.display = 'inline-block';
        } else {
            const checkIcon = el.querySelector('.fa-check-circle');
            if (checkIcon) checkIcon.style.display = 'none';
        }
    });
    
    const syncStatus = source.id === 'unep' ? 'Real-time' : (source.id === 'fao' ? 'Hourly' : 'Daily');
    const nodeCount = source.id === 'unep' ? '3' : (source.id === 'fao' ? '2' : '1');
    document.getElementById('panelSyncStatus').textContent = syncStatus;
    document.getElementById('panelNodeCount').textContent = nodeCount;
    
    // Call AWS to fetch data
    fetchDataFromAWS(source.id).then(data => {
        console.log(`[AWS] Data loaded from ${source.id}:`, data);
    });
}

export function prevSource() {
    currentSourceIndex = (currentSourceIndex - 1 + sources.length) % sources.length;
    updateSourceDisplay();
}

export function nextSource() {
    currentSourceIndex = (currentSourceIndex + 1) % sources.length;
    updateSourceDisplay();
}

export function initSourcePanel() {
    const sourceTabBtn = document.getElementById('sourceTabBtn');
    const sourcePanel = document.getElementById('sourcePanel');

    if (!sourceTabBtn || !sourcePanel) {
        return;
    }
    
    sourceTabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (panelOpen) {
            sourcePanel.classList.add('hidden');
            panelOpen = false;
        } else {
            sourcePanel.classList.remove('hidden');
            panelOpen = true;
        }
    });
    
    document.addEventListener('click', (e) => {
        const collapsible = document.getElementById('sourceCollapsible');
        if (collapsible && !collapsible.contains(e.target) && panelOpen) {
            sourcePanel.classList.add('hidden');
            panelOpen = false;
        }
    });
    
    const prevSourceBtn = document.getElementById('prevSourceBtn');
    const nextSourceBtn = document.getElementById('nextSourceBtn');

    if (prevSourceBtn) prevSourceBtn.addEventListener('click', prevSource);
    if (nextSourceBtn) nextSourceBtn.addEventListener('click', nextSource);
    
    document.querySelectorAll('.source-badge').forEach(el => {
        el.addEventListener('click', () => {
            const sourceId = el.dataset.source;
            const index = sources.findIndex(s => s.id === sourceId);
            if (index !== -1) {
                currentSourceIndex = index;
                updateSourceDisplay();
            }
        });
    });
    
    updateSourceDisplay();
}
