import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Mailbox3DProps {
  position: [number, number, number];
  isOpen: boolean;
}

const Mailbox3D: React.FC<Mailbox3DProps> = ({ position, isOpen }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const flagRef = useRef<THREE.Mesh>(null!);
  
  // Animate flag
  useFrame((state, delta) => {
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
    </group>
  );
};

export default Mailbox3D;
