export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("gear", "/assets/img/gear.png");
        this.load.image("chip", "/assets/img/chip.png");
        this.load.image("battery", "/assets/img/battery.png");
        this.load.image("bolt", "/assets/img/bolt.png");

        this.load.audio("glitch", "/assets/sounds/glitch.ogg");
        this.load.audio("bgm", "/assets/sounds/bgm.ogg");
        this.load.audio("click", "/assets/sounds/click.ogg");
        this.load.audio("error", "/assets/sounds/error.ogg");
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        // State
        this.isGameOver = false;
        this.isReversed = false;
        this.score = 0;
        this.combo = 0;
        this.maxTime = 10;
        this.timeLeft = 10;
        this.targetOrder = ["A", "S", "D"];
        this.currentInput = [];
        this.iconMap = { A: "gear", S: "chip", D: "battery", F: "bolt" };

        this.keys = {
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        };

        this.flashRect = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0)
            .setDepth(99);

        this.showStartScreen();
    }

    showStartScreen() {
        const cx = this.W / 2;

        // Title
        this.add.text(cx, 120, "ASSEMBLY PANIC", {
            fontSize: "44px", color: "#00ff88", fontStyle: "bold",
        }).setOrigin(0.5);

        const keys = [
            { key: "A", icon: "gear", label: "Gear" },
            { key: "S", icon: "chip", label: "Chip" },
            { key: "D", icon: "battery", label: "Battery" },
            { key: "F", icon: "bolt", label: "Bolt" },
        ];
        const spacing = 130;
        const startX = cx - (spacing * 1.5);
        const guideY = 280;

        keys.forEach(({ key, icon, label }, i) => {
            const x = startX + i * spacing;
            this.add.rectangle(x, guideY - 30, 52, 52, 0x223344).setOrigin(0.5);
            this.add.text(x, guideY - 30, `[${key}]`, {
                fontSize: "20px", color: "#ffdd00",
            }).setOrigin(0.5);
            this.add.image(x, guideY + 30, icon).setDisplaySize(48, 48);
            this.add.text(x, guideY + 62, label, {
                fontSize: "13px", color: "#aaaaaa",
            }).setOrigin(0.5);
        });

        this.add.text(cx, 400,
            "Nhìn icon → bấm phím đúng thứ tự\nCảnh báo đỏ = controls bị đảo!", {
            fontSize: "16px", color: "#888888",
            align: "center", lineSpacing: 8,
        }).setOrigin(0.5);

        const startText = this.add.text(cx, 490, "CLICK TO START", {
            fontSize: "28px", color: "#ffffff",
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText, alpha: 0,
            duration: 600, yoyo: true, repeat: -1,
        });

        this.input.once("pointerdown", () => {
            this.children.removeAll(true); // xóa hết start screen
            this.flashRect = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xffffff, 0).setDepth(99);
            this.startGame();
        });
    }

    startGame() {
        if (this.cache.audio.exists("bgm")) {
            this.sound.play("bgm", { loop: true, volume: 0.4 });
        }

        const cx = this.W / 2;

        this.timerText = this.add.text(20, 16, "TIME: 10", {
            fontSize: "26px", color: "#00ff88",
        }).setDepth(10);

        this.scoreText = this.add.text(this.W - 20, 16, "SCORE: 0", {
            fontSize: "26px", color: "#ffffff",
        }).setOrigin(1, 0).setDepth(10);

        this.comboText = this.add.text(20, 50, "", {
            fontSize: "18px", color: "#ffaa00",
        }).setDepth(10);

        this.add.text(cx, 160, "CẦN:", {
            fontSize: "22px", color: "#ffdd00",
        }).setOrigin(0.5);

        this.orderIcons = [];
        this.orderIconKeys = [];
        this.renderOrderIcons();

        this.inputText = this.add.text(cx, 380, "", {
            fontSize: "28px", color: "#00ccff",
        }).setOrigin(0.5).setDepth(10);

        this.drawKeyBar();

        this.startTimer();
        this.startGlitchTimer();
    }

    drawKeyBar() {
        const keys = [
            { key: "A", icon: "gear" },
            { key: "S", icon: "chip" },
            { key: "D", icon: "battery" },
            { key: "F", icon: "bolt" },
        ];
        const spacing = 100;
        const startX = this.W / 2 - spacing * 1.5;
        const y = this.H - 48;

        this.add.rectangle(this.W / 2, y, this.W, 72, 0x111122).setOrigin(0.5);

        keys.forEach(({ key, icon }, i) => {
            const x = startX + i * spacing;
            this.add.image(x - 18, y, icon).setDisplaySize(30, 30).setAlpha(0.7);
            this.add.text(x + 14, y, `[${key}]`, {
                fontSize: "16px", color: "#666688",
            }).setOrigin(0, 0.5);
        });
    }

    renderOrderIcons() {
        this.orderIcons.forEach(o => o.destroy());
        this.orderIconKeys.forEach(o => o.destroy());
        this.orderIcons = [];
        this.orderIconKeys = [];

        const cx = this.W / 2;
        const spacing = 120;
        const startX = cx - (this.targetOrder.length - 1) * spacing / 2;
        const y = 270;

        this.targetOrder.forEach((key, i) => {
            const icon = this.add.image(startX + i * spacing, y, this.iconMap[key])
                .setDisplaySize(80, 80);
            const label = this.add.text(startX + i * spacing, y + 52, key, {
                fontSize: "16px", color: "#888888",
            }).setOrigin(0.5);
            this.orderIcons.push(icon);
            this.orderIconKeys.push(label);
        });
    }

    updateOrderUI() {
        this.orderIcons.forEach((icon, i) => {
            icon.setTint(i < this.currentInput.length ? 0x00ff88 : 0xffffff);
        });
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000, callback: this.onTick,
            callbackScope: this, loop: true,
        });
    }

    onTick() {
        this.timeLeft -= 1;
        this.timerText.setText(`TIME: ${Math.ceil(this.timeLeft)}`);
        this.timerText.setColor(this.timeLeft <= 3 ? "#ff4444" : "#00ff88");

        if (this.timeLeft <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            this.timerEvent.remove();
            this.gameOver();
        }
    }

    handleInput(key) {
        if (this.isGameOver) return;

        const expected = this.targetOrder[this.currentInput.length];
        if (!expected) return;

        if (key === expected) {
            this.currentInput.push(key);
            this.inputText.setText(this.currentInput.join("  "));
            this.updateOrderUI();

            this.flashRect.setFillStyle(0x00ff88, 0.25);
            this.time.delayedCall(60, () => this.flashRect.setAlpha(0));

            if (this.cache.audio.exists("click")) this.sound.play("click", { volume: 0.6 });

            if (this.currentInput.length === this.targetOrder.length) {
                this.cameras.main.flash(100, 255, 255, 255, false);
                this.combo += 1;
                this.score += 10 * this.combo;
                this.scoreText.setText(`SCORE: ${this.score}`);
                this.comboText.setText(`COMBO x${this.combo}`);

                if (this.combo >= 3) {
                    this.tweens.add({
                        targets: this.comboText,
                        scaleX: 1.6, scaleY: 1.6,
                        duration: 120, yoyo: true,
                    });
                }

                this.resetOrder();
            }
        } else {
            this.cameras.main.shake(150, 0.015);
            this.flashRect.setFillStyle(0xff2200, 0.3);
            this.time.delayedCall(80, () => this.flashRect.setAlpha(0));
            this.cameras.main.shake(120, 0.012);

            if (this.cache.audio.exists("error")) this.sound.play("error", { volume: 0.6 });

            this.combo = 0;
            this.comboText.setText("");
            this.currentInput = [];
            this.inputText.setText("");
            this.updateOrderUI();
        }
    }

    resetOrder() {
        this.targetOrder = Phaser.Utils.Array.Shuffle(["A", "S", "D", "F"]).slice(0, 3);
        this.currentInput = [];
        this.renderOrderIcons();
        this.inputText.setText("");
        this.timeLeft = this.maxTime;
        this.maxTime = Math.max(3, this.maxTime - 0.5);
        this.timerText.setText(`TIME: ${Math.ceil(this.timeLeft)}`);
        this.timerText.setColor("#00ff88");
    }

    startGlitchTimer() {
        this.time.delayedCall(Phaser.Math.Between(5000, 8000), () => {
            if (this.isGameOver) return;

            const redFlash = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0xff0000, 0.12).setDepth(50);
            const warnText = this.add.text(this.W / 2, this.H / 2 - 30,
                "⚠ SYSTEM ERROR\nREVERSE CONTROL", {
                fontSize: "30px", color: "#ff4444", align: "center",
            }).setOrigin(0.5).setDepth(51);

            const warnTween = this.tweens.add({
                targets: warnText, alpha: 0, duration: 200, yoyo: true, repeat: -1,
            });

            this.time.delayedCall(1000, () => {
                if (this.isGameOver) { redFlash.destroy(); warnText.destroy(); return; }

                warnTween.stop(); warnText.destroy(); redFlash.destroy();
                this.isReversed = true;

                if (this.cache.audio.exists("glitch")) this.sound.play("glitch", { loop: true, volume: 0.5 });

                this.glitchText = this.add.text(20, 78, "[ REVERSED ]", {
                    fontSize: "15px", color: "#ff4444",
                }).setDepth(10);
                this.glitchTween = this.tweens.add({
                    targets: this.glitchText, alpha: 0, duration: 300, yoyo: true, repeat: -1,
                });

                this.time.delayedCall(3000, () => {
                    this.isReversed = false;
                    if (this.cache.audio.exists("glitch")) this.sound.stopByKey("glitch");
                    this.glitchTween.stop();
                    this.glitchText.destroy();
                    this.startGlitchTimer();
                });
            });
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.input.keyboard.enabled = false;
        if (this.timerEvent) this.timerEvent.remove();
        if (this.glitchTween) this.glitchTween.stop();
        if (this.glitchText) this.glitchText.destroy();
        if (this.cache.audio.exists("glitch")) this.sound.stopByKey("glitch");
        if (this.cache.audio.exists("bgm")) this.sound.stopByKey("bgm");
        this.time.removeAllEvents();

        this.cameras.main.setBackgroundColor("#0000aa");
        this.children.list.forEach(child => child.setVisible(false));

        const bsodContent = [
            ":( YOUR ROBOT HAS ENCOUNTERED AN ERROR",
            "",
            "FATAL ERROR: CONSCIOUSNESS_DELETED",
            "",
            `SCORE            : ${this.score}`,
            `COMBO MAX        : x${this.combo}`,
            "",
            "A critical process has stopped.",
            "Collecting error data...",
            "",
            "Press  [R]  TO REBOOT SYSTEM",
        ].join("\n");

        this.add.text(80, 80, bsodContent, {
            fontSize: "18px",
            color: "#ffffff",
            fontFamily: "Courier, monospace",
            lineSpacing: 10,
            align: "left",
        }).setDepth(100);

        this.input.keyboard.enabled = true;
        const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        rKey.once("down", () => this.scene.restart());
    }

    update() {
        const { JustDown } = Phaser.Input.Keyboard;
        const reverseMap = { A: "D", D: "A", S: "F", F: "S" };
        const translate = (k) => this.isReversed ? reverseMap[k] : k;

        if (JustDown(this.keys.A)) this.handleInput(translate("A"));
        if (JustDown(this.keys.S)) this.handleInput(translate("S"));
        if (JustDown(this.keys.D)) this.handleInput(translate("D"));
        if (JustDown(this.keys.F)) this.handleInput(translate("F"));
    }
}