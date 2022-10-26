import Phaser from 'phaser'

import ScoreLabel from '../ui/ScoreLabel';
import BombSpawner from './BombSpawner';


const GROUND_KEY = 'ground';
const STAR_KEY = 'star';
const HERO_KEY = 'dude';
const BOMB_KEY = 'bomb' ;

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
		super('game-scene')

        this.player = undefined;
        this.cursors = undefined;
		this.scoreLabel = undefined;
		this.stars = undefined;
	
		this.bombSpawner = undefined;

		this.score = 0;

		this.gameOver = false

	}

	preload()
	{

        this.load.image('sky', './assets/sky-bg.png');
        this.load.image(GROUND_KEY, './assets/platform.png');
        this.load.image(STAR_KEY, './assets/star.png');
		this.load.image(BOMB_KEY, './assets/bomb.png');


		//game sound load assets here!
		this.load.audio('gameMusic', './assets/sound/gamesound.mp3');
		this.load.audio('dude_jump', './assets/sound/jump.mp3');
		this.load.audio('pick_star', './assets/sound/star.wav');
		this.load.audio('game_over', './assets/sound/gameover.wav');


        this.load.spritesheet(HERO_KEY,
         './assets/dude.png', 
         { frameWidth:32,  frameHeight :48}
         )
        

	}

	create()
	{

        this.add.image(400, 300, 'sky');

        const platforms = this.createPlatforms()
		


        this.player = this.createPlayer()
		this.stars = this.createStars()

		this.scoreLabel = this.createScoreLabel(16, 16, 0)
		// @ts-ignore
		this.gameOverText = this.add.text(400,300, 'Game Over', { fontSize: '34px', fill: '#000' })
		this.gameOverText.setOrigin(0.5)
		this.gameOverText.visible = false

		this.bombSpawner = new BombSpawner(this, BOMB_KEY)
		const bombsGroup = this.bombSpawner.group



        this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(this.stars, platforms)
		this.physics.add.collider(bombsGroup, platforms)
		this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)

	
		//collecting the stars
		this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        this.cursors = this.input.keyboard.createCursorKeys()


		//add sound in create
		this.game_music = this.sound.add('gameMusic');
		this.dudeJumpSound = this.sound.add('dude_jump');
		this.pickupSound = this.sound.add('pick_star');
		this.gameOverSound = this.sound.add('game_over');

		let musicConfig = {
			mute		: false,
			volume		: 0.75,
			rate		: 1,
			detune		: 0,
			seek		: 0,
			loop		:false,
			delay		:0
		}

		this.game_music.play(musicConfig);
        

	}

	
	createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		// @ts-ignore
		this.add.existing(label)

		return label
	}

	// createGameMusic() {
	// 	let gameMusic = this.sound.add('gameMusic')
	// 	gameMusic.play();
	// }

    update()
	{
		

		if (this.cursors.left.isDown)
		{
			
			
			this.player.setVelocityX(-160)

			this.player.anims.play('left', true)
			
		}
		else if (this.cursors.right.isDown)
		{
			this.player.setVelocityX(160)

			this.player.anims.play('right', true)
		}
		else
		{
			this.player.setVelocityX(0)

			this.player.anims.play('turn')
		}

		if (this.cursors.up.isDown && this.player.body.touching.down)
		{
			this.dudeJumpSound.play();
			this.player.setVelocityY(-330)
		}

		if (this.gameOver)
		{
			
			return
		}


	}






    createPlatforms() {
        
        const platforms = this.physics.add.staticGroup();


		platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody()
	
		platforms.create(600, 400, GROUND_KEY)
		platforms.create(50, 250, GROUND_KEY)
		platforms.create(750, 220, GROUND_KEY)

        return platforms;
        
    }

    createPlayer()
	{
		const player = this.physics.add.sprite(100, 450, HERO_KEY)
		player.setBounce(0.2)
		player.setCollideWorldBounds(true)

		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(HERO_KEY, { start: 0, end: 3}),
			frameRate:100,
			repeat: -1
		})
		
		this.anims.create({
			key: 'turn',
			frames: [ { key: HERO_KEY, frame: 4 } ],
			frameRate: 100
		})
		
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(HERO_KEY, { start: 5, end: 8 }),
			frameRate: 100,
			repeat: -1
		})

        return player;
	}

	createStars() {
		const stars = this.physics.add.group({
			key: STAR_KEY,
			repeat: 11,
			setXY: {x: 12 , y: 0, stepX: 70}
		})

		stars.children.iterate( (child) => {
			return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
		})

		return stars
	}

	//collecting the stars
	collectStar(player , star){
		star.disableBody(true, true);

		this.pickupSound.play();

		this.scoreLabel.add(10)

		if (this.stars.countActive(true) === 0)
		{
			//  A new batch of stars to collect
			// @ts-ignore
			this.stars.children.iterate((child) => {
				child.enableBody(true, child.x, 0, true, true)
			})
		}

		this.bombSpawner.spawn(player.x)

	}


	//----------------------------//

	hitBomb(player, bomb )

	{
		this.gameOverSound.play();
		this.physics.pause()
		player.setTint(0xff0000)
		player.anims.play('turn')
		this.gameOver = true
		this.gameOverText.visible = true
		this.game_music.stop();
		this.input.on('pointerdown' , ()=> this.scene.start('hello-world'))
	}


}
