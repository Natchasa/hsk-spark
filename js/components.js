/**
 * HSK Spark 2.0 - Reusable UI Components
 */
const HSKComponents = {
    /**
     * Create an SVG circular progress ring
     * @param {number} percentage 
     * @param {string} type 'vocab' | 'grammar'
     * @returns {string} HTML string
     */
    renderProgressRing: function(percentage, type) {
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        return `
            <div class="progress-ring-container">
                <svg class="progress-ring" width="70" height="70">
                    <circle class="progress-ring-circle-bg" cx="35" cy="35" r="${radius}"></circle>
                    <circle class="progress-ring-circle ${type}" cx="35" cy="35" r="${radius}" 
                            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"></circle>
                </svg>
                <div class="progress-ring-text">${Math.round(percentage)}%</div>
            </div>
        `;
    },

    /**
     * Render a card header badge based on level
     * @param {number} level 
     * @returns {string} HTML
     */
    renderLevelBadge: function(level) {
        const colors = { 1: 'badge-red', 2: 'badge-gold', 3: 'badge-success', 4: 'badge-info' };
        const badgeColor = colors[level] || 'badge-red';
        return `<span class="badge ${badgeColor}">HSK ${level}</span>`;
    },

    /**
     * Render an alert card modal
     * @param {string} title 
     * @param {string} message 
     * @param {Function} onConfirm 
     */
    showAlert: function(title, message, onConfirm = null) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay animate-fade-in';
        overlay.innerHTML = `
            <div class="modal-content animate-pop-in">
                <div class="modal-close"><i class="fa-solid fa-xmark"></i></div>
                <h3 style="font-size: 1.3rem; margin-bottom: 12px; font-weight: 700;">${title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">${message}</p>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary" id="modal-confirm-btn">ตกลง</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => {
            overlay.classList.add('hide'); // fade out style
            setTimeout(() => overlay.remove(), 200);
        };

        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.querySelector('#modal-confirm-btn').addEventListener('click', () => {
            close();
            if (onConfirm) onConfirm();
        });
    }
};

window.HSKComponents = HSKComponents;
