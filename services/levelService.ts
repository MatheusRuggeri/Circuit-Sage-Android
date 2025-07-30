import { Level, LevelCategory } from '../types';

// Use `require` to bundle the JSON files directly with the app.
// The paths are relative to this source file.
const levelFileGroups: Record<LevelCategory, Level[]> = {
  [LevelCategory.Basic]: [
    require('../levels/basic/level_0001.json'),
    require('../levels/basic/level_0002.json'),
    require('../levels/basic/level_0003.json'),
    require('../levels/basic/level_0004.json'),
    require('../levels/basic/level_0005.json'),
    require('../levels/basic/level_0006.json'),
    require('../levels/basic/level_0007.json'),
    require('../levels/basic/level_0008.json'),
    require('../levels/basic/level_0009.json'),
    require('../levels/basic/level_0010.json'),
    require('../levels/basic/level_0011.json'),
    require('../levels/basic/level_0012.json'),
    require('../levels/basic/level_0013.json'),
    require('../levels/basic/level_0014.json'),
    require('../levels/basic/level_0015.json'),
  ],
  [LevelCategory.Intermediate]: [
    require('../levels/intermediate/level_intermediate_001.json'),
    // Add require statements for new intermediate levels here
  ],
  [LevelCategory.Advanced]: [
    require('../levels/advanced/level_advanced_001.json'),
    require('../levels/advanced/level_advanced_002.json'),
    require('../levels/advanced/level_advanced_003.json'),
    require('../levels/advanced/level_advanced_004.json'),
    require('../levels/advanced/level_advanced_005.json'),
    require('../levels/advanced/level_advanced_006.json'),
    require('../levels/advanced/level_advanced_007.json'),
  ],
  [LevelCategory.Random]: [ // Added Random category levels
    require('../levels/random/level_random_001.json'),
    require('../levels/random/level_random_002.json'),
    require('../levels/random/level_random_003.json'),
    require('../levels/random/level_random_004.json'),
    require('../levels/random/level_random_005.json'),
    require('../levels/random/level_random_006.json'),
    require('../levels/random/level_random_007.json'),
    require('../levels/random/level_random_008.json'),
    require('../levels/random/level_random_009.json'),
    require('../levels/random/level_random_010.json'),
  ],
};

let allLevelsCache: Level[] | null = null;

// This function can now be synchronous as `require` is synchronous.
// We keep it async to maintain the same function signature for the rest of your app.
export const loadLevels = async (): Promise<Level[]> => {
  console.log("Loading levels...");
  if (allLevelsCache) {
    // Return a copy to prevent mutation of the cache
    return Promise.resolve([...allLevelsCache]);
  }

  const loadedLevels: Level[] = [];
  
  // Iterate over the categories and assign the category to each loaded level object.
  for (const categoryKey in levelFileGroups) {
    const category = categoryKey as LevelCategory;
    const levelsInData = levelFileGroups[category];

    const levelsWithCategory = levelsInData.map((levelData) => ({
      ...levelData,
      category: category, // Assign the category based on its group
    }));

    loadedLevels.push(...levelsWithCategory);
  }

  allLevelsCache = loadedLevels;
  console.log(`${allLevelsCache.length} levels loaded and cached.`);
  
  // Return a copy
  return Promise.resolve([...allLevelsCache]);
};

export const loadLevelById = async (levelId: string): Promise<Level | undefined> => {
  const levels = await loadLevels();
  return levels.find(level => level.levelId === levelId);
};