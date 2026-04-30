const userMessage = document.getElementById('user-message');
const userForm = document.getElementById('user-form');
const historyList = document.getElementById('history-list');

const nameInput = document.getElementById('user-name');
const emailInput = document.getElementById('user-email');
const phoneInput = document.getElementById('user-phone');
const addressInput = document.getElementById('user-address');

let selectedUserId = null;

function getUserParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        email: params.get('email')
    };
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function renderHistory(bookings) {
    const filtered = bookings.filter(({ status }) => status === 'CANCELLED' || status === 'COMPLETED');

    if (filtered.length === 0) {
        historyList.innerHTML = '<div class="empty">No cancelled or completed bookings yet.</div>';
        return;
    }

    historyList.innerHTML = filtered
        .sort((a, b) => new Date(b.timeStart || 0) - new Date(a.timeStart || 0))
        .map((booking) => `
            <article class="card">
                <h3>Booking #${booking.id ?? '—'}</h3>
                <div class="muted">Status: ${booking.status ?? '—'}</div>
                <div class="muted">Start: ${formatDate(booking.timeStart)}</div>
                <div class="muted">Price: ${booking.price ?? '—'}</div>
                <div class="muted">Type: ${booking.bookingType ?? '—'}</div>
            </article>
        `)
        .join('');
}

async function loadUser() {
    const { id, email } = getUserParams();
    const query = id ? `/api/users/${id}` : (email ? `/api/users?email=${encodeURIComponent(email)}` : '/api/users/me');

    userMessage.textContent = 'Loading user...';

    const response = await fetch(query);
    if (!response.ok) {
        throw new Error('Failed to load user');
    }

    const user = await response.json();
    selectedUserId = user.id;

    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    phoneInput.value = user.phone || '';
    addressInput.value = user.address || '';

    userForm.classList.remove('hidden');
    userMessage.textContent = '';
}

async function loadHistory() {
    historyList.innerHTML = '<div class="empty">Loading history...</div>';

    const response = await fetch('/api/bookings');
    if (!response.ok) {
        throw new Error('Failed to load bookings');
    }

    const bookings = await response.json();
    renderHistory(bookings);
}

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

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        const updatedUser = await response.json();
        selectedUserId = updatedUser.id;

        nameInput.value = updatedUser.name || '';
        emailInput.value = updatedUser.email || '';
        phoneInput.value = updatedUser.phone || '';
        addressInput.value = updatedUser.address || '';

        const userLink = document.getElementById('user-link');
        if (userLink) {
            userLink.textContent = updatedUser.name || 'Profile';
            userLink.href = updatedUser.id
                ? `user.html?id=${updatedUser.id}`
                : (updatedUser.email ? `user.html?email=${encodeURIComponent(updatedUser.email)}` : 'user.html');
        }

        window.history.replaceState({}, '', `user.html?id=${updatedUser.id}`);

        userMessage.textContent = 'User data updated successfully.';
    } catch (error) {
        userMessage.textContent = 'Failed to update user data.';
        console.error(error);
    }
});

(async function initUserPage() {
    try {
        await loadUser();
        await loadHistory();
    } catch (error) {
        userMessage.textContent = 'Failed to load user page data.';
        historyList.innerHTML = '<div class="empty">Unable to load booking history.</div>';
        console.error(error);
    }
})();
