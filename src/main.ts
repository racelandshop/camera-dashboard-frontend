import { mdiDotsVertical, mdiMagnify, mdiPlus } from "@mdi/js";
import { html, PropertyValues, TemplateResult, css } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import "../frontend-release/src/resources/ha-style";
import "../frontend-release/src/components/search-input";
import "../frontend-release/src/components/ha-fab";
import { showDialog } from "../frontend-release/src/dialogs/make-dialog-manager";
import { applyThemesOnElement } from "../frontend-release/src/common/dom/apply_themes_on_element";
import { fireEvent } from "../frontend-release/src/common/dom/fire_event";
import { makeDialogManager } from "../frontend-release/src/dialogs/make-dialog-manager";
import { HomeAssistant, Route } from "../frontend-release/src/types";
import { showCreateCameraDialog } from "./helpers/show-create-camera-dialog";
import { showDeleteCameraDialog } from "./helpers/show-delete-camera-dialog";
import { showEditCameraDialog } from "./helpers/show-edit-camera-dialog";
import { showModelOptionsDialog } from "./helpers/show-camera-models-dialog";
import { showCameraDialog } from "./helpers/show-camera-form-dialog";
import { localize } from "./localize/localize";
import { getCameraEntities } from "./common";
import "./components/raceland-camera-card";
import "./components/new-camera-card";
import { cameraDashboardElement } from "./hacs";
import "@polymer/app-layout/app-header/app-header";
import "../frontend-release/src/layouts/ha-app-layout";
import {
  cameraInfo,
  cameraCard,
  cameraModel,
  backEventOptions,
  schemaForm,
  CameraConfiguration,
} from "./data/types";
import { fetchCameraDatabase, fetchCameraInformation, fetchCameraList } from "./data/websocket";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "../frontend-release/src/components/ha-icon-button-arrow-prev";
import { showQuickBar } from "../frontend-release/src/dialogs/quick-bar/show-dialog-quick-bar";
import { classMap } from "lit/directives/class-map";

declare global {
  // for fire event
  interface HASSDomEvents {
    "add-new-camera": undefined;
    "delete-camera": { cameraInfo: cameraInfo };
    "edit-camera": { cameraInfo: cameraInfo };
    "open-camera-brand-dialog": {
      modelsInfo?: Array<cameraModel>;
    };
    "open-camera-add-camera-form": {
      cameraModelInfo: cameraModel;
      data: CameraConfiguration;
      schema: schemaForm;
      formType: string;
      backEvent: backEventOptions;
    };
    "update-camera-dashboard": undefined;
  }
}

