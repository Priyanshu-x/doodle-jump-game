import Phaser from 'phaser'
import { Player } from '../Player.js'
import { Platform } from '../Platform.js'
import { Enemy } from '../Enemy.js'
import { Powerup } from '../Powerup.js'
import { setupLoadingProgressUI } from '../utils.js'
import { screenSize, platformConfig, enemyConfig, powerupConfig, gameConfig } from '../gameConfig.json'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  preload() {
    // All assets are already loaded by PreloaderScene
    // No need to load anything here
  }

  create() {
    // Initialize game state
    this.gameStarted = false
    this.gameOver = false
    this.score = 0
    this.highestY = 0

    // Create detailed notebook style background
    this.createNotebookBackground()

    // Create physics groups
    this.platforms = this.add.group()
    this.enemies = this.add.group()
    this.powerups = this.add.group()
    this.bullets = this.add.group()

    // Create player
    this.player = new Player(this, screenSize.width.value / 2, screenSize.height.value - 100)

    // Create initial platforms
    this.createInitialPlatforms()

    // Setup camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setLerp(0.1, 0.1)

    // Create input controls
    this.setupInputs()

    // Setup collision detection
    this.setupCollisions()

    // Launch UI scene
    this.scene.launch("UIScene", { gameSceneKey: this.scene.key })

    // Platform generation related
    this.lastPlatformY = screenSize.height.value - 100
    this.platformSpacing = platformConfig.platformSpacing.value

    // Play background music
    this.backgroundMusic = this.sound.add("gentle_background_ambient", {
      volume: 0.15,
      loop: true
    })
    this.backgroundMusic.play()

    // Start game
    this.startGame()
  }

  createInitialPlatforms() {
    // Create initial platform under player
    const startPlatform = new Platform(this, screenSize.width.value / 2, screenSize.height.value - 50, 'normal')
    this.platforms.add(startPlatform)

    // Create some initial platforms
    for (let i = 1; i <= 5; i++) {
      const x = Phaser.Math.Between(60, screenSize.width.value - 60)
      const y = screenSize.height.value - 50 - (i * this.platformSpacing)
      const type = Platform.getRandomPlatformType()
      const platform = new Platform(this, x, y, type)
      this.platforms.add(platform)
    }
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    // Add touch controls
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameStarted || this.gameOver) return

      // Move player based on touch position
      if (pointer.x < screenSize.width.value / 2) {
        this.cursors.left.isDown = true
        this.cursors.right.isDown = false
      } else {
        this.cursors.right.isDown = true
        this.cursors.left.isDown = false
      }

      // Touch can also shoot
      this.spaceKey.isDown = true
    })

    this.input.on('pointerup', () => {
      this.cursors.left.isDown = false
      this.cursors.right.isDown = false
      this.spaceKey.isDown = false
    })
  }

  setupCollisions() {
    // Player-platform collision - only triggered when player is falling
    this.physics.add.overlap(this.player, this.platforms, (player, platform) => {
      if (player.body.velocity.y > 0 && player.y < platform.y) {
        platform.onPlayerLand(player)
      }
    })

    // Player-enemy collision - stomp or collision
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (player.body.velocity.y > 0 && player.y < enemy.y) {
        // Player stomps enemy
        if (enemy.stepOn()) {
          player.jump() // Bounce after stomp
          this.updateScore(100) // Gain score
        }
      } else {
        // Player hits enemy, game over
        this.gameOver = true
        player.die()
      }
    })

    // Player-power-up collision
    this.physics.add.overlap(this.player, this.powerups, (player, powerup) => {
      if (powerup.collect(player)) {
        this.updateScore(200) // Gain score for collecting power-up
      }
    })

    // Bullet-enemy collision
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      if (enemy.hitByBullet()) {
        bullet.destroy()
        this.updateScore(150) // Gain score for defeating enemy
      }
    })
  }


  startGame() {
    this.gameStarted = true
    // Give player initial upward velocity
    this.player.jump()
  }

  update() {
    if (!this.gameStarted || this.gameOver) return

    // Update player
    this.player.update(this.cursors, this.spaceKey)

    // Update platforms
    this.platforms.children.entries.forEach(platform => {
      if (platform.update) platform.update()
    })

    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.update) enemy.update()
    })

    // Update power-ups
    this.powerups.children.entries.forEach(powerup => {
      if (powerup.update) powerup.update()
    })

    // Generate new platforms
    this.generateNewPlatforms()

    // Update background
    this.updateBackground()

    // Update score and height
    this.updateHeight()
    this.updateUI()

    // Clean up objects off screen
    this.cleanupOffScreenObjects()
  }

  createNotebookBackground() {
    // Initialize background management
    this.backgroundTiles = []
    this.lastBackgroundY = 0
    
    // Create initial background
    this.generateInitialBackground()
  }

  generateInitialBackground() {
    const bgWidth = 1024
    const bgHeight = 1536
    const screenWidth = screenSize.width.value
    const screenHeight = screenSize.height.value
    
    // Calculate how many backgrounds needed to cover screen
    const tilesX = Math.ceil(screenWidth / bgWidth) + 1
    const tilesY = Math.ceil((screenHeight * 2) / bgHeight) + 2
    
    for (let x = 0; x < tilesX; x++) {
      for (let y = -tilesY; y < 2; y++) {
        const bg = this.add.image(x * bgWidth, y * bgHeight, "refined_notebook_grid_background")
        bg.setOrigin(0, 0)
        bg.setDepth(-100)
        bg.setScrollFactor(1, 1)
        this.backgroundTiles.push(bg)
      }
    }
    this.lastBackgroundY = -tilesY * bgHeight
  }

  updateBackground() {
    const cameraTop = this.cameras.main.scrollY
    const bgHeight = 1536
    const screenWidth = screenSize.width.value
    const bgWidth = 1024
    
    // If camera moves up, generate new background
    if (cameraTop < this.lastBackgroundY + bgHeight * 2) {
      const tilesX = Math.ceil(screenWidth / bgWidth) + 1
      
      // Generate a new row of background
      for (let x = 0; x < tilesX; x++) {
        const bg = this.add.image(x * bgWidth, this.lastBackgroundY - bgHeight, "refined_notebook_grid_background")
        bg.setOrigin(0, 0)
        bg.setDepth(-100)
        bg.setScrollFactor(1, 1)
        this.backgroundTiles.push(bg)
      }
      this.lastBackgroundY -= bgHeight
    }
    
    // Clean up backgrounds far from camera
    this.backgroundTiles = this.backgroundTiles.filter(bg => {
      if (bg.y > cameraTop + screenSize.height.value + bgHeight) {
        bg.destroy()
        return false
      }
      return true
    })
  }

  generateNewPlatforms() {
    const cameraTop = this.cameras.main.scrollY
    const generateThreshold = cameraTop - 200

    // If highest platform is below generation threshold, generate new platform
    if (this.lastPlatformY > generateThreshold) {
      let attempts = 0
      let validPosition = false
      let x, newY
      
      // Ensure new platform does not overlap
      while (!validPosition && attempts < 10) {
        this.lastPlatformY -= this.platformSpacing
        newY = this.lastPlatformY
        x = Phaser.Math.Between(80, screenSize.width.value - 80)
        
        // Check if overlaps with existing platforms
        const overlap = this.platforms.children.entries.some(platform => {
          if (!platform.active) return false
          const distance = Phaser.Math.Distance.Between(x, newY, platform.x, platform.y)
          return distance < 60 // Minimum distance check
        })
        
        if (!overlap) {
          validPosition = true
        }
        attempts++
      }
      
      if (validPosition) {
        const type = Platform.getRandomPlatformType()
        
        // Create platform
        const platform = new Platform(this, x, newY, type)
        this.platforms.add(platform)

        // May generate enemy - reduce probability to avoid too many enemies
        if (Phaser.Math.Between(1, 100) <= enemyConfig.spawnChance.value) {
          const enemyX = Phaser.Math.Between(80, screenSize.width.value - 80)
          const enemyY = newY - 80
          const enemy = new Enemy(this, enemyX, enemyY)
          this.enemies.add(enemy)
        }

        // May generate power-up
        const powerupType = Powerup.getRandomPowerupType()
        if (powerupType) {
          const powerupX = Phaser.Math.Between(80, screenSize.width.value - 80)
          const powerupY = newY - 60
          const powerup = new Powerup(this, powerupX, powerupY, powerupType)
          this.powerups.add(powerup)
        }
      }
    }
  }

  updateHeight() {
    const currentHeight = Math.max(0, Math.floor((screenSize.height.value - this.player.y) / 10))
    if (currentHeight > this.highestY) {
      this.highestY = currentHeight
      this.updateScore(gameConfig.scoreMultiplier.value) // Gain score for reaching new height
    }
  }

  updateScore(points) {
    this.score += points
  }

  updateUI() {
    // Send events to UIScene
    this.events.emit('updateScore', this.score)
    this.events.emit('updateHeight', this.highestY)

    // Update power-ups status display
    let powerupStatus = ''
    if (this.player.hasPropellerHat) {
      powerupStatus += 'Propeller Hat Active\n'
    }
    if (this.player.hasJetpack) {
      powerupStatus += 'Jetpack Active\n'
    }
    if (this.player.hasSpringShoes) {
      powerupStatus += 'Spring Shoes Active'
    }
    this.events.emit('updatePowerupStatus', powerupStatus)
  }

  cleanupOffScreenObjects() {
    const cameraBottom = this.cameras.main.scrollY + this.cameras.main.height + 300

    // Clean up platforms
    this.platforms.children.entries.forEach(platform => {
      if (platform.y > cameraBottom) {
        platform.destroy()
      }
    })

    // Clean up enemies
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > cameraBottom) {
        enemy.destroy()
      }
    })

    // Clean up power-ups
    this.powerups.children.entries.forEach(powerup => {
      if (powerup.y > cameraBottom) {
        powerup.destroy()
      }
    })

    // Clean up bullets
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < this.cameras.main.scrollY - 100 || bullet.y > cameraBottom) {
        bullet.destroy()
      }
    })
  }
}
