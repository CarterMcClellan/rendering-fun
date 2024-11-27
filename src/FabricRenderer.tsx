import { useEffect, useRef } from "react";
import { Canvas, FabricObject, loadSVGFromString, util } from "fabric";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./App";
import { SVGElement } from "./App";

type Props = {  
    elements: SVGElement[];
}

export const FabricRenderer = ({ elements }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricRef = useRef<Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new Canvas(canvasRef.current, {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            backgroundColor: 'transparent',
        });

        fabricRef.current = canvas;
        
        return () => {
            canvas.dispose();
        };
    }, [canvasRef]);

    useEffect(() => {
        if (!fabricRef.current) return;
        fabricRef.current.clear();
    
        let promises: Promise<void>[] = [];
    
        elements.forEach(element => {
            promises.push(loadSVGFromString(element.svg).then((result: {
                objects: (FabricObject | null)[];
                options: Record<string, any>;
                elements: Element[];
                allElements: Element[];
            }) => {
                const nonNullObjects = result.objects.filter(obj => obj !== null) as FabricObject[];
                const svgGroup = util.groupSVGElements(nonNullObjects, result.options);
                svgGroup.set({
                    left: element.position.x,
                    top: element.position.y,
                });
                fabricRef.current?.add(svgGroup);
            }))
        });
    
        Promise.all(promises).then(() => {
            fabricRef.current?.renderAll();
        });
    }, [elements]);

    return (
        <div className="relative bg-gray-200 rounded-lg" style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}>
            <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT} 
            />
        </div>
    )
};

export default FabricRenderer;