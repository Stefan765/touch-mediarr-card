// jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Jellyfin');
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

  update(cardInstance, entity) {
    const maxItems = cardInstance.config[`${this.key}_max_items`] || 10;
    let items = entity.attributes.data || [];
    items = items.slice(0, maxItems);

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    // Filme generieren
    listElement.innerHTML = items.map((item, index) =>
      this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
    ).join('');

    // Klick-Handler für Auswahl + Favoriten aktivieren
    this.addClickHandlers(cardInstance, listElement, items);

    // Favoriten-Button aktivieren
    listElement.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const itemId = e.target.dataset.id;
        if (!itemId) return;
        await this.addToFavorites(cardInstance, itemId);
        e.target.textContent = '💖';
      });
    });
  }

  async addToFavorites(cardInstance, itemId) {
    const serverUrl = cardInstance.config.emby_url;
    const apiKey = cardInstance.config.emby_api_key;
    const userId = cardInstance.config.emby_user_id;

    if (!serverUrl || !apiKey || !userId) {
      console.error("⚠️ Emby-Konfiguration fehlt (emby_url, emby_api_key, emby_user_id)");
      return;
    }

    try {
      const url = `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`;
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        console.log(`✅ ${itemId} zu Favoriten hinzugefügt.`);
      } else {
        console.error(`❌ Fehler beim Hinzufügen zu Favoriten: ${res.status}`);
      }
    } catch (err) {
      console.error('💥 Netzwerkfehler:', err);
    }
  }
}
