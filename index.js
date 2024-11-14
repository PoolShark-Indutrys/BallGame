const canvas = document.body.querySelector("canvas")
const c = canvas.getContext("2d")

const scoreEl = document.querySelector("#scoreEl")

const modalEl = document.querySelector("#modalEl")

const startGameBtn = document.querySelector("#startGameBtn")

const bigScoreEl = document.querySelector("#bigScoreEl")

canvas.width = innerWidth
canvas.height = innerHeight

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

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()

        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()

        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }

}


let player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML =  score
}

function spawnEnemies() {
    
    setInterval(() => {
        console.log("spawn enemies")
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

    particles.forEach((particle, index) => {
        //remove particle when off screen 
        if ((particle.x + particle.radius < 0) || 
        (particle.x - particle.radius > canvas.width) || 
        (particle.y + particle.radius < 0) || 
        (particle.y - particle.radius > canvas.height)) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
        } else if (particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
        } else {
            particle.update()
        }

    })

    //Enemy kill
    enemies.forEach((enemy, indexE) => {
        enemy.update()

        projectiles.forEach((projectile, indexP) => { //collision detection
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) //Distance between two points
            
            
            if (dist - enemy.radius - projectile.radius < 1) {
                for (let i = 0; i < enemy.radius * 2 + 4; i++) { //create explosions
                    const veloMulti = 5 //How fast
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * veloMulti), y: (Math.random() - 0.5) * (Math.random() * veloMulti)}))
                }

                setTimeout(() => {
                    if (enemy.radius - 10 > 8) {
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        score += 25
                        scoreEl.innerHTML = score

                    } else {
                        enemies.splice(indexE, 1)
                        score += 100
                        scoreEl.innerHTML = score
                    }
                    projectiles.splice(indexP, 1)
                    
                }, 0)
            }
        })

        //Player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        
        //end Game
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
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

startGameBtn.addEventListener('click', () => {
    init()
    modalEl.style.display = 'none'
    animate()
})
spawnEnemies()