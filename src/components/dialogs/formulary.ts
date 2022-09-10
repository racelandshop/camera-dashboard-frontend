import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import "@material/mwc-formfield";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mdiClose, mdiChevronLeft } from "@mdi/js";
import { classMap } from "lit/directives/class-map";
import type { HaFormSchema } from ".../../../homeassistant-frontend/src/components/ha-form/types";
import type { HassDialog } from "../../../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import "../search-input-round";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-header-bar";
import "../../../homeassistant-frontend/src/components/ha-form/ha-form";
import "../../../homeassistant-frontend/src/components/ha-checkbox";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import "../camera-model-icon-button";
import { getCameraEntities } from "../../common";
import { sendCameraInformation } from "../../data/websocket";
import {
  backEventOptions,
  schemaForm,
  CameraConfiguration,
  cameraCard,
  cameraModel,
} from "../../data/types";
import { CameraFormsDialogParams } from "../../helpers/show-camera-form-dialog";
import { localize } from "../../localize/localize";

@customElement("raceland-formulary")
export class HuiCreateDialogCameraFormulary
  extends LitElement
  implements HassDialog<CameraFormsDialogParams>
{
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @property({ attribute: false }) protected dialogOpen?: boolean;

  @property({ attribute: false }) protected data!: CameraConfiguration;

  @property({ attribute: false }) protected cameraModelInfo?: cameraModel;

  @property({ attribute: false }) backEvent!: backEventOptions;

  @property({ type: String }) public formType!: string;

  @property({ attribute: false }) schema!: schemaForm;

  @property({ type: String }) protected validIssue?;

  @property({ attribute: false }) protected registeredCameras!: Array<any>;

  @state() private _currTabIndex = 0;

  showDialog(params: CameraFormsDialogParams) {
    this.schema = params.schema;
    this.backEvent = params.backEvent;
    this.data = params.data;
    this.formType = params.formType;
    this.cameraModelInfo = params.cameraModelInfo;
    this.dialogOpen = true;
    this.registeredCameras = getCameraEntities(this.hass.states).map(
      (camera: cameraCard) => camera.name
    );
  }

  public closeDialog(): boolean {
    this._currTabIndex = 0;
    this.dialogOpen = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  protected render(): TemplateResult {
    if (!this.dialogOpen) {
      return html``;
    }

    const schemaBody = this.schema.body;
    const schemaExtraOptions = this.schema.extra_options;

    return html`
      <ha-dialog
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
        <div class="header-text">${this.schema.header.title}</div>
        ${this.validIssue ? html` <div class="form-issue">${this.validIssue}</div>` : html``}
        <div class="form">
          <ha-form
            .hass=${this.hass}
            .data=${this.data}
            .schema=${schemaBody}
            .computeLabel=${this._computeLabelCallback}
            @value-changed=${this._valueChanged}
          ></ha-form>
          ${schemaExtraOptions && this.data.advanced_options
            ? html` <ha-form
                .hass=${this.hass}
                .data=${this.data}
                .schema=${schemaExtraOptions}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
              ></ha-form>`
            : html``}
        </div>
        <div class="options">
          <mwc-button class="button-confirm" @click=${this._accept}
            >${this.schema.footer.accept}</mwc-button
          >
          ${this.backEvent
            ? html`<mwc-button class="button-back" dialogAction="close" @click=${this._goBack}
                >${this.schema.footer.back}
                <ha-svg-icon class="icon-back" slot="icon" .path=${mdiChevronLeft}></ha-svg-icon
              ></mwc-button>`
            : html``}
        </div>
      </ha-dialog>
    `;
  }

  private _computeLabelCallback = (schema: HaFormSchema) => {
    return localize(`form.${schema.name}`);
  };

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value;
    this.data = { ...this.data, ...config };
  }

  private validInputCustom() {
    if (!this.data.integration) {
      this.validIssue = localize("form.issues.missing_integration");
      return false;
    }
    if (!this.data.name) {
      this.validIssue = localize("form.issues.camera_name");
      return false;
    }
    if (this.registeredCameras.includes(this.data.camera_name)) {
      this.validIssue = localize("form.issues.duplicated_camera_name");
      return false;
    }
    if (!this.data.still_image_url && !this.data.stream_source) {
      this.validIssue = localize("form.issues.static_stream_source_missing");
      return false;
    }
    return true;
  }

  private validInput() {
    if (!this.data.camera_name) {
      this.validIssue = localize("form.issues.camera_name");
      return false;
    }
    return true;
  }

  private async _accept() {
    if (this.formType === "custom_camera") {
      const valid = this.validInputCustom();
      if (valid === true) {
        const result = await sendCameraInformation(this.hass, this.data);
        if (result === true) {
          this.closeDialog();
          fireEvent(this, "update-camera-dashboard");
        }
      }
    } else if (this.formType === "brand_camera") {
      const valid = this.validInput();
      if (valid === true) {
        //TODO: parse the input. this.data -> parsed_data
        const results = sendCameraInformation(this.hass, this.data);
        this.closeDialog();
      }
    }
  }

  private _goBack(ev) {
    const backEvent = this.backEvent;
    const modelDatabase = backEvent.modelDatabase;
    if (modelDatabase) {
      fireEvent(this, backEvent.event_name as keyof HASSDomEvents, { modelsInfo: modelDatabase });
    } else {
      fireEvent(this, backEvent.event_name as keyof HASSDomEvents);
    }
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
    "raceland-formulary": HuiCreateDialogCameraFormulary;
  }
}
