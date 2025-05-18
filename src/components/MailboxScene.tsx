import React, { useState } from 'react';
import GetCharacterMailbox from './GetCharacterMailbox';
import SetCharacterMailbox from './SetCharacterMailbox';
import GetFrequencyMailbox from './GetFrequencyMailbox';
import SetFrequencyMailbox from './SetFrequencyMailbox';

interface MailboxSceneProps {
  activeMethod: string | null;
}

// Method-specific animation components are imported at the top of the file

export default function MailboxScene({ activeMethod }: MailboxSceneProps) {
  console.log('Active method:', activeMethod);
  const getMethodDescription = () => {
    switch (activeMethod) {
      case 'getCharacter(): char':
        return {
          title: 'Getting a Character',
          description: 'Like checking your mailbox to see what letter is stored inside. The mailbox opens and you retrieve the character (represented by the letter).',
          action: 'Opening mailbox to retrieve letter...'
        };
      case 'setCharacter(char)':
        return {
          title: 'Setting a Character',
          description: 'Similar to placing a new letter in the mailbox. This method updates the character that this object represents, replacing any previous character with the new one provided.',
          action: 'Placing new letter in mailbox...'
        };
      case 'setFrequency(int)':
        return {
          title: 'Setting Frequency',
          description: 'Similar to adding another identical letter to the mailbox. This method increases the count of this character in the text by adding another letter to the mailbox.',
          action: 'Adding another letter to the mailbox...'
        };
      case 'getFrequency(): int':
        return {
          title: 'Getting the Frequency',
          description: 'Like checking how many identical letters are in the mailbox. This method returns the count of how many times this character appears in the text.',
          action: 'Counting letters...'
        };
      default:
        return {
          title: 'Interactive UML Visualization',
          description: 'Click any method in the UML diagram to see how it works with our mailbox analogy!',
          action: 'Waiting for method selection...'
        };
    }
  };

  // Determine which method animation to display
  const renderMethodAnimation = () => {
    console.log('Rendering method animation for:', activeMethod);
    
    switch (activeMethod) {
      case 'getCharacter(): char':
        console.log('Rendering GetCharacterMailbox');
        return <GetCharacterMailbox isActive={true} />;
      case 'setCharacter(char)':
        console.log('Rendering SetCharacterMailbox');
        return <SetCharacterMailbox isActive={true} />;
      case 'setFrequency(int)':
        console.log('Rendering SetFrequencyMailbox');
        return <SetFrequencyMailbox isActive={true} />;
      case 'getFrequency(): int':
        console.log('Rendering GetFrequencyMailbox');
        return <GetFrequencyMailbox isActive={true} />;
      default:
        console.log('Rendering default case');
        return <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Select a method to see its animation</p>
        </div>;
    }
  };

  const description = getMethodDescription();

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full h-[300px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        {renderMethodAnimation()}
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
