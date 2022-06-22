//TODO typehints

export function getCameraEntities(states) {
  const cameras = [];
  for (let [key, value] of Object.entries(states)) {
    if (computeDomain(key) === "camera") {
      cameras.push({ name: value.attributes.friendly_name });
    }
  }
  return cameras;
}

export function computeDomain(entity: string): string {
  return entity.split(".")[0];
}
