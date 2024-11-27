// Similar to Div renderer this takes a list of SVGS and renders them on a canvas.
// 
// The difference here is that we are using the "drawImage" method of the canvas context,
// rather than manipulating the innerHTML of a div.
//
// No real intuition for which is more performant.

import { useEffect, useRef } from "react";
import { SVGElement } from "./App";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./App";

type Props = {  
    elements: SVGElement[];
}

const wrapSvgString = (svg: string) => `<svg xmlns="http://www.w3.org/2000/svg">
    ${svg}
</svg>`;

export const CanvasRenderer = ({ elements }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const context = ref.current.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (elements.length === 0) return;

    // previously was having a problem where the canvas was not waiting
    // for all elements to be drawn before resolving this function
    // (because the image onload function is async)
    // so we are using promises to ensure all elements are drawn before resolving
    const drawPromises = elements.map((element) => {
      return new Promise<void>((resolve) => {
        const image = new Image(); 
        const svg = wrapSvgString(element.svg);
        image.src = `data:image/svg+xml;base64,${window.btoa(svg)}`;
        
        image.onload = () => {
          context.drawImage(image, element.position.x, element.position.y);
          resolve();
        };
      });
    });

    Promise.all(drawPromises);
  }, [elements]);

  return (
    <div>
        <canvas 
            className="relative bg-gray-200 rounded-lg"
            ref={ref} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
        />
    </div>
  );
};

export default CanvasRenderer;
