
import React from 'react';
import { NodeType } from '../../types';

interface GateIconProps {
  type: NodeType;
  size?: number;
  color?: string;
}

export const GateIcon: React.FC<GateIconProps> = ({ type, size = 24, color = "currentColor" }) => {
  const commonProps = { width: size, height: size, fill: "none", viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: color };

  switch (type) {
    case NodeType.AND:
      return (
        <svg {...commonProps} aria-label="AND gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h4v8H4zM8 12h4M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4H8v-8zM16 12h4" />
        </svg>
      );
    case NodeType.OR:
      return (
        <svg {...commonProps} aria-label="OR gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3m-3 8h3m8-8c1.558 0 3.022.632 4.096 1.707C20.17 10.78 20.174 13.218 19.1 14.293 18.024 15.367 16.56 16 15 16H7S4.854 13.064 4.553 12.033C4.274 11.079 4.553 11.033 4.553 11.033S7 8 7 8h8zM20 12h-3" />
        </svg>
      );
    case NodeType.NOT:
      return (
        <svg {...commonProps} aria-label="NOT gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h4l6 6V6l-6 6zm10 0h2m2 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      );
    case NodeType.XOR:
      return (
        <svg {...commonProps} aria-label="XOR gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3m-3 8h3m-3-4h1M15 16H7S4.854 13.064 4.553 12.033C4.274 11.079 4.553 11.033 4.553 11.033S7 8 7 8h8c1.558 0 3.022.632 4.096 1.707.726.726 1.24 1.636 1.54 2.585M20 12h-3" />
        </svg>
      );
    case NodeType.NAND: // AND + NOT circle
      return (
         <svg {...commonProps} aria-label="NAND gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h4v8H4zM8 12h4M12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4H8v-8zM16 12h2m2 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      );
    case NodeType.NOR: // OR + NOT circle
      return (
        <svg {...commonProps} aria-label="NOR gate icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3m-3 8h3m8-8c1.558 0 3.022.632 4.096 1.707C20.17 10.78 20.174 13.218 19.1 14.293 18.024 15.367 16.56 16 15 16H7S4.854 13.064 4.553 12.033C4.274 11.079 4.553 11.033 4.553 11.033S7 8 7 8h8zM17.5 12h.5m2 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      );
    case NodeType.XNOR: // XOR + NOT circle
      return (
        <svg {...commonProps} aria-label="XNOR gate icon">
           <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h3m-3 8h3m-3-4h1M15 16H7S4.854 13.064 4.553 12.033C4.274 11.079 4.553 11.033 4.553 11.033S7 8 7 8h8c1.558 0 3.022.632 4.096 1.707.726.726 1.24 1.636 1.54 2.585M17.5 12h.5m2 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      );
    default:
      return null;
  }
};
    