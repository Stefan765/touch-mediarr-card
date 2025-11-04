// main-card.js
import { EmbyMoviesSection } from './emby-movies-section.js';
import { EmbySeriesSection } from './emby-series-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.collapsedSections = new Set();

    // ✅ Nur emby aktiv
    this.sections = {
      emby_movies: new EmbyMoviesSection(),
      emby_series: new EmbySeriesSection()
    };
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

  initializeCard(hass) {
    // 🔍 Nur emby_movies_entity und emby_series_entity berücksichtigen
    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key]?.length > 0)
      .filter(key => key === 'emby_movies_entity' || key === 'emby_series_entity');

    const orderedSections = configKeys.map(key => key.startsWith('emby_movies') ? 'emby_movies' : 'emby_series');

    this.innerHTML = `
      <ha-card>
        <div class="card-background"></div>
        <div class="card-content">
          <div class="media-content">
            <div class="media-background"></div>
            <div class="media-info"></div>
          </div>
          ${orderedSections
            .map(key => this.sections[key].generateTemplate(this.config))
            .join('')}
        </div>
      </ha-card>
    `;

    // Grundelemente
    this.content = this.querySelector('.media-content');
    this.background = this.querySelector('.media-background');
    this.cardBackground = this.querySelector('.card-background');
    this.info = this.querySelector('.media-info');

    // 🎨 Styles laden
    const style = document.createElement('style');
    style.textContent = styles;
    this.appendChild(style);

    // Klick-Handler für Sektionen
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = () => {
        const sectionKey = header.closest('[data-section]').dataset.section;
        this._toggleSection(sectionKey);
      };
    });

    // 🎬 Hintergrund initialisieren
    const firstSectionKey = orderedSections[0];
    const entityId = this.config[`${firstSectionKey}_entity`];
    if (entityId && hass.states[entityId]) {
      const state = hass.states[entityId];
      if (state.attributes.data?.[0]) {
        const data = state.attributes.data[0];
        const section = this.sections[firstSectionKey];
        this.selectedType = firstSectionKey;
        this.selectedIndex = 0;
        section.updateInfo(this, data);
      }
    }
  }

  set hass(hass) {
    if (!this.content) {
      this.initializeCard(hass);
    }

    // 🔄 Nur emby aktualisieren
    ['emby_movies', 'emby_series'].forEach(key => {
      const entityId = this.config[`${key}_entity`];
      if (entityId && hass.states[entityId]) {
        this.sections[key].update(this, hass.states[entityId]);
      }
    });
  }

  setConfig(config) {
    const hasEntity =
      config.emby_movies_entity || config.emby_series_entity;

    if (!hasEntity) {
      throw new Error('Please define at least one entity (emby_movies_entity or emby_series_entity)');
    }

    this.config = {
      max_items: 20,
      days_to_check: 60,
      ...config
    };

    ['emby_movies', 'emby_series'].forEach(section => {
      this.config[`${section}_max_items`] =
        this.config[`${section}_max_items`] || this.config.max_items;
    });

    ['radarr'].forEach(section => {
      this.config[`${section}_days_to_check`] =
        this.config[`${section}_days_to_check`] || this.config.days_to_check;
    });

    if (config.emby_movies_url && !config.emby_movies_url.endsWith('/')) {
      this._formattedEmbyMoviesUrl = config.emby_movies_url + '/';
    }
    if (config.emby_series_url && !config.emby_series_url.endsWith('/')) {
      this._formattedEmbySeriesUrl = config.emby_series_url + '/';
    }
  }

  static getStubConfig() {
    return {
      max_items: 20,
      days_to_check: 60,
      emby_movies_entity: 'sensor.emby_movies_mediarr',
      emby_movies_label: 'Emby Movies',
      emby_series_entity: 'sensor.emby_series_mediarr',
      emby_series_label: 'Emby Series',
      opacity: 0.7,
      blur_radius: 0
    };
  }
}

customElements.define('emby-mediarr-card', MediarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "emby-mediarr-card",
  name: "Emby Movies & Series Mediarr Card",
  description: "Simplified Mediarr card for Emby movies and series",
  preview: true
});
