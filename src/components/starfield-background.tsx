import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  velocityX: number;
  velocityY: number;
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Generate stars
    const generateStars = () => {
      const stars: Star[] = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 8000); // Density based on screen size
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          velocityX: (Math.random() - 0.5) * 0.175, // 1.75x faster horizontal movement
          velocityY: (Math.random() - 0.5) * 0.0875  // 1.75x faster vertical movement
        });
      }
      
      starsRef.current = stars;
    };

    generateStars();

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016; // ~60fps

      // Clear canvas with deep space background
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach(star => {
        // Update star position with subtle movement
        star.x += star.velocityX;
        star.y += star.velocityY;
        
        // Wrap stars around screen edges
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.y > canvas.height + 10) star.y = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const opacity = star.brightness * twinkle;
        
        // Star color varies slightly
        const hue = 100 + Math.sin(star.twinkleOffset) * 60; // Blue to white spectrum
        const saturation = 20 + Math.sin(star.twinkleOffset * 2) * 30;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, 90%, ${opacity})`;
        ctx.fill();

        // Add subtle glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, 80%, ${opacity * 0.1})`;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #000008 0%, #000012 100%)' }}
    />
  );
}