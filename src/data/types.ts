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
  modelDatabase?: Array<cameraModel>;
}

export interface schemaForm {
  header: { title: string };
  body: HaFormSchema[];
  extra_options?: HaFormSchema[];
  cameraModelInfo?: cameraModel;
  footer: {
    back: string;
    accept: string;
  };
}

export interface CameraConfiguration {
  integration?: string;
  camera_name?: string;
  static_image_url?: string;
  stream_url?: string;
  username?: string;
  password?: string;
  record_video_of_camera?: boolean;
  ip?: string;
  advanced_options?: string;
  select_authentication?: string;
  verify_ssl?: string;
  select_rtsp_transport?: string;
  framerate?: string;
}
