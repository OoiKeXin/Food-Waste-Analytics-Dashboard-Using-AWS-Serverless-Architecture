import * as THREE from 'three';

export let allSprites = [];

export function latLongToVector3(lat, lon, radius = 1.22) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function createFlagSprite(country) {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(120, 110, 82, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172aee';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(120, 110, 79, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(120, 110, 70, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = country.flagUrl;
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.22, 0.26, 1);
    sprite.userData = { country: country.country, data: country };
    sprite.position.copy(latLongToVector3(country.lat, country.lon, 1.21));
    
    img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(120, 110, 62, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, 120 - 58, 110 - 42, 116, 84);
        ctx.restore();
        ctx.font = 'bold 26px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(country.code.toUpperCase(), 120, 195);
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        let displayName = country.country.length > 9 ? country.country.slice(0,8)+'..' : country.country;
        ctx.fillText(displayName, 120, 232);
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${country.combined} kg/year`, 120, 262);
        texture.needsUpdate = true;
    };
    
    img.onerror = () => {
        console.warn('[Marker] Failed to load flag for:', country.country);
        ctx.font = 'bold 30px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(country.code.toUpperCase(), 120, 170);
        texture.needsUpdate = true;
    };
    
    return sprite;
}

export function createAllSprites(scene) {
    allSprites = [];
    const data = window.foodWasteData;
    
    if (!data || !data.length) {
        console.error('[Markers] No data available to create sprites');
        return;
    }
    
    console.log('[Markers] Creating sprites for', data.length, 'countries');
    
    data.forEach(country => {
        const sprite = createFlagSprite(country);
        allSprites.push(sprite);
        scene.add(sprite);
    });
    
    console.log('[Markers] Created', allSprites.length, 'flag sprites');
}

export function updateVisibleSpritesByCamera(scene, camera) {
    if (!camera || !allSprites.length) return;
    const cameraPos = camera.position.clone();
    const earthCenter = new THREE.Vector3(0, 0, 0);
    const viewDir = cameraPos.clone().sub(earthCenter).normalize();
    allSprites.forEach(sprite => {
        const spritePos = sprite.position.clone();
        const toMarker = spritePos.clone().sub(earthCenter).normalize();
        const dot = viewDir.dot(toMarker);
        const shouldShow = dot > 0.1;
        if (shouldShow && !sprite.parent) scene.add(sprite);
        else if (!shouldShow && sprite.parent) scene.remove(sprite);
    });
}

export function highlightSelectedMarkers(selectedCountries) {
    allSprites.forEach(sprite => {
        const isSelected = selectedCountries.includes(sprite.userData.country);
        if (isSelected) {
            sprite.scale.setScalar(0.27);
            sprite.material.opacity = 1;
        } else if (sprite.parent) {
            sprite.scale.setScalar(0.22);
            sprite.material.opacity = 0.95;
        }
    });
}