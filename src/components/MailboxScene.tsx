import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MailboxSceneProps {
  activeMethod: string | null;
}

function Mailbox({ position, isOpen, letter }: {
  position: [number, number, number];
  isOpen: boolean;
  letter?: { position: [number, number, number]; isMoving: boolean; }
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const letterRef = useRef<THREE.Group>(null!);
  const flagRef = useRef<THREE.Mesh>(null!);
  
  // Animate letter movement and flag
  useFrame((state, delta) => {
    if (letterRef.current && letter?.isMoving) {
      // Move letter out when mailbox is open
      const startZ = 0.2; // Initial position inside mailbox
      const endZ = 2.0; // Final position outside mailbox
      const targetZ = isOpen ? endZ : startZ;
      
      letterRef.current.position.z = THREE.MathUtils.lerp(
        letterRef.current.position.z,
        targetZ,
        0.1
      );

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
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
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
          position={[0.35, 0.3, 0.2]}
          rotation={[0, Math.PI / 4, 0]}
          ref={letterRef}
        >
          <group rotation={[0, Math.PI/2, 0]}>
            {/* Envelope base */}
            <mesh position={[0, 0, -0.2]}>
              <boxGeometry args={[0.8, 0.6, 0.02]} />
              <meshStandardMaterial color="#f7fafc" />
            </mesh>

            {/* Envelope flap */}
            <mesh position={[0, 0.15, -0.2]} rotation={[isOpen ? -Math.PI/4 : 0, 0, 0]}>
              <boxGeometry args={[0.8, 0.3, 0.02]} />
              <meshStandardMaterial color="#edf2f7" />
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

export default function MailboxScene({ activeMethod }: MailboxSceneProps) {
  const getMethodDescription = () => {
    switch (activeMethod) {
      case 'getCharacter(): char':
        return {
          title: 'Getting a Character',
          description: 'Like checking your mailbox to see what letter is stored inside. The mailbox opens and you retrieve the character (represented by the letter).',
          action: 'Opening mailbox to retrieve letter...'
        };
      default:
        return {
          title: 'Interactive UML Visualization',
          description: 'Click any method in the UML diagram to see how it works with our mailbox analogy!',
          action: 'Waiting for method selection...'
        };
    }
  };

  // Determine mailbox states based on active method
  const mailboxStates = {
    getChar: {
      isOpen: activeMethod === 'getCharacter(): char',
      hasLetter: true,
      position: [-1, 0, 0] as [number, number, number]
    }
  };

  const description = getMethodDescription();

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full h-[300px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <Canvas camera={{ position: [2, 1, 2], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, 2, -2]} intensity={0.5} color="#ffffff" />

          {/* Mailboxes */}
          {Object.entries(mailboxStates).map(([key, state]) => (
            <Mailbox
              key={key}
              position={state.position}
              isOpen={state.isOpen}
              letter={state.hasLetter ? { position: [0, 0, 0], isMoving: true } : undefined}
            />
          ))}

          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Description of current action */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-blue-900 text-center">
            {description.title}
          </h3>
          <p className="text-sm text-blue-800 text-center">
            {description.description}
          </p>
          <div className="mt-2 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-pulse">
              {description.action}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
