// Reviews functionality for Hpower Car Rental
(function() {
    const SUPABASE_URL = 'https://xtvopaehirznzeyuanwc.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_LCKuoYEaj6uJ4SOTUkHKwA_CYXZYOjf';

    let selectedRating = 0;

    // Helper function to get translation
    function t(key) {
        if (typeof translations !== 'undefined' && translations[currentLang]) {
            const keys = key.split('.');
            let value = translations[currentLang];
            for (const k of keys) {
                value = value ? value[k] : '';
            }
            return value || key;
        }
        return key;
    }

    // Helper function to replace placeholders in translation
    function tReplace(key, replacements) {
        let text = t(key);
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{${placeholder}}`, value);
        }
        return text;
    }

    function initStarRating() {
        const starRating = document.getElementById('star-rating');
        const ratingInput = document.getElementById('review-rating');

        if (!starRating) {
            console.log('star-rating element not found');
            return;
        }

        const stars = starRating.querySelectorAll('span');
        console.log('Stars found:', stars.length);

        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = selectedRating;
                updateStars(selectedRating);
                console.log('Rating selected:', selectedRating);
            });

            star.addEventListener('mouseenter', function() {
                const hoverRating = parseInt(this.getAttribute('data-rating'));
                updateStars(hoverRating);
            });

            star.addEventListener('mouseleave', function() {
                updateStars(selectedRating);
            });
        });
    }

    function updateStars(rating) {
        const starRating = document.getElementById('star-rating');
        if (!starRating) return;
        const stars = starRating.querySelectorAll('span');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#4ecca3';
            } else {
                star.style.color = 'var(--border)';
            }
        });
    }

    // Load reviews from Supabase
    async function loadReviews() {
        const reviewsGrid = document.getElementById('reviews-grid');
        if (!reviewsGrid) return;

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews?is_approved=eq.true&rating=gte.3&order=created_at.desc&limit=6`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const reviews = await response.json();

            if (reviews.length === 0) {
                reviewsGrid.innerHTML = `<p style="text-align: center; color: var(--text-secondary); grid-column: 1/-1;">${t('reviews.noReviews')}</p>`;
                return;
            }

            reviewsGrid.innerHTML = reviews.map(review => `
                <div class="review-card fade-in" style="background: var(--card-bg); border-radius: 16px; padding: 28px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                    <div style="display: flex; align-items: center; margin-bottom: 18px;">
                        <div style="width: 55px; height: 55px; border-radius: 50%; background: linear-gradient(135deg, #4ecca3, #2563eb); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.4em; box-shadow: 0 2px 8px rgba(78, 204, 163, 0.3);">
                            ${review.name.charAt(0).toUpperCase()}
                        </div>
                        <div style="margin-left: 18px; flex: 1;">
                            <div style="font-weight: 700; color: var(--text-primary); font-size: 1.1em;">${review.name}</div>
                            <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 4px;">${formatDate(review.created_at)}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 18px; color: #4ecca3; font-size: 1.4em; letter-spacing: 2px;">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95em;">${review.comment}</p>
                </div>
            `).join('');

            // Add hover effect to cards
            const cards = reviewsGrid.querySelectorAll('.review-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                });
            });
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsGrid.innerHTML = `<p style="text-align: center; color: var(--error); grid-column: 1/-1;">${t('reviews.errorLoading')}</p>`;
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const locale = currentLang === 'es' ? 'es-ES' : 'en-US';
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Submit review form
    const reviewForm = document.getElementById('review-form');
    console.log('Review form element found:', !!reviewForm);
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            console.log('Form submit event triggered');
            e.preventDefault();

            const name = document.getElementById('review-name').value;
            const comment = document.getElementById('review-comment').value;
            const rating = parseInt(document.getElementById('review-rating').value);

            console.log('Form values:', { name, comment, rating });

            if (rating === 0) {
                alert(t('reviews.selectRating'));
                return;
            }

            const submitButton = reviewForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = t('reviews.submitting');

            try {
                console.log('Sending review to Supabase:', { name, comment, rating });
                
                const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: name,
                        comment: comment,
                        rating: rating,
                        is_approved: true
                    })
                });

                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    // Show personalized message based on rating
                    let message = '';
                    if (rating >= 4) {
                        message = tReplace('reviews.thanksHigh', { name });
                    } else if (rating <= 2) {
                        message = tReplace('reviews.thanksLow', { name });
                    } else {
                        message = tReplace('reviews.thanksMedium', { name });
                    }

                    alert(message);
                    reviewForm.reset();
                    selectedRating = 0;
                    updateStars(0);
                    loadReviews();
                } else {
                    throw new Error('Error al enviar reseña: ' + JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert(tReplace('reviews.submitError', { error: error.message }));
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = t('reviews.submitButton');
            }
        });
    }

    // Load reviews on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initStarRating();
            loadReviews();
        });
    } else {
        initStarRating();
        loadReviews();
    }
})();
