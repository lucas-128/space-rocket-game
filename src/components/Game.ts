import * as THREE from 'three';
import Rocket from './Rocket';
import Controls from './Controls';
import Space from './Space';
import Camera from './Camera';

export default class Game {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private clock: THREE.Clock;
    private camera: Camera;
    private rocket: Rocket;
    private controls: Controls;
    private space: Space;
    private chunkSize: number = 1000;
    private coordinatesDisplay: HTMLElement | null;
    private fuelBar: HTMLElement | null;
    private gameOver: boolean = false;
    private startPopup: HTMLElement | null;
    private endPopup: HTMLElement | null;
    private startButton: HTMLElement | null;
    private restartButton: HTMLElement | null;
    private endMessage: HTMLElement | null;


    constructor() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.camera = new Camera();
        this.rocket = new Rocket();
        this.space = new Space(this.chunkSize);
        this.controls = new Controls();
        this.coordinatesDisplay = document.getElementById('coordinates');
        this.fuelBar = document.getElementById('fuel-bar');
        this.startPopup = document.getElementById('start-popup');
        this.endPopup = document.getElementById('end-popup');
        this.startButton = document.getElementById('start-btn');
        this.restartButton = document.getElementById('restart-btn');
        this.endMessage = document.getElementById('end-message');


        this.setupEventListeners();
        this.showStartPopup();
    }

    private setupEventListeners(): void {


        this.startButton?.addEventListener('click', () => {

            this.hideStartPopup();
        });


        this.restartButton?.addEventListener('click', () => {
            this.hideEndPopup();
            this.restartGame();
        });
    }

    private showEndPopup(win: boolean): void {
        if (this.endPopup && this.endMessage) {
            this.endMessage.textContent = win ? "Mission Accomplished!" : "Mission Failed!";
            this.endPopup.style.display = 'flex';
        }
    }

    private hideEndPopup(): void {
        if (this.endPopup) {
            this.endPopup.style.display = 'none';
        }
    }

    private showStartPopup(): void {
        if (this.startPopup) {
            this.startPopup.style.display = 'flex';
        }
    }

    private hideStartPopup(): void {
        if (this.startPopup) {
            this.startPopup.style.display = 'none';
        }
    }

    private restartGame(): void {
        // Clean up existing game
        const container = document.getElementById('game-container');
        if (container) {
            container.innerHTML = '';
        }

        // Reset game state
        this.gameOver = false;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.rocket = new Rocket();
        this.space = new Space(this.chunkSize);
        this.controls = new Controls();

        // Reinitialize
        this.init();
    }



    public init(): void {
        const container = document.getElementById('game-container');
        container!.innerHTML = '';
        container?.appendChild(this.renderer.domElement);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.init();
        this.scene.add(this.camera.getObject());

        this.space.init();
        this.scene.add(this.space.getObject());

        this.rocket.init();
        this.scene.add(this.rocket.getObject());

        this.controls.init();

        this.animate();
    }

    private animate(): void {
        if (this.gameOver) return;

        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        const fuel = this.rocket.getFuel();
        if (fuel <= 0) {
            this.endGame(false);
            return;
        }

        const rocketPosition = this.rocket.getPosition();

        if (this.space.checkTargetReached(rocketPosition)) {
            this.endGame(true);
            return;
        }

        if (this.space.checkFuelPickup(rocketPosition)) {
            this.rocket.refuel(100);
        }

        this.space.updatePlayerPosition(rocketPosition);

        if (this.controls.isAcceleratingThrust()) {
            this.rocket.accelerate(delta);
        }

        const rotationInput = this.controls.getRotation();
        this.rocket.rotate(rotationInput, delta);

        this.camera.follow(this.rocket.getObject(), delta);

        if (this.coordinatesDisplay) {
            const targetPos = this.space.getTargetPosition();
            const distanceToTarget = Math.round(rocketPosition.distanceTo(targetPos));
            this.coordinatesDisplay.textContent = `X: ${Math.round(rocketPosition.x)}, Y: ${Math.round(rocketPosition.z)} | Target Distance: ${distanceToTarget}`;
        }

        if (this.fuelBar) {
            this.fuelBar.style.width = `${fuel}%`;
            this.fuelBar.style.backgroundColor = fuel < 20 ? 'red' : 'limegreen';
            this.fuelBar.style.height = '10px';
        }

        this.renderer.render(this.scene, this.camera.getCamera());
    }

    private endGame(win: boolean): void {
        this.gameOver = true;
        this.showEndPopup(win);
    }

    public handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.getCamera().aspect = width / height;
        this.camera.getCamera().updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}