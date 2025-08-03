
export enum NodeType {
  Input = "Input",
  Output = "Output",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  XOR = "XOR",
  NAND = "NAND",
  NOR = "NOR",
  XNOR = "XNOR",
}

export enum LevelCategory {
  Basic = "Basic",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Random = "Random", // Added Random category
}

export interface LogicNode {
  id: string;
  type: NodeType;
  label: string;
  x?: number; // Optional: for pre-defined positions or calculated layout
  y?: number; // Optional
  row?: number; // Optional: for grid-based layout
  col?: number; // Optional: for grid-based layout
}

export interface Connection {
  from: string; // ID of the source node
  to: string;   // ID of the destination node
  targetPort?: string; // Optional: for gates with multiple inputs, e.g., 'input1', 'input2'
}

export interface Level {
  levelId: string;
  levelName: string;
  levelDescription: string;
  category: LevelCategory; 
  nodes: Node[];
  connections: Connection[];
  initialInputs: Record<string, boolean>; // { inputNodeId: value }
  targetOutputs: Record<string, boolean>; // { outputNodeId: value }
  grid?: { // Optional: for grid-based layout
    rows: number;
    cols: number;
  };
  constraints?: {
    maxGates?: number;
    allowedGates?: NodeType[];
  };
  starRatings?: { // Moves for each star rating
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

export interface CircuitNode extends Node {
  value?: boolean; // Current logical value of the node
  isTargetMet?: boolean; // For output nodes
  inputValues?: { [port: string]: boolean }; // For multi-input gates
}

export interface UserProgress {
  completedLevels: Record<string, { stars: number }>; // levelId: { stars achieved }
  awardedAchievements?: Record<string, boolean>; // achievementId: true if awarded
  // Potentially custom sandbox circuits could be stored here too
}

export interface Level {
  // ...todas as outras propriedades existentes...
  levelId: string;
  levelName: string;
  nodes: CircuitNode[];
  connections: Connection[];
  initialInputs: Record<string, boolean>;
  targetOutputs: Record<string, boolean>;
  
  // Adicione a propriedade pop_up
  pop_up?: {
    text: string;
  };
}