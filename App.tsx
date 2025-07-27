import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native'; 

import { Level, UserProgress, LevelCategory } from './types';
import { loadLevels, loadLevelById } from './services/levelService';
import { unlockAchievement } from './services/achievementService'; // Import achievement service
import { LEVEL_TRIGGERED_ACHIEVEMENTS } from './constants'; // Import achievement constants
import LevelSelector from './components/level/LevelSelector';
import CategorySelector from './components/category/CategorySelector'; 
import LevelDisplay from './components/level/LevelDisplay';
import RandomModeDisplay from './components/random/RandomModeDisplay'; // New component for Random Mode
import useLocalStorage from './hooks/useLocalStorage';

enum AppState {
  Loading,
  CategorySelection, 
  LevelSelectionInCategory, 
  RandomModeMenu, // New state for Random Mode screen
  PlayingLevel,
  Sandbox, // Future use
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Loading);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LevelCategory | null>(null);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('logicCircuitUserProgress', {
    completedLevels: {},
    awardedAchievements: {}, // Initialize awardedAchievements
  });

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const levels = await loadLevels();
        console.log("Loaded");

        // 1. First, save the fetched data to your component's state.
        setAllLevels(levels); 
        // 2. THEN, change the app state to show the next screen.
        setAppState(AppState.CategorySelection);
        
      } catch (error) {
        console.error("Failed to load levels:", error);
        // Handle error state appropriately
      }
    };
    fetchLevels();
  }, []);

  const handleSelectCategory = useCallback((category: LevelCategory) => {
    setSelectedCategory(category);
    setAppState(AppState.LevelSelectionInCategory);
  }, []);

  const handleNavigateToRandomModeMenu = useCallback(() => {
    setSelectedCategory(LevelCategory.Random); // Or null, depending on if RandomModeDisplay needs it
    setAppState(AppState.RandomModeMenu);
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
    setAppState(AppState.CategorySelection);
  }, []);

  const handleNavigateToLevel = useCallback(async (levelId: string) => {
    let level = allLevels.find(l => l.levelId === levelId);
    if (!level) {
      // Attempt to load dynamically if not found (e.g. if cache was cleared or new level added)
      level = await loadLevelById(levelId);
    }

    if (level) {
      setCurrentLevel(level);
      setAppState(AppState.PlayingLevel);
    } else {
      console.error(`Level with id ${levelId} not found.`);
      setAppState(AppState.CategorySelection); // Fallback to category selection
    }
  }, [allLevels]);

  const handleSelectLevel = useCallback((levelId: string) => {
    handleNavigateToLevel(levelId);
  }, [handleNavigateToLevel]);

  const handleBackToLevelList = useCallback(() => {
    setCurrentLevel(null);
    if (selectedCategory === LevelCategory.Random) {
      setAppState(AppState.RandomModeMenu);
    } else if (selectedCategory) {
      setAppState(AppState.LevelSelectionInCategory);
    } else {
      setAppState(AppState.CategorySelection); // Fallback
    }
  }, [selectedCategory]);

  const handleLevelComplete = useCallback((levelId: string, stars: number) => {
    setUserProgress(prev => {
      const isFirstCompletion = !prev.completedLevels[levelId];
      const existingStars = prev.completedLevels[levelId]?.stars || 0;
      const newAwardedAchievements = { ... (prev.awardedAchievements || {}) };

      // Check for level-triggered achievements on first completion
      if (isFirstCompletion) {
        const achievementToUnlock = LEVEL_TRIGGERED_ACHIEVEMENTS[levelId];
        if (achievementToUnlock && !newAwardedAchievements[achievementToUnlock]) {
          unlockAchievement(achievementToUnlock);
          newAwardedAchievements[achievementToUnlock] = true;
        }
      }

      return {
        ...prev,
        completedLevels: {
          ...prev.completedLevels,
          [levelId]: { stars: Math.max(stars, existingStars) },
        },
        awardedAchievements: newAwardedAchievements,
      };
    });
  }, [setUserProgress]);

  const handleNavigateToNextLevel = useCallback(() => {
    if (!currentLevel || allLevels.length === 0 ) {
      handleBackToLevelList();
      return;
    }
    
    // For random levels, next level behaviour might be different (e.g. back to random menu or another random)
    // For now, it will use the current category, if currentLevel belongs to one.
    const currentLevelCategory = currentLevel.category;

    if (currentLevelCategory === LevelCategory.Random) {
      // After a random level, go back to the random menu to pick another or see stats.
      setAppState(AppState.RandomModeMenu);
      setCurrentLevel(null);
      return;
    }
    
    // For non-random levels, find next in its category
    const levelsInCategory = allLevels.filter(l => l.category === currentLevelCategory);
    const currentIndexInBuffer = levelsInCategory.findIndex(l => l.levelId === currentLevel.levelId);

    if (currentIndexInBuffer === -1 || currentIndexInBuffer === levelsInCategory.length - 1) {
      handleBackToLevelList(); // Last level in category or not found
    } else {
      const nextLevelId = levelsInCategory[currentIndexInBuffer + 1].levelId;
      handleNavigateToLevel(nextLevelId);
    }
  }, [currentLevel, allLevels, handleBackToLevelList, handleNavigateToLevel]);


  const renderContent = () => {
    switch (appState) {
      case AppState.Loading:
        console.log("Loading...");
        return (
          <View style={styles.container}>
            <Text style={styles.text}>Loading Logic Circuits...</Text>
          </View>
        );
      case AppState.CategorySelection:
        console.log("Select Category...");
        return <CategorySelector 
                  allLevels={allLevels} 
                  userProgress={userProgress} 
                  setUserProgress={setUserProgress} // Pass setUserProgress for category unlock achievements
                  onSelectCategory={handleSelectCategory} 
                  onNavigateToRandomMode={handleNavigateToRandomModeMenu}
                />;
      case AppState.LevelSelectionInCategory:
        console.log("Select Level...");
        if (selectedCategory && selectedCategory !== LevelCategory.Random) {
          const levelsForCategory = allLevels.filter(l => l.category === selectedCategory);
          return <LevelSelector 
                    levels={levelsForCategory} 
                    onSelectLevel={handleSelectLevel} 
                    userProgress={userProgress}
                    categoryName={selectedCategory}
                    onBackToCategories={handleBackToCategories}
                  />;
        }
        // Fallback if category is Random or null, should go to CategorySelection or RandomModeMenu
        handleBackToCategories(); // Or specific logic
        return null; 
      case AppState.RandomModeMenu:
        console.log("Random Mode...");
        return <RandomModeDisplay
                  allLevels={allLevels}
                  userProgress={userProgress}
                  onPlayRandomLevel={handleNavigateToLevel}
                  onBackToCategories={handleBackToCategories}
                />;
      case AppState.PlayingLevel:
        console.log("Playing a game...");
        if (currentLevel) {
          return (
            <LevelDisplay 
              level={currentLevel} 
              onBackToLevels={handleBackToLevelList}
              onLevelComplete={handleLevelComplete}
              initialUserProgressStars={userProgress.completedLevels[currentLevel.levelId]?.stars}
              onNavigateToNextLevel={handleNavigateToNextLevel}
            />
          );
        }
        console.log("Error...");
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: Level data missing.</Text>
          </View>
        );
      default:
        console.log("Welcome!");
        return (
          <View>
            <Text style={styles.welcomeText}>Welcome! Select an option.</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.screen}> 
      <View style={styles.contentWrapper}>
      {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: '#38bdf8', // Tailwind's sky-400
  },
  screen: {
    flex: 1,
    backgroundColor: '#0f172a', // Tailwind's bg-slate-900
  },
  contentWrapper: {
    flex: 1,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444', // Tailwind's text-red-500
  },
  welcomeText: {
    padding: 32,
    textAlign: 'center',
  },
});


export default App;
