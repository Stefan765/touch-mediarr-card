// sections/radarr-section.js
import { BaseSection } from './base-section.js';

export class RadarrSection extends BaseSection {
  constructor() {
    super('radarr', 'Emby Neueste Serien');

    // Emby User-ID und API-Key (kannst du hier ändern)
    this.embyUserId = '6aa9f5243e6e49c08a3fb5e9fa3741a2';
    this.embyApiKey = '5b13ed8a5ebf4a3884adc790c2c3ff59';
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);
    if (!item) return;

    // Leeren, wenn Standard-Titel
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

    // HTML für Infobox inkl. Herz-Button
    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${releaseYear ? ` (${releaseYear})` : ''}</div>
      <div class="details">${genres}${genres && studio ? ` | ${studio}` : studio}</div>
      <div class="metadata">
        ${runtime ? `⏱️ ${runtime}` : ''} 
        ${rating ? ` | ⭐ ${rating}` : ''} 
        <button class="fav-btn" 
                data-id="${item.id || item.Id || item.ItemId || ''}" 
                title="Zu Favoriten hinzufügen">
          ♡
        </button>
      </div>
      <div class="summary">${summary}</div>
    `;

    // Herz-Button Event
    const favBtn = cardInstance.info.querySelector('.fav-btn');
    if (favBtn) {
      this.checkFavoriteStatus(item.id, favBtn); // initial Status prüfen
      favBtn.addEventListener('click', async () => {
        await this.toggleFavorite(item, favBtn);
      });
    }
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    if (!item || !item.poster || !item.title) return '';

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }

  // Prüft, ob das Item Favorit ist
  async checkFavoriteStatus(itemId, btn) {
    try {
      const url = `http://192.168.1.70:8096/Users/${this.embyUserId}/Items/${itemId}?api_key=${this.embyApiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data.IsFavorite) {
        btn.classList.add('favorited');
        btn.textContent = '❤️';
      } else {
        btn.classList.remove('favorited');
        btn.textContent = '♡';
      }
    } catch (err) {
      console.error('💥 Fehler beim Status prüfen:', err);
    }
  }

  // Favorit hinzufügen oder entfernen
  async toggleFavorite(item, btn) {
    const itemId = item.id || item.Id || item.ItemId;
    const isFavorited = btn.classList.contains('favorited');
    const method = isFavorited ? 'DELETE' : 'POST';
    const url = `http://192.168.1.70:8096/Users/${this.embyUserId}/FavoriteItems?ItemIds=${itemId}&api_key=${this.embyApiKey}`;

    try {
      const resp = await fetch(url, { method });
      if (!resp.ok) throw new Error(`${method} fehlgeschlagen: ${resp.status}`);

      // Button-Status aktualisieren
      if (isFavorited) {
        btn.classList.remove('favorited');
        btn.textContent = '♡';
      } else {
        btn.classList.add('favorited');
        btn.textContent = '❤️';
      }
    } catch (err) {
      console.error('💥 Fehler beim Favorisieren:', err);
    }
  }
}
