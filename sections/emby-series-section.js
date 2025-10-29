// sections/emby-series-section.js
import { BaseSection } from './base-section.js';

export class EmbySeriesSection extends BaseSection {
  constructor() {
    super('emby_series', 'Emby Serien');
  }

  updateInfo(cardInstance, item) {
    // Standard-Update (Hintergrund, Fanart usw.)
    super.updateInfo(cardInstance, item);
    if (!item) return;

    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    // Serieninfos (Staffel, Episode, Release, Laufzeit)
    const episodeInfo = item.episode ? `${item.season || ''} • ${item.episode}` : '';
    const addedDate = item.release ? new Date(item.release).toLocaleDateString() : '';
    const runtime = item.runtime ? `${item.runtime} min` : '';

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div class="details">${episodeInfo}</div>
      <div class="metadata">
        ${addedDate ? `Veröffentlicht: ${addedDate}` : ''}
        ${runtime ? ` | ${runtime}` : ''}
      </div>
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">Keine Serien gefunden</div>
        </div>
      `;
    }

    const subtitle = item.episode
      ? `${item.season || ''} • ${item.episode}`
      : item.series || '';

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster || item.thumb || ''}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-subtitle">${subtitle}</div>
      </div>
    `;
  }
}
