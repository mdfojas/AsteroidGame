export class Projectile{
    constructor({position, direction, rotation}){
        this.position = position // {x, y }
        this.direction = direction 
        this.radius = 5
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0 ,Math.PI * 2, false)
        ctx.closePath()
        ctx.fillStyle = 'red'
        ctx.fill()
    }

    update(){
        this.draw()
        this.position.x += this.direction.x
        this.position.y += this.direction.y
    }
}