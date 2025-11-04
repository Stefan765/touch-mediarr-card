import { EmbyMoviesSection } from './emby-movies-section.js';
import { RadarrSection } from './radarr-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.collapsedSections = new Set();
    this.progressInterval = null;

    // ✅ Nur Emby Movies & Radarr aktiv
    this.sections = {
      emby_movies: new EmbyMoviesSection(),
      radarr: new RadarrSection(),
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
    const configKeys = Object.keys(this.config)
      .filter(key => key.endsWith('_entity') && this.config[key] && this.config[key].length > 0);

    // 🧩 Reihenfolge anhand der Config bestimmen
    const orderedSections = configKeys.reduce((sections, key) => {
      let sectionKey = null;
      if (key === 'emby_movies_entity') sectionKey = 'emby_movies';
      else if (key === 'radarr_entity') sectionKey = 'radarr';
      if (sectionKey && !sections.includes(sectionKey)) sections.push(sectionKey);
      return sections;
    }, []);

    this.innerHTML = `
      <ha-card>
        <div class="card-background"></div>
        <div class="card-content">
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
          </div>
          ${orderedSections
            .map(key => this.sections[key].generateTemplate(this.config))
            .join('')}
        </div>
      </ha-card>
    `;

    // Referenzen speichern
    this.content = this.querySelector('.media-content');
    this.background = this.querySelector('.media-background');
    this.cardBackground = this.querySelector('.card-background');
    this.info = this.querySelector('.media-info');
    this.nowPlaying = this.querySelector('.now-playing');
    this.nowPlayingTitle = this.querySelector('.now-playing-title');
    this.nowPlayingSubtitle = this.querySelector('.now-playing-subtitle');
    this.progressBar = this.querySelector('.progress-bar-fill');

    // Startzustand laden
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

    // Styles anhängen
    const style = document.createElement('style');
    style.textContent = styles;
    this.appendChild(style);

    this._initializeEventListeners(hass);
  }

  _initializeEventListeners(hass) {
    this.querySelectorAll('.section-header').forEach(header => {
      header.onclick = () => {
        const sectionKey = header.closest('[data-section]').dataset.section;
        this._toggleSection(sectionKey);
      };
    });
  }

  set hass(hass) {
    if (!this.content) this.initializeCard(hass);
    if (this.config.media_player_entity) {
      this._updateNowPlaying(hass.states[this.config.media_player_entity]);
    }

    Object.entries(this.sections).forEach(([key, section]) => {
      const entityId = this.config[`${key}_entity`];
      if (entityId && hass.states[entityId]) {
        section.update(this, hass.states[entityId]);
      }
    });
  }

  setConfig(config) {
    const hasEntity = ['emby_movies_entity', 'radarr_entity']
      .some(key => config[key]);
    if (!hasEntity) throw new Error('Bitte mindestens eine Media-Entity angeben (emby_movies oder radarr)');

    this.config = {
      max_items: 20,
      days_to_check: 60,
      radarr_release_types: ['Digital', 'Theaters'],
      ...config,
    };

    ['emby_movies', 'radarr'].forEach(section => {
      this.config[`${section}_max_items`] =
        this.config[`${section}_max_items`] || this.config.max_items;
    });

    ['radarr'].forEach(section => {
      this.config[`${section}_days_to_check`] =
        this.config[`${section}_days_to_check`] || this.config.days_to_check;
    });

    // 🔄 URL-Formatierung
    const embyUrl = config.emby_movies_url || config.jellyfin_url;
    if (embyUrl && !embyUrl.endsWith('/')) {
      this._formattedEmbyMoviesUrl = embyUrl + '/';
    }
  }

  static getStubConfig() {
    return {
      max_items: 20,
      days_to_check: 60,
      radarr_release_types: ['Digital', 'Theaters'],
      emby_movies_max_items: 10,
      radarr_max_items: 10,
      emby_movies_entity: 'sensor.emby_movies_mediarr',
      radarr_entity: 'sensor.radarr_mediarr',
      media_player_entity: '',
      opacity: 0.7,
      blur_radius: 0,
    };
  }
}

customElements.define('emby-mediarr-card', MediarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'emby-mediarr-card',
  name: 'Emby Mediarr Card',
  description: 'A modular card for displaying media from Emby and Radarr',
  preview: true,
});
