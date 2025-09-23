'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  showControls?: boolean;
  onLoading?: (isLoading: boolean) => void;
  onError?: (error: Error) => void;
}

export default function ModelViewer({ 
  modelUrl, 
  className = '', 
  showControls = true,
  onLoading,
  onError
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl) return;

    setIsLoading(true);
    setError(null);
    if (onLoading) onLoading(true);

    let localUrl: string | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: any = null;
    let animationFrameId: number | null = null;
    let lights: THREE.Light[] = [];

    const initScene = async () => {
      try {
        // Fetch model and create object URL
        const res = await fetch(modelUrl);
        if (!res.ok) throw new Error(`Failed to fetch model: ${res.status}`);
        
        const blob = await res.blob();
        localUrl = URL.createObjectURL(blob);

        // Set up Three.js scene with better background
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a); // Darker background for better contrast

        const width = mountRef.current.clientWidth;
const height = mountRef.current.clientHeight;

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(3, 2, 5); // Better camera position for model viewing

        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true // Enable transparency
        });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better tone mapping
        renderer.toneMappingExposure = 1; // Adjust exposure
        
        // Clear previous content and add renderer
        if (mountRef.current) {
          mountRef.current.innerHTML = '';
          mountRef.current.appendChild(renderer.domElement);
        }

        // ENHANCED LIGHTING SETUP - This is the key improvement!
        
        // 1. Hemisphere Light for ambient lighting (simulates sky and ground)
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.6);
        scene.add(hemisphereLight);
        lights.push(hemisphereLight);

        // 2. Main Directional Light (simulates sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        
        // High-quality shadow settings
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.bias = -0.0001; // Reduces shadow acne
        
        scene.add(directionalLight);
        lights.push(directionalLight);

        // 3. Fill Light (softens shadows)
        const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
        fillLight.position.set(-5, 5, -5);
        scene.add(fillLight);
        lights.push(fillLight);

        // 4. Rim Light (adds edge definition)
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(0, 5, -10);
        scene.add(rimLight);
        lights.push(rimLight);

        // 5. Point Light for additional illumination (optional)
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        lights.push(pointLight);

        // Load model
        const loader = new GLTFLoader();
        loader.load(
          localUrl,
          (gltf) => {
            console.log('Model loaded successfully:', gltf);
            
            // Center and scale the model if needed
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model
            gltf.scene.position.sub(center);
            
            // Scale the model to fit in view
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim; // Adjust this value based on your needs
            gltf.scene.scale.multiplyScalar(scale);
            
            // Enable shadows for all meshes in the model
            gltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Ensure materials respond to lighting
                if (child.material) {
                  child.material.side = THREE.DoubleSide; // Render both sides
                }
              }
            });
            
            scene!.add(gltf.scene);
            setIsLoading(false);
            if (onLoading) onLoading(false);
          },
          (progress) => {
            console.log('Loading progress:', progress);
          },
          (error) => {
            console.error('Error loading model:', error);
            setError(`Failed to load model: ${error.message}`);
            setIsLoading(false);
            if (onLoading) onLoading(false);
            if (onError) onError(error);
          }
        );

        // Add orbit controls if enabled
        if (showControls) {
          const OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.screenSpacePanning = false;
          controls.minDistance = 1;
          controls.maxDistance = 100;
          controls.maxPolarAngle = Math.PI / 2;
        }

        // Animation loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (controls) controls.update();
          renderer!.render(scene!, camera!);
        };
        animate();

        // Handle window resize
        const onResize = () => {
          if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        };
       
        const resizeObserver = new ResizeObserver(() => {
  if (camera && renderer && mountRef.current) {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
});

if (mountRef.current) {
  resizeObserver.observe(mountRef.current);
}

        // Cleanup function
        return () => {
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', onResize);
          if (localUrl) URL.revokeObjectURL(localUrl);
          if (renderer) renderer.dispose();
          if (controls) controls.dispose();
          
          // Remove lights from scene
          lights.forEach(light => {
            if (scene) scene.remove(light);
          });
        };
      } catch (err) {
        console.error('Error initializing 3D scene:', err);
        setError(`Failed to initialize 3D viewer: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
        if (onLoading) onLoading(false);
        if (onError && err instanceof Error) onError(err);
      }
    };

    initScene();

    // Cleanup on unmount or URL change
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (localUrl) URL.revokeObjectURL(localUrl);
      if (renderer) renderer.dispose();
      if (controls) controls.dispose();
      
      // Remove lights from scene
      lights.forEach(light => {
        if (scene) scene.remove(light);
      });
    };
  }, [modelUrl, showControls, onLoading, onError]);

  return (
    <div className={`model-viewer ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          zIndex: 10,
          textAlign: 'center'
        }}>
          <div>Loading 3D model...</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            Setting up lighting...
          </div>
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff6b6b',
          zIndex: 10,
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Error Loading Model</div>
          <div style={{ fontSize: '12px' }}>{error}</div>
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}