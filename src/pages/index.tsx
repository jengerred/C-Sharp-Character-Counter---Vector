import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Default light theme
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-bash';
import CodeBlock from '../components/CodeBlock';
import CopyButton from '../components/CopyButton';
import UMLClassDiagram from '../components/UMLClassDiagram';
import MailboxScene from '../components/MailboxScene';

interface CharacterFrequency {
  character: string;
  asciiCode: number;
  frequency: number;
}

export default function Home() {
  const [fileContent, setFileContent] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [characterFrequencies, setCharacterFrequencies] = useState<CharacterFrequency[]>([]);
  const [showCharacterFrequencies, setShowCharacterFrequencies] = useState(false);
  const [showInitialImplementationSteps, setShowInitialImplementationSteps] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);
  const [showAddInputFilesSteps, setShowAddInputFilesSteps] = useState(false);
  const [showRunProgramSteps, setShowRunProgramSteps] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  
  // Debug: Log when activeMethod changes
  useEffect(() => {
    console.log('Index page activeMethod changed to:', activeMethod);
  }, [activeMethod]);

  // Effect to highlight code blocks after component mounts/updates
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only in the browser
      console.log('PRISM: Attempting to highlight all code blocks (client-side).');
      Prism.highlightAll();
    }
  }, []); // Run once after initial render and client-side hydration


  useEffect(() => {
    const startTime = performance.now();
    const controller = new AbortController();
    const fetchStream = async () => {
      try {
        console.time('File Fetch and Process');
        const response = await fetch('/api/file-content', {
          signal: controller.signal
        });

        if (!response.ok) {
          // Try to get more error detail from the API response if possible
          let errorDetails = 'No additional details from API.';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || JSON.stringify(errorData);
          } catch (e) {
            // Could not parse error response as JSON, or no body
            errorDetails = response.statusText || 'Failed to fetch with no JSON error body.';
          }
          throw new Error(`API request failed with status ${response.status}: ${errorDetails}`);
        }

        // Parse the JSON response which should be { content: "..." }
        const data = await response.json();

        if (data && typeof data.content === 'string') {
          // Defer heavy processing to next event loop
          setTimeout(() => {
            processFile(data.content); // Pass the actual text string
          }, 0);
        } else {
          console.error('Fetched data is not in the expected format (expected { content: string }): ', data);
          // Handle error: set an error message, or set empty content
          setTimeout(() => {
            processFile(''); // Or some error indicator
          }, 0);
        }
        console.timeEnd('File Fetch and Process');

      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching or processing file:', error);
          // Handle fetch error: set an error message, or set empty content
           setTimeout(() => { // Ensure processFile is still called to update state
            processFile(''); // Or some error indicator
          }, 0);
        }
         console.timeEnd('File Fetch and Process'); // End timer on error too
      } finally {
        // controller.abort(); // Aborting here might be too aggressive if the component unmounts quickly
      }
    };

    fetchStream();
    return () => controller.abort();
  }, [])

  const processFile = (text: string) => {
    // Use Web Worker for character frequency calculation
    if (typeof window !== 'undefined' && window.Worker) {
      const worker = new Worker(new URL('../utils/charFreqWorker.ts', import.meta.url));
      
      worker.onmessage = (event) => {
        const { sanitizedFileContent, calculatedFrequencies } = event.data;
        setFileContent(sanitizedFileContent);
        setCharacterFrequencies(calculatedFrequencies);
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error('Web Worker error:', error);
        worker.terminate();
      };

      worker.postMessage(text);
    } else {
      // Fallback for browsers without Web Worker support
      console.warn('Web Workers not supported, falling back to main thread processing (full text, no sanitization for fallback)');
      // Fallback will process full text for frequencies but won't sanitize or set fileContent here
      const frequencies: { [key: string]: number } = {}

      for (let i = 0; i < text.length; i++) { // Process full text in fallback
        const char = text[i]
        frequencies[char] = (frequencies[char] || 0) + 1
      }

      const frequencyArray: CharacterFrequency[] = Object.entries(frequencies)
        .map(([character, frequency]) => ({
          character,
          asciiCode: character.charCodeAt(0),
          frequency
        }))
        .sort((a, b) => a.asciiCode - b.asciiCode)
        .slice(0, 500);

      setCharacterFrequencies(frequencyArray);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload event triggered');
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        processFile(text)
      }
      reader.readAsText(file);
      console.log('Reading file:', file.name);
    }
  }

  const learningObjectives = [
    'Understand array manipulation in C#',
    'Implement file I/O operations',
    'Create a character frequency tracking class',
    'Process input files byte by byte'
  ]

  const [showExampleOutput, setShowExampleOutput] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <style jsx global>{`
        pre.language-bash .token.comment {
          color: #6A9955 !important; /* VS Code-like green for comments */
        }
      `}</style>
      <Head>
        <title>Character Counter Using Vectors: A Complete Beginner's Guide</title>
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-6">Character Counter Using ArrayList: A Complete Beginner's Guide</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Introduction: The Character Counting Challenge</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="mb-4">In this tutorial, we'll build a program that reads an ASCII text file and counts the frequency of each character using an ArrayList data structure. Unlike our previous array-based solution, we'll use a more dynamic approach with ArrayList, which can grow and shrink as needed. We'll be working with the provided wap.txt file, but our solution will work with any ASCII text file.

