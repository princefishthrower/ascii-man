import { LevelConfig } from '../../types';
import { testLevel } from './TestLevel';

export default class LevelManager {
  private levels: Record<string, LevelConfig> = {
    test: testLevel
  };
  
  getLevel(levelName: string): LevelConfig {
    return this.levels[levelName] || this.levels.test;
  }
}