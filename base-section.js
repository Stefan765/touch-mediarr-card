export class BaseSection {
  constructor(key, title) {
    this.key = key;
    this.title = title;
    this._lastBackgroundUpdate = 0;
    this._favoriteIds = new Set(); // 🩷 lokale Favoritenliste aus Emby
  }

  // 🧱 Template-Grundstruktur
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

  // 🎬 Einzelnes Medien-Item (Poster + Bewertung + Herz)
  generateMediaItem(item, index, selectedType, selectedIndex) {
    const isFavorite = item.isFavorite || false;
    const heartIcon = isFavorite ? "mdi:heart" : "mdi:heart-outline";
    const favClass = isFavorite ? "favorited" : "";

    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? "selected" : ""}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
        <div class="media-item-footer">
          ${item.rating ? `<span class="rating">⭐ ${item.rating.toFixed(1)}</span>` : ""}
          <button class="fav-btn ${favClass}" data-id="${item.Id}" title="Favorit umschalten">
            <ha-icon icon="${heartIcon}"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // 📋 Infoanzeige oben im Detailbereich
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
      <div class="title">${item.title}${item.year ? ` (${item.year})` : ""}</div>
      <div style="font-size: 10px; margin-top: 10px; color: yellow;">
        <div>Banner: ${item.banner ? "✓" : "✗"} ${item.banner || ""}</div>
        <div>Fanart: ${item.fanart ? "✓" : "✗"} ${item.fanart || ""}</div>
      </div>
    `;
  }

  // 🔄 Hauptupdate – lädt direkt aus Emby
  async update(cardInstance, entity) {
    const maxItems =
      cardInstance.config[`${this.key}_max_items`] ||
      cardInstance.config.max_items ||
      10;

    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;

    if (!serverUrl || !apiKey || !userId) {
      console.error("❌ Emby-Konfiguration unvollständig!");
      return;
    }

    let items = [];

    try {
      const res = await fetch(
        `${serverUrl}/Users/${userId}/Items?IncludeItemTypes=Movie,Series&SortBy=DateCreated&SortOrder=Descending&api_key=${apiKey}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      items = (data.Items || []).map((i) => ({
        Id: i.Id,
        title: i.Name,
        poster: `${serverUrl}/Items/${i.Id}/Images/Primary?api_key=${apiKey}`,
        rating: i.CommunityRating,
        year: i.ProductionYear,
        isFavorite: i.UserData?.IsFavorite,
        banner: `${serverUrl}/Items/${i.Id}/Images/Banner?api_key=${apiKey}`,
        fanart: `${serverUrl}/Items/${i.Id}/Images/Backdrop?api_key=${apiKey}`,
      }));

      console.log("📦 Emby Items geladen:", items.length);
    } catch (err) {
      console.error("💥 Fehler beim Laden der Emby-Items:", err);
    }

    items = items.slice(0, maxItems);

    // 🩷 Favoriten abrufen
    await this.fetchFavoritesFromEmby(cardInstance);

    // 🧩 Markiere Favoriten
    items.forEach((item) => {
      item.isFavorite = this._favoriteIds.has(item.Id.toString());
    });

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) return;

    listElement.innerHTML = items
      .map((item, index) =>
        this.generateMediaItem(
          item,
          index,
          cardInstance.selectedType,
          cardInstance.selectedIndex
        )
      )
      .join("");

    console.log(
      "🔍 Favoriten-Buttons gefunden:",
      listElement.querySelectorAll(".fav-btn").length
    );

    // ❤️ Klicklogik für Favoriten
    listElement.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const button = e.currentTarget;
        const itemId = button.dataset.id;
        const icon = button.querySelector("ha-icon");

        if (!itemId) {
          console.error("❌ Keine gültige Item-ID!");
          return;
        }

        const isFav = button.classList.toggle("favorited");
        icon.setAttribute("icon", isFav ? "mdi:heart" : "mdi:heart-outline");

        console.log(`💥 Favoriten-Klick erkannt: ${itemId} → Status: ${isFav}`);

        if (isFav) {
          await this.addToFavorites(cardInstance, itemId);
        } else {
          await this.removeFromFavorites(cardInstance, itemId);
        }
      });
    });

    this.ensureStyles(cardInstance);

    // 🎨 Hintergrundbild aktualisieren
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

  // 🎨 CSS-Stile für Favoriten-Button
  ensureStyles(cardInstance) {
    const card = cardInstance.closest("ha-card");
    if (card && !card.querySelector("style[data-fav-style]")) {
      const style = document.createElement("style");
      style.setAttribute("data-fav-style", "true");
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

  // 🧠 Favoriten aus Emby abrufen
  async fetchFavoritesFromEmby(cardInstance) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;
    if (!serverUrl || !apiKey || !userId) return;

    try {
      const url = `${serverUrl}/Users/${userId}/Items?Filters=IsFavorite&api_key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("❌ Fehler beim Abrufen der Favoriten:", res.status);
        return;
      }

      const data = await res.json();
      const favorites = (data.Items || []).map((item) =>
        item.Id?.toString()
      );
      this._favoriteIds = new Set(favorites);
      console.log(`🔄 Emby-Favoriten geladen: ${favorites.length} Stück`);
    } catch (err) {
      console.error("💥 Fehler beim Abrufen der Favoriten:", err);
    }
  }

  // ❤️ Zu Favoriten hinzufügen
  async addToFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;
    if (!serverUrl || !apiKey || !userId || !itemId) {
      console.error("❌ Keine gültige Item-ID oder Config!");
      return;
    }

    try {
      const url = `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?X-Emby-Client=Emby+Web&X-Emby-Device-Name=Edge+Windows&X-Emby-Device-Id=4f45ae69-e016-431b-9308-27005faf01bf&X-Emby-Client-Version=4.9.2.6&X-Emby-Token=${apiKey}`;
      const res = await fetch(url, { method: "POST" });

      if (res.ok) {
        console.log(`✅ Item ${itemId} zu Favoriten hinzugefügt.`);
        this._favoriteIds.add(itemId);
      } else {
        console.error("❌ Fehler beim Hinzufügen:", res.status, await res.text());
      }
    } catch (err) {
      console.error("💥 Fehler beim Favorisieren:", err);
    }
  }

  // 💔 Aus Favoriten entfernen
  async removeFromFavorites(cardInstance, itemId) {
    const { emby_url: serverUrl, emby_api_key: apiKey, emby_user_id: userId } =
      cardInstance.config;
    if (!serverUrl || !apiKey || !userId || !itemId) {
      console.error("❌ Keine gültige Item-ID oder Config!");
      return;
    }

    try {
      const url = `${serverUrl}/Users/${userId}/FavoriteItems/${itemId}?X-Emby-Client=Emby+Web&X-Emby-Device-Name=Edge+Windows&X-Emby-Device-Id=4f45ae69-e016-431b-9308-27005faf01bf&X-Emby-Client-Version=4.9.2.6&X-Emby-Token=${apiKey}`;
      const res = await fetch(url, { method: "DELETE" });

      if (res.ok) {
        console.log(`🗑️ Item ${itemId} aus Favoriten entfernt.`);
        this._favoriteIds.delete(itemId);
      } else {
        console.error("❌ Fehler beim Entfernen:", res.status, await res.text());
      }
    } catch (err) {
      console.error("💥 Fehler beim Entfernen:", err);
    }
  }

  // 🖼️ Zufälliges Hintergrundbild
  getRandomArtwork(items) {
    if (!items || items.length === 0) return null;
    const validItems = items.filter(
      (item) => item.fanart || item.banner
    );
    if (validItems.length === 0) return null;
    const randomItem =
      validItems[Math.floor(Math.random() * validItems.length)];
    return randomItem.fanart || randomItem.banner;
  }
}
