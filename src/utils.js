// Distance of two points
export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/* Projection of point onto line
 *
 */
export const closestPointOnLine = (x, y, x1, y1, x2, y2) => {
  // Inspired by https://stackoverflow.com/a/6853926
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var lenSq = C * C + D * D;
  var param = -1;
  if (lenSq != 0) param = dot / lenSq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return {
    x: xx,
    y: yy,
  };
};

/* Distance of point from line
 * x -> Point's x coordinate
 * y -> Point's y coordinate
 * x1 -> Line's point 1 x coordinate
 * y1 -> Line's point 1 y coordinate
 * x2 -> Line's point 2 x coordinate
 * y2 -> Line's point 2 y coordinate
 * Returns distance
 */
export const pointDistanceFromLine = (x, y, x1, y1, x2, y2) => {
  var point = closestPointOnLine(x, y, x1, y1, x2, y2);
  var dx = x - point.x;
  var dy = y - point.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Angle of the line between 0 and 2pi
// export const angle = (x1, y1, x2, y2) => {
// 	var dx = y2 - y1;
// 	var dy = x2 - x1;
// 	var theta = -Math.atan2(dy, dx);
// 	return theta < 0 ? (theta += 2 * Math.PI) : theta;
// };
export const angle = (x1, y1, x2, y2) => {
  var dot = x1 * x2 + y1 * y2;
  var det = x1 * y2 - y1 * x2;
  return -Math.atan2(det, dot);
};

export const angle2pi = (x1, y1, x2, y2) => {
  let theta = angle(x1, y1, x2, y2);
  if (theta < 0) theta += 2 * Math.PI;
  return theta;
};

// Checks if lines intersect
export const lineLineIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const ccw = (p1, p2, p3) => {
    var A = p1.x;
    var B = p1.y;
    var C = p2.x;
    var D = p2.y;
    var E = p3.x;
    var F = p3.y;
    return (F - B) * (C - A) > (D - B) * (E - A);
  };

  var P1 = { x: x1, y: y1 };
  var P2 = { x: x2, y: y2 };
  var P3 = { x: x3, y: y3 };
  var P4 = { x: x4, y: y4 };
  return ccw(P1, P3, P4) != ccw(P2, P3, P4) && ccw(P1, P2, P3) != ccw(P1, P2, P4);
};

export const isClockwise = points => {
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += (points[j].x - points[i].x) * (points[j].y + points[i].y);
  }

  return area <= 0;
};

export const cycle = (arr, shift) => {
  let r = arr.slice();
  for (let i = 0; i < shift; i++) {
    let s = r.shift();
    r.push(s);
  }
  return r;
};

const items = ["test1"];
console.log(items.at(-1));
