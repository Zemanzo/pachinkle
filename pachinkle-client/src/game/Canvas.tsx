import React, { useEffect, useRef } from 'react';
import { StyledCanvas } from './Canvas.style';
import Renderer from './renderer';

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderer: Renderer;
    if (canvasRef.current) {
      renderer = new Renderer(canvasRef.current);
    }
    return () => {
      renderer?.destroy();
    }
  }, [canvasRef])

  return (
    <StyledCanvas ref={canvasRef}>

    </StyledCanvas>
  );
}

export default Canvas;