This project follows specific requirements: each unique character must be represented by a CharacterFrequency class instance, and these instances must be stored in an ArrayList (or ArrayList in C#). Additionally, we must process the file character by character - reading the entire file into memory at once is not allowed.
</p>
            
            <h3 className="font-bold mt-4">What Are We Building?</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>Important Note:</strong> While this type of program would use Vector in C++ or Java, in C# we'll be using ArrayList. They serve the same purpose - a dynamic array that can grow or shrink as needed. Here's how they map across languages:</p>
              <ul className="list-disc list-inside mb-2 pl-4">
                <li>C++: <code className="bg-gray-100 px-1">std::vector</code></li>
                <li>Java: <code className="bg-gray-100 px-1">java.util.Vector</code></li>
                <li>C#: <code className="bg-gray-100 px-1">System.Collections.ArrayList</code></li>
              </ul>
            </div>
            
            <h4 className="font-bold mt-2">Our program will:</h4>
            <ol className="list-disc list-inside mb-4">
              <li>Read any input text file character by character using StreamReader</li>
              <li>Store each unique character and its frequency in an ArrayList using our CharacterFrequency class</li>
              <li>Handle special cases for control characters (ASCII values below 32)</li>
              <li>Support command-line arguments: program.exe inputFile outputFile</li>
              <li>Write results to both console and output file showing:</li>
              <ul className="list-none ml-8 mt-1">
                <li>- Character and its ASCII value</li>
                <li>- Number of times it appears in the file</li>
                <li>- Special formatting for control characters</li>
              </ul>
            </ol>
<p>For example, if our input file contains just Hello., our output should look like:</p>

            <div className="mb-4">
              <button 
                onClick={() => setShowExampleOutput(!showExampleOutput)}
                className="btn-green rounded transition"
              >
                {showExampleOutput ? 'Hide' : 'Show'} Output
              </button>
            </div>

            {showExampleOutput && (
              <div className="bg-[#1E1E1E] p-3 rounded-md">
                <pre className="whitespace-pre-wrap break-all" style={{
                  backgroundColor: 'black',
                  color: '#EDEDED',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontWeight: 'normal',
                  fontSize: '0.875em',
                  textShadow: 'none',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}>
                  {`(10) 1
(13) 1
.(46) 1
H(72) 1
e(101) 1
l(108) 2
o(111) 1`}
                </pre>
              </div>
            )}

            <h3 className="font-bold mt-2">Understanding the Core Concepts</h3>

            <div className="mb-6">
              <h4 className="font-bold mb-2">1. Required Namespaces 📚</h4>
              <p className="mb-2">First, we need to include the right tools. In C#, we do this with <code className="bg-gray-100 px-1">using</code> statements:</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <code className="text-sm">
                  using System;<br />
                  using System.Collections; // Required for ArrayList<br />
                  using System.IO;         // Required for File operations
                </code>
              </div>
              <p className="text-sm text-gray-600 mb-4">The <code className="bg-gray-100 px-1">System.Collections</code> namespace gives us access to ArrayList, our dynamic storage container.</p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">2. ArrayList Basics 📦</h4>
              <p className="mb-2">ArrayList is like a smart container that:</p>
              <ul className="list-disc list-inside pl-4 mb-4">
                <li>Grows automatically when you add items</li>
                <li>Can store any type of object</li>
                <li>Provides methods like Add() and IndexOf()</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm"><strong>🔍 How we use it:</strong> We create an ArrayList to store CharacterFrequency objects, one for each unique character we find.</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">3. Special ASCII Handling 🔍</h4>
              <p className="mb-2">In this implementation, we need to handle ASCII characters differently based on their values:</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 className="font-semibold mb-2">Control Characters (ASCII 0-31):</h5>
                <ul className="list-disc list-inside pl-4 mb-2 text-gray-600">
                  <li>Examples: newline (10), carriage return (13)</li>
                  <li>Display format: (ASCII_VALUE) [tab] frequency</li>
                  <li>Example output: (10) 1</li>
                </ul>
                <h5 className="font-semibold mb-2 mt-4">Printable Characters (ASCII 32-127):</h5>
                <ul className="list-disc list-inside pl-4 text-gray-600">
                  <li>Examples: letters, numbers, punctuation</li>
                  <li>Display format: CHARACTER(ASCII_VALUE) [tab] frequency</li>
                  <li>Example output: A(65) 1</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm"><strong>Implementation Note:</strong> This special handling is managed in the CharacterFrequency class's ToString() method, which formats the output differently based on the character's ASCII value.</p>
              </div>
            </div>
            <p className="mb-4"><b>Why This Matters:</b> When we read a character, we need to store both the character and how many times it appears. The ASCII value helps us identify each character uniquely.</p>
            <p className="mt-4 mb-2"><b>How ArrayList Works: Think of it as a Smart Post Office! 📬</b></p>
            <p className="mb-2">Unlike a fixed row of mailboxes (array), ArrayList is like a post office that creates new mailboxes only when needed. Here's how it works:</p>
            <ul className="list-disc list-inside pl-4 mb-2">
              <li>When a new character arrives, we check if it has a mailbox (using IndexOf)</li>
              <li>If found, we update its frequency count</li>
              <li>If not found, we create a new mailbox (using Add)</li>
            </ul>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>🔍 Performance Note:</strong></p>
              <ul className="list-disc list-inside pl-4">
                <li>Finding a character: O(n) - we need to check existing entries</li>
                <li>Adding a new character: O(1) - just add to the end</li>
                <li>Memory usage: Only stores characters that actually appear!</li>
              </ul>
            </div>

            <h3 className="font-bold mt-4">Breaking Down the Problem</h3>
            <p className="mb-2">Let's break this assignment into smaller steps:</p>
            <ol className="list-decimal list-inside pl-4 mb-4">
              <li>Create a new C# Console Application in Visual Studio</li>
              <li>Add the required using statements (System.Collections for ArrayList)</li>
              <li>Create the CharacterFrequency class with proper comparison methods</li>
              <li>Initialize an ArrayList to store our character data</li>
              <li>Set up command-line argument handling</li>
              <li>Read the input file character by character with StreamReader</li>
              <li>Process each character:
                <ul className="list-none ml-8 mt-1 text-gray-600">
                  <li>- Search ArrayList for existing character</li>
                  <li>- Update frequency if found</li>
                  <li>- Add new entry if not found</li>
                </ul>
              </li>
              <li>Write results to both console and output file</li>
            </ol>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Implementation Guide</h2>
          <h3 className="text-xl font-semibold mb-4">Step 1: Initial Setup</h3>
          <p>Create a new C# Console Application project named "YourName_CharacterCounter"</p>
          <button
            onClick={() => setShowInitialImplementationSteps(!showInitialImplementationSteps)}
            className="btn-green text-sm my-3 inline-block transition rounded-md"
          >
            {showInitialImplementationSteps ? 'Hide Step 1 Details' : 'Show me how'}
          </button>
          <div className="space-y-6">
  {showInitialImplementationSteps && (
    <>
     
            <div>
              <h3 className="text-xl font-semibold mb-4">Step 1: Open <a href="https://visualstudio.microsoft.com/" target="_blank" className="text-blue-600 hover:text-blue-800 transition-colors duration-300">Visual Studio</a></h3>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-full md:w-1/2">
                    <p>Click "Create a new project"</p>
                    <div className="w-full p-2 bg-gray-100">
                  <img
                    src={'/images/visual-studio-platform.png'}
                    alt="Visual Studio Platform"
                    style={{
                      display: 'block',
                      width: '100%',
                      maxWidth: '800px',
                      height: 'auto',
                      maxHeight: '600px'
                    }}
                    className="mx-auto object-contain rounded-lg shadow-lg border border-gray-200"
                  />
                  
                </div>
                   
                </div>
              
              </div>
              </div>
              <div>
              <h3 className="text-xl font-semibold mb-4">Step 2: Create Console Application Project</h3>
              <p>Select "C# Console Application"</p>
                  
                  <div className="w-full md:w-1/2 p-2 bg-gray-100">
                <img
                  src={'/images/vs-console-app.png'}
                  alt="Visual Studio Console App Selection"
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                    maxHeight: '600px'
                  }}
                  className="mx-auto object-contain rounded-lg shadow-lg border border-gray-200"
                />
              </div>
              
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Step 3: Name the Project "YourName_CharacterCounter"</h3>
              <ol className="list-decimal list-inside bg-gray-100 p-4 rounded-lg mb-4">
                <li>Enter "YourName_CharacterCounter" as project name</li>
                <li>Choose project location</li>
                <li>Confirm solution name</li>
              </ol>
            </div>
           

    </> 
  )}
