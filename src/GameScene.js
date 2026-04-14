export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("logo", "/assets/logo.png");
    }

    create() {
        // this.add.image(400, 300, "logo");
        this.add.text(250, 280, "Assembly Panic", {
            fontSize: "32px",
            color: "#ffffff"
        });

        this.targetOrder = ["A", "S", "D", "F"];
        this.currentInput = [];

        this.keys = {
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        };

        console.log("GameScene ready. Press A/S/D/F");
    }

    handleInput(key) {
        const nextIndex = this.currentInput.push(key);
        const expected = this.targetOrder[nextIndex];

        if (!expected) {
            return;
        }
        if (key === expected) {
            this.currentInput.push(key);
            console.log(`Đúng: ${key} (${this.currentInput.length}/${this.targetOrder.length})`);

            if (this.currentInput.length === this.targetOrder.length) {
                console.log("Hoàn thành!");
                this.resetOrder();
            }
        } else {
            console.log(`Sai: Nhấn ${key}, cần: ${expected}. Làm lại!`);
            this.currentInput = [];
        }
    }

    resetOrder() {
        const parts = ["A", "S", "D", "F"];

        this.targetOrder = Phaser.Utils.Array.Shuffle([...parts]).slice(0, 3);
        this.currentInput = [];

        console.log(`Thứ tự mới: ${this.targetOrder.join(", ")}`);
    }

    update() {
        const { JustDown } = Phaser.Input.Keyboard;

        if (JustDown(this.keys.A))
            this.handleInput("A");
        if (JustDown(this.keys.S))
            this.handleInput("S");
        if (JustDown(this.keys.D))
            this.handleInput("D");
        if (JustDown(this.keys.F))
            this.handleInput("F");
    }
}