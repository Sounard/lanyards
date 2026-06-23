import LevelScene from './LevelScene.js';
import { LEVEL_SAUNA } from '../data/levelOnTheSauna.js';

// Level 2 — on-the-sauna (the Off the Radar AI conclave). Data-driven; the base
// LevelScene does the rest. New mechanics (MCP gates, Agent familiar, bot enemy
// skin) are all switched on by fields in LEVEL_SAUNA.
export default class OnTheSaunaScene extends LevelScene {
  constructor() { super('OnTheSaunaScene'); }
  levelData() { return LEVEL_SAUNA; }
}
