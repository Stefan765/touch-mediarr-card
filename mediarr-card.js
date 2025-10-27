// main-card.js
import { JellyfinSection } from './jellyfin-section.js';
import { styles } from './styles.js';

class MediarrCard extends HTMLElement {
  constructor() {
    super();
    this.selectedType = null;
    this.selectedIndex = 0;
    this.sections = {
      jellyfin: new JellyfinSection()
    };
  }

  initializeCard(hass) {
    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          ${this.sections.jellyfin.generateTemplate(this.config)}
        </div>

        <!-- Beschreibung-Popup -->
        <div id="descriptionModal" class="description-modal">
          <div class="description-modal-content">
            <span class="description-modal-close">&times;</span>
            <h2 id="descriptionTitle"></h2>
            <p id="descriptionText"></p>
          </div>
        </div>
      </ha-card>
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles + `
      /* Modal */
      .description-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0; top: 0;
        width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.7);
      }
      .description-modal.show { display: block; }
      .description-modal-content {
        background-color: #fff;
        margin: 10% auto;
        padding: 20px;
        width: 80%;
        max-width: 500px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      }
      .description-modal-close {
        float: right;
        font-size: 1.5em;
        cursor: pointer;
      }

      /* Verhindert Cover-Skalierung während Popup */
      .jellyfin-item.popup-active { transform: none !important; }
    `;
    this.appendChild(styleEl);

    // Long-Press Event-Listener
    this.querySelectorAll('.jellyfin-item').forEach((item, index) => {
      let timer;

      const start = () => {
        timer = setTimeout(() => {
          const entityId = this.config.jellyfin_entity;
          const data = hass.states[entityId]?.attributes?.data || [];
          const mediaItem = data[index];
          if (!mediaItem) return;

          const modal = this.querySelector('#descriptionModal');
          modal.classList.add('show');
          this.querySelector('#descriptionTitle').textContent = mediaItem.title || 'No Title';
          this.querySelector('#descriptionText').textContent = mediaItem.overview || 'No description available';

          item.classList.add('popup-active');
        }, 500); // 500ms Long-Press
      };

      const end = () => clearTimeout(timer);

      item.addEventListener('touchstart', start);
      item.addEventListener('mousedown', start);
      item.addEventListener('touchend', end);
      item.addEventListener('mouseup', end);
      item.addEventListener('mouseleave', end);
    });

    // Popup schließen
    const modal = this.querySelector('#descriptionModal');
    const closeButton = this.querySelector('.description-modal-close');
    closeButton.onclick = () => {
      modal.classList.remove('show');
      this.querySelectorAll('.jellyfin-item.popup-active').forEach(i => i.classList.remove('popup-active'));
    };
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };
  }

  set hass(hass) {
    if (!this.content) {
      this.initializeCard(hass);
    }
  }

  setConfig(config) {
    this.config = config;
  }
}

customElements.define('mediarr-card', MediarrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mediarr-card",
  name: "Mediarr Card",
  description: "Jellyfin Card with long-press popup"
});
