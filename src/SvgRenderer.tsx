import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SVGElement } from './App';

type SvgRendererProps = {
    svgString: string;
    position: { x: number; y: number };
}

const SVGRenderElement = ({ svgString, position }: SvgRendererProps) => {
    const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
    const [x, y, width, height] = viewBoxMatch ? 
        viewBoxMatch[1].split(' ').map(Number) : 
        [0, 0, 20, 20]; 

    const svgContent = svgString
        .replace(/<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '');

    return (
        <g 
            transform={`translate(${position.x} ${position.y})`}
            viewBox={`${x} ${y} ${width} ${height}`}
            dangerouslySetInnerHTML={{ __html: svgContent }} 
        />
    );
};

type Props = {
    elements: SVGElement[];
}

export const SVGRenderer = ({ elements }: Props) => {
    return (
        <svg 
            className="bg-gray-200 rounded-lg"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            style={{ overflow: 'hidden' }}
        >
            {elements.map((element, index) => (
                <SVGRenderElement
                    key={index}
                    svgString={element.svg}
                    position={element.position}
                />
            ))}
        </svg>
    );
};

export default SVGRenderer;