// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import getDistance from '@turf/rhumb-distance';
import getBearing from '@turf/rhumb-bearing';

export default class TripBuilder {
  constructor({
    waypoints,
    speed = 10, // meters
    turnSpeed = 45, // degrees
    loop = false
  }) {
    this.keyframes = [];
    this.speed = speed;
    this.turnSpeed = turnSpeed;
    this.loop = loop;
    this.totalTime = 0;

    for (const p of waypoints) {
      this._moveTo(p);
    }
    if (loop && waypoints.length > 2) {
      this._moveTo(waypoints[0]);
      this._turnTo(this.keyframes[0].heading);
    }
  }

  _moveTo(point) {
    if (this.keyframes.length === 0) {
      this.keyframes.push({
        point,
        time: 0
      });
      return;
    }

    const prevKeyframe = this.keyframes[this.keyframes.length - 1];
    const distance = getDistance(prevKeyframe.point, point, {units: 'kilometers'}) * 1000;
    const heading = getBearing(prevKeyframe.point, point);

    if (distance < 0.1) {
      return;
    }
    if (prevKeyframe.heading === undefined) {
      prevKeyframe.heading = heading;
    } else {
      this._turnTo(heading);
    }

    const duration = distance / this.speed;

    this.keyframes.push({
      point,
      heading,
      time: (this.totalTime += duration)
    });
  }

  _turnTo(heading) {
    const prevKeyframe = this.keyframes[this.keyframes.length - 1];
    const angle = Math.abs(getTurnAngle(prevKeyframe.heading, heading));

    if (angle > 0) {
      const duration = angle / this.turnSpeed;
      this.keyframes.push({
        point: prevKeyframe.point,
        heading,
        time: (this.totalTime += duration)
      });
    }
  }

  getFrame(timestamp) {
    timestamp = this.loop ? timestamp % this.totalTime : Math.min(timestamp, this.totalTime);
    const i = this.keyframes.findIndex(s => s.time >= timestamp);
    const startState = this.keyframes[i - 1];
    const endState = this.keyframes[i];
    const r = (timestamp - startState.time) / (endState.time - startState.time);

    return {
      point: [
        startState.point[0] * (1 - r) + endState.point[0] * r,
        startState.point[1] * (1 - r) + endState.point[1] * r
      ],
      heading: startState.heading + getTurnAngle(startState.heading, endState.heading) * r
    };
  }
}

function getTurnAngle(startHeading, endHeading) {
  let turnAngle = endHeading - startHeading;
  if (turnAngle < -180) turnAngle += 360;
  if (turnAngle > 180) turnAngle -= 360;
  return turnAngle;
}
