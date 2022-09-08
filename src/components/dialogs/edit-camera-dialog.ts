import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { mdiClose, mdiEyeOff, mdiEye } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map";
import { customElement, property, state } from "lit/decorators";
import type { HassDialog } from "../../../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
//import type { HaFormSchema } from "../../../homeassistant-frontend/src/components/ha-form/types";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-header-bar";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import { EditCameraDialogParams } from "../../helpers/show-edit-camera-dialog";
import { fetchCameraInformation } from "../../data/websocket";
import "../camera-brand-icon-button";
import "../search-input-round";
import "../../../homeassistant-frontend/src/components/ha-select";
import "../../../homeassistant-frontend/src/components/ha-textfield";
import "../../../homeassistant-frontend/src/components/ha-slider";
import "../../../homeassistant-frontend/src/components/ha-switch";
import { localize } from "../../localize/localize";
import { CameraConfiguration } from "../../data/types";

@customElement("edit-camera-dialog")
export class HuiEditDialogCamera extends LitElement implements HassDialog<EditCameraDialogParams> {
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @property({ attribute: false }) protected dialogOpen?: boolean;

  @property({ attribute: false }) protected cameraInfo: any;

  @state() private _unmaskedPassword = false;

  @state() private _params?: EditCameraDialogParams;

  @state() private _currTabIndex = 0;

  public async showDialog(params: EditCameraDialogParams): Promise<void> {
    this._params = params;
    this.dialogOpen = true;
    this.cameraInfo = await fetchCameraInformation(this.hass, this._params.cameraInfo.entity_id);
    this.cameraInfo.advanced_options = false;
  }

