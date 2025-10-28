class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.config = null;
    this._hass = null;
    this._initialized = false;
  }

  setConfig(config) {
    if (!config) throw new Error("No configuration provided");
    this.config = config;
    if (this.isConnected) this.initializeCard(this._hass);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized && this.config) {
      this.initializeCard(hass);
      this._initialized = true;
    }
  }

  initializeCard(hass) {
    this.innerHTML = `
      <ha-card header="🎬 Mediarr Card">
        <div style="padding:16px;">
          <p><b>Config geladen:</b></p>
          <pre>${JSON.stringify(this.config, null, 2)}</pre>
          <p><b>Entities erkannt:</b> ${Object.keys(hass.states).length}</p>
          <p>✅ Karte wurde korrekt initialisiert!</p>
        </div>
      </ha-card>
    `;
  }
}

if (!customElements.get('mediarr-card')) {
  customElements.define('mediarr-card', MediarrCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Card",
  description: "Eine modulare Medienkarte",
  preview: true
});


  async _getPlexClients(plexUrl, plexToken) {
    try {
      const response = await fetch(`${plexUrl}/clients?X-Plex-Token=${plexToken}`);
      if (!response.ok) throw new Error('Failed to fetch clients');

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');

      return Array.from(xml.querySelectorAll('Server')).map(server => ({
        name: server.getAttribute('name'),
        product: server.getAttribute('product'),
        version: server.getAttribute('version'),
        clientId: server.getAttribute('machineIdentifier')
      }));
    } catch (error) {
      console.error('Error fetching Plex clients:', error);
      return [];
    }
  }

  async _showClientSelector(mediaItem) {
    const plexUrl = this._formattedPlexUrl || this.config.plex_url;
    const plexToken = this.config.plex_token;

    if (!plexUrl || !plexToken) {
      console.error('Plex URL or token not available');
      return;
    }

    const clients = await this._getPlexClients(plexUrl, plexToken);
    const modal = this.querySelector('.client-modal');
    const clientList = this.querySelector('.client-list');

    if (clients.length === 0) {
      clientList.innerHTML = `
        <div style="padding: 16px; text-align: center;">
          <div style="opacity: 0.7; margin-bottom: 12px;">No Available Clients</div>
          <div style="font-size: 0.85em; color: var(--secondary-text-color);">
            Make sure your Plex clients are online and connected.
          </div>
        </div>
      `;
    } else {
      clientList.innerHTML = clients.map(client => `
        <div class="client-item" data-client-id="${client.clientId}">
          <ha-icon class="client-item-icon" icon="${this._getClientIcon(client.product)}"></ha-icon>
          <div class="client-item-info">
            <div class="client-item-name">${client.name}</div>
            <div class="client-item-details">${client.product} ${client.version}</div>
          </div>
        </div>
      `).join('');

      this.querySelectorAll('.client-item').forEach(item => {
        item.onclick = async () => {
          const clientId = item.dataset.clientId;
          const success = await this._playOnPlexClient(plexUrl, plexToken, clientId, mediaItem.key);
          if (success) {
            modal.classList.add('hidden');
          }
        };
      });
    }

    modal.classList.remove('hidden');
  }

  _getClientIcon(product) {
    const productMap = {
      'Plex for Android (TV)': 'mdi:android-tv',
      'Plex for Android': 'mdi:android',
      'Plex for iOS': 'mdi:apple',
      'Plex Web': 'mdi:web',
      'Plex HTPC': 'mdi:monitor',
      'Plex Media Player': 'mdi:play-circle',
      'Plex for Samsung': 'mdi:television',
      'Plex for LG': 'mdi:television',
      'Plex for Xbox': 'mdi:xbox',
      'Plex for PlayStation': 'mdi:playstation'
    };
    return productMap[product] || 'mdi:play-network';
  }

  _toggleSection(sectionKey) {
    const section = this.querySelector(`[data-section="${sectionKey}"]`);
    if (!section) return;

    const content = section.querySelector('.section-content');
    const icon = section.querySelector('.section-toggle-icon');

    if (this.collapsedSections.has(sectionKey)) {
      this.collapsedSections.delete(sectionKey);
      content.classList.remove('collapsed');
      icon.style.transform = 'rotate(0deg)';
    } else {
      this.collapsedSections.add(sectionKey);
      content.classList.add('collapsed');
      icon.style.transform = 'rotate(-90deg)';
    }
  }

  _updateNowPlaying(entity) {
    if (!entity || entity.state === 'unavailable' || entity.state === 'idle' || entity.state === 'off') {
      this.nowPlaying.classList.add('hidden');
      return;
    }

    this.nowPlaying.classList.remove('hidden');
    this.nowPlayingTitle.textContent = entity.attributes.media_title || '';
    this.nowPlayingSubtitle.textContent = entity.attributes.media_series_title || '';

    if (entity.attributes.media_position && entity.attributes.media_duration) {
      const progress = (entity.attributes.media_position / entity.attributes.media_duration) * 100;
      this.progressBar.style.width = `${progress}%`;
    }

    if (entity.attributes.entity_picture) {
      this.querySelector('.now-playing-background').style.backgroundImage =
        `url('${entity.attributes.entity_picture}')`;
    }
  }

  initializeCard(hass) {
    this._hass = hass;

    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key]?.length > 0);

    const orderedSections = configKeys.reduce((sections, key) => {
      let sectionKey = null;

      if (key === 'plex_entity') sectionKey = 'plex';
      else if (key === 'jellyfin_entity') sectionKey = 'jellyfin';
      else if (key === 'sonarr_entity') sectionKey = 'sonarr';
      else if (key === 'radarr_entity') sectionKey = 'radarr';
      else if (key === 'sonarr2_entity') sectionKey = 'sonarr2';
      else if (key === 'radarr2_entity') sectionKey = 'radarr2';
      else if (key === 'seer_entity') sectionKey = 'seer';
      else if (key === 'trakt_entity') sectionKey = 'trakt';
      else if (key.startsWith('tmdb_')) sectionKey = 'tmdb';

      if (sectionKey && !sections.includes(sectionKey)) sections.push(sectionKey);
      return sections;
    }, []);

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

          <div class="description-modal hidden">
            <div class="description-modal-content">
              <div class="description-modal-header">
                <div class="description-modal-title">Description</div>
                <ha-icon class="description-modal-close" icon="mdi:close"></ha-icon>
              </div>
              <div class="description-text"></div>
            </div>
          </div>

          <div class="now-playing hidden">
            <div class="now-playing-background"></div>
            <div class="now-playing-content">
              <div class="now-playing-info">
                <div class="now-playing-title"></div>
                <div class="now-playing-subtitle"></div>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill"></div>
            </div>
          </div>

          <div class="media-content">
            <div class="media-background"></div>
            <div class="media-info"></div>
            <div class="play-button hidden">
              <ha-icon class="play-icon" icon="mdi:play-circle-outline"></ha-icon>
            </div>
          </div>

          ${orderedSections
            .map(key => this.sections[key]?.generateTemplate(this.config) || '')
            .join('')}
        </div>
      </ha-card>
    `;

    this.content = this.querySelector('.media-content');
    this.background = this.querySelector('.media-background');
    this.cardBackground = this.querySelector('.card-background');
    this.info = this.querySelector('.media-info');
    this.playButton = this.querySelector('.play-button');
    this.nowPlaying = this.querySelector('.now-playing');
    this.nowPlayingTitle = this.querySelector('.now-playing-title');
    this.nowPlayingSubtitle = this.querySelector('.now-playing-subtitle');
    this.progressBar = this.querySelector('.progress-bar-fill');

    this._initializeEventListeners(hass);
  }

  _initializeEventListeners(hass) {
    const modalClose = this.querySelector('.client-modal-close');
    if (modalClose) modalClose.onclick = () => this.querySelector('.client-modal').classList.add('hidden');

    let pressTimer;
    this.content.onmousedown = () => {
      pressTimer = setTimeout(() => this._showDescriptionPopup(), 600);
    };
    this.content.onmouseup = () => clearTimeout(pressTimer);
    this.content.onmouseleave = () => clearTimeout(pressTimer);
  }

  _showDescriptionPopup() {
    const modal = this.querySelector('.description-modal');
    const descriptionText = modal.querySelector('.description-text');

    let data;
    if (this.selectedType && this.sections[this.selectedType]) {
      const entityId = this.config[`${this.selectedType}_entity`];
      const hassStates = this._hass?.states;
      if (entityId && hassStates && hassStates[entityId]) {
        data = hassStates[entityId].attributes.data?.[this.selectedIndex];
      }
    }

    if (!data) return;
    descriptionText.textContent = data.overview || data.description || "No description available";

    modal.classList.remove('hidden');
    modal.querySelector('.description-modal-close').onclick = () => modal.classList.add('hidden');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
  }
}

// Registrieren, falls noch nicht geschehen
if (!customElements.get('mediarr-card')) {
  customElements.define('mediarr-card', MediarrCard);
}

// Home Assistant Custom Card Meta
window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Card",
  description: "A modular card for displaying media from various sources",
  preview: true
});
