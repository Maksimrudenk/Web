const bookingMessage = document.getElementById('booking-message');
const bookingForm = document.getElementById('booking-form');
const title = document.getElementById('booking-title');
const deleteBtn = document.getElementById('delete-booking-btn');
const userIdInput = document.getElementById('booking-user-id');
const typeInput = document.getElementById('booking-type');
const statusInput = document.getElementById('booking-status');
const startInput = document.getElementById('time-start');
const endInput = document.getElementById('time-end');
const pickupInput = document.getElementById('pickup-location');
const destinationInput = document.getElementById('destination');
const tripFields = document.getElementById('trip-fields');
const hireFields = document.getElementById('hire-fields');
const pickerToggle = document.getElementById('car-picker-toggle');
const carPicker = document.getElementById('car-picker');
const tierTabs = document.getElementById('tier-tabs');
const carsList = document.getElementById('cars-list');
const modelFilterInput = document.getElementById('filter-model');
const maxPriceFilterInput = document.getElementById('filter-max-price');
const seatsFilterSelect = document.getElementById('filter-seats');
const receiptBtn = document.getElementById('receipt-btn');

const params = new URLSearchParams(window.location.search);
const bookingId = params.get('id');
const preselectedUserId = params.get('userId');
let currentUserId = preselectedUserId ? Number(preselectedUserId) : null;

const state = { selectedTier: 'ECONOMY', selectedCar: null, cars: [], filters: { model: '', maxPrice: null, minSeats: null } };

function typeIsTrip() { return typeInput.value === 'TRIP'; }

function canOpenReceipt(status) {
    return status === 'PAID' || status === 'COMPLETED';
}

function syncReceiptLink() {
    if (!bookingId || !canOpenReceipt(statusInput.value)) {
        receiptBtn.classList.add('hidden');
        receiptBtn.dataset.href = '';
        return;
    }

    receiptBtn.dataset.href = `receipt.html?bookingId=${encodeURIComponent(bookingId)}`;
    receiptBtn.classList.remove('hidden');
}

function syncTypeFields() {
    const isTrip = typeIsTrip();
    tripFields.classList.toggle('hidden', !isTrip);
    hireFields.classList.toggle('hidden', isTrip);
    pickupInput.required = isTrip;
    destinationInput.required = isTrip;
    endInput.required = !isTrip;
}

function parsePriceValue(priceText) {
    const normalized = (priceText || '').replace(',', '.');
    const matched = normalized.match(/-?\d+(?:\.\d+)?/);
    return matched ? Number(matched[0]) : Number.NaN;
}

async function priceForCar(car) {
    if (typeIsTrip()) {
        const response = await fetch('/api/prices/trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pickupLocation: pickupInput.value, destination: destinationInput.value, carId: car.id }) });
        if (!response.ok) throw new Error('Failed to calculate price');
        return response.text();
    }
    const response = await fetch('/api/prices/hire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: startInput.value, hireEnd: endInput.value, carId: car.id }) });
    if (!response.ok) throw new Error('Failed to calculate price');
    return response.text();
}

function populateSeatsFilter() {
    const uniqueSeats = [...new Set(state.cars.filter((car) => car.available).map((car) => car.seats))].sort((a, b) => a - b);
    seatsFilterSelect.innerHTML = '<option value="">Any seats</option>' + uniqueSeats.map((seats) => `<option value="${seats}">${seats}+</option>`).join('');
}

function filteredCars() {
    return state.cars.filter((car) => {
        if (!car.available) return false;
        if (state.selectedTier && car.serviceTier !== state.selectedTier) return false;
        if (state.filters.model && !car.model.toLowerCase().includes(state.filters.model)) return false;
        if (state.filters.minSeats && car.seats < state.filters.minSeats) return false;
        return true;
    });
}

async function renderCars() {
    const cars = filteredCars();
    if (!cars.length) {
        carsList.innerHTML = '<div class="empty">No cars match selected filters.</div>';
        return;
    }

    const cards = await Promise.all(cars.map(async (car) => {
        let price = 'Fill required fields';
        try {
            if (typeIsTrip() ? (pickupInput.value && destinationInput.value) : (startInput.value && endInput.value)) {
                price = await priceForCar(car);
            }
        } catch {
            price = 'Price unavailable';
        }
        const parsed = parsePriceValue(price);
        if (state.filters.maxPrice !== null && Number.isFinite(parsed) && parsed > state.filters.maxPrice) return null;
        return `<article class="card select-card ${state.selectedCar?.id === car.id ? 'selected' : ''}" data-id="${car.id}">
      <h3>${car.model}</h3>
      <div class="muted">Class: ${car.serviceTier}</div>
      <div class="muted">Seats: ${car.seats}</div>
      <div class="muted">Plate: ${car.registrationNumber}</div>
      <div class="muted">Price: ${price}</div>
    </article>`;
    }));

    carsList.innerHTML = cards.filter(Boolean).join('') || '<div class="empty">No cars match selected filters.</div>';
    carsList.querySelectorAll('.select-card').forEach((card) => {
        card.addEventListener('click', () => {
            state.selectedCar = state.cars.find((car) => car.id === Number(card.dataset.id));
            pickerToggle.textContent = `${state.selectedCar.model} (${state.selectedCar.serviceTier})`;
            carPicker.classList.add('hidden');
            renderCars();
        });
    });
}

function renderTiers() {
    const tiers = ['ECONOMY', 'COMFORT', 'BUSINESS', 'PREMIUM', 'VAN'];
    tierTabs.innerHTML = tiers.map((tier) => `<button type="button" class="tier-btn ${tier === state.selectedTier ? 'active' : ''}" data-tier="${tier}">${tier}</button>`).join('');
    tierTabs.querySelectorAll('.tier-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            state.selectedTier = button.dataset.tier;
            renderTiers();
            await renderCars();
        });
    });
}

