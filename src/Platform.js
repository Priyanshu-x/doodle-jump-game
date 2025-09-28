import Phaser from 'phaser'
import { platformConfig } from './gameConfig.json'

export class Platform extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'normal') {
    const textures = {
      'normal': 'uniform_doodle_normal_platform',
      'breaking': 'cracked_doodle_platform',
      'moving': 'uniform_doodle_moving_platform',
      'spring': 'purple_doodle_spring_platform'
    }

    super(scene, x, y, textures[type])

    // Add to scene
    scene.add.existing(this)
    
    // Platform properties
    this.scene = scene
    this.platformType = type
    this.hasBeenStepped = false
    this.isDestroyed = false

    // Moving platform properties
    this.direction = Phaser.Math.Between(0, 1) ? -1 : 1
    this.moveSpeed = platformConfig.movingPlatformSpeed.value

    // Set platform scale
    this.setPlatformScale()

    // Set origin
    this.setOrigin(0.5, 0.5)

    // Initialize sound effects
    this.initializeSounds()

    // Set physics body based on platform type
    if (type === 'moving') {
      // Moving platform needs dynamic body
      scene.physics.add.existing(this) // Dynamic body
      this.body.setImmovable(true) // Set as immovable (but can set velocity)
      this.body.setAllowGravity(false)
      this.body.setVelocityX(this.direction * this.moveSpeed)
    } else {
      // Other platforms use static bodies
      scene.physics.add.existing(this, true) // true means static body
    }
  }

  setPlatformScale() {
    const targetWidth = 120 // Target width
    let originalWidth
    
    // Use unified original size to maintain consistent appearance
    switch(this.platformType) {
      case 'normal':
        originalWidth = 690
        break
      case 'breaking':
        originalWidth = 795
        break
      case 'moving':
        originalWidth = 967
        break
      case 'spring':
        originalWidth = 1052
        break
      default:
        originalWidth = 690
    }

    this.platformScale = targetWidth / originalWidth
    this.setScale(this.platformScale)
  }

  initializeSounds() {
    this.platformBreakSound = this.scene.sound.add("platform_break", { volume: 0.3 })
    this.springBounceSound = this.scene.sound.add("spring_boing", { volume: 0.3 })
    this.platformCompressSound = this.scene.sound.add("platform_compress", { volume: 0.3 })
  }

  update() {
    if (this.isDestroyed) return

    // Moving platform logic
    if (this.platformType === 'moving') {
      const screenWidth = this.scene.cameras.main.width
      const halfWidth = (this.width * this.platformScale) / 2
      const leftBound = halfWidth + 10
      const rightBound = screenWidth - halfWidth - 10
      
      // Simple boundary detection and reversal
      if (this.x <= leftBound) {
        this.x = leftBound // Ensure does not go beyond boundaries
        this.direction = 1 // Move right
        this.body.setVelocityX(this.direction * this.moveSpeed)
      } else if (this.x >= rightBound) {
        this.x = rightBound // Ensure does not go beyond boundaries
        this.direction = -1 // Move left
        this.body.setVelocityX(this.direction * this.moveSpeed)
      }
      
      // Ensure velocity is always set correctly
      if (this.body.velocity.x === 0) {
        this.body.setVelocityX(this.direction * this.moveSpeed)
      }
    }

    // If platform falls too far below screen, destroy it
    if (this.y > this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 300) {
      this.destroy()
    }
  }

  // Player steps on platform
  onPlayerLand(player) {
    switch(this.platformType) {
      case 'normal':
        this.handleNormalPlatform(player)
        break
      case 'breaking':
        this.handleBreakingPlatform(player)
        break
      case 'moving':
        this.handleMovingPlatform(player)
        break
      case 'spring':
        this.handleSpringPlatform(player)
        break
    }
  }

  handleNormalPlatform(player) {
    // Normal platform only needs to make player jump
    player.jump()
  }

  handleBreakingPlatform(player) {
    if (this.hasBeenStepped) return

    this.hasBeenStepped = true
    player.jump()

    // Breaking platform breaks after delay when stepped on
    this.scene.time.delayedCall(100, () => {
      this.breakPlatform()
    })
  }

  handleMovingPlatform(player) {
    // Moving platform normal jump
    player.jump()
  }

  handleSpringPlatform(player) {
    // Spring platform provides higher jump
    player.springJump()
    
    // Play spring sound effect
    this.springBounceSound.play()
    
    // Switch to compressed state texture
    this.setTexture('purple_spring_platform_compressed')
    
    // Switch back to normal state after delay
    this.scene.time.delayedCall(200, () => {
      this.setTexture('purple_doodle_spring_platform')
    })
  }

  breakPlatform() {
    if (this.isDestroyed) return

    this.isDestroyed = true
    this.platformBreakSound.play()

    // Play breaking animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: this.platformScale * 1.2,
      scaleY: this.platformScale * 0.8,
      duration: 300,
      onComplete: () => {
        this.destroy()
      }
    })
  }

  // Create static method for random platform type generation
  static getRandomPlatformType() {
    const rand = Phaser.Math.Between(1, 100)
    
    if (rand <= platformConfig.normalPlatformChance.value) {
      return 'normal'
    } else if (rand <= platformConfig.normalPlatformChance.value + platformConfig.breakingPlatformChance.value) {
      return 'breaking'
    } else if (rand <= platformConfig.normalPlatformChance.value + platformConfig.breakingPlatformChance.value + platformConfig.movingPlatformChance.value) {
      return 'moving'
    } else {
      return 'spring'
    }
  }
}