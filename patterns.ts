
import { SIZE, DEPTH } from './constants';
import type { Lattice3D, UserPattern } from './types';

interface Pattern2D {
  name: string;
  data: number[][];
}

// These are "quadrant" patterns, designed to be mirrored.
const PATTERNS_2D: Pattern2D[] = [
  {
    name: 'Quad-Glider',
    data: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  {
      name: 'Corner Blocks',
      data: [
          [1, 1],
          [1, 1],
      ]
  },
  {
      name: 'Quad Cross',
      data: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]
  },
  {
      name: 'Pinwheel',
      data: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
      ]
  },
  {
    name: 'Penta-Replicator',
    data: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ]
  },
  {
    name: 'Diagonal Line',
    data: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ]
  },
  {
    name: 'Agitator',
    data: [
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ]
  },
];

const createBaseLattice = (depth: number): Lattice3D => {
    return Array.from({ length: SIZE }, () => 
      Array.from({ length: SIZE }, () => 
        Array(depth).fill(0)
      )
    );
}

export const generateLatticeFromPattern = (pattern: number[][], depth: number): Lattice3D => {
    const baseLattice = createBaseLattice(depth);
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    const middleLayer = Math.floor(depth / 2);

    const setCell = (r: number, c: number, value: number) => {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
            baseLattice[r][c][middleLayer] = value;
        }
    };
    
    const offsetX = 1;
    const offsetY = 1;

    for (let i = 0; i < patternHeight; i++) {
        for (let j = 0; j < patternWidth; j++) {
            if (pattern[i][j] === 1) {
                const r = offsetX + i;
                const c = offsetY + j;
                
                if (r < Math.ceil(SIZE / 2) && c < Math.ceil(SIZE / 2)) {
                    setCell(r, c, 1);
                    setCell(r, SIZE - 1 - c, 1);
                    setCell(SIZE - 1 - r, c, 1);
                    setCell(SIZE - 1 - r, SIZE - 1 - c, 1);
                }
            }
        }
    }
    return baseLattice;
};

export const DEFAULT_PATTERNS: UserPattern[] = PATTERNS_2D.map((p, index) => ({
  id: `default-${index}`,
  name: p.name,
  data: generateLatticeFromPattern(p.data, DEPTH),
  isDefault: true,
}));
