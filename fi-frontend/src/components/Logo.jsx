import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: flex;
  align-items: center;

  svg {
    width: 120px; // Reduced from 200px
    height: auto;
    animation: logoEntrance 1.5s ease-out;
  }

  @keyframes logoEntrance {
    0% {
      opacity: 0;
      transform: translateY(-10px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export default function Logo() {
  return (
    <LogoContainer>
      <svg width="100%" height="auto" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
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
            fontSize="80" 
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
}