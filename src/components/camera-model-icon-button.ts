import "@material/mwc-icon-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { cameraBrand } from "../data/types";

@customElement("camera-model-icon-button")
export class CameraModelIconButton extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) label = "";

  @property({ attribute: false }) cameraModelInfo?: cameraBrand;

  @property({ type: Boolean }) hideTitle = false;

  static shadowRootOptions: ShadowRootInit = {
    mode: "open",
    delegatesFocus: true,
  };

  protected render(): TemplateResult {
    return html`
      <mwc-icon-button
        .ariaLabel=${this.label}
        .title=${this.hideTitle ? "" : this.label}
        .disabled=${this.disabled}
      >
        ${this.hideTitle ? "" : this.label}
      </mwc-icon-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: inline-block;
        outline: none;
      }
      :host([disabled]) {
        pointer-events: none;
      }
      mwc-icon-button {
        width: 100%;
        border-radius: 25px;
        border: 2px solid #73ad21;
        padding: 20px 20px 20px 20px;
        text-align: center;
        cursor: pointer;
        --mdc-theme-on-primary: currentColor;
        --mdc-theme-text-disabled-on-light: var(--disabled-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "camera-model-icon-button": CameraModelIconButton;
  }
}
