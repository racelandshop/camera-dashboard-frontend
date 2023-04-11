import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mdiPlus, mdiChevronLeft } from "@mdi/js";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import type { HassDialog } from "../../../frontend-release/dialogs/make-dialog-manager";
import { fireEvent } from "../../../frontend-release/common/dom/fire_event";
import type { HomeAssistant } from "../../../frontend-release/types";
import "../../../frontend-release/components/ha-dialog";
import "../../../frontend-release/components/ha-header-bar";
import "../../../frontend-release/components/search-input";
import "../../../frontend-release/components/ha-fab";
import { CameraModelsDialogParams } from "../../helpers/show-camera-models-dialog";
import { cameraBrand, cameraModel } from "../../data/types";
import { customSchema, customCameraExtraOptionSchema } from "../../schemas";
import { localize } from "../../localize/localize";
import "../camera-model-icon-button";
import "../search-input-round";

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
  @media all and (max-width: 500px), all and (max-height: 500px) {
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
    const modifiedSchema: any = [];
    const advancedOptions: any[] = [];

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
        <div class="content">
          <div class="contentFather">
            <div class="search-bar">
              <search-input
                .hass=${this.hass}
                .filter=${this._filter}
                class="rounded"
                @value-changed=${this._handleSearchChange}
                .label=${localize("search.brands")}
              ></search-input>
            </div>

            <div class="brand-list">
              ${modelDatabase.map((cameraModelInfo) => {
                return html`<camera-model-icon-button
                  .label="${cameraModelInfo.version}"
                  @click=${() => this._addCamera(cameraModelInfo, modifiedSchema, advancedOptions)}
                ></camera-model-icon-button>`;
              })}
            </div>
          </div>
        </div>
        <div class="options">
          <ha-fab
            class="button-confirm"
            .label=${localize("common.custom_camera")}
            extended
            @click=${this._addCustomCamera}
            })}
          >
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
          </ha-fab>
          <mwc-button class="button-back" @click=${this.goBack}
            >${localize("common.back")}
            <ha-svg-icon class="icon-back" slot="icon" .path=${mdiChevronLeft}></ha-svg-icon
          ></mwc-button>
        </div>
      </ha-dialog>
    `;
  }

  private _addCamera(cameraModelInfo, modifiedSchema, advancedOptions) {
    //Dynamically add the information for the formulary
    cameraModelInfo.fields.forEach((element) => {
      modifiedSchema.push(element);
    });

    if (cameraModelInfo.advanced_options !== undefined) {
      modifiedSchema.push({ name: "advanced_options", selector: { boolean: {} } });
      cameraModelInfo.advanced_options.forEach((element) => {
        advancedOptions.push(element);
      });
    }

    const formSchema = {
      header: { title: localize("common.add_camera") },
      body: modifiedSchema,
      extra_options: advancedOptions,
      footer: {
        back: localize("common.go_back"),
        accept: localize("common.add_camera"),
      },
    };
    fireEvent(this, "open-camera-add-camera-form", {
      cameraModelInfo: cameraModelInfo,
      schema: formSchema,
      data: {
        ...cameraModelInfo.default,
        still_image_url: cameraModelInfo.options.static,
        stream_source: cameraModelInfo.options.stream,
      },
      formType: "brand_camera",
      backEvent: { event_name: "open-camera-brand-dialog", modelDatabase: this.modelDatabase },
    });

    this.closeDialog();
  }

  private _addCustomCamera(ev) {
    const form_schema = {
      header: { title: localize("common.add_camera") },
      body: customSchema,
      extra_options: customCameraExtraOptionSchema,
      footer: {
        back: localize("common.go_back"),
        accept: localize("common.add_camera"),
      },
    };

    fireEvent(this, "open-camera-add-camera-form", {
      cameraModelInfo: {} as cameraModel,
      schema: form_schema,
      data: {},
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
      haStyleDialog,
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
        .content {
          width: 100%;
        }
        .contentFather {
          display: flex;
          width: 100%;
          flex-direction: column;
          align-items: center;
        }

        search-input {
          width: 100%;
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
          height: 50px;
          margin-top: 8%;
          width: 100%;
          position: sticky;
          float: right;
          right: calc(16px + env(safe-area-inset-right));
          bottom: calc(16px + env(safe-area-inset-bottom));
          z-index: 1;
        }

        ha-header-bar {
          --mdc-theme-on-primary: var(--primary-text-color);
          --mdc-theme-primary: var(--mdc-theme-surface);
          flex-shrink: 0;
          border-bottom: 1px solid var(--mdc-dialog-scroll-divider-color, rgba(0, 0, 0, 0.12));
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

        .icon-back {
          width: 30px;
          height: 30px;
        }

        .search-bar {
          height: 73px;
          width: 80%;
          padding: 10px 58px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .add-camera {
          float: left;
          /* font-family: "Roboto"; */
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
          width: 86%;
          grid-template-columns: 30.6% 30.6% 30.6%;
          gap: 4%;
          padding: 0px 54px 25px;
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
        camera-model-icon-button {
          white-space: nowrap;
        }
        @media only screen and (max-width: 500px) {
          .search-bar {
            height: 55px;
            width: 85%;
            padding: 0px 25px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 10%;
            row-gap: 15%;
            width: 86%;
            padding: 0px 20px 25px;
          }
          camera-model-icon-button {
            width: 100%;
            text-align: center;
          }
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
    "camera-brand-dialog": HuiCreateDialogCameraBrand;
  }
}
