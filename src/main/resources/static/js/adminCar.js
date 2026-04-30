const carMessage = document.getElementById('car-message');
const carForm = document.getElementById('car-form');
const deleteBtn = document.getElementById('delete-car-btn');
const title = document.getElementById('car-title');

const modelInput = document.getElementById('car-model');
const regInput = document.getElementById('car-reg');
const seatsInput = document.getElementById('car-seats');
const priceInput = document.getElementById('car-price');
const tierInput = document.getElementById('car-tier');
const availableInput = document.getElementById('car-available');

const carId = new URLSearchParams(window.location.search).get('id');

async function loadCar() {
    if (!carId) {
        title.textContent = 'Create car';
        deleteBtn.classList.add('hidden');
        return;
    }
    const response = await fetch(`/api/cars/${carId}`);
    if (!response.ok) throw new Error('Failed to load car');
    const car = await response.json();
    modelInput.value = car.model || '';
    regInput.value = car.registrationNumber || '';
    seatsInput.value = car.seats || 1;
    priceInput.value = car.price || 0;
    tierInput.value = car.serviceTier || 'ECONOMY';
    availableInput.checked = !!car.available;
}

carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        model: modelInput.value.trim(),
        registrationNumber: regInput.value.trim(),
        seats: Number(seatsInput.value),
        price: Number(priceInput.value),
        serviceTier: tierInput.value,
        available: availableInput.checked
    };
    const url = carId ? `/api/cars/${carId}` : '/api/cars';
    const method = carId ? 'PUT' : 'POST';
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) {
        carMessage.textContent = 'Failed to save car.';
        return;
    }
    const saved = await response.json();
    carMessage.textContent = 'Car saved successfully.';
    if (!carId && saved?.id) window.location.href = `adminCar.html?id=${saved.id}`;
});

deleteBtn.addEventListener('click', async () => {
    if (!carId) return;
    if (!window.confirm('Delete this car?')) return;
    const response = await fetch(`/api/cars/${carId}`, { method: 'DELETE' });
    if (!response.ok) {
        carMessage.textContent = 'Failed to delete car.';
        return;
    }
    window.location.href = 'admin.html';
});

loadCar().catch(() => { carMessage.textContent = 'Failed to load car.'; });
