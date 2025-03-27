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
    }

    public init(): void {
        const container = document.getElementById('game-container');

        // Setup renderer
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container?.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.init();
        this.scene.add(this.camera.getObject());

        // Setup space
        this.space.init();
        this.scene.add(this.space.getObject());

        // Setup rocket
        this.rocket.init();
        this.scene.add(this.rocket.getObject());

        // Setup controls
        this.controls.init();

        // Start game loop
        this.animate();
    }

    private animate(): void {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        // Check fuel level
        const fuel = this.rocket.getFuel();
        if (fuel <= 0) {
            console.log('Game over! Out of fuel!');
            return;
        }


        // Get rocket position
        const rocketPosition = this.rocket.getPosition();

        // Check if in fuel pickup
        if (this.space.checkFuelPickup(rocketPosition)) {
            this.rocket.refuel(50);
            console.log("Fuel canister picked up and refueled.");
        }

        // Update space (generate stars dynamically)
        this.space.updatePlayerPosition(rocketPosition);

        if (this.controls.isAcceleratingThrust()) {
            this.rocket.accelerate(delta);
        }

        const rotationInput = this.controls.getRotation();
        this.rocket.rotate(rotationInput, delta);

        // Update camera to follow rocket - now passing delta time
        this.camera.follow(this.rocket.getObject(), delta);

        // Update coordinates display
        if (this.coordinatesDisplay) {
            this.coordinatesDisplay.textContent = `X: ${Math.round(rocketPosition.x)}, Y: ${Math.round(rocketPosition.z)}`;
        }

        // Update fuel bar UI
        if (this.fuelBar) {
            this.fuelBar.style.width = `${fuel}%`;
            this.fuelBar.style.backgroundColor = fuel < 20 ? 'red' : 'limegreen';
            this.fuelBar.style.height = '10px';
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera.getCamera());
    }

    public handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.getCamera().aspect = width / height;
        this.camera.getCamera().updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}