
import { NodeType, LevelCategory } from './types';

export const GATE_PROPERTIES: Record<NodeType, { inputs: number }> = {
  [NodeType.AND]: { inputs: 2 },
  [NodeType.OR]: { inputs: 2 },
  [NodeType.NOT]: { inputs: 1 },
  [NodeType.XOR]: { inputs: 2 },
  [NodeType.NAND]: { inputs: 2 },
  [NodeType.NOR]: { inputs: 2 },
  [NodeType.XNOR]: { inputs: 2 },
  [NodeType.Input]: { inputs: 0 }, // Inputs don't take logical inputs, they provide output
  [NodeType.Output]: { inputs: 1 }, // Outputs take one logical input
};

export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.Input]: 'bg-sky-500',
  [NodeType.Output]: 'bg-emerald-500',
  [NodeType.AND]: 'bg-red-500',
  [NodeType.OR]: 'bg-orange-500',
  [NodeType.NOT]: 'bg-purple-500',
  [NodeType.XOR]: 'bg-yellow-500 text-slate-800',
  [NodeType.NAND]: 'bg-rose-500',
  [NodeType.NOR]: 'bg-amber-500',
  [NodeType.XNOR]: 'bg-pink-500', 
};

// NODE_SIZE is now the default/fallback for non-grid layouts,
// or a reference for aspect ratio in grid layouts.
export const NODE_SIZE = { width: 60, height: 80 }; 
export const CANVAS_PADDING = 20;

export const CELL_PADDING_FACTOR = 0.1; // e.g., 10% padding inside a cell for a node

// Adjusted based on new NODE_SIZE and reduced extra margins
export const LEVEL_AREA_HEIGHT_ALLOCATION = {
  TOP_OUTPUTS: NODE_SIZE.height + 10, 
  BOTTOM_INPUTS: NODE_SIZE.height + 20, 
};

export const WIRE_COLOR_ACTIVE = '#34d399'; // emerald-400
export const WIRE_COLOR_INACTIVE = '#64748b'; // slate-500

export const UNLOCK_THRESHOLD_PERCENTAGE = 0.8; // 80%

export const LEVEL_CATEGORY_NAMES: Record<LevelCategory, string> = {
  [LevelCategory.Basic]: "Basic Circuits",
  [LevelCategory.Intermediate]: "Intermediate Challenges",
  [LevelCategory.Advanced]: "Advanced Puzzles",
  [LevelCategory.Random]: "Random Challenges", // Added Random category name
};

// Achievement IDs from games-ids.xml
export const ACHIEVEMENT_ID_THIS_IS_NOT_HOW_IT_WORKS = "CgkIoqOdjqsOEAIQAA";
export const ACHIEVEMENT_ID_AND_HERE_WE_GO = "CgkIoqOdjqsOEAIQAQ";
export const ACHIEVEMENT_ID_THIS_OR_THAT_DOESNT_MATTER = "CgkIoqOdjqsOEAIQAg";
export const ACHIEVEMENT_ID_UNLOCK_INTERMEDIATE = "CgkIoqOdjqsOEAIQBA";

// Map specific level IDs to achievements for first-time completion
export const LEVEL_TRIGGERED_ACHIEVEMENTS: Record<string, string> = {
  "level_basic_001": ACHIEVEMENT_ID_THIS_IS_NOT_HOW_IT_WORKS, // First NOT gate level
  "level_basic_009": ACHIEVEMENT_ID_AND_HERE_WE_GO,       // First AND gate level
  "level_basic_033": ACHIEVEMENT_ID_THIS_OR_THAT_DOESNT_MATTER, // First OR gate level
};
