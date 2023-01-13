import { HomeAssistant } from "../../frontend-release/src/types";
import { CameraConfiguration } from "./types";

export const fetchCameraDatabase = async (hass: HomeAssistant): Promise<any> => {
  const response = await hass.connection.sendMessagePromise<any>({
    type: "raceland-camera-dashboard/fetch_camera_db",
  });
  return response;
};

export const sendCameraBrandInformation = async (hass: HomeAssistant, cameraInfo): Promise<any> => {
  const response = await hass.connection.sendMessagePromise<CameraConfiguration>({
    type: "raceland-camera-dashboard/register_model_camera",
    ...cameraInfo,
  });
  return response;
};

export const sendCameraInformation = async (hass: HomeAssistant, cameraInfo): Promise<any> => {
  const response = await hass.connection.sendMessagePromise<CameraConfiguration>({
    type: "raceland-camera-dashboard/register_camera",
    ...cameraInfo,
  });
  return response;
};

export const updateCameraInformation = async (hass: HomeAssistant, cameraInfo): Promise<any> => {
  const response = await hass.connection.sendMessagePromise<CameraConfiguration>({
    type: "raceland-camera-dashboard/edit_camera",
    ...cameraInfo,
  });
  return response;
};

export const removeCamera = async (hass: HomeAssistant, id, entityID) => {
  const response = await hass.connection.sendMessagePromise<boolean>({
    type: "raceland-camera-dashboard/remove_camera",
    entityID: entityID,
    unique_id: id,
  });
  return response;
};

export const fetchCameraInformation = async (hass: HomeAssistant, cameraEntityID) => {
  const response = await hass.connection.sendMessagePromise<CameraConfiguration>({
    type: "raceland-camera-dashboard/fetch_camera_information",
    entity_id: cameraEntityID,
  });
  return response;
};

export const fetchCameraList = async (hass: HomeAssistant) => {
  const response = await hass.connection.sendMessagePromise<CameraConfiguration>({
    type: "raceland-camera-dashboard/fetch_camera_list",
  });

  return response;
};
