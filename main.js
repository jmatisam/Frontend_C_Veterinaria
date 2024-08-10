document.addEventListener('DOMContentLoaded', function() {
    const addPetButton = document.getElementById('add-pet-button');
    const addPetForm = document.getElementById('add-pet-form');
    const newPetForm = document.getElementById('new-pet-form');
    const submitNewPetButton = document.getElementById('submit-new-pet');
    const searchForm = document.getElementById('search-form');
    const searchQueryId = document.getElementById('search-query-id');
    const searchQueryGuardian = document.getElementById('search-query-guardian');
    const resultsSection = document.getElementById('results-section');
    const petsTableBody = document.querySelector('#pets-table tbody');

    // Mostrar el formulario de añadir mascota
    addPetButton.addEventListener('click', function() {
        addPetForm.classList.toggle('d-none');
    });

    // Guardar nueva mascota
    submitNewPetButton.addEventListener('click', function(e) {
        e.preventDefault();
        const petData = {
            identificationNumber: document.getElementById('pet-identificationNumber').value,
            name: document.getElementById('pet-name').value,
            age: document.getElementById('pet-age').value,
            race: document.getElementById('pet-breed').value,
            gender: document.getElementById('pet-gender').value,
            tutorName: document.getElementById('guardian-name').value,
            tutorPhone: document.getElementById('guardian-phone').value,
            url: document.getElementById('image-url').value,
        };

        fetch('http://localhost:8080/api/vc/patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(petData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Mascota añadida con éxito');
            addPetForm.classList.add('d-none');
            newPetForm.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un error al añadir la mascota');
        });
    });

    // Buscar mascota por ID o por nombre del tutor
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let searchUrl = 'http://localhost:8080/api/vc/patient/in';
        if (searchQueryId.value) {
            searchUrl += `/${searchQueryId.value}`;
        } else if (searchQueryGuardian.value) {
            searchUrl = 'http://localhost:8080/api/vc/patient/tn';
            searchUrl += `/${searchQueryGuardian.value}`;
        } else {
            alert('Por favor ingrese un criterio de búsqueda');
            return;
        }

        fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Mascotas encontradas:', data);
            if (Array.isArray(data)) {
                displayPets(data);
            } else {
                displayPets([data]);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('No se encontraron mascotas con ese criterio');
        });
    });

    // Mostrar mascotas en una tabla
function displayPets(pets) {
    petsTableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar los resultados
    pets.forEach(pet => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pet.identificationNumber}</td>
            <td>${pet.name}</td>
            <td>${pet.age}</td>
            <td>${pet.race}</td>
            <td>${pet.gender}</td>
            <td>${pet.tutorName}</td>
            <td>${pet.tutorPhone}</td>
            <td>
                <button class="view-patient-button btn btn-primary btn-sm" data-id="${pet.identificationNumber}">Ver Mascota</button>
            </td>
        `;
        petsTableBody.appendChild(row);
    });

    // Mostrar la sección de resultados
    resultsSection.classList.remove('d-none');

    // Agregar event listeners a los botones de ver detalles
    const viewPatientButtons = document.querySelectorAll('.view-patient-button');
    viewPatientButtons.forEach(button => {
        button.addEventListener('click', function () {
            const patientId = button.getAttribute('data-id');
            window.location.href = `ficha_mascota.html?id=${patientId}`;
        });
    });
}


    // Eliminar mascota
    window.deletePet = function(identificationNumber) {
        if (!confirm('¿Está seguro de que desea eliminar esta mascota?')) return;

        fetch(`http://localhost:8080/api/vc/patient/${identificationNumber}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Mascota eliminada:', data);
            alert('Mascota eliminada con éxito');
            // Recargar la lista de mascotas después de eliminar
            searchForm.dispatchEvent(new Event('submit'));
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un error al eliminar la mascota');
        });
    };
});
