import { mdiPlus } from "@mdi/js";
import { html, PropertyValues, TemplateResult, css } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { applyThemesOnElement } from "../homeassistant-frontend/src/common/dom/apply_themes_on_element";
import { mainWindow } from "../homeassistant-frontend/src/common/dom/get_main_window";
import { fireEvent } from "../homeassistant-frontend/src/common/dom/fire_event";
import { isNavigationClick } from "../homeassistant-frontend/src/common/dom/is-navigation-click";
import { navigate } from "../homeassistant-frontend/src/common/navigate";
import { makeDialogManager } from "../homeassistant-frontend/src/dialogs/make-dialog-manager";
import "../homeassistant-frontend/src/resources/ha-style";
import "../homeassistant-frontend/src/components/search-input";
import "../homeassistant-frontend/src/components/ha-fab";
import { HomeAssistant, Route } from "../homeassistant-frontend/src/types";
import "./components/dialogs/hacs-event-dialog";
import "./components/raceland-camera-card";
import "./components/new-camera-card";
import { HacsDialogEvent, HacsDispatchEvent, LocationChangedEvent } from "./data/common";
import {
  getConfiguration,
  getCritical,
  getLovelaceConfiguration,
  getRemovedRepositories,
  getRepositories,
  getStatus,
  websocketSubscription,
} from "./data/websocket";
import type { HaFormSchema } from "./../homeassistant-frontend/src/components/ha-form/types";
import memoizeOne from "memoize-one";
import Fuse from "fuse.js";
import { HacsElement } from "./hacs";
import "./hacs-router";
import { cameraCard, cameraModel, backEventOptions, schemaForm } from "./data/types";
import { showCreateCameraDialog } from "./helpers/show-create-camera-dialog";
import { showDeleteCameraDialog } from "./helpers/show-delete-camera-dialog ";
import { showModelOptionsDialog } from "./helpers/show-camera-models-dialog";
import { showCameraDialog } from "./helpers/show-camera-form-dialog";
// import { HacsStyles } from "./styles/hacs-common-style";
// import { hacsStyleVariables } from "./styles/variables";
import cameraDatabase from "./data/camera_database.json";
import { localize } from "./localize/localize";

declare global {
  // for fire event
  interface HASSDomEvents {
    "add-new-camera": undefined;
    "delete-camera": { cameraInfo: any }; //TODO: add type hint
    "open-camera-brand-dialog": {
      modelsInfo?: Array<cameraModel>;
    };
    "open-camera-add-camera-form": {
      cameraModelInfo: cameraModel;
      schema: schemaForm;
      back: true;
      event: backEventOptions;
    };
  }
}

