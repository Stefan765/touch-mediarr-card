import { BaseSection } from './base-section.js';

export class SeerSection extends BaseSection {
  constructor() {
    super('seer', 'Seer Content');
    this.sections = [
      { key: 'seer', title: 'Media Requests', entityKey: 'seer_entity', listClass: 'seer-list' },
      { key: 'seer_trending', title: 'Trending', entityKey: 'seer_trending_entity', listClass: 'seer-trending-list' },
      { key: 'seer_popular_movies', title: 'Popular Movies', entityKey: 'seer_popular_movies_entity', listClass: 'seer-popular-movies-list' },
      { key: 'seer_popular_tv', title: 'Popular TV', entityKey: 'seer_popular_tv_entity', listClass: 'seer-popular-tv-list' },
      { key: 'seer_discover', title: 'Discover', entityKey: 'seer_discover_entity', listClass: 'seer-discover-list' }
    ];

    this.statusMap = {
      1: { text: 'Pending', icon: 'mdi:clock-outline', class: 'status-pending' },
      2: { text: 'Approved', icon: 'mdi:check-circle-outline', class: 'status-approved' },
      3: { text: 'Declined', icon: 'mdi:close-circle-outline', class: 'status-declined' },
      4: { text: 'Available', icon: 'mdi:download-circle-outline', class: 'status-available' }
    };
  }

  generateTemplate(config) {
    return this.sections
      .filter(section => config[section.entityKey])
      .map(section => `
        <div class="section" data-section="${section.key}">
          <div class="section-header">
            <div class="section-header-content">
              <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
              <div class="section-label">${section.title}</div>
            </div>
          </div>
          <div class="section-content">
            <div class="${section.listClass}" data-list="${section.key}"></div>
          </div>
        </div>
      `).join('');
  }

  update(cardInstance, entity) {
    const entityId = entity.entity_id;
    const sectionConfig = this.sections.find(section => 
      cardInstance.config[section.entityKey] === entityId
    );
    
    if (!sectionConfig) {
      console.error(`Could not find section config for entity ${entityId}`);
      return;
    }

    const items = entity.attributes.data || [];
    const listElement = cardInstance.querySelector(`[data-list="${sectionConfig.key}"]`);
    
    if (!listElement) {
      console.error(`Could not find list element for ${sectionConfig.key}`);
      return;
    }

    listElement.innerHTML = items.map((item, index) => 
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex, sectionConfig.key)
    ).join('');

    this.addClickHandlers(cardInstance, listElement, items, sectionConfig.key);
  }

  generateMediaItem(item, index, selectedType, selectedIndex, sectionKey) {
    const isRequest = sectionKey === 'seer';
    const title = item.title || item.name || '';
    const poster = item.poster || '';

    let statusHtml = '';
    if (isRequest && item.status) {
      const statusInfo = this._getStatusInfo(item.status);
      statusHtml = `
        <div class="request-status ${statusInfo.class}">
          <ha-icon icon="${statusInfo.icon}" class="status-icon"></ha-icon>
        </div>`;
    }

    return `
      <div class="media-item ${selectedType === sectionKey && index === selectedIndex ? 'selected' : ''}"
           data-type="${sectionKey}"
           data-index="${index}">
        ${statusHtml}
        <img src="${poster || '/api/placeholder/400/600'}" alt="${title}">
        <div class="media-item-title">${title}</div>
      </div>
    `;
  }

  updateInfo(cardInstance, item) {
    if (!item) return;

    const title = item.title || item.name || '';
    const overview = item.overview || '';
    const year = item.year || '';
    const type = item.type || '';

    const mediaBackground = item.fanart || item.poster || '';
    const cardBackground = item.fanart || item.poster || '';
    
    if (mediaBackground) {
      cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
      cardInstance.background.style.opacity = cardInstance.config.opacity || 0.7;
    }

    if (cardBackground && cardInstance.cardBackground) {
      cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
    }

    if (item.status) {
      const statusInfo = this._getStatusInfo(item.status);
      cardInstance.info.innerHTML = `
        <div class="title">${title}</div>
        <div class="details">
          <span class="status ${statusInfo.class}">
            <ha-icon icon="${statusInfo.icon}"></ha-icon>
            ${statusInfo.text}
          </span>
          ${item.requested_by ? `${item.requested_by} - ${this.formatDate(item.requested_date)}` : ''}
        </div>
      `;
    } else {
      cardInstance.info.innerHTML = `
        <div class="title">${title}${year ? ` (${year})` : ''}</div>
        <div class="details">
          ${type ? `<div class="type">${type}</div>` : ''}
          ${overview ? `<div class="overview">${overview}</div>` : ''}
        </div>
      `;
    }
  }

  addClickHandlers(cardInstance, listElement, items, sectionKey) {
    listElement.querySelectorAll('.media-item').forEach(item => {
      item.onclick = () => {
        const index = parseInt(item.dataset.index);
        cardInstance.selectedType = sectionKey;
        cardInstance.selectedIndex = index;
        this.updateInfo(cardInstance, items[index]);

        cardInstance.querySelectorAll('.media-item').forEach(i => {
          i.classList.toggle('selected', 
            i.dataset.type === sectionKey && parseInt(i.dataset.index) === index);
        });
      };
    });
  }

  _getStatusInfo(statusCode) {
    return this.statusMap[statusCode] || {
      text: 'Unknown',
      icon: 'mdi:help-circle-outline',
      class: 'status-unknown'
    };
  }
}