@customElement("cameras-dashboard")
class cameraFrontend extends cameraDashboardElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public registeredCameras!: any;

  @property({ attribute: false }) public newCameras!: any;

  @property({ attribute: false }) public cameraDatabase: any;

  @property({ attribute: false }) public cameraInfo!: cameraInfo;

  @property({ attribute: false }) public cameraList!: any;

  @state() private ids: any;

  @state() private _filter = "";

  public connectedCallback() {
    super.connectedCallback();
  }

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    this.cameraDatabase = await fetchCameraDatabase(this.hass);
    this.cameraList = await fetchCameraList(this.hass);

    this._applyTheme();

    this.addEventListener("more-info-camera", (ev) => {
      this._handleMoreInfoCamera(ev);
    });

    this.addEventListener("update-camera-dashboard", () => {
      this._updateCameraDashboard();
    });

    this.addEventListener("add-new-camera", () => {
      showCreateCameraDialog(this, { database: this.cameraDatabase });
    });

    this.addEventListener("open-camera-brand-dialog", (ev) => {
      showModelOptionsDialog(this, {
        modelsInfo: ev.detail.modelsInfo,
      });
    });

    this.addEventListener("open-camera-add-camera-form", (ev) => {
      showCameraDialog(this, {
        cameraModelInfo: ev.detail.cameraModelInfo,
        schema: ev.detail.schema,
        data: ev.detail.data,
        formType: ev.detail.formType,
        backEvent: ev.detail.backEvent,
      });
    });

    this.addEventListener("delete-camera", (ev) => {
      showDeleteCameraDialog(this, { cameraInfo: ev.detail.cameraInfo });
    });

    this.addEventListener("edit-camera", (ev) => {
      showEditCameraDialog(this, { cameraInfo: ev.detail.cameraInfo });
    });

    makeDialogManager(this, this.shadowRoot!);
  }

  private async _handleMoreInfoCamera(ev) {
    showDialog(
      this,
      this.shadowRoot!,
      "ha-more-info-dialog",
      {
        entityId: ev.detail.entityId,
      },
      () => import("../frontend-release/src/dialogs/more-info/ha-more-info-dialog")
    );
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (!oldHass) {
      return;
    }
    if (oldHass.themes !== this.hass.themes) {
      this._applyTheme();
    }
  }

  protected async _updateCameraDashboard() {
    this.registeredCameras = getCameraEntities(this.hass.states);
    this.cameraList = await fetchCameraList(this.hass);
  }

  private _filterCameras = memoizeOne((cameras, filter?: string) => {
    if (!filter) {
      return cameras;
    }
    let filteredCameras = cameras;
    const options: Fuse.IFuseOptions<cameraCard> = {
      keys: ["name"],
      isCaseSensitive: false,
      minMatchCharLength: 1,
      threshold: 0.2,
    };
    const fuse = new Fuse(filteredCameras, options);
    filteredCameras = fuse.search(filter).map((result) => result.item);
    return filteredCameras;
  });

  protected render(): TemplateResult | void {
    this._showQuickBar();
    if (!this.hass || !this.racelandDashoardData) {
      return html``;
    }

    if (this.registeredCameras === undefined) {
      this.registeredCameras = getCameraEntities(this.hass.states);
    }

    if (this.registeredCameras && this.cameraList) {
      for (let i = 0; i < this.registeredCameras.length; i++) {
        for (let j = 0; j < this.cameraList.length; j++) {
          if (this.registeredCameras[i].name == this.cameraList[j].name) {
            this.cameraList[j].entityID = this.registeredCameras[i].entityID;
          }
        }
      }
    }
    const filteredCameras = this._filterCameras(this.cameraList, this._filter);

    return html`
      ${window.screen.width <= 900
        ? html`
            <div id="header">
              <app-header fixed slot="header">
                <app-toolbar>
                  <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
                </app-toolbar>
              </app-header>
              <search-input
                .hass=${this.hass}
                .filter=${this._filter}
                @value-changed=${this._handleSearchChange}
                .label=${localize("search.cameras")}
              ></search-input>
            </div>
          `
        : html`
            <search-input
              .hass=${this.hass}
              .filter=${this._filter}
              @value-changed=${this._handleSearchChange}
              .label=${localize("search.cameras")}
            ></search-input>
          `}
      <div class="sep"></div>
      <div class="content">
        <div class="contentFather">
          <div
            class=${classMap({
              "camera-list": filteredCameras?.length !== 0,
              "camera-list-one": filteredCameras?.length === 0,
            })}
          >
            ${filteredCameras?.length === 0
              ? html`<new-camera-card .hass=${this.hass} .narrow=${this.narrow}> </new-camera-card>`
              : filteredCameras?.map(
                  (cam_info: any) =>
                    html`
                      <raceland-camera-card
                        .hass=${this.hass}
                        .narrow=${this.narrow}
                        .record=${false}
                        .cameraInfo=${cam_info}
                      ></raceland-camera-card>
                    `
                )}
          </div>
        </div>
      </div>
      ${filteredCameras?.length === 0
        ? html``
        : html`<ha-fab .label=${localize("common.camera")} extended @click=${this._addCamera} })}>
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
          </ha-fab>`}
    `;
  }

  private _showQuickBar(): void {
    showQuickBar(this, {
      commandMode: true,
      hint: this.hass.localize("ui.dialogs.quick-bar.key_c_hint"),
    });
  }

  private _handleSearchChange(ev: CustomEvent) {
    //Check hui-card-picker if more information is required
    this._filter = ev.detail.value;
    console.log("filter", this._filter);
  }

  private _addCamera() {
    fireEvent(this, "add-new-camera");
  }

  static get styles() {
    return css`
      raceland-camera-card {
        display: flex;
        flex-direction: column;
        height: 80%;
        width: 100%;
        border-style: solid;
        border-width: min(var(--ha-card-border-width, 1px), 10px);
        border-color: transparent;
        border-radius: var(--ha-card-border-radius, 4px);
      }
      .camera-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        grid-auto-rows: 160px;
      }
      search-input {
        display: block;
        --mdc-shape-small: var(--card-picker-search-shape);
        margin: var(--card-picker-search-margin);
        height: 55px;
        width: 100%;
      }
      new-camera-card {
        background-color: var(--card-background-color, white);
        box-shadow: var(
          --mdc-fab-box-shadow,
          0px 3px 5px -1px rgba(0, 0, 0, 0.2),
          0px 6px 10px 0px rgba(0, 0, 0, 0.14),
          0px 1px 18px 0px rgba(0, 0, 0, 0.12)
        );
        font-family: Arial;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        font-size: 2.3rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 550;
        max-width: 400px;
      }
      ha-menu-button {
        color: var(--primary-text-color);
      }
      .camera-list-one {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-left: 4px;
        margin-right: 4px;
      }
      /* @media only screen and (max-width: 1200px) {
        search-input {
          width: 100%;
          height: 55px;
        }
      } */
      @media only screen and (max-width: 900px) {
        .camera-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(178px, 1fr));
          grid-auto-rows: 130px;
          row-gap: 3%;
          margin-bottom: 15%;
          margin-right: 3px;
        }
        #header {
          display: flex;
          background-color: var(--card-background-color);
          height: 55px;
        }
        app-toolbar {
          padding: 0 12px;
        }
        search-input {
          width: 100%;
          height: 55px;
        }
        raceland-camera-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          border-style: solid;
          border-width: min(var(--ha-card-border-width, 1px), 10px);
          border-color: transparent;
          border-radius: var(--ha-card-border-radius, 4px);
        }
      }

      ha-quick-bar {
        display: none;
      }
      .sep {
        padding-top: 2%;
      }
      .content {
        width: 99.5%;
        height: 720px;
      }
      ha-fab {
        position: fixed;
        float: right;
        right: calc(16px + env(safe-area-inset-right));
        bottom: calc(16px + env(safe-area-inset-bottom));
        z-index: 1;
      }
    `;
  }

  private _applyTheme() {
    let options: Partial<HomeAssistant["selectedTheme"]> | undefined;

    const themeName =
      this.hass.selectedTheme?.theme ||
      (this.hass.themes.darkMode && this.hass.themes.default_dark_theme
        ? this.hass.themes.default_dark_theme!
        : this.hass.themes.default_theme);

    options = this.hass.selectedTheme;
    if (themeName === "default" && options?.dark === undefined) {
      options = {
        ...this.hass.selectedTheme,
      };
    }

    if (this.parentElement) {
      applyThemesOnElement(this.parentElement, this.hass.themes, themeName, {
        ...options,
        dark: this.hass.themes.darkMode,
      });
      this.parentElement.style.backgroundColor = "var(--primary-background-color)";
    }
  }
}
