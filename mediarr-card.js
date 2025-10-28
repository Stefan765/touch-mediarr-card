// main-card.js
import { styles } from './styles.js';

class EmbyCard extends HTMLElement {
  constructor() {
    super();
    this.embyMovies = [];
    this.embySeries = [];
  }

  async _getEmbyClients(embyUrl, embyToken) {
    try {
      const response = await fetch(`${embyUrl}/Sessions?api_key=${embyToken}`);
      if (!response.ok) throw new Error('Failed to fetch Emby sessions');

      const data = await response.json();
      return data.map(session => ({
        name: session.NowPlayingItem?.Name || session.UserName,
        client: session.Client,
        userId: session.UserId,
        sessionId: session.SessionId
      }));
    } catch (error) {
      console.error('Error fetching Emby clients:', error);
      return [];
    }
  }

  async _showClientSelector(mediaItem) {
    const embyUrl = this._formattedEmbyUrl || this.config.emby_url;
    const embyToken = this.config.emby_token;

    const clients = await this._getEmbyClients(embyUrl, embyToken);
    const modal = this.querySelector('.client-modal');
    const clientList = this.querySelector('.client-list');

    if (clients.length === 0) {
      clientList.innerHTML = `<div style="padding: 16px; text-align: center;">No available clients</div>`;
    } else {
      clientList.innerHTML = clients.map(client => `
        <div class="client-item" data-session-id="${client.sessionId}">
          <div class="client-item-name">${client.name} (${client.client})</div>
        </div>
      `).join('');

      this.querySelectorAll('.client-item').forEach(item => {
        item.onclick = () => {
          const sessionId = item.dataset.sessionId;
          this._playOnEmbyClient(sessionId, mediaItem.Id);
          modal.classList.add('hidden');
        };
      });
    }

    modal.classList.remove('hidden');
  }

  async _playOnEmbyClient(sessionId, itemId) {
    try {
      const embyUrl = this._formattedEmbyUrl || this.config.emby_url;
      const embyToken = this.config.emby_token;
      await fetch(`${embyUrl}/Sessions/${sessionId}/Playing?ItemId=${itemId}&api_key=${embyToken}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error starting playback on Emby client:', error);
    }
  }

  _renderMediaItems() {
    const movieContainer = this.querySelector('.movies-items');
    const seriesContainer = this.querySelector('.series-items');
    if (!movieContainer || !seriesContainer) return;

    movieContainer.innerHTML = this.embyMovies.map(item => `
      <div class="media-item">
        <div class="media-thumb" style="background-image: url('${this.config.emby_url}/Items/${item.Id}/Images/Primary?api_key=${this.config.emby_token}')"></div>
        <div class="media-title">${item.Name}</div>
        <div class="play-button" data-id="${item.Id}"><ha-icon icon="mdi:play-circle-outline"></ha-icon></div>
      </div>
    `).join('');

    seriesContainer.innerHTML = this.embySeries.map(item => `
      <div class="media-item">
        <div class="media-thumb" style="background-image: url('${this.config.emby_url}/Items/${item.Id}/Images/Primary?api_key=${this.config.emby_token}')"></div>
        <div class="media-title">${item.Name}</div>
        <div class="play-button" data-id="${item.Id}"><ha-icon icon="mdi:play-circle-outline"></ha-icon></div>
      </div>
    `).join('');

    // Play-Buttons
    this.querySelectorAll('.play-button').forEach(btn => {
      btn.onclick = async () => {
        const mediaId = btn.dataset.id;
        const mediaItem = [...this.embyMovies, ...this.embySeries].find(m => m.Id === mediaId);
        if (mediaItem) await this._showClientSelector(mediaItem);
      };
    });
  }

  initializeCard(hass) {
    this.innerHTML = `
      <ha-card>
        <div class="card-background"></div>
        <div class="card-content">

          <div class="client-modal hidden">
            <div class="client-modal-content">
              <div class="client-modal-header">
                <div class="client-modal-title">Select Client</div>
                <ha-icon class="client-modal-close" icon="mdi:close"></ha-icon>
              </div>
              <div class="client-list"></div>
            </div>
          </div>

          <div class="media-section">
            <div class="media-section-title">Movies</div>
            <div class="media-scroll">
              <div class="movies-items"></div>
            </div>
          </div>

          <div class="media-section">
            <div class="media-section-title">Series</div>
            <div class="media-scroll">
              <div class="series-items"></div>
            </div>
          </div>

        </div>
      </ha-card>
    `;

    const style = document.createElement('style');
    style.textContent = styles;
    this.appendChild(style);

    const closeButton = this.querySelector('.client-modal-close');
    const modal = this.querySelector('.client-modal');
    closeButton.onclick = () => modal.classList.add('hidden');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
  }

  set hass(hass) {
    if (!this.embyMovies && !this.embySeries) this.initializeCard(hass);

    if (this.config.emby_entity && hass.states[this.config.emby_entity]) {
      const data = hass.states[this.config.emby_entity].attributes.data || [];
      this.embyMovies = data.filter(item => item.Type === 'Movie');
      this.embySeries = data.filter(item => item.Type === 'Series');
      this._renderMediaItems();
    }
  }

  setConfig(config) {
    if (!config.emby_entity) throw new Error('Please define an Emby entity');
    this.config = { ...config };

    if (config.emby_url && !config.emby_url.endsWith('/')) {
      this._formattedEmbyUrl = config.emby_url + '/';
    }
  }

  static getStubConfig() {
    return {
      emby_entity: 'sensor.emby_mediarr',
      emby_url: 'http://your-emby-server:8096',
      emby_token: '',
    };
  }
}

customElements.define('emby-card', EmbyCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "emby-card",
  name: "Emby Card",
  description: "A scrollable card for displaying Emby movies and series",
  preview: true
});
