import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import planetIceBlue1 from '@/assets/planet-ice-blue-1.jpg';
import planetIceBlue2 from '@/assets/planet-ice-blue-2.jpg';
import planetIceBlue3 from '@/assets/planet-ice-blue-3.jpg';
import planetIceBlue4 from '@/assets/planet-ice-blue-4.jpg';
import planetIceBlue5 from '@/assets/planet-ice-blue-5.jpg';
import planetCyanCold1 from '@/assets/planet-cyan-cold-1.jpg';
import planetCyanCold2 from '@/assets/planet-cyan-cold-2.jpg';
import planetCyanCold3 from '@/assets/planet-cyan-cold-3.jpg';
import planetCyanCold4 from '@/assets/planet-cyan-cold-4.jpg';
import planetCyanCold5 from '@/assets/planet-cyan-cold-5.jpg';
import planetGreenTemperate1 from '@/assets/planet-green-temperate-1.jpg';
import planetGreenTemperate2 from '@/assets/planet-green-temperate-2.jpg';
import planetGreenTemperate3 from '@/assets/planet-green-temperate-3.jpg';
import planetGreenTemperate4 from '@/assets/planet-green-temperate-4.jpg';
import planetGreenTemperate5 from '@/assets/planet-green-temperate-5.jpg';
import planetYellowWarm1 from '@/assets/planet-yellow-warm-1.jpg';
import planetYellowWarm2 from '@/assets/planet-yellow-warm-2.jpg';
import planetYellowWarm3 from '@/assets/planet-yellow-warm-3.jpg';
import planetYellowWarm4 from '@/assets/planet-yellow-warm-4.jpg';
import planetYellowWarm5 from '@/assets/planet-yellow-warm-5.jpg';
import planetOrangeHot1 from '@/assets/planet-orange-hot-1.jpg';
import planetOrangeHot2 from '@/assets/planet-orange-hot-2.jpg';
import planetOrangeHot3 from '@/assets/planet-orange-hot-3.jpg';
import planetOrangeHot4 from '@/assets/planet-orange-hot-4.jpg';
import planetOrangeHot5 from '@/assets/planet-orange-hot-5.jpg';
import planetRedScorching1 from '@/assets/planet-red-scorching-1.jpg';
import planetRedScorching2 from '@/assets/planet-red-scorching-2.jpg';
import planetRedScorching3 from '@/assets/planet-red-scorching-3.jpg';
import planetRedScorching4 from '@/assets/planet-red-scorching-4.jpg';
import planetRedScorching5 from '@/assets/planet-red-scorching-5.jpg';

function Planet({ planetColor, planetTemperature }: { planetColor?: string; planetTemperature?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Color mapping based on color name to temperature
  const getTemperatureFromColor = (colorDesc?: string) => {
    if (!colorDesc) return 250; // Default Earth-like
    
    const lower = colorDesc.toLowerCase();
    if (lower.includes('red')) return 450; // Hot world
    if (lower.includes('orange')) return 350; // Very hot world
    if (lower.includes('yellow')) return 320; // Warm world
    if (lower.includes('green')) return 260; // Temperate world
    if (lower.includes('blue')) return 200; // Cold world
    return 250; // Default
  };

  // Use same color logic as universe-viewer for consistency
  const temperature = planetTemperature ?? getTemperatureFromColor(planetColor);
  
  // Select texture based on temperature - use first variation for preview
  const getTextureForTemperature = (temp: number) => {
    if (temp < 200) return planetIceBlue1;
    if (temp < 260) return planetCyanCold1;
    if (temp < 290) return planetGreenTemperate1;
    if (temp < 350) return planetYellowWarm1;
    if (temp < 450) return planetOrangeHot1;
    return planetRedScorching1;
  };

  const textureUrl = useMemo(() => getTextureForTemperature(temperature), [temperature]);
  const texture = useLoader(TextureLoader, textureUrl);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  // Get atmosphere color based on temperature
  const getAtmosphereColor = (temp: number) => {
    if (temp < 200) return 'hsl(240, 70%, 50%)';
    if (temp < 260) return 'hsl(200, 65%, 55%)';
    if (temp < 290) return 'hsl(120, 60%, 45%)';
    if (temp < 350) return 'hsl(60, 70%, 55%)';
    if (temp < 450) return 'hsl(30, 80%, 50%)';
    return 'hsl(0, 85%, 45%)';
  };

  const atmosphereColor = getAtmosphereColor(temperature);

  return (
    <mesh ref={meshRef} scale={2}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial 
        map={texture}
        roughness={temperature > 400 ? 0.2 : 0.5}
        metalness={temperature > 500 ? 0.4 : 0.2}
        emissive={temperature > 450 ? atmosphereColor : '#000000'}
        emissiveIntensity={temperature > 450 ? 0.15 : 0.05}
        transparent={false}
        opacity={1}
      />
      {/* Atmosphere glow effect */}
      <mesh scale={2.08}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={temperature > 300 ? 0.25 : 0.15}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Outer glow */}
      <mesh scale={2.15}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        color="#f4a261"
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#e76f51" />
    </>
  );
}

interface PlanetViewerProps {
  className?: string;
  planetColor?: string;
  planetTemperature?: number;
}

export function PlanetViewer({ className, planetColor, planetTemperature }: PlanetViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={className}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Lighting />
        <Planet planetColor={planetColor} planetTemperature={planetTemperature} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          maxDistance={8}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}