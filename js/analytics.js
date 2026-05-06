// Analytics Tracking for Hpower Car Rental
(function() {
    let visitId = null;
    let sessionStart = Date.now();

    // Get visitor data
    function getVisitorData() {
        return {
            // ip_address, country, city are obtained from backend
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'Direct',
            page_url: window.location.href,
            page_title: document.title,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        };
    }

    // Track visit on page load
    async function trackVisit() {
        try {
            const data = getVisitorData();
            console.log('Sending analytics data:', data);
            const response = await fetch('http://localhost:3000/api/v1/analytics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Analytics response status:', response.status);
            if (response.ok) {
                const result = await response.json();
                console.log('Analytics response data:', result);
                if (result.success && result.data) {
                    visitId = result.data.id;
                    console.log('Visit tracked:', visitId);
                }
            } else {
                console.error('Analytics request failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }

    // Update session duration on page unload
    function updateSessionDuration() {
        if (!visitId) return;

        const duration = Math.round((Date.now() - sessionStart) / 1000);
        
        // Use navigator.sendBeacon for reliable sending on page unload
        const data = JSON.stringify({
            id: visitId,
            duration_seconds: duration
        });

        navigator.sendBeacon('http://localhost:3000/api/v1/analytics/session', data);
    }

    // Initialize tracking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackVisit);
    } else {
        trackVisit();
    }

    // Track session duration on page unload
    window.addEventListener('beforeunload', updateSessionDuration);
    window.addEventListener('pagehide', updateSessionDuration);

    // Also update every 30 seconds (in case user stays on page)
    setInterval(() => {
        if (visitId) {
            const duration = Math.round((Date.now() - sessionStart) / 1000);
            fetch('http://localhost:3000/api/v1/analytics/session', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: visitId,
                    duration_seconds: duration
                })
            }).catch(err => console.error('Error updating session:', err));
        }
    }, 30000);

    // Expose to window for debugging
    window.HpowerAnalytics = {
        trackVisit,
        updateSessionDuration,
        getVisitId: () => visitId
    };
})();
