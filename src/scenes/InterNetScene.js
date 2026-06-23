import LevelScene from './LevelScene.js';
import { LEVEL_INTERNET } from '../data/levelInterNet.js';

// Level 1 — inter-net. All behaviour lives in the data-driven LevelScene base;
// this is just "which data".
export default class InterNetScene extends LevelScene {
  constructor() { super('InterNetScene'); }
  levelData() { return LEVEL_INTERNET; }
}
