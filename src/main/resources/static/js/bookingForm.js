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
    const modelFilterInput = document.getElementById('filter-model');
    const maxPriceFilterInput = document.getElementById('filter-max-price');
    const seatsFilterSelect = document.getElementById('filter-seats');
    const submitButton = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const queryParams = new URLSearchParams(window.location.search);
    const preselectedCarId = Number(queryParams.get('carId'));

    const state = {
        selectedTier: config.defaultTier || null,
        selectedCar: null,
        cars: [],
        userId: null,
        filters: { model: '', maxPrice: null, minSeats: null },
        priceCache: new Map()
    };

    const fillSelect = (select, options) => {
        if (!select) return;
        select.innerHTML = '<option value="">Choose option</option>' + options.map((option) => `<option value="${option}">${option}</option>`).join('');
    };

    const dateTimeLocalNow = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };

    const showSuccessModal = (bookingId) => {
        const existing = document.getElementById('booking-success-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'booking-success-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <img class="modal-icon" src="images/success-green.svg" alt="Success" />
                <h3>Booking created successfully</h3>
                <p>Your booking #${bookingId} was created.</p>
                <a href="index.html">Go to dashboard</a>
            </div>
        `;
        document.body.appendChild(overlay);
    };

    const mustEnablePicker = () => config.isReady({ startInput, endInput, pickupInput, destinationInput });

    const syncState = () => {
        if (startInput && endInput && endInput.value) {
            endInput.min = startInput.value || dateTimeLocalNow();
            if (startInput.value && endInput.value < startInput.value) {
                endInput.value = startInput.value;
            }
        }
        const pickerReady = mustEnablePicker();
        pickerToggle.disabled = !pickerReady;
        if (!state.selectedCar) {
            submitButton.disabled = true;
        }
        if (state.cars.length) {
            renderCars();
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

    const parsePriceValue = (priceText) => {
        const normalized = (priceText || '').replace(',', '.');
        const matched = normalized.match(/-?\d+(?:\.\d+)?/);
        return matched ? Number(matched[0]) : Number.NaN;
    };

    const populateSeatsFilter = () => {
        if (!seatsFilterSelect) return;
        const uniqueSeats = [...new Set(state.cars.filter((car) => car.available).map((car) => car.seats))]
            .sort((a, b) => a - b);
        seatsFilterSelect.innerHTML = '<option value="">Any seats</option>' +
            uniqueSeats.map((seats) => `<option value="${seats}">${seats}+</option>`).join('');
    };

    const filteredCars = () => state.cars.filter((car) => {
        const pickerReady = mustEnablePicker();
        if (!car.available) return false;
        if (state.selectedTier && car.serviceTier !== state.selectedTier) return false;
        if (state.filters.model && !car.model.toLowerCase().includes(state.filters.model)) return false;
        if (state.filters.minSeats && car.seats < state.filters.minSeats) return false;
        if (!pickerReady) return true;
        const carPrice = state.priceCache.get(car.id);
        return !(state.filters.maxPrice !== null && Number.isFinite(carPrice) && carPrice > state.filters.maxPrice);
    });

    const preloadPrices = async () => {
        if (!mustEnablePicker()) return;
        const candidates = state.cars.filter((car) => car.available && (!state.selectedTier || car.serviceTier === state.selectedTier));
        await Promise.all(candidates.map(async (car) => {
            if (state.priceCache.has(car.id)) return;
            const priceText = await priceForCar(car);
            state.priceCache.set(car.id, parsePriceValue(priceText));
        }));
    };

    const renderCars = async () => {
        await preloadPrices();
        const cars = filteredCars();
        if (!cars.length) {
            carsList.innerHTML = '<div class="empty">No cars match selected filters.</div>';
            return;
        }
        const pickerReady = mustEnablePicker();
        const cards = await Promise.all(cars.map(async (car) => {
            const price = pickerReady ? await priceForCar(car) : 'Set date and time first';
            const image = car.imgUrl || car.imgurl || 'images/car-default.png';
            return `
              <article class="card car-card select-card ${state.selectedCar?.id === car.id ? 'selected' : ''}" data-id="${car.id}">
                <img class="car-cover" src="${image}" alt="${car.model}" onerror="this.src='images/car-default.png'" />
                <div class="card-head">
                    <h3>${car.model}</h3>
                    <span class="tier-pill">${car.serviceTier}</span>
                </div>
                <div class="info-grid compact">
                    <div class="metric"><span class="metric-label">Seats</span><strong><img src="images/user.svg" alt="" class="inline-icon"/>${car.seats}</strong></div>
                    <div class="metric"><span class="metric-label">Plate</span><strong>${car.registrationNumber}</strong></div>
                    <div class="metric metric-price"><span class="metric-label">Price</span><strong>${price}</strong></div>
                    <div class="metric metric-available"><span class="metric-label">Availability</span><strong>Available</strong></div>
                </div>
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

    const applyPreselectedCar = () => {
        if (!Number.isFinite(preselectedCarId) || preselectedCarId <= 0) return;

        const matchedCar = state.cars.find((car) => car.id === preselectedCarId && car.available);
        if (!matchedCar) return;

        state.selectedTier = matchedCar.serviceTier;
        state.selectedCar = matchedCar;
        pickerToggle.textContent = `${matchedCar.model} (${matchedCar.serviceTier})`;
        submitButton.disabled = !state.userId;
    };

    const loadCars = async () => {
        const response = await fetch('/api/cars');
        if (!response.ok) throw new Error('Failed to load cars.');
        state.cars = await response.json();
        applyPreselectedCar();
        renderTiers();
        populateSeatsFilter();
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
        showSuccessModal(booking.id);
    };

    const bootstrap = async () => {

        const minDateTime = dateTimeLocalNow();
        if (startInput) {
            startInput.min = minDateTime;
        }
        if (endInput) {
            endInput.min = minDateTime;
        }

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

        if (modelFilterInput) {
            modelFilterInput.addEventListener('input', async () => {
                state.filters.model = modelFilterInput.value.trim().toLowerCase();
                await renderCars();
            });
        }
        if (maxPriceFilterInput) {
            const updateMaxPrice = async () => {
                state.filters.maxPrice = maxPriceFilterInput.value ? Number(maxPriceFilterInput.value) : null;
                await renderCars();
            };
            maxPriceFilterInput.addEventListener('input', updateMaxPrice);
            maxPriceFilterInput.addEventListener('change', updateMaxPrice);
        }
        if (seatsFilterSelect) {
            seatsFilterSelect.addEventListener('change', async () => {
                state.filters.minSeats = seatsFilterSelect.value ? Number(seatsFilterSelect.value) : null;
                await renderCars();
            });
        }

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
            await loadCars();
        } catch (error) {
            formMessage.textContent = error.message;
        }
    };

    bootstrap();
}
//TODO: make something after submit (reload page or go to the dashboard)