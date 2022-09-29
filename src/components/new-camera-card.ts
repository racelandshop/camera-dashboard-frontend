import "@material/mwc-button/mwc-button";
import "@material/mwc-button/mwc-button";
import { RippleHandlers } from "@material/mwc-ripple/ripple-handlers";
import { mdiPlus } from "@mdi/js";
import type { Ripple } from "@material/mwc-ripple";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state, queryAsync, eventOptions } from "lit/decorators";
import { fireEvent } from "../../frontend-release/src/common/dom/fire_event";
import "../../frontend-release/src/components/ha-card";
import "../../frontend-release/src/components/ha-chip";
import "../../frontend-release/src/components/ha-icon";
import "../../frontend-release/src/components/ha-svg-icon";
import "./camera-button-menu";
import { HomeAssistant } from "../../frontend-release/src/types";
import { localize } from "../localize/localize";

@customElement("new-camera-card")
export class newCameraCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow!: boolean;

  @state() private _shouldRenderRipple = false;

  @queryAsync("mwc-ripple") private _ripple!: Promise<Ripple | null>;

  protected render(): TemplateResult | void {
    return html`
      <ha-card
        @click=${this._openAddCameraDialog}
        class="add-new-camera"
        @focus=${this.handleRippleFocus}
        @blur=${this.handleRippleBlur}
        @mousedown=${this.handleRippleActivate}
        @mouseup=${this.handleRippleDeactivate}
        @touchstart=${this.handleRippleActivate}
        @touchend=${this.handleRippleDeactivate}
        @touchcancel=${this.handleRippleDeactivate}
      >
        <ha-svg-icon .path=${mdiPlus} id="icon"></ha-svg-icon>
        <div id="text">${localize("common.add_camera")}</div>
        ${this._shouldRenderRipple ? html`<mwc-ripple></mwc-ripple>` : ""}
      </ha-card>
    `;
  }

  private _openAddCameraDialog(ev) {
    fireEvent(this, "add-new-camera");
  }

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this._shouldRenderRipple = true;
    return this._ripple;
  });

  @eventOptions({ passive: true })
  private handleRippleActivate(evt?: Event) {
    this._rippleHandlers.startPress(evt);
  }

  private handleRippleDeactivate() {
    this._rippleHandlers.endPress();
  }

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }

  private handleRippleBlur() {
    this._rippleHandlers.endFocus();
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

        .add-new-camera {
          background-color: var(--card-background-color, white);
          box-shadow: var(
            --mdc-fab-box-shadow,
            0px 3px 5px -1px rgba(0, 0, 0, 0.2),
            0px 6px 10px 0px rgba(0, 0, 0, 0.14),
            0px 1px 18px 0px rgba(0, 0, 0, 0.12)
          );
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4% 0;
          font-size: 2.3rem;
          height: 100%;
          box-sizing: border-box;
          justify-content: center;
          position: relative;
          overflow: hidden;
          border-radius: 1.5rem;
          font-weight: 450;
        }
        #text {
          text-align: center;
          margin-top: 10%;
          width: 60%;
          font-size: 2rem;
          font-weight: 450;
        }
        .add-new-camera:hover > #icon {
          background-color: var(--sidebar-selected-icon-color);
        }
        .add-new-camera:hover > #text {
          color: var(--sidebar-selected-icon-color);
        }
        #icon {
          background-color: rgb(144, 144, 145);
          color: white;
          border-radius: 100%;
          width: 30%;
          height: auto;
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
