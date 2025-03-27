import * as THREE from 'three';

interface Chunk {
    position: string;
    object: THREE.Group;
    fuelCanister?: THREE.Mesh;
}

export default class Space {
    private object: THREE.Group;
    private chunkSize: number;
    private loadedChunks: Map<string, Chunk>;
    private playerChunk: string;
    private fuelCanisters: THREE.Mesh[];

    constructor(chunkSize: number = 1000) {
        this.object = new THREE.Group();
        this.chunkSize = chunkSize;
        this.loadedChunks = new Map();
        this.playerChunk = '';
        this.fuelCanisters = [];
    }

    public init(): void {
        this.updateChunks(new THREE.Vector3(0, 0, 0)); // Start at origin
    }

    private updateChunks(playerPosition: THREE.Vector3): void {
        const cx = Math.floor(playerPosition.x / this.chunkSize);
        const cy = Math.floor(playerPosition.y / this.chunkSize);
        const cz = Math.floor(playerPosition.z / this.chunkSize);
        const newChunkKey = `${cx},${cy},${cz}`;

        if (newChunkKey === this.playerChunk) return; // Player hasn't moved to a new chunk

        this.playerChunk = newChunkKey;

        // Load surrounding chunks
        const radius = 3; // Load chunks around the player
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

        // Unload distant chunks
        this.cleanupChunks(cx, cy, cz, radius);
    }

    private addChunk(cx: number, cy: number, cz: number): void {
        const chunkKey = `${cx},${cy},${cz}`;
        if (this.loadedChunks.has(chunkKey)) return;

        const chunkGroup = new THREE.Group();
        chunkGroup.add(this.generateStarsForChunk(cx, cy, cz));

        // 25% chance to spawn a fuel canister
        if (Math.random() < 0.05) {
            const fuelCanister = this.createFuelCanister(cx, cz);
            chunkGroup.add(fuelCanister);
            this.fuelCanisters.push(fuelCanister);
            //console.log("Fuel canister added to chunk:", chunkKey, fuelCanister);
        }

        this.object.add(chunkGroup);
        this.loadedChunks.set(chunkKey, { position: chunkKey, object: chunkGroup });
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
        for (let i = 0; i < this.fuelCanisters.length; i++) {
            const canister = this.fuelCanisters[i];
            if (playerPosition.distanceTo(canister.position) < 50) {
                console.log("Fuel canister picked up:", canister);

                // Find the chunk that contains the fuel canister
                const chunkKey = this.getChunkKeyFromPosition(canister.position);
                const chunk = this.loadedChunks.get(chunkKey);

                if (chunk) {
                    // console.log("Removing canister from chunk:", chunkKey);
                    chunk.object.remove(canister); // Remove from the chunk's group
                } else {
                    //console.warn("Chunk not found for canister:", chunkKey);
                }

                // Remove the canister from the main object group
                //console.log("Removing canister from main object group");
                this.object.remove(canister);

                // Remove the canister from the fuelCanisters array
                //console.log("Removing canister from fuelCanisters array");
                this.fuelCanisters.splice(i, 1);

                return true;
            }
        }
        return false;
    }


    private getChunkKeyFromPosition(position: THREE.Vector3): string {
        const cx = Math.floor(position.x / this.chunkSize);
        const cy = Math.floor(position.y / this.chunkSize);
        const cz = Math.floor(position.z / this.chunkSize);
        return `${cx},${cy},${cz}`;
    }

    private fadeInStars(material: THREE.PointsMaterial): void {
        let opacity = 0;
        const fadeDuration = 1.5; // 1.5 seconds fade-in
        const fadeStep = 1 / (fadeDuration * 60); // Assuming 60 FPS

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
            size: 4,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0
        });

        const starCount = 5;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * this.chunkSize + cx * this.chunkSize;
            positions[i3 + 1] = (Math.random() - 0.5) * this.chunkSize + cy * this.chunkSize + (Math.random() - 0.5) * 200; // 0 == altura nave
            positions[i3 + 2] = (Math.random() - 0.5) * this.chunkSize + cz * this.chunkSize;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);

        // Animate opacity from 0 to 1 (fade-in effect)
        this.fadeInStars(starsMaterial);

        return stars;
    }

    private cleanupChunks(cx: number, cy: number, cz: number, radius: number): void {
        const chunksToRemove: string[] = [];

        this.loadedChunks.forEach((chunk, key) => {
            const [chunkX, chunkY, chunkZ] = key.split(',').map(Number);
            if (Math.abs(chunkX - cx) > radius || Math.abs(chunkY - cy) > radius || Math.abs(chunkZ - cz) > radius) {
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
