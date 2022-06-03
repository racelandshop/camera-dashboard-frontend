import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import "@material/mwc-button/mwc-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mdiClose, mdiPlus } from "@mdi/js";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import type { HassDialog } from "../../../homeassistant-frontend/src/dialogs/make-dialog-manager";
import { fireEvent } from "../../../homeassistant-frontend/src/common/dom/fire_event";
import "../search-input-round";
import "../../../homeassistant-frontend/src/components/ha-dialog";
import "../../../homeassistant-frontend/src/components/ha-header-bar";
import type { HomeAssistant } from "../../../homeassistant-frontend/src/types";
import { CreateCameraDialogParams } from "../../helpers/show-create-camera-dialog";
import { cameraBrand, cameraModel } from "../../data/types";
import type { HaFormSchema } from "../../../homeassistant-frontend/src/components/ha-form/types";
import "../camera-brand-icon-button";
import { localize } from "../../localize/localize";
import { schemaForm } from "../../data/types";

@customElement("add-camera-dialog")
export class HuiCreateDialogCamera
  extends LitElement
  implements HassDialog<CreateCameraDialogParams>
{
  @property({ attribute: false }) protected hass!: HomeAssistant;

  @state() private _cameraDatabase: any;

  @state() private _currTabIndex = 0;

  @state() private _filter = "";

  public async showDialog(params: CreateCameraDialogParams): Promise<void> {
    this._cameraDatabase = params.database.Manufacturer;
    console.log(this._cameraDatabase);
  }

  public closeDialog(): boolean {
    this._cameraDatabase = undefined;
    this._currTabIndex = 0;
    // this._selectedEntities = [];
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  private _filterBrands = memoizeOne((cameraDatabase, filter?: string) => {
    if (!filter) {
      return cameraDatabase;
    }
    let filteredBrands = cameraDatabase;
    const options: Fuse.IFuseOptions<cameraBrand> = {
      keys: ["name"], //Add the possibility to search for model or other keys (?)
      isCaseSensitive: false,
      minMatchCharLength: 1,
      threshold: 0.2,
    };
    const fuse = new Fuse(filteredBrands, options);
    filteredBrands = fuse.search(filter).map((result) => result.item);
    return filteredBrands;
  });

  private _customSchema = memoizeOne((integrationOptions): HaFormSchema[] => [
    {
      name: "integration",
      selector: {
        select: {
          options: integrationOptions,
          mode: "dropdown",
        },
      },
    },
    {
      name: "camera_name",
      selector: { text: {} },
    },
    {
      name: "static_image_url",
      selector: { text: {} },
    },
    {
      name: "stream_url",
      selector: { text: {} },
    },
    {
      type: "grid",
      name: "",
      schema: [
        {
          name: "username",
          selector: { text: {} },
        },
        {
          name: "password",
          selector: { text: {} },
        },
      ],
    },
    { name: "record_video_of_camera", selector: { boolean: {} } },
    // { name: "Advanced Options", selector: { boolean: {} } },
  ]);

  protected render(): TemplateResult {
    if (!this._cameraDatabase) {
      return html``;
    }

    const cameraDatabase = this._filterBrands(this._cameraDatabase, this._filter);

    return html`
      <ha-dialog
        open
        scrimClickAction
        hideActions
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
            .label=${localize("search.brands")}
          ></search-input-round>
        </div>

        <div class="brand-list">
          ${cameraDatabase.map((cameraBrandInfo: cameraBrand) => {
            return html`<camera-brand-icon-button
              .cameraBrandInfo=${cameraBrandInfo}
              .label=${cameraBrandInfo.name}
              .cameraModelList=${cameraBrandInfo.models}
              @click=${() => this._openCameraBrandDialog(cameraBrandInfo.models)}
            >
            </camera-brand-icon-button>`;
          })}
        </div>

        <div class="options">
          <mwc-button class="button-confirm" @click=${this._addCustomCamera}
            >${localize("common.custom_camera")}
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon
          ></mwc-button>
        </div>
      </ha-dialog>
    `;
  }

  private _openCameraBrandDialog(cameraModelsList) {
    fireEvent(this, "open-camera-brand-dialog", {
      modelsInfo: cameraModelsList,
    });
    this.closeDialog();
  }

  private _addCustomCamera(ev) {
    const form_schema = {
      header: { title: localize("common.add_camera") },
      body: this._customSchema(["generic", "MPJEG"]),
      footer: {
        back: localize("common.go_back"),
        accept: localize("common.add_camera"),
      },
    };

    fireEvent(this, "open-camera-add-camera-form", {
      cameraModelInfo: {} as cameraModel,
      schema: form_schema,
      back: true,
      event: { event_name: "add-new-camera", data: this._cameraDatabase },
    });
    this.closeDialog();
  }

  private _handleSearchChange(ev: CustomEvent) {
    //Check hui-card-picker more information is required
    this._filter = ev.detail.value;
  }

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _ignoreKeydown(ev: KeyboardEvent) {
    ev.stopPropagation();
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
        .search-bar {
          height: 80px;
          padding: 60px 45px 20px 45px;
        }
        search-input-round {
          float: right;
          display: block;
          width: 50%;
          margin-right: 10%;
          /* margin-left: 20px;
          margin-bottom: 20px;
          padding: 5px 5px 5px 5px;
          border: 1px solid #4109a8;
          border-radius: 16px; */
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
    "add-camera-dialog": HuiCreateDialogCamera;
  }
}
