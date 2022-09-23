import { fireEvent } from "../../frontend-release/src/common/dom/fire_event";

export interface CreateCameraDialogParams {
  database?: any;
}

export const importCreateCameraDialog = () => import("../components/dialogs/add-camera-dialog");

export const showCreateCameraDialog = (
  element: HTMLElement,
  createCameraDialogParams: CreateCameraDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "add-camera-dialog",
    dialogImport: importCreateCameraDialog,
    dialogParams: createCameraDialogParams,
  });
};
