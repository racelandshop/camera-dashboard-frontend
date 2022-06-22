import "@material/mwc-button/mwc-button";
import "@material/mwc-button/mwc-button";
import { mdiPlusCircle } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../homeassistant-frontend/src/common/dom/fire_event";
import "../../homeassistant-frontend/src/components/ha-card";
import "../../homeassistant-frontend/src/components/ha-chip";
import "../../homeassistant-frontend/src/components/ha-icon";
import "../../homeassistant-frontend/src/components/ha-svg-icon";
import "./camera-button-menu";
import { HomeAssistant } from "../../homeassistant-frontend/src/types";
import { localize } from "../localize/localize";

@customElement("new-camera-card")
export class newCameraCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow!: boolean;

  protected render(): TemplateResult | void {
    return html`
      <ha-card class="new-camera" narrow=${this.narrow}>
        <ha-svg-icon
          @click=${this._openAddCameraDialog}
          class="new-camera-icon"
          path=${mdiPlusCircle}
        ></ha-svg-icon>
        <div class="card-title">${localize("common.add_camera")}</div>
      </ha-card>
    `;
  }

  private _openAddCameraDialog(ev) {
    fireEvent(this, "add-new-camera");
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        ha-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
          align-items: center;
          text-align: center;
          padding: 1% 1% 1% 1%;
          height: 100%;
          font-size: 1.2rem;
        }

        .new-camera-icon {
          width: 60%;
          height: 60%;
          color: #7b7b7b;
          margin-top: 20px;
          cursor: pointer;
        }

        .new-camera-icon:hover {
          color: #8660e0;
          width: 60%;
          height: 60%;
          margin-top: 20px;
          cursor: pointer;
        }

        .card-title {
          display: flex;
          justify-content: space-between;
        }

        .description {
          opacity: var(--dark-primary-opacity);
          font-size: 14px;
          padding: 8px 16px;
        }

        .status-new {
          border-color: var(--hcv-color-new);
          --mdc-theme-primary: var(--hcv-color-new);
        }

        .status-update {
          border-color: var(--hcv-color-update);
        }

        .status-issue {
          border-color: var(--hcv-color-error);
        }

        .new-header {
          background-color: var(--hcv-color-new);
          color: var(--hcv-text-color-on-background);
        }

        .issue-header {
          background-color: var(--hcv-color-error);
          color: var(--hcv-text-color-on-background);
        }

        .update-header {
          background-color: var(--hcv-color-update);
          color: var(--hcv-text-color-on-background);
        }

        .default-header {
          padding: 2px 0 !important;
        }

        mwc-button.update-header {
          --mdc-theme-primary: var(--hcv-color-update);
          --mdc-theme-on-primary: var(--hcv-text-color-on-background);
        }

        .status-border {
          border-style: solid;
          border-width: min(var(--ha-card-border-width, 1px), 10px);
        }

        .status-header {
          top: 0;
          padding: 6px 1px;
          margin: -1px;
          width: 100%;
          font-weight: 500;
          text-align: center;
          left: 0;
          border-top-left-radius: var(--ha-card-border-radius, 4px);
          border-top-right-radius: var(--ha-card-border-radius, 4px);
        }

        ha-card[narrow] {
          width: calc(100% - 24px);
          margin: 11px;
        }

        ha-chip {
          padding: 4px;
          margin-top: 3px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "new-camera-card": newCameraCard;
  }
}
