import { cameraInfo } from "./data/types";

export function getCameraEntities(states) {
  const cameras: cameraInfo[] = [];
  for (const [key, value] of Object.entries(states)) {
    if (computeDomain(key) === "camera") {
      cameras.push({
        name: value.attributes.friendly_name,
        entityID: value.entity_id,
        state: value.state,
      });
    }
  }
  return cameras;
}

export function computeDomain(entity: string): string {
  return entity.split(".")[0];
}

export function removeTrailingSpacesInput(data) {
  const newData = {};
  for (const [key, value] of Object.entries(data)) {
    newData[key] = value.trim();
  }
  return newData;
}

export const defaultIntegration = "generic";

export const cameraIntegrations = ["generic"];
