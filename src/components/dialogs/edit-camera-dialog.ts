import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { mdiClose } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map";
import { customElement, property, state } from "lit/decorators";
import type { HassDialog } from "../../../frontend-release/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../frontend-release/src/common/dom/fire_event";
import type { HaFormSchema } from "../../../frontend-release/src/components/ha-form/types";
import type { HomeAssistant } from "../../../frontend-release/src/types";
import { EditCameraDialogParams } from "../../helpers/show-edit-camera-dialog";
import "../../../frontend-release/src/components/ha-dialog";
import "../../../frontend-release/src/components/ha-header-bar";
import "../../../frontend-release/src/components/ha-form/ha-form";
import { fetchCameraInformation, updateCameraInformation } from "../../data/websocket";
import { customSchema, customCameraExtraOptionSchema } from "../../schemas";
import { localize } from "../../localize/localize";
import { getCameraEntities, cameraIntegrations } from "../../common";
import { backEventOptions, schemaForm, cameraCard, cameraInfo } from "../../data/types";
import "../camera-brand-icon-button";
import "../search-input-round";

@customElement("edit-camera-dialog")
export class HuiEditDialogCamera extends LitElement implements HassDialog<EditCameraDialogParams> {
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @property({ attribute: false }) protected dialogOpen?: boolean;

  @property({ attribute: false }) protected cameraInfo: any;

  @state() private _params?: EditCameraDialogParams;

  @property({ attribute: false }) backEvent!: backEventOptions;

  @property({ attribute: false }) protected registeredCameras!: Array<any>;

  @property({ attribute: false }) schema!: schemaForm;

  @state() private _currTabIndex = 0;

  @state() protected validIssue: string | undefined;

  public async showDialog(params: EditCameraDialogParams): Promise<void> {
    const form_schema = {
      header: { title: localize("common.add_camera") },
      body: customSchema,
      extra_options: customCameraExtraOptionSchema,
      footer: {
        accept: localize("common.edit_camera"),
      },
    };
    this._params = params;
    this.schema = form_schema;
    this.dialogOpen = true;
    this.cameraInfo = await fetchCameraInformation(this.hass, this._params.cameraInfo.entityID);
    this.registeredCameras = getCameraEntities(this.hass.states).map(
      (camera: cameraCard) => camera.name
    );

    if (this.cameraInfo.authentication !== undefined) {
      this.cameraInfo.authentication =
        this.cameraInfo.authentication[0].toUpperCase() +
        this.cameraInfo.authentication.substring(1);
    }

    if (this.cameraInfo.verify_ssl != undefined) {
      let verify_ssl = this.cameraInfo.verify_ssl;
      verify_ssl = String(this.cameraInfo.verify_ssl);
      this.cameraInfo.verify_ssl = verify_ssl[0].toUpperCase() + verify_ssl.substring(1);
    }
  }

  public closeDialog(): boolean {
    this._currTabIndex = 0;
    this.dialogOpen = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  protected render(): TemplateResult {
    if (this.cameraInfo === undefined || !this.dialogOpen) {
      return html``;
    }

    const schemaBody = this.schema.body;
    const schemaExtraOptions = this.schema.extra_options;

    return html` <ha-dialog
      open
      scrimClickAction
      hideActions
      class=${classMap({ table: this._currTabIndex === 1 })}
      @closed=${this.closeDialog}
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
      </div>
      ${this.validIssue ? html` <div class="form-issue">${this.validIssue}</div>` : html``}
      <div class="form">
      <ha-form
            .hass=${this.hass}
            .data=${this.cameraInfo}
            .schema=${schemaBody}
            .computeLabel=${this._computeLabelCallback}
            @value-changed=${this._valueChanged}
          ></ha-form>
          ${
            schemaExtraOptions && this.cameraInfo.advanced_options
              ? html` <ha-form
                  .hass=${this.hass}
                  .data=${this.cameraInfo}
                  .schema=${schemaExtraOptions}
                  .computeLabel=${this._computeLabelCallback}
                  @value-changed=${this._valueChanged}
                ></ha-form>`
              : html``
          }
        </div>
        <div class="options">
          <mwc-button class="button-confirm" @click=${this._accept}
            >${this.schema.footer.accept}</mwc-button
          >
        </div>
    </ha-dialog>`;
  }

  private _computeLabelCallback = (schema: HaFormSchema) => {
    return localize(`form.${schema.name}`);
  };

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value;
    this.cameraInfo = { ...this.cameraInfo, ...config };
  }

  private async _accept() {
    const valid = this.validInput();
    if (valid === true) {
      const camInfo = this.removeNull(this.cameraInfo);
      const result = await updateCameraInformation(this.hass, camInfo);
      if (result === true) {
        this.closeDialog();
        fireEvent(this, "update-camera-dashboard");
      }
    }
  }

  private validInput() {
    if (!this.cameraInfo.integration) {
      this.validIssue = localize("form.issues.missing_integration");
      return false;
    }
    if (!this.cameraInfo.name) {
      this.validIssue = localize("form.issues.camera_name");
      return false;
    }
    if (this.registeredCameras.includes(this.cameraInfo.camera_name)) {
      this.validIssue = localize("form.issues.duplicated_camera_name");
      return false;
    }
    if (!this.cameraInfo.still_image_url && !this.cameraInfo.stream_source) {
      this.validIssue = localize("form.issues.static_stream_source_missing");
      return false;
    }
    return true;
  }

  private removeNull(cameraInfo): cameraInfo {
    //Remove null keys in the dictionary (ensuring the data passes the checks in the backend. This is not the most elegant solution but it should work for now)
    for (const [key, value] of Object.entries(cameraInfo)) {
      if (value === null) {
        delete cameraInfo[key];
      }
    }
    return cameraInfo;
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

        ha-form {
          margin-left: 8%;
          margin-right: 8%;
        }

        ha-formfield {
          display: flex;
          height: 56px;
          align-items: center;
          --mdc-typography-body2-font-size: 1em;
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
        .form {
          margin-left: 10%;
          margin-right: 10%;
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
