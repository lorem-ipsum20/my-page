import * as THREE from "three";

/**
 * A small cartoon companion, built entirely from primitives so there is no
 * model file to fetch and nothing to license.
 *
 * The look is cel-shaded (MeshToonMaterial with a banded gradient map) plus a
 * normal-extruded outline, which reads as an illustration rather than a 3D
 * render. Eyes and the antenna tip are flat unlit colours so the character
 * still reads clearly when it is only ~80px across.
 *
 * This module is only ever reached through a dynamic import, so `three` lands
 * in its own chunk and never touches the first paint.
 */

export type MascotPalette = {
  body: string;
  outline: string;
  eye: string;
  accent: string;
};

/** The body stays pale in both themes so it reads against either background. */
export const MASCOT_PALETTES: Record<"light" | "dark", MascotPalette> = {
  light: {
    body: "#e9ecf5",
    outline: "#191a20",
    eye: "#15161b",
    accent: "#3b6ef5",
  },
  dark: {
    body: "#f1f3fa",
    outline: "#0b0c10",
    eye: "#0f1015",
    accent: "#7aa2ff",
  },
};

export type MascotFrame = {
  elapsed: number;
  delta: number;
  pointer: { x: number; y: number };
  /** Scroll intent for this frame: +1 = moving down the page, -1 = moving up. */
  scrollLook: number;
  /**
   * Asks for a one-shot wave, consumed by the frame it arrives on. Kept as a
   * one-frame request rather than a method on the handle so a wave triggered
   * while the canvas is off screen can never be replayed late.
   */
  wave?: boolean;
};

export type MascotHandle = {
  canvas: HTMLCanvasElement;
  render: (frame: MascotFrame) => void;
  setSize: (width: number, height: number) => void;
  setPalette: (palette: MascotPalette) => void;
  setReduceMotion: (reduce: boolean) => void;
  /** While true the antenna pulses hard and the eyes widen — the "thinking" look. */
  setThinking: (thinking: boolean) => void;
  dispose: () => void;
};

const CAMERA_FOV = 32;
const CAMERA_DISTANCE = 3.5;
const CAMERA_TARGET_Y = 0.12;

const EYE_PIVOT_X = 0.19;
const EYE_PIVOT_Y = 0.08;
const EYE_PIVOT_Z = 0.355;
/** Shoulders sit just outside the body radius (0.46) or the arms disappear. */
const SHOULDER_X = 0.455;
const ARM_REST_ANGLE = 0.62;
/** Past 90°, so the raised arm points up and outward rather than out to the side. */
const WAVE_UP_ANGLE = 2.35;
const WAVE_DURATION = 1.9;
const BLINK_DURATION = 0.16;

