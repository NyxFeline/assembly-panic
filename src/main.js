import * as Phaser from "phaser";
import GameScene from "./GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  scene: [GameScene, UIScene],
};

document.fonts.ready.then(() => {
  new Phaser.Game(config);
});