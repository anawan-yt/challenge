export function stringifyTime(elapsed: number) {
  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  const centiseconds = Math.floor(elapsed % 1000)
  return (
    Phaser.Utils.String.Pad(minutes, 2, '0', 1) +
    "'" +
    Phaser.Utils.String.Pad(seconds, 2, '0', 1) +
    '"' +
    Phaser.Utils.String.Pad(centiseconds, 3, '0', 1)
  )
}
