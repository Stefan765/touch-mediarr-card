export class BaseSection {
  constructor(key, title) {
    this.key = key;
    this.title = title;
    this._lastBackgroundUpdate = 0;
    this._favoriteIds = new Set(); // 🩷 lokale Favoritenliste aus Emby
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

  // 🎬 Einzelnes Medien-Item (Poster + Sterne + Herz)
  generateMediaItem(item, index, selectedType, selectedIndex) {
    console.log("🎬 generateMediaItem() called for:", item.title, item.id);
  
    // Favoritenstatus direkt aus _favoriteIds
    const isFavorite = this._favoriteIds.has(item.id);
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


  // 📋 Infoanzeige (oben im Detail)
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
  
    const isFavorite = this._favoriteIds.has(item.id);
    const heartIcon = isFavorite ? 'mdi:heart' : 'mdi:heart-outline';
    const favClass = isFavorite ? 'favorited' : '';
  
    // 🎬 Titel, Rating, Herz, Beschreibung
    cardInstance.info.innerHTML = `
      <div class="title-row" style="display:flex; align-items:center; gap:10px;">
        <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
        ${item.rating ? `<div class="rating">⭐ ${item.rating.toFixed(1)}</div>` : ''}
        <button class="fav-btn ${favClass}" data-id="${item.id}" title="Favorit umschalten">
          <ha-icon icon="${heartIcon}"></ha-icon>
        </button>
      </div>
  
      ${item.overview ? `<div class="description" style="margin-top:5px; font-size: 13px; color: var(--secondary-text-color);">${item.overview}</div>` : ''}
    `;
  
    // 💗 Herzbutton oben funktional machen
    const favBtn = cardInstance.info.querySelector('.fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const icon = favBtn.querySelector('ha-icon');
        const itemId = favBtn.dataset.id;
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
        } catch (err) {
          console.error('💥 Fehler beim Favorisieren:', err);
          favBtn.classList.toggle('favorited', !isFav);
          icon.setAttribute('icon', !isFav ? 'mdi:heart' : 'mdi:heart-outline');
        }
      });
    }
  }


  // 🔄 Hauptupdate der Liste
  async update(cardInstance, entity) {
    const maxItems =
      cardInstance.config[`${this.key}_max_items`] ||
      cardInstance.config.max_items ||
      10;

    let items = entity.attributes.data || [];
    items = items.slice(0, maxItems);

    // 🩷 Vorab Favoritenliste aus Emby laden
    await this.fetchFavoritesFromEmby(cardInstance);

    // 🧩 Markiere Favoriten in den Items
    items.forEach((item) => {
      const itemId = item.id || item.Id;
      item.isFavorite = this._favoriteIds.has(itemId);
    });

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    listElement.innerHTML = items
      .map((item, index) =>
        this.generateMediaItem(item, index, cardInstance.selectedType, cardInstance.selectedIndex)
      )
      .join('');

    // 💗 Herz-Klick-Handler hinzufügen
    this.attachFavListeners(listElement, cardInstance);
    
    // 🎥 Klick-Handler für Cover (Infos anzeigen)
    this.addClickHandlers(cardInstance, listElement, items);
    
    // 🎨 Styles sicherstellen
    this.ensureStyles(cardInstance);


  

    // 🎨 Hintergrund aktualisieren (max alle 30s)
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

  // 🎥 Klick auf Medien-Item (zum Anzeigen der Info)
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

        this.updateInfo(cardInstance, selectedItem);

        cardInstance.querySelectorAll('.media-item').forEach((i) => {
          i.classList.toggle(
            'selected',
            i.dataset.type === this.key && parseInt(i.dataset.index) === index
          );
        });
      };
    });
  }

  // 🎨 CSS für Herzbutton injizieren
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

  // 🧠 Favoriten abrufen (einmal pro Update)
  async fetchFavoritesFromEmby(cardInstance) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;
    if (!serverUrl || !apiKey || !userId) return;
  
    try {
      // ✅ Proxy-URL über Home Assistant
      const url = `${serverUrl}/Users/${userId}/Items?Filters=IsFavorite&Recursive=true&IncludeItemTypes=Movie,Series`;
      
      const res = await fetch(url, {
        headers: {
          "X-Emby-Token": apiKey,
          "Accept": "application/json"
        }
      });

  
      if (!res.ok) {
        console.error("❌ Emby-Favoriten konnten nicht geladen werden:", res.status);
        return;
      }
  
      const data = await res.json();
      const favorites = (data.Items || []).map((item) => item.Id);
      this._favoriteIds = new Set(favorites);
      console.log(`🔄 Emby-Favoriten geladen: ${favorites.length} Stück`);
    } catch (err) {
      console.warn("⚠️ Fehler beim Abrufen der Favoriten:", err);
    }
  }

  // ❤️ Emby: Zu Favoriten hinzufügen
  async addToFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } = cardInstance.config;
    if (!serverUrl || !apiKey || !userId) throw new Error("Emby-Konfiguration fehlt");
  
    const url = `${serverUrl}/Users/${userId}/FavoriteItems?ItemIds=${itemId}`;
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Emby-Token": apiKey,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error(`Favorit hinzufügen fehlgeschlagen: ${response.status}`);
      }
  
      console.log(`✅ Item ${itemId} erfolgreich favorisiert`);
    } catch (err) {
      console.error("💥 Fehler beim Favorisieren:", err);
      throw err;
    }
  }
  
  // 💔 Emby: Aus Favoriten entfernen
  async removeFromFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } = cardInstance.config;
    if (!serverUrl || !apiKey || !userId) throw new Error("Emby-Konfiguration fehlt");
  
    const url = `${serverUrl}/Users/${userId}/FavoriteItems?ItemIds=${itemId}`;
  
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "X-Emby-Token": apiKey,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        throw new Error(`Favorit entfernen fehlgeschlagen: ${response.status}`);
      }
  
      console.log(`✅ Item ${itemId} erfolgreich aus Favoriten entfernt`);
    } catch (err) {
      console.error("💥 Fehler beim Entfernen des Favoriten:", err);
      throw err;
    }
  }




  // 🩷 Klick-Handler für Herz-Buttons separat handhaben
  attachFavListeners(listElement, cardInstance) {
    listElement.addEventListener('click', async (e) => {
      const button = e.target.closest('.fav-btn');
      if (!button) return;
      e.stopPropagation();
  
      const icon = button.querySelector('ha-icon');
      const itemId = button.dataset.id;
      const isFav = button.classList.toggle('favorited');
  
      icon.setAttribute('icon', isFav ? 'mdi:heart' : 'mdi:heart-outline');
  
      try {
        if (isFav) {
          await this.addToFavorites(cardInstance, itemId);
          this._favoriteIds.add(itemId);
        } else {
          await this.removeFromFavorites(cardInstance, itemId);
          this._favoriteIds.delete(itemId);
        }
      } catch (err) {
        console.error("💥 Fehler beim Favorisieren:", err);
        // Status zurücksetzen
        button.classList.toggle('favorited', !isFav);
        icon.setAttribute('icon', !isFav ? 'mdi:heart' : 'mdi:heart-outline');
      }
    });
  }




  // 🖼️ Zufälliges Hintergrundbild
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
}