  public closeDialog(): boolean {
    this._currTabIndex = 0;
    this.dialogOpen = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  // <ha-select .label="integration"></ha-select
  // fixedMenuPosition
  // naturalMenuWidth
  // .value=${this.value}
  // .disabled=${this.disabled}
  // @selected=${this._blueprintChanged}
  // @closed=${stopPropagation}

  protected render(): TemplateResult {
    console.log("the camera info is", this.cameraInfo);
    if (this.cameraInfo === undefined || !this.dialogOpen) {
      return html``;
    }
    return html` <ha-dialog
      open
      scrimClickAction
      hideActions
      @closed=${this.closeDialog}
      class=${classMap({ table: this._currTabIndex === 1 })}
    >
      <div class="cancel">
        <ha-svg-icon
          dialogAction="close"
          class="cancel-icon"
          slot="icon"
          .path=${mdiClose}
        ></ha-svg-icon>
      </div>
      <div class="header-text">${localize("common.edit_camera")}</div>

      <div class="editFormulary">
        <ha-select
          class="editField"
          label=${localize("form.integration")}
          value=${this.cameraInfo.integration}
        >
          ${["generic", "FFMPEG"].map(
            (item) => html`<mwc-list-item value=${item}>${item}</mwc-list-item>`
          )}</ha-select
        >
        <ha-textfield
          class="editField"
          label=${localize("form.camera_name")}
          value=${this.cameraInfo.name}
          required
        >
        </ha-textfield>
        <ha-textfield
          class="editField"
          label=${localize("form.static_image_url")}
          value=${this.cameraInfo.still_image_url}
        >
        </ha-textfield>
        <ha-textfield
          class="editField"
          label=${localize("form.stream_url")}
          value=${this.cameraInfo.stream_url}
        >
        </ha-textfield>
        <div class="editField">
          <ha-textfield
            class="loginField"
            label=${localize("form.username")}
            value=${this.cameraInfo.username}
          >
          </ha-textfield>
          <div class="loginField">
            <ha-textfield
              label=${localize("form.password")}
              value=${this.cameraInfo.password}
              .type=${this._unmaskedPassword ? "text" : "password"}
            >
            </ha-textfield>
            <ha-icon-button
              toggles
              .label=${`${this._unmaskedPassword ? "Hide" : "Show"} password`}
              @click=${this._toggleUnmaskedPassword}
              .path=${this._unmaskedPassword ? mdiEyeOff : mdiEye}
            ></ha-icon-button>
          </div>
        </div>

        <div class="editField switch">
          <span>${localize("form.record_video_of_camera")}</span>
          <ha-switch label=${localize("form.record_video_of_camera")}
            >${localize("form.record_video_of_camera")}</ha-switch
          >
        </div>

        <div class="editField switch">
          <span>${localize("form.advanced_options")}</span>
          <ha-switch label=${localize("form.advanced_options")}
            >${localize("form.advanced_options")}}</ha-switch
          >
        </div>

        ${!this.cameraInfo.advanced_options
          ? html`<ha-select
                class="editField"
                label=${localize("form.authentication")}
                value=${this.cameraInfo.authentication[0].toUpperCase() +
                this.cameraInfo.authentication.substring(1)}
              >
                ${["Basic", "Digest"].map(
                  (item) => html`<mwc-list-item value=${item}>${item}</mwc-list-item>`
                )}</ha-select
              >
              <ha-select
                class="editField"
                label=${localize("form.verify_ssl")}
                value=${this.cameraInfo.verify_ssl}
              >
                ${["True", "False"].map(
                  (item) => html`<mwc-list-item value=${item}>${item}</mwc-list-item>`
                )}</ha-select
              >
              <ha-select class="editField " label=${localize("form.rtsp_transport")}>
                ${["TCP", "Option2"].map(
                  (item) => html`<mwc-list-item value=${item}>${item}</mwc-list-item>`
                )}</ha-select
              >
              <ha-slider class="editField " id="selector" max="60" min="1"></ha-slider>`
          : html``}
      </div>
    </ha-dialog>`;
  }

  private _toggleUnmaskedPassword(): void {
    this._unmaskedPassword = !this._unmaskedPassword;
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        @media all and (max-width: 450px), all and (max-height: 500px) {
          /* overrule the ha-style-dialog max-height on small screens */
          ha-dialog {
            --mdc-dialog-max-height: 100%;
            height: 100%;
          }
        }

        @media all and (min-width: 1000px) {
          ha-dialog {
            --mdc-dialog-min-width: 900px;
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

        ha-formfield {
          display: flex;
          height: 56px;
          align-items: center;
          --mdc-typography-body2-font-size: 1em;
        }

        ha-switch {
          float: right;
        }

        .editFormulary {
          margin-left: 10%;
          margin-right: 10%;
        }

        .editField {
          margin-top: 1%;
          margin-bottom: 1%;
          width: 100%;
        }

        .editField.switch {
          margin-top: 5%;
          margin-bottom: 5%;
        }

        .loginField {
          width: 49%;
        }

        .button-confirm {
          background-color: #4ba2ff;
          float: right;
        }

        .button-back {
          --mdc-theme-primary: #7b7b7b;
          float: left;
          margin-left: 5%;
        }

        .form-issue {
          font-family: "Roboto";
          font-style: normal;
          font-size: 12px;
          color: #e41111;
          padding: 1% 1% 1% 12%;
          text-align: left;
          width: 100%;
        }

        .icon-back {
          width: 30px;
          height: 30px;
        }
        .header-text {
          font-family: "Roboto";
          font-style: normal;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          color: #303033;
          padding: 1% 1% 1% 5%;
          text-align: center;
          width: 38%;
        }

        .brand-list {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-gap: 10%;
          padding: 0px 60px 30px 60px;
        }

        .cancel {
          cursor: pointer;
          padding: 20px 20px 20px 20px;
        }

        mwc-button {
          padding: 10px;
          text-align: center;
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
        .cancel-icon {
          float: right;
          width: 40px;
          height: 40px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "edit-camera-dialog": HuiEditDialogCamera;
  }
}
