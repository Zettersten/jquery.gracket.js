import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

/**
 * Web Component wrapper for Gracket
 * Standards-compliant custom element with Shadow DOM support
 * 
 * @example
 * ```html
 * <gracket-bracket id="my-bracket"></gracket-bracket>
 * 
 * <script>
 *   const bracket = document.getElementById('my-bracket');
 *   bracket.data = tournamentData;
 * </script>
 * ```
 */
export class GracketElement extends HTMLElement {
  private gracketInstance: Gracket | null = null;
  private container: HTMLDivElement | null = null;
  private _data: TournamentData = [];
  private _options: Omit<GracketOptions, 'src'> = {};
  declare shadowRoot: ShadowRoot;

  // Observed attributes for reactive updates
  static get observedAttributes() {
    return ['data', 'corner-radius', 'canvas-line-color', 'show-bye-games'];
  }

  constructor() {
    super();
    
    // Attach shadow DOM for encapsulation
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'gracket-container';
    
    // Add default styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .gracket-container {
        width: 100%;
        height: 100%;
      }
      .gracket-error {
        color: red;
        padding: 1rem;
      }
    `;
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.container);
  }

  connectedCallback() {
    this.initGracket();
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'data':
        if (newValue) {
          try {
            this._data = JSON.parse(newValue);
            this.updateData();
          } catch (err) {
            console.error('Invalid JSON data:', err);
          }
        }
        break;
      
      case 'corner-radius':
        this._options.cornerRadius = Number(newValue);
        this.reinitialize();
        break;
      
      case 'canvas-line-color':
        this._options.canvasLineColor = newValue || undefined;
        this.reinitialize();
        break;
      
      case 'show-bye-games':
        this._options.showByeGames = newValue === 'true';
        this.reinitialize();
        break;
    }
  }

  // Public API - Getters and Setters
  get data(): TournamentData {
    return this._data;
  }

  set data(value: TournamentData) {
    this._data = value;
    this.updateData();
  }

  get options(): Omit<GracketOptions, 'src'> {
    return this._options;
  }

  set options(value: Omit<GracketOptions, 'src'>) {
    this._options = { ...this._options, ...value };
    this.reinitialize();
  }

  // Public methods
  public updateScore(
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void {
    try {
      this.gracketInstance?.updateScore(roundIndex, gameIndex, teamIndex, score);
      this.dispatchEvent(new CustomEvent('score-updated', {
        detail: { roundIndex, gameIndex, teamIndex, score },
      }));
    } catch (err) {
      this.handleError(err as Error);
    }
  }

  public advanceRound(fromRound?: number): TournamentData | undefined {
    try {
      const result = this.gracketInstance?.advanceRound(fromRound);
      this.dispatchEvent(new CustomEvent('round-advanced', {
        detail: { fromRound, data: result },
      }));
      return result;
    } catch (err) {
      this.handleError(err as Error);
      return undefined;
    }
  }

  public getInstance(): Gracket | null {
    return this.gracketInstance;
  }

  public destroy(): void {
    this.gracketInstance?.destroy();
    this.gracketInstance = null;
  }

  // Private methods
  private initGracket(): void {
    if (!this.container || !this._data?.length) return;

    try {
      this.gracketInstance = new Gracket(this.container, {
        ...this._options,
        src: this._data,
      });

      this.dispatchEvent(new CustomEvent('init', {
        detail: { instance: this.gracketInstance },
      }));
    } catch (err) {
      this.handleError(err as Error);
    }
  }

  private updateData(): void {
    if (!this.gracketInstance) {
      this.initGracket();
      return;
    }

    if (this._data?.length) {
      try {
        this.gracketInstance.update(this._data);
        this.dispatchEvent(new CustomEvent('update', {
          detail: { data: this._data },
        }));
      } catch (err) {
        this.handleError(err as Error);
      }
    }
  }

  private reinitialize(): void {
    this.destroy();
    this.initGracket();
  }

  private handleError(error: Error): void {
    console.error('Gracket error:', error);
    this.dispatchEvent(new CustomEvent('error', {
      detail: { error },
    }));

    if (this.container) {
      this.container.innerHTML = `
        <div class="gracket-error">
          Error: ${error.message}
        </div>
      `;
    }
  }
}

/**
 * Register the custom element
 * Call this function to register the <gracket-bracket> element
 */
export function registerGracketElement(tagName: string = 'gracket-bracket'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, GracketElement);
  }
}

// Auto-register if in browser environment
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  registerGracketElement();
}

export default GracketElement;
