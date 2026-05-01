async function bindCurrentUserHeader() {
    const userLink = document.getElementById('user-link');
    if (!userLink) return;

    const actionsContainer = ensureHeaderActionsContainer(userLink);
    ensureLogoutControl(actionsContainer);

    try {
        const response = await fetch('/api/users/me');
        if (!response.ok) {
            throw new Error('Failed to load current user');
        }

        const user = await response.json();
        userLink.innerHTML = `<img src="images/user.svg" alt="" class="inline-icon" /> <span>${user?.name || 'Profile'}</span>`;

        if (user?.id) {
            userLink.href = `user.html?id=${user.id}`;
        } else if (user?.email) {
            userLink.href = `user.html?email=${encodeURIComponent(user.email)}`;
        } else {
            userLink.href = 'user.html';
        }
    } catch (error) {
        userLink.innerHTML = '<img src="images/user.svg" alt="" class="inline-icon" /> <span>Profile</span>';
        userLink.href = 'user.html';
        console.error(error);
    }
}

function ensureHeaderActionsContainer(userLink) {
    if (userLink.parentElement?.classList.contains('header-user-actions')) {
        return userLink.parentElement;
    }

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-user-actions';
    userLink.replaceWith(actionsContainer);
    actionsContainer.appendChild(userLink);
    return actionsContainer;
}

function ensureLogoutControl(actionsContainer) {
    if (document.getElementById('logout-button')) return;

    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-button';
    logoutButton.type = 'button';
    logoutButton.textContent = 'Logout';
    logoutButton.className = 'logout-btn';

    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            window.location.href = 'login.html';
        } catch (error) {
            console.error(error);
            alert('Could not logout. Please try again.');
        }
    });

    actionsContainer.appendChild(logoutButton);
}

bindCurrentUserHeader();
