import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { createAllSprites, updateVisibleSpritesByCamera, highlightSelectedMarkers, allSprites } from './markers.js';
import { updateConnectionCurves } from './analysis.js';
import { selectedCountries, handleCountrySelection } from './ui.js';

let scene, camera, renderer, controls, raycaster, globeMesh;
const EARTH_RADIUS = 1.22;

// Make allSprites available globally for other modules
window.allSprites = allSprites;

export function initGlobe() {
    if (renderer) return renderer;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.2, 4.5);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const earthMat = new THREE.MeshPhongMaterial({ 
        map: earthMap, specularMap: earthSpecular, specular: new THREE.Color('grey'), shininess: 5, normalMap: earthNormal 
    });
    globeMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 128, 128), earthMat);
    scene.add(globeMesh);
    
    const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    const cloudMat = new THREE.MeshPhongMaterial({ map: cloudMap, transparent: true, opacity: 0.12 });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS + 0.01, 128, 128), cloudMat);
    scene.add(clouds);
    
    const ambient = new THREE.AmbientLight(0x303060);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const fillLight = new THREE.PointLight(0x4466cc, 0.4);
    fillLight.position.set(-2, 1, -3);
    scene.add(fillLight);
    
    // Check if data is available, if not wait
    if (window.foodWasteData && window.foodWasteData.length > 0) {
        createAllSprites(scene);
        setupClickHandler();
    } else {
        console.log('[Globe] Waiting for data...');
        const checkData = setInterval(() => {
            if (window.foodWasteData && window.foodWasteData.length > 0) {
                clearInterval(checkData);
                console.log('[Globe] Data ready, creating sprites');
                createAllSprites(scene);
                setupClickHandler();
            }
        }, 100);
    }
    
    function setupClickHandler() {
        raycaster = new THREE.Raycaster();
        renderer.domElement.addEventListener('click', (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            );
            raycaster.setFromCamera(mouse, camera);
            // Use the exported allSprites array
            const visibleSprites = allSprites.filter(s => s.parent === scene);
            const intersects = raycaster.intersectObjects(visibleSprites);
            if (intersects.length > 0) {
                const countryName = intersects[0].object.userData.country;
                console.log('[Globe] Clicked on:', countryName);
                handleCountrySelection(countryName, scene);
            }
        });
    }
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        if (allSprites && allSprites.length > 0) {
            updateVisibleSpritesByCamera(scene, camera);
            highlightSelectedMarkers(selectedCountries);
            updateConnectionCurves(scene, selectedCountries);
        }
        renderer.render(scene, camera);
    }
    animate();
    
    return { scene, camera, controls, renderer };
}