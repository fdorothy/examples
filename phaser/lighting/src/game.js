var sprite;
var cursor;
var bounds;;
var shadowTexture;
var lightSprite;
var game = new Phaser.Game(20*32, 17*32, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload() {
    this.scale.pageAlignHorizontally = true;
    game.stage.backgroundColor = '#000';
    game.load.tilemap('level1', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('gametiles', 'assets/tiles.png');
    game.load.spritesheet('ms', 'assets/metalslug_mummy37x45.png', 37, 45, 18);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles', 'gametiles');
    bounds = map.createLayer('bounds');
    bounds.resizeWorld();
    map.setCollisionBetween(1, 2000, true, 'bounds');

    sprite = game.add.sprite(100, 60, 'ms');
    game.physics.arcade.enable(sprite);
    sprite.body.collideWorldBounds = true;
    //sprite.body.bounce.y = 0.2;
    sprite.body.gravity.y = 300;
    sprite.animations.add('walk', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], 60, true);
    sprite.anchor.setTo(0.5, 0.5);

    map.createLayer('decals');
    water = map.createLayer('water');
    water.alpha = 0.6;

    cursor = this.game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([
	Phaser.Keyboard.LEFT,
	Phaser.Keyboard.RIGHT,
	Phaser.Keyboard.UP,
	Phaser.Keyboard.DOWN,
	Phaser.Keyboard.SPACEBAR
    ]);

    shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
    lightSprite = this.game.add.image(this.game.camera.x, this.game.camera.y, shadowTexture);
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
}

function update() {
    game.physics.arcade.collide(sprite, bounds);
    sprite.body.velocity.x = 0;
    blocked = sprite.body.blocked.down;
    if (cursor.left.isDown) {
	sprite.body.velocity.x = -100;
	sprite.scale.x = -1;
	sprite.animations.play('walk');
    }
    else if (cursor.right.isDown) {
	sprite.body.velocity.x = 100;
	sprite.scale.x = 1;
	sprite.animations.play('walk');
    }
    else if (blocked) {
	sprite.animations.stop();
	sprite.frame = 4;
    }
    if (cursor.up.isDown) {
	if (sprite.body.blocked.down) {
	    sprite.body.velocity.y = -250;
	}
    }
    if (!blocked) {
	sprite.animations.stop();
	sprite.frame = 0;
    }
    lightSprite.reset(game.camera.x, game.camera.y);
    updateShadowTexture();
}

function updateShadowTexture() {
    shadowTexture.context.fillStyle = 'rgb(10, 10, 10)';
    shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

    x = sprite.x - game.camera.x,
    y = sprite.y - game.camera.y;

    drawLight(x, y, 150 + game.rnd.integerInRange(1,20), 1.0);
}

function drawLight(x, y, radius, brightness) {
    var gradient = shadowTexture.context.createRadialGradient(
	x, y, 0.0,
	x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, ' + brightness + ')');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0.0)');

    shadowTexture.context.beginPath();
    shadowTexture.context.fillStyle = gradient;
    shadowTexture.context.arc(x, y, radius, 0, Math.PI*2, false);
    shadowTexture.context.fill();

    shadowTexture.dirty = true;
}
