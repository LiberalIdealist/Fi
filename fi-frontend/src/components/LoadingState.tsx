import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a, #2d2d2d);
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #6F42C1;
  font-size: 1.2rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  filter: drop-shadow(0 0 10px rgba(111, 66, 193, 0.3));

  svg {
    width: 100px; // Smaller size
    height: auto;
    animation: logoEntrance 2s ease-in-out infinite; // Longer duration and infinite loop
  }

  @keyframes logoEntrance {
    0% {
      opacity: 0.6;
      transform: translateX(-10px);
    }
    50% {
      opacity: 1;
      transform: translateX(10px);
    }
    100% {
      opacity: 0.6;
      transform: translateX(-10px);
    }
  }
`;

const Logo: React.FC = () => {
  return (
    <LogoContainer>
      <svg width="100%" height="auto" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#007BFF", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#6F42C1", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#FF1493", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <g>
          <text 
            x="10" 
            y="70" 
            fontFamily="Arial, sans-serif" 
            fontSize="30" 
            fontWeight="bold" 
            fill="url(#gradient)" 
            textAnchor="start" 
            dominantBaseline="middle"
          >
            Fi
          </text>
        </g>
      </svg>
    </LogoContainer>
  );
};

const LoadingState: React.FC = () => {
  return (
    <LoadingContainer>
      <Logo />
      <LoadingText>Loading...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingState;