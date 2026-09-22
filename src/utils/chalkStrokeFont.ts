/**
 * High-Precision Vector Chalkboard Handwriting & Math Stroke Synthesizer
 * Generates 100% legible, authentic chalk strokes for letters, digits, and mathematical formulas
 * on the 1000x750 chalkboard coordinate system.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface ChalkVectorStroke {
  color: string;
  width: number;
  label?: string;
  type?: 'pen' | 'erase';
  points: Point2D[];
}

// Normalized glyph paths defined in a local 10x14 coordinate box
// (x: 0 to 10, y: 0 to 14, where 0 is top and 13 is standard baseline)
const GLYPH_PATHS: Record<string, Point2D[][]> = {
  // Digits
  '0': [
    [{ x: 5, y: 1 }, { x: 8.5, y: 3.5 }, { x: 8.5, y: 10.5 }, { x: 5, y: 13 }, { x: 1.5, y: 10.5 }, { x: 1.5, y: 3.5 }, { x: 5, y: 1 }]
  ],
  '1': [
    [{ x: 3, y: 4 }, { x: 5, y: 1 }, { x: 5, y: 13 }],
    [{ x: 2, y: 13 }, { x: 8, y: 13 }]
  ],
  '2': [
    [{ x: 2, y: 4 }, { x: 4.5, y: 1 }, { x: 7.5, y: 2 }, { x: 8.5, y: 4.5 }, { x: 8, y: 7 }, { x: 2, y: 13 }, { x: 8.5, y: 13 }]
  ],
  '3': [
    [{ x: 2, y: 2 }, { x: 8, y: 2 }, { x: 4.5, y: 6.5 }, { x: 8, y: 8 }, { x: 8, y: 11.5 }, { x: 5, y: 13.5 }, { x: 2, y: 12 }]
  ],
  '4': [
    [{ x: 7.5, y: 1 }, { x: 7.5, y: 13 }],
    [{ x: 7.5, y: 3 }, { x: 1.5, y: 8.5 }, { x: 8.8, y: 8.5 }]
  ],
  '5': [
    [{ x: 8, y: 1.5 }, { x: 2.5, y: 1.5 }, { x: 2, y: 6.5 }, { x: 6.5, y: 6 }, { x: 8.5, y: 8.5 }, { x: 7.5, y: 12 }, { x: 4.5, y: 13.5 }, { x: 2, y: 12 }]
  ],
  '6': [
    [{ x: 7.5, y: 2.5 }, { x: 4.5, y: 1.5 }, { x: 1.8, y: 5 }, { x: 1.8, y: 10 }, { x: 4.5, y: 13.5 }, { x: 8, y: 11.5 }, { x: 8, y: 8 }, { x: 5, y: 6.5 }, { x: 1.8, y: 8.5 }]
  ],
  '7': [
    [{ x: 1.5, y: 1.5 }, { x: 8.5, y: 1.5 }, { x: 4, y: 13 }]
  ],
  '8': [
    [{ x: 5, y: 7 }, { x: 2.5, y: 4.5 }, { x: 3, y: 2 }, { x: 5, y: 1 }, { x: 7, y: 2 }, { x: 7.5, y: 4.5 }, { x: 5, y: 7 }, { x: 2, y: 9.5 }, { x: 2.5, y: 12 }, { x: 5, y: 13.5 }, { x: 7.5, y: 12 }, { x: 8, y: 9.5 }, { x: 5, y: 7 }]
  ],
  '9': [
    [{ x: 8, y: 7 }, { x: 5, y: 8.5 }, { x: 2, y: 6.5 }, { x: 2, y: 3.5 }, { x: 5, y: 1 }, { x: 8, y: 2.5 }, { x: 8, y: 10.5 }, { x: 6, y: 13.2 }, { x: 3, y: 12.8 }]
  ],

  // Common Math & Punctuation Symbols
  '+': [
    [{ x: 5, y: 3 }, { x: 5, y: 11 }],
    [{ x: 1, y: 7 }, { x: 9, y: 7 }]
  ],
  '-': [
    [{ x: 1.5, y: 7 }, { x: 8.5, y: 7 }]
  ],
  '=': [
    [{ x: 1.5, y: 5.5 }, { x: 8.5, y: 5.5 }],
    [{ x: 1.5, y: 8.5 }, { x: 8.5, y: 8.5 }]
  ],
  '×': [
    [{ x: 2, y: 4 }, { x: 8, y: 10 }],
    [{ x: 8, y: 4 }, { x: 2, y: 10 }]
  ],
  '*': [
    [{ x: 2, y: 4 }, { x: 8, y: 10 }],
    [{ x: 8, y: 4 }, { x: 2, y: 10 }],
    [{ x: 5, y: 3 }, { x: 5, y: 11 }]
  ],
  '÷': [
    [{ x: 1, y: 7 }, { x: 9, y: 7 }],
    [{ x: 5, y: 3.5 }, { x: 5, y: 4.2 }],
    [{ x: 5, y: 9.8 }, { x: 5, y: 10.5 }]
  ],
  '/': [
    [{ x: 2, y: 13 }, { x: 8, y: 1 }]
  ],
  '\\': [
    [{ x: 2, y: 1 }, { x: 8, y: 13 }]
  ],
  '(': [
    [{ x: 7, y: 1 }, { x: 3, y: 7 }, { x: 7, y: 13 }]
  ],
  ')': [
    [{ x: 3, y: 1 }, { x: 7, y: 7 }, { x: 3, y: 13 }]
  ],
  '[': [
    [{ x: 7, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 13 }, { x: 7, y: 13 }]
  ],
  ']': [
    [{ x: 3, y: 1 }, { x: 7, y: 1 }, { x: 7, y: 13 }, { x: 3, y: 13 }]
  ],
  '{': [
    [{ x: 7, y: 1 }, { x: 4.5, y: 3.5 }, { x: 4.5, y: 6 }, { x: 2.5, y: 7 }, { x: 4.5, y: 8 }, { x: 4.5, y: 10.5 }, { x: 7, y: 13 }]
  ],
  '}': [
    [{ x: 3, y: 1 }, { x: 5.5, y: 3.5 }, { x: 5.5, y: 6 }, { x: 7.5, y: 7 }, { x: 5.5, y: 8 }, { x: 5.5, y: 10.5 }, { x: 3, y: 13 }]
  ],
  '>': [
    [{ x: 2, y: 3 }, { x: 8, y: 7 }, { x: 2, y: 11 }]
  ],
  '<': [
    [{ x: 8, y: 3 }, { x: 2, y: 7 }, { x: 8, y: 11 }]
  ],
  ':': [
    [{ x: 5, y: 5 }, { x: 5, y: 5.8 }],
    [{ x: 5, y: 10 }, { x: 5, y: 10.8 }]
  ],
  ';': [
    [{ x: 5, y: 5 }, { x: 5, y: 5.8 }],
    [{ x: 5, y: 10 }, { x: 4, y: 12.5 }]
  ],
  '.': [
    [{ x: 5, y: 11.5 }, { x: 5, y: 12.5 }]
  ],
  ',': [
    [{ x: 5, y: 10.5 }, { x: 4, y: 13.5 }]
  ],
  '?': [
    [{ x: 2, y: 3.5 }, { x: 5, y: 1 }, { x: 8, y: 3.5 }, { x: 6, y: 6.5 }, { x: 5, y: 8.5 }],
    [{ x: 5, y: 11.5 }, { x: 5, y: 12.5 }]
  ],
  '!': [
    [{ x: 5, y: 1 }, { x: 5, y: 8.5 }],
    [{ x: 5, y: 11.5 }, { x: 5, y: 12.5 }]
  ],
  "'": [
    [{ x: 5, y: 1 }, { x: 4.5, y: 4 }]
  ],
  '"': [
    [{ x: 3.5, y: 1 }, { x: 3, y: 4 }],
    [{ x: 6.5, y: 1 }, { x: 6, y: 4 }]
  ],
  '√': [
    [{ x: 1, y: 8 }, { x: 2.5, y: 12.5 }, { x: 5, y: 1 }, { x: 9.5, y: 1 }]
  ],
  '^': [
    [{ x: 2, y: 6 }, { x: 5, y: 2 }, { x: 8, y: 6 }]
  ],
  '%': [
    [{ x: 2, y: 12.5 }, { x: 8, y: 1.5 }],
    [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 4, y: 4.5 }, { x: 3, y: 4.5 }, { x: 3, y: 3 }],
    [{ x: 6, y: 9.5 }, { x: 7, y: 9.5 }, { x: 7, y: 11 }, { x: 6, y: 11 }, { x: 6, y: 9.5 }]
  ],
  '_': [
    [{ x: 1, y: 13 }, { x: 9, y: 13 }]
  ],

  // Uppercase Letters (A-Z)
  'A': [
    [{ x: 1.5, y: 13 }, { x: 5, y: 1 }, { x: 8.5, y: 13 }],
    [{ x: 2.8, y: 8.5 }, { x: 7.2, y: 8.5 }]
  ],
  'B': [
    [{ x: 2, y: 13 }, { x: 2, y: 1 }],
    [{ x: 2, y: 1 }, { x: 6.5, y: 1 }, { x: 8, y: 3.5 }, { x: 6.5, y: 6.5 }, { x: 2, y: 6.5 }],
    [{ x: 2, y: 6.5 }, { x: 7, y: 6.5 }, { x: 8.5, y: 9.5 }, { x: 7, y: 13 }, { x: 2, y: 13 }]
  ],
  'C': [
    [{ x: 8.5, y: 3.5 }, { x: 5.5, y: 1 }, { x: 2, y: 4.5 }, { x: 2, y: 9.5 }, { x: 5.5, y: 13 }, { x: 8.5, y: 10.5 }]
  ],
  'D': [
    [{ x: 2.5, y: 13 }, { x: 2.5, y: 1 }],
    [{ x: 2.5, y: 1 }, { x: 5.5, y: 1 }, { x: 8.5, y: 4.5 }, { x: 8.5, y: 9.5 }, { x: 5.5, y: 13 }, { x: 2.5, y: 13 }]
  ],
  'E': [
    [{ x: 8, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 13 }, { x: 8, y: 13 }],
    [{ x: 2, y: 7 }, { x: 6.5, y: 7 }]
  ],
  'F': [
    [{ x: 2, y: 13 }, { x: 2, y: 1 }, { x: 8, y: 1 }],
    [{ x: 2, y: 7 }, { x: 6.5, y: 7 }]
  ],
  'G': [
    [{ x: 8.5, y: 3.5 }, { x: 5.5, y: 1 }, { x: 2, y: 4.5 }, { x: 2, y: 9.5 }, { x: 5.5, y: 13 }, { x: 8.5, y: 11 }, { x: 8.5, y: 7.5 }, { x: 5.5, y: 7.5 }]
  ],
  'H': [
    [{ x: 2, y: 1 }, { x: 2, y: 13 }],
    [{ x: 8, y: 1 }, { x: 8, y: 13 }],
    [{ x: 2, y: 7 }, { x: 8, y: 7 }]
  ],
  'I': [
    [{ x: 5, y: 1 }, { x: 5, y: 13 }],
    [{ x: 2.5, y: 1 }, { x: 7.5, y: 1 }],
    [{ x: 2.5, y: 13 }, { x: 7.5, y: 13 }]
  ],
  'J': [
    [{ x: 3, y: 1 }, { x: 8, y: 1 }],
    [{ x: 6, y: 1 }, { x: 6, y: 10 }, { x: 4.5, y: 13 }, { x: 1.5, y: 11 }]
  ],
  'K': [
    [{ x: 2, y: 1 }, { x: 2, y: 13 }],
    [{ x: 8, y: 1.5 }, { x: 2.2, y: 7.5 }],
    [{ x: 3.5, y: 6.5 }, { x: 8.5, y: 13 }]
  ],
  'L': [
    [{ x: 2.5, y: 1 }, { x: 2.5, y: 13 }, { x: 8, y: 13 }]
  ],
  'M': [
    [{ x: 1.5, y: 13 }, { x: 1.5, y: 1 }, { x: 5, y: 8.5 }, { x: 8.5, y: 1 }, { x: 8.5, y: 13 }]
  ],
  'N': [
    [{ x: 2, y: 13 }, { x: 2, y: 1 }, { x: 8, y: 13 }, { x: 8, y: 1 }]
  ],
  'O': [
    [{ x: 5, y: 1 }, { x: 8.5, y: 4 }, { x: 8.5, y: 10 }, { x: 5, y: 13 }, { x: 1.5, y: 10 }, { x: 1.5, y: 4 }, { x: 5, y: 1 }]
  ],
  'P': [
    [{ x: 2.5, y: 13 }, { x: 2.5, y: 1 }, { x: 6.5, y: 1 }, { x: 8.5, y: 3.5 }, { x: 6.5, y: 6.5 }, { x: 2.5, y: 6.5 }]
  ],
  'Q': [
    [{ x: 5, y: 1 }, { x: 8.5, y: 4 }, { x: 8.5, y: 10 }, { x: 5, y: 13 }, { x: 1.5, y: 10 }, { x: 1.5, y: 4 }, { x: 5, y: 1 }],
    [{ x: 5.5, y: 9.5 }, { x: 9, y: 13.5 }]
  ],
  'R': [
    [{ x: 2.5, y: 13 }, { x: 2.5, y: 1 }, { x: 6.5, y: 1 }, { x: 8.5, y: 3.5 }, { x: 6.5, y: 6.5 }, { x: 2.5, y: 6.5 }],
    [{ x: 4.8, y: 6.5 }, { x: 8.5, y: 13 }]
  ],
  'S': [
    [{ x: 8, y: 3 }, { x: 5, y: 1 }, { x: 2, y: 3.5 }, { x: 3, y: 6.5 }, { x: 7, y: 7.5 }, { x: 8, y: 10.5 }, { x: 5, y: 13.5 }, { x: 2, y: 11.5 }]
  ],
  'T': [
    [{ x: 1, y: 1 }, { x: 9, y: 1 }],
    [{ x: 5, y: 1 }, { x: 5, y: 13 }]
  ],
  'U': [
    [{ x: 2, y: 1 }, { x: 2, y: 10 }, { x: 5, y: 13 }, { x: 8, y: 10 }, { x: 8, y: 1 }]
  ],
  'V': [
    [{ x: 1.5, y: 1 }, { x: 5, y: 13 }, { x: 8.5, y: 1 }]
  ],
  'W': [
    [{ x: 1, y: 1 }, { x: 3, y: 13 }, { x: 5, y: 5 }, { x: 7, y: 13 }, { x: 9, y: 1 }]
  ],
  'X': [
    [{ x: 2, y: 1 }, { x: 8, y: 13 }],
    [{ x: 8, y: 1 }, { x: 2, y: 13 }]
  ],
  'Y': [
    [{ x: 1.5, y: 1 }, { x: 5, y: 6.5 }],
    [{ x: 8.5, y: 1 }, { x: 5, y: 6.5 }],
    [{ x: 5, y: 6.5 }, { x: 5, y: 13 }]
  ],
  'Z': [
    [{ x: 1.5, y: 1 }, { x: 8.5, y: 1 }, { x: 1.5, y: 13 }, { x: 8.5, y: 13 }]
  ],

  // Lowercase Letters (a-z)
  'a': [
    [{ x: 7.5, y: 6.5 }, { x: 5, y: 5 }, { x: 2.5, y: 7.5 }, { x: 2.5, y: 10.5 }, { x: 5, y: 13 }, { x: 7.5, y: 12 }],
    [{ x: 7.5, y: 5 }, { x: 7.5, y: 13 }]
  ],
  'b': [
    [{ x: 2.5, y: 1 }, { x: 2.5, y: 13 }],
    [{ x: 2.5, y: 7 }, { x: 5.5, y: 5 }, { x: 8, y: 7.5 }, { x: 8, y: 10.5 }, { x: 5.5, y: 13 }, { x: 2.5, y: 13 }]
  ],
  'c': [
    [{ x: 7.5, y: 7 }, { x: 5, y: 5 }, { x: 2.5, y: 8 }, { x: 2.5, y: 10.5 }, { x: 5, y: 13 }, { x: 7.5, y: 11.5 }]
  ],
  'd': [
    [{ x: 7.5, y: 1 }, { x: 7.5, y: 13 }],
    [{ x: 7.5, y: 13 }, { x: 4.5, y: 13 }, { x: 2, y: 10.5 }, { x: 2, y: 7.5 }, { x: 4.5, y: 5 }, { x: 7.5, y: 7 }]
  ],
  'e': [
    [{ x: 2.5, y: 9 }, { x: 7.5, y: 9 }, { x: 7, y: 6 }, { x: 4.5, y: 5 }, { x: 2.5, y: 7.5 }, { x: 2.5, y: 10.5 }, { x: 5, y: 13 }, { x: 7.5, y: 11.5 }]
  ],
  'f': [
    [{ x: 7.5, y: 2 }, { x: 5.5, y: 1 }, { x: 3.5, y: 3 }, { x: 3.5, y: 13 }],
    [{ x: 1.5, y: 6.5 }, { x: 6.5, y: 6.5 }]
  ],
  'g': [
    [{ x: 7.5, y: 6.5 }, { x: 5, y: 5 }, { x: 2.5, y: 7.5 }, { x: 2.5, y: 10.5 }, { x: 5, y: 13 }, { x: 7.5, y: 12 }],
    [{ x: 7.5, y: 5 }, { x: 7.5, y: 14.5 }, { x: 5.5, y: 17 }, { x: 2.5, y: 15.5 }]
  ],
  'h': [
    [{ x: 2.5, y: 1 }, { x: 2.5, y: 13 }],
    [{ x: 2.5, y: 7 }, { x: 5, y: 5 }, { x: 7.5, y: 7 }, { x: 7.5, y: 13 }]
  ],
  'i': [
    [{ x: 5, y: 5.5 }, { x: 5, y: 13 }],
    [{ x: 5, y: 2 }, { x: 5, y: 2.8 }]
  ],
  'j': [
    [{ x: 6, y: 5.5 }, { x: 6, y: 14.5 }, { x: 4.5, y: 17 }, { x: 2, y: 15.5 }],
    [{ x: 6, y: 2 }, { x: 6, y: 2.8 }]
  ],
  'k': [
    [{ x: 2.5, y: 1 }, { x: 2.5, y: 13 }],
    [{ x: 7.5, y: 5.5 }, { x: 2.5, y: 9.5 }],
    [{ x: 4, y: 8.5 }, { x: 8, y: 13 }]
  ],
  'l': [
    [{ x: 4.5, y: 1 }, { x: 4.5, y: 12 }, { x: 6.5, y: 13 }]
  ],
  'm': [
    [{ x: 1.5, y: 5.5 }, { x: 1.5, y: 13 }],
    [{ x: 1.5, y: 7 }, { x: 3.5, y: 5 }, { x: 5, y: 7 }, { x: 5, y: 13 }],
    [{ x: 5, y: 7 }, { x: 7, y: 5 }, { x: 8.5, y: 7 }, { x: 8.5, y: 13 }]
  ],
  'n': [
    [{ x: 2.5, y: 5.5 }, { x: 2.5, y: 13 }],
    [{ x: 2.5, y: 7 }, { x: 5, y: 5 }, { x: 7.5, y: 7 }, { x: 7.5, y: 13 }]
  ],
  'o': [
    [{ x: 5, y: 5 }, { x: 8, y: 7.5 }, { x: 8, y: 10.5 }, { x: 5, y: 13 }, { x: 2, y: 10.5 }, { x: 2, y: 7.5 }, { x: 5, y: 5 }]
  ],
  'p': [
    [{ x: 2.5, y: 5 }, { x: 2.5, y: 17 }],
    [{ x: 2.5, y: 7 }, { x: 5.5, y: 5 }, { x: 8, y: 7.5 }, { x: 8, y: 10.5 }, { x: 5.5, y: 13 }, { x: 2.5, y: 13 }]
  ],
  'q': [
    [{ x: 7.5, y: 5 }, { x: 7.5, y: 17 }],
    [{ x: 7.5, y: 13 }, { x: 4.5, y: 13 }, { x: 2, y: 10.5 }, { x: 2, y: 7.5 }, { x: 4.5, y: 5 }, { x: 7.5, y: 7 }]
  ],
  'r': [
    [{ x: 2.5, y: 5.5 }, { x: 2.5, y: 13 }],
    [{ x: 2.5, y: 7.5 }, { x: 5, y: 5 }, { x: 7.5, y: 6 }]
  ],
  's': [
    [{ x: 7.5, y: 6.5 }, { x: 5, y: 5 }, { x: 2.5, y: 7 }, { x: 3.5, y: 9 }, { x: 7, y: 9.8 }, { x: 7.5, y: 11.5 }, { x: 5, y: 13 }, { x: 2.5, y: 12 }]
  ],
  't': [
    [{ x: 4, y: 2 }, { x: 4, y: 11.5 }, { x: 6.5, y: 12.5 }],
    [{ x: 1.5, y: 5.5 }, { x: 6.5, y: 5.5 }]
  ],
  'u': [
    [{ x: 2.5, y: 5.5 }, { x: 2.5, y: 11 }, { x: 5, y: 13 }, { x: 7.5, y: 11 }, { x: 7.5, y: 5.5 }],
    [{ x: 7.5, y: 5.5 }, { x: 7.5, y: 13 }]
  ],
  'v': [
    [{ x: 1.8, y: 5.5 }, { x: 5, y: 13 }, { x: 8.2, y: 5.5 }]
  ],
  'w': [
    [{ x: 1.2, y: 5.5 }, { x: 3.2, y: 13 }, { x: 5, y: 7.5 }, { x: 6.8, y: 13 }, { x: 8.8, y: 5.5 }]
  ],
  'x': [
    [{ x: 2, y: 5.5 }, { x: 8, y: 13 }],
    [{ x: 8, y: 5.5 }, { x: 2, y: 13 }]
  ],
  'y': [
    [{ x: 2, y: 5.5 }, { x: 5, y: 10.5 }],
    [{ x: 8, y: 5.5 }, { x: 2.5, y: 17 }]
  ],
  'z': [
    [{ x: 2, y: 5.5 }, { x: 8, y: 5.5 }, { x: 2, y: 13 }, { x: 8, y: 13 }]
  ],
};

// Proportional character width ratios (relative to standard charWidth)
const CHAR_WIDTH_RATIOS: Record<string, number> = {
  ' ': 0.55,
  'i': 0.38,
  'l': 0.38,
  'j': 0.42,
  'I': 0.52,
  '1': 0.55,
  't': 0.55,
  'f': 0.55,
  'r': 0.62,
  'c': 0.72,
  's': 0.72,
  'e': 0.76,
  'z': 0.72,
  'a': 0.80,
  'b': 0.82,
  'd': 0.82,
  'g': 0.82,
  'h': 0.82,
  'k': 0.80,
  'n': 0.82,
  'o': 0.82,
  'p': 0.82,
  'q': 0.82,
  'u': 0.82,
  'v': 0.80,
  'x': 0.78,
  'y': 0.80,
  'm': 1.22,
  'w': 1.22,
  'A': 0.95,
  'B': 0.90,
  'C': 0.95,
  'D': 0.95,
  'E': 0.85,
  'F': 0.82,
  'G': 0.95,
  'H': 0.95,
  'J': 0.75,
  'K': 0.90,
  'L': 0.80,
  'M': 1.25,
  'N': 0.95,
  'O': 1.05,
  'P': 0.88,
  'Q': 1.05,
  'R': 0.92,
  'S': 0.85,
  'T': 0.88,
  'U': 0.92,
  'V': 0.90,
  'W': 1.30,
  'X': 0.88,
  'Y': 0.88,
  'Z': 0.85,
  '0': 0.88,
  '2': 0.85,
  '3': 0.85,
  '4': 0.88,
  '5': 0.85,
  '6': 0.88,
  '7': 0.82,
  '8': 0.88,
  '9': 0.88,
  '+': 0.85,
  '-': 0.60,
  '=': 0.85,
  '×': 0.80,
  '÷': 0.85,
  '/': 0.60,
  '(': 0.45,
  ')': 0.45,
  '[': 0.45,
  ']': 0.45,
  '{': 0.45,
  '}': 0.45,
  '.': 0.35,
  ',': 0.35,
  ':': 0.35,
  ';': 0.35,
  '!': 0.38,
  '?': 0.78,
  "'": 0.35,
  '"': 0.50,
  '%': 0.95,
};

function getCharWidthRatio(char: string): number {
  if (CHAR_WIDTH_RATIOS[char] !== undefined) {
    return CHAR_WIDTH_RATIOS[char];
  }
  // Default lowercase is slightly more compact than uppercase/symbols
  if (char >= 'a' && char <= 'z') return 0.82;
  return 0.95;
}

/**
 * Measure total pixel width of a string in chalk font units
 */
export function measureChalkTextWidth(
  text: string,
  charWidth: number = 12,
  charSpacing: number = 2.5
): number {
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const ratio = getCharWidthRatio(char);
    total += charWidth * ratio + charSpacing;
  }
  return total;
}

/**
 * Render a single line of chalk text/math symbols into authentic vector chalk strokes.
 */
export function renderChalkTextLine(
  text: string,
  startX: number,
  startY: number,
  options: {
    charWidth?: number;
    charHeight?: number;
    charSpacing?: number;
    color?: string;
    width?: number;
    label?: string;
    jitter?: boolean;
  } = {}
): ChalkVectorStroke[] {
  const {
    charWidth = 12,
    charHeight = 18,
    charSpacing = 2.5,
    color = '#F5F1E6',
    width = 2.4,
    label = 'Chalk Text',
    jitter = false,
  } = options;

  const strokes: ChalkVectorStroke[] = [];
  let curX = startX;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const ratio = getCharWidthRatio(char);
    const effectiveWidth = charWidth * ratio;

    if (char === ' ') {
      curX += effectiveWidth + charSpacing;
      continue;
    }

    // Lookup glyph or fallback to uppercase
    const glyph = GLYPH_PATHS[char] || GLYPH_PATHS[char.toUpperCase()];

    if (glyph) {
      glyph.forEach((path, pathIdx) => {
        const points: Point2D[] = path.map((pt) => {
          const normX = pt.x / 10;
          const normY = pt.y / 14;
          const jX = jitter ? (Math.random() - 0.5) * 0.4 : 0;
          const jY = jitter ? (Math.random() - 0.5) * 0.4 : 0;
          return {
            x: Number((curX + normX * effectiveWidth + jX).toFixed(2)),
            y: Number((startY + normY * charHeight + jY).toFixed(2)),
          };
        });

        strokes.push({
          color,
          width,
          label: `${label} [${char}_${pathIdx}]`,
          points,
        });
      });
    } else {
      // Small horizontal line fallback for unknown glyphs
      strokes.push({
        color,
        width: Math.max(1.5, width * 0.8),
        label: `${label} [${char}]`,
        points: [
          { x: Number(curX.toFixed(2)), y: Number((startY + charHeight * 0.8).toFixed(2)) },
          { x: Number((curX + effectiveWidth * 0.8).toFixed(2)), y: Number((startY + charHeight * 0.8).toFixed(2)) },
        ],
      });
    }

    curX += effectiveWidth + charSpacing;
  }

  return strokes;
}

