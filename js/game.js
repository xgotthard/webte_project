const maxAdjustmentAngle = 70;
let scoreText;

const gameConfig = {
    centerX: 0,
    centerY: 0,
    gameWidth: 0,
    gameHeight: 0,
};


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Sem_project/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, (err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

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
        this.load.json('levels', 'levels.json');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('paddle', 'assets/paddle.png');
        this.load.image('blue_block', 'assets/block_blue.png');
        this.load.image('orange_block', 'assets/block_orange.png');
        this.load.image('red_block', 'assets/block_red.png');
        this.load.image('darkblue_block', 'assets/block_darkblue.png');
        this.load.image('green_block', 'assets/block_green.png');
        this.load.image('yellow_block', 'assets/block_yellow.png');
        this.load.image('pink_block', 'assets/block_pink.png');
        this.load.image('turquoise_block', 'assets/block_turquoise.png');
        this.load.image('pauseButton', 'assets/pause_button1.png'); 
        this.load.image('restartButton', 'assets/restart.png'); 
        this.load.image('informationButtonImage', 'assets/info-icon.png');
    }


    create() {
        this.loadGameState();

        this.add.image(gameConfig.centerX, gameConfig.centerY, 'background').setDisplaySize(gameConfig.gameWidth,gameConfig.gameHeight);
        this.score = 0;
        this.scoreMult = 1;
        if (!this.levelsShuffled) {
            // Shuffle the levels before starting the game (only once)
            this.shuffleLevels();
            this.levelsShuffled = true;
        }

        this.loadLevel(this.currentLevel);


 // Add a button for information with an image
let infoBtn = this.add.image(160, 32, 'informationButtonImage').setInteractive();

infoBtn.on('pointerdown', function () {
    this.scene.pause('MainScene');
    this.scene.launch('InstructionScene');  
}, this);


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


        const levelData = this.cache.json.get('levels').levels[this.currentLevel];
        scoreText = this.add.text(gameConfig.gameWidth - 16, 16, `Score: 0  Order: ${this.currentLevel + 1}  Difficulty: ${levelData.level}`,{
            fontSize: '26px',
            fill: '#fff'
        });
        scoreText.setOrigin(1, 0);
        scoreText.setX(gameConfig.gameWidth - 16);
    }


    loadLevel(level) {
        const levelData = this.cache.json.get('levels').levels[level];

        this.blocks = this.physics.add.staticGroup();
        this.createBlocksForLevel(80, levelData.blockColors); 
        this.ball = this.physics.add.sprite(gameConfig.centerX, gameConfig.centerY, 'ball');
        this.paddle = this.physics.add.sprite(gameConfig.centerX,gameConfig.gameHeight *0.9, 'paddle');
        this.ball.setCollideWorldBounds(true); // Collides with world
        this.ball.setBounce(1, 1); // Keeps velocity on bounces
        this.ball.setVelocity(0,400); // X velocity = 0, Y velocity = 400
        this.paddle.setCollideWorldBounds(true); // Stops from going into walls
        this.paddle.body.immovable = true; // Paddle won't move when the ball hits it
        this.physics.add.collider(this.ball, this.paddle, this.updateAngle, null, this); // Calls updateAngle on collision
        this.physics.add.collider(this.ball, this.blocks, this.hitBlock, null, this); // Calls hitBlock on collision
    }

    update() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.pointer = this.input.activePointer;
        if (this.cursors.left.isDown) { // Is left arrow held
            this.paddle.setVelocityX(-350); // left
        } else if (this.cursors.right.isDown) { // Is right arrow held
            this.paddle.setVelocityX(350); // right
        } /*else if (this.pointer.isDown && (this.pointer.x >= 0 && this.pointer.x <= this.sys.game.config.width &&
            this.pointer.y >= 0 && this.pointer.y <= this.sys.game.config.height)) {
            // Check if the mouse pointer is to the left of the paddle
            if (this.pointer.x < this.paddle.x) {
                this.paddle.setVelocityX(-350);  // Move left
            }
            // Check if the mouse pointer is to the right of the paddle
            else if (this.pointer.x > this.paddle.x) {
                this.paddle.setVelocityX(350);   // Move right
            }
        }*/ else {
            // Not moving if mouse isn't held or arrows aren't held
            this.paddle.setVelocityX(0);
        }
        if (this.ball.body.onFloor()) {
            this.checkBallOutOfBounds.call(this, this.ball);
        }
    }
    stopGame() {
        this.scene.pause();
        this.scene.launch('GameOver');
        this.saveGameState();
        if (this.ball) {
            this.ball.destroy();
        }
    }

    saveGameState() {
        localStorage.setItem('currentLevel', this.currentLevel.toString());
        localStorage.setItem('score', this.score.toString());
    }

    loadGameState() {
        const savedLevel = localStorage.getItem('currentLevel');
        const savedScore = localStorage.getItem('score');
        this.currentLevel = savedLevel ? parseInt(savedLevel) : 0;
        this.score = savedScore ? parseInt(savedScore) : 0;
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
        this.scoreMult += 1;

        const levelData = this.cache.json.get('levels').levels[this.currentLevel];
        scoreText.setText(`Score: ${this.score}  Order: ${this.currentLevel + 1}  Difficulty: ${levelData.level}`);

        
        if (block.texture.key === 'blue_block') {
            this.blocks.create(block.x, block.y, 'orange_block').refreshBody();
        }
        if (block.texture.key === 'orange_block') {
            this.blocks.create(block.x, block.y, 'red_block').refreshBody();
        }

        if (block.texture.key === 'pink_block') {
            this.blocks.create(block.x, block.y, 'green_block').refreshBody();
        }


        if (this.blocks.countActive() === 0) {
            //this.advanceToNextLevel();
            this.scene.pause();
            this.scene.launch('VictoryScene');
        }
    }

    createBlocksForLevel(yPosition, blockColors) {
        const blockWidth = 61;
        const numBlocks = Math.floor(gameConfig.gameWidth / blockWidth);

        for (let i = 0; i < blockColors.length; i++) {
            //for (let j = 0; j < numBlocks; j++) {
            for (let j = 6; j < 7 ; j++) {   //na skusanie levelov  
                const xPosition = (j * blockWidth + blockWidth / 2) + 10;
                const yPos = yPosition + i * 28;
                this.blocks.create(xPosition, yPos, blockColors[i]).refreshBody();
            }
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



    advanceToNextLevel() {
        this.currentLevel++;

        if (this.currentLevel >= this.cache.json.get('levels').levels.length) {
            // Check if all levels are completed
            const allLevelsCompleted = this.checkAllLevelsCompleted();

            if (allLevelsCompleted) {
                // Shuffle the levels and restart if all levels are completed
                this.shuffleLevels();
                this.currentLevel = 0;
            }
        }
        this.saveGameState();
        this.scene.restart();
    }

    // Function to check if all levels are completed
    checkAllLevelsCompleted() {
        const levelsArray = this.cache.json.get('levels').levels;
        return this.currentLevel >= levelsArray.length;
    }

    shuffleLevels() {
        const levelsArray = this.cache.json.get('levels').levels;
        for (let i = levelsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [levelsArray[i], levelsArray[j]] = [levelsArray[j], levelsArray[i]];
        }
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }



    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('play_btn', 'assets/play_btn.png');
    }


    create() {

        gameConfig.centerX = this.scale.width / 2;
        gameConfig.centerY = this.scale.height / 2;
        gameConfig.gameWidth = this.scale.width;
        gameConfig.gameHeight = this.scale.height;

        //console.log('centerX:', gameConfig.centerX);
        //console.log('centerY:', gameConfig.centerY);
        //console.log('gameWidth:', gameConfig.gameWidth);
        //console.log('gameHeight:', gameConfig.gameHeight); 


        this.add.image(gameConfig.centerX, gameConfig.centerY, 'background').setDisplaySize(gameConfig.gameWidth,gameConfig.gameHeight);


        const titleText = this.add.text(gameConfig.centerX, gameConfig.centerY - 50 , 'Breakout', {
            fontSize: '70px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            fill: [ '#FFBE07'],  
            strokeThickness: 4,            
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000207',
                blur: 2,
                stroke: false,
                fill: true
            }
        }).setOrigin(0.5, 0.5);
        
        
        this.tweens.add({
            targets: titleText,
            scaleX: 1.3,
            scaleY: 1.2,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });


       // Play button
            let playButton = this.add.image(gameConfig.centerX, gameConfig.centerY + 60, 'play_btn'); 
        
        
        playButton.setInteractive();
        
        playButton.on('pointerover', () => {
            this.tweens.add({
                targets: playButton,
                scale: 1.2,
                duration: 200,
                ease: 'Power1',
            });
            this.input.setDefaultCursor('pointer');
        });
        
        playButton.on('pointerout', () => {
            this.tweens.add({
                targets: playButton,
                scale: 1,
                duration: 200,
                ease: 'Power1',
            });
            this.input.setDefaultCursor('default');
        });
        
        playButton.on('pointerdown', () => {
            this.scene.stop('TitleScene');
            this.scene.start('MainScene');
        });
}

}


