const createCarForm = document.getElementById('create-car-form');
const createCarMessage = document.getElementById('create-car-message');

function showCarMessage(text, isError = false) {
    createCarMessage.textContent = text;
    createCarMessage.style.color = isError ? '#d9534f' : '#5cb85c';
}

async function submitCreateCarForm(event) {
    event.preventDefault();

    const payload = {
        model: document.getElementById('car-model').value.trim(),
        registrationNumber: document.getElementById('car-reg').value.trim(),
        seats: Number(document.getElementById('car-seats').value),
        price: Number(document.getElementById('car-price').value),
        serviceTier: document.getElementById('car-tier').value,
        available: document.getElementById('car-available').checked
    };

    try {
        const response = await fetch('/api/cars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Car creation failed');
        }

        showCarMessage('Car created successfully.');
        createCarForm.reset();
        document.getElementById('car-available').checked = true;
    } catch (error) {
        showCarMessage(error.message || 'Car creation failed', true);
    }
}

createCarForm?.addEventListener('submit', submitCreateCarForm);
