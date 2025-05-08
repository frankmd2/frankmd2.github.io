class Start extends Phaser.Scene {
    constructor() {
        super("Start");

        this.ui = {};
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.atlasXML("roundAnimals", "round.png", "round.xml");
        this.load.atlasXML("squareAnimals", "square.png", "square.xml");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        this.ui.title = this.add.bitmapText(220, 250, "rocketSquare", "Chicken Invader");
        this.ui.level_chosen = this.add.bitmapText(150, 300, "rocketSquare", "Press <Space> to enter level 1", 24);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

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

        chicken.startFollow(config);
        config.delay = 300;
        monkey.startFollow(config);


    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Level");
        }

        if (Phaser.Input.Keyboard.JustDown(this.aKey)) {
            this.scene.start("End", {isWin: false, score: 3000});
        }
    }
}