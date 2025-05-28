class End extends Phaser.Scene {
    constructor() {
        super("End");

        this.ui = {};
    }

    init (data)
    {
        this.isWin = data.win;
        this.score = data.score;
    }

    preload() {

    }

    create() {
        if (this.isWin) this.ui.title = this.add.bitmapText(300, 250, "rocketSquare", "You win!");
        else this.ui.title = this.add.bitmapText(300, 250, "rocketSquare", "You lose!");

        this.ui.score = this.add.bitmapText(260, 300, "rocketSquare", "You collect: " + this.score + " coins", 24);
        this.ui.level_chosen = this.add.bitmapText(150, 330, "rocketSquare", "Press <Space> to back to main menu", 24);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Start");
        }
    }
}