import { localize } from "../localize/localize";
import type { HaFormSchema } from "./../homeassistant-frontend/src/components/ha-form/types";

export interface cameraCard {
  name?: string;
}

export interface cameraBrand {
  name?: string;
  models: Array<cameraModel>;
}

export interface cameraModel {
  version: string;
  options: Array<cameraOption>;
}

export interface cameraOption {
  version: string;
  source?: string;
  url?: string;
  prefix: string;
  supportChannels: string;
}

export interface backEventOptions {
  event_name: string;
  data: any;
}

export interface schemaForm {
  header: { title: string };
  body: HaFormSchema[];
  footer: {
    back: string;
    accept: string;
  };
}
