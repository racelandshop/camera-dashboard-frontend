import { fireEvent } from "../../frontend-release/src/common/dom/fire_event";
import { cameraModel } from "../data/types";

export interface CameraModelsDialogParams {
  modelsInfo: Array<cameraModel>;
}

export const importCameraModelsDialog = () =>
  import("../components/dialogs/add-camera-model-dialog"); //modify

export const showModelOptionsDialog = (
  element: HTMLElement,
  cameraModelsDialogParams: CameraModelsDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "camera-brand-dialog",
    dialogImport: importCameraModelsDialog,
    dialogParams: cameraModelsDialogParams,
  });
};
