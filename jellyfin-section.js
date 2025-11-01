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
        <button class="fav-btn" 
                data-id="${item.id}" 
                title="Zu Favoriten hinzufügen">
          ♡
        </button>
      </div>
      <div class="summary">${summary}</div>
    `;
  }

    generateMediaItem(item, index, selectedType, selectedIndex) {
    // Prüfen, ob item existiert und notwendige Felder hat
    if (!item || !item.poster || !item.title) return ''; // Nichts rendern, wenn Daten fehlen
  
    // Film-Cover anzeigen
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
 
