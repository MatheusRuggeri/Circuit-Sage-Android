import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, BackHandler } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Level, CircuitNode, NodeType, Connection, LogicNode } from '../../types'; // Assuming types are in the same relative path
import { simulateCircuit } from '../../services/circuitSolver'; // Assuming services are in the same relative path
import CircuitNodeDisplay from '../canvas/CircuitNodeDisplay'; // This component also needs to be converted
import WireDisplay from '../canvas/WireDisplay'; // This component also needs to be converted
import { NODE_SIZE, CANVAS_PADDING, LEVEL_AREA_HEIGHT_ALLOCATION, CELL_PADDING_FACTOR } from '../../constants'; // Assuming constants are in the same relative path

// Props interface remains the same
interface LevelDisplayProps {
  level: Level;
  onBackToLevels: () => void;
  onLevelComplete: (levelId: string, stars: number) => void;
  initialUserProgressStars?: number;
  onNavigateToNextLevel: () => void;
}

// Converted SVG Star Icon to use react-native-svg
const StarIcon: React.FC<{ style?: object }> = ({ style }) => (
  <Svg viewBox="0 0 20 20" style={[styles.starIconBase, style]}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
      clipRule="evenodd"
    />
  </Svg>
);


const LevelDisplay: React.FC<LevelDisplayProps> = ({
  level,
  onBackToLevels,
  onLevelComplete,
  initialUserProgressStars,
  onNavigateToNextLevel,
}) => {
  // State management remains largely the same
  const [inputStates, setInputStates] = useState<Record<string, boolean>>(level.initialInputs);
  const [simulatedNodes, setSimulatedNodes] = useState<Record<string, CircuitNode>>({});
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isCompletedThisAttempt, setIsCompletedThisAttempt] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  // canvasSize will be updated by onLayout event
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [currentNodeDimensions, setCurrentNodeDimensions] = useState({ width: NODE_SIZE.width, height: NODE_SIZE.height });
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [starsEarnedInModal, setStarsEarnedInModal] = useState(0);


  // ====== NOVO ESTADO PARA O POP-UP INFORMATIVO ======
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  // ====================================================

  // This function replaces the ref-based size update.
  // It's called by the `onLayout` prop of the game area View.
  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (canvasSize.width !== width || canvasSize.height !== height) {
      setCanvasSize({ width, height });
    }
  };

  // Makes the return Key to return to other screen instead of closing the app
  useEffect(() => {
    // This function will be called when the back button is pressed
    const handleBackPress = () => {
      onBackToLevels(); // Call your existing function to go back
      return true;      // Prevent default behavior (closing the app)
    };

    // Add the event listener when the component mounts
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    // Remove the event listener when the component unmounts
    return () => backHandler.remove();
  }, [onBackToLevels]); // Re-run effect if onBackToLevels changes


  // Reset logic is the same
  useEffect(() => {
    setInputStates(level.initialInputs);
    setMoveCount(0);
    setIsCompletedThisAttempt(false);
    setIsCompletionModalOpen(false);
	
    // ====== LÓGICA PARA EXIBIR O POP-UP INFORMATIVO ======
    // Verifica se o objeto pop_up existe e se o texto não está vazio
    if (level.pop_up && level.pop_up.text && level.pop_up.text.trim() !== '') {
      setIsInfoModalOpen(true); // Abre o modal se houver texto
    }
    // ========================================================
  }, [level]);

  // The core logic for positioning nodes remains identical,
  // it just depends on canvasSize which is now set by `onLayout`.
  useEffect(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;

    const { nodes } = level;
    const positions: Record<string, { x: number; y: number }> = {};
    const margin = CANVAS_PADDING;
    
    let dynamicNodeWidth = NODE_SIZE.width;
    let dynamicNodeHeight = NODE_SIZE.height;

    if (level.grid && level.nodes.every(n => typeof n.row === 'number' && typeof n.col === 'number')) {
      const { rows: gridRows, cols: gridCols } = level.grid;
      if (gridRows <=0 || gridCols <=0) {
        setCurrentNodeDimensions({ width: NODE_SIZE.width, height: NODE_SIZE.height });
      } else {
        const availablePlotWidth = canvasSize.width - 2 * margin;
        const availablePlotHeight = canvasSize.height - 2 * margin;
        const cellWidth = availablePlotWidth / gridCols;
        const cellHeight = availablePlotHeight / gridRows;
        const nodeAspectRatio = NODE_SIZE.width / NODE_SIZE.height;
        const maxAllowedNodeWidth = cellWidth * (1 - (CELL_PADDING_FACTOR * 2));
        const maxAllowedNodeHeight = cellHeight * (1 - (CELL_PADDING_FACTOR * 2));

        if (maxAllowedNodeWidth / nodeAspectRatio <= maxAllowedNodeHeight) {
            dynamicNodeWidth = maxAllowedNodeWidth;
            dynamicNodeHeight = maxAllowedNodeWidth / nodeAspectRatio;
        } else {
            dynamicNodeHeight = maxAllowedNodeHeight;
            dynamicNodeWidth = maxAllowedNodeHeight * nodeAspectRatio;
        }
        dynamicNodeWidth = Math.max(30, dynamicNodeWidth);
        dynamicNodeHeight = Math.max(30, dynamicNodeHeight);
        setCurrentNodeDimensions({ width: dynamicNodeWidth, height: dynamicNodeHeight });

        nodes.forEach(node => {
          // ==================== ALTERAÇÃO AQUI ====================
          // Garante que as propriedades existem
          if (typeof node.row !== 'number' || typeof node.col !== 'number') return;
          
          // Validação para coordenadas 1-based
          if (node.col > gridCols || node.row > gridRows || node.col < 1 || node.row < 1) return;

          // Calcula a posição Y invertendo a 'row' e ajustando para 1-based.
          // (gridRows - node.row) faz com que a row 1 fique na base.
          const yPos = margin + (gridRows - node.row) * cellHeight + (cellHeight - dynamicNodeHeight) / 2;
          
          // Calcula a posição X ajustando para 1-based (node.col - 1).
          const xPos = margin + (node.col - 1) * cellWidth + (cellWidth - dynamicNodeWidth) / 2;
          
          positions[node.id] = {
            x: xPos,
            y: yPos,
          };
          // ================= FIM DA ALTERAÇÃO ===================
        });
      }
    } else {
      // The rest of the positioning logic is the same as the original.
      setCurrentNodeDimensions({ width: NODE_SIZE.width, height: NODE_SIZE.height });
      dynamicNodeWidth = NODE_SIZE.width; 
      dynamicNodeHeight = NODE_SIZE.height;
      const availableWidth = canvasSize.width - 2 * margin;
      const availableHeightForGates = canvasSize.height - LEVEL_AREA_HEIGHT_ALLOCATION.TOP_OUTPUTS - LEVEL_AREA_HEIGHT_ALLOCATION.BOTTOM_INPUTS - 2 * margin;
      const inputNodes = nodes.filter(n => n.type === NodeType.Input);
      const outputNodes = nodes.filter(n => n.type === NodeType.Output);
      const gateNodes = nodes.filter(n => ![NodeType.Input, NodeType.Output].includes(n.type));

      inputNodes.forEach((node, index) => {
        positions[node.id] = {
          x: margin + (index * (availableWidth - dynamicNodeWidth)) / Math.max(1, inputNodes.length - 1),
          y: canvasSize.height - LEVEL_AREA_HEIGHT_ALLOCATION.BOTTOM_INPUTS + (LEVEL_AREA_HEIGHT_ALLOCATION.BOTTOM_INPUTS - dynamicNodeHeight) / 2 - margin / 2,
        };
        if (inputNodes.length === 1) positions[node.id].x = margin + (availableWidth - dynamicNodeWidth) / 2;
      });
      outputNodes.forEach((node, index) => {
        positions[node.id] = {
          x: margin + (index * (availableWidth - dynamicNodeWidth)) / Math.max(1, outputNodes.length - 1),
          y: (LEVEL_AREA_HEIGHT_ALLOCATION.TOP_OUTPUTS - dynamicNodeHeight) / 2 + margin / 2,
        };
        if (outputNodes.length === 1) positions[node.id].x = margin + (availableWidth - dynamicNodeWidth) / 2;
      });
      
      const layers: string[][] = [];
      const nodeLayer: Record<string, number> = {};
      nodes.forEach(n => { if (n.type === NodeType.Input) nodeLayer[n.id] = 0; });
      let unlayeredNodes: LogicNode[] = gateNodes.slice();
      let currentLayer = 1;
      while(unlayeredNodes.length > 0 && currentLayer < 10) { 
        const currentLayerNodes: string[] = [];
        const remainingNodes: LogicNode[] = [];
        unlayeredNodes.forEach(gate => {
          const inputsToGate = level.connections.filter(c => c.to === gate.id);
          const inputLayers = inputsToGate.map(c => nodeLayer[c.from]).filter(l => l !== undefined);
          if(inputsToGate.length === 0 || (inputLayers.length === inputsToGate.length && inputLayers.every(l => l < currentLayer))) {
            nodeLayer[gate.id] = currentLayer;
            currentLayerNodes.push(gate.id);
          } else {
            remainingNodes.push(gate);
          }
        });
        if(currentLayerNodes.length > 0) layers[currentLayer] = currentLayerNodes;
        if(currentLayerNodes.length === 0 && remainingNodes.length > 0) {
            remainingNodes.forEach((rn) => {
              if(!nodeLayer[rn.id]) {
                  nodeLayer[rn.id] = currentLayer; 
                  if(!layers[currentLayer]) layers[currentLayer] = [];
                  layers[currentLayer].push(rn.id);
              }
            });
            unlayeredNodes = []; 
            break;
        }
        unlayeredNodes = remainingNodes;
        currentLayer++;
      }
      layers.forEach((layerNodes, layerIndex) => {
        if (!layerNodes) return;
        const yPos = LEVEL_AREA_HEIGHT_ALLOCATION.TOP_OUTPUTS + margin + 
                      (layerIndex + 0.5) * (availableHeightForGates / Math.max(1, layers.filter(l=>l).length));
        layerNodes.forEach((nodeId, nodeIndexInLayer) => {
          positions[nodeId] = {
            x: margin + (nodeIndexInLayer * (availableWidth - dynamicNodeWidth)) / Math.max(1, layerNodes.length -1),
            y: yPos - dynamicNodeHeight / 2,
          };
          if(layerNodes.length === 1) positions[nodeId].x = margin + (availableWidth - dynamicNodeWidth)/2;
        });
      });
    }

    nodes.forEach(node => {
      if (!positions[node.id]) {
        positions[node.id] = { x: canvasSize.width / 2 - dynamicNodeWidth / 2, y: canvasSize.height / 2 - dynamicNodeHeight / 2 };
      }
    });
    setNodePositions(positions);
  }, [level, canvasSize.width, canvasSize.height]);

  // Simulation logic is identical
  useEffect(() => {
    const newSimulatedNodes = simulateCircuit(level.nodes, level.connections, inputStates);
    let allTargetsMet = Object.keys(level.targetOutputs).length > 0;
    if (Object.keys(level.targetOutputs).length === 0) allTargetsMet = false;

    Object.entries(level.targetOutputs).forEach(([outputNodeId, targetValue]) => {
      const currentNode = newSimulatedNodes[outputNodeId];
      if (currentNode) {
        currentNode.isTargetMet = currentNode.value === targetValue;
        if (!currentNode.isTargetMet) allTargetsMet = false;
      } else {
        allTargetsMet = false;
      }
    });
    setSimulatedNodes(newSimulatedNodes);

    if (allTargetsMet) {
      if (!isCompletedThisAttempt) {
        setIsCompletedThisAttempt(true);
        let starsEarned = 0;
        if (level.starRatings) {
          if (moveCount <= level.starRatings.threeStars) starsEarned = 3;
          else if (moveCount <= level.starRatings.twoStars) starsEarned = 2;
          else starsEarned = 1;
        } else {
          starsEarned = 1;
        }
        onLevelComplete(level.levelId, starsEarned);
        setStarsEarnedInModal(starsEarned);
        setIsCompletionModalOpen(true);
      }
    } else {
      if (isCompletedThisAttempt) {
        setIsCompletedThisAttempt(false);
      }
    }
  }, [inputStates, level, moveCount, onLevelComplete, isCompletedThisAttempt]);

  const handleToggleInput = useCallback((nodeId: string) => {
    setInputStates(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    setMoveCount(prev => prev + 1);
    if (isCompletedThisAttempt) setIsCompletedThisAttempt(false);
    if (isCompletionModalOpen) setIsCompletionModalOpen(false);
  }, [isCompletedThisAttempt, isCompletionModalOpen]);


  const handleModalClose = () => setIsCompletionModalOpen(false);
  const handleModalNextLevel = () => {
    handleModalClose();
    onNavigateToNextLevel();
  };
  const handleModalGoBack = () => {
    handleModalClose();
    onBackToLevels();
  };
  
  // ====== FUNÇÃO PARA FECHAR O NOVO MODAL ======
  const handleInfoModalClose = () => setIsInfoModalOpen(false);
  // ===============================================


  const allNodes = useMemo(() => Object.values(simulatedNodes), [simulatedNodes]);
  const visibleNodes = allNodes.filter(node => nodePositions[node.id] && canvasSize.width > 0 && canvasSize.height > 0);
  const numberOfGridCols = level.grid?.cols;

  return (
    // O safe area ajuda a não deixar a tela toda ser utilizada, isso inclui a área dos botões de retorno e a linha de cima
    <SafeAreaView style={styles.container}>
      <View style={styles.containerView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.levelName}>
              {level.levelName.split(" - ")[0]}
            </Text>
            { /*<Text style={styles.levelDescription}>{level.levelDescription}</Text> */ }
          </View>
          { /* GO BACK BUTTON */ }
          <TouchableOpacity onPress={onBackToLevels} style={[styles.button, styles.buttonSecondary]}>
              <Text style={styles.buttonTextSecondary}>↩</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.movesContainer}>
          <Text style={styles.movesText}>
            Moves: {moveCount}
            {initialUserProgressStars !== undefined && !isCompletedThisAttempt &&
              ` (Best: ${initialUserProgressStars} ${initialUserProgressStars === 1 ? "star" : "stars"})`}
          </Text>
        </View>

        <View
          onLayout={onLayout}
          style={styles.gameArea}
        >
          { (canvasSize.width > 0 && canvasSize.height > 0) && (
            <>
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                {level.connections.map((conn, index) => {
                  const fromNodePos = nodePositions[conn.from];
                  const toNodePos = nodePositions[conn.to];
                  const fromNodeState = simulatedNodes[conn.from];
                  if (!fromNodePos || !toNodePos || !fromNodeState) return null;
                  // NOTE: WireDisplay component will also need conversion to use react-native-svg
                  return (
                    <WireDisplay
                      key={`wire-${conn.from}-${conn.to}-${index}`}
                      startX={fromNodePos.x} startY={fromNodePos.y}
                      endX={toNodePos.x} endY={toNodePos.y}
                      isActive={fromNodeState.value || false}
                      nodeWidth={currentNodeDimensions.width} nodeHeight={currentNodeDimensions.height}
                    />
                  );
                })}
              </Svg>
              {visibleNodes.map(node => (
                // NOTE: CircuitNodeDisplay component will also need conversion
                <CircuitNodeDisplay
                  key={node.id}
                  node={{...node, x: nodePositions[node.id]?.x, y: nodePositions[node.id]?.y}}
                  onToggleInput={node.type === NodeType.Input ? () => handleToggleInput(node.id) : undefined}
                  isTargetMet={node.type === NodeType.Output ? node.isTargetMet : undefined}
                  outputGoal={node.type === NodeType.Output ? level.targetOutputs[node.id] : undefined}
                  renderWidth={currentNodeDimensions.width} renderHeight={currentNodeDimensions.height}
                  numberOfGridCols={numberOfGridCols}
                />
              ))}
            </>
          )}
        </View>
        
        {/* 1. MODAL DE INÍCIO DE NÍVEL (TUTORIAL) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isInfoModalOpen}
          onRequestClose={handleInfoModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Alert!</Text>
              <Text style={[styles.modalText, { textAlign: 'center', marginBottom: 24 }]}>
                {level.pop_up?.text}
              </Text>
              <TouchableOpacity onPress={handleInfoModalClose} style={[styles.button, styles.buttonPrimary, styles.modalButton]}>
                <Text style={styles.buttonTextPrimary}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
		
        {/* 2. MODAL DE FIM DE NÍVEL (CONCLUSÃO) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isCompletionModalOpen}
          onRequestClose={handleModalClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Level Complete!</Text>
              <View style={styles.starsContainer}>
                {Array.from({ length: starsEarnedInModal }).map((_, i) => (
                  <StarIcon key={i} style={styles.starYellow} />
                ))}
                {Array.from({ length: 3 - starsEarnedInModal }).map((_, i) => (
                  <StarIcon key={`empty-${i}`} style={styles.starGray} />
                ))}
              </View>
              <Text style={styles.modalText}>You earned {starsEarnedInModal} {starsEarnedInModal === 1 ? "star" : "stars"}!</Text>
              <Text style={styles.modalSubText}>Moves: {moveCount}</Text>
              <View style={styles.modalButtonContainer}>
                  <TouchableOpacity onPress={handleModalNextLevel} style={[styles.button, styles.buttonPrimary, styles.modalButton]}>
                      <Text style={styles.buttonTextPrimary}>Next Level</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleModalGoBack} style={[styles.button, styles.buttonSecondary, styles.modalButton]}>
                      <Text style={styles.buttonTextSecondary}>Back to Levels</Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Stylesheet for React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 8,
  },
  containerView: {
    flex: 1,
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  levelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8', // sky-400
    // fontFamily: 'Orbitron', // Make sure this font is loaded in your React Native project
  },
  levelDescription: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
  },
  movesContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#334155', // slate-700
    borderRadius: 6,
  },
  movesText: {
    color: '#cbd5e1', // slate-300
    textAlign: 'center',
    fontWeight: '600',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0f172a', // slate-900
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155', // slate-700
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#38bdf8', // sky-400
  },
  buttonSecondary: {
    backgroundColor: '#475569', // slate-600
    borderWidth: 1,
    borderColor: '#64748b' // slate-500
  },
  buttonTextPrimary: {
    color: '#0f172a', // slate-900
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#f1f5f9', // slate-100
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#334155', // slate-700
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9', // slate-100
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starIconBase: {
    width: 40,
    height: 40,
    marginHorizontal: 4,
  },
  starYellow: {
    color: '#facc15', // yellow-400
  },
  starGray: {
    color: '#475569', // slate-600
  },
  modalText: {
    fontSize: 18,
    color: '#cbd5e1', // slate-300
    marginBottom: 4,
  },
  modalSubText: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    width: '100%',
    marginVertical: 6,
    paddingVertical: 14,
  },
});

export default LevelDisplay;