// seer-section.js
import { BaseSection } from './base-section.js';

export class SeerSection extends BaseSection {
  constructor() {
    super('seer', 'Media Requests');
  }

  updateInfo(cardInstance, item) {
    if (!item) return;

    // Update backgrounds using parent class functionality
    super.updateInfo(cardInstance, item);

    // If it's an empty state item, clear the info
    if (item.title_default) {
      cardInstance.info.innerHTML = '';
      return;
    }

    // Otherwise show the request details
    cardInstance.info.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="details">
        ${item.requested_by} - ${item.requested_date}
      </div>
    `;
  }

  generateMediaItem(item, index, selectedType, selectedIndex) {
    // Handle empty state
    if (item.title_default) {
      return `
        <div class="empty-section-content">
          <div class="empty-message">No pending media requests</div>
        </div>
      `;
    }

    // Use original media item layout with status
    const status = String(item.status || 'unknown');
    const statusClass = this._getStatusClass(status);
    
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <div class="request-status ${statusClass}">${status}</div>
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }

  _getStatusClass(status) {
    const statusMap = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'available': 'status-available',
      'processing': 'status-processing',
      'declined': 'status-declined'
    };
    return statusMap[status.toLowerCase()] || 'status-unknown';
  }
}