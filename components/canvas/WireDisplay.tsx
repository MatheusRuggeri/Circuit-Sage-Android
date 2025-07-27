import React from 'react';
import { Path } from 'react-native-svg';
import { WIRE_COLOR_ACTIVE, WIRE_COLOR_INACTIVE } from '../../constants';

const WireDisplay: React.FC<WireDisplayProps> = ({ 
  startX, 
  startY, 
  endX, 
  endY, 
  isActive, 
  isHighlighted,
  nodeWidth,
  nodeHeight
}) => {
  const color = isActive ? WIRE_COLOR_ACTIVE : WIRE_COLOR_INACTIVE;

  // --- PONTOS VISÍVEIS ---
  // Onde o fio REALMENTE começa e termina.
  const sourceEdgeX = startX + nodeWidth / 2;
  const sourceEdgeY = startY; // Conexão no TOPO da figura de origem.

  const targetEdgeX = endX + nodeWidth / 2;
  const targetEdgeY = endY + nodeHeight * 0.5; // Ao não somar 100% de Height, corrijo o problem dos OR (curva para cima cortando a imagem).


  // --- PONTOS GUIA (INVISÍVEIS) ---
  // Usados APENAS para calcular a forma da curva. Não são pontos de conexão.
  const sourceGuideY = startY;
  const targetGuideY = endY + nodeHeight*1;
  

  // O deslocamento da curva é baseado na distância entre os pontos-guia.
  const controlOffsetY = Math.abs(targetGuideY - sourceGuideY) * 0.5; // Mudar o 0.5 para a suavidae da curva, 0 vira reta, 1 vira quase 90º, acima de 1 vira bagunça


  // O caminho completo que conecta as BORDAS.
  const pathData = `
    M ${sourceEdgeX} ${sourceEdgeY}
    L ${sourceEdgeX} ${sourceGuideY}
    C ${sourceEdgeX} ${sourceGuideY - controlOffsetY},
      ${targetEdgeX} ${targetGuideY + controlOffsetY},
      ${targetEdgeX} ${targetGuideY}
    L ${targetEdgeX} ${targetEdgeY}
  `;
  /*
   * ANÁLISE DO CAMINHO:
   * 1. M ...: Começa o desenho na BORDA de cima.
   * 2. L ...: Desenha uma linha reta até o PONTO GUIA (invisível) no centro.
   * 3. C ...: Desenha a CURVA SUAVE entre os dois PONTOS GUIA.
   * 4. L ...: Desenha uma linha reta do último PONTO GUIA até a BORDA de baixo.
   */

  return (
    <Path
      d={pathData}
      stroke={color}
      strokeWidth={isHighlighted ? 4 : 2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

export default WireDisplay;