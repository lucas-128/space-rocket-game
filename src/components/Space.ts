import * as THREE from 'three';

interface Chunk {
    position: string;
    object: THREE.Group;
    fuelCanister?: {
        mesh: THREE.Mesh;
        chunkKey: string;
    };
}

export default class Space {
    private object: THREE.Group;
    private chunkSize: number;
    private loadedChunks: Map<string, Chunk>;
    private playerChunk: string;
    private fuelCanisterMap: Map<THREE.Mesh, string>;

    constructor(chunkSize: number = 1000) {
        this.object = new THREE.Group();
        this.chunkSize = chunkSize;
        this.loadedChunks = new Map();
        this.playerChunk = '';
        this.fuelCanisterMap = new Map();
    }

    public init(): void {
        this.updateChunks(new THREE.Vector3(0, 0, 0));
    }

    private updateChunks(playerPosition: THREE.Vector3): void {
        const cx = Math.floor(playerPosition.x / this.chunkSize);
        const cy = Math.floor(playerPosition.y / this.chunkSize);
        const cz = Math.floor(playerPosition.z / this.chunkSize);
        const newChunkKey = `${cx},${cy},${cz}`;

        if (newChunkKey === this.playerChunk) return;

        this.playerChunk = newChunkKey;

        const radius = 3;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dz = -radius; dz <= radius; dz++) {
                    const chunkKey = `${cx + dx},${cy + dy},${cz + dz}`;
                    if (!this.loadedChunks.has(chunkKey)) {
                        this.addChunk(cx + dx, cy + dy, cz + dz);
                    }
                }
            }
        }

        this.cleanupChunks(cx, cy, cz, radius);
    }

    private addChunk(cx: number, cy: number, cz: number): void {
        const chunkKey = `${cx},${cy},${cz}`;
        if (this.loadedChunks.has(chunkKey)) return;

        const chunkGroup = new THREE.Group();
        chunkGroup.add(this.generateStarsForChunk(cx, cy, cz));

        const chunkData: Chunk = {
            position: chunkKey,
            object: chunkGroup
        };

        if (Math.random() < 0.01) {
            const fuelCanister = this.createFuelCanister(cx, cz);
            chunkGroup.add(fuelCanister);
            chunkData.fuelCanister = {
                mesh: fuelCanister,
                chunkKey: chunkKey
            };
            this.fuelCanisterMap.set(fuelCanister, chunkKey);
        }

        this.object.add(chunkGroup);
        this.loadedChunks.set(chunkKey, chunkData);
    }

    private createFuelCanister(cx: number, cz: number): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(10, 10, 10, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const fuelCanister = new THREE.Mesh(geometry, material);
        fuelCanister.position.set(
            cx * this.chunkSize + Math.random() * this.chunkSize,
            0,
            cz * this.chunkSize + Math.random() * this.chunkSize
        );
        return fuelCanister;
    }

    public checkFuelPickup(playerPosition: THREE.Vector3): boolean {
        for (const [canister, chunkKey] of this.fuelCanisterMap) {
            if (playerPosition.distanceTo(canister.position) < 10) {
                this.removeFuelCanister(canister, chunkKey);
                return true;
            }
        }
        return false;
    }

    private removeFuelCanister(canister: THREE.Mesh, chunkKey: string): void {
        // Remove from chunk
        const chunk = this.loadedChunks.get(chunkKey);
        if (chunk?.fuelCanister?.mesh === canister) {
            chunk.object.remove(canister);
            delete chunk.fuelCanister;
        }

        // Remove from scene and clean up
        this.object.remove(canister);
        this.fuelCanisterMap.delete(canister);

        // Dispose resources
        canister.geometry.dispose();
        if (Array.isArray(canister.material)) {
            canister.material.forEach(mat => mat.dispose());
        } else {
            canister.material.dispose();
        }
    }

    private fadeInStars(material: THREE.PointsMaterial): void {
        let opacity = 0;
        const fadeDuration = 1.5;
        const fadeStep = 1 / (fadeDuration * 60);

        function fade() {
            opacity += fadeStep;
            material.opacity = Math.min(opacity, 1);

            if (opacity < 1) {
                requestAnimationFrame(fade);
            }
        }

        fade();
    }

    private generateStarsForChunk(cx: number, cy: number, cz: number): THREE.Points {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 3,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0
        });

        const starCount = 4;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * this.chunkSize + cx * this.chunkSize;
            positions[i3 + 1] = (Math.random() - 0.5) * this.chunkSize + cy * this.chunkSize + (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * this.chunkSize + cz * this.chunkSize;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);

        this.fadeInStars(starsMaterial);
        return stars;
    }

    private cleanupChunks(cx: number, cy: number, cz: number, radius: number): void {
        const chunksToRemove: string[] = [];

        this.loadedChunks.forEach((chunk, key) => {
            const [chunkX, chunkY, chunkZ] = key.split(',').map(Number);
            if (Math.abs(chunkX - cx) > radius || Math.abs(chunkY - cy) > radius || Math.abs(chunkZ - cz) > radius) {
                if (chunk.fuelCanister) {
                    this.removeFuelCanister(chunk.fuelCanister.mesh, key);
                }

                this.object.remove(chunk.object);
                chunksToRemove.push(key);
            }
        });

        chunksToRemove.forEach(key => this.loadedChunks.delete(key));
    }

    public updatePlayerPosition(playerPosition: THREE.Vector3): void {
        this.updateChunks(playerPosition);
    }

    public getObject(): THREE.Group {
        return this.object;
    }
}