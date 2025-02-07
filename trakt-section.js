// sections/trakt-section.js
import { BaseSection } from './base-section.js';

export class TraktSection extends BaseSection {
  constructor() {
    super('trakt', 'Trakt Popular');
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster || '/api/placeholder/400/600'}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }

  updateInfo(cardInstance, item) {
    if (!item) return;

    // TMDB/Trakt specific image selection (using backdrop)
    const mediaBackground = item.backdrop || item.poster;
    const cardBackground = item.backdrop || item.poster;
    
    if (mediaBackground) {
        cardInstance.background.style.backgroundImage = `url('${mediaBackground}')`;
        cardInstance.background.style.opacity = cardInstance.config.opacity || 0.7;
    }

    if (cardBackground && cardInstance.cardBackground) {
        cardInstance.cardBackground.style.backgroundImage = `url('${cardBackground}')`;
    }

    // Add any TMDB/Trakt specific info display
    cardInstance.info.innerHTML = `
        <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
        ${this.getAdditionalInfo(item)}
    `;
  }
}