/**
 * Lightweight Toastr Replacement
 * A minimal notification system for success, error
 */

const toastr = (function() {
    const config = {
        duration: 3000,  // Duration in milliseconds
        position: 'top-right'  // Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
    };

    function initContainer() {
        let container = document.getElementById('toastr-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastr-container';
            container.className = `toastr-container toastr-${config.position}`;
            document.body.appendChild(container);
        }
        return container;
    }

    function createNotification(message, title, type) {
        const container = initContainer();
        
        const notification = document.createElement('div');
        notification.className = `toastr toastr-${type}`;
        notification.setAttribute('role', 'alert');
        
        let html = '';
        if (title) {
            html += `<div class="toastr-title">${escapeHtml(title)}</div>`;
        }
        html += `<div class="toastr-message">${escapeHtml(message)}</div>`;
        
        notification.innerHTML = html;
        container.appendChild(notification);
        
        return notification;
    }

    // Escape HTML to prevent **XSS**
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function removeNotification(notification) {
        notification.classList.add('toastr-removing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    function show(message, title, type) {
        const notification = createNotification(message, title, type);

        setTimeout(() => {
            notification.classList.add('toastr-show');
        }, 10);

        setTimeout(() => {
            removeNotification(notification);
        }, config.duration);

        notification.addEventListener('click', () => {
            removeNotification(notification);
        });
    }

    // Public API (can be extended with more types like 'info', 'warning')
    return {
        success: function(message, title) {
            show(message, title, 'success');
        },
        error: function(message, title) {
            show(message, title, 'error');
        },
        clear: function() {
            const container = document.getElementById('toastr-container');
            if (container) {
                container.innerHTML = '';
            }
        }
    };
})();
