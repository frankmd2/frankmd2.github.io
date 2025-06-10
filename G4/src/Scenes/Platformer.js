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
        this.MAX_Y_VELOCITY = 1000;
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.0;
        this.JUMP_BUFFER = 5;
        this.MAX_CHARGE = 75;
        this.MIN_CHARGE = 20;
        this.VELOCITY_PER_CHARGE = 7;

        this.debug_list = ["MAX_CHARGE", "MIN_CHARGE", "VELOCITY_PER_CHARGE", "AIR_VELOCITY"];
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

        this.flag = this.map.createFromObjects("Object", {
            name: "Flag",
            key: "tilemap_sheet",
            frame: 248
        });

        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
    }

    createPlayer() {
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(160, 1220, "tilemap_sheet", 260);
        //my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setBounceX(1);
        my.sprite.player.setMaxVelocity(this.MAX_X_VELOCITY, this.MAX_Y_VELOCITY);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Flag collision
        this.physics.add.overlap(my.sprite.player, this.flag, (obj1, obj2) => {
            this.scene.start("End");
        });
    }

    createKeys() {
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.aKey = this.input.keyboard.addKey('A');
        this.dKey = this.input.keyboard.addKey('D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.tideKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
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

    createGuide() {
        this.guide = document.createElement("div");
        this.guide.innerHTML += `<h1>A/D to move left/right, Space to jump, \` to open console.</h1>`;
        this.guide.innerHTML += `<h1>Hold Space to jump higher, Use A/D before jump to jump towards that direction</h1></h1>`;
        document.body.appendChild(this.guide);
    }

    createConsole() {
        this.console = document.createElement("div");
        this.console.innerHTML += `<label id="x">x: ${my.sprite.player.x}, </label>`;
        this.console.innerHTML += `<label id="y">x: ${my.sprite.player.y}, </label>`;
        this.console.innerHTML += `<label id="charge">c: ${this.jump_charge} </label><br>`;

        this.console.innerHTML +=  `<label class="prompt">to_x: </label> `;
        this.console.innerHTML += `<input id="x_cord"  type="number"> `;
        this.console.innerHTML += `<label class="prompt"> to_y: </label> `;
        this.console.innerHTML += `<input id="y_cord"  type="number"> `;
        this.console.innerHTML += `<button class="tp">Teleport</button><br>`;

        for (let debug of this.debug_list) {
            this.console.innerHTML += `<label class="prompt">${debug.toLowerCase()} </label> `;
            this.console.innerHTML += `<input class="input" id="${debug}" type="number" value="${this[debug]}"><br> `;
        }

        this.console.innerHTML += `<button class="apply">Apply Changes</button>`;

        document.body.appendChild(this.console);

        let player = my.sprite.player;
        document.querySelector(".tp").addEventListener("click", function () {
            if (document.getElementById("x_cord").value != null) player.x = parseInt(document.getElementById("x_cord").value);
            if (document.getElementById("y_cord").value != null) player.y = parseInt(document.getElementById("y_cord").value);
            player.setVelocityX(0);
            player.setAccelerationX(0)
            player.setVelocityY(0);
            player.setAccelerationY(0);
        });

        let game = this;
        document.querySelector(".apply").addEventListener("click", function () {
            for (let query of document.querySelectorAll(".input")) {
                game[query.id] = parseInt(query.value);
            }
        });

        this.console.hidden = true;
    }

    create() {
        this.createTilemap();
        this.createPlayer();
        this.createKeys();
        this.createVFX();
        this.createCamera();
        this.createGuide();
        this.createConsole();

        this.physics.world.drawDebug = false;

        this.jump_charge = 0;
        this.charging = false;
        this.jump_direction = 0;
        this.just_jump = 0;
    }

    moveOnGround() {
        if(cursors.left.isDown || this.aKey.isDown) {
            my.sprite.player.setVelocityX(-this.MOVE_VELOCITY);
            my.sprite.player.setFlip(true, false);
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
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        }
        else {
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
            my.sprite.player.setVelocityY(- (Math.min(this.jump_charge, this.MAX_CHARGE) + this.MIN_CHARGE) * this.VELOCITY_PER_CHARGE);
            my.sprite.player.setVelocityX(this.jump_direction * this.AIR_VELOCITY);
            this.jump_direction = 0;
            this.jump_charge = 0;

            this.just_jump = this.JUMP_BUFFER;
        }
    }   

    update() {
        // Update console
        document.getElementById("x").innerHTML = `x: ${Math.floor(my.sprite.player.x)}, `;
        document.getElementById("y").innerHTML = `y: ${Math.floor(my.sprite.player.y)}, `;
        document.getElementById("charge").innerHTML = `c: ${this.jump_charge}`;

        // While player is on the ground
        if(my.sprite.player.body.blocked.down) {
            my.sprite.player.setAccelerationX(0);
            if (this.just_jump > 0) { this.just_jump --; }
            else { this.moveOnGround(); } // unable player movement if just jumped
            this.jumpOnGround();
        }
        else {
            // played jump
            my.sprite.player.anims.play('jump');
        }

        // if player is on slope
        let tile = this.groundLayer.getTileAtWorldXY(Math.floor(my.sprite.player.x), Math.floor(my.sprite.player.y));
        if (tile != null && tile.index == 8) {
            my.sprite.player.x -= 10;
        }
        else if (tile != null && tile.index == 9) {
            my.sprite.player.x += 10;
        }

        // Restart game
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Show/hide console
        if(Phaser.Input.Keyboard.JustDown(this.tideKey)) {
            this.console.hidden = !this.console.hidden;
        }
    }
}