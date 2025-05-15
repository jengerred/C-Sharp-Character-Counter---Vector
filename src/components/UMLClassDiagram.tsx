import React from 'react';

interface UMLClassDiagramProps {
  onMethodClick: (method: string) => void;
  activeMethod: string | null;
}

export default function UMLClassDiagram({ onMethodClick, activeMethod }: UMLClassDiagramProps) {
  const methods = [
    'getCharacter(): char',
    'setCharacter(char)',
    'getFrequency(): int',
    'setFrequency(int)',
    'increment(): void',
    'Equals(CharacterFrequency): bool',
    'ToString(): string'
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden w-full max-w-md">
      {/* Class Name Section */}
      <div className="bg-blue-50 p-4 border-b border-gray-300">
        <h3 className="text-lg font-bold text-center">CharacterFrequency</h3>
      </div>

      {/* Fields Section */}
      <div className="p-4 border-b border-gray-300 bg-white">
        <h4 className="font-semibold mb-2 text-sm text-gray-600">Fields</h4>
        <ul className="space-y-1 text-sm">
          <li className="font-mono">- ch: char</li>
          <li className="font-mono">- frequency: int</li>
        </ul>
      </div>

      {/* Methods Section */}
      <div className="p-4 bg-white">
        <h4 className="font-semibold mb-2 text-sm text-gray-600">Methods</h4>
        <ul className="space-y-2">
          {methods.map((method) => (
            <li
              key={method}
              onClick={() => onMethodClick(method)}
              className={`font-mono cursor-pointer p-1 rounded transition-colors
                ${activeMethod === method 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100'
                }`}
            >
              + {method}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
