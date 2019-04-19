import fs from 'fs';
import readline from 'readline';

import {parseTime, parseColumns, getLineObject} from './utils';

import routes from '../output/routes.json';
import stops from '../output/stops';

let firstTripId = null;

// async function getWriteStreamsByRoute(routesMap, outputDir) {
//   return await Object.keys(routesMap).reduce((resMap, routeId) => {
//     const tripsOutputPath = `${outputDir}/${routeId}.json`;
//     const writeStream = fs.createWriteStream(tripsOutputPath, {encoding: 'utf8'});
//     writeStream.write('[\n');
//     resMap[routeId] = writeStream;
//     return resMap;
//   }, {});
// }

function getWriteStream(outputDir) {
  const writeStream = fs.createWriteStream(`${outputDir}/trips.json`, {encoding: 'utf8'});
  writeStream.write('[\n');
  return writeStream;
}

async function writeTripToFile({writeStream, writeStreamByRoute, routesMap, tripsMap, tripId}) {
  // route_id,service_id,trip_id,direction_id,block_id,shape_id,direction,wheelchair_accessible,schd_trip_id
  const trip = tripsMap[tripId];
  if (trip && trip.waypoints) {
    trip.waypoints.sort((p1, p2) => p1.timestamp - p2.timestamp);
    const isFirst = !firstTripId;
    await writeStream.write(`${isFirst ? '' : ',\n'}${JSON.stringify(trip)}`);
    delete trip.waypoints;

    if (isFirst) {
      firstTripId = tripId;
    }
  }
}

/* eslint-disable max-depth, max-statements */
async function parseTripStops({limit, stopTimesFilePath, routesMap, tripsMap, outputDir}) {
  // const writeStreamByRoute = await getWriteStreamsByRoute(routesMap, outputDir);
  const writeStream = getWriteStream(outputDir);

  const readStream = fs.createReadStream(stopTimesFilePath, {encoding: 'utf8'});
  const rl = readline.createInterface({
    input: readStream
  });

  let header = null;
  let lastTripId = null;
  let numOfTrips = 0;

  for await (const line of rl) {
    // first line is header
    if (!header) {
      header = parseColumns(line);
    } else {
      // trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,shape_dist_traveled
      const waypoint = getLineObject(header, line);

      if (waypoint) {
        if (lastTripId && lastTripId !== waypoint.trip_id) {
          numOfTrips++;
          await writeTripToFile({writeStream, routesMap, tripsMap, tripId: lastTripId});
        }

        if (numOfTrips > limit) {
          rl.close();
        }

        if (tripsMap[waypoint.trip_id]) {
          if (!tripsMap[waypoint.trip_id].waypoints) {
            tripsMap[waypoint.trip_id].waypoints = [];
          }

          const {arrival_time, departure_time} = waypoint;
          waypoint.timestamp = (parseTime(arrival_time) + parseTime(departure_time)) / 2;

          // stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,location_type,parent_station,wheelchair_boarding
          const stop = stops[waypoint.stop_id];
          waypoint.latitude = stop.stop_lat;
          waypoint.longitude = stop.stop_lon;

          tripsMap[waypoint.trip_id].waypoints.push(waypoint);

          lastTripId = waypoint.trip_id;
        }
      }
    }
  }

  await writeTripToFile({writeStream, routesMap, tripsMap, tripId: lastTripId});
  await writeStream.write('\n]');
}
/* eslint-enable max-depth, max-statements */

async function parseTrips({tripsFilePath, tripsMap, routesMap}) {
  const readStream = fs.createReadStream(tripsFilePath, {encoding: 'utf8'});

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  let header = null;
  for await (const line of rl) {
    if (!header) {
      header = parseColumns(line);
    } else {
      const trip = getLineObject(header, line);
      if (routesMap[trip.route_id]) {
        routesMap[trip.route_id].tripsMap[trip.trip_id] = {trip_id: trip.trip_id};
        tripsMap[trip.trip_id] = trip;
      }
    }
  }
}

const DEFAULT_SELECTED_ROUTES = Object.keys(routes);

async function process({
  limit,
  samples,
  selectedRoutes = DEFAULT_SELECTED_ROUTES,
  inputDir,
  outputDir
}) {
  const tripsFilePath = `${inputDir}/trips.txt`;
  const stopTimesFilePath = samples
    ? `${inputDir}/stop_times_samples.txt`
    : `${inputDir}/stop_times.txt`;

  const routesMap = {};
  const tripsMap = {};

  for (let i = 0; i < selectedRoutes.length; i++) {
    const routeId = selectedRoutes[i];
    routesMap[routeId] = routes[routeId];
    routesMap[routeId].tripsMap = {};
  }

  await parseTrips({tripsFilePath, routesMap, tripsMap});
  await parseTripStops({limit, stopTimesFilePath, routesMap, tripsMap, outputDir});
}

module.exports = process;
