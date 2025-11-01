export class BaseSection {
  constructor(key, title) {
    this.key = key;
    this.title = title;
    this._lastBackgroundUpdate = 0;
  }

  generateTemplate() {
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-header-content">
            <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
            <div class="section-label">${this.title}</div>
          </div>
        </div>
        <div class="section-content">
          <div class="${this.key}-list"></div>
        </div>
      </div>
    `;
  }

  // 🎬 Medienkarte mit Bewertungsstern + Favoritenherz
  generateMediaItem(item, index, selectedType, selectedIndex) {
    const isFavorite = item.isFavorite || item.favorite || false;
    const heartIcon = isFavorite ? "mdi:heart" : "mdi:heart-outline";
    const favClass = isFavorite ? "favorited" : "";

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-footer">
          ${item.rating ? `<span class="rating">⭐ ${item.rating.toFixed(1)}</span>` : ''}
          <button class="fav-btn ${favClass}" data-id="${item.id}" title="Favorit umschalten">
            <ha-icon icon="${heartIcon}"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // 📋 Infoanzeige
  updateInfo(cardInstance, item) {
    if (!item) return;

    const mediaBackground = item.banner || item.fanart;
    const cardBackground = item.fanart || item.banner;

    if (mediaBackground) {
      cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
      cardInstance.background.style.opacity = cardInstance.config.opacity || 0.7;
    }

    if (cardBackground && cardInstance.cardBackground) {
      cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
    }

    cardInstance.info.innerHTML = `
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
      <div style="font-size: 10px; margin-top: 10px; color: yellow;">
        <div>Banner: ${item.banner ? '✓' : '✗'} ${item.banner || ''}</div>
        <div>Fanart: ${item.fanart ? '✓' : '✗'} ${item.fanart || ''}</div>
        <div>Backdrop: ${item.backdrop ? '✓' : '✗'} ${item.backdrop || ''}</div>
      </div>
    `;
  }

  // 🔄 Update der Liste + Favoritenlogik
  update(cardInstance, entity) {
    const maxItems =
      cardInstance.config[`${this.key}_max_items`] ||
      cardInstance.config.max_items ||
      10;

    let items = entity.attributes.data || [];
    items = items.slice(0, maxItems);

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    listElement.innerHTML = items
      .map((item, index) =>
        this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
      )
      .join('');

    this.addClickHandlers(cardInstance, listElement, items);

    // ❤️ Favoriten-Button aktivieren
    listElement.querySelectorAll('.fav-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const button = e.currentTarget;
        const icon = button.querySelector('ha-icon');
        const itemId = button.dataset.id;

        const isFav = button.classList.toggle('favorited');

        // UI sofort updaten
        icon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');

        // API-Call
        if (isFav) {
          await this.addToFavorites(cardInstance, itemId);
        } else {
          await this.removeFromFavorites(cardInstance, itemId);
        }
      });
    });

    // Styles sicherstellen
    this.ensureStyles(cardInstance);

    // Zufälliges Hintergrundbild (alle 30s)
    if (
      cardInstance.cardBackground &&
      (!this._lastBackgroundUpdate ||
        Date.now() - this._lastBackgroundUpdate > 30000)
    ) {
      const bgImage = this.getRandomArtwork(items);
      if (bgImage) {
        cardInstance.cardBackground.style.backgroundImage = `url('${bgImage}')`;
        this._lastBackgroundUpdate = Date.now();
      }
    }
  }

  // 📀 Klick-Handler
  addClickHandlers(cardInstance, listElement, items) {
    listElement.querySelectorAll('.media-item').forEach((item) => {
      item.onclick = () => {
        const index = parseInt(item.dataset.index);
        const selectedItem = items[index];

        cardInstance.selectedType = this.key;
        cardInstance.selectedIndex = index;

        const mediaBackground = selectedItem.banner || selectedItem.fanart;
        const cardBackground = selectedItem.fanart || selectedItem.banner;

        if (mediaBackground) {
          cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
        }
        if (cardBackground) {
          cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
        }

        this.updateInfo(cardInstance, items[index]);

        cardInstance.querySelectorAll('.media-item').forEach((i) => {
          i.classList.toggle(
            'selected',
            i.dataset.type === this.key && parseInt(i.dataset.index) === index
          );
        });
      };
    });
  }

  // 🧩 CSS dynamisch injizieren (Home Assistant kompatibel)
  ensureStyles(cardInstance) {
    const card = cardInstance.closest('ha-card');
    if (card && !card.querySelector('style[data-fav-style]')) {
      const style = document.createElement('style');
      style.setAttribute('data-fav-style', 'true');
      style.textContent = `
        .fav-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--secondary-text-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          transition: color 0.25s;
        }
        .fav-btn ha-icon {
          width: 22px;
          height: 22px;
        }
        .fav-btn:hover ha-icon {
          color: var(--accent-color);
        }
        .fav-btn.favorited ha-icon {
          color: var(--state-icon-active-color, #ff4444);
        }
      `;
      card.appendChild(style);
    }
  }

  // 🖼️ Zufälliges Hintergrundbild wählen
  getRandomArtwork(items) {
    if (!items || items.length === 0) return null;
    const validItems = items.filter(
      (item) => item.fanart || item.backdrop || item.banner
    );
    if (validItems.length === 0) return null;
    const randomItem =
      validItems[Math.floor(Math.random() * validItems.length)];
    return randomItem.fanart || randomItem.backdrop || randomItem.banner;
  }

  // 🧩 Helferfunktionen
  getAllArtwork(items) {
    if (!items || items.length === 0) return [];
    return items.reduce((artworks, item) => {
      if (item.fanart) artworks.push(item.fanart);
      if (item.backdrop) artworks.push(item.backdrop);
      if (item.banner) artworks.push(item.banner);
      return artworks;
    }, []);
  }

  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  }

  // ❤️ Emby: Zu Favoriten hinzufügen
  async addToFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;

    if (!serverUrl || !apiKey || !userId) {
      console.error("⚠️ Emby-Konfiguration unvollständig!");
      return;
    }

    try {
      const res = await fetch(
        `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`,
        { method: "POST" }
      );
      if (res.ok) {
        console.log(`✅ Item ${itemId} wurde zu Favoriten hinzugefügt.`);
      } else {
        console.error("❌ Fehler beim Hinzufügen:", res.status);
      }
    } catch (err) {
      console.error("💥 Fehler beim Favorisieren:", err);
    }
  }

  // 💔 Emby: Aus Favoriten entfernen
  async removeFromFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;

    if (!serverUrl || !apiKey || !userId) {
      console.error("⚠️ Emby-Konfiguration unvollständig!");
      return;
    }

    try {
      const res = await fetch(
        `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?api_key=${apiKey}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        console.log(`🗑️ Item ${itemId} wurde aus Favoriten entfernt.`);
      } else {
        console.error("❌ Fehler beim Entfernen:", res.status);
      }
    } catch (err) {
      console.error("💥 Fehler beim Entfernen:", err);
    }
  }
}
