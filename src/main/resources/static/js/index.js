const bookingsList = document.getElementById('bookings-list');
const recommendationsList = document.getElementById('recommendations-list');

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};

const setEmpty = (container, message) => {
    container.innerHTML = `<div class="empty">${message}</div>`;
};

const statusMeta = {
    CREATED: { label: 'Created', icon: 'images/bill-list.svg', cls: 'status-created' },
    CANCELED: { label: 'Canceled', icon: 'images/bill-cross.svg', cls: 'status-canceled' },
    CANCELLED: { label: 'Canceled', icon: 'images/bill-cross.svg', cls: 'status-canceled' },
    PAID: { label: 'Paid', icon: 'images/bill-check.svg', cls: 'status-paid' }
};

const bookingStatusBadge = (status) => {
    const key = String(status || '').toUpperCase();
    const meta = statusMeta[key] || { label: status || 'Unknown', icon: 'images/bill-list.svg', cls: 'status-created' };
    return `<span class="status-badge ${meta.cls}"><img src="${meta.icon}" alt="" class="inline-icon"/>${meta.label}</span>`;
};

function renderBookings(bookings) {
    const activeBookings = bookings.filter((booking) => !['COMPLETED', 'CANCELED', 'CANCELLED'].includes(booking.status));

    if (!activeBookings.length) {
        setEmpty(bookingsList, 'No active bookings found.');
        return;
    }

    bookingsList.innerHTML = activeBookings.map((booking) => `
      <article class="card booking-card">
        <div class="card-head">
          <h3>Booking #${booking.id}</h3>
          ${bookingStatusBadge(booking.status)}
        </div>
        <div class="info-grid compact">
          <div class="metric"><span class="metric-label">Start</span><strong>${formatDate(booking.timeStart)}</strong></div>
          <div class="metric metric-price"><span class="metric-label">Price</span><strong>${booking.price ?? '—'}</strong></div>
          <div class="metric"><span class="metric-label">Car</span><strong>${booking.car?.model || '—'}</strong></div>
          <div class="metric metric-tier"><span class="metric-label">Tier</span><strong>${booking.car?.serviceTier || '—'}</strong></div>
        </div>
        <a href="booking.html?id=${booking.id}">Open booking</a>
      </article>
    `).join('');
}

function renderRecommendations(cars) {
    const availableCars = cars.filter((car) => car.available === true);

    if (!availableCars.length) {
        setEmpty(recommendationsList, 'No available cars at the moment.');
        return;
    }

    const randomCars = [...availableCars].sort(() => Math.random() - 0.5).slice(0, 4);
    recommendationsList.innerHTML = randomCars.map((car) => {
        const targetPage = car.serviceTier === 'VAN' ? 'vanHire.html' : 'hire.html';
        const image = car.imgUrl || car.imgurl || 'images/car-default.png';
        return `
        <article class="card car-card">
          <img class="car-cover" src="${image}" alt="${car.model}" onerror="this.src='images/car-default.png'" />
          <div class="card-head">
            <h3>${car.model}</h3>
            <span class="tier-pill">${car.serviceTier}</span>
          </div>
          <div class="info-grid compact">
            <div class="metric"><span class="metric-label">Seats</span><strong><img src="images/user.svg" alt="" class="inline-icon"/>${car.seats}</strong></div>
            <div class="metric"><span class="metric-label">Plate</span><strong>${car.registrationNumber}</strong></div>
            <div class="metric metric-price"><span class="metric-label">Price</span><strong>${car.price}</strong></div>
            <div class="metric metric-available"><span class="metric-label">Availability</span><strong>Available</strong></div>
          </div>
          <a href="${targetPage}?carId=${car.id}">Select car</a>
        </article>
      `;
    }).join('');
}

async function loadDashboard() {
    try {
        const [bookingsRes, carsRes] = await Promise.all([
            fetch('/api/bookings'),
            fetch('/api/cars')
        ]);

        if (!bookingsRes.ok || !carsRes.ok) {
            throw new Error('Failed to load dashboard data.');
        }

        const bookings = await bookingsRes.json();
        const cars = await carsRes.json();

        renderBookings(Array.isArray(bookings) ? bookings : []);
        renderRecommendations(Array.isArray(cars) ? cars : []);

    } catch (error) {
        setEmpty(bookingsList, 'Failed to load bookings.');
        setEmpty(recommendationsList, 'Failed to load recommendations.');
        console.error(error);
    }
}

loadDashboard();
