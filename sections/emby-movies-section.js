// sections/emby-movies-section.js
import { BaseSection } from './base-section.js';

export class EmbyMoviesSection extends BaseSection {
  constructor() {
    super('emby_movies', 'Emby Filme');
  }

  updateInfo(cardInstance, item) {
    // Basislogik für Hintergrund übernehmen
    super.updateInfo(cardInstance, item);
    if (!item) return;

    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    // Emby-spezifische Anzeige
    const addedDate = item.release ? new Date(item.release).toLocaleDateString() : 'Unbekannt';
    const runtime = item.runtime ? `${item.runtime} min` : '';
    const rating = item.rating ? `⭐ ${item.rating}` : '';

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div class="metadata">
        ${addedDate ? `Veröffentlicht: ${addedDate}` : ''}
        ${runtime ? ` | ${runtime}` : ''}
        ${rating ? ` | ${rating}` : ''}
      </div>
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">Keine Filme gefunden</div>
        </div>
      `;
    }

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster || item.thumb || ''}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }
}
