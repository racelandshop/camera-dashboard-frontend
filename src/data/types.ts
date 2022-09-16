import type { HaFormSchema } from "./../homeassistant-frontend/src/components/ha-form/types"; //TODO: Why is there an error?

export interface cameraInfo {
  name: string;
  entity_id: string;
  state: string;
}

export interface cameraCard {
  name?: string;
}

export interface cameraBrand {
  name?: string;
  models: Array<cameraModel>;
}

export interface cameraModel {
  version: string;
  options: Map<string, cameraOption>;
  supportChannels: boolean;
}

export interface cameraOption {
  version: string;
  source?: string;
  url?: string;
  prefix: string;
}

export interface backEventOptions {
  event_name: string;
  modelDatabase?: Array<cameraModel>;
}

export interface schemaForm {
  header: { title: string };
  body: HaFormSchema[];
  extra_options?: HaFormSchema[];
  cameraModelInfo?: cameraModel;
  footer: {
    back?: string;
    accept: string;
  };
}

export interface CameraConfiguration {
  integration: string;
  ip?: string;
  number_of_cameras?: number;
  name?: string;
  still_image_url?: string;
  stream_source?: string;
  username?: string;
  password?: string;
  record_video_of_camera?: boolean;
  unique_id?: string;
  advanced_options?: string;
  authentication?: string;
  verify_ssl?: string;
  rtsp_transport?: string;
  framerate?: string;
  entity_id?: string;
}
