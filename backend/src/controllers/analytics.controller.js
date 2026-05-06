const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Track a new visit
const trackVisit = async (req, res) => {
    try {
        // Get IP from request
        const ip_address = req.headers['x-forwarded-for']?.split(',')[0] || 
                          req.headers['x-real-ip'] || 
                          req.connection.remoteAddress || 
                          req.socket.remoteAddress ||
                          req.ip;

        console.log('Tracking visit - IP:', ip_address);
        console.log('Request body:', req.body);

        const {
            user_agent,
            referrer,
            page_url,
            page_title,
            screen_resolution,
            language
        } = req.body;

        // Get country and city from IP using ip-api.com (free service)
        let country = null;
        let city = null;
        
        try {
            const geoResponse = await fetch(`http://ip-api.com/json/${ip_address}`);
            const geoData = await geoResponse.json();
            console.log('Geolocation data:', geoData);
            if (geoData.status === 'success') {
                country = geoData.country;
                city = geoData.city;
                console.log('Country:', country, 'City:', city);
            }
        } catch (geoError) {
            console.log('Geolocation failed, continuing without it:', geoError.message);
        }

        const { data, error } = await supabase
            .from('analytics_visits')
            .insert({
                ip_address,
                user_agent,
                referrer,
                page_url,
                page_title,
                screen_resolution,
                language,
                country,
                city,
                session_start: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        console.log('Visit tracked successfully:', data);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error tracking visit:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update session duration
const updateSessionDuration = async (req, res) => {
    try {
        const { id, duration_seconds } = req.body;

        const { data, error } = await supabase
            .from('analytics_visits')
            .update({
                session_end: new Date().toISOString(),
                duration_seconds
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error updating session duration:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get analytics data
const getAnalytics = async (req, res) => {
    try {
        const { from, to, country } = req.query;

        let query = supabase
            .from('analytics_visits')
            .select('*')
            .order('session_start', { ascending: false });

        if (from) query = query.gte('session_start', from);
        if (to) query = query.lte('session_start', to);
        if (country) query = query.eq('country', country);

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get analytics summary
const getAnalyticsSummary = async (req, res) => {
    try {
        const { from, to } = req.query;

        let query = supabase
            .from('analytics_visits')
            .select('*');

        if (from) query = query.gte('session_start', from);
        if (to) query = query.lte('session_start', to);

        const { data, error } = await query;

        if (error) throw error;

        // Calculate summary
        const totalVisits = data.length;
        const uniqueVisitors = new Set(data.map(v => v.ip_address)).size;
        const avgDuration = data.length > 0 
            ? Math.round(data.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / data.length)
            : 0;
        
        // Visits by country
        const visitsByCountry = {};
        data.forEach(v => {
            if (v.country) {
                visitsByCountry[v.country] = (visitsByCountry[v.country] || 0) + 1;
            }
        });

        // Visits by page
        const visitsByPage = {};
        data.forEach(v => {
            if (v.page_url) {
                visitsByPage[v.page_url] = (visitsByPage[v.page_url] || 0) + 1;
            }
        });

        res.json({
            success: true,
            summary: {
                totalVisits,
                uniqueVisitors,
                avgDuration,
                visitsByCountry,
                visitsByPage
            }
        });
    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    trackVisit,
    updateSessionDuration,
    getAnalytics,
    getAnalyticsSummary
};
