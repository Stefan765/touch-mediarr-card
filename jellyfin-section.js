import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
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
    if (!item || item.title_default) return '';

    const itemId = item.Id || item.id || item.media_id || '';
    const rating = item.communityRating || item.rating || '';
    const poster = item.poster || item.image || '';
    const title = item.title || item.name || 'Unbekannt';
    const isFavorite = item.UserData?.IsFavorite || false;

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${poster}" alt="${title}">
        <div class="media-item-title">${title}</div>

        <div class="media-item-footer">
          ${rating ? `<span class="rating">⭐ ${parseFloat(rating).toFixed(1)}</span>` : '<span></span>'}
          <button class="fav-btn ${isFavorite ? 'favorited' : ''}" 
                  data-id="${itemId}" 
                  title="${isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}">
            ${isFavorite ? '♥' : '♡'}
          </button>
        </div>
      </div>
    `;
  }

  updateSection(cardInstance, items) {
    const html = items.map((item, index) =>
      this.generateMediaItem(item, index, this.selectedType, this.selectedIndex)
    ).join('');

    const container = cardInstance.querySelector('.media-container');
    container.innerHTML = html;

    // Nach dem Rendern Events binden
    this.attachFavoriteHandlers(cardInstance);
  }

  attachFavoriteHandlers(cardInstance) {
    const favButtons = cardInstance.querySelectorAll('.fav-btn');
    favButtons.forEach(btn => {
      btn.addEventListener('click', async (event) => {
        event.stopPropagation();

        const itemId = btn.dataset.id;
        const isFav = btn.classList.contains('favorited');

        // Deine Emby-/Jellyfin-Daten hier anpassen:
        const userId = '1234567890abcdef';
        const apiKey = 'ABCDEFG123456';
        const baseUrl = 'http://192.168.1.50:8096';

        try {
          if (!isFav) {
            // Zu Favoriten hinzufügen
            await fetch(`${baseUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`, {
              method: 'POST'
            });
            btn.textContent = '♥';
            btn.classList.add('favorited');
            btn.title = 'Aus Favoriten entfernen';
          } else {
            // Aus Favoriten entfernen
            await fetch(`${baseUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`, {
              method: 'DELETE'
            });
            btn.textContent = '♡';
            btn.classList.remove('favorited');
            btn.title = 'Zu Favoriten hinzufügen';
          }
        } catch (err) {
          console.error('Fehler beim Ändern des Favoritenstatus:', err);
        }
      });
    });
  }
}
