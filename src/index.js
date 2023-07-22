const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.fillStyle = 'black'
ctx.fillRect(0,0,canvas.width,canvas.height)


const SHIP_EDGE = 30
class Player{
    constructor({position, velocity, rotation}){
        this.position = position // {x, y }
        this.velocity = velocity 
        this.rotation = rotation
        this.health = 100
        this.score = 0 
        this.invincible = false
        this.invincibilityTime = 0
    }

    draw(){
        ctx.save()

        // translate to the center of the player, totate, and then translate back to the original position of the canvas
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x, -this.position.y)

        ctx.beginPath()
        ctx.arc(this.position.x , this.position.y, 5, 0 , Math.PI * 2, false)
        ctx.fillStyle = 'red'
        ctx.fill()
        ctx.closePath()

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

class Projectile{
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

class Asteroid{
    constructor({position, direction, radius}){
        this.position = position
        this.direction = direction
        this.radius = radius
        this.damage = radius > ASTEROID_MIN_SIZE? Math.floor(ASTEROID_MIN_DAMAGE*(radius/ASTEROID_MIN_SIZE)) : ASTEROID_MIN_DAMAGE
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0 ,Math.PI * 2, false)
        ctx.closePath()
        ctx.strokeStyle = 'white'
        ctx.stroke()
    }

