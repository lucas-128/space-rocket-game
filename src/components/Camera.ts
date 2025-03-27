import * as THREE from 'three';

export default class Camera {
    private camera: THREE.PerspectiveCamera;
    private cameraRig: THREE.Object3D;
    private followHeight: number = 3;
    private followDistance: number = 8;
    private lerpFactor: number = 1;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.cameraRig = new THREE.Object3D();
        this.camera.position.set(0, this.followHeight, this.followDistance);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.cameraRig.add(this.camera);
    }

    public init(): void {
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public getObject(): THREE.Object3D {
        return this.cameraRig;
    }

    public follow(target: THREE.Object3D, delta: number): void {
        this.cameraRig.position.lerp(target.position, this.lerpFactor * delta * 60);
        this.cameraRig.quaternion.slerp(target.quaternion, this.lerpFactor * delta * 60);
        const lookAtOffset = new THREE.Vector3(0, 0, -10).applyQuaternion(this.cameraRig.quaternion);
        const targetLookAt = this.cameraRig.position.clone().add(lookAtOffset);
        this.camera.lookAt(targetLookAt);

    }
}
