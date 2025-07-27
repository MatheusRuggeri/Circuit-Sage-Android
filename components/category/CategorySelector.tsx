import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path, SvgProps } from 'react-native-svg'; // Import from react-native-svg
import { SafeAreaView } from 'react-native-safe-area-context';

import { Level, UserProgress, LevelCategory } from '../../types';
import { LEVEL_CATEGORY_NAMES, UNLOCK_THRESHOLD_PERCENTAGE, ACHIEVEMENT_ID_UNLOCK_INTERMEDIATE } from '../../constants';
import { unlockAchievement } from '../../services/achievementService';

// The LockIcon is now a React Native component using react-native-svg
const LockIcon: React.FC<SvgProps> = (props) => (
  <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <Path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </Svg>
);

interface CategorySelectorProps {
  allLevels: Level[];
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  onSelectCategory: (category: LevelCategory) => void;
  onNavigateToRandomMode: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ allLevels, userProgress, setUserProgress, onSelectCategory, onNavigateToRandomMode }) => {
  const getCategoryProgress = (category: LevelCategory) => {

    const levelsInCategory = allLevels.filter(l => l.category === category);
    const totalLevels = levelsInCategory.length;
    console.log('Levels found in', category, "-", totalLevels);

    if (totalLevels === 0) return { completed: 0, total: 0, percentage: 0, levelsExist: false };

    const completedCount = levelsInCategory.filter(l => userProgress.completedLevels[l.levelId]?.stars > 0).length;
    return {
      completed: completedCount,
      total: totalLevels,
      percentage: totalLevels > 0 ? (completedCount / totalLevels) : 0,
      levelsExist: true,
    };
  };

  const basicProgress = getCategoryProgress(LevelCategory.Basic);
  const intermediateProgress = getCategoryProgress(LevelCategory.Intermediate);
  const advancedProgress = getCategoryProgress(LevelCategory.Advanced);
  const randomProgressData = getCategoryProgress(LevelCategory.Random);

  const isIntermediateUnlockedInitially = !basicProgress.levelsExist || basicProgress.percentage >= UNLOCK_THRESHOLD_PERCENTAGE || !intermediateProgress.levelsExist;
  const canUnlockAdvancedCheck = intermediateProgress.levelsExist && intermediateProgress.percentage >= UNLOCK_THRESHOLD_PERCENTAGE;
  const isAdvancedUnlockedInitially = isIntermediateUnlockedInitially && (canUnlockAdvancedCheck || !advancedProgress.levelsExist);
  const canUnlockRandomCheck = advancedProgress.levelsExist && advancedProgress.percentage >= UNLOCK_THRESHOLD_PERCENTAGE;
  const isRandomUnlockedInitially = isAdvancedUnlockedInitially && (canUnlockRandomCheck || !randomProgressData.levelsExist);

  useEffect(() => {
    if (isIntermediateUnlockedInitially && intermediateProgress.levelsExist) {
      if (!userProgress.awardedAchievements?.[ACHIEVEMENT_ID_UNLOCK_INTERMEDIATE]) {
        unlockAchievement(ACHIEVEMENT_ID_UNLOCK_INTERMEDIATE);
        setUserProgress(prev => ({
          ...prev,
          awardedAchievements: {
            ...(prev.awardedAchievements || {}),
            [ACHIEVEMENT_ID_UNLOCK_INTERMEDIATE]: true,
          }
        }));
      }
    }
  }, [isIntermediateUnlockedInitially, intermediateProgress.levelsExist, userProgress.awardedAchievements, setUserProgress]);

  const categoriesToDisplay = [
    {
      id: LevelCategory.Basic,
      categoryType: LevelCategory.Basic,
      name: LEVEL_CATEGORY_NAMES[LevelCategory.Basic],
      progressData: basicProgress,
      isUnlocked: true,
      description: "Start your journey with fundamental logic gates and simple circuits.",
      action: () => onSelectCategory(LevelCategory.Basic),
    },
    {
      id: LevelCategory.Intermediate,
      categoryType: LevelCategory.Intermediate,
      name: LEVEL_CATEGORY_NAMES[LevelCategory.Intermediate],
      progressData: intermediateProgress,
      isUnlocked: isIntermediateUnlockedInitially,
      description: "Tackle more complex puzzles combining multiple gate types.",
      unlockMessage: basicProgress.levelsExist ? `Complete ${Math.ceil(UNLOCK_THRESHOLD_PERCENTAGE * basicProgress.total)} Basic levels to unlock.` : 'Basic levels not available.',
      action: () => onSelectCategory(LevelCategory.Intermediate),
    },
    {
      id: LevelCategory.Advanced,
      categoryType: LevelCategory.Advanced,
      name: LEVEL_CATEGORY_NAMES[LevelCategory.Advanced],
      progressData: advancedProgress,
      isUnlocked: isAdvancedUnlockedInitially,
      description: "Challenge yourself with intricate circuits requiring deep understanding.",
      unlockMessage: intermediateProgress.levelsExist ? `Complete ${Math.ceil(UNLOCK_THRESHOLD_PERCENTAGE * intermediateProgress.total)} Intermediate levels to unlock.` : 'Intermediate levels not available.',
      action: () => onSelectCategory(LevelCategory.Advanced),
    },
    {
      id: LevelCategory.Random, // <-- Use the enum for the key/id as well for consistency
      categoryType: LevelCategory.Random, // <-- Use the enum value here
      name: LEVEL_CATEGORY_NAMES[LevelCategory.Random] || "Random Challenges",
      progressData: randomProgressData,
      isUnlocked: isRandomUnlockedInitially,
      description: "Test your skills with a variety of randomly selected circuits.",
      unlockMessage: advancedProgress.levelsExist ? `Complete ${Math.ceil(UNLOCK_THRESHOLD_PERCENTAGE * advancedProgress.total)} Advanced levels to unlock.` : 'Advanced levels not available.',
      action: onNavigateToRandomMode,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Start Your Path</Text>
          <Text style={styles.subtitle}>Master logic circuits by progressing through categories.</Text>
        </View>

        <View style={styles.categoryList}>
          {categoriesToDisplay.map(({ id, name, progressData, isUnlocked, description, unlockMessage, action, categoryType }) => (
            <TouchableOpacity
              key={id}
              style={[styles.card, !isUnlocked && styles.cardDisabled]}
              onPress={() => isUnlocked && action()}
              activeOpacity={isUnlocked ? 0.7 : 1}
              accessibilityRole={isUnlocked ? 'button' : 'none'}
              accessibilityState={{ disabled: !isUnlocked }}
              accessibilityLabel={`${name}. ${description} ${isUnlocked ? 'Press to open.' : `Locked. ${unlockMessage || ''}`}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{name}</Text>
                  <Text style={styles.cardDescription}>{description}</Text>
                </View>
                {!isUnlocked && <LockIcon style={styles.lockIcon} width={32} height={32} />}
              </View>

              {progressData.levelsExist && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>Progress: {progressData.completed} / {progressData.total}</Text>
                    <Text style={styles.progressText}>{Math.round(progressData.percentage * 100)}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        !isUnlocked && styles.progressBarFillDisabled,
                        { width: `${progressData.percentage * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {!isUnlocked && unlockMessage && progressData.levelsExist && (
                <Text style={styles.unlockMessage}>{unlockMessage}</Text>
              )}
              {!isUnlocked && !progressData.levelsExist && categoryType !== LevelCategory.Basic && (
                <Text style={styles.noLevelsMessage}>No levels in this category yet. Check back later!</Text>
              )}
              {!isUnlocked && !progressData.levelsExist && categoryType === LevelCategory.Basic && (
                <Text style={styles.noLevelsMessage}>Basic levels are loading or not available. Please wait or check configuration.</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// StyleSheet for React Native
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B', // slate-800
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    // NOTE: 'Orbitron' font must be linked in your native project
    fontFamily: 'Orbitron-ExtraBold',
    fontSize: 40,
    fontWeight: '800',
    color: '#38BDF8', // sky-400
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#94A3B8', // slate-400
    marginTop: 12,
    textAlign: 'center',
  },
  categoryList: {
    width: '100%',
  },
  card: {
    backgroundColor: '#1E293B', // slate-800
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155', // slate-700
    marginBottom: 24,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Android Shadow
    elevation: 8,
  },
  cardDisabled: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(51, 65, 85, 0.5)',
    opacity: 0.7,
    elevation: 0, // No shadow for disabled cards
    shadowOpacity: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    // NOTE: 'Orbitron' font must be linked in your native project
    fontFamily: 'Orbitron-Bold',
    fontSize: 28,
    fontWeight: '700',
    color: '#38BDF8', // sky-400
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate-400
    marginBottom: 12,
  },
  lockIcon: {
    color: 'rgba(56, 189, 248, 0.5)',
    marginLeft: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#D1D5DB', // slate-300
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#334155', // slate-700
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0EA5E9', // sky-500
    borderRadius: 5,
  },
  progressBarFillDisabled: {
    backgroundColor: 'rgba(14, 165, 233, 0.5)',
  },
  unlockMessage: {
    fontSize: 12,
    color: '#FBBF24', // amber-400
    marginTop: 8,
  },
  noLevelsMessage: {
    fontSize: 12,
    color: '#64748B', // slate-500
    marginTop: 8,
  },
});

export default CategorySelector;