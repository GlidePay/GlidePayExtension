(function() {
    const registrationButton = document.getElementById('registrationButton');
    const button = document.createElement('button');
    button.setAttribute('class', 'btn btn-primary');
    button.textContent = 'Add new address';
    button.addEventListener('click', () => {
        window.location.href="/views/addressform.html";
    });
    registrationButton.appendChild(button);
})();