const canvas = document.body.querySelector("canvas")
const c = canvas.getContext("2d")

canvas.width = innerWidth
canvas.height = innerHeight

c.fillStyle = 'rgba(0, 20, 0, 0.99)'
c.fillRect(0, 0, canvas.width, canvas.height)

let score = 0

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = canvas.width/2
        this.y = canvas.height/2
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }

}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }

}



const player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
const projectiles = []
const enemies = []

function spawnEnemies() {
    setInterval(() => {
        
        const radius = Math.random() * (30 - 10) + 10

        let x
        let y
        
        
        if (Math.random() < 0.5) { //Height
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        } else { //Width
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }

        const color = 'hsl(' + Math.random()*360 + ', 50%, 50%)'
        
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}



let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    projectiles.forEach((projectile, index) => {
        projectile.update()
        //remove projectiles when off screen 
        if ((projectile.x + projectile.radius < 0) || 
        (projectile.x - projectile.radius > canvas.width) || 
        (projectile.y + projectile.radius < 0) || 
        (projectile.y - projectile.radius > canvas.height)) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, indexE) => {
        enemy.update()

        projectiles.forEach((projectile, indexP) => { //collision detection
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) //Distance between two points
            if (dist - enemy.radius - projectile.radius < 1) {
                setTimeout(() => {
                    if (!(enemy.radius < 20)) {
                        enemy.radius -= 10
                    } else {
                        enemies.splice(indexE, 1)
                        score ++
                    }
                    console.log(enemy.radius)
                    projectiles.splice(indexP, 1)
                    
                }, 0)
            }
        })

        //Player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        
        //end Game
        if (dist - enemy.radius - player.radius < 1) {
            console.log("lose, Score: " + score)
            cancelAnimationFrame(animationId)
        }
    })

    player.draw()
}

addEventListener('click', (event) => {
    const veloMultiplyer = 7
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle)*veloMultiplyer,
        y: Math.sin(angle)*veloMultiplyer
    }
    projectiles.push(new Projectile(event.clientX, event.clientY, 5, "white", velocity))
})



spawnEnemies()
animate()