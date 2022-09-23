import { mdiPlus } from "@mdi/js";
import { html, PropertyValues, TemplateResult, css } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import "../frontend-release/src/resources/ha-style";
import "../frontend-release/src/components/search-input";
import "../frontend-release/src/components/ha-fab";
import { applyThemesOnElement } from "../frontend-release/src/common/dom/apply_themes_on_element";
import { fireEvent } from "../frontend-release/src/common/dom/fire_event";
import { makeDialogManager } from "../frontend-release/src/dialogs/make-dialog-manager";
import { HomeAssistant, Route } from "../frontend-release/src/types";
import { showCreateCameraDialog } from "./helpers/show-create-camera-dialog";
import { showDeleteCameraDialog } from "./helpers/show-delete-camera-dialog";
import { showEditCameraDialog } from "./helpers/show-edit-camera-dialog";
import { showModelOptionsDialog } from "./helpers/show-camera-models-dialog";
import { showCameraDialog } from "./helpers/show-camera-form-dialog";
import cameraDatabase from "./data/camera_database.json";
import { localize } from "./localize/localize";
import { getCameraEntities } from "./common";
import "./components/raceland-camera-card";
import "./components/new-camera-card";
import { cameraDashboardElement } from "./hacs";
import {
  cameraInfo,
  cameraCard,
  cameraModel,
  backEventOptions,
  schemaForm,
  CameraConfiguration,
} from "./data/types";

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

  @property({ attribute: false }) public registeredCameras!: any; //This can be part of the "hacs" object passed between dialogs.

  @state() private _filter = "";

  public connectedCallback() {
    super.connectedCallback();
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    this._applyTheme();

    this.addEventListener("update-camera-dashboard", () => {
      this._updateCameraDashboard();
    });

    this.addEventListener("add-new-camera", () => {
      showCreateCameraDialog(this, { database: cameraDatabase });
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

  protected _updateCameraDashboard() {
    this.registeredCameras = getCameraEntities(this.hass.states);
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
    if (!this.hass || !this.racelandDashoardData) {
      return html``;
    }

    if (this.registeredCameras === undefined) {
      this.registeredCameras = getCameraEntities(this.hass.states);
    }

    const filteredCameras = this._filterCameras(this.registeredCameras, this._filter);

    return html`
      <search-input
        .hass=${this.hass}
        .filter=${this._filter}
        @value-changed=${this._handleSearchChange}
        .label=${localize("search.cameras")}
      ></search-input>
      <div class="sep"></div>

      <div class="camera-list">
        ${filteredCameras.length === 0
          ? html`<new-camera-card .hass=${this.hass} .narrow=${this.narrow}> </new-camera-card>`
          : filteredCameras.map(
              (cam_info: cameraInfo) =>
                html` <raceland-camera-card
                  .hass=${this.hass}
                  .narrow=${this.narrow}
                  .record=${false}
                  .cameraInfo=${cam_info}
                ></raceland-camera-card>`
            )}
      </div>
      ${filteredCameras.length === 0
        ? html``
        : html`<ha-fab .label=${localize("common.camera")} extended @click=${this._addCamera} })}>
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
          </ha-fab>`}
    `;
  }

  private _handleSearchChange(ev: CustomEvent) {
    //Check hui-card-picker if more information is required
    this._filter = ev.detail.value;
  }

  private _addCamera() {
    fireEvent(this, "add-new-camera");
  }

  static get styles() {
    return css`
      .camera-list {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 1%;
      }
      .sep {
        padding-top: 2%;
      }
      search-input {
        display: block;
        --mdc-shape-small: var(--card-picker-search-shape);
        margin: var(--card-picker-search-margin);
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
      ha-fab {
        position: sticky;
        float: right;
        right: calc(16px + env(safe-area-inset-right));
        bottom: calc(20px + env(safe-area-inset-bottom));
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
