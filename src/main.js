import * as Phaser from "phaser";
import GameScene from "./GameScene.js";

const config = {
  type: Phaser.AUTO,
  width: "100%",
  height: 600,
  backgroundColor: "#1a1a2e",
  scene: [GameScene]
};

new Phaser.Game(config);