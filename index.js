const canvas = document.getElementById('canvas')
let gx = 0
let gy = 0
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const randomRange = (x, y) => parseInt(Math.random() * (y - x), 10) + x
const randomFloatRange = (x, y) => parseFloat(Math.random() * (y - x), 10) + x
const randomMember = (arr) => arr[parseInt(Math.random() * arr.length, 10)]

function center(x, y, w, h) {
  return [x - w / 2, y - h / 2, w, h]
}

function logArguments(name, fn) {
  return (...args) => {
    console.log(`[${name}]`, ...args)
    fn(...args)
  }
}

class CollisionsController {
  constructor(colliders) {
    this.colliders = []
    this.collidees = []
  }

  pushCollidee = (collidee) => {
    this.collidees.push(collidee)
  }

  pushCollider = (collider) => {
    this.colliders.push(collider)
  }

  checkCollisions(entity) {

    const {
      topLeft,
      topRight,
      bottomLeft,
      bottomRight
    } = entity.getBoundingBox()

    for (let index = 0; index < this.colliders.length; index++) {
      const collider = this.colliders[index]

      ctx.beginPath()
      ctx.rect(collider.x, collider.y, collider.w, collider.h)
      if (
        ctx.isPointInPath(...topLeft) ||
        ctx.isPointInPath(...topRight) ||
        ctx.isPointInPath(...bottomLeft) ||
        ctx.isPointInPath(...bottomRight)
      ) {
        entity.life = Infinity
      }
      ctx.closePath()

    }

  }

  step() {
    for (let i = 0; i < this.collidees.length; i++) {
      const particle = this.collidees[i]
      if (particle.life >= particle.lifetime) {
        this.collidees.splice(i, 1)
      } else {
        this.checkCollisions(particle)
      }
    }
    // checks tutt e cos1
  }

}

const collisionController = new CollisionsController()
