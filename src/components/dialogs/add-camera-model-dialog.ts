import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mdiClose, mdiPlus, mdiChevronLeft } from "@mdi/js";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import type { HassDialog } from "../../../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-header-bar";
import { CameraModelsDialogParams } from "../../helpers/show-camera-models-dialog";
import { cameraBrand, cameraModel } from "../../data/types";
import { customSchema, customCameraExtraOptionSchema, modelSchema } from "../../schemas";
import { defaultIntegration, cameraIntegrations } from "../../common";
import { localize } from "../../localize/localize";
import "../camera-model-icon-button";
import "../search-input-round";

@customElement("camera-brand-dialog")
export class HuiCreateDialogCameraBrand
  extends LitElement
  implements HassDialog<CameraModelsDialogParams>
{
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @property({ attribute: false }) protected modelDatabase?: Array<cameraModel>;

  @state() private _currTabIndex = 0;

  @state() private _filter = "";

  public async showDialog(params: CameraModelsDialogParams): Promise<void> {
    this.modelDatabase = params.modelsInfo;
  }

  public closeDialog(): boolean {
    this.modelDatabase = undefined;
    this._currTabIndex = 0;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  private _filterModels = memoizeOne((modelsDatabase, filter?: string) => {
    if (!filter) {
      return modelsDatabase;
    }
    let filteredModels = modelsDatabase;
    const options: Fuse.IFuseOptions<cameraBrand> = {
      keys: ["version"],
      isCaseSensitive: false,
      minMatchCharLength: 1,
      threshold: 0.2,
    };
    const fuse = new Fuse(filteredModels, options);
    filteredModels = fuse.search(filter).map((result) => result.item);
    return filteredModels;
  });

  protected render(): TemplateResult {
    if (!this.modelDatabase) {
      return html``;
    }

    const modelDatabase = this._filterModels(this.modelDatabase, this._filter);

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
            @click=${this._cancel}
            class="cancel-icon"
            slot="icon"
            .path=${mdiClose}
          ></ha-svg-icon>
        </div>
        <div class="search-bar">
          <div class="add-camera">Add Camera</div>
          <search-input-round
            .hass=${this.hass}
            .filter=${this._filter}
            class="rounded"
            @value-changed=${this._handleSearchChange}
            .label=${localize("search.models")}
          ></search-input-round>
        </div>

        <div class="brand-list">
          ${modelDatabase.map((cameraModelInfo) => {
            return html`<camera-model-icon-button
              .label="${cameraModelInfo.version}"
              @click=${() => this._addCamera(cameraModelInfo)}
            ></camera-model-icon-button>`;
          })}
        </div>

        <div class="options">
          <mwc-button class="button-confirm" @click=${this._addCustomCamera}
            >${localize("common.custom_camera")}
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon
          ></mwc-button>
          <mwc-button class="button-back" @click=${this.goBack}
            >${localize("common.back")}
            <ha-svg-icon class="icon-back" slot="icon" .path=${mdiChevronLeft}></ha-svg-icon
          ></mwc-button>
        </div>
      </ha-dialog>
    `;
  }

  private _addCamera(cameraModelInfo) {
    if (cameraModelInfo.supportChannels === false) {
      const index = modelSchema.indexOf({
        name: "number_of_cameras",
        selector: { number: {} },
      });
      modelSchema.splice(index, 1);
    }

    const form_schema = {
      header: { title: localize("common.add_camera") },
      body: modelSchema,
      footer: {
        back: localize("common.go_back"),
        accept: localize("common.add_camera"),
      },
    };

    fireEvent(this, "open-camera-add-camera-form", {
      cameraModelInfo: cameraModelInfo,
      schema: form_schema,
      data: { integration: defaultIntegration },
      formType: "brand_camera",
      backEvent: { event_name: "open-camera-brand-dialog", modelDatabase: this.modelDatabase },
    });

    this.closeDialog();
  }

  private _addCustomCamera(ev) {
    const form_schema = {
      header: { title: localize("common.add_camera") },
      body: customSchema(cameraIntegrations),
      extra_options: customCameraExtraOptionSchema,
      footer: {
        back: localize("common.go_back"),
        accept: localize("common.add_camera"),
      },
    };

    fireEvent(this, "open-camera-add-camera-form", {
      cameraModelInfo: {} as cameraModel,
      schema: form_schema,
      data: { integration: defaultIntegration },
      formType: "custom_camera",
      backEvent: { event_name: "open-camera-brand-dialog", modelDatabase: this.modelDatabase },
    });
    this.closeDialog();
  }

  private goBack(ev) {
    fireEvent(this, "add-new-camera");
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _handleSearchChange(ev: CustomEvent) {
    //Check hui-card-picker more information is required
    this._filter = ev.detail.value;
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

        .button-confirm {
          background-color: #4ba2ff;
          float: right;
        }

        .button-back {
          --mdc-theme-primary: #7b7b7b;
          float: left;
          margin-left: 5%;
        }

        .icon-back {
          width: 30px;
          height: 30px;
        }

        .search-bar {
          height: 80px;
          padding: 60px 45px 20px 45px;
        }

        search-input-round {
          float: right;
          display: block;
          width: 50%;
          margin-right: 10%;
        }

        .add-camera {
          float: left;
          font-family: "Roboto";
          font-style: normal;
          font-weight: 500;
          font-size: 36px;
          line-height: 42px;
          color: #303033;
          padding: 1% 1% 1% 1%;
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
    "camera-brand-dialog": HuiCreateDialogCameraBrand;
  }
}
