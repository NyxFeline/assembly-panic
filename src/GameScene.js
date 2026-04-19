export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.load.image("logo", "/assets/img/logo.png");
        this.load.audio("glitch", "/assets/sounds/glitch.ogg");
    }

    create() {
        this.add.text(250, 50, "Assembly Panic", { fontSize: "32px", color: "#ffffff" });

        // Timer (top-left)
        this.timerText = this.add.text(20, 20, "Time: 10", { fontSize: "28px", color: "#00ff88" });

        // Score (top-right)
        this.score = 0;
        this.scoreText = this.add.text(650, 20, "Score: 0", { fontSize: "28px", color: "#ffffff" });

        // Order cần nhấn (giữa màn hình)
        this.targetOrder = ["A", "S", "D"];
        this.orderText = this.add.text(200, 250, `CẦN: ${this.targetOrder.join(" - ")}`, {
            fontSize: "36px", color: "#ffdd00"
        });

        // Input người chơi đã bấm đúng
        this.currentInput = [];
        this.inputText = this.add.text(200, 320, "BẤM: ", { fontSize: "36px", color: "#00ccff" });

        // Keys
        this.keys = {
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        };

        this.isReversed = false;
        this.startGlitchTimer();

        this.flashRect = this.add.rectangle(400, 300, 800, 600, 0x00ff88, 0).setAlpha(0);
        this.isGameOver = false;

        this.maxTime = 10;
        this.timeLeft = 10;
        this.startTimer();
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.onTick,
            callbackScope: this,
            loop: true,
        });
    }

    onTick() {
        this.timeLeft -= 1;
        // Hiển thị ceil để tránh số lẻ float
        this.timerText.setText(`Time: ${Math.ceil(this.timeLeft)}`);
        this.timerText.setColor(this.timeLeft <= 3 ? "#ff4444" : "#00ff88");

        if (this.timeLeft <= 0 && !this.isGameOver) {
            this.isGameOver = true;
            this.timerEvent.remove();
            this.gameOver();
        }
    }

    addTime(seconds) {
        this.timeLeft += seconds;
        this.timerText.setText(`Time: ${this.timeLeft}`);

        this.timerText.setColor(this.timeLeft > 3 ? "#00ff88" : "#ff4444");
    }

    handleInput(key) {
        if (this.isGameOver) return;

        const nextIndex = this.currentInput.length;
        const expected = this.targetOrder[nextIndex];

        if (!expected) return;

        if (key === expected) {
            this.currentInput.push(key);

            // UPDATE inputText theo từng phím đúng
            this.inputText.setText(`BẤM: ${this.currentInput.join(" - ")}`);

            this.flashRect.setAlpha(0.3);
            this.time.delayedCall(100, () => this.flashRect.setAlpha(0));

            if (this.currentInput.length === this.targetOrder.length) {
                this.score += 10;
                this.scoreText.setText(`Score: ${this.score}`);
                this.maxTime = Math.max(3, this.maxTime - 0.5);
                this.resetOrder();
            }
        } else {
            this.cameras.main.shake(100, 0.01);
            this.currentInput = [];
            this.inputText.setText("BẤM: ");
        }
    }

    startGlitchTimer() {
        const delay = Phaser.Math.Between(5000, 8000);

        this.time.delayedCall(delay, () => {
            if (this.isGameOver) return;

            const redFlash = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.15);

            const warnText = this.add.text(400, 300, "SYSTEM ERROR!\nREVERSE CONTROL", {
                fontSize: "32px",
                color: "#ff4444",
                align: "center",
            }).setOrigin(0.5);

            const warnTween = this.tweens.add({
                targets: warnText,
                alpha: 0,
                duration: 200,
                yoyo: true,
                repeat: -1,
            });

            this.time.delayedCall(1000, () => {

                warnTween.stop();
                warnText.destroy();
                redFlash.destroy();

                this.isReversed = true;

                if (this.cache.audio.exists("glitch")) {
                    this.sound.play("glitch", { loop: true, volume: 0.5 });
                }

                this.glitchText = this.add.text(20, 55, "[ REVERSED ]", {
                    fontSize: "16px", color: "#ff4444",
                });
                this.glitchTween = this.tweens.add({
                    targets: this.glitchText,
                    alpha: 0, duration: 300, yoyo: true, repeat: -1,
                });

                this.time.delayedCall(3000, () => {
                    this.isReversed = false;

                    if (this.cache.audio.exists("glitch")) {
                        this.sound.stopByKey("glitch");
                    }

                    this.glitchTween.stop();
                    this.glitchText.destroy();
                    this.startGlitchTimer();
                });
            });
        });
    }

    resetOrder() {
        const parts = ["A", "S", "D", "F"];
        this.targetOrder = Phaser.Utils.Array.Shuffle([...parts]).slice(0, 3);
        this.currentInput = [];

        // UPDATE orderText để hiện thứ tự mới
        this.orderText.setText(`CẦN: ${this.targetOrder.join(" - ")}`);
        this.inputText.setText("BẤM: ");

        this.timeLeft = this.maxTime;
        this.timerText.setText(`Time: ${Math.ceil(this.timeLeft)}`);
        this.timerText.setColor("#00ff88");
    }

    gameOver() {
        this.isGameOver = true;
        this.input.keyboard.enabled = false;

        if (this.timerEvent) this.timerEvent.remove();

        this.isReversed = false;
        if (this.glitchTween) this.glitchTween.stop();
        if (this.glitchText) this.glitchText.destroy();
        if (this.cache.audio.exists("glitch")) this.sound.stopByKey("glitch");

        this.time.removeAllEvents();

        this.add.text(200, 400, "GAME OVER", { fontSize: "48px", color: "#ff0000" });
        this.add.text(260, 460, `Score: ${this.score}`, { fontSize: "32px", color: "#ffffff" });
    }

    update() {
        const { JustDown } = Phaser.Input.Keyboard;

        const reverseMap = { A: "D", D: "A", S: "F", F: "S" };

        const translate = (key) => this.isReversed ? reverseMap[key] : key;

        if (JustDown(this.keys.A)) this.handleInput(translate("A"));
        if (JustDown(this.keys.S)) this.handleInput(translate("S"));
        if (JustDown(this.keys.D)) this.handleInput(translate("D"));
        if (JustDown(this.keys.F)) this.handleInput(translate("F"));
    }
}