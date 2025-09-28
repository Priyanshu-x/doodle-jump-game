import Phaser from 'phaser'
import { powerupConfig } from './gameConfig.json'

export class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'jetpack') {
    const textures = {
      'jetpack': 'jetpack_powerup',
      'spring_shoes': 'spring_shoes_powerup',
      'propeller_hat': 'propeller_hat_powerup'
    }

    super(scene, x, y, textures[type])

    // Add to scene and physics system
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Power-up properties
    this.scene = scene
    this.powerupType = type
    this.isCollected = false

    // Set physics properties
    this.body.setAllowGravity(false) // Power-up floats
    this.body.setImmovable(true)

    // Set power-up scale
    this.setPowerupScale()

    // Set origin
    this.setOrigin(0.5, 0.5)

    // Add floating animation
    this.addFloatingAnimation()
  }

  setPowerupScale() {
    const targetSize = 50 // Target size
    let originalSize
    
    switch(this.powerupType) {
      case 'jetpack':
        originalSize = 620 // Use width as reference
        break
      case 'spring_shoes':
        originalSize = 764
        break
      case 'propeller_hat':
        originalSize = 834
        break
      default:
        originalSize = 620
    }

    this.powerupScale = targetSize / originalSize
    this.setScale(this.powerupScale)
  }

  addFloatingAnimation() {
    // Add up-down floating animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Add rotation animation
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1
    })
  }

  update() {
    if (this.isCollected) return

    // If power-up falls too far below screen, destroy it
    if (this.y > this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 300) {
      this.destroy()
    }
  }

  // Collected by player
  collect(player) {
    if (this.isCollected) return

    this.isCollected = true
    
    // Player collects power-up
    player.collectPowerup(this.powerupType)

    // Play collection effect
    this.scene.tweens.add({
      targets: this,
      scaleX: this.powerupScale * 1.5,
      scaleY: this.powerupScale * 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.destroy()
      }
    })

    return true
  }

  // Static method: random power-up type generation
  static getRandomPowerupType() {
    const rand = Phaser.Math.Between(1, 100)
    const jetpackChance = powerupConfig.jetpackChance.value
    const springShoesChance = powerupConfig.springShoesChance.value
    const propellerHatChance = powerupConfig.propellerHatChance.value
    
    if (rand <= jetpackChance) {
      return 'jetpack'
    } else if (rand <= jetpackChance + springShoesChance) {
      return 'spring_shoes'
    } else if (rand <= jetpackChance + springShoesChance + propellerHatChance) {
      return 'propeller_hat'
    } else {
      return null // Do not generate power-up
    }
  }
}