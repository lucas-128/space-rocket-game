import * as THREE from 'three';

export default class Rocket {
    private object: THREE.Group;
    private speed: number = 250;
    private rotationSpeed: number = 3;
    private fuel: number = 100;

    constructor() {
        this.object = new THREE.Group();
    }

    public init(): void {
        this.object = new THREE.Group();
        const bodyGeometry = new THREE.ConeGeometry(0.5, 2.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x5555FF, metalness: 0.6, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI * 1.5;
        this.object.add(body);
        const engineGlowGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.5, 16);
        const engineGlowMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6600,
            emissive: 0xFF5500,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.8
        });
        const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
        engineGlow.rotation.x = Math.PI / 2;
        engineGlow.position.set(0, 0, 1.2);
        this.object.add(engineGlow);

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this.object.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        directionalLight.position.set(5, 5, 5);
        this.object.add(directionalLight);

        const engineLight = new THREE.PointLight(0xFF5500, 5, 5);
        engineLight.position.set(0, 0, -1.5);
        this.object.add(engineLight);

        this.object.position.set(0, 0, 0);
    }

    public getObject(): THREE.Group {
        return this.object;
    }

    public getPosition(): THREE.Vector3 {
        return this.object.position.clone();
    }

    public setPositionX(x: number): void {
        this.object.position.x = x;
    }

    public setPositionZ(z: number): void {
        this.object.position.z = z;
    }

    public move(directionX: number, directionY: number, delta: number): void {
        if (directionX === 0 && directionY === 0) return;

        const targetAngle = Math.atan2(directionX, directionY);
        const currentRotation = this.object.rotation.y;
        const angleDiff = targetAngle - currentRotation;
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        this.object.rotation.y += normalizedAngleDiff * this.rotationSpeed * delta;
    }

    public accelerate(delta: number): void {
        if (this.fuel <= 0) return;
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.object.quaternion);
        this.object.position.addScaledVector(direction, this.speed * delta);
        this.fuel = Math.max(0, this.fuel - delta * 5);


    }

    public rotate(rotationInput: number, delta: number): void {
        this.object.rotation.y += rotationInput * this.rotationSpeed * delta;
    }

    public getFuel(): number {
        return this.fuel;
    }

    public refuel(amount: number): void {
        this.fuel = Math.min(100, this.fuel + amount);
    }
}
