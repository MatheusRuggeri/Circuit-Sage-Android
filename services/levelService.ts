import { Level, LevelCategory } from '../types';

// Use `require` to bundle the JSON files directly with the app.
// The paths are relative to this source file.
const levelFileGroups: Record<LevelCategory, Level[]> = {
  [LevelCategory.Basic]: [
	require('../levels/basic/level_00001.json'),
    require('../levels/basic/level_00002.json'),
    require('../levels/basic/level_00003.json'),
    require('../levels/basic/level_00004.json'),
    require('../levels/basic/level_00005.json'),
    require('../levels/basic/level_00006.json'),
    require('../levels/basic/level_00007.json'),
    require('../levels/basic/level_00008.json'),
    require('../levels/basic/level_00009.json'),
    require('../levels/basic/level_00010.json'),
    require('../levels/basic/level_00011.json'),
    require('../levels/basic/level_00012.json'),
    require('../levels/basic/level_00013.json'),
    require('../levels/basic/level_00014.json'),
    require('../levels/basic/level_00015.json'),
    require('../levels/basic/level_00016.json'),
    require('../levels/basic/level_00017.json'),
    require('../levels/basic/level_00018.json'),
    require('../levels/basic/level_00019.json'),
    require('../levels/basic/level_00020.json'),
    require('../levels/basic/level_00021.json'),
    require('../levels/basic/level_00022.json'),
    require('../levels/basic/level_00023.json'),
    require('../levels/basic/level_00024.json'),
    require('../levels/basic/level_00025.json'),
    require('../levels/basic/level_00026.json'),
    require('../levels/basic/level_00027.json'),
    require('../levels/basic/level_00028.json'),
    require('../levels/basic/level_00029.json'),
    require('../levels/basic/level_00030.json'),
    require('../levels/basic/level_00031.json'),
    require('../levels/basic/level_00032.json'),
    require('../levels/basic/level_00033.json'),
    require('../levels/basic/level_00034.json'),
    require('../levels/basic/level_00035.json'),
    require('../levels/basic/level_00036.json'),
    require('../levels/basic/level_00037.json'),
    require('../levels/basic/level_00038.json'),
    require('../levels/basic/level_00039.json'),
    require('../levels/basic/level_00040.json'),
    require('../levels/basic/level_00041.json'),
    require('../levels/basic/level_00042.json'),
    require('../levels/basic/level_00043.json'),
    require('../levels/basic/level_00044.json'),
    require('../levels/basic/level_00045.json'),
    require('../levels/basic/level_00046.json'),
    require('../levels/basic/level_00047.json'),
    require('../levels/basic/level_00048.json'),
    require('../levels/basic/level_00049.json'),
    require('../levels/basic/level_00050.json'),
    require('../levels/basic/level_00051.json'),
    require('../levels/basic/level_00052.json'),
    require('../levels/basic/level_00053.json'),
    require('../levels/basic/level_00054.json'),
    require('../levels/basic/level_00055.json'),
    require('../levels/basic/level_00056.json'),
    require('../levels/basic/level_00057.json'),
    require('../levels/basic/level_00058.json'),
    require('../levels/basic/level_99999.json'),
	
	
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