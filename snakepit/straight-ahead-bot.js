const MapUtils = require('../domain/mapUtils.js');
const {isCoordinateOutOfBounds} = require("../domain/mapUtils");

let log = null; // Injected logger

const useLevel2 = false

function onMapUpdated(mapState, myUserId) {
  const map = mapState.getMap();
  let directions = ['UP', 'DOWN', 'LEFT', 'RIGHT']
  const snakeBrainDump = {}; // Optional debug information about the snakes current state of mind.

  // 1. Where's what etc.
  const myCoords = MapUtils.getSnakePosition(myUserId, map);
  log('I am here:', myCoords);
  snakeBrainDump.myCoords = myCoords;

  // 2. Do some nifty planning...
  let direction = null
  if (useLevel2) {
    // TODO implement
  } else {
    direction = getDirectionForLevel1(directions, myCoords, map);
  }

  return {
    direction: direction,
    debugData: snakeBrainDump
  }
}

function getDirectionForLevel1(directions, myCoords, map) {
  const directionCount = {}
  for (let dir of directions) {
    let count = 0
    let checkCoords = myCoords
    while (!isCoordinateOutOfBounds(checkCoords, map)
    && MapUtils.canSnakeMoveInDirection(dir, checkCoords, map)) {
      count++
      checkCoords = oneStepInDirection(checkCoords, dir)
    }
    directionCount[dir] = count
  }

  log("result: " + JSON.stringify(directionCount))

  let dirWeCanGoFurthestIn = null
  let howFarWeCanGo = -1
  for (let dir of directions) {
    const result = directionCount[dir]
    if (result > howFarWeCanGo) {
      howFarWeCanGo = result
      dirWeCanGoFurthestIn = dir
    }
  }

  // 3. Then shake that snake!
  log("choosing " + dirWeCanGoFurthestIn)
  return dirWeCanGoFurthestIn;
}

function oneStepInDirection(myCoords, dir) {
  const delta = directionMovementDeltas[dir.toLocaleLowerCase()];
  return {
    x: myCoords.x + delta.x,
    y: myCoords.y + delta.y
  }
}

const directionMovementDeltas = {
  left: {x: -1, y: 0},
  right: {x: 1, y: 0},
  up: {x: 0, y: -1},
  down: {x: 0, y: 1}
};

function bootStrap(logger) {
  log = logger;
}

function onGameEnded(event) {
  log('On Game Ended');
  log(event);
  // Implement as needed.
}

function onTournamentEnded(event) {
  log('On Tournament Ended');
  log(event);
  // Implement as needed.
}

function onSnakeDied(event) {
  log('On Snake Died');
  log(event);
  // Implement as needed.
}

function onGameStarted(event) {
  log('On Game Started');
  log(event);
  // Implement as needed.
}

function onGameResult(event) {
  log('On Game Result');
  log(event);
  // Implement as needed.
}

module.exports = {
  bootStrap,
  onGameEnded,
  onGameResult,
  onGameStarted,
  onMapUpdated,
  onSnakeDied,
  onTournamentEnded
};
