// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {InputEvent, Pan, Pinch} from 'mjolnir.js';

type GestureInput = Parameters<InstanceType<typeof Pan>['attrTest']>[0];
type GesturePointer = GestureInput['pointers'][number];

const POINTER_MOVEMENT_THRESHOLD = 1;
const PINCH_THRESHOLD = 0.03;
const ROTATION_THRESHOLD = 3;
const SINGLE_POINTER_DELAY = 40;
// mjolnir.js does not export RecognizerState; these are Began | Changed.
const ACTIVE_RECOGNIZER_STATE = 2 | 4;

type MovementState = 'pending' | 'coherent' | 'single-pointer';

function getPointerId(pointer: GesturePointer, index: number): number {
  return 'pointerId' in pointer ? pointer.pointerId : index;
}

function getRotationDelta(rotation: number): number {
  return Math.abs(((((rotation + 180) % 360) + 360) % 360) - 180);
}

class CoherentTwoFingerMovement {
  private pointerPositions = new Map<number, {x: number; y: number}>();
  private movedPointers = new Set<number>();
  private firstMovementTime: number | null = null;

  update(input: GestureInput): MovementState {
    if (input.pointerType !== 'touch' || input.pointers.length !== 2) {
      this.pointerPositions.clear();
      this.movedPointers.clear();
      this.firstMovementTime = null;
      return 'coherent';
    }

    const pointers = input.pointers.map((pointer, index) => ({
      id: getPointerId(pointer, index),
      x: pointer.clientX,
      y: pointer.clientY
    }));
    const isNewPair =
      this.pointerPositions.size !== 2 ||
      pointers.some(pointer => !this.pointerPositions.has(pointer.id));

    if (isNewPair || input.eventType & InputEvent.Start) {
      this.pointerPositions = new Map(
        pointers.map(pointer => [pointer.id, {x: pointer.x, y: pointer.y}])
      );
      this.movedPointers.clear();
      this.firstMovementTime = null;
      return 'pending';
    }

    for (const pointer of pointers) {
      const previousPosition = this.pointerPositions.get(pointer.id)!;
      if (
        Math.hypot(pointer.x - previousPosition.x, pointer.y - previousPosition.y) >=
        POINTER_MOVEMENT_THRESHOLD
      ) {
        this.movedPointers.add(pointer.id);
      }
    }

    if (this.movedPointers.size < 2) {
      if (this.movedPointers.size === 1) {
        this.firstMovementTime ??= input.timeStamp;
        if (input.timeStamp - this.firstMovementTime >= SINGLE_POINTER_DELAY) {
          return 'single-pointer';
        }
      }
      return 'pending';
    }

    this.pointerPositions = new Map(
      pointers.map(pointer => [pointer.id, {x: pointer.x, y: pointer.y}])
    );
    this.movedPointers.clear();
    this.firstMovementTime = null;
    return 'coherent';
  }
}

/** A two-pointer pan that waits for a coherent update before claiming the gesture. */
export class TwoFingerPan extends Pan {
  private movement = new CoherentTwoFingerMovement();

  attrTest(input: GestureInput): boolean {
    if (input.pointerType !== 'touch' || this.state & ACTIVE_RECOGNIZER_STATE) {
      return super.attrTest(input);
    }

    const movementState = this.movement.update(input);
    if (movementState !== 'coherent') {
      return false;
    }

    const pinchRecognizer = this.manager.get('pinch') as InstanceType<typeof Pinch> | null;
    const pinchThreshold = pinchRecognizer?.options.threshold ?? PINCH_THRESHOLD;
    const hasPinchIntent = Math.abs(input.scale - 1) > pinchThreshold;
    const hasRotationIntent = getRotationDelta(input.rotation) > ROTATION_THRESHOLD;
    return !hasPinchIntent && !hasRotationIntent && super.attrTest(input);
  }
}

/** A pinch that ignores transient scale changes from staggered pointer updates. */
export class TwoFingerPinch extends Pinch {
  private movement = new CoherentTwoFingerMovement();

  attrTest(input: GestureInput): boolean {
    if (input.pointerType !== 'touch') {
      return super.attrTest(input);
    }

    const isActive = Boolean(this.state & ACTIVE_RECOGNIZER_STATE);
    const movementState = this.movement.update(input);
    const hasTransformIntent =
      isActive ||
      (movementState !== 'pending' &&
        (Math.abs(input.scale - 1) > this.options.threshold ||
          getRotationDelta(input.rotation) > ROTATION_THRESHOLD));

    if (!hasTransformIntent) {
      return false;
    }

    // Delegate pointer-count validation while keeping an active twist alive
    // even when its scale remains exactly 1.
    return super.attrTest({
      ...input,
      scale: 1 + Math.max(this.options.threshold, Number.EPSILON) * 2
    });
  }
}

export const TWO_FINGER_PINCH_THRESHOLD = PINCH_THRESHOLD;
