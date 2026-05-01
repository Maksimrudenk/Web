async function bindCurrentUserHeader() {
    const userLink = document.getElementById('user-link');
    if (!userLink) return;

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

bindCurrentUserHeader();
