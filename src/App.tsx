import { useEffect, useRef, useState } from 'react';
import './App.css';

import DivRenderer from './DivRenderer';
import CanvasRenderer from './CanvasRenderer';
import FabricRenderer from './FabricRenderer';
import SvgRenderer, { SVGRenderer } from './SvgRenderer';
import { SkiaCanvasRenderer } from './SkiaRenderer';

export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 600;

export type SVGElement = {
    svg: string;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
}

const SHAPES = [
  (width: number, height: number) => 
    `<svg width="${width}" height="${height}" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="blue"/></svg>`,
  (width: number, height: number) => 
    `<svg width="${width}" height="${height}" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="red"/></svg>`,
  (width: number, height: number) => 
    `<svg width="${width}" height="${height}" viewBox="0 0 20 20"><polygon points="10,0 20,20 0,20" fill="green"/></svg>`
];

const createRandomElement = (): SVGElement => {
  const width = 20 + Math.random() * 100;
  const height = 20 + Math.random() * 100;
  const randomShapeIdx = Math.floor(Math.random() * SHAPES.length);

  return {
    svg: SHAPES[randomShapeIdx](width, height),
    position: {
      x: Math.random() * 700,
      y: Math.random() * 500
    },
    velocity: {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5
    }
  };
};

function App() {
  const [elements, setElements] = useState<SVGElement[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [desiredCount, setDesiredCount] = useState<number>(1);
  const [renderMode, setRenderMode] = useState<'canvas' | 'div' | 'fabric' | 'svg' | 'skia'>('canvas');
  const frameRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const framesRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  const getRenderer = () => {
    if (renderMode === 'canvas') return <CanvasRenderer elements={elements} />;
    if (renderMode === 'div') return <DivRenderer elements={elements} />;
    if (renderMode === 'fabric') return <FabricRenderer elements={elements} />;
    if (renderMode === 'svg') return <SVGRenderer elements={elements} />;
    if (renderMode === 'skia') return <SkiaCanvasRenderer elements={elements} />;
  }

  const updateElements = () => {
    const newElements = Array.from({ length: desiredCount }, () => createRandomElement());
    setElements(newElements);
  };

  useEffect(() => {
    updateElements();
  }, []);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!previousTimeRef.current) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      framesRef.current++;
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        setFps(Math.round(framesRef.current * 1000 / (timestamp - lastFpsUpdateRef.current)));
        framesRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      setElements(prevElements => 
        prevElements.map(element => {
          const newX = element.position.x + element.velocity.x;
          const newY = element.position.y + element.velocity.y;

          let newVelX = element.velocity.x;
          let newVelY = element.velocity.y;

          if (newX <= 0 || newX > CANVAS_WIDTH) newVelX *= -1;
          if (newY <= 0 || newY > CANVAS_HEIGHT) newVelY *= -1;

          return {
            ...element,
            position: {
              x: newX,
              y: newY
            },
            velocity: {
              x: newVelX,
              y: newVelY
            }
          };
        })
      );

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className='flex justify-center items-center min-h-screen w-full'>
      <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
        <div className="mb-2">FPS: {fps}</div>
        <div className="mb-2">Elements: {elements.length}</div>
        <div className="mb-2">
          <input
            type="number"
            min="1"
            value={desiredCount}
            onChange={(e) => setDesiredCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-black rounded p-1 mr-2"
          />
          <button
            onClick={updateElements}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          >
            Update
          </button>
        </div>
        <select 
          value={renderMode}
          onChange={(e) => setRenderMode(e.target.value as 'canvas' | 'div' | 'fabric' | 'svg' | 'skia')}
          className="w-full bg-white text-black rounded p-1"
        >
          <option value="canvas">Canvas Renderer</option>
          <option value="div">Div Renderer</option>
          <option value="fabric">Fabric Renderer</option>
          <option value="svg">SVG Renderer</option>
          <option value="skia">Skia Renderer</option>
        </select>
      </div>
      {getRenderer()}
    </div>
  );
}

export default App;