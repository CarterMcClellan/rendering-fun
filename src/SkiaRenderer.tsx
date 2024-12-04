import { useEffect, useRef } from "react";
import { Canvas, loadImage } from "skia-canvas";
import { SVGElement } from "./App";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./App";

type Props = {
    elements: SVGElement[];
}

const wrapSvgString = (svg: string) => `<svg xmlns="http://www.w3.org/2000/svg">
    ${svg}
</svg>`;

// Helper function to convert string to base64
const toBase64 = (str: string) => {
    return window.btoa(unescape(encodeURIComponent(str)));
};

export const SkiaCanvasRenderer = ({ elements }: Props) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const skiaCanvasRef = useRef<Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        skiaCanvasRef.current = new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        const container = canvasRef.current;
        
        const render = async () => {
            if (!skiaCanvasRef.current) return;
            
            const ctx = skiaCanvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw background
            ctx.fillStyle = 'rgb(229, 231, 235)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw all SVG elements
            await Promise.all(elements.map(async (element) => {
                const svg = wrapSvgString(element.svg);
                
                try {
                    const base64Svg = toBase64(svg);
                    const image = await loadImage(`data:image/svg+xml;base64,${base64Svg}`);
                    ctx.drawImage(image, element.position.x, element.position.y);
                } catch (error) {
                    console.error('Error loading SVG:', error);
                }
            }));
            
            // Update the visible canvas
            if (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(skiaCanvasRef.current);
        };

        render();

        return () => {
            if (skiaCanvasRef.current) {
                skiaCanvasRef.current = null;
            }
        };
    }, [elements]);

    return (
        <div className="relative">
            <div
                ref={canvasRef}
                className="rounded-lg"
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            />
        </div>
    );
};

export default SkiaCanvasRenderer;