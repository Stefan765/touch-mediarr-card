import { BaseSection } from "./base-section.js";

export class JellyfinSection extends BaseSection {
  constructor(key, title) {
    super(key, title);
  }

  // 🔄 Hauptupdate der Liste (lädt direkt aus Emby)
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
      // 🎬 Filme & Serien aus Emby laden
      const res = await fetch(
        `${serverUrl}/Users/${userId}/Items?IncludeItemTypes=Movie,Series&SortBy=DateCreated&SortOrder=Descending&Limit=${maxItems}&api_key=${apiKey}`
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

    // 🩷 Favoriten aus Emby abrufen
    await this.fetchFavoritesFromEmby(cardInstance);

    // 🧩 Favoriten markieren
    items.forEach((item) => {
      item.isFavorite = this._favoriteIds.has(item.Id.toString());
    });

    const listElement = cardInstance.querySelector(`.${this.key}-list`);
    if (!listElement) {
      console.error("❌ Kein Listenelement gefunden für:", this.key);
      return;
    }

    // 🎨 HTML für alle Elemente generieren
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

    // 💖 Klicklogik für Herz-Buttons
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
          this._favoriteIds.add(itemId);
        } else {
          await this.removeFromFavorites(cardInstance, itemId);
          this._favoriteIds.delete(itemId);
        }
      });
    });

    // 🖼️ Zufälliges Hintergrundbild setzen
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

    // 🧠 Klicks & Styles aktivieren
    this.addClickHandlers(cardInstance, listElement, items);
    this.ensureStyles(cardInstance);
  }
}
