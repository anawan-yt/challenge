import { PlayerMode, TILE_SIZE } from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class Transformer extends Phaser.GameObjects.Rectangle {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    mode: string,
    group: Phaser.Physics.Arcade.StaticGroup
  ) {
    super(scene, x, y, width, height, 0x83769c)
    this.setOrigin(0)

    const emitter = scene.add.particles(x, y, TextureKey.ParticleTransformer, {
      speed: { min: -40, max: 40 },
      scale: { min: 0.6, max: 1 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 100,
      quantity: 5,
    })
    emitter.addEmitZone({
      type: 'random',
      quantity: 5,
      source: new Phaser.Geom.Rectangle(0, 0, width, height),
    })

    scene.add.existing(this)

    const isHorizontal = height === TILE_SIZE / 4
    const hitboxWidth = isHorizontal ? width : 1
    const hitboxHeight = isHorizontal ? 1 : height
    const hitboxBeforeX = isHorizontal ? x : x + TILE_SIZE / 2 + width
    const hitboxBeforeY = isHorizontal ? y - TILE_SIZE / 2 : y
    const hitboxBefore = scene.add
      .rectangle(hitboxBeforeX, hitboxBeforeY, hitboxWidth, hitboxHeight, 0x83769c, 0)
      .setOrigin(0)
    hitboxBefore.setData('mode', mode)
    group.add(hitboxBefore)

    const hitboxAfterX = isHorizontal ? x : x - TILE_SIZE / 2
    const hitboxAfterY = isHorizontal ? y + TILE_SIZE / 2 + height : y
    const hitboxAfter = scene.add
      .rectangle(hitboxAfterX, hitboxAfterY, hitboxWidth, hitboxHeight, 0x83769c, 0)
      .setOrigin(0)
    hitboxAfter.setData('mode', mode === PlayerMode.Platformer ? PlayerMode.Flappy : PlayerMode.Platformer)
    group.add(hitboxAfter)
  }
}
