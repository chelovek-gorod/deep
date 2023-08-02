'use strict';

const bgmArr = [
    './src/sounds/bgm1.mp3',
    './src/sounds/bgm2.mp3',
    './src/sounds/bgm3.mp3',
];
const bgMusic = new Audio();
bgMusic.src = bgmArr[ Math.floor( Math.random() * bgmArr.length ) ];
bgMusic.volume = 0.3;
const seBubbles = new Audio();
seBubbles.src = './src/sounds/se_bubbles.mp3';

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
startButton.onclick = function() {
    document.body.style.overflowY = 'scroll';
    startScreen.classList.add("hide");
    seBubbles.play();
    bgMusic.play();
    setTimeout( () => startScreen.style.display = 'none', 1200 );
}

const canvas = document.querySelector('canvas');
updateCanvasSize();
const context = canvas.getContext('2d');

addEventListener('resize', updateCanvasSize )
function updateCanvasSize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    console.log('resize');
}

const sprites = {
    fish : './src/images/fish-105x70px-12frames.png',
    bubble: './src/images/bubble-54x54px.png'
};
let spritesToUpload = Object.keys(sprites).length;
let isAllSpritesLoaded = false;
for (let img in sprites) {
    const src = sprites[img];
    sprites[img] = new Image();
    sprites[img].src = src;
    sprites[img].onload = spriteLoaded;
}
function spriteLoaded() {
    spritesToUpload--;
    if (spritesToUpload === 0) {
        isAllSpritesLoaded = true;
        fish = new Fish();
        requestAnimationFrame( animation );
    }
}

class Bubble{
    constructor( x, y ) {
        this.scale = 0.1 + Math.random() * 0.2; /* 0.1...0.3 */
        this.scaleMax = 0.5 + Math.random() * 0.5; /* 0.5...1 */
        this.scaleStep = 0.00001 + Math.random() * 0.0001; /* 0.00001...0.0001 */
        this.speedY = 0.06 + Math.random() * 0.06;
        this.speedX = -0.03 + Math.random() * 0.06; /* -0.03...0.03 */
        this.fullSize = sprites.bubble.width;
        this.halfSize = this.fullSize / 2;
        this.x = x;
        this.y = y;
    }

    update( dt ) {
        this.y -= this.speedY * dt
        this.x += this.speedX * dt
        this.scale += this.scaleStep * dt

        const size = this.fullSize * this.scale
        const offset = this.halfSize * this.scale
        context.drawImage( sprites.bubble, this.x - offset, this.y - offset, size, size );
    }
}
let bubblesArr = [];

class Fish {
    constructor () {
        this.x = innerWidth + 100;
        this.y = innerHeight + 100;
        this.frame = 0;
        this.frameMax = 5;
        this.frameWidth = sprites.fish.width / 6;
        this.frameHeight = sprites.fish.height / 2;
        this.halfWidth = this.frameWidth / 2;
        this.halfHeight = this.frameHeight / 2;
        this.speed = 0.06;
        this.setTarget( Math.random() * innerWidth, Math.random() * innerHeight);
        this.FPS = 9;
        this.animationStep = Math.floor(1000 / this.FPS);
        this.animationTime = 0;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.frameY = this.targetX < this.x ? 0 : this.frameHeight;
        this.isMoveToLeft = (this.targetX - this.x) < 0 ? true : false;
        this.isMoveToTop = (this.targetY - this.y) < 0 ? true : false;
    }

    update( dt ) {
        const speed = this.speed * dt;
        // move X
        if (this.isMoveToLeft) {
            if ( (this.x - this.targetX) < speed ) this.x = this.targetX;
            else this.x -= speed;
        } else {
            if ( (this.targetX - this.x) < speed ) this.x = this.targetX;
            else this.x += speed;
        }
        // move Y
        if (this.isMoveToTop) {
            if ( (this.y - this.targetY) < speed ) this.y = this.targetY;
            else this.y -= speed;
        } else {
            if ( (this.targetY - this.y) < speed ) this.y = this.targetY;
            else this.y += speed;
        }
        // target achieved
        if (this.x === this.targetX && this.y === this.targetY) {
            this.setTarget( Math.random() * innerWidth, Math.random() * innerHeight);
        }
        // update frame
        this.animationTime += dt
        if (this.animationTime >= this.animationStep) {
            this.animationTime -= this.animationStep;
            this.frame++;
            if (this.frame > this.frameMax) this.frame = 0;
        }
        // draw
        context.drawImage( sprites.fish,
            this.frame * this.frameWidth, this.frameY, this.frameWidth, this.frameHeight,
            this.x - this.halfWidth, this.y - this.halfHeight, this.frameWidth, this.frameHeight
        );
    }
}
let fish;

//
//  CHECK EVENTS
//
let isOnFocus = true;
addEventListener('focus', () => {
    previousTimeStamp = performance.now();
    requestAnimationFrame( animation );
    isOnFocus = true;
    console.log('focus');
});

addEventListener('blur', () => {
    isOnFocus = false;
    console.log('blur');
});

addEventListener('mousemove', ( event ) => {
    if (isAllSpritesLoaded && Math.random() > 0.7) {
        const bubble = new Bubble(event.clientX, event.clientY);
        bubblesArr.push( bubble );
    }
});

addEventListener('click', ( event ) => {
    if (isAllSpritesLoaded) {
        const bubbles = 9 + Math.floor(Math.random() * 10);
        for (let i = 0; i < bubbles; i++) {
            const bubble = new Bubble(event.clientX, event.clientY);
            bubblesArr.push( bubble );
        }
        fish.setTarget(event.clientX, event.clientY);
    }
});

//
//  ANIMATION
//
let previousTimeStamp = performance.now();
function animation( timeStamp ) {
    const dt = timeStamp - previousTimeStamp;
    previousTimeStamp = timeStamp;

    context.clearRect(0, 0, innerWidth, innerHeight);

    bubblesArr.forEach( bubble => bubble.update(dt) );
    bubblesArr = bubblesArr.filter( bubble => bubble.scale < bubble.scaleMax );

    fish.update( dt );

    if (isOnFocus) requestAnimationFrame(animation);
}

//
//  SMOOTH SCROLL TO ANCHOR
//
document.querySelectorAll('a[href^="#"').forEach(link => {

    link.addEventListener('click', function(e) {
        e.preventDefault();

        let href = this.getAttribute('href').substring(1);

        const scrollTarget = document.getElementById(href);

        // const topOffset = document.querySelector('.top-offset').offsetHeight;
        const topOffset = 0; // нужен отступ сверху 
        const elementPosition = scrollTarget.getBoundingClientRect().top;
        const offsetPosition = elementPosition - topOffset;

        seBubbles.currentTime = 0;
        seBubbles.play();

        window.scrollBy({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});