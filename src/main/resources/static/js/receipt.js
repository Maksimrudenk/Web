const receiptMessage = document.getElementById('receipt-message');
const receiptContent = document.getElementById('receipt-content');
const printReceiptBtn = document.getElementById('print-receipt-btn');

const receiptFields = {
    id: document.getElementById('receipt-id'),
    transactionId: document.getElementById('receipt-transaction'),
    bookingId: document.getElementById('receipt-booking'),
    status: document.getElementById('receipt-status'),
    paymentTime: document.getElementById('receipt-time'),
    paymentDetails: document.getElementById('receipt-details'),
    amount: document.getElementById('receipt-amount')
};

function receiptQuery() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        bookingId: params.get('bookingId'),
        transactionId: params.get('transactionId')
    };
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function formatMoney(value) {
    if (value == null) return '—';
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function receiptEndpoint() {
    const { id, bookingId, transactionId } = receiptQuery();
    if (bookingId) return `/api/receipts/bookings/${encodeURIComponent(bookingId)}`;
    if (transactionId) return `/api/receipts/transactions/${encodeURIComponent(transactionId)}`;
    if (id) return `/api/receipts/${encodeURIComponent(id)}`;
    return null;
}

function renderReceipt(payment) {
    receiptFields.id.textContent = payment.id ?? '—';
    receiptFields.transactionId.textContent = payment.transactionId || '—';
    receiptFields.bookingId.textContent = payment.bookingId ?? '—';
    receiptFields.status.textContent = payment.status || '—';
    receiptFields.paymentTime.textContent = formatDate(payment.paymentTime);
    receiptFields.paymentDetails.textContent = payment.paymentDetails || '—';
    receiptFields.amount.textContent = formatMoney(payment.amount);

    receiptMessage.textContent = '';
    receiptContent.classList.remove('hidden');
}

async function loadReceipt() {
    const endpoint = receiptEndpoint();
    if (!endpoint) {
        receiptMessage.textContent = 'Receipt id, booking id, or transaction id is required.';
        return;
    }

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Failed to load receipt');
        }

        renderReceipt(await response.json());
    } catch (error) {
        receiptMessage.textContent = 'Receipt is unavailable for this booking.';
        console.error(error);
    }
}

printReceiptBtn.addEventListener('click', () => window.print());

loadReceipt();
