const maxAdjustmentAngle = 70;

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload () {
    // Load any assets here from your assets directory
    this.load.image('background', 'assets/background.png');
    this.load.image('ball', 'assets/ball.png');
    this.load.image('paddle', 'assets/paddle.png'); // Loads the paddle image
    this.load.image('blue_block', 'assets/block_blue.png');
}

function create () {
    // Create your game world here
    this.add.image(400, 300, 'background');
    blocks = this.physics.add.staticGroup();
    createRowOfBlocks.call(this, 80, 'blue_block');
    ball = this.physics.add.sprite(400, 300, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);
    ball.setVelocity(0, 400);
    paddle = this.physics.add.sprite(400, 500, 'paddle');
    paddle.setCollideWorldBounds(true); // Stops from going into walls
    paddle.body.immovable = true;
    this.physics.add.collider(ball, paddle, updateAngle, null, this);
    this.physics.add.collider(ball, blocks, hitBlock, null, this);
}

function update () {
    cursors = this.input.keyboard.createCursorKeys();
    pointer = this.input.activePointer;
    if (cursors.left.isDown) { // Is left arrow held
        paddle.setVelocityX(-250); // left
    }
    else if (cursors.right.isDown) { // Is right arrow held
        paddle.setVelocityX(250); // right
    }
    else if (pointer.isDown && (pointer.x >= 0 && pointer.x <= this.sys.game.config.width &&
        pointer.y >= 0 && pointer.y <= this.sys.game.config.height)) {
        // Check if the mouse pointer is to the left of the paddle
        if (pointer.x < paddle.x) {
            paddle.setVelocityX(-250);  // Move left
        }
        // Check if the mouse pointer is to the right of the paddle
        else if (pointer.x > paddle.x) {
            paddle.setVelocityX(250);   // Move right
        }
    }
    else {
        // Not moving if mouse isn't held or arrows aren't held
        paddle.setVelocityX(0);
    }
    if(ball.body.onFloor()) {
        console.log("bounce");
        checkBallOutOfBounds.call(this, ball);
    }
}

function hitBlock(ball, block) {
    // Logic for what happens when a block is hit.
    // For example, you could 'destroy' the block:
    block.destroy();

    // You can also add score increment or other game logic here
}

function checkBallOutOfBounds(ball) {
    let bounds = this.physics.world.bounds;
    let check = ball.body.blocked;

    if (ball.body.y + 12 >= bounds.bottom && check.down) {
        // Ball has hit the bottom of the world bounds
        stopGame();
    }
}

function updateAngle(ball, paddle) {
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
}

function createRowOfBlocks(yPosition, blockTexture) {
    const blockWidth = 60; // Width of each block
    const gameWidth = this.sys.game.config.width;
    const numBlocks = Math.floor(gameWidth / blockWidth);

    for (let i = 0; i < numBlocks; i++) {
        // Calculate the x position for each block
        const xPosition = (i * blockWidth + blockWidth / 2) + 10;

        // Create the block and add it to the group
        blocks.create(xPosition, yPosition, blockTexture).refreshBody();
    }
}

function stopGame() {
    // Implement logic to stop the game
    // For example, pause the physics, show game over message, etc.
    game.scene.pause('default');
    console.log('Game Over');
    // You can also display a game over screen or restart the game here
}


const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', function () {
    if (game.scene.isPaused('default')) { // Replace 'default' with your scene key
        game.scene.resume('default');
        pauseButton.textContent = 'Pause';
    } else {
        game.scene.pause('default');
        pauseButton.textContent = 'Resume';
    }
});
