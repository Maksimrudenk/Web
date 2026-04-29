function createBookingPage(config) {
    const bookingForm = document.getElementById('booking-form');
    const startInput = document.getElementById('time-start');
    const endInput = document.getElementById('time-end');
    const pickupInput = document.getElementById('pickup-location');
    const destinationInput = document.getElementById('destination');
    const pickerToggle = document.getElementById('car-picker-toggle');
    const carPicker = document.getElementById('car-picker');
    const tierTabs = document.getElementById('tier-tabs');
    const carsList = document.getElementById('cars-list');
    const submitButton = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    const state = { selectedTier: config.defaultTier || null, selectedCar: null, cars: [], userId: null };

    const fillSelect = (select, options) => {
        if (!select) return;
        select.innerHTML = '<option value="">Choose option</option>' + options.map((option) => `<option value="${option}">${option}</option>`).join('');
    };

    const mustEnablePicker = () => config.isReady({ startInput, endInput, pickupInput, destinationInput });

    const syncState = () => {
        const pickerReady = mustEnablePicker();
        pickerToggle.disabled = !pickerReady;
        if (!state.selectedCar) {
            submitButton.disabled = true;
        }
    };

    const fetchUserId = async () => {
        const response = await fetch('/api/users/me');
        if (!response.ok) throw new Error('Unable to fetch current user.');
        const user = await response.json();
        state.userId = user.id;
    };

    const priceForCar = async (car) => {
        const payload = config.pricePayload({ startInput, endInput, pickupInput, destinationInput, car });
        const response = await fetch(config.priceEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to calculate price.');
        return response.text();
    };

    const filteredCars = () => state.cars.filter((car) => car.available && (!state.selectedTier || car.serviceTier === state.selectedTier));

    const renderCars = async () => {
        const cars = filteredCars();
        if (!cars.length) {
            carsList.innerHTML = '<div class="empty">No available cars for this class.</div>';
            return;
        }
        const cards = await Promise.all(cars.map(async (car) => {
            const price = await priceForCar(car);
            return `
              <article class="card select-card ${state.selectedCar?.id === car.id ? 'selected' : ''}" data-id="${car.id}">
                <h3>${car.model}</h3>
                <div class="muted">Class: ${car.serviceTier}</div>
                <div class="muted">Seats: ${car.seats}</div>
                <div class="muted">Plate: ${car.registrationNumber}</div>
                <div class="muted">Price: ${price}</div>
              </article>`;
        }));
        carsList.innerHTML = cards.join('');
        carsList.querySelectorAll('.select-card').forEach((card) => {
            card.addEventListener('click', () => {
                const selected = state.cars.find((car) => car.id === Number(card.dataset.id));
                state.selectedCar = selected;
                pickerToggle.textContent = `${selected.model} (${selected.serviceTier})`;
                carPicker.classList.add('hidden');
                submitButton.disabled = !state.userId;
                renderCars();
            });
        });
    };

    const loadCars = async () => {
        const response = await fetch('/api/cars');
        if (!response.ok) throw new Error('Failed to load cars.');
        state.cars = await response.json();
        await renderCars();
    };

    const renderTiers = () => {
        if (!tierTabs) return;
        tierTabs.innerHTML = config.tiers.map((tier) => `<button type="button" class="tier-btn ${tier === state.selectedTier ? 'active' : ''}" data-tier="${tier}">${tier}</button>`).join('');
        tierTabs.querySelectorAll('.tier-btn').forEach((button) => {
            button.addEventListener('click', async () => {
                state.selectedTier = button.dataset.tier;
                renderTiers();
                await renderCars();
            });
        });
    };

    const submitBooking = async (event) => {
        event.preventDefault();
        if (!state.selectedCar || !state.userId) return;

        const payload = config.bookingPayload({ state, startInput, endInput, pickupInput, destinationInput });
        const response = await fetch('/api/bookings', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) {
            formMessage.textContent = 'Booking creation failed.';
            return;
        }
        const booking = await response.json();
        formMessage.textContent = `Booking #${booking.id} created successfully.`;
    };

    const bootstrap = async () => {
        if (pickupInput && destinationInput) {
            fillSelect(pickupInput, config.locations);
            fillSelect(destinationInput, config.locations);
        }
        renderTiers();
        syncState();

        [startInput, endInput, pickupInput, destinationInput].filter(Boolean).forEach((field) => {
            field.addEventListener('input', syncState);
            field.addEventListener('change', syncState);
        });

        pickerToggle.addEventListener('click', async () => {
            if (pickerToggle.disabled) return;
            carPicker.classList.toggle('hidden');
            if (!carsList.innerHTML) {
                await loadCars();
            }
        });

        bookingForm.addEventListener('submit', submitBooking);

        try {
            await fetchUserId();
        } catch (error) {
            formMessage.textContent = error.message;
        }
    };

    bootstrap();
}
