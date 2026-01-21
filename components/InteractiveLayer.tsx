
import React, { useState } from 'react';
import { SIZE } from '../constants';
import type { GateWeightMap, GateConfig } from '../types';

interface InteractiveLayerProps {
  onCellClick: (i: number, j: number, k: number) => void;
  onCellHover?: (i: number | null, j: number | null) => void;
  canvasSize: number;
  hoveredWeightKey?: keyof GateWeightMap | null;
  gateConfigs?: Record<number, GateConfig>;
  kernelFace?: number[][];
}

export const InteractiveLayer: React.FC<InteractiveLayerProps> = ({ onCellClick, onCellHover, canvasSize }) => {
  const cellSize = canvasSize / SIZE;
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const j = Math.floor(x / cellSize);
    const i = Math.floor(y / cellSize);

    if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) {
        setHoveredCell({ i, j });
        onCellHover?.(i, j);
    } else {
        setHoveredCell(null);
        onCellHover?.(null, null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    onCellHover?.(null, null);
  };

  const handleClick = () => {
    if (hoveredCell) {
        onCellClick(hoveredCell.i, hoveredCell.j, 0);
    }
  };

  return (
    <div 
        className="absolute inset-0 z-10 focus:outline-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: 'crosshair' }}
        role="grid"
        aria-label="Interactive lattice grid"
    >
        {hoveredCell && (
            <div
                className="absolute pointer-events-none border border-white/50 bg-white/5"
                style={{
                    left: hoveredCell.j * cellSize,
                    top: hoveredCell.i * cellSize,
                    width: cellSize,
                    height: cellSize,
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                    zIndex: 30
                }}
            >
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
        )}
    </div>
  );
};
