const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

function showRegisterMessage(text, isError = false) {
    registerMessage.textContent = text;
    registerMessage.style.color = isError ? '#d9534f' : '#5cb85c';
}

async function guardRegisterPage() {
    try {
        const authResponse = await fetch('/api/users/me');
        if (authResponse.ok) {
            window.location.replace('/index.html');
            return false;
        }
    } catch (error) {
        console.error('Auth check failed', error);
    }

    return true;
}

async function submitRegisterForm(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById('first-name').value.trim(),
        address: document.getElementById('address').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed');
        }

        showRegisterMessage('User created successfully.');
        await guardRegisterPage();
        registerForm.reset();

    } catch (error) {
        showRegisterMessage(error.message || 'Registration failed', true);
    }

}

registerForm?.addEventListener('submit', submitRegisterForm);

