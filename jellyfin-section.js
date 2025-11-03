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

    const itemId = item.Id ?? item.id ?? item.ItemId ?? item.IdString ?? null;
    if (!itemId) {
      console.warn("⚠️ Kein Item-Id für Favoritenaktion gefunden:", item);
      return;
    }

    const isFavorite = this._favoriteIds.has(itemId);
    const heartIcon = isFavorite ? 'mdi:heart' : 'mdi:heart-outline';
    const favClass = isFavorite ? 'favorited' : '';

    const releaseYear = item.release || item.ProductionYear || 'Unbekannt';
    const runtime = item.runtime ? `${Math.round(item.runtime)} min` : '';
    const genres = Array.isArray(item.genres) ? item.genres.join(', ') : item.genres || '';
    const rating = item.rating || item.CommunityRating || '';
    const studio = item.studio || (item.Studios?.[0]?.Name ?? '');
    const summary = item.summary || item.Overview || 'Keine Beschreibung verfügbar.';

    // 💡 Hintergrundbild (Fanart oder Banner)
    const mediaBackground = item.fanart || item.banner || item.BackdropImageTags?.[0];
    if (mediaBackground) {
      cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
    }

    // 🎨 Info-Inhalt mit Rating und Herz
    cardInstance.info.innerHTML = `
      <div class="title">
        ${item.title}${releaseYear ? ` (${releaseYear})` : ''}
      </div>
      <div class="details">
        ${genres}${genres && studio ? ` | ${studio}` : studio}
      </div>
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

    // 💖 Klick-Handler für das Herz
    const favBtn = cardInstance.info.querySelector('.fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

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

          console.log(`❤️ Favorit geändert für ${item.title}: ${isFav}`);

          // Synchronisiere Herz in der Liste
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
    }
  }

  /**
   * 🖼️ Medien-Item mit Poster, Bewertung & Herz
   */
  generateMediaItem(item, index, selectedType, selectedIndex) {
    if (!item || !item.poster || !item.title) return '';

    const itemId = item.Id ?? item.id ?? item.ItemId ?? item.IdString ?? null;
    const isFavorite = this._favoriteIds.has(itemId);
    const heartIcon = isFavorite ? 'mdi:heart' : 'mdi:heart-outline';
    const favClass = isFavorite ? 'favorited' : '';

    return `
      <div class="me
