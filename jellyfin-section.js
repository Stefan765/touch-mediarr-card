// sections/emby-section.js
import { BaseSection } from './base-section.js';

export class EmbySection extends BaseSection {
  constructor() {
    super('emby', 'Emby Neueste Filme');
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);

    if (!item) return;

    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    const addedDate = item.release ? new Date(item.release).toLocaleDateString() : 'Unknown';
    const runtime = item.runtime ? `${item.runtime} min` : '';
    const subtitle = item.episode ? `${item.number || ''} - ${item.episode || ''}` : '';

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div class="details">${subtitle}</div>
      <div class="metadata">Released: ${addedDate}${runtime ? ` | ${runtime}` : ''}</div>
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">No recently added media</div>
        </div>
      `;
    }

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }

  generateTemplate(config) {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-title">${this.title}</div>
        </div>
        <div class="section-content horizontal-scroll"></div>
      </div>
    `;
  }

  update(cardInstance, entity) {
    const container = cardInstance.querySelector(`[data-section="${this.key}"] .section-content`);
    if (!container) return;

    const items = entity.attributes.data || [];
    container.innerHTML = items.slice(0, cardInstance.config.emby_max_items || 10)
      .map((item, index) => this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex))
      .join('');
  }
}
