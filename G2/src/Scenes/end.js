class End extends Phaser.Scene {
    constructor() {
        super("End");

        this.ui = {};
    }

    init (data)
    {
        this.isWin = data.isWin;
        this.score = data.score;
    }

    preload() {

    }

    create() {
        if (this.isWin) this.ui.title = this.add.bitmapText(300, 250, "rocketSquare", "You win!");
        else this.ui.title = this.add.bitmapText(300, 250, "rocketSquare", "You lose!");

        this.ui.score = this.add.bitmapText(260, 300, "rocketSquare", "Your score: " + this.score, 24);
        this.ui.level_chosen = this.add.bitmapText(150, 330, "rocketSquare", "Press <Space> to back to main menu", 24);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        let points = [
            110, 300,
            400, 200,
            690, 300,
            400, 400,
            110, 300
        ]

        let curve = new Phaser.Curves.Spline(points);

        let chicken = this.add.follower(curve, 110, 300, "roundAnimals", "chicken.png");
        chicken.setScale(0.33);

        let monkey = this.add.follower(curve, 110, 300, "roundAnimals", "monkey.png");
        monkey.setScale(0.33);

        let config = {
            repeat: -1,
            duration: 3000,
        }

        monkey.startFollow(config);
        config.delay = 300;
        chicken.startFollow(config);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Start");
        }
    }
}