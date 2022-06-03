import "@material/mwc-icon-button";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import { cameraModel } from "../data/types";

@customElement("camera-brand-icon-button")
export class CameraBrandIconButton extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) svgPath?: string; //Check How I can fecth the icon from local storage

  @property({ type: String }) label? = "";

  @property({ attribute: false }) cameraModelList?: Array<cameraModel>;

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
        ${this.svgPath
          ? html`<img src=${this.svgPath} alt="Brand Icon" />`
          : html`${this.hideTitle ? "" : this.label}`}
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
    "camera-brand-icon-button": CameraBrandIconButton;
  }
}
