export class Player{
    constructor({position, velocity, rotation}){
        this.position = position // {x, y }
        this.velocity = velocity 
        this.rotation = rotation
    }

    draw(){
        ctx.save()

        // translate to the center of the player, totate, and then translate back to the original position of the canvas
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x, -this.position.y)

        ctx.arc(this.position.x , this.position.y, 5, 0 , Math.PI * 2, false)
        ctx.fillStyle = 'red'
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(this.position.x + SHIP_EDGE, this.position.y)
        ctx.lineTo(this.position.x -10, this.position.y - 10)
        ctx.lineTo(this.position.x -10, this.position.y + 10)
        ctx.closePath()

        ctx.strokeStyle = "white"
        ctx.stroke()
        ctx.restore()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}