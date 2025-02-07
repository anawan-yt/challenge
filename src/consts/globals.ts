export const PLAYER_SIZE = 80
export const PLAYER_VELOCITY = 480
export const PLAYER_BOUNCE_OFF_VELOCITY = 800
export const PLAYER_MIN_JUMP_VELOCITY = -720
export const PLAYER_MAX_JUMP_VELOCITY = -800
export const PLAYER_FLAPPY_VELOCITY = -1040
export const PLAYER_MAX_JUMP_TIME = 150
export const PLAYER_BUFFERING_TIME = 200
export const PLAYER_COYOTE_TIME = 200
export const PLAYER_MAX_JUMPS = 2
export const PLAYER_DEATH_JUMP_X = 200
export const PLAYER_DEATH_JUMP_Y = -1200
export const PLAYER_FALL_SQUASH_VELOCITY = 1400
export const ENEMY_VELOCITY = 280
export const ENEMY2_JUMP_DELAY = 2000
export const NUM_LEVELS = 8
export const SPIKY_BALL_SPEED = 400
export const TILE_SIZE = 80
export const COIN_SIZE = 60
export const CANNON_FIRE_RATE = 1400
export const FIREBALL_VELOCITY = 720
export const BOSS_BOUNCE_VELOCITY = 1200
export const CINEMATIC_FRAME_HEIGHT = 120

export enum DepthLayer {
  Fireball,
  Cannon,
}

export enum PlayerMode {
  Platformer = 'platformer',
  Flappy = 'flappy',
}
