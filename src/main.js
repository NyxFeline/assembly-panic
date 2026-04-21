import * as Phaser from "phaser";
import BootScene from "./scenes/BootScene.js";
import GameScene from "./GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  parent: "app",
  audio: {
    disableWebAudio: false,
  },
  scene: [BootScene, GameScene, UIScene],
};

const initGame = () => {
  if (!window.game) {
    window.game = new Phaser.Game(config);
  }
};

if (document.fonts) {
  document.fonts.load('1em "Jersey 10"')
    .then(() => initGame())
    .catch(() => initGame());
} else {
  initGame();
}