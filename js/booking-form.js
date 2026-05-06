// Booking Form Logic for Hpower Car Rental
// Handles booking form validation and UI logic for index.html
// This is separate from booking.js which handles the HQ Rentals iframe

class BookingForm {
    constructor(options = {}) {
        this.formId = options.formId || 'booking-form';
        this.sameLocationId = options.sameLocationId || 'same_location';
        this.returnLocationId = options.returnLocationId || 'return_location';
        this.pickupLocationId = options.pickupLocationId || 'pickup_location';
        this.pickupDateId = options.pickupDateId || 'p_date';
        this.returnDateId = options.returnDateId || 'r_date';
        this.pickupTimeId = options.pickupTimeId || 'p_time';
        this.returnTimeId = options.returnTimeId || 'r_time';
        this.form = null;
        this.elements = {};
    }

    init() {
        this.form = document.getElementById(this.formId);
        if (!this.form) {
            console.warn('Booking form not found');
            return;
        }

        // Cache form elements
        this.elements = {
            sameLocation: document.getElementById(this.sameLocationId),
            returnLocation: document.getElementById(this.returnLocationId),
            pickupLocation: document.getElementById(this.pickupLocationId),
            pickupDate: document.getElementById(this.pickupDateId),
            returnDate: document.getElementById(this.returnDateId),
            pickupTime: document.getElementById(this.pickupTimeId),
            returnTime: document.getElementById(this.returnTimeId)
        };

        // Initialize default dates
        this.initializeDates();

        // Bind event listeners
        this.bindEventListeners();

        // Initialize UI state
        this.toggleReturnLocation();
    }

    initializeDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (this.elements.pickupDate) {
            this.elements.pickupDate.value = today.toISOString().split('T')[0];
        }
        if (this.elements.returnDate) {
            this.elements.returnDate.value = tomorrow.toISOString().split('T')[0];
        }
    }

    bindEventListeners() {
        // Same location checkbox toggle
        if (this.elements.sameLocation) {
            this.elements.sameLocation.addEventListener('change', () => this.toggleReturnLocation());
        }

        // Pickup location change
        if (this.elements.pickupLocation) {
            this.elements.pickupLocation.addEventListener('change', (e) => {
                if (this.elements.sameLocation && this.elements.sameLocation.checked) {
                    if (this.elements.returnLocation) {
                        this.elements.returnLocation.value = e.target.value;
                    }
                }
            });
        }

        // Pickup date validation
        if (this.elements.pickupDate) {
            this.elements.pickupDate.addEventListener('change', () => this.validatePickupDate());
        }

        // Pickup time validation
        if (this.elements.pickupTime) {
            this.elements.pickupTime.addEventListener('change', () => this.validatePickupTime());
        }

        // Form submission validation
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.validateForm(e));
        }
    }

    toggleReturnLocation() {
        if (!this.elements.sameLocation || !this.elements.returnLocation) return;

        const sameLocation = this.elements.sameLocation.checked;
        const returnSelect = this.elements.returnLocation;
        const pickupSelect = this.elements.pickupLocation;

        if (sameLocation) {
            returnSelect.disabled = true;
            if (pickupSelect) {
                returnSelect.value = pickupSelect.value;
            }
            returnSelect.style.opacity = '0.6';
        } else {
            returnSelect.disabled = false;
            returnSelect.style.opacity = '1';
        }
    }

    validatePickupDate() {
        if (!this.elements.pickupDate || !this.elements.returnDate) return;

        const pickupDate = new Date(this.elements.pickupDate.value);
        const returnDateInput = this.elements.returnDate;
        const returnDate = new Date(returnDateInput.value);

        if (returnDate <= pickupDate) {
            const minReturnDate = new Date(pickupDate);
            minReturnDate.setDate(minReturnDate.getDate() + 1);
            returnDateInput.value = minReturnDate.toISOString().split('T')[0];
        }
    }

    validatePickupTime() {
        if (!this.elements.pickupDate || !this.elements.returnDate || !this.elements.pickupTime || !this.elements.returnTime) return;

        const pickupDate = new Date(this.elements.pickupDate.value);
        const returnDate = new Date(this.elements.returnDate.value);

        const pTimeValue = this.elements.pickupTime.value;
        const rTimeSelect = this.elements.returnTime;

        if (pickupDate.toDateString() === returnDate.toDateString()) {
            const rTimeValue = rTimeSelect.value;

            if (pTimeValue >= rTimeValue) {
                const currentIndex = rTimeSelect.selectedIndex;
                const nextIndex = currentIndex + 1;
                if (nextIndex < rTimeSelect.options.length) {
                    rTimeSelect.selectedIndex = nextIndex;
                }
            }
        }
    }

    validateForm(event) {
        if (!this.elements.pickupDate || !this.elements.returnDate || !this.elements.pickupTime || !this.elements.returnTime) return;

        const pickupDate = new Date(this.elements.pickupDate.value);
        const returnDate = new Date(this.elements.returnDate.value);
        const pTime = this.elements.pickupTime.value;
        const rTime = this.elements.returnTime.value;

        // Get current language
        const currentLang = localStorage.getItem('lang') || 'es';

        // Validate return date
        if (returnDate <= pickupDate) {
            event.preventDefault();
            const message = currentLang === 'es' 
                ? 'La fecha de devolución debe ser posterior a la fecha de recogida' 
                : 'Return date must be after pickup date';
            alert(message);
            return false;
        }

        // Validate return time on same day
        if (pickupDate.toDateString() === returnDate.toDateString() && pTime >= rTime) {
            event.preventDefault();
            const message = currentLang === 'es'
                ? 'La hora de devolución debe ser posterior a la hora de recogida'
                : 'Return time must be after pickup time';
            alert(message);
            return false;
        }

        // Prevent default form submission and use manual navigation
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            if (value) params.append(key, value);
        }

        if (!params.has('target_step')) {
            params.set('target_step', '2');
        }

        window.location.href = form.getAttribute('action') + '?' + params.toString();
        return false;
    }

    destroy() {
        // Remove event listeners if needed
        if (this.form) {
            this.form.removeEventListener('submit', this.validateForm);
        }
    }
}

// Initialize booking form when DOM is ready
let bookingForm;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bookingForm = new BookingForm();
        bookingForm.init();
    });
} else {
    bookingForm = new BookingForm();
    bookingForm.init();
}
