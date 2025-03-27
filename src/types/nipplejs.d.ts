declare module 'nipplejs' {
    export interface JoystickManagerOptions {
        zone: HTMLElement;
        mode?: 'static' | 'semi' | 'dynamic';
        position?: { top?: string; right?: string; bottom?: string; left?: string };
        size?: number;
        color?: string;
        lockX?: boolean;
        lockY?: boolean;
        catchDistance?: number;
        threshold?: number;
        fadeTime?: number;
        multitouch?: boolean;
        maxNumberOfNipples?: number;
        dataOnly?: boolean;
        restOpacity?: number;
        restJoystick?: boolean;
    }

    export interface JoystickInstance {
        on(event: string, handler: (evt: any, data: any) => void): void;
        off(event: string, handler?: (evt: any, data: any) => void): void;
        destroy(): void;
        id: string;
        options: JoystickManagerOptions;
    }

    export interface JoystickManagerEventData {
        vector: { x: number; y: number };
        distance: number;
        angle: {
            radian: number;
            degree: number;
        };
        instance: JoystickInstance;
        raw: { x: number; y: number };
        pressure: number;
        direction: {
            x: 'left' | 'right' | null;
            y: 'up' | 'down' | null;
            angle: string;
        };
    }

    export interface JoystickManager {
        on(event: string, handler: (evt: any, data: JoystickManagerEventData) => void): void;
        off(event: string, handler?: (evt: any, data: JoystickManagerEventData) => void): void;
        destroy(): void;
        get(id: string): JoystickInstance;
        create(options: JoystickManagerOptions): JoystickManager;
        ids: string[];
    }

    export function create(options: JoystickManagerOptions): JoystickManager;
}