export default class Controls {

    private isAccelerating: boolean = false;
    private lever: HTMLElement | null = null;
    private rotationValue: number = 0;

    public init(): void {

        this.lever = document.getElementById('lever');
        const accelerateButton = document.getElementById('accelerate-btn');

        if (this.lever) {
            let isDragging = false;

            this.lever.addEventListener("mousedown", (_) => {
                isDragging = true;
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            const onMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                const container = this.lever!.parentElement!;
                const rect = container.getBoundingClientRect();
                let percent = (e.clientX - rect.left) / rect.width;
                percent = Math.max(0, Math.min(1, percent)); // Clamp between 0 and 1
                this.rotationValue = -1 * ((percent - 0.5) * 2);
                this.lever!.style.left = `${percent * 100}%`;
            };

            const onMouseUp = () => {
                isDragging = false;
                this.rotationValue = 0;
                this.lever!.style.left = "50%"; // Reset to center
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
        }

        // 🚀 Acceleration button
        if (accelerateButton) {
            accelerateButton.addEventListener('mousedown', () => {
                this.isAccelerating = true;
                accelerateButton.classList.add('active');
            });

            accelerateButton.addEventListener('mouseup', () => {
                this.isAccelerating = false;
                accelerateButton.classList.remove('active');
            });

            // Mobile support
            accelerateButton.addEventListener('touchstart', () => {
                this.isAccelerating = true;
                accelerateButton.classList.add('active');
            });

            accelerateButton.addEventListener('touchend', () => {
                this.isAccelerating = false;
                accelerateButton.classList.remove('active');
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.isAccelerating = true;
                if (accelerateButton) {
                    accelerateButton.classList.add('active');
                }
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.rotationValue = 1;
                this.updateLeverPosition();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.rotationValue = -1;
                this.updateLeverPosition();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.isAccelerating = false;
                if (accelerateButton) {
                    accelerateButton.classList.remove('active'); // Remove active class for visual feedback
                }
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.rotationValue = 0;
                this.updateLeverPosition(); // Update the visual feedback for rotation reset
            }
        });
    }

    private updateLeverPosition(): void {
        if (this.lever) {
            const percent = (-1 * this.rotationValue + 1) / 2;
            this.lever.style.left = `${percent * 100}%`;
        }
    }

    public getRotation(): number {
        return this.rotationValue;
    }

    public isAcceleratingThrust(): boolean {
        return this.isAccelerating;
    }
}
