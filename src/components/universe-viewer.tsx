import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3 } from 'three';
import { OrbitControls, Text } from '@react-three/drei';
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

interface PlanetData {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  color: string;
  temperature: number;
  period: number;
  discovered?: boolean;
  stats: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
}

interface UniverseViewerProps {
  planets: PlanetData[];
  onPlanetSelect: (planet: PlanetData) => void;
  searchedPlanet?: string;
  discoveredPlanets?: Set<string>;
  className?: string;
}

function Planet({ 
  planetData, 
  onClick, 
  isHighlighted = false,
  scale = 1 
}: { 
  planetData: PlanetData;
  onClick: () => void;
  isHighlighted?: boolean;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Select texture based on temperature with random variation
  const getTextureForTemperature = (temp: number, planetId: string) => {
    // Use planet ID to deterministically select a variation
    const hash = planetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = (hash % 5) + 1;
    
    if (temp < 200) {
      const textures = [planetIceBlue1, planetIceBlue2, planetIceBlue3, planetIceBlue4, planetIceBlue5];
      return textures[variation - 1];
    }
    if (temp < 260) {
      const textures = [planetCyanCold1, planetCyanCold2, planetCyanCold3, planetCyanCold4, planetCyanCold5];
      return textures[variation - 1];
    }
    if (temp < 290) {
      const textures = [planetGreenTemperate1, planetGreenTemperate2, planetGreenTemperate3, planetGreenTemperate4, planetGreenTemperate5];
      return textures[variation - 1];
    }
    if (temp < 350) {
      const textures = [planetYellowWarm1, planetYellowWarm2, planetYellowWarm3, planetYellowWarm4, planetYellowWarm5];
      return textures[variation - 1];
    }
    if (temp < 450) {
      const textures = [planetOrangeHot1, planetOrangeHot2, planetOrangeHot3, planetOrangeHot4, planetOrangeHot5];
      return textures[variation - 1];
    }
    const textures = [planetRedScorching1, planetRedScorching2, planetRedScorching3, planetRedScorching4, planetRedScorching5];
    return textures[variation - 1];
  };

  const textureUrl = useMemo(() => getTextureForTemperature(planetData.temperature, planetData.id), [planetData.temperature, planetData.id]);
  const texture = useLoader(TextureLoader, textureUrl);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      
      // Gentle floating animation
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y += Math.sin(time * 0.5 + planetData.position[0]) * 0.001;
      
      // Highlight effect
      if (isHighlighted) {
        meshRef.current.scale.setScalar(scale * (1 + Math.sin(time * 2) * 0.1));
      }
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

  const atmosphereColor = getAtmosphereColor(planetData.temperature);

  return (
    <group position={planetData.position}>
      <mesh
        ref={meshRef}
        scale={scale * planetData.radius}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={planetData.temperature > 400 ? 0.2 : 0.5}
          metalness={planetData.temperature > 500 ? 0.4 : 0.2}
          emissive={isHighlighted ? atmosphereColor : planetData.temperature > 450 ? atmosphereColor : '#000000'}
          emissiveIntensity={isHighlighted ? 0.3 : planetData.temperature > 450 ? 0.15 : 0.05}
          transparent={false}
          opacity={1}
        />
      </mesh>
      
      {/* Enhanced Atmosphere with multiple layers */}
      <mesh scale={scale * planetData.radius * 1.08}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={planetData.temperature > 300 ? 0.25 : 0.15} // Hot planets have thicker atmospheres
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer atmosphere glow */}
      <mesh scale={scale * planetData.radius * 1.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Discovery glow - Red for undiscovered, Yellow for discovered */}
      <mesh scale={scale * planetData.radius * 1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={planetData.discovered ? '#FFD700' : '#FF0000'}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer discovery glow */}
      <mesh scale={scale * planetData.radius * 1.35}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={planetData.discovered ? '#FFD700' : '#FF0000'}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Planet label when hovered */}
      {hovered && (
        <Text
          position={[0, planetData.radius * scale + 2.5, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {planetData.name}
        </Text>
      )}
      
      {/* Glowing ring for highlighted planet */}
      {isHighlighted && (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={scale * planetData.radius * 1.2}>
          <ringGeometry args={[1, 1.1, 32]} />
          <meshBasicMaterial
            color={atmosphereColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function SpaceBackground() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Create starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    return () => {
      scene.remove(starField);
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, [scene]);

  return null;
}

function CameraController({ targetPlanet }: { targetPlanet?: PlanetData }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>();

  useEffect(() => {
    if (targetPlanet && controlsRef.current) {
      // Animate camera to planet
      const targetPosition = new Vector3(...targetPlanet.position);
      const cameraDistance = Math.max(10, targetPlanet.radius * 8);
      
      // Position camera at appropriate distance
      const cameraTarget = targetPosition.clone();
      cameraTarget.z += cameraDistance;
      
      // Smooth transition
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      let progress = 0;
      const animateCamera = () => {
        progress += 0.02;
        if (progress >= 1) {
          camera.position.copy(cameraTarget);
          controlsRef.current.target.copy(targetPosition);
          controlsRef.current.update();
          return;
        }
        
        camera.position.lerpVectors(startPosition, cameraTarget, progress);
        controlsRef.current.target.lerpVectors(startTarget, targetPosition, progress);
        controlsRef.current.update();
        
        requestAnimationFrame(animateCamera);
      };
      
      animateCamera();
    }
  }, [targetPlanet, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      maxDistance={200}
      minDistance={5}
      autoRotate={false}
      autoRotateSpeed={0.1}
    />
  );
}

function Lighting() {
  return (
    <>
      {/* Enhanced ambient lighting for better planet visibility */}
      <ambientLight intensity={0.15} color="#0a0a15" />
      
      {/* Main star light - warm yellow like our sun */}
      <directionalLight
        position={[100, 50, 50]}
        intensity={1.2}
        color="#fff8dc" // Warm white
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={1000}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      
      {/* Central star system - bright golden light */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffeb3b" />
      
      {/* Distant galaxy light sources for cinematic effect */}
      <pointLight position={[-200, 50, -150]} intensity={0.8} color="#ff4757" />
      <pointLight position={[200, -50, 150]} intensity={0.8} color="#3742fa" />
      <pointLight position={[0, 200, 0]} intensity={0.6} color="#2ed573" />
      <pointLight position={[0, -200, 0]} intensity={0.6} color="#ffa502" />
      
      {/* Subtle rim lighting for planet edges */}
      <directionalLight
        position={[-50, -50, -50]}
        intensity={0.3}
        color="#5352ed"
      />
    </>
  );
}

export function UniverseViewer({ planets, onPlanetSelect, searchedPlanet, discoveredPlanets, className }: UniverseViewerProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | undefined>();

  // Find searched planet
  const highlightedPlanet = searchedPlanet 
    ? planets.find(p => p.name.toLowerCase().includes(searchedPlanet.toLowerCase()))
    : undefined;

  useEffect(() => {
    if (highlightedPlanet) {
      setSelectedPlanet(highlightedPlanet);
    }
  }, [highlightedPlanet]);

  const handlePlanetClick = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
    onPlanetSelect(planet);
  }, [onPlanetSelect]);

  // Add discovered status to planets
  const planetsWithDiscovery = planets.map(planet => ({
    ...planet,
    discovered: discoveredPlanets?.has(planet.id) || false
  }));

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ background: 'linear-gradient(180deg, #000008 0%, #000020 50%, #001040 100%)' }}
        shadows
      >
        <Lighting />
        <SpaceBackground />
        <CameraController targetPlanet={selectedPlanet} />
        
        {planetsWithDiscovery.map((planet) => (
          <Planet
            key={planet.id}
            planetData={planet}
            onClick={() => handlePlanetClick(planet)}
            isHighlighted={planet.id === highlightedPlanet?.id}
            scale={3}
          />
        ))}
      </Canvas>
    </div>
  );
}