import Phaser from 'phaser'
import { enemyConfig } from './gameConfig.json'

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy_monster")

    // Add to scene and physics system
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // Enemy properties
    this.scene = scene
    this.moveSpeed = enemyConfig.moveSpeed.value
    this.isDead = false
    this.direction = Phaser.Math.Between(0, 1) ? -1 : 1 // Random initial direction

    // Set physics properties
    this.body.setGravityY(800)
    this.body.setAllowGravity(false) // Enemy not affected by gravity, free flying

    // Set collision box
    this.collisionBoxWidth = 678 * 0.8
    this.collisionBoxHeight = 839 * 0.8
    this.body.setSize(this.collisionBoxWidth, this.collisionBoxHeight)

    // Set enemy scale
    const standardHeight = 50 // Enemy slightly smaller than player
    this.enemyScale = standardHeight / 839
    this.setScale(this.enemyScale)

    // Set initial origin
    this.setOrigin(0.5, 1.0)

    // Enemy stays still
    this.body.setVelocityX(0)

    // Initialize sound effects
    this.initializeSounds()
  }

  initializeSounds() {
    this.enemyDefeatSound = this.scene.sound.add("enemy_defeat", { volume: 0.3 })
  }

  update() {
    if (this.isDead || !this.active) return

    // If enemy falls too far below screen, destroy it
    if (this.y > this.scene.cameras.main.scrollY + this.scene.cameras.main.height + 200) {
      this.destroy()
    }
  }

  // Stomped by player
  stepOn() {
    if (this.isDead) return

    this.isDead = true
    this.enemyDefeatSound.play()

    // Play death animation effect
    this.scene.tweens.add({
      targets: this,
      scaleX: this.enemyScale * 1.2,
      scaleY: this.enemyScale * 0.8,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.destroy()
      }
    })

    // Give player upward velocity to simulate stomp bounce
    return true
  }

  // Hit by bullet
  hitByBullet() {
    if (this.isDead) return

    this.isDead = true
    this.enemyDefeatSound.play()

    // Play hit effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: this.enemyScale * 1.5,
      scaleY: this.enemyScale * 1.5,
      duration: 200,
      onComplete: () => {
        this.destroy()
      }
    })

    return true
  }
}