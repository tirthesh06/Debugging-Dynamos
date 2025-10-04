import React, { useState, useEffect, useRef } from 'react';

const CursorFollower: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  // Use refs to store the target position to avoid re-renders on mouse move
  const targetPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const currentPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      targetPos.current = { x: clientX, y: clientY };

      const target = e.target as HTMLElement;
      // Check for common interactive elements or a custom data attribute
      const isInteractive = target.closest(
        'a, button, [role="button"], input, select, textarea, [data-interactive]'
      );
      setIsHovering(!!isInteractive);
    };
    
    const animateCursor = () => {
        if (cursorRef.current) {
            const dX = targetPos.current.x - currentPos.current.x;
            const dY = targetPos.current.y - currentPos.current.y;
            
            // Smoothly move the current position towards the target
            currentPos.current.x += dX * 0.2;
            currentPos.current.y += dY * 0.2;

            cursorRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`;
        }
        animationFrameId.current = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId.current = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div
      id="cursor-follower"
      ref={cursorRef}
      className={isHovering ? 'hovered' : ''}
    />
  );
};

export default CursorFollower;