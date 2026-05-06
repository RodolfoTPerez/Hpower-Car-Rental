// Banner Carousel for Hpower Car Rental
// Configurable carousel module with auto-play and navigation

class BannerCarousel {
    constructor(options = {}) {
        this.slideSelector = options.slideSelector || '.banner-slide';
        this.dotSelector = options.dotSelector || '.banner-dot';
        this.autoPlay = options.autoPlay !== undefined ? options.autoPlay : true;
        this.interval = options.interval || 5000;
        this.currentSlide = 0;
        this.slideInterval = null;
        this.slides = null;
        this.dots = null;
    }

    init() {
        this.slides = document.querySelectorAll(this.slideSelector);
        this.dots = document.querySelectorAll(this.dotSelector);

        if (this.slides.length === 0) {
            console.warn('No slides found for carousel');
            return;
        }

        // Bind goToSlide to window for onclick handlers in HTML
        window.carouselGoToSlide = (index) => this.goToSlide(index);

        // Initialize dots click handlers
        this.dots.forEach((dot, index) => {
            dot.onclick = () => this.goToSlide(index);
        });

        // Start auto-play if enabled
        if (this.autoPlay) {
            this.startAutoPlay();
        }
    }

    showSlide(index) {
        if (!this.slides || this.slides.length === 0) return;

        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
        });
        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.remove('active');
            });
        }

        this.slides[index].classList.add('active');
        if (this.dots && this.dots[index]) {
            this.dots[index].classList.add('active');
        }
        this.currentSlide = index;
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }

    goToSlide(index) {
        this.showSlide(index);
        if (this.autoPlay) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.slideInterval = setInterval(() => this.nextSlide(), this.interval);
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    destroy() {
        this.stopAutoPlay();
        if (window.carouselGoToSlide) {
            delete window.carouselGoToSlide;
        }
    }
}

// Initialize carousel when DOM is ready with default configuration
let bannerCarousel;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bannerCarousel = new BannerCarousel({
            autoPlay: true,
            interval: 5000
        });
        bannerCarousel.init();
    });
} else {
    bannerCarousel = new BannerCarousel({
        autoPlay: true,
        interval: 5000
    });
    bannerCarousel.init();
}
