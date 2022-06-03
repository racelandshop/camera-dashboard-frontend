import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import { cameraModel } from "../data/types";
import type { backEventOptions, schemaForm } from "../data/types";

export interface CameraFormsDialogParams {
  cameraModelInfo: cameraModel;
  schema: schemaForm;
  back: boolean;
  event: backEventOptions;
}

export const importCameraFormDialog = () => import("../components/dialogs/formulary");

export const showCameraDialog = (
  element: HTMLElement,
  cameraFormDialogParams: CameraFormsDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "add-camera-formulary",
    dialogImport: importCameraFormDialog,
    dialogParams: cameraFormDialogParams,
  });
};
