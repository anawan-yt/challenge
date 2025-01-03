export function isTouchingFromAbove(
  object1: { x: number; y: number },
  object2: { x: number; y: number; displayWidth: number; displayHeight: number }
) {
  const dx = object1.x - object2.x - object2.displayWidth / 2
  const dy = object1.y - object2.y - object2.displayHeight / 2

  const angle = Math.atan2(dy, dx)
  const angleDeg = Phaser.Math.RadToDeg(angle)
  return angleDeg <= -45 && angleDeg >= -135
}
