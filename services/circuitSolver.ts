
import { Node, Connection, NodeType, CircuitNode } from '../types';
import { GATE_PROPERTIES } from '../constants';

export const calculateGateOutput = (type: NodeType, inputs: boolean[]): boolean => {
  if (type === NodeType.Input || type === NodeType.Output) {
    return inputs[0] ?? false;
  }

  const [in1, in2] = inputs; // Most gates use 1 or 2 inputs

  switch (type) {
    case NodeType.AND:
      return (in1 === true) && (in2 === true);
    case NodeType.OR:
      return (in1 === true) || (in2 === true);
    case NodeType.NOT:
      return !(in1 === true);
    case NodeType.XOR:
      return (in1 === true) !== (in2 === true);
    case NodeType.NAND:
      return !((in1 === true) && (in2 === true));
    case NodeType.NOR:
      return !((in1 === true) || (in2 === true));
    case NodeType.XNOR:
      return (in1 === true) === (in2 === true);
    default:
      return false;
  }
};

export const simulateCircuit = (
  levelNodes: Node[],
  connections: Connection[],
  currentInputValues: Record<string, boolean>
): Record<string, CircuitNode> => {
  const circuitState: Record<string, CircuitNode> = {};

  // Initialize all nodes
  levelNodes.forEach(node => {
    circuitState[node.id] = { ...node, value: false, inputValues: {} };
    if (node.type === NodeType.Input) {
      circuitState[node.id].value = currentInputValues[node.id] ?? false;
    }
  });

  // Iteratively update gate states
  const maxIterations = levelNodes.length * 2; 
  for (let i = 0; i < maxIterations; i++) {
    let changed = false;
    levelNodes.forEach(node => {
      if (node.type === NodeType.Input) {
        // Inputs are set by currentInputValues and don't change based on other nodes.
        return;
      }

      const incomingConnections = connections.filter(conn => conn.to === node.id);
      const inputValuesForCalculation: boolean[] = []; // Values for calculateGateOutput
      const nodeInputStatesDisplay: { [key: string]: boolean } = {}; // For UI/debug state

      const expectedNumInputs = GATE_PROPERTIES[node.type]?.inputs;

      if (expectedNumInputs === 1) { // For NOT, Output
        const sourceNodeId = incomingConnections[0]?.from;
        let val = false; // Default to false if no input connected or source undefined
        if (sourceNodeId && circuitState[sourceNodeId]?.value !== undefined) {
            val = circuitState[sourceNodeId].value!;
        }
        inputValuesForCalculation.push(val);
        if (sourceNodeId) nodeInputStatesDisplay['input1'] = val; 
      
      } else if (expectedNumInputs === 2) { // For AND, OR, XOR, NAND, NOR, XNOR
        let s1_calc_val: boolean = false; // Default to false for calculation
        let s2_calc_val: boolean = false;

        // Try to assign inputs based on targetPort first
        let sourceForInput1: string | undefined = incomingConnections.find(c => c.targetPort === 'input1')?.from;
        let sourceForInput2: string | undefined = incomingConnections.find(c => c.targetPort === 'input2')?.from;
        
        // Fill from untargeted connections if ports are not fully specified by targetPort
        const untargeted = incomingConnections.filter(c => !c.targetPort);

        if (!sourceForInput1 && untargeted.length > 0) {
            sourceForInput1 = untargeted[0].from;
        }
        
        // For sourceForInput2, if not set by targetPort, pick an untargeted connection
        // that is different from sourceForInput1 (if sourceForInput1 also came from untargeted)
        if (!sourceForInput2) {
            const firstUntargeted = untargeted[0];
            const secondUntargeted = untargeted[1];

            if (sourceForInput1 === firstUntargeted?.from && secondUntargeted) {
                // sourceForInput1 took the first untargeted, sourceForInput2 takes the second (if it exists)
                sourceForInput2 = secondUntargeted.from;
            } else if (sourceForInput1 !== firstUntargeted?.from && firstUntargeted) {
                // sourceForInput1 was from targetPort or not the first untargeted; sourceForInput2 takes the first untargeted (if it exists)
                sourceForInput2 = firstUntargeted.from;
            }
        }
        
        if (sourceForInput1 && circuitState[sourceForInput1]?.value !== undefined) {
            s1_calc_val = circuitState[sourceForInput1].value!;
            nodeInputStatesDisplay['input1'] = s1_calc_val;
        }
        if (sourceForInput2 && circuitState[sourceForInput2]?.value !== undefined) {
            s2_calc_val = circuitState[sourceForInput2].value!;
            nodeInputStatesDisplay['input2'] = s2_calc_val;
        }
        inputValuesForCalculation.push(s1_calc_val);
        inputValuesForCalculation.push(s2_calc_val);
      }
      // else if (expectedNumInputs === 0), inputValuesForCalculation remains empty.
      // Future: else if (expectedNumInputs > 2), this logic would need extension.

      // Calculate the output for the current gate/output node.
      // inputValuesForCalculation will contain booleans (true/false), defaulting to false for unresolved/unconnected inputs.
      const currentCalculatedValue = calculateGateOutput(node.type, inputValuesForCalculation);
      if (circuitState[node.id].value !== currentCalculatedValue) {
        circuitState[node.id].value = currentCalculatedValue;
        changed = true;
      }
      circuitState[node.id].inputValues = nodeInputStatesDisplay;
    });

    if (!changed) break; // Stable state
  }

  return circuitState;
};
