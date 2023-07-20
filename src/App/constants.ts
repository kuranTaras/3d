import { Color, Vector2 } from 'three';

export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_FOV = 34;

export const MATERIAL_PROPS = {
  roughness: 0.1,
};

export const GRADIENT_COLORS = [new Color(0xff00ff), new Color(0xff6a1a)];

export const GRADIENT_STEP = new Vector2(0.1, 0.9);

export const SATURATION = 0.75; // 0..1

export const ORBIT_DAMPING = 0.1;

export const INTERSECTION_THRESHOLD = 0.35;

export const ANIMATION_SPEED = 0.5;

export const SCENE_OFFSET = 1.5;
export const CAMERA_PADDING = 0.23;
export const SCENE_DIMENSIONS = 2;
