import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { CircuitNode, NodeType } from '../../types';
import { WIRE_COLOR_ACTIVE, WIRE_COLOR_INACTIVE } from '../../constants';
import { GateIcon } from '../icons/GateIcons'; // IMPORTANT: This must be a React Native component

interface CircuitNodeDisplayProps {
  node: CircuitNode;
  onToggleInput?: (nodeId: string) => void;
  isTargetMet?: boolean;
  outputGoal?: boolean;
  isSelected?: boolean;
  renderWidth: number;
  renderHeight: number;
  numberOfGridCols?: number;
}


// All path generation functions are pure JavaScript and remain unchanged.
// --- START: SVG PATH GENERATORS ---
const bufferGateShape = (w: number, h: number, yOffset: number = 0): string => `M${w * 0.5} ${0 + yOffset} L${w * 0.98} ${h + yOffset} L${w * 0.02} ${h + yOffset} Z`;
const andGateShape = (w: number, h: number, yOffset: number = 0): string => {
  const p_bl_x = 0; const p_bl_y = h + yOffset;
  const p_tl_s_x = 0; const p_tl_s_y = h * 0.3 + yOffset;
  const c_rev2_ctrl1_x = 0; const c_rev2_ctrl1_y = h * 0.1 + yOffset;
  const c_rev2_ctrl2_x = w * 0.25; const c_rev2_ctrl2_y = 0 + yOffset;
  const p_top_mid_x = w * 0.5; const p_top_mid_y = 0 + yOffset;
  const c_rev1_ctrl1_x = w * 0.75; const c_rev1_ctrl1_y = 0 + yOffset;
  const c_rev1_ctrl2_x = w; const c_rev1_ctrl2_y = h * 0.1 + yOffset;
  const p_tr_s_x = w; const p_tr_s_y = h * 0.3 + yOffset;
  const p_br_x = w; const p_br_y = h + yOffset;
  return `M ${p_bl_x} ${p_bl_y} L ${p_tl_s_x} ${p_tl_s_y} C ${c_rev2_ctrl1_x} ${c_rev2_ctrl1_y}, ${c_rev2_ctrl2_x} ${c_rev2_ctrl2_y}, ${p_top_mid_x} ${p_top_mid_y} C ${c_rev1_ctrl1_x} ${c_rev1_ctrl1_y}, ${c_rev1_ctrl2_x} ${c_rev1_ctrl2_y}, ${p_tr_s_x} ${p_tr_s_y} L ${p_br_x} ${p_br_y} Z`;
};
const orGateShape = (w: number, h: number, yOffset: number = 0): string => {
  const hw = w / 2;
  return `M ${hw} ${0 + yOffset} C ${w * 0.9} ${h * 0.2 + yOffset}, ${w} ${h * 0.5 + yOffset}, ${w} ${h + yOffset} Q ${hw} ${h * 0.75 + yOffset}, ${0} ${h + yOffset} C ${0} ${h * 0.5 + yOffset}, ${w * 0.1} ${h * 0.2 + yOffset}, ${hw} ${0 + yOffset} Z`;
};
const addInversionBubble = (w: number, bubbleSize: number = 8): string => {
  const hw = w / 2; const bubbleRadius = bubbleSize / 2;
  return `M ${hw} ${bubbleRadius} m -${bubbleRadius},0 a ${bubbleRadius},${bubbleRadius} 0 1,1 ${bubbleSize},0 a ${bubbleRadius},${bubbleRadius} 0 1,1 -${bubbleSize},0 Z`;
};
const ARC_EFFECTIVE_HEIGHT_FACTOR = 0.20;
const ARC_BOW_DEPTH_FACTOR = -0.2;
const ARC_LINE_THICKNESS_FACTOR = 0.03;
const addExclusiveArc = (gateWidth: number, arcCenterY: number, arcBowDepth: number, arcThickness: number): string => {
  const xMargin = gateWidth * 0.05; const topEdgeY = arcCenterY - arcThickness / 2;
  const bottomEdgeY = arcCenterY + arcThickness / 2; const topControlY = topEdgeY + arcBowDepth;
  const bottomControlY = bottomEdgeY + arcBowDepth;
  return `M ${xMargin} ${topEdgeY} Q ${gateWidth/2} ${topControlY} ${gateWidth - xMargin} ${topEdgeY} L ${gateWidth - xMargin} ${bottomEdgeY} Q ${gateWidth/2} ${bottomControlY} ${xMargin} ${bottomEdgeY} Z`;
};
const xorGateShape = (w: number, h: number): string => {
  const arcThickness = Math.max(1.5, w * ARC_LINE_THICKNESS_FACTOR); const arcEffectiveVisualHeight = w * ARC_EFFECTIVE_HEIGHT_FACTOR;
  const orBodyHeight = h - arcEffectiveVisualHeight; const orPath = orGateShape(w, orBodyHeight, 0);
  const arcCenterY = orBodyHeight + arcEffectiveVisualHeight / 2; const arcBowDepth = w * ARC_BOW_DEPTH_FACTOR;
  const arcPath = addExclusiveArc(w, arcCenterY, arcBowDepth, arcThickness);
  return `${orPath} ${arcPath}`;
};
const xnorGateShape = (w: number, h: number, bubbleSize: number): string => {
  const arcThickness = Math.max(1.5, w * ARC_LINE_THICKNESS_FACTOR); const arcEffectiveVisualHeight = w * ARC_EFFECTIVE_HEIGHT_FACTOR;
  const orBodyHeight = h - bubbleSize - arcEffectiveVisualHeight; const orPath = orGateShape(w, orBodyHeight, bubbleSize);
  const bubblePath = addInversionBubble(w, bubbleSize); const arcCenterY = bubbleSize + orBodyHeight + arcEffectiveVisualHeight / 2;
  const arcBowDepth = w * ARC_BOW_DEPTH_FACTOR; const arcPath = addExclusiveArc(w, arcCenterY, arcBowDepth, arcThickness);
  return `${orPath} ${bubblePath} ${arcPath}`;
};
const notGateShape = (w: number, h: number, bubbleSize: number = 8): string => {
  const effectiveGateHeight = h - bubbleSize; const bufferShapePath = bufferGateShape(w, effectiveGateHeight, bubbleSize);
  const bubblePath = addInversionBubble(w, bubbleSize); return `${bufferShapePath} ${bubblePath}`;
};
const norGateShape = (w: number, h: number, bubbleSize: number = 8): string => {
  const effectiveGateHeight = h - bubbleSize; const orShapePath = orGateShape(w, effectiveGateHeight, bubbleSize);
  const bubblePath = addInversionBubble(w, bubbleSize); return `${orShapePath} ${bubblePath}`;
};
const nandGateShape = (w: number, h: number, bubbleSize: number = 8): string => {
  const effectiveGateHeight = h - bubbleSize; const andShapePath = andGateShape(w, effectiveGateHeight, bubbleSize);
  const bubblePath = addInversionBubble(w, bubbleSize); return `${andShapePath} ${bubblePath}`;
};
// --- END: SVG PATH GENERATORS ---

