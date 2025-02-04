// seer-section.js
import { BaseSection } from './base-section.js';

export class SeerSection extends BaseSection {
  constructor() {
    super('seer', 'Media Requests');
    
    // Status mappings
    this.statusMap = {
      1: { text: 'Pending', icon: 'mdi:clock-outline', class: 'status-pending' },
      2: { text: 'Approved', icon: 'mdi:check-circle-outline', class: 'status-approved' },
      3: { text: 'Declined', icon: 'mdi:close-circle-outline', class: 'status-declined' },
      4: { text: 'Available', icon: 'mdi:download-circle-outline', class: 'status-available' }
    };
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

    // Get status details
    const statusInfo = this._getStatusInfo(item.status);

    // Otherwise show the request details
    cardInstance.info.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="details">
        <span class="status ${statusInfo.class}">
          <i class="${statusInfo.icon}"></i>
          ${statusInfo.text}
        </span>
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

    // Get status info
    const statusInfo = this._getStatusInfo(item.status);
    
    return `
      <div class="media-item ${selectedType === this.key && index === selectedIndex ? 'selected' : ''}"
           data-type="${this.key}"
           data-index="${index}">
        <div class="request-status ${statusInfo.class}">
          <i class="${statusInfo.icon}"></i>
        </div>
        <img src="${item.poster}" alt="${item.title}">
        <div class="media-item-title">${item.title}</div>
      </div>
    `;
  }

  _getStatusInfo(statusCode) {
    // Convert status to number if it's a string
    const status = Number(statusCode) || 1; // Default to pending (1) if invalid
    return this.statusMap[status] || {
      text: 'Unknown',
      icon: 'mdi:help-circle-outline',
      class: 'status-unknown'
    };
  }
}