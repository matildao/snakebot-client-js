var SearchAStar = require('./searchAStar.js')();

/**
 * Calculates the path to the goal using the A-star algorithm.
 * @param startCoord      the start coordinate {x: xn, y: yn}
 * @param goalCoord       the goal coordinate {x: xn, y: yn}
 * @param mapWidth        the maps width
 * @param mapHeight       the maps height
 * @param fCalculateCost  optional function that calculates the cost (heuristic value) for moving from current node to the goal.
 *                        <h value> = f(<node coordinate>={x: xn, y: yn}, <goal coordinate> = {x: xg, y: yg})
 * @returns the path to the goal as an array [{coord:{x:11,y:10}, direction:'UP'}}, {...}, ...]
 */
function findPathAS(startCoord, goalCoord, mapWidth, mapHeight, fCalculateCost){
  return SearchAStar.findPath(startCoord, goalCoord, mapWidth, mapHeight, fCalculateCost);
}
/**
 * Calculates the Manhattan (or cab/grid) distance from point a to point b.
 * Note that Manhattan distance will not walk diagonally.
 * @param startCoord
 * @param goalCoord
 * @returns {number}
 */
function getManhattanDistance(startCoord, goalCoord){
  var x = Math.abs(startCoord.x - goalCoord.x);
  var y = Math.abs(startCoord.y - goalCoord.y);
  return x+y;
}

/**
 * Calculates the euclidian distance from point a to point b.
 * Note that eculidan distance will walk diagonally.
 * @param startCoord
 * @param goalCoord
 * @returns {number}
 */
function getEuclidianDistance(startCoord, goalCoord){
  var xd = Math.abs(startCoord.x - goalCoord.x);
  var yd = Math.abs(startCoord.y - goalCoord.y);
  return Math.floor(Math.sqrt(xd * xd + yd * yd));
}

/**
 * Find where the head of the snake is on the map.
 * @param playerId the snakes player id
 * @param map the map
 * @returns {{x: (Number), y: (Number), alive: (Boolean)}}
 *          If the snake is dead, then x and y is coerced to 0.
 */
function whereIsSnake(playerId, map){
  var snake = map.getSnakeInfoForId(playerId);
  if(snake.isAlive()){
    var pos = translatePosition(snake.getPositions()[0], map.getWidth());
    return {x: pos.x, y: pos.y, alive: snake.isAlive()};
  }
  return {x: 0, y:0, alive: false};
}

/**
 * Sorts the items in the array from closest to farthest
 * in relation to the given coordinate using Manhattan distance.
 * @param items the items (must expose ::getX() and ::getY();
 * @param coords
 * @returns {Array} the ordered array with the closest item at the end.
 */
function sortByClosestTo(items, coords){
  var distanceItem = [];
  items.forEach(function(item){
    distanceItem.push({
      d: getManhattanDistance(coords, {x: item.getX(), y: item.getY()}),
      item: item
    });
  });
  distanceItem.sort(function(a,b) {
    if (a.d < b.d){
      return 1;
    } else if (a.d > b.d){
      return -1;
    } else {
      return 0;
    }
  });
  var orderedResult = [];
  distanceItem.forEach(function(di){orderedResult.push(di.item);});
  return orderedResult;
}

/**
 * Converts a position in the flattened single array representation
 * of the Map to a MapCoordinate.
 *
 * @param position
 * @return
 */
function translatePosition(position, mapWidth) {
  var y = Math.floor(position / mapWidth);
  var x = Math.abs(position - y * mapWidth);
  return {x: x, y: y}
}

/**
 * Converts a MapCoordinate to the same position in the flattened
 * single array representation of the Map.
 *
 * @param coordinate
 * @return
 */
function translateCoordinate(coordinate, mapWidth) {
  return coordinate.x + coordinate.y * mapWidth;
}

exports.sortByClosestTo       = sortByClosestTo;
exports.getManhattanDistance  = getManhattanDistance;
exports.getEuclidianDistance  = getEuclidianDistance;
exports.whereIsSnake          = whereIsSnake;
exports.translatePosition     = translatePosition;
exports.findPathAS            = findPathAS;