import Phaser from 'phaser'
import { screenSize } from '../gameConfig.json'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }

  preload() {
    // All assets are already loaded by PreloaderScene
    // No need to load anything here
  }

  create() {
    // Create notebook style background
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create tiled background to cover entire screen
    const bgWidth = 1024
    const bgHeight = 1536
    const tilesX = Math.ceil(screenWidth / bgWidth) + 1
    const tilesY = Math.ceil(screenHeight / bgHeight) + 1
    
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const bg = this.add.image(x * bgWidth, y * bgHeight, "refined_notebook_title_background")
        bg.setOrigin(0, 0)
        bg.setDepth(-100)
      }
    }

    this.createUI()
    this.setupInputs()
  }

  createUI() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create game title
    this.gameTitle = this.add.image(screenWidth / 2, screenHeight * 0.3, "game_title")
    
    const maxTitleWidth = screenWidth * 0.8
    const maxTitleHeight = screenHeight * 0.4

    if (this.gameTitle.width / this.gameTitle.height > maxTitleWidth / maxTitleHeight) {
        this.gameTitle.setScale(maxTitleWidth / this.gameTitle.width)
    } else {
        this.gameTitle.setScale(maxTitleHeight / this.gameTitle.height)
    }

    // Create instruction text
    this.createInstructionText()
    this.createControlsText()
  }

  createInstructionText() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create "TAP TO START" text (centered)
    this.startText = this.add.text(screenWidth / 2, screenHeight * 0.65, 'TAP TO START', {
      fontFamily: 'SupercellMagic',
      fontSize: Math.min(screenWidth / 10, 32) + 'px',
      fill: '#333333',
      stroke: '#ffffff',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5, 0.5)

    // Add blinking animation
    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })
  }

  createControlsText() {
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Create control instruction text
    const controlsText = `
← → : Move left/right
SPACE : Shoot
TAP LEFT/RIGHT : Move
TAP : Shoot

Jump on platforms to go higher!
Avoid enemies or shoot them!
Collect power-ups for special abilities!
    `.trim()

    this.controlsDisplay = this.add.text(screenWidth / 2, screenHeight * 0.85, controlsText, {
      fontFamily: 'SupercellMagic',
      fontSize: Math.min(screenWidth / 25, 14) + 'px',
      fill: '#666666',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0.5)
  }

  setupInputs() {
    // Listen for click/touch events
    this.input.on('pointerdown', () => {
      this.startGame()
    })

    // Listen for keyboard events
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    this.enterKey.on('down', () => {
      this.startGame()
    })

    this.spaceKey.on('down', () => {
      this.startGame()
    })
  }

  startGame() {
    // Play click sound effect
    this.sound.add("ui_click", { volume: 0.3 }).play()
    
    // Start game
    this.scene.start('GameScene')
  }
}