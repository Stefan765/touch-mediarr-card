import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
  }

  update(cardInstance, entityState) {
    if (!entityState?.attributes?.data) return;

    // Hole die maximale Anzahl an Items aus der Konfiguration
    const maxItems = cardInstance.config?.jellyfin_max_items || 10;

    // Slice auf maxItems begrenzen
    const items = entityState.attributes.data.slice(0, maxItems);

    // HTML für die Section erzeugen
    const sectionHtml = items.map((item, index) =>
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
    ).join('');

    const sectionElement = cardInstance.querySelector(`[data-section="${this.key}"] .section-content`);
    if (sectionElement) sectionElement.innerHTML = sectionHtml;

    // Optional: erste Info anzeigen
    if (items[0]) this.updateInfo(cardInstance, items[0]);
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);

    if (!item) return;

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
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">Keine kürzlich hinzugefügten Medien</div>
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
}