const RAW_PATH_GENERATORS: Partial<Record<NodeType, (w: number, h: number, bubbleSize?: number) => string>> = {
  [NodeType.AND]: andGateShape, [NodeType.NAND]: nandGateShape,
  [NodeType.OR]: orGateShape, [NodeType.NOR]: norGateShape,
  [NodeType.XOR]: xorGateShape, [NodeType.XNOR]: xnorGateShape,
  [NodeType.NOT]: notGateShape,
};

const BORDER_THICKNESS = 2;
const BASE_FONT_SIZE_PX = 11;
const MIN_ABSOLUTE_FONT_SIZE_PX = 7;

const NODE_LABEL_ADJUSTMENTS: Partial<Record<NodeType, {
  fontSizeFactor?: number; vOffsetFactor?: number; maxHeightFactor?: number;
}>> = {
  [NodeType.NAND]: { fontSizeFactor: 0.7, vOffsetFactor: 0.12, maxHeightFactor: 0.85 },
  [NodeType.NOR]: { fontSizeFactor: 0.95, vOffsetFactor: 0.1, maxHeightFactor: 0.9 },
  [NodeType.XOR]: { fontSizeFactor: 0.8, vOffsetFactor: -0.05, maxHeightFactor: 0.75 },
  [NodeType.XNOR]: { fontSizeFactor: 0.7, vOffsetFactor: 0.05, maxHeightFactor: 0.7 },
  [NodeType.NOT]: { fontSizeFactor: 0.9, vOffsetFactor: 0.3, maxHeightFactor: 0.9 },
};

