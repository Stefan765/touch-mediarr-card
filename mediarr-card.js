import { PlexSection } from './plex-section.js';
import { JellyfinSection } from './jellyfin-section.js';
import { SonarrSection } from './sonarr-section.js';
import { RadarrSection } from './radarr-section.js';
import { SeerSection } from './seer-section.js';
import { TMDBSection } from './tmdb-section.js';
import { TraktSection } from './trakt-section.js';
import { Sonarr2Section } from './sonarr2-section.js';
import { Radarr2Section } from './radarr2-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.collapsedSections = new Set();
    this.progressInterval = null;
    this._initialized = false; // Wichtig für den hass-Setter

    this.sections = {
      plex: new PlexSection(),
      jellyfin: new JellyfinSection(),
      sonarr: new SonarrSection(),
      sonarr2: new Sonarr2Section(),
      radarr: new RadarrSection(),
      radarr2: new Radarr2Section(),
      seer: new SeerSection(),
      tmdb: new TMDBSection(),
      trakt: new TraktSection()
    };
  }

  setConfig(config) {
    if (!config) throw new Error("No configuration provided");
    this.config = config;
    if (this._hass) this.initializeCard(this._hass);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized && this.config) {
      this.initializeCard(hass);
      this._initialized = true;
    }
  }

  async initializeCard(hass) {
    this._hass = hass;

    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key] && this.config[key].length > 0);

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
          ${orderedSections.map(key => this.sections[key].generateTemplate(this.config)).join('')}
        </div>
      </ha-card>
    `;

    this.content = this.querySelector('.media-content');
    this.background = this.querySelector('.media-background');
    this.cardBackground = this.querySelector('.card-background');
    this.info = this.querySelector('.media-info');
    this.playButton = this.querySelector('.play-button');

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    // Hier kannst du alle Klick- oder Long-Press Events einfügen
  }
}

if (!customElements.get('mediarr-card')) {
  customElements.define('mediarr-card', MediarrCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Card",
  description: "A modular card for displaying media from various sources",
  preview: true
});
