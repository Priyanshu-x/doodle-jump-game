import Phaser from 'phaser'
import { setupLoadingProgressUI } from '../utils.js'

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' })
  }

  preload() {
    // Load progress bar
    setupLoadingProgressUI(this)
    
    // Load asset pack by type
    this.load.pack('assetPack', 'assets/asset-pack.json')
  }

  create() {
    // Start title scene after loading complete
    this.scene.start('TitleScene')
  }
}
