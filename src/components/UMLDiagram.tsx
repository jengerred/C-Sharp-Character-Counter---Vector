import React, { useRef, useState } from 'react';
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MailboxProps {
  position: [number, number, number];
  isOpen: boolean;
  letter?: { position: [number, number, number]; isMoving: boolean; }
}

function Mailbox({ position, isOpen, letter }: MailboxProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const letterRef = useRef<THREE.Mesh>(null!);
  
  // Animation frame for mailbox lid and letter
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animate mailbox lid
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        isOpen ? Math.PI / 4 : 0,
        0.1
      );
    }

    if (letterRef.current && letter?.isMoving) {
      // Animate letter moving in/out
      letterRef.current.position.y = THREE.MathUtils.lerp(
        letterRef.current.position.y,
        isOpen ? position[1] + 1 : position[1],
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Mailbox body */}
      <mesh>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Mailbox lid */}
      <mesh ref={meshRef} position={[0, 0.5, 0.3]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Letter */}
      {letter && (
        <mesh ref={letterRef} position={letter.position}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="white" />
        </mesh>
      )}
    </group>
  );
}

function Box(props: ThreeElements['mesh'] & { text: string, position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[4, 2, 0.1]} />
      <meshStandardMaterial color="#ffffff" />
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {props.text}
      </Text>
    </mesh>
  );
}

function Line({ start, end }: { start: [number, number, number], end: [number, number, number] }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: 'black', linewidth: 2 })
    )} />
  );
}

export default function UMLDiagram() {
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [mailboxStates, setMailboxStates] = useState({
    getChar: { isOpen: false, hasLetter: true },
    setChar: { isOpen: false, hasLetter: false },
    getFreq: { isOpen: false, hasLetter: true },
    setFreq: { isOpen: false, hasLetter: false }
  });

  const handleMethodClick = (method: string) => {
    setActiveMethod(method);
    switch (method) {
      case 'getCharacter':
        setMailboxStates(prev => ({
          ...prev,
          getChar: { isOpen: true, hasLetter: true }
        }));
        break;
      case 'setCharacter':
        setMailboxStates(prev => ({
          ...prev,
          setChar: { isOpen: true, hasLetter: true }
        }));
        break;
      case 'setFrequency(int)':
        setMailboxStates(prev => ({
          ...prev,
          setFreq: { isOpen: true, hasLetter: false }
        }));
        break;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div style={{ width: '100%', height: '400px', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {/* UML Diagram */}
          <group position={[-4, 0, 0]}>
            {/* Class Name Box */}
            <Box position={[0, 2, 0]} text="CharacterFrequency" />

            {/* Fields Box */}
            <Box position={[0, 0, 0]} text={`- ch: char\n- frequency: int`} />

            {/* Methods Box with clickable text */}
            <group position={[0, -2, 0]}>
              <Box position={[0, 0, 0]} text="" />
              {[
                { method: 'getCharacter(): char', y: 0.5 },
                { method: 'setCharacter(char)', y: 0.3 },
                { method: 'getFrequency(): int', y: 0.1 },
                { method: 'setFrequency(int)', y: -0.1 },
                { method: 'increment(): void', y: -0.3 },
                { method: 'Equals(object): bool', y: -0.5 }
              ].map((item, i) => (
                <Text
                  key={i}
                  position={[0, item.y, 0.1]}
                  fontSize={0.15}
                  color={activeMethod === item.method ? '#3b82f6' : 'black'}
                  onClick={() => handleMethodClick(item.method)}
                  onPointerOver={(e) => {
                    const text = e.object as THREE.Mesh;
                    if (text.material instanceof THREE.MeshBasicMaterial) {
                      text.material.color.set('#3b82f6');
                    }
                  }}
                  onPointerOut={(e) => {
                    const text = e.object as THREE.Mesh;
                    if (text.material instanceof THREE.MeshBasicMaterial) {
                      text.material.color.set(activeMethod === item.method ? '#3b82f6' : 'black');
                    }
                  }}
                >
                  {item.method}
                </Text>
              ))}
            </group>

            {/* Connecting Lines */}
            <Line start={[0, 1, 0]} end={[0, 0.8, 0]} />
            <Line start={[0, -1, 0]} end={[0, -0.8, 0]} />
          </group>

          {/* Interactive Mailbox Scene */}
          <group position={[2, 0, 0]}>
            <Mailbox
              position={[0, 1, 0]}
              isOpen={mailboxStates.getChar.isOpen}
              letter={mailboxStates.getChar.hasLetter ? { position: [0, 0, 0], isMoving: true } : undefined}
            />
            <Mailbox
              position={[0, -1, 0]}
              isOpen={mailboxStates.setChar.isOpen}
              letter={mailboxStates.setChar.hasLetter ? { position: [0, 0, 0], isMoving: true } : undefined}
            />
          </group>

          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Description of current action */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm">
          {activeMethod ? (
            <span>
              <strong>Current Action:</strong> {getMethodDescription(activeMethod)}
            </span>
          ) : (
            'Click on any method in the UML diagram to see it in action!'
          )}
        </p>
      </div>
    </div>
  );
}

function getMethodDescription(method: string): string {
  switch (method) {
    case 'getCharacter(): char':
      return 'Like checking how many identical letters are in the mailbox. This method sets the frequency of a character.';
    case 'setCharacter(char)':
      return 'Putting a new character in the mailbox - like delivering a new letter.';
    case 'getFrequency(): int':
      return 'Checking how many times this character appears - like counting letters.';
    case 'setFrequency(int)':
      return 'Setting how many times this character appears - like updating the letter count.';
    case 'increment(): void':
      return 'Adding one more to the frequency count - like receiving another copy of the same letter.';
    case 'Equals(CharacterFrequency): bool':
      return 'Checking if two characters are the same - like comparing two letters.';
    default:
      return 'Select a method to see what it does!';
  }
}
