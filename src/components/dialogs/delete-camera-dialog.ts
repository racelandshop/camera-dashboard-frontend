import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { mdiCheckboxMarkedCircle, mdiChevronLeft, mdiDelete } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import type { HassDialog } from "../../../frontend-release/dialogs/make-dialog-manager";
import { fireEvent } from "../../../frontend-release/common/dom/fire_event";
import type { HomeAssistant } from "../../../frontend-release/types";
import "../../../frontend-release/components/ha-dialog";
import "../../../frontend-release/components/ha-header-bar";
import { DeleteCameraDialogParams } from "../../helpers/show-delete-camera-dialog";
import { CameraConfiguration } from "../../data/types";
import { removeCamera, fetchCameraInformation } from "../../data/websocket";
import { localize } from "../../localize/localize";

export const haStyleDialog = css`
  /* mwc-dialog (ha-dialog) styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-heading-ink-color: var(--primary-text-color);
    --mdc-dialog-content-ink-color: var(--primary-text-color);
    --justify-action-buttons: space-between;
    --mdc-switch__pointer_events: auto;
  }

  ha-dialog .form {
    padding-bottom: 24px;
    color: var(--primary-text-color);
  }

  a {
    color: var(--accent-color) !important;
  }

  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --mdc-dialog-max-width: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  mwc-button.warning {
    --mdc-theme-primary: var(--error-color);
  }
  .error {
    color: var(--error-color);
  }
`;

@customElement("delete-camera-dialog")
export class HuiDeleteDialogCamera
  extends LitElement
  implements HassDialog<DeleteCameraDialogParams>
{
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @state() private _params?: DeleteCameraDialogParams;

  @state() private cameraConfiguration!: CameraConfiguration;

  @state() private _currTabIndex = 0;

  public async showDialog(params: DeleteCameraDialogParams): Promise<void> {
    this._params = params;
    this.cameraConfiguration = await fetchCameraInformation(
      this.hass,
      this._params.cameraInfo.entityID
    );
  }

  public closeDialog(): void {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }
    return html`
      <ha-dialog
        open
        scrimClickAction
        hideActions
        .heading=${localize("common.delete_camera")}
        class=${classMap({ table: this._currTabIndex === 1 })}
        @closed=${this.closeDialog}
      >
        <div class="header" slot="heading">
          <ha-header-bar>
            <span slot="title">
              <ha-svg-icon class="header-icon" slot="icon" .path=${mdiDelete}></ha-svg-icon
            ></span>
          </ha-header-bar>
        </div>
        <div class="content">
          <div class="contentFather">
            <div class="text">
              <p class="big-text">${localize("common.delete_camera")}</p>
              <p class="small-text">${localize("dialog_text.verify_action")}</p>
            </div>
          </div>
        </div>
        <div class="options">
          <mwc-button class="button-cancel" @click=${this._cancel}>
            <ha-svg-icon class="icon-back" slot="icon" .path=${mdiChevronLeft}></ha-svg-icon>
            ${localize("common.back")}</mwc-button
          >
          <mwc-button class="button-confirm" @click=${this._delete}
            ><ha-svg-icon
              class="confirm-icon"
              slot="icon"
              .path=${mdiCheckboxMarkedCircle}
            ></ha-svg-icon
            >${localize("common.confirm")}</mwc-button
          >
        </div>
      </ha-dialog>
    `;
  }

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private async _delete(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    const result = await removeCamera(
      this.hass,
      this.cameraConfiguration?.unique_id,
      this.cameraConfiguration?.entityID
    );
    if (result === true) {
      this.closeDialog();
      fireEvent(this, "update-camera-dashboard");
    }
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        @media all and (max-width: 450px), all and (max-height: 500px) {
          /* overrule the ha-style-dialog max-height on small screens */
          ha-dialog {
            --mdc-dialog-max-height: 100%;
            height: 100%;
          }
        }

        @media all and (min-width: 800px) {
          ha-dialog {
            --mdc-dialog-min-width: 500px;
          }
        }

        @media all and (max-width: 450px), all and (max-height: 500px) {
          hui-entity-picker-table {
            height: calc(100vh - 158px);
          }
        }

        ha-dialog {
          --mdc-dialog-max-width: 500px;
          --dialog-content-padding: 2px 24px 20px 24px;
          --dialog-z-index: 5;
        }

        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
          border-bottom: 1px solid var(--mdc-dialog-scroll-divider-color, rgba(0, 0, 0, 0.12));
        }
        .content {
          width: 100%;
        }
        .button-cancel {
          background-color: #a3abae;
          float: left;
          width: 90px;
        }
        .options {
          width: 100%;
        }

        .button-confirm {
          background-color: #4ba2ff;
          float: right;
        }
        .header {
          height: 80px;
        }
        mwc-button {
          padding: 10px;
          /* text-align: center; */
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: 0px 0px 5px 0px rgba(1, 1, 1, 0);
          --mdc-theme-primary: white;
          margin-bottom: 40px;
        }

        .header_button {
          color: inherit;
          text-decoration: none;
        }

        mwc-tab-bar {
          border-bottom: 1px solid var(--mdc-dialog-scroll-divider-color, rgba(0, 0, 0, 0.12));
        }
        .confirm-icon {
          width: 20px;
          height: 40px;
        }
        .header-icon {
          width: 60px;
          height: 60px;
          padding-top: 50px;
          color: #7b7b7b;
        }
        .text {
          margin: 0px 0px 20px 0px;
        }
        .big-text {
          /* font-family: "Roboto"; */
          font-style: normal;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          color: #303033;
          margin: 10px;
        }
        .small-text {
          /* font-family: "Roboto"; */
          font-style: normal;
          font-weight: 400;
          font-size: 18px;
          line-height: 21px;
          color: #303033;
          margin: 10px;
        }
        ha-svg-icon {
          margin-left: 0px;
          margin-right: 6px;
          display: inline-block;
          position: relative;
          vertical-align: top;
          font-size: 1.125rem;
          height: 2.125rem;
          width: 1.7rem;
        }
        @media only screen and (max-width: 500px) {
          .content {
            width: 100%;
            height: 171vw;
          }
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "delete-camera-dialog": HuiDeleteDialogCamera;
  }
}
