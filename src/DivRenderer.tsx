// A "renderer" for our usecase, is a componment which can take a list of SVG strings, and display them on a "canvas"
// The purpose of this component is to track the FPS as the number of SVGs increases. (attempting to benchmark the performance
// of this implementation)
//
// This first implementation is probably the most simple, we are modifying the inner html of a div directly to display the svg.
import React, { useEffect } from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SVGElement } from './App';

type SvgRendererProps = {
    svgString: string;
    position: { x: number; y: number };
}

const DivRenderElement = ({ svgString, position }: SvgRendererProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgString || !containerRef.current) return;
    containerRef.current.innerHTML = svgString;
  }, [svgString]);

  return (
    <div 
      ref={containerRef}
      className="absolute transform"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
};

type Props = {
    elements: SVGElement[];
}

export const DivRenderer = ({ elements }: Props) => {
  // overflow hidden -> hides svgs if they move outside the canvas
  return (
    <div 
        className="relative bg-gray-200 rounded-lg overflow-hidden"
        style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
    >
        {elements.map((element, index) => (
            <DivRenderElement 
                key={index}
                svgString={element.svg}
                position={element.position}
            />
        ))}
    </div>
  );
};

export default DivRenderer;