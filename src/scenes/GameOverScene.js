import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  create() {
    // Create semi-transparent black background overlay
    this.add.rectangle(0, 0, screenSize.width.value, screenSize.height.value, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setScrollFactor(0)

    this.createUI()
    this.setupInputs()
  }

  createUI() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create "GAME OVER" text
    this.gameOverText = this.add.text(screenWidth / 2, screenHeight * 0.3, 'GAME OVER', {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.min(screenWidth / 8, 48) + 'px',
      fill: '#ff3333',
      stroke: '#ffffff',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5, 0.5).setScrollFactor(0)

    // Get score information from game scene
    const gameScene = this.scene.get('GameScene')
    if (gameScene && gameScene.score !== undefined) {
      // Create score display
      this.finalScoreText = this.add.text(screenWidth / 2, screenHeight * 0.45, `Final Score: ${gameScene.score}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: Math.min(screenWidth / 12, 32) + 'px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5, 0.5).setScrollFactor(0)

      // Create highest height display
      this.finalHeightText = this.add.text(screenWidth / 2, screenHeight * 0.55, `Max Height: ${gameScene.highestY}m`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: Math.min(screenWidth / 15, 24) + 'px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }).setOrigin(0.5, 0.5).setScrollFactor(0)
    }

    // Create restart text
    this.restartText = this.add.text(screenWidth / 2, screenHeight * 0.7, 'TAP TO RESTART', {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.min(screenWidth / 12, 28) + 'px',
      fill: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5, 0.5).setScrollFactor(0)

    // Create return to main menu text
    this.menuText = this.add.text(screenWidth / 2, screenHeight * 0.8, 'PRESS ESC FOR MENU', {
      fontFamily: 'Arial, sans-serif',
      fontSize: Math.min(screenWidth / 18, 20) + 'px',
      fill: '#cccccc',
      stroke: '#333333',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5, 0.5).setScrollFactor(0)

    // Add blinking animation
    this.tweens.add({
      targets: this.restartText,
      alpha: 0.5,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  setupInputs() {
    // Listen for click/touch events - restart
    this.input.on('pointerdown', () => {
      this.restartGame()
    })

    // Listen for keyboard events
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    this.enterKey.on('down', () => {
      this.restartGame()
    })

    this.spaceKey.on('down', () => {
      this.restartGame()
    })

    this.escKey.on('down', () => {
      this.backToMenu()
    })
  }

  restartGame() {
    // Play click sound effect
    this.sound.add("ui_click", { volume: 0.3 }).play()
    
    // Stop current scene, restart game
    this.scene.stop('GameScene')
    this.scene.start('GameScene')
    this.scene.stop()
  }

  backToMenu() {
    // Play click sound effect
    this.sound.add("ui_click", { volume: 0.3 }).play()
    
    // Return to title screen
    this.scene.stop('GameScene')
    this.scene.start('TitleScene')
    this.scene.stop()
  }
}