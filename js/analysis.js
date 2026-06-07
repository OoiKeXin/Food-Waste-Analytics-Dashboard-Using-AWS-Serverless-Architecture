import { latLongToVector3 } from './markers.js';
import * as THREE from 'three';

export let connectionCurves = [];
export let glowSpheres = [];

export function getGreatCirclePoints(p1, p2, segments = 70) {
    const points = [];
    const v1 = p1.clone().normalize();
    const v2 = p2.clone().normalize();
    const angle = v1.angleTo(v2);
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const theta = angle * t;
        const v = v1.clone().multiplyScalar(Math.sin(angle - theta))
            .add(v2.clone().multiplyScalar(Math.sin(theta)))
            .divideScalar(Math.sin(angle));
        const pos = v.normalize().multiplyScalar(1.235);
        points.push(pos);
    }
    return points;
}

export function createCurveLine(p1, p2) {
    const points = getGreatCirclePoints(p1, p2, 70);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.65 });
    return new THREE.Line(geometry, material);
}

export function updateConnectionCurves(scene, selectedCountries) {
    if (!scene) return;
    
    connectionCurves.forEach(curve => scene.remove(curve));
    glowSpheres.forEach(sphere => scene.remove(sphere));
    connectionCurves = [];
    glowSpheres = [];
    
    const data = window.foodWasteData;
    if (!data) return;
    
    if (selectedCountries.length >= 2) {
        const positions = [];
        selectedCountries.forEach(cname => {
            const c = data.find(d => d.country === cname);
            if (c) positions.push(latLongToVector3(c.lat, c.lon, 1.22));
        });
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const curveLine = createCurveLine(positions[i], positions[j]);
                scene.add(curveLine);
                connectionCurves.push(curveLine);
                
                const glowMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.4 });
                const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), glowMat);
                sphere1.position.copy(positions[i]);
                const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), glowMat);
                sphere2.position.copy(positions[j]);
                scene.add(sphere1);
                scene.add(sphere2);
                glowSpheres.push(sphere1, sphere2);
            }
        }
    }
}

const analysisCache = new Map();

async function getAnalysis(c) {
    if (analysisCache.has(c.country)) {
        return analysisCache.get(c.country);
    }

    const result = await analyzeCountryDynamically(c);
    analysisCache.set(c.country, result);

    return result;
}

const API_URL = "https://rpymqbayaa.execute-api.ap-southeast-2.amazonaws.com/prod";

export async function analyzeCountryDynamically(country) {
    const GLOBAL_AVG = window.GLOBAL_AVG || 120;

    const householdPct = ((country.household / country.combined) * 100).toFixed(0);
    const retailPct = ((country.retail / country.combined) * 100).toFixed(0);
    const foodPct = ((country.foodService / country.combined) * 100).toFixed(0);

    const payload = {
        country: country.country,
        combined: country.combined,
        householdPct,
        retailPct,
        foodPct,
        vsGlobal: country.combined - GLOBAL_AVG
    };

    try {
        const res = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const ai = await res.json();

        return {
            reason: ai.reason,
            solution: ai.solution,
            householdPct,
            retailPct,
            foodPct
        };

    } catch (err) {
        console.error(err);

        return {
            reason: "AI analysis failed.",
            solution: "Retry or check API connection.",
            householdPct,
            retailPct,
            foodPct
        };
    }
}

