import "@material/mwc-button/mwc-button";
import "@material/mwc-button/mwc-button";
import { mdiCamera } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../../frontend-release/src/components/ha-card";
import "../../frontend-release/src/components/ha-chip";
import "../../frontend-release/src/components/ha-icon";
import "../../frontend-release/src/components/ha-svg-icon";
import "../../frontend-release/src/components/button-recorder";
import { HomeAssistant } from "../../frontend-release/src/types";
import { fireEvent } from "../../frontend-release/src/common/dom/fire_event";
import "./camera-button-menu";
import { HacsStyles } from "../styles/hacs-common-style";
import { cameraInfo } from "../data/types";

@customElement("raceland-camera-card")
export class racelandCameraCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public cameraInfo!: cameraInfo;

  @property({ type: Boolean }) public record!: boolean;

  @property({ type: Boolean }) public narrow!: boolean;

  protected render(): TemplateResult | void {
    return html`
      <ha-card narrow=${this.narrow}>
        <div class="top-row">
          <!-- <button-recorder> @click=${this.handleRecord} </button-recorder> -->
          <camera-button-menu
            .hass=${this.hass}
            .cameraInfo=${this.cameraInfo}
          ></camera-button-menu>
        </div>
        <ha-svg-icon
          class="main-camera-icon"
          path=${mdiCamera}
          @click=${this.more_info}
        ></ha-svg-icon>
        <div class="card-title">${this.cameraInfo.name}</div>
      </ha-card>
    `;
  }

  private more_info(ev) {
    const entityId = this.cameraInfo.entityID;
    fireEvent(this, "more-info-camera", { entityId: entityId });
  }

  private handleRecord(ev) {
    //For not only changes the record attribute (changes colors in the frontend)
    this.record = !this.record;
  }

  static get styles(): CSSResultGroup {
    return [
      HacsStyles,
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
        ha-svg-icon {
          cursor: pointer;
        }
        .top-row {
          width: 100%;
          height: 20%;
          display: inline-block;
        }
        .record-on {
          float: left;
          cursor: pointer;
          color: #ff4747;
        }
        .record-off {
          float: left;
          cursor: pointer;
          color: #00ff00;
        }
        camera-button-menu {
          float: right;
        }
        .main-camera-icon {
          width: 70%;
          height: 60%;
        }
        .card-title {
          font-size: 1.1rem;
          width: 135px;
          font-weight: bold;
          white-space: nowrap;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          justify-content: space-between;
        }

        @media only screen and (max-width: 500px) {
          .card-title {
            font-size: 1.2rem;
            width: 137px;
            overflow: hidden;
            font-weight: bold;
            white-space: nowrap;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            justify-content: space-between;
          }
        }
        .card-content {
          width: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4% 0px;
          font-size: 1.2rem;
          height: 100%;
          box-sizing: border-box;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
        }

        .card-actions {
          border-top: none;
          bottom: 0;
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
          align-items: center;
          padding: 5px;
        }
        .group-header {
          height: auto;
          align-content: center;
        }
        .group-header h1 {
          margin: 0;
          padding: 8px 16px;
          font-size: 22px;
        }
        h1 {
          margin-top: 0;
          min-height: 24px;
        }

        .pointer {
          cursor: pointer;
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
    "raceland-camera-card": racelandCameraCard;
  }
}