</div>

          {/* Step 2: Add Input Files to Your Project */}
          <h3 className="page-section-heading">Step 2: Add Input Files to Your Project</h3>
          {/* Flex layout for download links using gap for spacing */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 my-4">
            <span><b><i>Download: </i></b></span>
            <span>Small text file:
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/hello.txt';
                  link.setAttribute('download', 'hello.txt');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="btn-download"
              >
                hello.txt
              </button>
            </span>
            <span>Large text file:
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/wap.txt';
                  link.setAttribute('download', 'wap.txt');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="btn-download"
              >
                wap.txt
              </button>
            </span>
          </div>

          <button
            onClick={() => setShowAddInputFilesSteps(!showAddInputFilesSteps)}
            className="btn-green text-sm mb-3 inline-block transition rounded-md"
          >
            {showAddInputFilesSteps ? 'Hide Details' : 'Show me How'}
          </button>
          <div className="space-y-2 mt-2">
            {showAddInputFilesSteps && (
              <>
                <p className="font-semibold">Add InputFiles Folder:</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Right-click your project in Solution Explorer → Add → New Folder → Name it <code>InputFiles</code>.</li>
                  <li>Right-click the <code>InputFiles</code> folder → Add → Existing Item → Select your <code>Hello.txt</code> and <code>wap.txt</code> files.</li>
                </ul>
                <p className="font-semibold mt-3">Set File Properties:</p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>For each input file (<code>Hello.txt</code>, <code>wap.txt</code>):</li>
                  <li>Right-click the file → Properties.</li>
                  <li>Set "Copy to Output Directory" to "Copy always" (so the program can find the files when running).</li>
                </ul>
              </>
            )}
          </div>
          {/* Key Note section moved here */}
          <p className="mt-4"><b>Key Notes About Test Files</b></p>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold mb-2">1. Test Input Files</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <p className="mb-2"><b><span className="btn-download" style={{ marginRight: '0.25rem' }}>hello.txt</span></b> - Simple test case:</p>
                  <ul className="list-disc list-inside pl-4">
                    <li>Content appears as "Hello."</li>
                    <li>Actually contains invisible characters:</li>
                    <ul className="list-none ml-8">
                      <li>- <code>{String.raw`\r`}</code> (Carriage Return - ASCII 13)</li>
                      <li>- <code>{String.raw`\n`}</code> (Newline - ASCII 10)</li>
                    </ul>
                  </ul>
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowExampleOutput(!showExampleOutput)}
                      className="btn-green rounded transition"
                    >
                      {showExampleOutput ? 'Hide' : 'Show'} Output
                    </button>
                    {showExampleOutput && (
                      <div className="bg-[#1E1E1E] p-3 rounded-md mt-2">
                        <pre className="whitespace-pre-wrap break-all" style={{
                          backgroundColor: 'black',
                          color: '#EDEDED',
                          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                          fontWeight: 'normal',
                          fontSize: '0.875em',
                          textShadow: 'none',
                          padding: '1rem',
                          borderRadius: '0.5rem'
                        }}>
                          {`(10) 1
(13) 1
.(46) 1
H(72) 1
e(101) 1
l(108) 2
o(111) 1`}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2"><b><span className="btn-download" style={{ marginRight: '0.25rem' }}>wap.txt</span></b> - Complex test case:</p>
                  <ul className="list-disc list-inside pl-4 mb-4">
                    <li>Contains the full text of War and Peace (~500,000 words)</li>
                    <li>Excellent test for ArrayList's dynamic sizing</li>
                    <li>Rich variety of printable and control characters</li>
                    <li>Perfect for testing performance with large datasets</li>
                  </ul>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2"><strong>Preview of wap.txt contents:</strong></p>
                      <div style={{ 
                        position: 'relative',
                        height: '200px',
                        overflow: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-all', 
                          fontFamily: 'monospace', 
                          backgroundColor: 'white',
                          userSelect: 'text',
                          padding: '1rem',
                          fontSize: '0.875em'
                        }}>{fileContent.slice(0, 10000).replace(/\[NEWLINE\]/g, '\n')}</pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-end mb-2">
                        <button 
                          onClick={() => setShowCharacterFrequencies(!showCharacterFrequencies)}
                          className="btn-green rounded transition"
                        >
                          {showCharacterFrequencies ? 'Hide' : 'View'} Expected Output
                        </button>
                      </div>
                      {showCharacterFrequencies && characterFrequencies.length > 0 && (
                        <div className="bg-[#1E1E1E] p-3 rounded-md">
                          <pre className="whitespace-pre-wrap break-all" style={{
                            backgroundColor: 'black',
                            color: '#EDEDED',
                            fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                            fontWeight: 'normal',
                            fontSize: '0.875em',
                            textShadow: 'none',
                            padding: '1rem',
                            borderRadius: '0.5rem'
                          }}>{characterFrequencies.map(freq => 
                            `${freq.character === '\n' ? '\\n' : freq.character === '\r' ? '\\r' : freq.character === ' ' ? 'Space' : freq.character}(${freq.asciiCode}) ${freq.frequency}`
                          ).join('\n')}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold mb-2">2. ArrayList Implementation</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2">
                  <li>Dynamic sizing - grows as needed with Add() method</li>
                  <li>Uses IndexOf() to search for existing characters</li>
                  <li>Stores only characters that actually appear</li>
                  <li>Maintains insertion order of characters</li>
                </ul>
              </div>
            </div>
          </div>
</section>

<h3 className="page-section-heading">The CharacterFrequency Class</h3>
<p>The CharacterFrequency class is the core of our program, following the UML (Unified Modeling Language) diagram specifications. UML is a standardized modeling language that helps visualize the structure of our class, showing its fields, methods, and relationships. Below is an interactive 3D representation of our class diagram - you can rotate, zoom, and pan to explore it! 📊</p>

<div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Left side: Traditional UML Diagram */}
  <div>
    <UMLClassDiagram 
      onMethodClick={(method) => setActiveMethod(method)}
      activeMethod={activeMethod}
    />
  </div>

  {/* Right side: Interactive Mailbox Scene */}
  <div>
    <MailboxScene activeMethod={activeMethod} />
  </div>
</div>

<div className="text-sm text-gray-600 mb-4">
  <p>The UML diagram above shows the complete structure of our CharacterFrequency class:</p>
  <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
    <li>The top section shows the class name</li>
    <li>The middle section lists the private fields (marked with -)</li>
    <li>The bottom section shows all public methods (marked with +)</li>
  </ul>
</div>
<div className="mt-4">
<p className="mb-0"><b>Class Features</b></p>
<ul className="list-disc list-inside pl-4 mb-8 space-y-1">
<li><b>Fields:</b> Private fields _ch (character) and _frequency (count)</li>
<li><b>Methods:</b> Getters/Setters (GetCharacter/SetCharacter), Increment, Equals override, ToString override</li>
<li><b>Purpose:</b> Each instance represents one unique character and its count in the input file</li>
<li><b>Storage:</b> Instances are stored in an ArrayList, allowing flexible storage of only characters that appear in the file</li>
</ul>
</div>
<h3 className="page-section-heading">CharacterFrequency Class Code Walkthrough</h3>
         <CodeBlock
              title="CharacterFrequency.cs"
              language="csharp"
              codeString={`public class CharacterFrequency
{
    // 📩 The letter in the mailbox (e.g., 'A')
    private char _ch;           // The character being counted
    
    // 📩 📫 Number of letters in this mailbox
    private int _frequency;     // How many times it appears

    // 📬 Constructor - creates a new Mailbox for the given letter
    public CharacterFrequency(char character)
    {
        // 📩 Store the letter in the mailbox
        _ch = character;
        // 📫 Start with 0 letters
        _frequency = 0; 
    }

    // 📩 Get/Set the letter in this mailbox
    public char GetCharacter() => _ch;
    public void SetCharacter(char character) => _ch = character;

    // 📫 Get/Set how many letters are in this mailbox
    public int GetFrequency() => _frequency;
    public void SetFrequency(int frequency) => _frequency = frequency;

    // 📩 Add another letter to this mailbox
    public void Increment() => _frequency++;

    // 📬 Check if two mailboxes contain the same letter
    public override bool Equals(object? obj)
    {
        if (obj == null || GetType() != obj.GetType()) return false;
        CharacterFrequency other = (CharacterFrequency)obj;
        return _ch == other._ch;
    }

    // 📬 Format the mailbox contents for delivery report
    public override string ToString()
    {
        int asciiValue = (int)_ch;
        string charDisplay = (asciiValue < 32 || asciiValue == 127) ? "" : _ch.ToString();
        return (charDisplay == "")
            ? $"        ({asciiValue})\t{_frequency}"      // 📬 Staff mailbox: show only number
            : $"        {charDisplay}({asciiValue})\t{_frequency}"; // 📩 Public mailbox: show letter and number
    }
    public override string ToString()
    {
        return $"{ch}({(int)ch}) {frequency}";
    }
}`}
            />

<div className="mt-6 mb-6">
  <h4 className="font-bold mb-2">🔍 Breaking Down the CharacterFrequency Class</h4>
  <p className="mb-4">Let's dive into each part of our CharacterFrequency class and understand why we need each component:</p>

  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h5 className="font-semibold mb-2">1. The Fields (Private Members)</h5>
    <CodeBlock
      language="csharp"
      codeString={`private char _ch;           // 📩 The letter in the mailbox
      private int _frequency;     // 📫 Number of letters in this mailbox`}
    />
    <p className="mt-2">These are like the parts of a real mailbox:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li><code>_ch</code> - This is the letter that goes in the mailbox (like 'A' or 'B')</li>
      <li><code>_frequency</code> - This counts how many letters of that type we have</li>
    </ul>
    <p className="text-sm">The <code>private</code> keyword means only our class can change these values - just like how only the post office can change what's in a real mailbox.</p>
  </div>

  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h5 className="font-semibold mb-2">2. The Constructor</h5>
    <CodeBlock
      language="csharp"
      codeString={`public CharacterFrequency(char character)
      {
          _ch = character;
          _frequency = 0; 
      }`}
    />
    <p className="mt-2">Think of this like setting up a new mailbox:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li>It takes a character (like 'A') and creates a new mailbox for it</li>
      <li>We start with 0 letters in the mailbox</li>
    </ul>
  </div>

  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h5 className="font-semibold mb-2">3. The Getters and Setters</h5>
    <CodeBlock
      language="csharp"
      codeString={`public char GetCharacter() => _ch;
      public void SetCharacter(char character) => _ch = character;
      public int GetFrequency() => _frequency;
      public void SetFrequency(int frequency) => _frequency = frequency;`}
    />
    <p className="mt-2">These are like the post office rules:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li><code>GetCharacter()</code> - Shows what letter is in the mailbox</li>
      <li><code>SetCharacter()</code> - Changes what letter is in the mailbox</li>
      <li><code>GetFrequency()</code> - Shows how many letters are in the mailbox</li>
      <li><code>SetFrequency()</code> - Changes how many letters are in the mailbox</li>
    </ul>
  </div>

  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h5 className="font-semibold mb-2">4. The Increment Method</h5>
    <CodeBlock
      language="csharp"
      codeString={`public void Increment() => _frequency++;`}
    />
    <p className="mt-2">This is like adding one more letter to the mailbox:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li>Every time we find the same letter in our file, we call this method</li>
      <li>It increases the letter count by 1</li>
    </ul>
  </div>

  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h5 className="font-semibold mb-2">5. The Equals Method</h5>
    <CodeBlock
      language="csharp"
      codeString={`public override bool Equals(object? obj)
      {
          if (obj == null || GetType() != obj.GetType()) return false;
          CharacterFrequency other = (CharacterFrequency)obj;
          return _ch == other._ch;
      }`}
    />
    <p className="mt-2">This is like checking if two mailboxes belong to the same letter:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li>When we get a new letter, we need to check if we already have a mailbox for it</li>
      <li>We compare the letter in our mailbox with the letter in another mailbox</li>
      <li>If they're the same letter, we return <code>true</code> (they're the same mailbox)</li>
      <li>If they're different letters, we return <code>false</code> (they're different mailboxes)</li>
    </ul>
  </div>

  <div className="bg-blue-50 p-4 rounded-lg">
    <h5 className="font-semibold mb-2">6. The ToString Method</h5>
    <CodeBlock
      language="csharp"
      codeString={`public override string ToString()
      {
          int asciiValue = (int)_ch;
          string charDisplay = (asciiValue < 32 || asciiValue == 127) ? "" : _ch.ToString();
          return (charDisplay == "")
              ? $"        ({asciiValue})\t{_frequency}"      // 📬 Staff mailbox: show only number
              : $"        {charDisplay}({asciiValue})\t{_frequency}"; // 📩 Public mailbox: show letter and number
      }`}
    />
    <p className="mt-2">This is like writing a report about what's in the mailbox:</p>
    <ul className="list-disc list-inside pl-4 mb-2">
      <li>It shows both the letter and how many times it appears</li>
      <li>For special letters (like newlines or tabs), it shows just the number</li>
      <li>For normal letters, it shows both the letter and the number</li>
    </ul>
  </div>
</div>

<h3 className="page-section-heading">Command Line Usage</h3>
<p>Our program is designed to be run from the command line with two parameters:</p>
<pre className="bg-gray-800 text-white p-4 rounded-lg font-mono mb-4">programname.exe [input filename] [output filename]</pre>

<p>For example:</p>
<pre className="bg-gray-800 text-white p-4 rounded-lg font-mono mb-4">counter.exe wap.txt Count.txt</pre>

<p>Here's how the command line arguments are handled:</p>

<CodeBlock
  title="Program.cs"
  language="csharp"
  codeString={`static void Main(string[] args)
{
    const byte INPUT_FILENAME = 0;
    const byte OUTPUT_FILENAME = 1;
    
    if( args.Length != 2 )
    {
        Console.WriteLine("Usage: CommaneLine [input filename] [output file name]");
        Environment.Exit(0);
    }

    Console.WriteLine("The input filename is: {0}", args[INPUT_FILENAME]);
    Console.WriteLine("The output filename is: {0}", args[OUTPUT_FILENAME]);
}`} />

<h4 className="font-semibold mt-3 mb-1">Real-Life Example</h4>
<p>Imagine a post office with mailboxes:</p>
<ul className="list-disc list-inside pl-4 mb-4 space-y-1">
    <li><b>Character</b> = Mailbox label (e.g., "Mailbox 72: H")</li>
    <li><b>Frequency</b> = Number of letters in the mailbox</li>
    <li><b>Increment()</b> = Delivering another letter to that box</li>
</ul>
<h4 className="font-semibold mt-3 mb-1">Why This Works</h4>
<ol className="list-decimal list-inside pl-4 space-y-1 mb-4">
    <li className="mb-2">
        <b>Character {'{ get; }'}</b>
        <ul className="list-disc list-inside pl-5 mt-1">
            <li>Mailbox addresses never change (no relabeling!).</li>
        </ul>
    </li>
    <li className="mb-2">
        <b>Frequency {'{ get; private set; }'}</b>
        <ul className="list-disc list-inside pl-5 mt-1">
            <li>Only postal workers (this class) can add letters.</li>
        </ul>
    </li>
    <li>
        <b>Increment() Method</b>
        <ul className="list-disc list-inside pl-5 mt-1">
            <li>Simple rule: New letter → Deliver to correct mailbox.</li>
        </ul>
    </li>
</ol>
<h3 className="page-section-heading">Step 4: Setting Up Our Mailbox System (Array)</h3>
<p>Imagine a street with 256 mailboxes (0-255), one for every possible ASCII character. Each mailbox will hold letters (character counts) for its assigned character:</p>
<CodeBlock
  language="csharp"
  codeString={`// Create 256 empty mailboxes
CharacterFrequency[] mailboxes = new CharacterFrequency[256]; 
// 📫[0] [1] [2] ... [255] (all empty at first)`}
/>
<h3 className="page-section-heading mt-6">Step 5: Sorting Letters (Reading the File)</h3>
<p>We’ll process every "letter" (character) in the file and deliver it to the correct mailbox:</p>
<CodeBlock
    language="csharp"
    codeString={`// Open the mailbag (file)
         using (FileStream mailbag = File.OpenRead(inputFile))
         {
             int rawData;
             // Process each letter one by one (until the bag is empty)
             while ((rawData = mailbag.ReadByte()) != -1)
             {
                 char character = (char)rawData;       // 1. Read letter's address (convert byte to character)
                 int mailboxNumber = (int)character;   // 2, Find mailbox number (ASCII value)

             // 3. Deliver to mailbox (next step!)
    }
} // Mailbag closes automatically here`}
/>
<h4 className="font-semibold mt-4 mb-2">Key Analogies</h4>
<div className="overflow-x-auto">
    <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }} className="min-w-full">
        <thead className="bg-gray-50">
            <tr>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code Concept</th>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Real-World Mail Example</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm font-mono text-gray-700">FileStream</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm text-gray-700">Bag of unsorted letters</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm font-mono text-gray-700">ReadByte()</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm text-gray-700">Pulling out one letter</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm font-mono text-gray-700">rawData</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm text-gray-700">Encoded address on the letter</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm font-mono text-gray-700">(char)rawData</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm text-gray-700">Reading the recipient’s name</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm font-mono text-gray-700">(int)character</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="whitespace-nowrap text-sm text-gray-700">Mailbox number (0-255)</td>
            </tr>
        </tbody>
    </table>