async function loadCars() {
    const response = await fetch('/api/cars');
    if (!response.ok) throw new Error('Failed to load cars');
    state.cars = await response.json();
    populateSeatsFilter();
    renderTiers();
    await renderCars();
}

async function loadBooking() {
    if (!bookingId) {
        title.textContent = 'Create booking for user';
        deleteBtn.classList.add('hidden');
        if (preselectedUserId) userIdInput.value = preselectedUserId;
        if (preselectedUserId) currentUserId = Number(preselectedUserId);
        return;
    }
    const response = await fetch(`/api/bookings/${bookingId}`);
    if (!response.ok) throw new Error('Failed to load booking');
    const booking = await response.json();
    userIdInput.value = booking.userId || '';
    currentUserId = booking.userId || currentUserId;
    typeInput.value = booking.bookingType || 'TRIP';
    statusInput.value = booking.status || 'CREATED';
    startInput.value = booking.timeStart ? booking.timeStart.slice(0, 16) : '';
    pickupInput.value = booking.pickupLocation || 'CITY_CENTRE';
    destinationInput.value = booking.destination || 'AIRPORT';
    endInput.value = booking.hireEnd ? booking.hireEnd.slice(0, 16) : '';

    syncTypeFields();
    state.selectedCar = state.cars.find((car) => car.id === booking.car?.id) || null;
    if (state.selectedCar) pickerToggle.textContent = `${state.selectedCar.model} (${state.selectedCar.serviceTier})`;
    syncReceiptLink();
}

bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bookingMessage.textContent = 'Saving...';
    try {
        if (!state.selectedCar) throw new Error('Select car');

        if (!bookingId) {
            const payload = {
                userId: Number(userIdInput.value),
                carId: state.selectedCar.id,
                bookingType: typeInput.value,
                status: statusInput.value,
                timeStart: startInput.value
            };
            if (typeIsTrip()) {
                payload.pickupLocation = pickupInput.value;
                payload.destination = destinationInput.value;
            } else {
                payload.hireEnd = endInput.value;
            }
            const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Failed to create booking');
            const created = await response.json();
            currentUserId = created.userId || Number(userIdInput.value) || currentUserId;
            window.location.href = `adminBooking.html?id=${created.id}`;
            return;
        }

        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusInput.value, carId: state.selectedCar.id })
        });
        if (!response.ok) throw new Error('Failed to update booking');
        const updated = await response.json();
        statusInput.value = updated.status || statusInput.value;
        syncReceiptLink();
        bookingMessage.textContent = 'Booking updated.';
    } catch {
        bookingMessage.textContent = 'Failed to save booking.';
    }
});

deleteBtn.addEventListener('click', async () => {
    if (!bookingId) return;
    if (!window.confirm('Delete this booking?')) return;
    const response = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    if (!response.ok) {
        bookingMessage.textContent = 'Failed to delete booking.';
        return;
    }
    const redirectUserId = Number(userIdInput.value) || currentUserId;
    window.location.href = redirectUserId ? `adminUser.html?id=${redirectUserId}` : 'admin.html';
});

statusInput.addEventListener('change', syncReceiptLink);

typeInput.addEventListener('change', async () => {
    syncTypeFields();
    await renderCars();
});
[startInput, endInput, pickupInput, destinationInput].forEach((field) => field.addEventListener('change', renderCars));
modelFilterInput.addEventListener('input', async () => { state.filters.model = modelFilterInput.value.trim().toLowerCase(); await renderCars(); });
maxPriceFilterInput.addEventListener('input', async () => { state.filters.maxPrice = maxPriceFilterInput.value ? Number(maxPriceFilterInput.value) : null; await renderCars(); });
seatsFilterSelect.addEventListener('change', async () => { state.filters.minSeats = seatsFilterSelect.value ? Number(seatsFilterSelect.value) : null; await renderCars(); });
pickerToggle.addEventListener('click', () => carPicker.classList.toggle('hidden'));

receiptBtn.addEventListener('click', () => {
    if (receiptBtn.dataset.href) {
        window.location.href = receiptBtn.dataset.href;
    }
});

(async function init() {
    syncTypeFields();
    try {
        await loadCars();
        await loadBooking();
    } catch {
        bookingMessage.textContent = 'Failed to load booking page.';
    }
})();
