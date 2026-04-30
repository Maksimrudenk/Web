const bookingsList = document.getElementById('bookings-list');
const recommendationsList = document.getElementById('recommendations-list');

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};

const setEmpty = (container, message) => {
    container.innerHTML = `<div class="empty">${message}</div>`;
};

function renderBookings(bookings) {
    const activeBookings = bookings.filter((booking) => !['COMPLETED', 'CANCELED', 'CANCELLED'].includes(booking.status));

    if (!activeBookings.length) {
        setEmpty(bookingsList, 'No active bookings found.');
        return;
    }

    bookingsList.innerHTML = activeBookings.map((booking) => `
      <article class="card">
        <h3>Booking #${booking.id}</h3>
        <div class="muted">Status: ${booking.status || '—'}</div>
        <div class="muted">Start: ${formatDate(booking.timeStart)}</div>
        <div class="muted">Price: ${booking.price ?? '—'}</div>
        <div class="muted">Car: ${booking.car?.model || '—'} (${booking.car?.serviceTier || '—'})</div>
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
        return `
        <article class="card">
          <h3>${car.model}</h3>
          <div class="muted">Class: ${car.serviceTier}</div>
          <div class="muted">Seats: ${car.seats}</div>
          <div class="muted">Plate: ${car.registrationNumber}</div>
          <div class="muted">Price: ${car.price}</div>
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
