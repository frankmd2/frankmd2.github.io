class Start extends Phaser.Scene {
    constructor() {
        super("Start");

        this.ui = {};
    }

    create() {
        this.ui.title = this.add.bitmapText(350, 350, "rocketSquare", "JUMP", 48);
        this.ui.level_chosen = this.add.bitmapText(170, 400, "rocketSquare", "Press <Space> to enter", 36);
        this.ui.credit_chosen = this.add.bitmapText(170, 450, "rocketSquare", "Press <C> to go to credit", 36);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.cKey = this.input.keyboard.addKey('C');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("platformerScene");
        }
        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.scene.start("Credit");
        }
    }
}