// sections/radarr-section.js
import { BaseSection } from './base-section.js';

export class RadarrSection extends BaseSection {
  constructor() {
    super('radarr', 'Radarr Moviess');  // Default name if no label provided
  }

  generateTemplate(config) {
    // Get label from config or use default
    const label = config?.radarr_label ?? 'Upcoming Movies';
    return `
      <div class="section" data-section="${this.key}">
        <div class="section-header">
          <div class="section-header-content">
            <ha-icon class="section-toggle-icon" icon="mdi:chevron-down"></ha-icon>
            <div class="section-label">${label}</div>
          </div>
        </div>
        <div class="section-content">
          <div class="${this.key}-list"></div>
        </div>
      </div>
    `;
  }

  updateInfo(cardInstance, item) {
    super.updateInfo(cardInstance, item);  // Handle backgrounds
    
    if (!item) return;
    if (item.title_default) {
        cardInstance.info.innerHTML = '';
        return;
    }

    let releaseDate = '';
    if (item.release && !item.release.includes('Unknown')) {
        const dateStr = item.release.split(' - ')[1] || item.release;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            releaseDate = date.toLocaleDateString();
        }
    }

    const runtime = item.runtime ? `${item.runtime} min` : '';

    cardInstance.info.innerHTML = `
        <div class="title">${item.title}${item.year ? ` (${item.year})` : ''}</div>
        <div class="details">${item.genres || ''}</div>
        <div class="metadata">${releaseDate}${runtime ? ` | ${runtime}` : ''}</div>
        ${item.overview ? `<div class="overview">${item.overview}</div>` : ''}
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    // Handle empty state
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">No upcoming Movies</div>
        </div>
      `;
    }

    // Use original media item layout
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }
}
