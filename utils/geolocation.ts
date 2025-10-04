// Precise geo-fence polygon for the MIT College of Railway Engineering & Research, Barshi campus.
// These coordinates define the virtual boundary for on-campus access.
export const CAMPUS_POLYGON: { latitude: number; longitude: number }[] = [
  { latitude: 18.25815, longitude: 75.71890 }, // North-West corner (near entrance)
  { latitude: 18.25745, longitude: 75.72242 }, // North-East corner
  { latitude: 18.25435, longitude: 75.72175 }, // South-East corner
  { latitude: 18.25525, longitude: 75.71830 }, // South-West corner
];

/**
 * Checks if a geographical point is inside a polygon using the Ray Casting algorithm.
 * @param userCoords An object containing the user's latitude and longitude.
 * @returns True if the user is within the geofence polygon, false otherwise.
 */
export const isWithinGeofence = (userCoords: { latitude: number; longitude: number }): boolean => {
  const pointLat = userCoords.latitude;
  const pointLon = userCoords.longitude;

  let isInside = false;
  // The algorithm iterates through the polygon's vertices and checks how many times a
  // horizontal line extending from the user's point intersects with the polygon's edges.
  for (let i = 0, j = CAMPUS_POLYGON.length - 1; i < CAMPUS_POLYGON.length; j = i++) {
    const vertexI = CAMPUS_POLYGON[i];
    const vertexJ = CAMPUS_POLYGON[j];

    const intersect =
      ((vertexI.longitude > pointLon) !== (vertexJ.longitude > pointLon)) &&
      (pointLat <
        ((vertexJ.latitude - vertexI.latitude) * (pointLon - vertexI.longitude)) /
        (vertexJ.longitude - vertexI.longitude) +
        vertexI.latitude
      );

    if (intersect) {
      isInside = !isInside;
    }
  }

  // If the number of intersections is odd, the point is inside. If even, it's outside.
  return isInside;
};
