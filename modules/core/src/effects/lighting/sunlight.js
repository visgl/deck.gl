import {DirectionalLight} from '@luma.gl/core';

// sun position calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas
// and inspired by https://github.com/mourner/suncalc/blob/master/suncalc.js
const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const asin = Math.asin;
const atan = Math.atan2;
const rad = PI / 180;

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const JD1970 = 2440588; // Julian Day year 1970
const JD2000 = 2451545; // Julian Day year 2000

// This angle ε [epsilon] is called the obliquity of the ecliptic and its value at the beginning of 2000 was 23.4397°
const e = rad * 23.4397; // obliquity of the Earth

function toJulianDay(timestamp) {
  return timestamp / DAY_IN_MS - 0.5 + JD1970;
}

function toDays(timestamp) {
  return toJulianDay(timestamp) - JD2000;
}

function getRightAscension(eclipticLongitude, b) {
  const lambda = eclipticLongitude;
  return atan(sin(lambda) * cos(e) - tan(b) * sin(e), cos(lambda));
}

function getDeclination(eclipticLongitude, b) {
  const lambda = eclipticLongitude;
  return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(lambda));
}

function getAzimuth(hourAngle, latitudeInRadians, declination) {
  const H = hourAngle;
  const phi = latitudeInRadians;
  const delta = declination;
  return atan(sin(H), cos(H) * sin(phi) - tan(delta) * cos(phi));
}

function getAltitude(hourAngle, latitudeInRadians, declination) {
  const H = hourAngle;
  const phi = latitudeInRadians;
  const delta = declination;
  return asin(sin(phi) * sin(delta) + cos(phi) * cos(delta) * cos(H));
}

// https://www.aa.quae.nl/en/reken/zonpositie.html
function getSiderealTime(dates, longitudeWestInRadians) {
  return rad * (280.147 + 360.9856235 * dates) - longitudeWestInRadians;
}

function getSolarMeanAnomaly(days) {
  return rad * (357.5291 + 0.98560028 * days);
}

function getEclipticLongitude(meanAnomaly) {
  const M = meanAnomaly;
  // equation of center
  const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M));
  // perihelion of the Earth
  const P = rad * 102.9372;

  return M + C + P + PI;
}

function getSunCoords(dates) {
  const M = getSolarMeanAnomaly(dates);
  const L = getEclipticLongitude(M);

  return {
    declination: getDeclination(L, 0),
    rightAscension: getRightAscension(L, 0)
  };
}

export function getSolarPosition(timestamp, latitude, longitude) {
  const longitudeWestInRadians = rad * -longitude;
  const phi = rad * latitude;
  const d = toDays(timestamp);

  const c = getSunCoords(d);
  // hour angle
  const H = getSiderealTime(d, longitudeWestInRadians) - c.rightAscension;

  // https://www.aa.quae.nl/en/reken/zonpositie.html
  // The altitude is 0° at the horizon, +90° in the zenith (straight over your head), and −90° in the nadir (straight down).
  // The azimuth is the direction along the horizon, which we measure from south to west.
  // South has azimuth 0°, west +90°, north +180°, and east +270° (or −90°, that's the same thing).
  return {
    azimuth: getAzimuth(H, phi, c.declination),
    altitude: getAltitude(H, phi, c.declination)
  };
}

export default class Sunlight extends DirectionalLight {
  constructor({latitude, longitude, timestamp, ...others}) {
    super(others);

    // for debugging
    this._azimuthAngle = null;
    this._altitudeAngle = null;

    if (latitude && longitude && timestamp) {
      this.setProps({latitude, longitude, timestamp});
    }
  }

  setProps(props) {
    if (props.latitude) {
      this.latitude = props.latitude;
    }

    if (props.longitude) {
      this.longitude = props.longitude;
    }

    if (props.timestamp) {
      this.timestamp = props.timestamp;
    }

    this.direction = this._getDirection();
  }

  _getDirection() {
    const {azimuth, altitude} = getSolarPosition(this.timestamp, this.latitude, this.longitude);
    // convert azimuth from 0 at south to be 0 at north
    const azimuthN = azimuth + PI;

    // for debugging
    this._azimuthAngle = azimuthN / rad;
    this._altitudeAngle = altitude / rad;

    // solar position to light direction
    return [-sin(azimuthN), -cos(azimuthN), -sin(altitude)];
  }
}
