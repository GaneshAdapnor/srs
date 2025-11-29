import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ trigger, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!show) return null;

  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 2;

    return (
      <div
        key={i}
        className="fixed pointer-events-none z-50"
        style={{
          left: `${left}%`,
          top: '-10px',
          width: '10px',
          height: '10px',
          backgroundColor: color,
          borderRadius: '50%',
          animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
        }}
      />
    );
  });

  return <>{confettiPieces}</>;
};

// Add confetti animation to CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export default Confetti;

