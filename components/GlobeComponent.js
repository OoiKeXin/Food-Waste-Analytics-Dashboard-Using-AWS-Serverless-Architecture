// This is a wrapper component for the 3D Globe
// It can be used if you want to encapsulate the globe logic in a class

import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export class GlobeComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.globeMesh = null;
        this.EARTH_RADIUS = 1.22;
        
        this.init();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050811);
        
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0.2, 4.5);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomSpeed = 1.2;
        
        this.loadEarthTexture();
        this.setupLights();
        
        this.animate();
    }
    
    loadEarthTexture() {
        const textureLoader = new THREE.TextureLoader();
        const earthMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earthSpecular = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        const earthNormal = textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        
        const earthMat = new THREE.MeshPhongMaterial({
            map: earthMap,
            specularMap: earthSpecular,
            specular: new THREE.Color('grey'),
            shininess: 5,
            normalMap: earthNormal
        });
        
        this.globeMesh = new THREE.Mesh(new THREE.SphereGeometry(this.EARTH_RADIUS, 128, 128), earthMat);
        this.scene.add(this.globeMesh);
        
        // Add clouds layer
        const cloudMap = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
        const cloudMat = new THREE.MeshPhongMaterial({ map: cloudMap, transparent: true, opacity: 0.12 });
        const clouds = new THREE.Mesh(new THREE.SphereGeometry(this.EARTH_RADIUS + 0.01, 128, 128), cloudMat);
        this.scene.add(clouds);
    }
    
    setupLights() {
        const ambient = new THREE.AmbientLight(0x303060);
        this.scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 3, 5);
        this.scene.add(dirLight);
        
        const fillLight = new THREE.PointLight(0x4466cc, 0.4);
        fillLight.position.set(-2, 1, -3);
        this.scene.add(fillLight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
}