</div>
<h3 className="page-section-heading mt-6">Step 6: Delivering Letters (Updating Mailboxes)</h3>
<p>For every character we read, we’ll deliver its "letter" to the correct mailbox using its ASCII address:</p>
<CodeBlock
    language="csharp"
    codeString={`// 3. Deliver to mailbox
        if (mailboxes[mailboxNumber] == null)
            mailboxes[mailboxNumber] = new CharacterFrequency(character); // New mailbox
        else
            mailboxes[mailboxNumber].Increment(); // Add to an existing mailbox
    }
}       // Close mailbox automatically here`}
/>
<div className="overflow-x-auto mt-4 mb-4">
    <h4 className="font-semibold mb-2 text-gray-700">Real-Mail Example</h4>
    <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }} className="min-w-full">
        <thead className="bg-gray-50">
            <tr>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code Action</th>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Postal System Equivalent</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900"><code>mailboxes == null</code></td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Check if Mailbox 66 exists</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900"><code>new CharacterFrequency('B')</code></td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Install new Mailbox 66 with 1 letter</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900"><code>Increment()</code></td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Add another letter to Mailbox 66</td>
            </tr>
        </tbody>
    </table>
</div>
<h4 className="font-semibold mt-4 mb-2 text-gray-700">Why This Mailbox System Works</h4>
<p className="mb-1">📬 <b>Direct Delivery System</b></p>
<ul className="list-disc list-inside ml-4 mb-2">
    <li>A (ASCII 65) → Mailbox 65</li>
    <li>. (ASCII 46) → Mailbox 46</li>
    <li>1 (ASCII 49) → Mailbox 49</li>
