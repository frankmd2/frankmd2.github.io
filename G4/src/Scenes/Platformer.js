class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1000;
        this.MOVE_VELOCITY = 50;
        this.AIR_VELOCITY = 200;
        this.MAX_X_VELOCITY = 10000;
        this.MAX_Y_VELOCITY = 10000;
        this.physics.world.gravity.y = 1700;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.0;
        this.JUMP_BUFFER = 5;
    }

    createTilemap() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("g4", 16, 16, 75, 18);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Layer1", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
    }

    createPlayer() {
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(50, 570, "tilemap_sheet", 260);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBounceX(1);
        my.sprite.player.setMaxVelocity(this.MAX_X_VELOCITY, this.MAX_Y_VELOCITY);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
    }

    createKeys() {
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.aKey = this.input.keyboard.addKey('A');
        this.dKey = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createVFX() {
        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_01.png', 'magic_02.png'],
            // TODO: Try: add random: true
            scale: {start: 0.02, end: 0.01},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1},
        });

        my.vfx.walking.stop();
    }

    createCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }

    create() {
        this.createTilemap();
        this.createPlayer();
        this.createKeys();
        this.createVFX();
        this.createCamera();

        // debug key listener (assigned to D key)
        /*
        this.input.keyboard.on('keydown-BACKTICK ', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
        */

        this.jump_charge = 0;
        this.charging = false;
        this.jump_direction = 0;
        this.just_jump = 0;
    }

    moveOnGround() {
        if(cursors.left.isDown || this.aKey.isDown) {
            my.sprite.player.setVelocityX(-this.MOVE_VELOCITY);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        }
        else if(cursors.right.isDown || this.dKey.isDown) {
            my.sprite.player.setVelocityX(this.MOVE_VELOCITY);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        }
        else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setVelocityX(0);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }
    }

    jumpOnGround() {
        // If the player is holding space, then charge Jump
        if (this.spaceKey.isDown) {
            this.charging = true;
            this.jump_charge ++;
            console.log(this.jump_charge);
            my.sprite.player.setScale(1, 0.5);
            my.sprite.player.setVelocityX(0);

            if (this.aKey.isDown || cursors.left.isDown) { this.jump_direction = -1; }
            else if (this.dKey.isDown || cursors.right.isDown) { this.jump_direction = 1; }

            return
        }
        // If the player was charging jump and just released, then jump
        if (this.charging) {
            this.charging = false;
            my.sprite.player.setScale(1, 1);
            my.sprite.player.setVelocityY(- (Math.min(this.jump_charge, 90) + 30) * 5);
            my.sprite.player.setVelocityX(this.jump_direction * this.AIR_VELOCITY);
            this.jump_direction = 0;
            this.jump_charge = 0;

            this.just_jump = this.JUMP_BUFFER;
        }
    }

    update() {
        // While player is on the ground
        if(my.sprite.player.body.blocked.down) {
            if (this.just_jump > 0) { this.just_jump --; }
            else { this.moveOnGround(); }
            this.jumpOnGround();
        }
        else {
            if(!my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('jump');
            }
        }
        // Detect left and right movement

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}