function loginUser() {
    const loginRequest = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    fetch('http://localhost:8080/api/vc/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginRequest)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json(); // Esperar un objeto JSON en la respuesta
    })
    .then(data => {
        
        if (data.userType) {
            console.log("User data received from server:", data);

            // Guardar los datos del usuario en localStorage
            localStorage.setItem('userType', data.userType);
            localStorage.setItem('identificationNumber', data.identificationNumber);

            // Redirigir según el tipo de usuario
            if (data.userType === 'root') {
                window.location.href = 'index.html';
            } else if (data.userType === 'user') {
                window.location.href = 'user.html';
            }
        } else {
            alert('User type not recognized');
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
        alert('Authentication failed: ' + error.message);
    });
}