@customElement("hacs-frontend")
class cameraFrontend extends HacsElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public narrow!: boolean;

  @property({ attribute: false }) public route!: Route;

  @state() private _filter = "";

  // @query("#hacs-dialog") private _hacsDialog?: any;

  // @query("#hacs-dialog-secondary") private _hacsDialogSecondary?: any;

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    this._applyTheme();

    this.hacs.language = this.hass.language;
    this.addEventListener("hacs-location-changed", (e) =>
      this._setRoute(e as LocationChangedEvent)
    );

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
        back: ev.detail.back,
        event: ev.detail.event,
      });
    });

    this.addEventListener("delete-camera", (ev) => {
      showDeleteCameraDialog(this, { cameraInfo: ev.detail.cameraInfo });
    });

    // websocketSubscription(
    //   this.hass,
    //   () => this._updateProperties("configuration"),
    //   HacsDispatchEvent.CONFIG
    // );

    // websocketSubscription(
    //   this.hass,
    //   () => this._updateProperties("status"),
    //   HacsDispatchEvent.STATUS
    // );

    // websocketSubscription(
    //   this.hass,
    //   () => this._updateProperties("status"),
    //   HacsDispatchEvent.STAGE
    // );

    // websocketSubscription(
    //   this.hass,
    //   () => this._updateProperties("repositories"),
    //   HacsDispatchEvent.REPOSITORY
    // );

    // this.hass.connection.subscribeEvents(
    //   async () => this._updateProperties("lovelace"),
    //   "lovelace_updated"
    // );
    // this._updateProperties();
    // if (this.route.path === "") {
    //   navigate("/hacs/entry", { replace: true });
    // }

    // window.addEventListener("haptic", (ev) => {
    //   // @ts-ignore
    //   fireEvent(window.parent, ev.type, ev.detail, {
    //     bubbles: false,
    //   });
    // });

    document.body.addEventListener("click", (ev) => {
      const href = isNavigationClick(ev);
      if (href) {
        navigate(href);
      }
    });

    mainWindow.addEventListener("location-changed", (ev) =>
      // @ts-ignore
      fireEvent(this, ev.type, ev.detail, {
        bubbles: false,
      })
    );

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

  private async _updateProperties(prop = "all") {
    //Likely uselles, remove later
    const _updates: any = {};
    const _fetch: any = {};

    if (prop === "all") {
      [
        _fetch.repositories,
        _fetch.configuration,
        _fetch.status,
        _fetch.critical,
        _fetch.resources,
        _fetch.removed,
      ] = await Promise.all([
        getRepositories(this.hass),
        getConfiguration(this.hass),
        getStatus(this.hass),
        getCritical(this.hass),
        getLovelaceConfiguration(this.hass),
        getRemovedRepositories(this.hass),
      ]);
    } else if (prop === "configuration") {
      _fetch.configuration = await getConfiguration(this.hass);
    } else if (prop === "status") {
      _fetch.status = await getStatus(this.hass);
    } else if (prop === "repositories") {
      _fetch.repositories = await getRepositories(this.hass);
    } else if (prop === "lovelace") {
      _fetch.resources = await getLovelaceConfiguration(this.hass);
    }

    Object.keys(_fetch).forEach((update) => {
      if (_fetch[update] !== undefined) {
        _updates[update] = _fetch[update];
      }
    });
    if (_updates) {
      this._updateHacs(_updates);
    }
  }

  private _filterCameras = memoizeOne((cameras, filter?: string) => {
    if (!filter) {
      return cameras;
    }
    let filteredCameras = cameras;
    const options: Fuse.IFuseOptions<cameraCard> = {
      keys: ["name"], //Add the possibility to search for IP adresses, modelo, manufactor, etc (?)
      isCaseSensitive: false,
      minMatchCharLength: 1,
      threshold: 0.2,
    };
    const fuse = new Fuse(filteredCameras, options);
    filteredCameras = fuse.search(filter).map((result) => result.item);
    return filteredCameras;
    // return cardElements.filter((cardElement: CardElement) => cards.includes(cardElement.card));
  });

  protected render(): TemplateResult | void {
    if (!this.hass || !this.hacs) {
      return html``;
    }

    // let dummie_camera_info = [
    //   { name: "Raceland 2" },
    //   { name: "Raceland 3" },
    //   { name: "Raceland 1" },
    //   { name: "Test 4" },
    //   { name: "Test 5" },
    //   { name: "Test 6" },
    //   { name: "Marca 1 camera 1" },
    //   { name: "Marca 1 camera 2" },
    //   { name: "Marca 2 camera 1" },
    // ]; //For testing purposes, list of camera avaiable in the

    let dummie_camera_info = [];

    dummie_camera_info = this._filterCameras(dummie_camera_info, this._filter);

    return html`
      <search-input
        .hass=${this.hass}
        .filter=${this._filter}
        @value-changed=${this._handleSearchChange}
        .label=${localize("search.cameras")}
      ></search-input>
      <div class="sep"></div>

      <div class="camera-list">
        ${dummie_camera_info.length === 0
          ? html`<new-camera-card .hass=${this.hass} .narrow=${this.narrow}> </new-camera-card>`
          : dummie_camera_info.map(
              (cam_info) =>
                html` <raceland-camera-card
                  .hass=${this.hass}
                  .narrow=${this.narrow}
                  .record=${false}
                  .cameraInfo=${cam_info}
                ></raceland-camera-card>`
            )}
      </div>
      ${dummie_camera_info.length === 0
        ? html``
        : html`<ha-fab .label=${localize("common.camera")} extended @click=${this._addCamera} })}>
            <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
          </ha-fab>`}
    `;
  }

  private _handleSearchChange(ev: CustomEvent) {
    //Check hui-card-picker more information is required
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

  private _showDialog(ev: HacsDialogEvent): void {
    const dialogParams = ev.detail;
    this._hacsDialog.active = true;
    this._hacsDialog.params = dialogParams;
    this.addEventListener("hacs-dialog-closed", () => (this._hacsDialog.active = false));
  }

  private _showDialogSecondary(ev: HacsDialogEvent): void {
    const dialogParams = ev.detail;
    this._hacsDialogSecondary.active = true;
    this._hacsDialogSecondary.secondary = true;
    this._hacsDialogSecondary.params = dialogParams;
    this.addEventListener(
      "hacs-secondary-dialog-closed",
      () => (this._hacsDialogSecondary.active = false)
    );
  }

  private _setRoute(ev: LocationChangedEvent): void {
    if (!ev.detail?.route) {
      return;
    }
    this.route = ev.detail.route;
    navigate(this.route.path, { replace: true });
    this.requestUpdate();
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
