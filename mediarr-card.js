// mediarr-card.js
class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedIndex = 0;
    this.sections = {
      emby_movies: { entityKey: 'emby_movies_entity', title: 'Filme' },
      emby_series: { entityKey: 'emby_series_entity', title: 'Serien' }
    };
  }

  setConfig(config) {
    if (!config.emby_movies_entity && !config.emby_series_entity) {
      throw new Error('Please define at least one Emby media entity');
    }
    this.config = config;
    this.maxItems = config.max_items || 10;
  }

  set hass(hass) {
    if (!this.content) this._buildCard();

    Object.entries(this.sections).forEach(([key, section]) => {
      const entityId = this.config[section.entityKey];
      if (entityId && hass.states[entityId]) {
        this._updateSection(key, hass.states[entityId].attributes.data || []);
      }
    });
  }

  _buildCard() {
    this.innerHTML = `
      <ha-card>
        <div class="mediarr-container"></div>
      </ha-card>
    `;
    this.content = this.querySelector('.mediarr-container');
  }

  _updateSection(key, items) {
    const section = this.sections[key];
    const sectionDiv = document.createElement('div');
    sectionDiv.classList.add('mediarr-section');
    sectionDiv.innerHTML = `<h3>${section.title}</h3>`;

    const itemsDiv = document.createElement('div');
    itemsDiv.classList.add('mediarr-items');

    items.slice(0, this.maxItems).forEach(item => {
      const card = document.createElement('div');
      card.classList.add('mediarr-item');
      card.innerHTML = `
        <img src="${item.poster}" alt="${item.title}" style="width:100px;height:150px;">
        <div>${item.title}${item.year ? ` (${item.year})` : ''}</div>
      `;
      itemsDiv.appendChild(card);
    });

    sectionDiv.appendChild(itemsDiv);
    this.content.appendChild(sectionDiv);
  }

  static getStubConfig() {
    return {
      max_items: 10,
      emby_movies_entity: 'sensor.emby_recently_added_movies',
      emby_series_entity: 'sensor.emby_recently_added_series'
    };
  }
}

customElements.define('mediarr-card', MediarrCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Card",
  description: "Minimal Emby-only card for movies and series",
  preview: true
});
