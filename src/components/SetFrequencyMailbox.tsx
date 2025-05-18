import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import Mailbox3D from './Mailbox3D';
import Letter3D from './Letter3D';

interface SetFrequencyMailboxProps {
  isActive: boolean;
}

interface LetterProps {
  position: [number, number, number];
  color: string;
  id: string;
}

const SetFrequencyMailbox: React.FC<SetFrequencyMailboxProps> = ({ isActive }) => {
  console.log('Rendering SetFrequencyMailbox with isActive:', isActive);
  const [isOpen, setIsOpen] = useState(false);
  const [showCount, setShowCount] = useState(false);

  // Control the animation based on active state
  useEffect(() => {
    if (isActive) {
      console.log('SetFrequencyMailbox active, starting animation');
      setIsOpen(false);
      setShowCount(false);
      
      const timer1 = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      const timer2 = setTimeout(() => {
        setShowCount(true);
      }, 1200);
      
      return () => {
        // Clean up timers
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Reset animation state when component becomes inactive
      setIsOpen(false);
      setShowCount(false);
    }
  }, [isActive]);

  // Define the letters with their positions and offsets
  const letters: LetterProps[] = [
    // Gray letter (leftmost)
    {
      position: [-0.3, 0, 0.2],
      color: "#f7fafc",
      id: 'gray-1'
    },
    // First red letter (left of center)
    {
      position: [-0.1, 0, 0.2],
      color: "#e53e3e",
      id: 'red-1'
    },
    // Second red letter (right of center)
    {
      position: [0.1, 0, 0.2],
      color: "#e53e3e",
      id: 'red-2'
    },
    // Green letter (rightmost)
    {
      position: [0.3, 0, 0.2],
      color: "#38a169",
      id: 'green-1'
    }
  ];

  // Control the animation based on active state
  useEffect(() => {
    if (isActive) {
      // Reset animation state
      setIsOpen(false);
      setShowCount(false);
      
      // Animation sequence with timers
      const timer1 = setTimeout(() => {
        // First open the mailbox after a short delay
        setIsOpen(true);
      }, 500);
      
      const timer2 = setTimeout(() => {
        // Show count after letters are visible
        setShowCount(true);
        // Count display will stay visible permanently
      }, 1200);
      
      return () => {
        // Clean up timers
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      // Reset animation state when component becomes inactive
      setIsOpen(false);
      setShowCount(false);
    }
  }, [isActive]);

  return (
    <div className="w-full h-[300px]">
      <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 2, -2]} intensity={0.5} color="#ffffff" />
        <group position={[1, 0.2, -0.8]}>
          <Mailbox3D
            position={[0, 0, 0]}
            isOpen={isOpen}
          />

          {/* Letters */}
          <group position={[0, 0.3, 0.35]} rotation={[0, -Math.PI * 0.1, 0]}>
            {letters.map((letter, index) => (
              <group
                key={letter.id}
                position={letter.position}
              >
                <Letter3D
                  color={letter.color}
                />
              </group>
            ))}
          </group>

          {/* Count display */}
          {showCount && (
            <group position={[-3.0, -1.5, 0.5]} rotation={[0, 0.5, 0]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.8, 1.4, 0.05]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              
              <Text
                position={[0, 0.4, 0.03]}
                fontSize={0.3}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                Count:
              </Text>
              <Text
                position={[0, 0.1, 0.03]}
                fontSize={0.22}
                color="#000000"
                anchorX="center"
                anchorY="middle"
              >
                1 Gray Letter
              </Text>
            </group>
          )}
        </group>
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default SetFrequencyMailbox;