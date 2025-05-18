import React, { useRef } from 'react';
import * as THREE from 'three';

interface Letter3DProps {
  color?: string;
}

const Letter3D: React.FC<Letter3DProps> = ({ 
  color = '#f7fafc' 
}) => {
  const letterRef = useRef<THREE.Group>(null!);

  return (
    <group
      ref={letterRef}
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
