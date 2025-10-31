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

generateMediaItem(item, index, selectedType, selectedIndex) {
  // Handle empty state
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

