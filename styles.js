// styles.js
export const styles = `
:root {
  --card-padding: 0;
  --section-spacing: 8px;
  --item-spacing: 4px;
  --border-radius: 4px;
  --transition-duration: 0.3s;

  /* Colors */
  --overlay-gradient: linear-gradient(transparent, rgba(0,0,0,0.8));
  --status-pending-bg: #ffa726;
  --status-approved-bg: #66bb6a;
  --status-declined-bg: #ef5350;
  --status-available-bg: #29b6f6;
  --status-unknown-bg: #9e9e9e;

  --card-shadow: 0 2px 4px rgba(0,0,0,0.1);
  --hover-shadow: 0 4px 8px rgba(0,0,0,0.2);

  --title-size: 1.2em;
  --subtitle-size: 0.9em;
  --caption-size: 0.75em;
}

/* Card Structure */
ha-card {
  overflow: hidden;
  padding: var(--card-padding);
  position: relative;
  background: transparent;
  margin: 0;
  width: 100%;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 0;
}

/* Background Layers */
.card-background,
.media-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: all var(--transition-duration) ease-in-out;
}

.card-background {
  filter: blur(20px) brightness(0.7);
  transform: scale(1.2);
  z-index: 0;
}

.media-background {
  filter: blur(var(--blur-radius, 0px));
  transform: scale(1.1);
  opacity: 0.3;
}

/* Media Content Area */
.media-content {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  margin-bottom: var(--section-spacing);
  cursor: pointer;
}

.media-content:hover .media-background {
  transform: scale(1.15);
}

.media-info {
  position: relative;
  padding: 12px;
  background: var(--overlay-gradient);
  color: white;
  z-index: 1;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  user-select: none;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-duration) ease;
  margin-bottom: 0;
}

.section-header:hover {
  background-color: var(--secondary-background-color, rgba(0,0,0,0.05));
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-toggle-icon {
  transition: transform var(--transition-duration) ease;
}

.section-label {
  font-weight: 500;
  font-size: 10px;
  color: var(--primary-text-color);
  text-transform: uppercase;
  opacity: 0.9;
}

/* Section Content */
.section-content {
  max-height: 200px;
  transition: all var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-origin: top;
  opacity: 1;
}

.section-content.collapsed {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0);
}

/* Media Lists with CSS Grid */
[class*="-list"] {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  gap: 4px;
  overflow-x: auto;
  padding: 0 4px;
  margin: 0;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

[class*="-list"]::-webkit-scrollbar {
  height: 4px;
}

[class*="-list"]::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 2px;
}

[class*="-list"]::-webkit-scrollbar-thumb {
  background: var(--primary-color, #29b6f6);
  border-radius: 2px;
}

/* Hide scrollbars on mobile */
@media (max-width: 600px) {
  [class*="-list"] {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  [class*="-list"]::-webkit-scrollbar {
    display: none;
  }
}

/* Media Items */
.media-item {
  width: 85px;
  height: 135px;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: var(--card-shadow);
  display: grid;
  place-items: end start;
  background: #000;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.media-item.selected {
  box-shadow: 0 0 0 2px var(--primary-color, #29b6f6);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  border-radius: 8px;
}

.media-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.85) 100%);
  border-radius: 8px;
  pointer-events: none;
}

.media-item-title {
  font-size: 0.75em;
  font-weight: 500;
  color: white;
  padding: 4px 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  z-index: 1;
}

/* Content Typography */
.title {
  font-size: var(--title-size);
  font-weight: 500;
  margin-bottom: 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.summary {
  font-size: 0.75em;
  opacity: 0.85;
  margin-top: 6px;
  line-height: 1.3;
  max-height: 3.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1em;
  margin-bottom: 2px;
  opacity: 0.9;
}

.overview {
  margin-top: 2px;
  font-size: 0.7em;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty State */
.empty-section-content {
  padding: 16px;
  text-align: center;
  color: var(--secondary-text-color);
}

.empty-message {
  font-size: var(--subtitle-size);
  opacity: 0.7;
}

/* Status Indicators */
.status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--border-radius);
  font-size: var(--subtitle-size);
  cursor: pointer;
  transition: transform var(--transition-duration) ease, box-shadow var(--transition-duration) ease;
}

.status:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status:active {
  transform: translateY(0);
}

.status-pending { background: var(--status-pending-bg); }
.status-approved { background: var(--status-approved-bg); }
.status-declined { background: var(--status-declined-bg); }
.status-available { background: var(--status-available-bg); }
.status-unknown { background: var(--status-unknown-bg); }

/* Request Button */
.request-button-container { margin: 0; }

.request-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--subtitle-size);
}

.request-button:hover {
  background: var(--primary-color-light, #35baf6);
}

.request-button ha-icon {
  --mdc-icon-size: 18px;
}

/* Now Playing Section */
.now-playing {
  position: relative;
  width: 100%;
  height: 60px;
  overflow: hidden;
  margin-bottom: var(--section-spacing);
  border-radius: var(--border-radius);
}

.now-playing-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(10px) brightness(0.3);
  transform: scale(1.2);
}

.now-playing-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  height: 44px;
  color: white;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255,255,255,0.2);
}

.progress-bar-fill {
  height: 100%;
  background: var(--primary-color);
  width: 0%;
  transition: width 1s linear;
}

/* Client Modal */
.client-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.client-modal-content {
  background: var(--card-background-color, #1c1c1c);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.client-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.client-modal-title {
  font-size: var(--title-size);
  font-weight: 500;
}

.client-modal-close {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-duration) ease;
}

.client-modal-close:hover {
  opacity: 1;
}

.client-list {
  padding: 8px;
}

.client-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: background-color var(--transition-duration) ease;
}

.client-item:hover {
  background-color: rgba(255,255,255,0.1);
}

.client-item-info { flex: 1; }

.client-item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.client-item-details {
  font-size: var(--caption-size);
  opacity: 0.7;
}

/* Utility Classes */
.hidden { display: none !important; }

/* Responsive Design */
@media (min-width: 600px) {
  .media-content { height: 140px; }
}

@media (max-width: 600px) {
  .overview { -webkit-line-clamp: 1; }
  .section-header { padding: 6px; }
  .media-item { width: 85px; height: 128px; }
  .request-button { padding: 8px 12px; font-size: 0.7em; }
}
`;
