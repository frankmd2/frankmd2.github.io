class Credit extends Phaser.Scene {
    constructor() {
        super("Credit");

        this.ui = {};
    }

    create() {
        this.ui.credit = this.add.bitmapText(300, 350, "rocketSquare", "Author: Frank Zeng", 36);
        this.ui.back = this.add.bitmapText(170, 400, "rocketSquare", "Press <Space> to back to start", 36);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("Start");
        }
    }
}