// This map provides actual hex color values, preventing the warning.
const colorMap = {
    slate900: '#0f172a',
    slate600: '#475569',
    slate500: '#64748b',
    slate100: '#f1f5f9',
    emerald400: '#34d399',
    pink500: '#ec4899',
    purple500: '#a855f7',
    orange500: '#f97316',
    rose500: '#f43f5e',
    amber500: '#f59e0b',
    sky500: '#0ea5e9',
};

const nodeTypeColorMap: Partial<Record<NodeType, string>> = {
    [NodeType.Input]: colorMap.sky500,
    [NodeType.Output]: colorMap.emerald400,
    [NodeType.AND]: colorMap.purple500,
    [NodeType.NAND]: colorMap.purple500,
    [NodeType.OR]: colorMap.orange500,
    [NodeType.NOR]: colorMap.orange500,
    [NodeType.XOR]: colorMap.rose500,
    [NodeType.XNOR]: colorMap.rose500,
    [NodeType.NOT]: colorMap.amber500,
};


const CircuitNodeDisplay: React.FC<CircuitNodeDisplayProps> = ({
  node, onToggleInput, isTargetMet, outputGoal, isSelected,
  renderWidth, renderHeight, numberOfGridCols
}) => {
  const isInteractive = node.type === NodeType.Input && !!onToggleInput;

  const handleClick = () => {
    if (isInteractive) {
      onToggleInput(node.id);
    }
  };

  const pathGeneratorFn = RAW_PATH_GENERATORS[node.type];
  const mainBubbleSize = Math.max(8, Math.min(renderWidth, renderHeight) * 0.12);

  let mainShapePath: string | undefined;
  if (pathGeneratorFn) {
    const usesBubble = [NodeType.NAND, NodeType.NOR, NodeType.XNOR, NodeType.NOT].includes(node.type);
    mainShapePath = usesBubble
      ? pathGeneratorFn(renderWidth, renderHeight, mainBubbleSize)
      : pathGeneratorFn(renderWidth, renderHeight);
  }
  
  // --- Dynamic Style Calculations ---
  let mainBgColor: string;
  if (node.type === NodeType.Output) {
    mainBgColor = outputGoal ? colorMap.emerald400 : colorMap.slate500;
  } else {
    // Use the new map to get a valid color string
    mainBgColor = nodeTypeColorMap[node.type] || colorMap.slate600;
  }
  const borderColor = node.value ? WIRE_COLOR_ACTIVE : WIRE_COLOR_INACTIVE;
  // This logic is now safe because it compares hex codes
  const labelTextColor = (mainBgColor === colorMap.emerald400 || mainBgColor === colorMap.sky500) ? colorMap.slate900 : colorMap.slate100;
  
  const showGateIcon = !pathGeneratorFn;
  const iconSize = Math.max(12, Math.min(renderWidth, renderHeight) * 0.25);
  
  // --- Font Size and Label Position Calculations ---
  const adjustments = NODE_LABEL_ADJUSTMENTS[node.type] || {};
  const { fontSizeFactor = 1, vOffsetFactor = 0 } = adjustments;

  let calculatedFontSize;
  if (numberOfGridCols && numberOfGridCols > 0) {
    calculatedFontSize = Math.floor(Math.max(1, 15 - numberOfGridCols) * fontSizeFactor);
  } else {
    calculatedFontSize = Math.floor(BASE_FONT_SIZE_PX * fontSizeFactor);
  }
  const finalFontSize = Math.max(MIN_ABSOLUTE_FONT_SIZE_PX, calculatedFontSize);
  const verticalTranslation = renderHeight * vOffsetFactor;

  const accessibilityLabel = `${node.label} (${node.type}), Current state: ${node.value ? 'ON' : 'OFF'}${node.type === NodeType.Output ? (isTargetMet === true ? '. Target met.' : isTargetMet === false ? '. Target not met.' : '.') : ''}${isInteractive ? ' Tap to toggle.' : ''}`;

  return (
    <View style={[
      styles.baseNodeContainer,
      {
        left: (node.x || 0) - BORDER_THICKNESS,   // Centraliza a porta
        top: (node.y || 0) - BORDER_THICKNESS,    // Centraliza a porta
        width: renderWidth + BORDER_THICKNESS * 2,
        height: renderHeight + BORDER_THICKNESS * 2,
      },
      isSelected && styles.selectedRing,
    ]}>
      <TouchableOpacity
        activeOpacity={isInteractive ? 0.8 : 1.0}
        onPress={handleClick}
        accessibilityRole={isInteractive ? 'button' : 'image'}
        accessibilityLabel={accessibilityLabel}
      >
        {mainShapePath ? (
          // --- SVG Path for Custom Gate Shapes ---
          <Svg 
            width={renderWidth + BORDER_THICKNESS * 2} 
            height={renderHeight + BORDER_THICKNESS * 2}
          >
            <G transform={`translate(${BORDER_THICKNESS}, ${BORDER_THICKNESS})`}>
              <Path
                d={mainShapePath}
                fill={borderColor}
                scale={1.05}
                originX={renderWidth / 2}
                originY={renderHeight / 2}
              />
              <Path
                d={mainShapePath}
                fill={mainBgColor}
                scale={0.95}
                originX={renderWidth / 2}
                originY={renderHeight / 2}
              />
            </G>
          </Svg>
        ) : (
          // --- Simple View for Input/Output Nodes ---
          <View style={[
            styles.simpleNodeBorder, 
            { backgroundColor: borderColor, borderRadius: 8 } // Raio exterior do input e output
          ]}>
            <View style={[
                styles.simpleNodeBody, 
                { backgroundColor: mainBgColor, borderRadius: 30 } // Raio interior do input e output
            ]} />
          </View>
        )}
        
        {/* --- Content Overlay (Icon and Text) --- */}
        <View style={[styles.contentOverlay, { width: renderWidth, height: renderHeight }]}>
            {showGateIcon && (
              <GateIcon 
                type={node.type} 
                size={iconSize} 
                color={labelTextColor}
              />
            )}
            <Text
              style={[
                styles.labelText,
                {
                  color: labelTextColor,
                  fontSize: finalFontSize,
                  transform: [{ translateY: verticalTranslation }],
                },
              ]}
              numberOfLines={2}
            >
              {node.label}
            </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  baseNodeContainer: {
    position: 'absolute',
  },
  selectedRing: {
    shadowColor: colorMap.pink500,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  simpleNodeBorder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleNodeBody: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.7 }], // This draw the center of the Output
  },
  contentOverlay: {
    position: 'absolute',
    top: BORDER_THICKNESS,
    left: BORDER_THICKNESS,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 2,
  },
  labelText: {
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});

export default CircuitNodeDisplay;
