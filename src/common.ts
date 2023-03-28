import { boolean } from "superstruct";
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
    if (typeof value == "string") {
      newData[key] = value.trim();
    }
    if (typeof value == "boolean") {
      newData[key] = value;
    }
    if (typeof value == "number") {
      newData[key] = value;
    }
  }
  return newData;
}

export const defaultIntegration = "generic";

export const cameraIntegrations = ["generic"];
