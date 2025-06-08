class Start extends Phaser.Scene {
    constructor() {
        super("Start");

        this.ui = {};
    }

    create() {
        //this.ui.title = this.add.bitmapText(520, 350, "rocketSquare", "Cave", 48);
        //this.ui.level_chosen = this.add.bitmapText(350, 400, "rocketSquare", "Press <Space> to enter", 36);

    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            //this.scene.start("platformerScene");
            var player = prompt("Please enter your name", "name");
            console.log(player);
        }
    }
}