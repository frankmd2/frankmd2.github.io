class End extends Phaser.Scene {
    constructor() {
        super("End");

        this.ui = {};
    }

    preload() {

    }

    create() {
        this.ui.title = this.add.bitmapText(300, 250, "rocketSquare", "You win!");

        this.ui.level_chosen = this.add.bitmapText(150, 330, "rocketSquare", "Press <Space> to back to main menu", 24);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cKey = this.input.keyboard.addKey('C');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Start");
        }
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.scene.start("credit");
        }
    }
}