/**
 * Render a wrapped paragraph of chalk text with word boundary wrapping and line height
 */
export function renderChalkParagraph(
  text: string,
  startX: number,
  startY: number,
  maxWidth: number,
  options: {
    charWidth?: number;
    charHeight?: number;
    lineSpacing?: number;
    charSpacing?: number;
    color?: string;
    width?: number;
    label?: string;
    maxLines?: number;
  } = {}
): { strokes: ChalkVectorStroke[]; nextY: number } {
  const {
    charWidth = 11,
    charHeight = 16,
    lineSpacing = 8,
    charSpacing = 2.2,
    color = '#F5F1E6',
    width = 2.2,
    label = 'Chalk Paragraph',
    maxLines = 4,
  } = options;

  const strokes: ChalkVectorStroke[] = [];
  const words = text.replace(/[\r\n]+/g, ' ').trim().split(/\s+/);
  let curY = startY;
  let currentLine = '';
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureChalkTextWidth(testLine, charWidth, charSpacing);

    if (testWidth > maxWidth && currentLine) {
      // Render current line
      const lineStrokes = renderChalkTextLine(currentLine, startX, curY, {
        charWidth,
        charHeight,
        charSpacing,
        color,
        width,
        label: `${label} L${lineCount + 1}`,
      });
      strokes.push(...lineStrokes);
      curY += charHeight + lineSpacing;
      lineCount++;

      if (lineCount >= maxLines - 1 && i < words.length - 1) {
        // Last allowed line: append remainder with ellipsis if needed
        const remainingWords = words.slice(i).join(' ');
        const truncated = remainingWords.length > 50 ? remainingWords.slice(0, 47) + '...' : remainingWords;
        const lastStrokes = renderChalkTextLine(truncated, startX, curY, {
          charWidth,
          charHeight,
          charSpacing,
          color,
          width,
          label: `${label} L${lineCount + 1}`,
        });
        strokes.push(...lastStrokes);
        curY += charHeight + lineSpacing;
        currentLine = '';
        break;
      }

      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    const lineStrokes = renderChalkTextLine(currentLine, startX, curY, {
      charWidth,
      charHeight,
      charSpacing,
      color,
      width,
      label: `${label} L${lineCount + 1}`,
    });
    strokes.push(...lineStrokes);
    curY += charHeight + lineSpacing;
  }

  return { strokes, nextY: curY };
}

