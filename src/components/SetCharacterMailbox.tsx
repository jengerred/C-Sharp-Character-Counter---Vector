import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SetCharacterMailboxProps {
  isActive: boolean;
}

function Mailbox({ position, isOpen, letter }: {
  position: [number, number, number];
  isOpen: boolean;
  letter?: { position: [number, number, number]; isMoving: boolean; }
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const letterRef = useRef<THREE.Group>(null!);
  const flagRef = useRef<THREE.Mesh>(null!);
  
  // Animate flag only, letter position is controlled by parent component
  useFrame((state, delta) => {
    if (letterRef.current && letter?.isMoving) {
      // Add slight wobble when moving
      if (isOpen) {
        letterRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }

    if (flagRef.current) {
      // Animate flag based on mailbox state
      const targetRotation = isOpen ? -Math.PI / 4 : 0;
      flagRef.current.rotation.z = THREE.MathUtils.lerp(
        flagRef.current.rotation.z,
        targetRotation,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, -1.5, -0.2]}>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Main mailbox body */}
      <group position={[0, 0, 0]} rotation={[0, -Math.PI * 0.1, 0]}>
        {/* Main body - front section */}
        <mesh position={[0, 0.3, 0.35]}>
          <boxGeometry args={[0.9, 0.7, 0.7]} />
          <meshStandardMaterial color="#4299E1" />
        </mesh>

        {/* Main body - back section */}
        <mesh position={[0, 0.3, -0.4]}>
          <boxGeometry args={[0.9, 0.7, 1.2]} />
          <meshStandardMaterial color="#4299E1" />
        </mesh>

        {/* Front panel (darker) */}
        <mesh position={[0, 0.3, 0.7]}>
          <boxGeometry args={[0.8, 0.6, 0.02]} />
          <meshStandardMaterial color="#2B6CB0" />
        </mesh>

        {/* Flag */}
        <group position={[0.45, 0.3, 0]}>
          {/* Pole */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color="#4a5568" />
          </mesh>
          {/* Flag part */}
          <mesh 
            ref={flagRef}
            position={[0.15, 0.3, 0]}
          >
            <boxGeometry args={[0.25, 0.2, 0.02]} />
            <meshStandardMaterial color="#e53e3e" />
          </mesh>
        </group>
      </group>

      {/* Letter */}
      {letter && (
        <group
          position={letter.position || [0.2, 0.3, 0.65]}
          rotation={[0, 0, 0]}
          ref={letterRef}
        >
          <group rotation={[0, Math.PI / 2, 0]}>
            {/* Envelope base */}
            <mesh position={[0, 0, -0.2]}>
              <boxGeometry args={[0.8, 0.6, 0.02]} />
              <meshStandardMaterial color="#f7fafc" />
            </mesh>

            {/* Stamp */}
            <mesh position={[0.25, 0.15, -0.19]}>
              <boxGeometry args={[0.2, 0.2, 0.01]} />
              <meshStandardMaterial color="#cbd5e0" />
            </mesh>

            {/* Address lines */}
            <mesh position={[0, 0, -0.19]}>
              <boxGeometry args={[0.6, 0.03, 0.01]} />
              <meshStandardMaterial color="#a0aec0" />
            </mesh>
            <mesh position={[0, -0.1, -0.19]}>
              <boxGeometry args={[0.6, 0.03, 0.01]} />
              <meshStandardMaterial color="#a0aec0" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

const SetCharacterMailbox: React.FC<SetCharacterMailboxProps> = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [letterPosition, setLetterPosition] = useState<[number, number, number]>([0.2, 0.3, 2.5]); // Start letter outside but near mailbox
  
  // Control the animation based on active state
  useEffect(() => {
    if (isActive) {
      // Animation sequence for setting a character
      // Phase 1: Open mailbox
      const openTimer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      // Phase 2: Move letter into mailbox (shortly after opening)
      const moveLetterTimer = setTimeout(() => {
        setLetterPosition([0.2, 0.3, 0.65]); // Move letter to mailbox position
      }, 800); // 500ms for opening + 300ms delay
      
      // Phase 3: Close mailbox (letter is now inside)
      const closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      
      return () => {
        clearTimeout(openTimer);
        clearTimeout(moveLetterTimer);
        clearTimeout(closeTimer);
      };
    } else {
      // Reset animation state when component becomes inactive
      setIsOpen(false);
      setLetterPosition([0.2, 0.3, 2.5]); // Reset letter position
    }
  }, [isActive]);

  return (
    <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 2, -2]} intensity={0.5} color="#ffffff" />
      
      <Mailbox
        position={[1, 0.2, -0.8]}
        isOpen={isOpen}
        letter={{ position: letterPosition, isMoving: true }}
      />
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  );
};

export default SetCharacterMailbox;
