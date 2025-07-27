import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Level, UserProgress, LevelCategory } from '../../types';
import { LEVEL_CATEGORY_NAMES } from '../../constants';

// Props interface remains the same
interface RandomModeDisplayProps {
  allLevels: Level[];
  userProgress: UserProgress;
  onPlayRandomLevel: (levelId: string) => void;
  onBackToCategories: () => void;
}

// A reusable StarIcon component using react-native-svg
const StarIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg height="20" width="20" viewBox="0 0 20 20" style={styles.starIcon}>
    <Path
      fill={color}
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
    />
  </Svg>
);

const RandomModeDisplay: React.FC<RandomModeDisplayProps> = ({
  allLevels,
  userProgress,
  onPlayRandomLevel,
  onBackToCategories,
}) => {
  // All this logic is pure JavaScript and remains unchanged.
  const randomLevels = useMemo(() => {
    return allLevels.filter(level => level.category === LevelCategory.Random);
  }, [allLevels]);

  const completedRandomLevels = useMemo(() => {
    return randomLevels.filter(level => userProgress.completedLevels[level.levelId]?.stars > 0).sort((a, b) => a.levelName.localeCompare(b.levelName));
  }, [randomLevels, userProgress]);

  const stats = useMemo(() => {
    const totalPlayed = completedRandomLevels.length;
    if (totalPlayed === 0) {
      return { gamesPlayed: 0, averageStars: 0 };
    }
    const totalStars = completedRandomLevels.reduce((sum, level) => {
      return sum + (userProgress.completedLevels[level.levelId]?.stars || 0);
    }, 0);
    return {
      gamesPlayed: totalPlayed,
      averageStars: parseFloat((totalStars / totalPlayed).toFixed(2)),
    };
  }, [completedRandomLevels, userProgress]);

  const handlePlayRandom = () => {
    if (randomLevels.length === 0) return;
    const unplayedRandomLevels = randomLevels.filter(
      level => !userProgress.completedLevels[level.levelId]
    );
    let levelToPlay: Level | undefined;
    if (unplayedRandomLevels.length > 0) {
      levelToPlay = unplayedRandomLevels[Math.floor(Math.random() * unplayedRandomLevels.length)];
    } else {
      levelToPlay = randomLevels[Math.floor(Math.random() * randomLevels.length)];
    }
    if (levelToPlay) {
      onPlayRandomLevel(levelToPlay.levelId);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {LEVEL_CATEGORY_NAMES[LevelCategory.Random]}
        </Text>
        <TouchableOpacity onPress={onBackToCategories} style={[styles.button, styles.buttonSecondary]}>
            <Text style={styles.buttonTextSecondary}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Average Stars</Text>
          <Text style={styles.statValue}>{stats.averageStars.toFixed(2)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Games Played</Text>
          <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
        </View>
      </View>

      <View style={styles.playButtonContainer}>
        <TouchableOpacity
          onPress={handlePlayRandom}
          disabled={randomLevels.length === 0}
          style={[
            styles.button, 
            styles.buttonPrimary, 
            styles.playButton,
            randomLevels.length === 0 && styles.buttonDisabled
          ]}
        >
          <Text style={[styles.buttonTextPrimary, styles.playButtonText]}>
            {randomLevels.length === 0 ? "No Random Levels Available" : "Play a Random Challenge"}
          </Text>
        </TouchableOpacity>
      </View>

      {completedRandomLevels.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>
            Previously Completed
          </Text>
          <FlatList
            data={completedRandomLevels}
            keyExtractor={item => item.levelId}
            renderItem={({ item }) => {
              const stars = userProgress.completedLevels[item.levelId]?.stars || 0;
              return (
                <View style={styles.listItem}>
                  <Text style={styles.listItemText}>{item.levelName}</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <StarIcon key={`star-${i}`} color="#facc15" /> // yellow-400
                    ))}
                    {Array.from({ length: 3 - stars }).map((_, i) => (
                      <StarIcon key={`empty-star-${i}`} color="#475569" /> // slate-600
                    ))}
                  </View>
                </View>
              );
            }}
            scrollEnabled={false} // Disable scroll for the FlatList as the parent is a ScrollView
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#334155', // slate-700
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#38bdf8', // sky-400
    // To use custom fonts, you must load them into your project first.
    // fontFamily: 'Orbitron', 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b', // slate-800
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7dd3fc', // sky-300
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f1f5f9', // slate-100
  },
  playButtonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  listContainer: {
    width: '100%',
  },
  listHeader: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7dd3fc', // sky-300
    marginBottom: 16,
    // fontFamily: 'Orbitron',
  },
  listItem: {
    backgroundColor: '#1e293b', // slate-800
    padding: 16,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItemText: {
    color: '#cbd5e1', // slate-300
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  // --- Button Styles ---
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
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  playButtonText: {
    fontSize: 18,
  },
  buttonDisabled: {
    backgroundColor: '#475569', // slate-600
    opacity: 0.6,
  },
});

export default RandomModeDisplay;
