// sections/jellyfin-section.js
import { BaseSection } from './base-section.js';

export class JellyfinSection extends BaseSection {
  constructor() {
    super('jellyfin', 'Emby Neueste Filme');
  }

  /**
   * 🩷 Detailbereich mit Film-Infos und Herzbutton aktualisieren
   */
  updateInfo(cardInstance, item) {
    if (!item) return;

    const itemId = item.id || item.Id || '';
    const isFavorite = this._favoriteIds.has(itemId);
    const heartIcon = isFavorite ? 'mdi:heart' : 'mdi:heart-outline';
    const favClass = isFavorite ? 'favorited' : '';

    const releaseYear = item.release || 'Unbekannt';
    const runtime = item.runtime ? `${Math.round(item.runtime)} min` : '';
    const genres = item.genres || '';
    const rating = item.rating || '';
    const studio = item.studio || '';
    const summary = item.summary || 'Keine Beschreibung verfügbar.';

    // 🎨 HTML für Film-Details
    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${releaseYear ? ` (${releaseYear})` : ''}</div>
      <div class="details">${genres}${genres && studio ? ` | ${studio}` : studio}</div>
      <div class="metadata">
        ${runtime ? `⏱️ ${runtime}` : ''} 
        ${rating ? ` | ⭐ ${rating}` : ''} 
        <button class="fav-btn ${favClass}" 
                data-id="${itemId}" 
                title="Favorit umschalten">
          <ha-icon icon="${heartIcon}"></ha-icon>
        </button>
      </div>
      <div class="summary">${summary}</div>
    `;

    // 💖 Klick-Handler für den Herz-Button hinzufügen
    const favBtn = cardInstance.info.querySelector('.fav-btn');
    if (favBtn) {
    //  console.log("🩷 Favoriten-Button gefunden:", item.title);

      favBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        console.log("💥 Favoriten-Klick erkannt:", item.title);

        const icon = favBtn.querySelector('ha-icon');
        const isFav = favBtn.classList.toggle('favorited');
        icon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');

        try {
          if (isFav) {
            await this.addToFavorites(cardInstance, itemId);
            this._favoriteIds.add(itemId);
          } else {
            await this.removeFromFavorites(cardInstance, itemId);
            this._favoriteIds.delete(itemId);
          }
        //  console.log(`❤️ Favorit für ${item.title}:`, isFav);

          // 🩶 Optional: Synchronisiere mit der Liste
          const listBtn = cardInstance.querySelector(`.jellyfin-list .fav-btn[data-id="${itemId}"]`);
          if (listBtn) {
            listBtn.classList.toggle('favorited', isFav);
            const listIcon = listBtn.querySelector('ha-icon');
            if (listIcon) listIcon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');
          }
        } catch (err) {
          console.error("❌ Fehler beim Favorisieren:", err);
        }
      });
    } else {
      console.warn("⚠️ Kein favBtn gefunden in Info für:", item.title);
    }
  }

  /**
   * 🖼️ Ein einzelnes Medien-Item (mit Poster, Bewertung & Herz)
   */
  generateMediaItem(item, index, selectedType, selectedIndex) {
    console.log("🎬 Item-Debug:", item);

    if (!item || !item.poster || !item.title) return '';

    const itemId = item.id || item.Id || '';
    const isFavorite = this._favoriteIds.has(itemId);
    const heartIcon = isFavorite ? 'mdi:heart' : 'mdi:heart-outline';
    const favClass = isFavorite ? 'favorited' : '';

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-footer">
          ${item.rating ? `<span class="rating">⭐ ${item.rating}</span>` : ''}
        </div>
      </div>
    `;
  }
}
