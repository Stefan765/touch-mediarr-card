// main-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.6.1/index.js?module';
import { styles } from './styles.js';

class EmbyCard extends LitElement {
  static get properties() {
    return {
      config: { type: Object },
      movies: { type: Array },
      series: { type: Array },
      clients: { type: Array },
      modalOpen: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.movies = [];
    this.series = [];
    this.clients = [];
    this.modalOpen = false;
  }

  static styles = css([styles]);

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    this.config = config;
    this.fetchMedia();
  }

  async fetchMedia() {
    try {
      const moviesResp = await fetch(`${this.config.embyUrl}/Movies?api_key=${this.config.apiKey}`);
      const seriesResp = await fetch(`${this.config.embyUrl}/Shows?api_key=${this.config.apiKey}`);
      this.movies = (await moviesResp.json()).Items || [];
      this.series = (await seriesResp.json()).Items || [];
    } catch (e) {
      console.error('Error fetching Emby media:', e);
    }
  }

  toggleModal() {
    this.modalOpen = !this.modalOpen;
  }

  playOnClient(item, client) {
    console.log('Play', item.Name, 'on', client.Name);
    // Beispiel: Emby API Call zum Abspielen
    fetch(`${this.config.embyUrl}/Sessions/${client.Id}/Playing?itemId=${item.Id}&api_key=${this.config.apiKey}`, { method: 'POST' });
    this.toggleModal();
  }

  renderMedia(items) {
    return html`
      <div class="media-scroll">
        ${items.map(item => html`
          <div class="media-item" @click="${() => this.toggleModal(item)}">
            <div class="media-thumb" style="background-image: url(${this.config.embyUrl}/Items/${item.Id}/Images/Primary?api_key=${this.config.apiKey})">
              <div class="play-button"><ha-icon icon="mdi:play"></ha-icon></div>
            </div>
            <div class="media-title">${item.Name}</div>
          </div>
        `)}
      </div>
    `;
  }

  renderModal() {
    return html`
      <div class="client-modal ${this.modalOpen ? '' : 'hidden'}" @click="${this.toggleModal}">
        <div class="client-modal-content" @click="${e => e.stopPropagation()}">
          <div class="client-modal-header">
            <div class="client-modal-title">Wähle ein Gerät</div>
            <div class="client-modal-close" @click="${this.toggleModal}">✖</div>
          </div>
          <div class="client-list">
            ${this.clients.map(client => html`
              <div class="client-item" @click="${() => this.playOnClient(this.selectedItem, client)}">
                <div class="client-item-name">${client.Name}</div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <ha-card>
        <div class="card-background"></div>
        <div class="card-content">
          <div class="media-section">
            <div class="media-section-title">Filme</div>
            ${this.renderMedia(this.movies)}
          </div>
          <div class="media-section">
            <div class="media-section-title">Serien</div>
            ${this.renderMedia(this.series)}
          </div>
        </div>
      </ha-card>
      ${this.renderModal()}
    `;
  }
}

customElements.define('emby-card', EmbyCard);
