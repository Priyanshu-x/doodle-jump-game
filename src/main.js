import Phaser from "phaser"
import PreloaderScene from "./scenes/PreloaderScene.js"
import { TitleScene } from "./scenes/TitleScene.js"
import GameScene from "./scenes/GameScene"
import { GameOverScene } from "./scenes/GameOverScene.js"
import UIScene from "./scenes/UIScene.js"
import { screenSize, debugConfig, renderConfig } from "./gameConfig.json"

const config = {
  type: Phaser.AUTO,
  width: screenSize.width.value,
  height: screenSize.height.value,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      fps: 120,
      gravity: { y: 0 }, // In Doodle Jump, gravity is controlled by the character itself
      debug: debugConfig.debug.value,
      debugShowBody: debugConfig.debugShowBody.value,
    },
  },
  pixelArt: renderConfig.pixelArt.value,
  scene: [PreloaderScene, TitleScene, GameScene, UIScene, GameOverScene],
}

export default new Phaser.Game(config)