</ul>
<p className="ml-4">No need for addresses – ASCII values are pre-assigned mailbox numbers!</p>
<div className="overflow-x-auto mt-4 mb-4">
    <h4 className="font-semibold mb-2 text-gray-700">⚡ Lightning-Fast Efficiency</h4>
    <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }} className="min-w-full">
        <thead className="bg-gray-50">
            <tr>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Traditional Approach</th>
                <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Our Mailbox System</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Check every mailbox</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Go straight to the right mailbox</td>
            </tr>
            <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Slow for large neighborhoods</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }} className="text-sm text-gray-900">Instant delivery, every time!</td>
            </tr>
        </tbody>
    </table>
</div>
<div className="mt-6 mb-4 p-4 text-gray-800">
  <p className="text-lg font-semibold mb-2"><span>🏗️</span> Built for Any Size</p>
  <ul className="list-disc list-inside ml-4 mb-3 space-y-1">
    <li>10 letters: Easy-peasy!</li>
    <li>10,000 letters: Just as fast!</li>
    <li>3.5 million letters (War and Peace): Still no slowdown!</li>
  </ul>

  <p className="text-lg font-semibold mt-4 mb-2"><span>🧠</span> Brainy Bonus</p>
  <p>This approach uses <b>O(1) time complexity</b> – computer science jargon meaning "instant access," like knowing your friend’s exact locker number!</p>
