//TODO typehint key and value
import { cameraInfo } from "./data/types";

export function getCameraEntities(states) {
  const cameras: cameraInfo[] = [];
  for (let [key, value] of Object.entries(states)) {
    if (computeDomain(key) === "camera") {
      cameras.push({
        name: value.attributes.friendly_name,
        entity_id: value.entity_id,
        state: value.state,
      });
    }
  }
  return cameras;
}

export function computeDomain(entity: string): string {
  return entity.split(".")[0];
}
