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
      <button
        .ariaLabel=${this.label}
        .title=${this.hideTitle ? "" : this.label}
        .disabled=${this.disabled}
      >
        ${this.hideTitle ? "" : this.label}
      </button>
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
      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        border-radius: 25px;
        border: 2px solid var(--secondary-text-color);
        padding: 27px;
        text-align: center;
        cursor: pointer;
        background-color: var(--card-background-color);
        font-size: 1rem;
        display: flex;
        justify-content: center;
        color: var(--primary-text-color);
      }
      @media only screen and (max-width: 500px) {
        button {
          padding: 20px;
          display: table-cell;
          vertical-align: middle;
          width: 34vw;
          border-radius: 25px;
          border: 2px solid var(--secondary-text-color);
          cursor: pointer;
          background-color: var(--card-background-color);
          font-size: 1rem;
          white-space: nowrap;
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "camera-model-icon-button": CameraModelIconButton;
  }
}