</div>

        <section> {/* New section for Step 7 */}
          <h3 className="page-section-heading">Step 7: Generating the Postal Report</h3>
          <p>Let’s create a report showing how many letters arrived in each mailbox, ordered by mailbox number (ASCII order):</p>
          <CodeBlock
            title="GeneratingTheReport.cs"
            language="csharp"
            codeString={` // Create delivery report
 using (StreamWriter postmaster = new StreamWriter(outputFile))
 {
     // Walk down mailbox street (0-255)
     for (int mailboxNumber = 0; mailboxNumber < 256; mailboxNumber++)
     {
         if (mailboxes[mailboxNumber] != null)
         {
             var currentMailbox = mailboxes[mailboxNumber];
             
             // Staff mailboxes don't get public labels
             bool isControlCharacter = mailboxNumber < 32 || mailboxNumber == 127;
             string mailboxLabel = isControlCharacter 
                 ? "" 
                 : currentMailbox.Character.ToString();

             // Format: PublicLabel(Mailbox#)  Count | (Mailbox#)  Count
             string reportLine = (mailboxLabel == "")
                 ? $"({mailboxNumber})\t{currentMailbox.Frequency}"  // Staff mailbox
                 : $"{mailboxLabel}({mailboxNumber})\t{currentMailbox.Frequency}"; // Public

             postmaster.WriteLine(reportLine); // File report
             Console.WriteLine(reportLine);    // Display copy
         }
     }
 }`}
          />
          <h4 className="text-lg font-semibold mt-4 mb-2">Mailroom Rules</h4>
          <ol className="list-decimal list-inside space-y-4">
            <li>
              <span className="font-medium">Order Matters</span>
              <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-gray-700">
                <li>We check mailboxes 0 → 255 – like walking down a street of numbered houses.</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Special Mailboxes</span>
              <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-gray-700">
                <li>Mailboxes 0-31 and 127 are "staff only" (control characters) → No public label.</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">Report Format</span>
              <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-gray-700">
                <li>Normal Mailbox: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">H(72)  3</code></li>
                <li>Staff Mailbox: <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">(13)   1</code></li>
              </ul>
            </li>
          </ol>
          
            <h4 className="font-semibold mt-4 mb-2 text-gray-700">Real-World Analogy</h4>
            <div className="overflow-x-auto mt-4 mb-4"> 
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }} className="min-w-full">
                <thead className="bg-gray-50"> 
                  <tr>
                    <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code Concept</th>
                    <th scope="col" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left', backgroundColor: '#e9ecef' }} className="text-xs font-medium text-gray-500 uppercase tracking-wider">Postal System Equivalent</th>
                  </tr>
                </thead>
                <tbody>
                  
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}><code>for (mailboxNumber...)</code></td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>Walking down the street of mailboxes</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}><code>mailboxLabel</code></td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>House name/number on the mailbox</td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}><code>reportLine</code></td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>Printed delivery report sheet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
<section className="mt-8">
  <h2 className="page-section-heading">Putting It All Together: The Complete Postal System</h2>
  <p className="mb-4">Here’s the full program that reads letters (characters), delivers them to mailboxes (ASCII slots), and generates a delivery report (output file):</p>
