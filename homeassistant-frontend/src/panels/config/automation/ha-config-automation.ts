import { HassEntities } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { debounce } from "../../../common/util/debounce";
import { AutomationEntity } from "../../../data/automation";
import {
  HassRouterPage,
  RouterOptions,
} from "../../../layouts/hass-router-page";
import { HomeAssistant } from "../../../types";
import "./ha-automation-editor";
import "./ha-automation-picker";

const equal = (a: AutomationEntity[], b: AutomationEntity[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((automation, index) => automation === b[index]);
};

const excludeAutomations = [
  "automation.themes",
  "automation.set_theme_at_startup",
  "automation.avaiable_wallpaper_update",
  "automation.avaiable_wallpaper_update_on_ha_start",
  "automation.create_dashboard",
  "automation.delete_dashboard",
  "automation.populate_view_input_select_after_picking_a_dashboard",
  "automation.update_dropdown_menu_in_for_dashboards_when_a_dashboard_file_is_created",
  "automation.update_dropdown_menu_in_for_dashboards_when_a_dashboard_file_is_moved",
  "automation.update_dropdown_menu_in_import_dashboard_when_ha_starts",
  "automation.wallpaper_selector",
  "automation.update_dropdown_menu_in_for_dashboards_when_a_dashboard_file_is_deleted",
  "automation.import_a_lovelace_dashboard_to_homekit_infused",
  "",
  "",
  "",
];

@customElement("ha-config-automation")
class HaConfigAutomation extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public narrow!: boolean;

  @property() public isWide!: boolean;

  @property() public showAdvanced!: boolean;

  @property() public automations: AutomationEntity[] = [];

  private _debouncedUpdateAutomations = debounce((pageEl) => {
    const newAutomations = this._getAutomations(this.hass.states);
    if (!equal(newAutomations, pageEl.automations)) {
      pageEl.automations = newAutomations;
    }
  }, 10);

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "ha-automation-picker",
        cache: true,
      },
      edit: {
        tag: "ha-automation-editor",
      },
      trace: {
        tag: "ha-automation-trace",
        load: () => import("./ha-automation-trace"),
      },
    },
  };

  private _getAutomations = memoizeOne(
    (states: HassEntities): AutomationEntity[] =>
      Object.values(states).filter(
        (entity) =>
          computeStateDomain(entity) === "automation" &&
          !excludeAutomations.includes(entity.entity_id)
      ) as AutomationEntity[]
  );

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.hass.loadBackendTranslation("device_automation");
  }

  protected updatePageEl(pageEl, changedProps: PropertyValues) {
    pageEl.hass = this.hass;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.route = this.routeTail;
    pageEl.showAdvanced = this.showAdvanced;

    if (this.hass) {
      if (!pageEl.automations || !changedProps) {
        pageEl.automations = this._getAutomations(this.hass.states);
      } else if (changedProps.has("hass")) {
        this._debouncedUpdateAutomations(pageEl);
      }
    }

    if (
      (!changedProps || changedProps.has("route")) &&
      this._currentPage !== "dashboard"
    ) {
      const automationId = this.routeTail.path.substr(1);
      pageEl.automationId = automationId === "new" ? null : automationId;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-automation": HaConfigAutomation;
  }
}
