class Level extends Phaser.Scene {
    constructor() {
        super("Level");

        this.FPS = 60;
        this.DELTA_TIME = 1 / this.FPS;

        /*
        this.json = "level1.json";

        fetch(this.json ).then(
            (response) => response.json()
        ).then(
            (json) => this.rule = json;
        );
        */
        this.PLAYER_MAX_HP = 3;
        this.PLAYER_X = 400;
        this.PLAYER_Y = 550;
        this.PLAYER_MAX_SPEED = 500;
        this.PLAYER_ATTACK_COOLDOWN = this.FPS / 3;
        this.PLAYER_PROJ_SPEED = 300;
    }

    initAll() {
        this.ui = {};
        this.player = {};
        this.projPlayer = [];
        this.enemy = [];
        this.projEnemy = [];
        this.score = 0;
        this.scene_time = 0;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.image('projRed', 'projRed.png');
        this.load.image('projGreen', 'projGreen.png');
    }

    initChicken(chicken, x, y, config) {
        let points = [];
        for (let j = 0; j < 11; j++) {
            points.push(x + (-1) ** j * 75);
            points.push(y + j * 70);
        }
        let curve = new Phaser.Curves.Spline(points);

        chicken.sprite = this.add.follower(curve, x, y, "roundAnimals", "chicken.png");
        chicken.sprite.setScale(0.33);
        chicken.sprite.startFollow(config);
        chicken.hp = 2;
        chicken.radii = 128 / 3;
        chicken.attack_cd = this.FPS * 1.5;
        chicken.attack_time = Math.floor(Math.random() * chicken.attack_cd);
        chicken.score = 10;
    }

    create() {
        this.initAll();
        this.player.sprite = this.add.sprite(this.PLAYER_X, this.PLAYER_Y, "roundAnimals", "monkey.png");
        this.player.sprite.setScale(0.33);
        this.player.hp = this.PLAYER_MAX_HP;
        this.player.attack_time = 0;
        this.player.radii = 128 / 3;

        this.ui.timer = this.add.bitmapText(600, 0, "rocketSquare", "Time: " + 0);
        this.ui.score = this.add.bitmapText(10, 0, "rocketSquare", "Score: " + 0);
        this.ui.hpbar = this.add.bitmapText(10, 550, "rocketSquare", "HP: " + this.player.hp);

        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.last_wave = false;

        var timeline = this.add.timeline([
            {
                at: 1000,

                run: () => {
                    for (let i = 0; i < 5; i++) {
                        let chicken = {};

                        let x = 100 + i * 150;
                        let y = - 50;

                        let config = {
                            delay: 1000 + 350 * ((109 ** i) % 5),
                            duration: 15000,
                        }

                        this.initChicken(chicken, x, y, config);
                        this.enemy.push(chicken);
                    }
                }
            },
            {
                at: 3000,

                run: () => {
                    for (let i = 0; i < 4; i++) {
                        let chicken = {};
                        let x = 100 + i * 150 + 75;
                        let y = - 50;

                        let config = {
                            delay: 1000 + 350 * ((103 ** i) % 5),
                            duration: 15000,
                        }

                        this.initChicken(chicken, x, y, config);
                        this.enemy.push(chicken);
                        this.last_wave = true;
                    }
                }
            },
        ])

        timeline.play();
    }

    collide(s1, s2, r1, r2) {
        let dx = Math.abs(s1.x - s2.x);
        let dy = Math.abs(s1.y - s2.y);
        let r = r1 + r2;
        return (dx * dx + dy * dy) < (r * r);
    }

    update() {
        this.scene_time ++;
        this.ui.timer.setText("Time: " + Math.floor(this.scene_time / this.FPS));
        this.ui.score.setText("Score: " + this.score);
        this.ui.hpbar.setText("HP: " + this.player.hp);

        let player = this.player;


        if (this.aKey.isDown && player.sprite.x > 0) {
            player.sprite.x -= this.PLAYER_MAX_SPEED * this.DELTA_TIME;
        }
        if (this.dKey.isDown && player.sprite.x < 800) {
            player.sprite.x += this.PLAYER_MAX_SPEED * this.DELTA_TIME;
        }

        player.attack_time ++;
        if (this.spaceKey.isDown && player.attack_time > this.PLAYER_ATTACK_COOLDOWN) {
            this.projPlayer.push(this.add.sprite(player.sprite.x, player.sprite.y, "projGreen"));
            this.player.attack_time = 0;
        }

        for (let e of this.enemy) {
            e.attack_time ++;
            if (e.attack_time > e.attack_cd) {
                this.projEnemy.push(this.add.sprite(e.sprite.x, e.sprite.y, "projRed"));
                e.attack_time = 0;
            }
        }

        for (let proj of this.projPlayer) {
            proj.y -= this.PLAYER_PROJ_SPEED * this.DELTA_TIME;
        }

        for (let proj of this.projEnemy) {
            proj.y += this.PLAYER_PROJ_SPEED * this.DELTA_TIME;
        }

        for (let i = this.projPlayer.length - 1; i >= 0; i--) {
            if (this.projPlayer[i].y < 0 || this.projPlayer[i].y > 600) {
                this.projPlayer[i].destroy();
                this.projPlayer.splice(i, 1);
                continue;
            }

            let is_hit = false;
            for (let j = this.enemy.length - 1; j >= 0; j--) {
                if (this.collide(this.projPlayer[i], this.enemy[j].sprite, 0, this.enemy[j].radii)) {
                    this.enemy[j].hp --;
                    this.projPlayer[i].destroy();
                    this.projPlayer.splice(i, 1);

                    if (this.enemy[j].hp === 0) {
                        this.score += this.enemy[j].score;
                        this.enemy[j].sprite.destroy();
                        this.enemy.splice(j, 1);
                    }

                    is_hit = true;
                    break;
                }
            }
            if (is_hit) continue;
        }

        for (let i = this.projEnemy.length - 1; i >= 0; i--) {
            if (this.projEnemy[i].y < 0 || this.projEnemy[i].y > 600) {
                this.projEnemy[i].destroy();
                this.projEnemy.splice(i, 1);
                continue;
            }

            if (this.collide(this.projEnemy[i], this.player.sprite, 0, this.player.radii)) {
                this.player.hp --;
                this.projEnemy[i].destroy();
                this.projEnemy.splice(i, 1);

                if (this.player.hp === 0) {
                    this.scene.start("End", {win: false, score: this.score});
                }
            }
        }

        for (let i = this.enemy.length - 1; i >= 0; i--) {
            if (this.enemy[i].sprite.y > 600) {
                this.enemy[i].sprite.destroy();
                this.enemy.splice(i, 1);
            }
        }

        if (this.last_wave && this.enemy.length === 0) {
            this.scene.start("End", {win: true, score: this.score});
        }
    }
}