    update(){
        this.draw()
        this.position.x += this.direction.x
        this.position.y += this.direction.y
    }
}

const player = new Player({
    position: {x: canvas.width/2, y:canvas.height/2}, 
    velocity: {x:0,y:0},
    rotation: 0
})
player.draw()

const keys = {
    w: {pressed : false},
    a: {pressed : false},
    s: {pressed : false},
    d: {pressed : false},
}

const projectiles = []
const asteroids = []
const MOVESPEED = 3
const ROTSPEED = 0.05
const ASTEROID_MIN_SIZE = 25
const ASTEROID_MAX_SIZE = 50
const ASTEROID_SPAWN = 3000
const ASTEROID_MIN_DAMAGE = 10
const BRAKESTRENGTH = 0.95
const PROJECTILESPEED = 3
const GAME_WIN_TIME = 60000
const gameStart = new Date().getTime();

let GAMEOVER = false
let GAMEWON = false
let asteroidSpawning;

asteroidSpawning = window.setInterval(() =>{
    const quadrant =  Math.floor(Math.random()*4)
    let x, y, dx, dy
    let radius = ASTEROID_MIN_SIZE + ASTEROID_MAX_SIZE * Math.random() 
    switch (quadrant) {
        case 0: // left side moving to the right
            x = 0 - radius
            y = Math.random() * canvas.height
            dx = 1
            dy = 0
            break
        case 1: // right side moving to left
            x = canvas.width + radius
            y = Math.random() * canvas.height
            dx = -1
            dy = 0
            break
        case 2: // top moving to bot
            x = Math.random() * canvas.width + radius
            y =  0 - radius
            dx = 0
            dy = 1
            break
        case 3: // bot moving to top
            x = Math.random() * canvas.width + radius
            y =  canvas.height + radius
            dx = 0
            dy = -1
            break       
    }

    asteroids.push(new Asteroid({
        // generate position on random locations inside the canvas
        position: {
            x: x, 
            y: y,
        },
        direction : {
            x: dx,
            y: dy,
        },
        radius
    }))

    console.log(asteroids)
}, ASTEROID_SPAWN)

function checkCollision(sprite1, sprite2, type){

    const xDiff = sprite1.position.x - sprite2.position.x
    const yDiff = sprite1.position.y - sprite2.position.y
    const distance = Math.sqrt((xDiff*xDiff)+(yDiff*yDiff))

    if(type == 0){ // bullet and asteroid colision
        if(distance <= sprite1.radius + sprite2.radius){
            return true
        }
    }else if (type == 1){ // ship and asteroid colision
        if(distance <= Math.floor(SHIP_EDGE/2) + sprite2.radius){
            return true
        }
    }

    return false
}


function slowDown(){
    player.velocity.x *= BRAKESTRENGTH
    player.velocity.y *= BRAKESTRENGTH

    // Check if the player's velocity becomes small enough to stop completely
    if (Math.abs(player.velocity.x) < 0.1) {
        player.velocity.x = 0;
    }
    if (Math.abs(player.velocity.y) < 0.1) {
        player.velocity.y = 0;
    }
}

function drawScoreHealth(){
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial'; // Customize the font size and family as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const scoreText = `Score: ${player.score}`; 
    const healthText = `Health: ${player.health}`;
    const textX = canvas.width / 2;
    const textY = 10; // 10 pixels padding from the top
    let invincibilityText = '';
    if (player.invincible && player.invincibilityTime > 0) {
        invincibilityText = `Invincibility: ${(player.invincibilityTime / 1000).toFixed(1)}`
    }
    ctx.fillText(healthText, textX, textY);
    ctx.fillText(scoreText, textX, textY+20);
    ctx.fillText(invincibilityText, textX, textY+40);

}

function drawGameEnd() {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial'; // Customize the font size and family as needed
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if(GAMEOVER){
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    }else{
        ctx.fillText('You Won', canvas.width / 2, canvas.height / 2);
        clearInterval(gameStart);
    }
    clearInterval(asteroidSpawning);
  }

function beInvincible(time) {
    player.invincible = true;
    player.invincibilityTime = time;
    let remainingTime = time; // Track the remaining time

    const interval = 100; // 0.1 seconds (100 milliseconds)

    const invincibilityInterval = setInterval(() => {
        remainingTime -= interval;
        player.invincibilityTime = remainingTime; // Update the player's invincibility time
        if (remainingTime <= 0) {
            player.invincibilityTime = 0;
            player.invincible = false;
            clearInterval(invincibilityInterval);
        }
    }, interval);
}

function resetPlayerLocation(){
    player.position = {x: canvas.width/2, y:canvas.height/2}, 
    player.velocity = {x:0,y:0},
    player.rotation = 0
}
function outOfBounds(sprite, shipBool){

    if(shipBool){
        const nextX = sprite.position.x + Math.cos(player.rotation) * MOVESPEED
        const nextY = sprite.position.y + Math.sin(player.rotation) * MOVESPEED
        
        //check out of bounds here:
        if (
            nextX - SHIP_EDGE / 2 < 0 ||
            nextX + SHIP_EDGE / 2 > canvas.width ||
            nextY - SHIP_EDGE / 2 < 0 ||
            nextY + SHIP_EDGE / 2 > canvas.height
        ) {
            return true;
        }
    }else{
        if(sprite.position.x + sprite.radius < 0 ||
            sprite.position.x - sprite.radius > canvas.width ||
            sprite.position.y + sprite.radius < 0 ||
            sprite.position.y - sprite.radius > canvas.height ){
                return true
            }
    }

    return false

}
// iterative animation loop 
function animate(){
    window.requestAnimationFrame(animate)
   
    // reset canvas before updating
    ctx.fillStyle = 'black'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    
    if (GAMEOVER){
        drawGameEnd()
        return;
    }else if(GAMEWON){
        drawGameEnd()
        return;
    }

    drawScoreHealth()
    
    player.update()

    // projectiles management
    for (let i = projectiles.length -1 ; i>= 0; i--){
        const proj = projectiles[i]
        proj.update()
        
        // remove the projectile if it is outside the screen boundary
        if (outOfBounds(proj, false)){
            projectiles.splice(i, 1)
        }
    }

    // asteroids management
    for (let i = asteroids.length -1 ; i>= 0; i--){
        const asteroid = asteroids[i]
        asteroid.update()
        
        for (let j = projectiles.length -1 ; j>= 0; j--){
            if(checkCollision(projectiles[j], asteroid, 0)){
                asteroids.splice(i, 1)
                projectiles.splice(j, 1)
                player.score+=1
                continue
            }
        }

        if (checkCollision(player, asteroid, 1)){
            // check if Game Over (if the ships hp is less than 0)
            if (!player.invincible) player.health -= asteroid.damage
            console.log(`Player hit! hp: ${player.health}`)
            asteroids.splice(i, 1)
            if(player.health <= 0){
                GAMEOVER = true
            }else{
                beInvincible(1000)
            }
        }

        // remove the projectile if it is outside the screen boundary
        else if (outOfBounds(asteroid, false)){
            asteroids.splice(i, 1)
        }


    }
    const dx = Math.cos(player.rotation) * MOVESPEED;
    const dy = Math.sin(player.rotation) * MOVESPEED;

    // Move forward or backwards
    if (keys.w.pressed){
        if (!outOfBounds(player, true)){
            player.velocity.x = dx;
            player.velocity.y = dy;
        }else{
            resetPlayerLocation()
            beInvincible(2000)
        }
    }else if(!keys.w.pressed){ 
        slowDown()
    }

    if (keys.s.pressed && !keys.w.pressed){
        if (!outOfBounds(player, true)){
            player.velocity.x = dx;
            player.velocity.y = dy;
        }else{
            resetPlayerLocation()
            beInvincible(2000)
        }
    }else if (!keys.s.pressed){
        slowDown()
    }

    // Left and Right Rotation
    if (keys.d.pressed){
        player.rotation += ROTSPEED
    }
    if (keys.a.pressed){
        player.rotation -= ROTSPEED
    }

    const currentTime = new Date().getTime();
    if (currentTime - gameStart >= GAME_WIN_TIME) {
        GAMEWON = true;
    }
}

animate()

window.addEventListener('keydown', (event) => {
    switch (event.code){
        case 'KeyW':
            keys.w.pressed = true
            console.log("W pressed!")
            break; 
        case 'KeyA':
            keys.a.pressed = true
            console.log("A pressed!")
            break; 
        case 'KeyS':
            keys.s.pressed = true
            console.log("S pressed!")
            break; 
        case 'KeyD':
            keys.d.pressed = true
            console.log("D pressed!")
            break; 
        case 'Space':
            projectiles.push(new Projectile({
                position: {x: player.position.x + Math.cos(player.rotation) * SHIP_EDGE, 
                    y: player.position.y + Math.sin(player.rotation) * SHIP_EDGE },
                direction: {
                    x:Math.cos(player.rotation) * PROJECTILESPEED, 
                    y:Math.sin(player.rotation) * PROJECTILESPEED
                }
            }))
            break;
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code){
        case 'KeyW':
            keys.w.pressed = false
            break; 
        case 'KeyA':
            keys.a.pressed = false
            break; 
        case 'KeyS':
            keys.s.pressed = false
            break; 
        case 'KeyD':
            keys.d.pressed = false
            break;        
    }
})