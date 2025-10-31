// sections/jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);
    if (!item) return;

    // Wenn Platzhalter, nichts anzeigen
    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    const releaseYear = item.release || 'Unbekannt';
    const runtime = item.runtime ? `${Math.round(item.runtime)} min` : '';
    const genres = item.genres || '';
    const rating = item.rating || '';
    const studio = item.studio || '';
    const summary = item.summary || 'Keine Beschreibung verfügbar.';

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${releaseYear ? ` (${releaseYear})` : ''}</div>
      <div class="details">${genres}${genres && studio ? ` | ${studio}` : studio}</div>
      <div class="metadata">
        ${runtime ? `⏱️ ${runtime}` : ''} 
        ${rating ? ` | ⭐ ${rating}` : ''} 
      </div>
      <div class="summary">${summary}</div>
    `;
  }

  // **Hier ist die neue Funktion für Media Items**
  update(cardInstance, entity) {
    if (!entity || !entity.attributes?.data) return;

    const data = entity.attributes.data;
    const maxItems = cardInstance.config?.jellyfin_max_items || 20; // Max Items aus config
    const itemsToShow = data.filter(item => !item.title_default).slice(0, maxItems); // Keine Platzhalter

    const html = itemsToShow.map((item, index) =>
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
    ).join('');

    const sectionEl = cardInstance.querySelector(`[data-section="${this.key}"] .section-content`);
    if (sectionEl) sectionEl.innerHTML = html;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }
}