class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    create() {
        this.add.text(gameConfig.centerX,gameConfig.centerY, 'Game Paused', { fontSize: '32px', fill: '#d0a734' })
            .setOrigin(0.5, 0.5);


        this.input.on('pointerdown', () => {
            this.scene.resume('MainScene'); 
            this.scene.stop();
        });
    }
}

class GameOver extends Phaser.Scene {
    constructor(){
        super({ key: 'GameOver' });
    }

    create() {
        this.add.text(gameConfig.centerX, gameConfig.centerY, 'Game Over\n Press any button to restart', { 
            fontSize: '32px',
            align: 'center',
            fill: '#d0a734' })
        .setOrigin(0.5, 0.5);
        this.input.on('pointerdown', () => {
            console.log('test');
            localStorage.removeItem('currentLevel');
            localStorage.removeItem('score');
            this.scene.stop();
            this.scene.start('MainScene');
        });
    }
}

class InstructionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionScene' });
    }

    create() {
        
        const instructionText = document.querySelector('.instruction-text').innerText;

        const style = {
            font: '22px Arial',
            fill: '#d0a734',
            align: 'center',
            wordWrap: { width: 500, useAdvancedWrap: true },
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }        
        };

        
        const text = this.add.text(gameConfig.centerX, gameConfig.centerY, instructionText, style)
            .setOrigin(0.5, 0.3);
        
        this.input.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('MainScene');
        }, this);
    }
}


