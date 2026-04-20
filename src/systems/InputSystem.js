import EventBus from "./EventBus.js";

export default class InputSystem {
    constructor(scene) {
        this.scene = scene;

        this.targetOrder = ["A", "S", "D"];
        this.currentInput = [];
        this.iconMap = { A: "gear", S: "chip", D: "battery", F: "bolt" };

        this.keys = {
            A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            F: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        };

        this.orderIcons = [];
        this.orderIconKeys = [];
    }

    handleInput(key) {
        if (this.scene.isGameOver) return;
        if (!this.scene.inputText) return;

        const expected = this.targetOrder[this.currentInput.length];
        if (!expected) return;

        if (key === expected) {
            this.currentInput.push(key);
            this.scene.inputText.setText(this.currentInput.join("  "));
            this.updateOrderUI();

            this.scene.flashRect.setFillStyle(0x00ff88, 0.25);
            this.scene.time.delayedCall(60, () => this.scene.flashRect.setAlpha(0));

            if (this.scene.cache.audio.exists("click")) {
                this.scene.sound.play("click", { volume: 0.6 });
            }

            if (this.currentInput.length === this.targetOrder.length) {
                this.scene.cameras.main.flash(100, 255, 255, 255, false);
                this.scene.combo += 1;
                this.scene.score += 10 * this.scene.combo;
                EventBus.emit("score:changed", this.scene.score);
                EventBus.emit("combo:changed", this.scene.combo);

                // if (this.scene.combo >= 3) {
                //     this.scene.tweens.add({
                //         targets: this.scene.comboText,
                //         scaleX: 1.6, scaleY: 1.6,
                //         duration: 120, yoyo: true,
                //     });
                // }

                this.resetOrder();
            }
        } else {
            this.scene.cameras.main.shake(150, 0.015);
            this.scene.flashRect.setFillStyle(0xff2200, 0.3);
            this.scene.time.delayedCall(80, () => this.scene.flashRect.setAlpha(0));
            this.scene.cameras.main.shake(120, 0.012);

            if (this.scene.cache.audio.exists("error")) {
                this.scene.sound.play("error", { volume: 0.6 });
            }

            this.scene.combo = 0;
            EventBus.emit("combo:changed", 0);
            this.currentInput = [];
            this.scene.inputText.setText("");
            this.updateOrderUI();
        }
    }

    resetOrder() {
        this.targetOrder = Phaser.Utils.Array.Shuffle(["A", "S", "D", "F"]).slice(0, 3);
        this.currentInput = [];
        this.renderOrderIcons();
        this.scene.inputText.setText("");
        this.scene.timeLeft = this.scene.maxTime;
        this.scene.maxTime = Math.max(3, this.scene.maxTime - 0.5);
        EventBus.emit("timer:changed", this.scene.timeLeft, "#00ff88");
    }

    renderOrderIcons() {
        this.orderIcons.forEach(o => o.destroy());
        this.orderIconKeys.forEach(o => o.destroy());
        this.orderIcons = [];
        this.orderIconKeys = [];

        const cx = this.scene.W / 2;
        const spacing = 120;
        const startX = cx - (this.targetOrder.length - 1) * spacing / 2;
        const y = 270;

        this.targetOrder.forEach((key, i) => {
            const icon = this.scene.add
                .image(startX + i * spacing, y, this.iconMap[key])
                .setDisplaySize(80, 80);
            const label = this.scene.add
                .text(startX + i * spacing, y + 52, key, {
                    fontSize: "16px", color: "#888888",
                })
                .setOrigin(0.5);
            this.orderIcons.push(icon);
            this.orderIconKeys.push(label);
        });
    }

    updateOrderUI() {
        this.orderIcons.forEach((icon, i) => {
            icon.setTint(i < this.currentInput.length ? 0x00ff88 : 0xffffff);
        });
    }

    update() {
        const { JustDown } = Phaser.Input.Keyboard;
        const reverseMap = { A: "D", D: "A", S: "F", F: "S" };
        const translate = (k) => this.scene.glitchManager.isReversed ? reverseMap[k] : k;

        if (JustDown(this.keys.A)) this.handleInput(translate("A"));
        if (JustDown(this.keys.S)) this.handleInput(translate("S"));
        if (JustDown(this.keys.D)) this.handleInput(translate("D"));
        if (JustDown(this.keys.F)) this.handleInput(translate("F"));
    }
}