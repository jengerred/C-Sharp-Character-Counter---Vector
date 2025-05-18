import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface GetFrequencyMailboxProps {
  isActive: boolean;
}

interface LetterProps {
  position: [number, number, number];
  isMoving: boolean;
  color: string;
  offset?: [number, number, number]; // Optional offset for positioning
}

function Mailbox({ position, isOpen, letters, showCount }: {
  position: [number, number, number];
  isOpen: boolean;
  letters: LetterProps[];
  showCount: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const letterRefs = useRef<THREE.Group[]>([]);
  const flagRef = useRef<THREE.Mesh>(null!);
  const countRef = useRef<THREE.Group>(null!);
  
  // Initialize letterRefs if needed
  useEffect(() => {
    // Initialize the array with the correct number of refs
    letterRefs.current = Array(letters.length).fill(null).map((_, i) => 
      letterRefs.current[i] || new THREE.Group()
    );
  }, [letters.length]);
  
  // Animate letters movement and flag
  useFrame((state, delta) => {
    // Animate each letter
    letterRefs.current.forEach((letterRef, index) => {
      if (letterRef && letters[index]?.isMoving) {
        const letter = letters[index];
        // Calculate base position for this letter
        const startZ = 0.65; // Just behind the front panel (0.7)
        const endZ = 1.0;    // Barely outside the mailbox, just enough to be visible
        
        // Apply slight offset for each letter to create a stacked effect
        const letterOffset = letter.offset || [0, 0, 0];
        const targetZ = isOpen ? endZ + letterOffset[2] : startZ;
        
        // Limit how far back the letter can go
        const minZ = 0.65; // Never go further back than this
        
        const newZ = THREE.MathUtils.lerp(
          letterRef.position.z,
          targetZ,
          0.1
        );
        
        // Ensure letter doesn't go too far back
        letterRef.position.z = Math.max(newZ, minZ);

        // Apply the X and Y offsets
        letterRef.position.x = letterOffset[0];
        letterRef.position.y = letterOffset[1];

        // Add very slight wobble when moving (more subtle than getCharacter)
        if (isOpen) {
          // Slightly different wobble for each letter
          const wobbleSpeed = 1.5 + (index * 0.1);
          const wobbleAmount = 0.05 - (index * 0.01);
          letterRef.rotation.x = Math.sin(state.clock.elapsedTime * wobbleSpeed) * wobbleAmount;
        }
      }
    });

    if (flagRef.current) {
      // Animate flag based on mailbox state (more subtle angle than getCharacter)
      const targetRotation = isOpen ? -Math.PI / 6 : 0; // Less rotation (was -Math.PI/4)
      flagRef.current.rotation.z = THREE.MathUtils.lerp(
        flagRef.current.rotation.z,
        targetRotation,
        0.08 // Slightly slower transition
      );
    }
    
    // Animate the count display with a gentle floating motion
    if (countRef.current && showCount) {
      // Apply a gentle floating motion to the current position
      countRef.current.position.y = 0.7 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group position={position} ref={meshRef}>
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

      {/* Letters */}
      {letters.map((letter, index) => (
        <group
          key={`letter-${index}`}
          position={letter.position}
          rotation={[0, 0, 0]}
          ref={(el) => {
            if (el) letterRefs.current[index] = el;
          }}
        >
          <group rotation={[0, Math.PI / 2, 0]}>
            {/* Envelope base */}
            <mesh position={[0, 0, -0.2]}>
              <boxGeometry args={[0.8, 0.6, 0.02]} />
              <meshStandardMaterial color={letter.color} />
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
      ))}
      
      {/* Count display */}
      {showCount && (
        <group position={[-3.0, -1.5, 0.5]} rotation={[0, 0.5, 0]} ref={countRef}>
          {/* Background panel - pure white with emissive properties */}
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
            Gray Letter (1)
          </Text>
          <Text
            position={[0, -0.2, 0.03]}
            fontSize={0.22}
            color="#dc2626"
            anchorX="center"
            anchorY="middle"
          >
            Red Letter (2)
          </Text>
          <Text
            position={[0, -0.5, 0.03]}
            fontSize={0.22}
            color="#059669"
            anchorX="center"
            anchorY="middle"
          >
            Green Letter (1)
          </Text>
        </group>
      )}
    </group>
  );
}

const GetFrequencyMailbox: React.FC<GetFrequencyMailboxProps> = ({ isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCount, setShowCount] = useState(false);
  
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
      
      // Make letters go back in after count is displayed
      const timer3 = setTimeout(() => {
        // Close the mailbox to make letters go back in
        setIsOpen(false);
      }, 2000);
      
      return () => {
        // Clean up timers
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
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
      position: [0, 0.3, 0.65], // Standard position based on Letter3D
      isMoving: true,
      color: "#f7fafc", // White/gray color
      offset: [-0.3, 0.3, 0] // Left position with higher Y offset
    },
    // First red letter (left of center)
    {
      position: [0, 0.3, 0.65], // Standard position based on Letter3D
      isMoving: true,
      color: "#e53e3e", // Red color
      offset: [-0.1, 0.3, 0] // Left of center with higher Y offset
    },
    // Second red letter (right of center)
    {
      position: [0, 0.3, 0.65], // Standard position based on Letter3D
      isMoving: true,
      color: "#e53e3e", // Red color
      offset: [0.1, 0.3, 0] // Right of center with higher Y offset
    },
    // Green letter (rightmost)
    {
      position: [0, 0.3, 0.65], // Standard position based on Letter3D
      isMoving: true,
      color: "#38a169", // Green color
      offset: [0.3, 0.3, 0] // Right position with higher Y offset
    }
  ];

  return (
    <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 2, -2]} intensity={0.5} color="#ffffff" />
      
      <Mailbox
        position={[1, 0.2, -0.8]}
        isOpen={isOpen}
        showCount={showCount}
        letters={letters}
      />
      
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </Canvas>
  );
}

export default GetFrequencyMailbox;
