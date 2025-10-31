// sections/jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
  }

  updateInfo(cardInstance, item) {
    // Standard-Handling aus der Basisklasse (z. B. Hintergrundbild)
    super.updateInfo(cardInstance, item);

    if (!item) return;

    // Wenn es sich um den Platzhalter handelt, nichts anzeigen
    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    // Daten aus der Entität aufbereiten
    const releaseYear = item.release || 'Unbekannt';
    const runtime = item.runtime ? `${Math.round(item.runtime)} min` : '';
    const genres = item.genres || '';
    const rating = item.rating || '';
    const studio = item.studio || '';
    const summary = item.summary || 'Keine Beschreibung verfügbar.';

    // HTML-Inhalt für die Infobox
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
    if (!item || item.title_default) return '';
  
    const itemId = item.Id || item.id || item.media_id || '';
    const rating = item.communityRating || item.rating || '';
    const poster = item.poster || item.image || '';
    const title = item.title || item.name || 'Unbekannt';
  
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${poster}" alt="${title}">
        <div class="media-item-title">${title}</div>
  
        <div class="media-item-footer">
          ${rating ? `<span class="rating">⭐ ${parseFloat(rating).toFixed(1)}</span>` : '<span></span>'}
          <button class="fav-btn" data-id="${itemId}" title="Zu Favoriten hinzufügen">♡</button>
        </div>
      </div>
    `;
  }

}
 