class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }
    create() {
        const victoryText = this.add.text(gameConfig.centerX, gameConfig.centerY - 50, 'Victory!', {
            fontSize: '50px',
            fill: '#d0a734'
        }).setOrigin(0.5, 0.5);

        // Add a button to proceed to the next level
        const nextLevelButton = this.add.text(gameConfig.centerX, gameConfig.centerY + 50, 'Next Level', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#d0a734',
            padding: { x: 10, y: 5 }, 
        }).setOrigin(0.5, 0.5).setInteractive();


    nextLevelButton.on('pointerover', () => {
        nextLevelButton.setStyle({ fill: '#ffff00' });
        this.tweens.add({
            targets: nextLevelButton,
            scale: 1.1,
            duration: 200,
            ease: 'Power1',
        });
        this.input.setDefaultCursor('pointer');
    });


    nextLevelButton.on('pointerout', () => {
        nextLevelButton.setStyle({ fill: '#ffffff' });
        this.tweens.add({
            targets: nextLevelButton,
            scale: 1,
            duration: 200,
            ease: 'Power1',
        });
        this.input.setDefaultCursor('default');
    });

    nextLevelButton.on('pointerdown', () => {
        this.goToNextLevel();
    });

    //dalsi level aj po stlaceni spacebar (na skusanie levelov , ked sa vykreslia bloky iba v strede)
    this.input.keyboard.on('keydown-SPACE', () => {
        this.goToNextLevel();
    });
}

goToNextLevel() {
    this.scene.stop('VictoryScene');
    this.scene.resume('MainScene');
    this.scene.get('MainScene').advanceToNextLevel();
    }  
}

const config = {
    type: Phaser.AUTO,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800, 
        height: 600, 
    },
    
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [TitleScene,MainScene,InstructionScene, PauseScene, GameOver, VictoryScene]
};



const game = new Phaser.Game(config);