import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Letter3DProps {
  position: [number, number, number];
  isMoving: boolean;
  isOpen: boolean; // Whether the mailbox is open
  color?: string;
}

const Letter3D: React.FC<Letter3DProps> = ({ 
  position, 
  isMoving, 
  isOpen, 
  color = '#f7fafc' 
}) => {
  const letterRef = useRef<THREE.Group>(null!);
  
  // Animate letter movement
  useFrame((state, delta) => {
    if (letterRef.current && isMoving) {
      // Move letter out when mailbox is open
      const startZ = 0.65; // Just behind the front panel (0.7)
      const endZ = 2.5;    // Further outside mailbox
      const targetZ = isOpen ? endZ : startZ;
      
      // Limit how far back the letter can go
      const minZ = 0.65; // Never go further back than this
      
      const newZ = THREE.MathUtils.lerp(
        letterRef.current.position.z,
        targetZ,
        0.1
      );
      
      // Ensure letter doesn't go too far back
      letterRef.current.position.z = Math.max(newZ, minZ);

      // Add slight wobble when moving
      if (isOpen) {
        letterRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group
      ref={letterRef}
      position={[position[0], position[1], position[2]]}
      rotation={[0, 0, 0]}
    >
      <group rotation={[0, Math.PI / 2, 0]}>
        {/* Envelope base */}
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.8, 0.6, 0.02]} />
          <meshStandardMaterial color={color} />
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
  );
};

export default Letter3D;
