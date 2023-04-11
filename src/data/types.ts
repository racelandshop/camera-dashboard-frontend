import type { HaFormSchema } from "../../frontend-release/components/ha-form/types";

export interface cameraInfo {
  name: string;
  entityID: string;
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
  ip?: string;
  channel?: string;
  stream_source_door?: string;
  still_url_door?: string;
  name: string;
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
  entityID?: string;
}
