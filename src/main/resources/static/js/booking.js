const bookingMessage = document.getElementById('booking-message');
const bookingContent = document.getElementById('booking-content');
const bookingInfo = document.getElementById('booking-info');
const cancelBtn = document.getElementById('cancel-booking-btn');
const paymentSection = document.getElementById('payment-section');
const paymentForm = document.getElementById('payment-form');
const paymentDetailsInput = document.getElementById('payment-details');
const paymentMessage = document.getElementById('payment-message');
const paymentSuccessModal = document.getElementById('payment-success-modal');

const FINAL_STATUSES = new Set(['PAID', 'CANCELED', 'CANCELLED', 'COMPLETED']);
const NO_CANCEL_STATUSES = new Set(['CANCELED', 'CANCELLED', 'COMPLETED']);

let bookingState = null;

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

function renderBooking(booking) {
    bookingInfo.innerHTML = `
      <div><strong>ID:</strong> ${booking.id ?? '—'}</div>
      <div><strong>Status:</strong> ${booking.status ?? '—'}</div>
      <div><strong>Start:</strong> ${formatDate(booking.timeStart)}</div>
      <div><strong>Price:</strong> ${formatMoney(booking.price)}</div>
      <div><strong>Car:</strong> ${booking.car?.model || '—'}</div>
      <div><strong>Type:</strong> ${booking.bookingType || '—'}</div>
    `;

    cancelBtn.classList.toggle('hidden', !isCancelable(booking.status));
    paymentSection.classList.toggle('hidden', !canPay(booking.status));
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