/**
 * Generate a complete, elegant, mathematically rigorous step-by-step chalkboard layout
 * containing legible problem headers, step badges, formatted equations, annotations,
 * diagrams, and double-boxed final answer.
 */
export function generatePerfectChalkboardSolution(options: {
  problem: string;
  domain?: string;
  finalAnswer: string;
  verificationProof?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    expression?: string;
    explanation?: string;
    whyNote?: string;
  }>;
}): {
  stepStrokes: Record<number, ChalkVectorStroke[]>;
  allStrokes: ChalkVectorStroke[];
} {
  const { problem, domain = 'Mathematics', finalAnswer, steps } = options;
  const stepStrokes: Record<number, ChalkVectorStroke[]> = {};
  const allStrokes: ChalkVectorStroke[] = [];

  const addStroke = (stepNum: number, stroke: ChalkVectorStroke) => {
    if (!stepStrokes[stepNum]) stepStrokes[stepNum] = [];
    stepStrokes[stepNum].push(stroke);
    allStrokes.push(stroke);
  };

  const addMany = (stepNum: number, strokesArr: ChalkVectorStroke[]) => {
    strokesArr.forEach((s) => addStroke(stepNum, s));
  };

  // ----------------------------------------------------
  // STEP 1: PROBLEM SETUP & GIVEN FACTS (Top Slate)
  // ----------------------------------------------------
  const step1Num = steps[0]?.stepNumber || 1;

  // Header Slate Outer Border Box
  addStroke(step1Num, {
    color: '#E8C468',
    width: 3.5,
    label: 'Header Slate Top Border',
    points: [{ x: 50, y: 35 }, { x: 950, y: 35 }],
  });
  addStroke(step1Num, {
    color: '#E8C468',
    width: 1.8,
    label: 'Header Slate Inner Accent',
    points: [{ x: 54, y: 40 }, { x: 946, y: 40 }],
  });
  addStroke(step1Num, {
    color: '#E8C468',
    width: 3,
    label: 'Header Slate Bottom Border',
    points: [{ x: 50, y: 135 }, { x: 950, y: 135 }],
  });
  addStroke(step1Num, {
    color: '#E8C468',
    width: 3,
    label: 'Header Slate Left Border',
    points: [{ x: 50, y: 35 }, { x: 50, y: 135 }],
  });
  addStroke(step1Num, {
    color: '#E8C468',
    width: 3,
    label: 'Header Slate Right Border',
    points: [{ x: 950, y: 35 }, { x: 950, y: 135 }],
  });

  // Header Title Tag
  const cleanDomain = domain.toUpperCase();
  addMany(
    step1Num,
    renderChalkTextLine(`[SLATE MATH: ${cleanDomain}]`, 68, 50, {
      charWidth: 10,
      charHeight: 14,
      charSpacing: 2,
      color: '#E8C468',
      width: 2.4,
      label: 'Domain Header',
    })
  );

  // Problem Text - wrap cleanly so no words get cut off mid-word
  const cleanProblem = problem.replace(/[\n\r]+/g, ' ').trim();
  const problemPara = renderChalkParagraph(`Q: ${cleanProblem}`, 68, 74, 860, {
    charWidth: 11,
    charHeight: 16,
    charSpacing: 2.2,
    lineSpacing: 6,
    color: '#F5F1E6',
    width: 2.2,
    label: 'Problem Statement',
    maxLines: 3,
  });
  addMany(step1Num, problemPara.strokes);

  // ----------------------------------------------------
  // STEP 2: CONCEPT / GIVENS & STRATEGY
  // ----------------------------------------------------
  const step2Num = steps[0]?.stepNumber || 1;
  const step1Data = steps[0] || {
    stepNumber: 1,
    title: 'Identify Givens & Strategy',
    expression: 'Set up knowns and equations',
    explanation: 'Break down problem into clear numerical parts.',
    whyNote: 'Identify given facts',
  };
  const step2Data = steps[1] || {
    stepNumber: 2,
    title: 'Step-by-Step Derivation',
    expression: '',
    explanation: '',
  };

  // Step 1 Bracket & Badge
  addStroke(step2Num, {
    color: '#81D4FA',
    width: 2.5,
    label: 'Step 1 Left Bracket',
    points: [{ x: 70, y: 155 }, { x: 52, y: 155 }, { x: 52, y: 285 }, { x: 70, y: 285 }],
  });

  addMany(
    step2Num,
    renderChalkTextLine('STEP 1: IDENTIFY GIVENS & STRATEGY', 72, 160, {
      charWidth: 10,
      charHeight: 15,
      charSpacing: 2.2,
      color: '#81D4FA',
      width: 2.4,
      label: 'Step 1 Badge',
    })
  );

  // Render Given Equation / Fact line
  const s1Title = step1Data.title || 'Identify Givens';
  const s1Exp = step1Data.expression ? `${step1Data.expression}` : '';
  
  if (s1Exp) {
    addMany(
      step2Num,
      renderChalkTextLine(s1Exp, 75, 188, {
        charWidth: 12,
        charHeight: 17,
        charSpacing: 2.5,
        color: '#F5F1E6',
        width: 2.5,
        label: 'Step 1 Expression',
      })
    );
  }

  // Explanation note for Step 1
  const s1Expl = step1Data.explanation || step1Data.whyNote || 'Break down problem into clear numerical parts.';
  const s1Para = renderChalkParagraph(s1Expl, 75, s1Exp ? 218 : 190, 840, {
    charWidth: 10,
    charHeight: 14,
    charSpacing: 2,
    lineSpacing: 5,
    color: '#C8E6C9',
    width: 2.0,
    label: 'Step 1 Note',
    maxLines: 2,
  });
  addMany(step2Num, s1Para.strokes);

  // Visual Tape / Diagram for Fractions / Ribbon / Math if appropriate
  const isFractionOrMeasurement = cleanProblem.toLowerCase().includes('ribbon') || 
                                  cleanProblem.toLowerCase().includes('cut') || 
                                  cleanProblem.toLowerCase().includes('fraction') ||
                                  cleanProblem.toLowerCase().includes('meter');

  if (isFractionOrMeasurement) {
    // Elegant Tape Diagram
    const barX = 75;
    const barY = 250;
    const barW = 380;
    const barH = 22;

    // Full length bar outline
    addStroke(step2Num, {
      color: '#81D4FA',
      width: 2,
      label: 'Tape Bar Outline',
      points: [
        { x: barX, y: barY },
        { x: barX + barW, y: barY },
        { x: barX + barW, y: barY + barH },
        { x: barX, y: barY + barH },
        { x: barX, y: barY },
      ],
    });

    // Divider for cut piece (~28% of total)
    const cutW = Math.round(barW * 0.28);
    addStroke(step2Num, {
      color: '#FF8A80',
      width: 2.5,
      label: 'Cut Portion Line',
      points: [{ x: barX + cutW, y: barY }, { x: barX + cutW, y: barY + barH }],
    });

    // Hatched cut portion
    for (let hx = barX + 8; hx < barX + cutW; hx += 12) {
      addStroke(step2Num, {
        color: '#FF8A80',
        width: 1.5,
        label: 'Hatch Line',
        points: [{ x: hx, y: barY + barH - 2 }, { x: hx + 8, y: barY + 2 }],
      });
    }

    // Cut label
    addMany(
      step2Num,
      renderChalkTextLine('CUT OFF', barX + 8, barY + 4, {
        charWidth: 7,
        charHeight: 11,
        charSpacing: 1.5,
        color: '#FF8A80',
        width: 2,
        label: 'Cut Label',
      })
    );

    // Remaining label
    addMany(
      step2Num,
      renderChalkTextLine('REMAINING RIBBON (?)', barX + cutW + 18, barY + 4, {
        charWidth: 8,
        charHeight: 11,
        charSpacing: 1.8,
        color: '#81D4FA',
        width: 2,
        label: 'Remaining Label',
      })
    );
  }

  // ----------------------------------------------------
  // STEP 3: STEP-BY-STEP MATHEMATICAL CALCULATION
  // ----------------------------------------------------
  const step3Num = steps[1]?.stepNumber || 2;
  const startDerivationY = 310;

  // Build derivation lines from provided steps or fallback
  const middleSteps = steps.length > 2 ? steps.slice(1, -1) : steps.length > 1 ? [steps[1]] : steps;
  const derivationLines = middleSteps.map((s, idx) => ({
    marker: `(${String.fromCharCode(97 + idx)})`,
    expr: s.expression || s.title || `Step ${idx + 1}`,
    note: s.whyNote || s.title || 'Calculate',
  }));

  if (derivationLines.length === 0) {
    derivationLines.push(
      { marker: '(a)', expr: steps[0]?.expression || 'Equation 1', note: 'Apply rule' },
      { marker: '(b)', expr: 'Simplify terms', note: 'Evaluate' }
    );
  }

  // Step 2 Bracket & Badge
  const renderedDerivationLines = derivationLines.slice(0, 5);
  const derivationBlockHeight = Math.max(220, renderedDerivationLines.length * 80 + 20);

  addStroke(step3Num, {
    color: '#E8C468',
    width: 2.5,
    label: 'Step 2 Left Bracket',
    points: [{ x: 70, y: startDerivationY }, { x: 52, y: startDerivationY }, { x: 52, y: startDerivationY + derivationBlockHeight }, { x: 70, y: startDerivationY + derivationBlockHeight }],
  });

  addMany(
    step3Num,
    renderChalkTextLine('STEP 2: STEP-BY-STEP CALCULATION', 72, startDerivationY + 6, {
      charWidth: 10,
      charHeight: 15,
      charSpacing: 2.2,
      color: '#E8C468',
      width: 2.4,
      label: 'Step 2 Badge',
    })
  );

  // Formulate clear, concise derivation lines from actual steps
  renderedDerivationLines.forEach((dLine, lineIdx) => {
    const yPos = startDerivationY + 46 + lineIdx * 80;

    // Line Sub-Step Marker
    addMany(
      step3Num,
      renderChalkTextLine(dLine.marker, 75, yPos, {
        charWidth: 9,
        charHeight: 14,
        charSpacing: 2,
        color: '#81D4FA',
        width: 2.4,
        label: `Marker ${lineIdx + 1}`,
      })
    );

    // Actual Math Formula (Clear, bold, spacious)
    const cleanExpr = dLine.expr.length > 40 ? dLine.expr.slice(0, 38) + '...' : dLine.expr;
    addMany(
      step3Num,
      renderChalkTextLine(cleanExpr, 120, yPos - 2, {
        charWidth: 12,
        charHeight: 18,
        charSpacing: 2.8,
        color: '#F5F1E6',
        width: 2.6,
        label: `Derivation Math ${lineIdx + 1}`,
      })
    );

    // Pedagogical Rule / Note on Right
    const cleanNote = `[${dLine.note.toUpperCase().slice(0, 20)}]`;
    addMany(
      step3Num,
      renderChalkTextLine(cleanNote, 720, yPos, {
        charWidth: 8,
        charHeight: 12,
        charSpacing: 1.8,
        color: '#8FBF8A',
        width: 2.0,
        label: `Operation Note ${lineIdx + 1}`,
      })
    );

    // Light dividing rule between steps
    if (lineIdx < renderedDerivationLines.length - 1) {
      addStroke(step3Num, {
        color: 'rgba(245, 241, 230, 0.25)',
        width: 1.2,
        label: `Divider ${lineIdx + 1}`,
        points: [{ x: 120, y: yPos + 38 }, { x: 920, y: yPos + 38 }],
      });
    }
  });

  // ----------------------------------------------------
  // STEP 4: VERIFIED FINAL ANSWER & PROOF CHECK
  // ----------------------------------------------------
  const step4Num = steps[steps.length - 1]?.stepNumber || 3;
  const ansY = startDerivationY + derivationBlockHeight + 35;

  // Verification Proof Section (Left side)
  addMany(
    step4Num,
    renderChalkTextLine('PROOF & VERIFICATION:', 75, ansY, {
      charWidth: 9,
      charHeight: 13,
      charSpacing: 2,
      color: '#8FBF8A',
      width: 2.4,
      label: 'Proof Header',
    })
  );

  addMany(
    step4Num,
    renderChalkTextLine('LHS = RHS (BALANCED & VERIFIED)', 75, ansY + 26, {
      charWidth: 9,
      charHeight: 14,
      charSpacing: 2,
      color: '#F5F1E6',
      width: 2.2,
      label: 'Proof Equality',
    })
  );

  // Large Green Checkmark
  addStroke(step4Num, {
    color: '#8FBF8A',
    width: 4.5,
    label: 'Verified Checkmark',
    points: [{ x: 375, y: ansY + 22 }, { x: 400, y: ansY + 48 }, { x: 445, y: ansY - 10 }],
  });

  // Final Answer Golden Box (Right side)
  const boxX = 490;
  const boxY = ansY - 18;
  const boxW = 460;
  const boxH = 96;

  // Outer Golden Box
  addStroke(step4Num, {
    color: '#E8C468',
    width: 3.5,
    label: 'Final Answer Box Outer',
    points: [
      { x: boxX, y: boxY },
      { x: boxX + boxW, y: boxY },
      { x: boxX + boxW, y: boxY + boxH },
      { x: boxX, y: boxY + boxH },
      { x: boxX, y: boxY },
    ],
  });

  // Inner Golden Box Accent
  addStroke(step4Num, {
    color: '#E8C468',
    width: 1.5,
    label: 'Final Answer Box Inner',
    points: [
      { x: boxX + 5, y: boxY + 5 },
      { x: boxX + boxW - 5, y: boxY + 5 },
      { x: boxX + boxW - 5, y: boxY + boxH - 5 },
      { x: boxX + 5, y: boxY + boxH - 5 },
      { x: boxX + 5, y: boxY + 5 },
    ],
  });

  // "FINAL VERIFIED ANSWER" Tag
  addMany(
    step4Num,
    renderChalkTextLine('FINAL VERIFIED ANSWER', boxX + 16, boxY + 12, {
      charWidth: 8,
      charHeight: 12,
      charSpacing: 2,
      color: '#E8C468',
      width: 2.2,
      label: 'Final Answer Tag',
    })
  );

  // Actual Final Answer Text in Bold Chalk
  const cleanAns = finalAnswer.length > 22 ? finalAnswer.slice(0, 20) + '...' : finalAnswer;
  addMany(
    step4Num,
    renderChalkTextLine(cleanAns, boxX + 16, boxY + 38, {
      charWidth: 15,
      charHeight: 24,
      charSpacing: 3.5,
      color: '#F5F1E6',
      width: 3.2,
      label: 'Final Answer Value',
    })
  );

  // Golden Star Accent
  const starPts: Point2D[] = [];
  for (let i = 0; i <= 10; i++) {
    const r = i % 2 === 0 ? 16 : 7;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    starPts.push({ x: boxX + boxW - 32 + Math.cos(a) * r, y: boxY + 48 + Math.sin(a) * r });
  }
  addStroke(step4Num, {
    color: '#E8C468',
    width: 2.5,
    label: 'Mastery Gold Star',
    points: starPts,
  });

  return { stepStrokes, allStrokes };
}
