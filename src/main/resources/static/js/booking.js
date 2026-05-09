const bookingMessage = document.getElementById('booking-message');
const bookingContent = document.getElementById('booking-content');
const bookingInfo = document.getElementById('booking-info');
const cancelBtn = document.getElementById('cancel-booking-btn');
const paymentSection = document.getElementById('payment-section');
const paymentForm = document.getElementById('payment-form');
const paymentDetailsInput = document.getElementById('payment-details');
const paymentMessage = document.getElementById('payment-message');
const paymentSuccessModal = document.getElementById('payment-success-modal');
const completeBtn = document.getElementById('complete-booking-btn');
const receiptLink = document.getElementById('receipt-link');

const FINAL_STATUSES = new Set(['PAID', 'CANCELED', 'CANCELLED', 'COMPLETED']);
const NO_CANCEL_STATUSES = new Set(['CANCELED', 'CANCELLED', 'COMPLETED']);

let bookingState = null;

function bookingStatusBadge(status) {
    const key = String(status || '').toUpperCase();
    const map = {
        CREATED: ['Created', 'images/bill-list.svg', 'status-created'],
        CANCELED: ['Canceled', 'images/bill-cross.svg', 'status-canceled'],
        CANCELLED: ['Canceled', 'images/bill-cross.svg', 'status-canceled'],
        PAID: ['Paid', 'images/bill-check.svg', 'status-paid'],
        COMPLETED: ['Completed', 'images/success-green.svg', 'status-paid']
    };
    const [label, icon, cls] = map[key] || [status || 'Unknown', 'images/bill-list.svg', 'status-created'];
    return `<span class="status-badge ${cls}"><img src="${icon}" alt="" class="inline-icon"/>${label}</span>`;
}

function getBookingId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function formatMoney(value) {
    if (value == null) return '—';
    return String(value);
}

function isCancelable(status) {
    return !NO_CANCEL_STATUSES.has(status);
}

function canPay(status) {
    return !FINAL_STATUSES.has(status);
}

function canComplete(status) {
    return status === 'PAID';
}

function canOpenReceipt(status) {
    return status === 'PAID' || status === 'COMPLETED';
}

function renderBooking(booking) {
    bookingInfo.innerHTML = `
      <div><strong>ID:</strong> ${booking.id ?? '—'}</div>
      <div><strong>Status:</strong> ${bookingStatusBadge(booking.status)}</div>
      <div><strong>Start:</strong> ${formatDate(booking.timeStart)}</div>
      <div><strong>Price:</strong> ${formatMoney(booking.price)}</div>
      <div><strong>Car:</strong> ${booking.car?.model || '—'}</div>
      <div><strong>Type:</strong> ${booking.bookingType || '—'}</div>
    `;

    cancelBtn.classList.toggle('hidden', !isCancelable(booking.status));
    completeBtn.classList.toggle('hidden', !canComplete(booking.status));
    paymentSection.classList.toggle('hidden', !canPay(booking.status));
    receiptLink.classList.toggle('hidden', !canOpenReceipt(booking.status));
    receiptLink.href = `receipt.html?bookingId=${encodeURIComponent(booking.id)}`;
    bookingContent.classList.remove('hidden');
}

async function loadBooking() {
    const bookingId = getBookingId();

    if (!bookingId) {
        bookingMessage.textContent = 'Booking id is required in query (?id=...)';
        return;
    }

    bookingMessage.textContent = 'Loading booking...';
    try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
            throw new Error('Failed to load booking');
        }

        bookingState = await response.json();
        bookingMessage.textContent = '';
        renderBooking(bookingState);
    } catch (error) {
        bookingMessage.textContent = 'Failed to load booking details.';
        console.error(error);
    }
}

cancelBtn.addEventListener('click', async () => {
    if (!bookingState?.id) return;

    try {
        const response = await fetch(`/api/bookings/${bookingState.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' })
        });

        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }

        bookingState = await response.json();
        renderBooking(bookingState);
        bookingMessage.textContent = 'Booking canceled.';
    } catch (error) {
        bookingMessage.textContent = 'Failed to cancel booking.';
        console.error(error);
    }
});

completeBtn.addEventListener('click', async () => {
    if (!bookingState?.id) return;

    try {
        const response = await fetch(`/api/bookings/${bookingState.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'COMPLETED' })
        });

        if (!response.ok) {
            throw new Error('Failed to complete booking');
        }

        bookingState = await response.json();
        renderBooking(bookingState);
        bookingMessage.textContent = 'Booking marked as completed.';
    } catch (error) {
        bookingMessage.textContent = 'Failed to complete booking.';
        console.error(error);
    }
});

paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!bookingState?.id) return;

    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId: bookingState.id,
                paymentDetails: paymentDetailsInput.value.trim()
            })
        });

        if (!response.ok) {
            throw new Error('Payment failed');
        }

        paymentMessage.textContent = 'Payment completed successfully.';
        paymentMessage.classList.remove('hidden');
        paymentSuccessModal.classList.remove('hidden');
        await loadBooking();
    } catch (error) {
        paymentMessage.textContent = 'Payment failed. Please check payment details.';
        paymentMessage.classList.remove('hidden');
        console.error(error);
    }
});

loadBooking();
