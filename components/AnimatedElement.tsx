import React, { useRef, ReactNode } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  delay?: number; // in ms
  staggerIndex?: number;
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className = '', delay = 0, staggerIndex }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
  
  const style: React.CSSProperties = {
      transitionDelay: `${delay + (staggerIndex ? staggerIndex * 100 : 0)}ms`,
  };

  return (
    <div
      ref={ref}
      className={`fade-in-up-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;
