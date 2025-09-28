import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  init(data) {
    this.gameSceneKey = data.gameSceneKey
  }

  create() {
    // Create score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'SupercellMagic',
      fontSize: '24px',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100)

    // Create height display
    this.heightText = this.add.text(20, 50, 'Height: 0m', {
      fontFamily: 'SupercellMagic',
      fontSize: '20px',
      color: '#000000',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100)

    // Create power-up status display
    this.powerupText = this.add.text(screenSize.width.value - 20, 20, '', {
      fontFamily: 'SupercellMagic',
      fontSize: '16px',
      color: '#ff6600',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100)

    // Listen for game events from the game scene
    this.gameScene = this.scene.get(this.gameSceneKey)
    this.gameScene.events.on('updateScore', this.updateScore, this)
    this.gameScene.events.on('updateHeight', this.updateHeight, this)
    this.gameScene.events.on('updatePowerupStatus', this.updatePowerupStatus, this)
  }

  updateScore(score) {
    this.scoreText.setText(`Score: ${score}`)
  }

  updateHeight(height) {
    this.heightText.setText(`Height: ${height}m`)
  }

  updatePowerupStatus(powerupStatus) {
    this.powerupText.setText(powerupStatus)
  }
}