<CodeBlock
  language="csharp"
  codeString={`using System;
using System.Collections; // Required for ArrayList
using System.IO;         // Required for File operations

namespace YourName_CharacterCounter_Vector
{
    // Represents a character and its frequency count
    public class CharacterFrequency
    {
        private char _ch;       // The character being counted
        private int _frequency; // Number of times the character appears

        // Constructor - creates a new CharacterFrequency object for the given character
        // The frequency starts at 0 and is incremented when the character is found
        public CharacterFrequency(char character)
        {
            _ch = character;
            _frequency = 0; 
        }

        // Gets the character
        public char GetCharacter() => _ch;

        // Sets the character
        public void SetCharacter(char character) => _ch = character;

        // Gets how many times the character appears
        public int GetFrequency() => _frequency;

        // Sets the frequency count for the character
        public void SetFrequency(int frequency) => _frequency = frequency;

        // Adds one to the frequency count
        public void Increment() => _frequency++;

        // Checks if two CharacterFrequency objects represent the same character
        // Returns true if they have the same character, false otherwise
        public override bool Equals(object? obj)
        {
            if (obj == null || GetType() != obj.GetType()) return false;
            CharacterFrequency other = (CharacterFrequency)obj;
            return _ch == other._ch;
        }

        // Returns a string in the format: Character(ASCIIValue)[tab]Frequency
        // For control characters, only shows: (ASCIIValue)[tab]Frequency
        public override string ToString()
        {
            int asciiValue = (int)_ch;
            string charDisplay = (asciiValue < 32 || asciiValue == 127) ? "" : _ch.ToString();
            return (charDisplay == "")
                ? $"        ({asciiValue})\t{_frequency}"      // Control character: no char shown
                : $"        {charDisplay}({asciiValue})\t{_frequency}"; // Printable character
        }
    }

    // Main program class for counting character frequencies in a text file
    class Program
    {
        // Main entry point - reads input file, counts characters, writes to output file
        // Command line arguments: inputFile outputFile
        static void Main(string[] args)
        {
            // Debug: Show current directory
            Console.WriteLine($"Current Directory: {Environment.CurrentDirectory}");
            Console.WriteLine($"Input file path: {args[0]}\n");
            Console.WriteLine("\nVector - Character(ascii)  Frequency\n");

            // Validate command-line arguments
            if (args.Length < 2)
            {
                Console.WriteLine("Usage: YourName_CharacterCounter_Vector.exe <inputFile> <outputFile>");
                Console.WriteLine("Example: YourName_CharacterCounter_Vector.exe wap.txt wap_output.txt");
                return; // Exit if incorrect arguments are provided
            }

            string inputFile = args[0];
            string outputFile = args[1];


            // ArrayList to store CharacterFrequency objects, as required by the assignment for C#.
            // ArrayList in C# is equivalent to vector in C++ or Vector in Java - all are dynamic array implementations.
            // This approach uses a dynamic list (ArrayList) to store only the characters
            // that actually appear in the input file. This differs from a strategy
            // that might use a fixed-size array (e.g., size 256) to map directly to ASCII values.
            // Using ArrayList allows for flexible storage and relies on the Equals() method
            // of CharacterFrequency for finding existing characters.

            ArrayList charFrequencies = new ArrayList();

            try
            {
                // Step 1: Check if the input file exists
                if (!File.Exists(inputFile))
                {
                    Console.WriteLine($"Error: Input file '{inputFile}' not found.");
                    return; // Exit if input file does not exist
                }

                // Step 2: Read the input file character by character
                // Using statement ensures the StreamReader is properly disposed of
                using (StreamReader reader = new StreamReader(inputFile))
                {
                    int charCode; // To store the integer representation of the character
                    // Read characters until the end of the file is reached (reader.Read() returns -1)
                    while ((charCode = reader.Read()) != -1) 
                    {
                        char character = (char)charCode; // Convert the integer back to a char
                        
                        // Create a temporary CharacterFrequency object for searching in the ArrayList
                        CharacterFrequency tempCf = new CharacterFrequency(character);
                        
                        // Check if this character is already in our ArrayList.
                        // This search is necessary because ArrayList does not allow direct indexing by character/ASCII value
                        // in the same way a pre-sized array mapped to ASCII values would.
                        // Instead, IndexOf() iterates and uses the Equals() method of CharacterFrequency.

                        int index = charFrequencies.IndexOf(tempCf);

                        if (index != -1)
                        {
                            // Character exists: retrieve it and increment its frequency
                            CharacterFrequency existingCf = (CharacterFrequency)charFrequencies[index]!; // Non-null assertion
                            existingCf.Increment();
                        }
                        else
                        {
                            // If the character is new, it's added to the ArrayList.
                            // Unlike a fixed array indexed by ASCII, where all possible characters have a slot,
                            // here we only store objects for characters encountered.
                            tempCf.Increment(); 
                            charFrequencies.Add(tempCf);
                        }
                    }
                } // StreamReader is automatically closed here

                // Step 3: Write the character frequencies to the output file
                // Using statement ensures the StreamWriter is properly disposed of
                using (StreamWriter writer = new StreamWriter(outputFile))
                {
                    writer.WriteLine("Vector - Character(ascii)  Frequency\n");

                    // Iterate through the ArrayList and write each CharacterFrequency object
                    // The ToString() method of CharacterFrequency handles the required output format
                    foreach (CharacterFrequency cf in charFrequencies)
                    {
                        string line = cf.ToString();
                        writer.WriteLine(line);    // Write to file
                        Console.WriteLine(line);   // Display on console
                    }
                } // StreamWriter is automatically closed here

                // Confirmation messages: Print results to console for quick viewing
                Console.WriteLine("\n  * Note: Printed Count.txt file output to Console for Quick Viewing");
                Console.WriteLine("  * Args: " + string.Join(", ", args));
            }
            catch (IOException ioEx)
            {
                // Handle file I/O specific errors
                Console.WriteLine($"A file I/O error occurred: {ioEx.Message}");
            }
            catch (UnauthorizedAccessException uaEx)
            {
                // Handle errors related to file permissions
                Console.WriteLine($"File access denied: {uaEx.Message}");
            }
            catch (Exception ex)
            {
                // Handle any other unexpected errors
                Console.WriteLine($"An unexpected error occurred: {ex.Message}");
            }

            // Keep console window open until user presses Enter
            Console.ReadLine();
        }
    }
}

`}
/>
</section>
        
<section className="mt-8">
  <h2 className="page-section-heading">How It Works: Let’s Review What We Learned</h2>
  <p className="mb-4">Let’s recap the key steps and concepts we’ve covered to build our character counter!</p>

  <h3 className="text-xl font-semibold mt-6 mb-3">1. 🏣 Postal System Setup</h3>
  <ul className="list-disc list-inside mb-4 pl-4">
    <li><b>256 Mailboxes:</b> Pre-built for every possible ASCII character (0-255).</li>
    <li><b>Empty at Start:</b> All mailboxes begin empty, waiting for letters.</li>
  </ul>

  <h3 className="text-xl font-semibold mt-6 mb-3">2. 📨 Sorting Letters</h3>
  <ul className="list-disc list-inside mb-4 pl-4">
    <li><b>Read Characters:</b> Convert each to its ASCII "address" (e.g., A → 65).</li>
    <li><b>Instant Delivery:</b>
      <ul className="list-disc list-inside ml-6">
        <li><b>New Mailbox:</b> Create one if it doesn’t exist (H → Mailbox 72).</li>
        <li><b>Add to Existing:</b> Tally another letter in the matching mailbox.</li>
      </ul>
    </li>
  </ul>

  <h3 className="text-xl font-semibold mt-6 mb-3">3. 📄 Generating Reports</h3>
  <ul className="list-disc list-inside mb-4 pl-4">
    <li><b>Walk the Street:</b> Visit mailboxes in order (0 → 255).</li>
    <li><b>Format Entries:</b>
      <ul className="list-disc list-inside ml-6">
        <li><b>Public Boxes:</b> Show character + count (e(101) 5).</li>
        <li><b>Staff-Only:</b> Show numbers only ((13) 2 for carriage returns).</li>
      </ul>
    </li>
  </ul>

  <h3 className="text-xl font-semibold mt-6 mb-3">Why You’ll Love This</h3>
  <ul className="list-disc list-inside mb-4 pl-4">
    <li>⚡ <b>Blazing Fast:</b> No searching – direct access to every mailbox.</li>
    <li>📚 <b>Learn by Doing:</b> Master arrays, file I/O, and ASCII effortlessly.</li>
    <li>💪 <b>Handles Anything:</b> Works for tiny notes or giant novels.</li>
  </ul>

  <p className="mt-6 font-semibold">Congratulations! You’ve built a character-counting powerhouse. Time to test it out! 🚀</p>
</section>

<section className="mt-8">
  <h2 className="page-section-heading">Test It Out! 🧪</h2>
  <p className="mb-4">Now that you’ve built your character counter, let’s put it through its paces! Here’s how to test it with different files and scenarios.</p>

  <h3 className="text-xl font-semibold mt-6 mb-3">1. Simple Test: hello.txt</h3>
  <p className="mb-2"><b>Steps:</b></p>
  <ul className="list-disc list-inside mb-4 pl-4">
    <li>1. Run the program:</li>
  </ul>
  
