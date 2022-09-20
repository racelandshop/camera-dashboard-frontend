import { cameraInfo } from "./data/types";

export function getCameraEntities(states) {
  const cameras: cameraInfo[] = [];
  for (const [key, value] of Object.entries(states)) {
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

export const defaultIntegration = "generic";

export const cameraIntegrations = ["generic", "MJPEG"];
