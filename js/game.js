const maxAdjustmentAngle = 70;
let scoreText;

class MainScene extends Phaser.Scene {
    cursors;
    ball;
    paddle;
    pointer;
    blocks;
    score;
    scoreMult;
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load any assets here from your assets directory
        this.load.image('background', 'assets/background.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('paddle', 'assets/paddle.png'); // Loads the paddle image
        this.load.image('blue_block', 'assets/block_blue.png');
        this.load.image('orange_block', 'assets/block_orange.png');
        this.load.image('red_block', 'assets/block_red.png');
        this.load.image('pauseButton', 'assets/pause_button1.png'); //Placeholder obrazok
        this.load.image('restartButton', 'assets/restart.png'); //Placeholder obrazok
    }


    create() {
        // Create your game world here
        this.add.image(400, 300, 'background');
        this.score = 0;
        this.scoreMult = 1;
        this.blocks = this.physics.add.staticGroup();
        this.createRowOfBlocks.call(this, 80, 'blue_block');
        this.ball = this.physics.add.sprite(400, 300, 'ball');
        this.ball.setCollideWorldBounds(true); // Collides with world
        this.ball.setBounce(1, 1); // Keeps velocity on bounces
        this.ball.setVelocity(0, 400); // X velocity = 0, Y velocity = 400
        this.paddle = this.physics.add.sprite(400, 500, 'paddle');
        this.paddle.setCollideWorldBounds(true); // Stops from going into walls
        this.paddle.body.immovable = true; // Paddle won't move when the ball hits it
        this.physics.add.collider(this.ball, this.paddle, this.updateAngle, null, this); // Calls updateAngle on collision
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this); // Calls hitBlock on collision
        scoreText = this.add.text(16, 16, 'Score: 0', {fontSize: '32px', fill: '#fff'});
        scoreText.setOrigin(1, 0);
        scoreText.setX(this.cameras.main.width - 16);
        // Button na pauzu
        let pauseBtn = this.add.image(40, 32, 'pauseButton').setInteractive();
        pauseBtn.on('pointerdown', function () {
            this.scene.pause();
            this.scene.launch('PauseScene'); // Assuming you have a separate pause scene
        }, this);
        // Button na restart
        let restartBtn = this.add.image(100, 32, 'restartButton').setInteractive();
        restartBtn.on('pointerdown', function () {
            this.scene.restart();
        }, this);
    }

    update() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;
        if (this.cursors.left.isDown) { // Is left arrow held
            this.paddle.setVelocityX(-350); // left
        } else if (this.cursors.right.isDown) { // Is right arrow held
            this.paddle.setVelocityX(350); // right
        } else if (this.pointer.isDown && (this.pointer.x >= 0 && this.pointer.x <= this.sys.game.config.width &&
            this.pointer.y >= 0 && this.pointer.y <= this.sys.game.config.height)) {
            // Check if the mouse pointer is to the left of the paddle
            if (this.pointer.x < this.paddle.x) {
                this.paddle.setVelocityX(-350);  // Move left
            }
            // Check if the mouse pointer is to the right of the paddle
            else if (this.pointer.x > this.paddle.x) {
                this.paddle.setVelocityX(350);   // Move right
            }
        } else {
            // Not moving if mouse isn't held or arrows aren't held
            this.paddle.setVelocityX(0);
        }
        if (this.ball.body.onFloor()) {
            console.log("bounce");
            this.checkBallOutOfBounds.call(this, this.ball);
        }
    }
    stopGame() {
        this.scene.pause();
        this.scene.launch('GameOver');
    }

    updateAngle(ball, paddle) {
        let hitPoint = ball.x - paddle.x;
        let normalizedHitPoint = hitPoint / (paddle.width / 2);

        // Calculate incoming angle (in radians)
        let incomingAngle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);

        // Adjust the angle based on where it hits the paddle
        let adjustmentAngle = normalizedHitPoint * Phaser.Math.DegToRad(maxAdjustmentAngle);
        let newAngle = incomingAngle + adjustmentAngle;

        // Calculate the new velocity
        let speed = Math.sqrt(ball.body.velocity.x * ball.body.velocity.x + ball.body.velocity.y * ball.body.velocity.y);
        let newVelocityX = speed * Math.cos(newAngle);
        let newVelocityY = speed * Math.sin(newAngle);

        // Set the new velocity to the ball
        ball.setVelocity(newVelocityX, newVelocityY);
        this.scoreMult = 1;
    }

    hitBlock(ball, block) {
        block.destroy();
        this.score += (10 * this.scoreMult);
        console.log('Score: ', this.score, 'Mult: ', this.scoreMult);
        this.scoreMult += 1;
        scoreText.setText('Score: ' + this.score);
        if (block.texture.key === 'blue_block') {
            this.blocks.create(block.x, block.y, 'orange_block').refreshBody();
        }
        if (block.texture.key === 'orange_block') {
            this.blocks.create(block.x, block.y, 'red_block').refreshBody();
        }
    }

    createRowOfBlocks(yPosition, blockTexture) {
        const blockWidth = 60; // Width of each block
        const gameWidth = this.sys.game.config.width;
        const numBlocks = Math.floor(gameWidth / blockWidth);

        for (let i = 0; i < numBlocks; i++) {
            // Calculate the x position for each block
            const xPosition = (i * blockWidth + blockWidth / 2) + 10;

            // Create the block and add it to the group
            this.blocks.create(xPosition, yPosition, blockTexture).refreshBody();
        }
    }

    checkBallOutOfBounds(ball) {
        let bounds = this.physics.world.bounds;
        let check = ball.body.blocked;

        if (this.ball.body.y + 12 >= bounds.bottom && check.down) {
            // Ball has hit the bottom of the world bounds
            this.stopGame();
        }
    }
}

class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Paused', { fontSize: '32px', fill: '#d0a734' })
            .setOrigin(0.5, 0.5);

        // Optionally add a 'Resume' button or click to resume
        this.input.on('pointerdown', () => {
            this.scene.resume('MainScene'); // Assuming 'MainScene' is the key of your main game scene
            this.scene.stop();
        });
    }
}

class GameOver extends Phaser.Scene {
    constructor(){
        super({ key: 'GameOver' });
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Over', { fontSize: '32px', fill: '#d0a734' })
            .setOrigin(0.5, 0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MainScene, PauseScene, GameOver]
};

const game = new Phaser.Game(config);