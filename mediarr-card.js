// mediarr-card.js
class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.selectedType = null;
    this.selectedIndex = null;
  }

  setConfig(config) {
    if (!config.emby_movies_entity && !config.emby_series_entity) {
      throw new Error('Please define at least one Emby entity');
    }

    this.config = {
      emby_max_items: 10,
      ...config
    };

    this.sections = {
      movies: new EmbySection('Movies', config.emby_movies_entity),
      series: new EmbySection('Series', config.emby_series_entity)
    };
  }

  set hass(hass) {
    this.hassState = hass;

    if (!this.shadowRoot.innerHTML) {
      this.render();
    }

    Object.values(this.sections).forEach(section => {
      const entity = hass.states[section.entity] || { attributes: { data: [] } };
      section.update(this.shadowRoot, entity);
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; margin-bottom: 5px; }
        .section-content { display: flex; overflow-x: auto; gap: 8px; padding: 8px 0; }
        .media-item { flex: 0 0 auto; width: 120px; cursor: pointer; text-align: center; }
        .media-item img { width: 100%; border-radius: 6px; }
        .media-item-title { font-size: 0.8em; margin-top: 4px; }
        .media-item.selected { outline: 2px solid #42A5F5; }
        .empty-section-content { padding: 20px; color: #aaa; text-align: center; }
      </style>
      ${Object.values(this.sections).map(s => s.generateTemplate()).join('')}
    `;
  }
}

class EmbySection {
  constructor(title, entity) {
    this.title = title;
    this.entity = entity;
    this.key = title.toLowerCase();
  }

  generateTemplate() {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-title">${this.title}</div>
        <div class="section-content horizontal-scroll"></div>
      </div>
    `;
  }

  update(containerRoot, entity) {
    const container = containerRoot.querySelector(`[data-section="${this.key}"] .section-content`);
    if (!container) return;

    const items = entity.attributes.data || [];
    if (!items.length) {
      container.innerHTML = `<div class="empty-section-content">No recently added media</div>`;
      return;
    }

    container.innerHTML = items.slice(0, 10).map((item, index) => `
      <div class="media-item" data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `).join('');
  }
}

customElements.define('mediarr-card', MediarrCard);
