// main-card.js – Emby-only Mediarr Card
import { EmbyMoviesSection } from './emby-movies-section.js';
import { EmbySeriesSection } from './emby-series-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.collapsedSections = new Set();
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
    // Sektionen definieren
    this.sections = {
      emby_movies: new EmbyMoviesSection(),
      emby_series: new EmbySeriesSection()
    };

    // Konfigurationsreihenfolge auslesen
    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key]);

    const orderedSections = configKeys.reduce((sections, key) => {
      if (key === 'emby_movies_entity') sections.push('emby_movies');
      if (key === 'emby_series_entity') sections.push('emby_series');
      return sections;
    }, []);

    // Hauptstruktur der Karte
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

    // Elemente initialisieren
    this.background = this.querySelector('.media-background');
    this.cardBackground = this.querySelector('.card-background');
    this.info = this.querySelector('.media-info');

    // Erstes Hintergrundbild setzen
    const firstSectionKey = orderedSections[0];
    const entityId = this.config[`${firstSectionKey}_entity`];
    if (entityId && hass.states[entityId]) {
      const state = hass.states[entityId];
      if (state.attributes.data?.[0]) {
        const item = state.attributes.data[0];
        this.sections[firstSectionKey].updateInfo(this, item);
        this.selectedType = firstSectionKey;
        this.selectedIndex = 0;
      }
    }

    // CSS laden
    const style = document.createElement('style');
    style.textContent = styles;
    this.appendChild(style);

    // Event-Listener aktivieren
    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = () => {
        const sectionKey = header.closest('[data-section]').dataset.section;
        this._toggleSection(sectionKey);
      };
    });
  }

  set hass(hass) {
    if (!this.contentInitialized) {
      this.initializeCard(hass);
      this.contentInitialized = true;
    }

    // Sektionen aktualisieren
    Object.entries(this.sections).forEach(([key, section]) => {
      const entityId = this.config[`${key}_entity`];
      if (entityId && hass.states[entityId]) {
        section.update(this, hass.states[entityId]);
      }
    });
  }

  setConfig(config) {
    const hasEntity = config.emby_movies_entity || config.emby_series_entity;
    if (!hasEntity) {
      throw new Error('Bitte mindestens eine Emby-Entität angeben');
    }

    this.config = {
      max_items: 10,
      opacity: 0.7,
      ...config
    };
  }

  static getStubConfig() {
    return {
      emby_movies_entity: 'sensor.emby_movies',
      emby_series_entity: 'sensor.emby_series',
      max_items: 10
    };
  }
}

customElements.define('mediarr-card', MediarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Emby Card",
  description: "Eine stilvolle Mediarr-Karte nur für Emby Filme & Serien",
  preview: true
});
