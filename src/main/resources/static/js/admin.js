const usersList = document.getElementById('users-list');
const carsList = document.getElementById('cars-list');

function renderUsers(users) {
    if (!users.length) {
        usersList.innerHTML = '<div class="empty">No users found.</div>';
        return;
    }

    usersList.innerHTML = users.map((user) => `
        <article class="card">
            <h3>${user.name ?? 'No name'}</h3>
            <div class="muted">ID: ${user.id ?? '—'}</div>
            <div class="muted">Email: ${user.email ?? '—'}</div>
            <a href="adminUser.html?id=${user.id}">Open user page</a>
        </article>
    `).join('');
}

function renderCars(cars) {
    if (!cars.length) {
        carsList.innerHTML = '<div class="empty">No cars found.</div>';
        return;
    }

    carsList.innerHTML = cars.map((car) => `
        <article class="card">
            <h3>${car.model ?? 'Unknown model'}</h3>
            <div class="muted">ID: ${car.id ?? '—'}</div>
            <div class="muted">Class: ${car.serviceTier ?? '—'}</div>
            <div class="muted">Available: ${car.available ? 'Yes' : 'No'}</div>
            <a href="adminCar.html?id=${car.id}">Open car page</a>
        </article>
    `).join('');
}

(async function initAdminPage() {
    usersList.innerHTML = '<div class="empty">Loading users...</div>';
    carsList.innerHTML = '<div class="empty">Loading cars...</div>';

    try {
        const [usersResponse, carsResponse] = await Promise.all([
            fetch('/api/users/all'),
            fetch('/api/cars')
        ]);

        if (!usersResponse.ok || !carsResponse.ok) {
            throw new Error('Failed to load admin data');
        }

        const users = await usersResponse.json();
        const cars = await carsResponse.json();

        renderUsers(users);
        renderCars(cars);
    } catch (error) {
        usersList.innerHTML = '<div class="empty">Failed to load users.</div>';
        carsList.innerHTML = '<div class="empty">Failed to load cars.</div>';
        console.error(error);
    }
})();