</section>
<div className="mb-4">
      <button
        onClick={() => setShowRunProgramSteps(!showRunProgramSteps)}
        className="btn-green mb-2"
      >
        {showRunProgramSteps ? 'Hide Details' : 'Show Me How'}
      </button>
      {showRunProgramSteps && (
        <div className="p-4 border rounded-md bg-gray-50">
          <section className="mt-0">
            <h2 className="page-section-heading mb-4">1. Open Terminal/Command Prompt</h2>
            
            <p className="mb-2"><b>For Windows users:</b></p>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-1">Command Prompt</h4>
              <ul className="list-disc list-inside ml-4">
                <li>Press <b>Win + S</b></li>
                <li>Type "<b>cmd</b>"</li>
                <li>Select <b>Command Prompt</b> from the search results.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-1">PowerShell</h4>
              <ul className="list-disc list-inside ml-4">
                <li>Right-click the <b>Start</b> button</li>
                <li>Select <b>Windows PowerShell</b> or <b>Windows PowerShell (Admin)</b>.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-1">Windows Terminal (Recommended)</h4>
              <ul className="list-disc list-inside ml-4">
                <li>If not installed, open the <b>Microsoft Store</b> and search for "<b>Windows Terminal</b>" to install it.</li>
                <li>Press <b>Win + S</b></li>
                <li>Type "<b>Terminal</b>"</li>
                <li>Select <b>Windows Terminal</b> from the search results.</li>
              </ul>
            </div>
          </section>
          <section className="mt-8">
            <h2 className="page-section-heading mb-4">2. Navigate to Your Project</h2>
            <p className="mb-2">Use <code>cd</code> to move to your project's output directory (usually where the <code>.exe</code> file is located):</p>
            <CodeBlock
              language="bash"
              codeString={`# Example for Windows:
cd C:\\source\\repos\YourName_CharacterCounter\\YourName_CharacterCounter\\bin\\Debug\\net7.0`}
            />
            <p className="mt-4 mb-1"><b>Not sure where your executable file is?</b></p>
            <ul className="list-disc list-inside ml-4 mb-4 text-sm">
              <li><b>In Visual Studio:</b> Right-click your project in Solution Explorer → Select "Open Folder in File Explorer".</li>
              <li>Navigate into the <code>bin</code> folder, then <code>Debug</code>, then a folder named after your .NET version (e.g., <code>net7.0</code>, <code>net8.0</code>). Your <code>.exe</code> file should be there.</li>
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="page-section-heading mb-4">3. Run the Program</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mt-6 mb-3">Option 1: Directly Run the Executable</h3>
              <p className="mb-2">Once you are in the directory containing <code>CharacterCounter.exe</code>:</p>
              <CodeBlock
                language="bash"
                codeString={`# Windows
YourName_CharacterCounter.exe input.txt output.txt

# Mac/Linux (if you created a self-contained app and are in its directory)
./YourName_CharacterCounter input.txt output.txt`}
              />
              <p className="mt-2 text-sm text-gray-600">Remember to replace <code>input.txt</code> with your desired input file and <code>output.txt</code> with your desired output file name.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mt-6 mb-3">Option 2: Use .NET CLI (from Project Directory)</h3>
              <p className="mb-2">If you prefer to run from your project's root directory (where the <code>.csproj</code> file is):</p>
              <CodeBlock
                language="bash"
                codeString={`# Build and run in one command
dotnet run --project YourProjectName.csproj -- input.txt output.txt`}
              />
              <p className="mt-2 text-sm text-gray-600">Replace <code>YourProjectName.csproj</code> with the actual name of your project file. The <code>--</code> separates arguments for <code>dotnet run</code> from arguments for your application.</p>
            </div>
          </section>
        </div>
      )}
    </div>
<h3 className="font-bold mt-2">Command Line Execution:</h3>
            <CodeBlock
              language="csharp"
              codeString={`YourName_CharacterCounter.exe hello.txt output.txt`}
            />
            <p className="mb-2">2. Open output.txt and look for:</p>
            <pre className="whitespace-pre-wrap break-all" style={{
              backgroundColor: 'black',
              color: '#EDEDED',
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              fontWeight: 'normal',
              fontSize: '0.875em',
              textShadow: 'none',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>{`(10)    1  
(13)    1  
.(46)   1  
H(72)   1  
e(101)  1  
l(108)  2  
o(111)  1`}</pre>
            {/* New section for Large File Stress Test */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mt-6 mb-3">2. Large File Stress Test: wap.txt (War and Peace)</h3>
              <p className="mb-2"><b>Steps:</b></p>
              <ol className="list-disc list-inside mb-4 pl-4">
                <li> Run:
                  <CodeBlock
                    language="bash"
                    codeString={`YourName_CharacterCounter.exe wap.txt wap_output.txt`}
                  />
                </li>
                <li>Check wap_output.txt for:
                  <pre className="whitespace-pre-wrap break-all" style={{
                    backgroundColor: 'black',
                    color: '#EDEDED',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontWeight: 'normal',
                    fontSize: '0.875em',
                    textShadow: 'none',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginTop: '0.5rem'
                  }}>{`(32)    516291  ← Space character  
e(101)  327814  
t(116)  222893  
a(97)   198124  
...`}</pre>
                </li>
              </ol>
              <p className="mt-6 text-lg font-semibold">Way to go! You’ve now tested your program like a pro. 🎉</p>
            </div>
            </div>
          </section>

              {/* New concluding section */}
              <section className="mt-12"> {/* Added top margin */}
                <p className="mb-4 text-lg"><strong className="text-xl font-bold">Congratulations!</strong> 🎉 You've not only created a functioning character counter program, but you've also gained valuable insights into how ASCII works, how arrays store information, and how computers process text. This is proof you can transform programming theory into real-world tools! This milestone is worth celebrating! 🎉</p>

                <p className="mb-4 font-semibold text-lg">Your toolkit is now a launchpad for bigger creations! 🚀✨</p>
                <h3 className="text-xl font-semibold mt-6 mb-3">Whats Next?</h3>
                <p className="mb-2">Your code isn’t just functional – it’s the foundation of what’s next! With knowledge in ASCII manipulation and data processing, the possibilities are endless.</p>
                <p className="mb-2 font-semibold">What will you build?</p>
                <ul className="list-none ml-6 mt-1 text-gray-600">
                  <li>• Format: Character(ASCII) [tab] Frequency</li>
                  <li>• Example: H(72) [tab] 1</li>
                  <li>• Special handling for control characters (ASCII values 0-31)</li>
                </ul>

                <p className="text-center mt-8 text-lg font-semibold">Happy coding! 🚀 Let your array adventures begin!</p>
              </section>
      </main>
    </div>
  )
}