/** Three flat bands instead of a smooth ramp — the source of the cel look. */
function createToonGradient(): THREE.DataTexture {
  const bands = new Uint8Array([96, 172, 255]);
  const texture = new THREE.DataTexture(bands, bands.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Pushes every vertex along its normal by a fixed world distance, giving an
 * outline of even thickness. Scaling a copy uniformly instead would make the
 * line thick on the body and invisible on the thin arms.
 */
function createOutlineGeometry(
  geometry: THREE.BufferGeometry,
  thickness: number,
): THREE.BufferGeometry {
  const outline = geometry.clone();
  const position = outline.attributes.position;
  const normal = outline.attributes.normal;

  for (let i = 0; i < position.count; i += 1) {
    position.setXYZ(
      i,
      position.getX(i) + normal.getX(i) * thickness,
      position.getY(i) + normal.getY(i) * thickness,
      position.getZ(i) + normal.getZ(i) * thickness,
    );
  }

  position.needsUpdate = true;
  outline.computeVertexNormals();
  outline.computeBoundingSphere();
  return outline;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function createMascot(): MascotHandle {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 20);
  camera.position.set(0, CAMERA_TARGET_Y, CAMERA_DISTANCE);
  camera.lookAt(0, CAMERA_TARGET_Y, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const gradientMap = createToonGradient();

  const bodyMaterial = new THREE.MeshToonMaterial({ color: "#e9ecf5", gradientMap });
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: "#191a20",
    side: THREE.BackSide,
  });
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: "#15161b" });
  const eyeHighlightMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const accentMaterial = new THREE.MeshBasicMaterial({ color: "#3b6ef5" });

  const materials = [
    bodyMaterial,
    outlineMaterial,
    eyeMaterial,
    eyeHighlightMaterial,
    accentMaterial,
  ];

  const root = new THREE.Group();
  // A slight resting turn reads better than a dead-on front view.
  root.rotation.y = 0.14;
  scene.add(root);

  const geometries: THREE.BufferGeometry[] = [];
  const track = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry);
    return geometry;
  };

  /** Adds a mesh plus its inverted-hull outline as siblings. */
  const addOutlined = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    scale: THREE.Vector3,
    position: THREE.Vector3,
    thickness = 0.009,
  ) => {
    const mesh = new THREE.Mesh(geometry, bodyMaterial);
    mesh.scale.copy(scale);
    mesh.position.copy(position);

    const outline = new THREE.Mesh(
      track(createOutlineGeometry(geometry, thickness)),
      outlineMaterial,
    );
    outline.scale.copy(scale);
    outline.position.copy(position);
    outline.renderOrder = -1;

    parent.add(outline, mesh);
    return mesh;
  };

  // ---- Body -----------------------------------------------------------------
  // Mesh lives in a pivot so breathing can squash the body without touching the
  // outline or the parts attached to it.
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  addOutlined(
    bodyPivot,
    track(new THREE.SphereGeometry(0.46, 40, 28)),
    new THREE.Vector3(1, 1.09, 0.94),
    new THREE.Vector3(0, 0, 0),
    0.011,
  );

  // ---- Eyes -----------------------------------------------------------------
  const eyeGeometry = track(new THREE.SphereGeometry(0.108, 24, 18));
  const highlightGeometry = track(new THREE.SphereGeometry(0.031, 14, 12));

  const eyePivot = new THREE.Group();
  bodyPivot.add(eyePivot);

  const eyeLeft = new THREE.Group();
  const eyeRight = new THREE.Group();
  eyeLeft.position.set(-EYE_PIVOT_X, EYE_PIVOT_Y, EYE_PIVOT_Z);
  eyeRight.position.set(EYE_PIVOT_X, EYE_PIVOT_Y, EYE_PIVOT_Z);
  eyePivot.add(eyeLeft, eyeRight);

  // Group scale drives the blink, so the ellipsoid shape is set once here.
  for (const [pivot, side] of [
    [eyeLeft, -1],
    [eyeRight, 1],
  ] as const) {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.scale.set(1, 1.16, 0.72);
    pivot.add(eye);

    const highlight = new THREE.Mesh(highlightGeometry, eyeHighlightMaterial);
    highlight.position.set(-0.03 * side, 0.038, 0.064);
    pivot.add(highlight);
  }

  // ---- Antenna --------------------------------------------------------------
  const antennaPivot = new THREE.Group();
  antennaPivot.position.set(0, 0.5, 0);
  bodyPivot.add(antennaPivot);

  const antennaStalk = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.015, 0.015, 0.26, 12)),
    bodyMaterial,
  );
  antennaStalk.position.set(0, 0.13, 0);
  antennaPivot.add(antennaStalk);

  const antennaGlow = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.076, 20, 14)),
    accentMaterial,
  );
  antennaGlow.position.set(0, 0.29, 0);
  antennaPivot.add(antennaGlow);

  // ---- Arms -----------------------------------------------------------------
  // Each arm hangs from a shoulder pivot so it can swing like a limb.
  const armGeometry = track(new THREE.CapsuleGeometry(0.052, 0.16, 6, 14));
  const armPivots: THREE.Group[] = [];

  // side -1 is the viewer's left. Rotating about Z maps the arm's downward
  // direction (0,-1) to (sin z, -cos z), so the LEFT arm needs a NEGATIVE angle
  // to splay outward. This must stay in step with the signs in renderFrame and
  // settlePose, or the resting pose contradicts the animated one.
  for (const side of [-1, 1] as const) {
    const shoulder = new THREE.Group();
    shoulder.position.set(SHOULDER_X * side, 0.08, 0);
    shoulder.rotation.z = ARM_REST_ANGLE * side;
    bodyPivot.add(shoulder);
    armPivots.push(shoulder);

    addOutlined(
      shoulder,
      armGeometry,
      new THREE.Vector3(1, 1, 1),
      new THREE.Vector3(0, -0.16, 0),
      0.008,
    );
  }

  // ---- Lighting -------------------------------------------------------------
  // Kept fairly directional so the toon bands actually show up.
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(1.3, 1.9, 1.7);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
  fillLight.position.set(-1.7, 0.2, 0.9);
  scene.add(fillLight);

  // A tinted rim light pulls the silhouette off a white background.
  const rimLight = new THREE.DirectionalLight(new THREE.Color("#3b6ef5"), 1.3);
  rimLight.position.set(-0.9, 1.1, -1.8);
  scene.add(rimLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  // ---- Animation state ------------------------------------------------------
  const pointerSmooth = { x: 0, y: 0 };
  let scrollSmooth = 0;
  let reduceMotion = false;
  let nextBlinkAt = 1.6;
  let blinkStartedAt = -1;
  let waveStartedAt = -1;
  let waveLift = 0;
  let waveWobble = 0;
  let thinking = false;

  const setEyeScaleY = (scale: number) => {
    const clamped = clamp(scale, 0, 1.6);
    eyeLeft.scale.y = clamped;
    eyeRight.scale.y = clamped;
  };

  const settlePose = (delta: number) => {
    root.position.y = damp(root.position.y, 0, 6, delta);
    root.rotation.z = damp(root.rotation.z, 0, 6, delta);
    root.rotation.y = damp(root.rotation.y, 0.14, 6, delta);
    root.rotation.x = damp(root.rotation.x, 0, 6, delta);
    bodyPivot.scale.y = damp(bodyPivot.scale.y, 1, 6, delta);
    armPivots[0].rotation.z = damp(armPivots[0].rotation.z, -ARM_REST_ANGLE, 6, delta);
    armPivots[1].rotation.z = damp(armPivots[1].rotation.z, ARM_REST_ANGLE, 6, delta);
    antennaGlow.scale.setScalar(damp(antennaGlow.scale.x, 1, 6, delta));
    eyePivot.position.x = damp(eyePivot.position.x, 0, 6, delta);
    eyePivot.position.y = damp(eyePivot.position.y, 0, 6, delta);
    setEyeScaleY(damp(eyeLeft.scale.y, 1, 6, delta));
  };

  const renderFrame = (frame: MascotFrame) => {
    const { elapsed, delta, pointer } = frame;

    if (reduceMotion) {
      settlePose(delta);
      // No animation is allowed, but the thinking state must still read: the
      // glow holds a single enlarged size instead of pulsing.
      if (thinking) antennaGlow.scale.setScalar(1.3);
      renderer.render(scene, camera);
      return;
    }

    pointerSmooth.x = damp(pointerSmooth.x, pointer.x, 3.4, delta);
    pointerSmooth.y = damp(pointerSmooth.y, pointer.y, 3.4, delta);

    // Scroll awareness. The host reports how fast the page is moving; the nod
    // is smoothed here so it eases in as the reader starts scrolling and
    // unwinds on its own once they stop, with no extra event to listen for.
    scrollSmooth = damp(scrollSmooth, clamp(frame.scrollLook, -1, 1), 5.5, delta);

    // Turn towards the cursor, and pitch with both the cursor and the page.
    // Positive rotation.x tips the crown towards the viewer, so each of these
    // reads as looking down — the eyes lead the head by a hair.
    root.rotation.y = damp(root.rotation.y, pointerSmooth.x * 0.4, 3.2, delta);
    root.rotation.x = damp(
      root.rotation.x,
      pointerSmooth.y * 0.16 + scrollSmooth * 0.3,
      3.2,
      delta,
    );

    // One-shot wave. The request only survives a single frame, so it is latched
    // into a start time and progress drives everything else from there.
    if (frame.wave && waveStartedAt < 0) waveStartedAt = elapsed;

    if (waveStartedAt >= 0) {
      const progress = clamp((elapsed - waveStartedAt) / WAVE_DURATION, 0, 1);
      // Up, hold, down — the two smoothsteps are what keep the ends free of a snap.
      waveLift = smoothstep(0, 0.2, progress) * (1 - smoothstep(0.66, 1, progress));
      waveWobble = Math.sin(elapsed * 13) * 0.3 * waveLift;

      if (progress >= 1) {
        waveStartedAt = -1;
        waveWobble = 0;
      }
    } else {
      // Ease the arm back down rather than dropping it the instant the wave ends.
      waveLift = damp(waveLift, 0, 7, delta);
      waveWobble = damp(waveWobble, 0, 7, delta);
    }

    // The raised arm takes over from the idle swing instead of fighting it.
    const idleSwing = 1 - waveLift;

    root.position.y =
      Math.sin(elapsed * 1.5) * 0.032 + waveLift * 0.045 - scrollSmooth * 0.04;
    // Leaning into the raised arm is what makes the wave look intentional.
    root.rotation.z = Math.sin(elapsed * 0.85) * 0.028 - waveLift * 0.06;

    // Breathing: the body squashes a touch on the way down and back on the way up.
    const breath = Math.sin(elapsed * 1.5);
    bodyPivot.scale.y = damp(bodyPivot.scale.y, 1 + breath * 0.018, 8, delta);

    armPivots[0].rotation.z =
      -ARM_REST_ANGLE + idleSwing * Math.sin(elapsed * 1.8) * 0.13;
    armPivots[1].rotation.z =
      ARM_REST_ANGLE +
      idleSwing * Math.sin(elapsed * 1.8 + 1.1) * 0.13 +
      waveLift * (WAVE_UP_ANGLE - ARM_REST_ANGLE) +
      waveWobble;

    // Eyes drift a little further than the head so the gaze feels alive, and
    // drop with the page the same way they follow the cursor downwards. While
    // thinking they widen slightly, as if paying closer attention.
    eyePivot.position.x = pointerSmooth.x * 0.026;
    eyePivot.position.y = -pointerSmooth.y * 0.016 - scrollSmooth * 0.022;
    setEyeScaleY(damp(eyeLeft.scale.y, thinking ? 1.14 : 1, 6, delta));

    // Thinking overrides the idle antenna with a faster, larger pulse — the
    // character's way of showing the assistant is composing an answer.
    if (thinking) {
      antennaGlow.scale.setScalar(1.22 + Math.sin(elapsed * 9) * 0.14);
    } else {
      antennaGlow.scale.setScalar(
        1 + Math.sin(elapsed * (3.2 + waveLift * 7)) * 0.075 + waveLift * 0.1,
      );
    }

    // Blink cycle.
    if (blinkStartedAt < 0 && elapsed >= nextBlinkAt) {
      blinkStartedAt = elapsed;
    }

    if (blinkStartedAt >= 0) {
      const progress = (elapsed - blinkStartedAt) / BLINK_DURATION;
      if (progress >= 1) {
        blinkStartedAt = -1;
        nextBlinkAt = elapsed + 2.6 + Math.random() * 3.2;
        setEyeScaleY(1);
      } else {
        setEyeScaleY(1 - Math.sin(Math.PI * clamp(progress, 0, 1)) * 0.92);
      }
    }

    renderer.render(scene, camera);
  };

  return {
    canvas: renderer.domElement,
    render: renderFrame,
    setSize(width, height) {
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(1, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(safeWidth, safeHeight, false);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
    },
    setPalette(palette) {
      bodyMaterial.color.set(palette.body);
      outlineMaterial.color.set(palette.outline);
      eyeMaterial.color.set(palette.eye);
      accentMaterial.color.set(palette.accent);
      rimLight.color.set(palette.accent);
    },
    setReduceMotion(reduce) {
      reduceMotion = reduce;
      if (reduce) {
        blinkStartedAt = -1;
        // Drop any wave in flight so the settled pose is a resting one.
        waveStartedAt = -1;
        waveLift = 0;
        waveWobble = 0;
        setEyeScaleY(1);
      }
    },
    setThinking(value) {
      thinking = value;
      if (!value) {
        // Hand the glow back to the idle pulse from its current size, so it
        // shrinks smoothly instead of snapping.
        antennaGlow.scale.setScalar(damp(antennaGlow.scale.x, 1, 6, 1 / 60));
      }
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      gradientMap.dispose();
      renderer.dispose();
    },
  };
}
