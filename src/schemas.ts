import memoizeOne from "memoize-one";
import type { HaFormSchema } from "../homeassistant-frontend/src/components/ha-form/types";

export const customSchema = memoizeOne((integrationOptions): HaFormSchema[] => [
  {
    name: "integration",
    selector: {
      select: {
        options: integrationOptions,
        mode: "dropdown",
      },
    },
  },
  {
    name: "camera_name",
    selector: { text: {} },
  },
  {
    name: "static_image_url",
    selector: { text: {} },
  },
  {
    name: "stream_url",
    selector: { text: {} },
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "username",
        selector: { text: {} },
      },
      {
        name: "password",
        selector: { text: {} },
      },
    ],
  },
  { name: "record_video_of_camera", selector: { boolean: {} } },
  { name: "advanced_options", selector: { boolean: {} } },
]);

export const customCameraExtraOptionSchema = [
  {
    name: "select_authetication",
    selector: {
      select: {
        options: ["Basic", "Digest"],
        mode: "dropdown",
      },
    },
  },
  {
    name: "verify_ssl",
    selector: {
      select: {
        options: ["True", "False"],
        mode: "dropdown",
      },
    },
  },
  {
    name: "select_rtsp_transport",
    selector: {
      select: {
        options: ["TCP", "Option2"],
        mode: "dropdown",
      },
    },
  },
  {
    name: "framerate",
    selector: {
      number: {
        min: 1,
        max: 60,
        step: 1,
        mode: "slider",
        unit_of_measurement: "FPS",
      },
    },
  },
];

export const modelSchema = [
  {
    name: "camera_name",
    selector: { text: {} },
  },
  {
    name: "username",
    selector: { text: {} },
  },
  {
    name: "password",
    selector: { text: {} },
  },
  {
    name: "number_of_cameras",
    selector: { text: {} },
  },
  {
    name: "ip",
    selector: { text: {} },
  },

  { name: "record_video_of_camera", selector: { boolean: {} } },
];
