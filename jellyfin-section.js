// sections/jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
  }

  update(cardInstance, entityState) {
    if (!entityState?.attributes?.data) return;
  
    const maxItems = cardInstance.config?.jellyfin_max_items || 5;
  
    const items = entityState.attributes.data.slice(0, maxItems);
  
    const sectionHtml = items.map((item, index) => 
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
    ).join('');
  
    const sectionElement = cardInstance.querySelector(`[data-section="${this.key}"] .section-content`);
    if (sectionElement) sectionElement.innerHTML = sectionHtml;
  
    // Optional: erste Info anzeigen
    if (items[0]) this.updateInfo(cardInstance, items[0]);
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
    // Leerer Zustand
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">Keine kürzlich hinzugefügten Medien</div>
        </div>
      `;
    }

    // Normales Medienlayout
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
