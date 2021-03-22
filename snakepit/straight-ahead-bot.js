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
    direction = getDirectionForLevel2(directions, myCoords, map);
  } else {
    direction = getDirectionForLevel1(directions, myCoords, map);
  }

  log("selecting direction: " + direction)
  return {
    direction: direction,
    debugData: snakeBrainDump
  }
}

function getDirectionForLevel2(directions, myCoords, map) {
  let ourOptions = []
  for (let x = 0; x < map.getWidth(); x++) {
    for (let y = 0; y < map.getHeight(); y++) {
      let checkCoords = {x: x, y: y};
      const tile = MapUtils.getTileAt(checkCoords, map)
      const available = tile.content === '' || tile.content === 'food';
      if (available) {
        const distance = MapUtils.getManhattanDistance(myCoords, checkCoords)
        ourOptions.push({
          x: checkCoords.x,
          y: checkCoords.y,
          distance
        })
      }
    }
  }

  ourOptions = ourOptions.sort((a, b) => b.distance -a.distance)

  for (let option of ourOptions) {
    const directionOptions = getDirectionsForThisOption(myCoords, option)
    const directionA = directionOptions[0]
    const directionB = directionOptions[1]

    //try direction A then direction B
    if (tryDirectionCombo(map, myCoords, option, directionA, directionB)) {
      return directionA
    }

    //if direction A then direction B failed, attempt direction B then direction A
    if (tryDirectionCombo(map, myCoords, option, directionB, directionA)) {
      return directionB
    }

    //if neither a->b or b->a worked, continue with next option
  }
  return 'DOWN' // TODO or use getDirectionForLevel1(directions, myCoords, map)
}

function tryDirectionCombo(map, startCoords, option, firstDirection,
    secondDirection) {
  let checkCoords = startCoords

  // MOVE ALL THE WAY IN FIRST DIRECTION
  // prerequisite: am i walking towards x or y?
  let checkingX = firstDirection === 'LEFT' || firstDirection === 'RIGHT'

  //loop to try to move all the way to option in first direction
  while (true) {
    //move one tile in direction of x/y
    if (MapUtils.canSnakeMoveInDirection(firstDirection, checkCoords, map)) {
      // move
      checkCoords = oneStepInDirection(checkCoords, firstDirection)
    } else {
      // this combo did not work
      return false
    }

    //can i stand on this tile? if no: return false
    if (isCoordinateOutOfBounds(checkCoords, map)) {
      return false;
    }

    // have i moved all the way this direction? if so check next direction
    if ((checkingX && checkCoords.x === option.x)
        || !checkingX && checkCoords.y === option.y) {
      break;
    }
  }

  // MOVE ALL THE WAY IN SECOND DIRECTION

  //prerequisite: am i walking towards x or y?
  checkingX = secondDirection === 'UP' || secondDirection === 'DOWN'

  //loop to try to move all the way to option in second direction
  while (true) {
    //move one tile in direction of x/y
    if (MapUtils.canSnakeMoveInDirection(secondDirection, checkCoords, map)) {
      // move
      checkCoords = oneStepInDirection(checkCoords, secondDirection)
    } else {
      // this combo did not work
      return false
    }

    //can i stand on this tile? if no: return false
    if (isCoordinateOutOfBounds(checkCoords, map)) {
      return false;
    }

    // have i moved all the way this direction? if so i've reached the option! return success
    if ((checkingX && checkCoords.x === option.x)
        || !checkingX && checkCoords.y === option.y) {
      return true;
    }
  }
}

function getDirectionsForThisOption(myCoords, option) {
  const result = []
  if (myCoords.x < option.x) {
    result.push('RIGHT')
  } else {
    result.push('LEFT')
  }
  if (myCoords.y < option.y) {
    result.push('DOWN')
  } else {
    result.push('UP')
  }
  return result
}

function getDirectionForLevel1(directions, myCoords, map) {
  const directionCount = {}
  for (let dir of directions) {
    let count = 0
    let checkCoords = myCoords
    //isCoordinateOutOfBounds should be checked on next tile not current?
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