export async function renderDynamicAnalysis(apiData, charts) {
    const countriesData = apiData.countries;
    const GLOBAL_AVG = apiData.globalAvg || 120;

    if (!countriesData || !countriesData.length) {
        console.error('[Analysis] No data available');
        return;
    }

    // =====================
    // BAR CHART
    // =====================
    const datasets = countriesData.map((d, idx) => ({
        label: d.country,
        data: [d.combined, d.household, d.retail, d.foodService],
        backgroundColor: `hsl(${260 + idx * 40}, 75%, 60%)`,
        borderRadius: 8
    }));

    if (charts.barChart) charts.barChart.destroy();
    charts.barChart = new Chart(charts.ctxBar, {
        type: 'bar',
        data: {
            labels: ['Total Waste', 'Household', 'Retail', 'Food Service'],
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#e2e8f0' } }
            }
        }
    });

    // =====================
    // RADAR CHART
    // =====================
    const radarDatasets = countriesData.map((d, idx) => ({
        label: d.country,
        data: [d.combined, d.household, d.retail, d.foodService],
        borderColor: `hsl(${260 + idx * 40}, 75%, 60%)`,
        backgroundColor: `hsla(${260 + idx * 40}, 75%, 60%, 0.2)`
    }));

    if (charts.radarChart) charts.radarChart.destroy();
    charts.radarChart = new Chart(charts.ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Total Waste', 'Household', 'Retail', 'Food Service'],
            datasets: radarDatasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#cbd5e1' } }
            }
        }
    });

    // =====================
    // LINE CHART
    // =====================
    if (charts.lineChart) charts.lineChart.destroy();
    charts.lineChart = new Chart(charts.ctxLine, {
        type: 'line',
        data: {
            labels: countriesData.map(d => d.country),
            datasets: [
                {
                    label: 'Total Waste (kg/person/year)',
                    data: countriesData.map(d => d.combined),
                    borderColor: '#c084fc',
                    backgroundColor: 'rgba(192,132,252,0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Global Average',
                    data: Array(countriesData.length).fill(GLOBAL_AVG),
                    borderColor: '#f97316',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#e2e8f0' } }
            }
        }
    });

    // =====================
    // TABLE
    // =====================
    document.getElementById('tableBody').innerHTML = countriesData.map(d => `
        <tr>
            <td>
                <img src="${d.flagUrl}" style="width:24px;height:18px;border-radius:3px;margin-right:8px;">
                ${d.country}
            </td>
            <td><strong>${d.combined}</strong></td>
            <td>${d.household}</td>
            <td>${d.retail}</td>
            <td>${d.foodService}</td>
            <td>${(d.combined - GLOBAL_AVG).toFixed(0)}</td>
        </tr>
    `).join('');

    // =====================
    // STATS
    // =====================
    const maxCountry = countriesData.reduce((a, b) => a.combined > b.combined ? a : b);
    const minCountry = countriesData.reduce((a, b) => a.combined < b.combined ? a : b);
    const avgVal = (countriesData.reduce((s, d) => s + d.combined, 0) / countriesData.length).toFixed(1);

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><span>🏆</span><h4>Highest Waste</h4><p>${maxCountry.country}<br><strong>${maxCountry.combined} kg</strong></p></div>
        <div class="stat-card"><span>⭐</span><h4>Lowest Waste</h4><p>${minCountry.country}<br><strong>${minCountry.combined} kg</strong></p></div>
        <div class="stat-card"><span>📊</span><h4>Average Waste</h4><p>${avgVal} kg/person</p></div>
    `;
    
    // Root cause analysis
    let rootHtml = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (const c of countriesData) {
        const analysis = await getAnalysis(c);

        rootHtml += `
            <div style="background:rgba(0,0,0,0.3);border-radius:20px;padding:16px;border-left:4px solid #c084fc;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                    <img src="${c.flagUrl}" style="width:32px;height:24px;">
                    <span style="font-weight:700;">${c.country}</span>
                    <span>🏠${analysis.householdPct}% 🏬${analysis.retailPct}% 🍽️${analysis.foodPct}%</span>
                </div>
                <div>${analysis.reason}</div>
            </div>
        `;
    }
    rootHtml += '</div>';
    document.getElementById('rootCauseAnalysis').innerHTML = rootHtml;
    
    // Solutions
    let solHtml = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (const c of countriesData) {
        const analysis = await getAnalysis(c);

        solHtml += `
            <div style="background:rgba(0,0,0,0.3);border-radius:20px;padding:16px;border-left:4px solid #fbbf24;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <img src="${c.flagUrl}" style="width:32px;height:24px;">
                    <span style="font-weight:700;">${c.country}</span>
                </div>
                <div style="margin-top:8px;">${analysis.solution}</div>
            </div>
        `;
    }
    solHtml += '</div>';
    document.getElementById('solutionAnalysis').innerHTML = solHtml;
    
    // Comprehensive insights
    document.getElementById('aiInsightText').innerHTML = `
        <p><strong>📊 Data-Driven Insights</strong><br>
        ▪ Among selected ${countriesData.length} countries, <strong>${maxCountry.country}</strong> has highest waste (${maxCountry.combined} kg/person/year)<br>
        ▪ Average waste is <strong>${avgVal} kg/person/year</strong>, ${avgVal > GLOBAL_AVG ? 'above' : 'below'} global average<br>
        ▪ <strong>${maxCountry.country}</strong> requires priority intervention<br>
        ▪ <strong>${minCountry.country}</strong> serves as regional benchmark</p>
    `;
}