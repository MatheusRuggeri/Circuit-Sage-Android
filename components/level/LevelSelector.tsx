
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg'; // <-- Import Svg components

import { Level, UserProgress, LevelCategory } from '../../types';
import { LEVEL_CATEGORY_NAMES } from '../../constants';
import Button from '../ui/Button';

interface LevelSelectorProps {
  levels: Level[];
  onSelectLevel: (levelId: string) => void;
  userProgress: UserProgress;
  categoryName: LevelCategory;
  onBackToCategories: () => void;
}

const LevelCard: React.FC<{level: Level, onPress: () => void, completedStars?: number}> = ({ level, onPress, completedStars }) => {
  const stars = completedStars || 0;

  // Conditional styles are done with arrays
  const cardStyle = [
    styles.levelCard,
    stars > 0 ? styles.cardCompleted : styles.cardDefault
  ];

  return (
    // Use TouchableOpacity for press events
    <TouchableOpacity 
      style={cardStyle}
      onPress={onPress} // <-- Use onPress instead of onClick
      accessibilityLabel={`Level: ${level.levelName}. ${stars > 0 ? `Completed with ${stars} star${stars === 1 ? '' : 's'}.` : 'Not yet completed.'} Press to ${stars > 0 ? 'replay' : 'play'}.`}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <Text 
          style={styles.levelName}
          numberOfLines={1} // <-- Simpler way to truncate text
        >
          {level.levelName}
        </Text>
        <Button 
            variant={stars > 0 ? "secondary" : "primary"} 
            size="sm" 
            onPress={(e) => { e.stopPropagation(); onPress(); }}
            // Note: Your custom Button must also be a React Native component
        >
          {stars > 0 ? "Replay" : "Play"}
        </Button>
      </View>
      <View style={styles.cardFooter}>
        <Text 
          style={styles.levelDescription}
          numberOfLines={2} // <-- The React Native way to do multi-line ellipsis
        >
          {level.levelDescription}
        </Text>
        {stars > 0 && (
          <View style={styles.starsContainer}>
            {Array.from({ length: stars }).map((_, i) => (
              // Use react-native-svg components here
              <Svg key={`star-yellow-${i}`} style={styles.starIcon} viewBox="0 0 20 20" fill="currentColor">
                <Path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </Svg>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};


// ====================================================================
// Converted LevelSelector Component
// ====================================================================
const LevelSelector: React.FC<LevelSelectorProps> = ({ levels, onSelectLevel, userProgress, categoryName, onBackToCategories }) => {
  const displayCategoryName = LEVEL_CATEGORY_NAMES[categoryName] || categoryName;

  return (
    // Use ScrollView for content that might exceed the screen height
    <ScrollView style={styles.container} contentContainerStyle={styles.containerPadding}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>
          {displayCategoryName}
        </Text>
        <Button onPress={onBackToCategories} variant="secondary">Back to Categories</Button>
      </View>
      
      {levels.length === 0 ? (
        <Text style={styles.noLevelsText}>No levels in this category yet. Stay tuned!</Text>
      ) : (
        // This View creates the "Grid" using Flexbox
        <View style={styles.gridContainer}>
          {levels.map(level => (
            <LevelCard 
              key={level.levelId} 
              level={level} 
              onPress={() => onSelectLevel(level.levelId)}
              completedStars={userProgress.completedLevels[level.levelId]?.stars}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// ====================================================================
// StyleSheet for all components
// ====================================================================
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // bg-slate-900
  },
  containerPadding: {
    padding: 24, // p-6
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#334155', // border-slate-700
  },
  categoryTitle: {
    fontSize: 36, // text-4xl
    fontWeight: 'bold',
    color: '#38bdf8', // text-sky-400
    fontFamily: 'Orbitron-Bold', // Make sure this font is linked
  },
  noLevelsText: {
    color: '#94a3b8', // text-slate-400
    textAlign: 'center',
    fontSize: 18, // text-lg
  },
  // Grid Container
  gridContainer: {
    flexDirection: 'row', // Arrange children in a row
    flexWrap: 'wrap',    // Allow items to wrap to the next line
    justifyContent: 'space-between', // Distribute space
  },
  // LevelCard styles
  levelCard: {
    backgroundColor: '#1e293b', // bg-slate-800
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    borderWidth: 2,
    // This creates the "grid item" by taking up roughly half the width
    width: '48%', // For a 2-column grid. Use '32%' for 3-col, etc.
    marginBottom: 16, // gap-4
  },
  cardCompleted: {
    borderColor: '#22c55e', // border-green-500
  },
  cardDefault: {
    borderColor: '#334155', // border-slate-700
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#38bdf8', // text-sky-400
    marginRight: 8,
    flex: 1, // Allow text to shrink if button is large
    fontFamily: 'Orbitron-SemiBold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelDescription: {
    color: '#94a3b8', // text-slate-400
    flex: 1, // Take up available space
    minHeight: 40, // approx '2.5em'
  },
  starsContainer: {
    flexDirection: 'row',
    flexShrink: 0, // Don't shrink
    marginLeft: 8,
    alignItems: 'center',
    minHeight: 40,
  },
  starIcon: {
    width: 16, // w-4
    height: 16, // h-4
    color: '#facc15', // text-yellow-400
    marginHorizontal: 1, // mx-px
  }
});


export default LevelSelector;
