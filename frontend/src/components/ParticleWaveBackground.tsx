import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettings } from '../context/SettingsContext';

const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { theme } = useSettings();
  
  // Grid settings
  const count = 120;
  const sep = 1.2;
  
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  // Track mouse for interactivity
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * count * 3);
    const colors = new Float32Array(count * count * 3);
    
    let i = 0;
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        // x, y, z
        positions[i] = ix * sep - (count * sep) / 2;
        positions[i + 1] = 0; // y will be animated
        positions[i + 2] = iy * sep - (count * sep) / 2;
        
        // Initial colors
        colors[i] = 1;
        colors[i + 1] = 1;
        colors[i + 2] = 1;
        
        i += 3;
      }
    }
    
    return [positions, colors];
  }, [count, sep]);
  
  const color1 = theme === 'dark' ? new THREE.Color('#F97316') : new THREE.Color('#2563EB'); // Orange vs Blue
  const color2 = theme === 'dark' ? new THREE.Color('#A855F7') : new THREE.Color('#4F46E5'); // Purple vs Indigo
  const color3 = theme === 'dark' ? new THREE.Color('#EC4899') : new THREE.Color('#0D9488'); // Pink vs Teal
  const color4 = theme === 'dark' ? new THREE.Color('#10B981') : new THREE.Color('#0891B2'); // Green vs Cyan

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    
    let i = 0;
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        // Complex sine wave for height
        const y = Math.sin((ix + time * 0.8) * 0.15) * 5 + 
                  Math.sin((iy + time * 0.6) * 0.15) * 5 + 
                  Math.sin((ix + iy + time) * 0.1) * 3;
        
        positions[i + 1] = y;
        
        // Dynamic colors based on position and time
        const mixRatio = (Math.sin(ix * 0.05 + time * 0.5) + 1) / 2;
        const mixRatio2 = (Math.cos(iy * 0.05 - time * 0.3) + 1) / 2;
        
        const finalColor = color1.clone().lerp(color2, mixRatio);
        finalColor.lerp(mixRatio2 > 0.5 ? color3 : color4, mixRatio2);
        
        colors[i] = finalColor.r;
        colors[i + 1] = finalColor.g;
        colors[i + 2] = finalColor.b;
        
        i += 3;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    
    // Slight rotation/tilt based on mouse to give parallax depth
    pointsRef.current.rotation.x = -Math.PI / 4 + mouse.y * 0.15;
    pointsRef.current.rotation.y = mouse.x * 0.2;
    pointsRef.current.position.y = -5;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

export const ParticleWaveBackground = () => {
  const { theme } = useSettings();
  
  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none w-full h-full transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0c]' : 'bg-slate-50'}`}>
      <Canvas camera={{ position: [0, 10, 40], fov: 55 }}>
        <fog attach="fog" args={[theme === 'dark' ? '#0a0a0c' : '#f8fafc', 20, 80]} />
        <Particles />
      </Canvas>
    </div>
  );
};
