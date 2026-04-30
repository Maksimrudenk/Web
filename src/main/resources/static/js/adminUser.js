const userMessage = document.getElementById('user-message');
const userForm = document.getElementById('user-form');
const historyList = document.getElementById('history-list');
const deleteUserBtn = document.getElementById('delete-user-btn');

const nameInput = document.getElementById('user-name');
const emailInput = document.getElementById('user-email');
const phoneInput = document.getElementById('user-phone');
const addressInput = document.getElementById('user-address');
const createBookingLink = document.getElementById('create-booking-link');

let selectedUserId = null;

function getUserId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function renderHistory(bookings) {
    if (!bookings.length) {
        historyList.innerHTML = '<div class="empty">No bookings yet.</div>';
        return;
    }

    historyList.innerHTML = bookings
        .sort((a, b) => new Date(b.timeStart || 0) - new Date(a.timeStart || 0))
        .map((booking) => `
            <article class="card">
                <h3>Booking #${booking.id ?? '—'}</h3>
                <div class="muted">Status: ${booking.status ?? '—'}</div>
                <div class="muted">Start: ${formatDate(booking.timeStart)}</div>
                <div class="muted">Price: ${booking.price ?? '—'}</div>
                <div class="muted">Type: ${booking.bookingType ?? '—'}</div>
                <a href="adminBooking.html?id=${booking.id}">Edit booking</a>
            </article>
        `)
        .join('');
}

async function loadUser() {
    const id = getUserId();
    if (!id) throw new Error('User id is required');

    userMessage.textContent = 'Loading user...';
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to load user');

    const user = await response.json();
    selectedUserId = user.id;
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';
    addressInput.value = user.address || '';

    userForm.classList.remove('hidden');
    createBookingLink.href = `adminBooking.html?userId=${selectedUserId}`;
    userMessage.textContent = '';
}

async function loadHistory() {
    historyList.innerHTML = '<div class="empty">Loading history...</div>';
    const response = await fetch(`/api/bookings/user/${selectedUserId}`);
    if (!response.ok) throw new Error('Failed to load bookings');
    renderHistory(await response.json());
}

deleteUserBtn.addEventListener('click', async () => {
    if (!selectedUserId) return;
    if (!window.confirm('Delete this user?')) return;

    userMessage.textContent = 'Deleting user...';
    try {
        const response = await fetch(`/api/users/${selectedUserId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete user');
        window.location.href = 'admin.html';
    } catch (error) {
        userMessage.textContent = 'Failed to delete user.';
    }
});

userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedUserId) return;

    userMessage.textContent = 'Saving...';

    try {
        const response = await fetch(`/api/users/${selectedUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                address: addressInput.value.trim()
            })
        });

        if (!response.ok) throw new Error('Failed to update user');

        const user = await response.json();
        selectedUserId = user.id;
        userMessage.textContent = 'User data updated successfully.';
    } catch (error) {
        userMessage.textContent = 'Failed to update user data.';
    }
});

(async function initAdminUserPage() {
    try {
        await loadUser();
        await loadHistory();
    } catch (error) {
        userMessage.textContent = 'Failed to load admin user page data.';
        historyList.innerHTML = '<div class="empty">Unable to load booking history.</div>';
    }
})();
