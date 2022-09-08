import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";

export interface EditCameraDialogParams {
  cameraInfo; //CameraInfo is a list of camera info (add this later with the corresponding camera info interface)
}

export const importEditCameraDialog = () => import("../components/dialogs/edit-camera-dialog");

export const showEditCameraDialog = (
  element: HTMLElement,
  EditCameraDialogParams: EditCameraDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "edit-camera-dialog",
    dialogImport: importEditCameraDialog,
    dialogParams: EditCameraDialogParams,
  });
};
