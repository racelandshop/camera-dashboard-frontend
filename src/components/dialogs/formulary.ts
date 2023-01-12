import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import "@material/mwc-formfield";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mdiClose, mdiChevronLeft, mdiPlus } from "@mdi/js";
import { classMap } from "lit/directives/class-map";
import "../../../frontend-release/src/components/ha-dialog";
import "../../../frontend-release/src/components/ha-header-bar";
import "../../../frontend-release/src/components/ha-form/ha-form";
import "../../../frontend-release/src/components/ha-checkbox";
import type { HaFormSchema } from ".../../../frontend-release/src/components/ha-form/types";
import type { HassDialog } from "../../../frontend-release/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../frontend-release/src/common/dom/fire_event";
import type { HomeAssistant } from "../../../frontend-release/src/types";
import "../camera-model-icon-button";
import "../search-input-round";
import { getCameraEntities, removeTrailingSpacesInput } from "../../common";
import { sendCameraInformation, sendCameraBrandInformation } from "../../data/websocket";
import {
  backEventOptions,
  schemaForm,
  CameraConfiguration,
  cameraCard,
  cameraModel,
} from "../../data/types";
import { CameraFormsDialogParams } from "../../helpers/show-camera-form-dialog";
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

  @property({ attribute: false }) protected registeredCameras!: Array<any>;

  @state() private _currTabIndex = 0;

  @state() protected validIssue: string | undefined;

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
    console.log("data", this.data);
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
    console.log("advanced options", schemaBody);
    return html`
      <ha-dialog
        open
        scrimClickAction
        hideActions
        @closed=${this.closeDialog}
        class=${classMap({ table: this._currTabIndex === 1 })}
      >
        <div class="cancel">
          <div slot="heading" class="heading">
            <ha-header-bar id="bar">
              <div slot="title" class="main-title" .title=${name}>
                ${localize("common.add_camera")}
              </div>
              <ha-icon-button
                slot="navigationIcon"
                dialogAction="cancel"
                .label=${this.hass!.localize("ui.dialogs.more_info_control.dismiss")}
                id="cancel"
                .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              ></ha-icon-button>
            </ha-header-bar>
          </div>
        </div>
        <div
          class="content ${classMap({
            "content-big": schemaBody.length < 6,
          })} "
        >
          <div class="contentFather">
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
          </div>
        </div>
        <div class="options">
          <ha-fab
            class="button-confirm"
            .label=${this.schema.footer.accept}
            extended
            @click=${this._accept}
            })}
          >
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
          </ha-fab>
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

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _computeLabelCallback = (schema: HaFormSchema) => {
    return localize(`form.${schema.name}`);
  };

  private _valueChanged(ev: CustomEvent): void {
    const config = removeTrailingSpacesInput(ev.detail.value);
    this.data = { ...this.data, ...config };
  }

  private validInputCustom() {
    if (!this.data.name) {
      this.validIssue = localize("form.issues.name");
      return false;
    }
    if (this.registeredCameras.includes(this.data.name)) {
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
    if (!this.data.ip) {
      this.validIssue = localize("form.issues.ip_missing");
      return false;
    }

    if (
      isNaN(Number(this.data.channel)) ||
      (this.data.channel !== undefined && this.data.channel <= 0)
    ) {
      this.validIssue = localize("form.issues.n_cameras");
      return false;
    }

    let cameraNames: Array<string> = [];
    const channel: number = parseInt(this.data.channel);
    if (this.data.channel !== undefined && channel > 1) {
      cameraNames = Array.from({ length: channel }, (_, k) => `${this.data.name} ${k + 1}`);
    } else {
      cameraNames = [this.data.name];
    }

    if (cameraNames.filter((value) => this.registeredCameras.includes(value)).length > 0) {
      this.validIssue = localize("form.issues.duplicated_camera_name");
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
        await sendCameraBrandInformation(this.hass, this.data);
        this.closeDialog();
        fireEvent(this, "update-camera-dashboard");
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
      haStyleDialog,
      css`
        .content {
          width: 83%;
        }

        @media all and (max-width: 450px), all and (max-height: 500px) {
          /* overrule the ha-style-dialog max-height on small screens */
          ha-dialog {
            --mdc-dialog-max-height: 100%;
            height: 100%;
          }
          .content-big {
            width: 83%;
            height: 225vw;
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
        .options {
          width: 100%;
          position: sticky;
          float: right;
          right: calc(16px + env(safe-area-inset-right));
          /* bottom: calc(16px + env(safe-area-inset-bottom)); */
          z-index: 1;
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
          /* background-color: #4ba2ff; */
          float: right;
        }

        .button-back {
          --mdc-theme-primary: #7b7b7b;
          float: left;
          /* margin-left: 5%; */
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
          /* margin-left: 10%;
          margin-right: 10%; */
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
          grid-gap: 9%;
          padding: 0px 55px 25px;
        }

        .cancel {
          cursor: pointer;
          /* padding: 20px 20px 20px 20px; */
          width: 100%;
        }

        mwc-button {
          /* padding: 10px; */
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
