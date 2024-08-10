document.addEventListener("DOMContentLoaded", function() {
    // Obtener el identificationNumber de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const identificationNumber = urlParams.get('id');

    // Hacer la solicitud fetch para obtener los datos del paciente
    fetch(`http://localhost:8080/api/vc/patient/in/${identificationNumber}`)
        .then(response => response.json())
        .then(data => {
            // Asumimos que la respuesta es un array con un solo objeto
            const patientData = data[0]; // Accedemos al primer elemento del array

            // Guardar el patient_id y el identificationNumber para usarlos en operaciones posteriores
            const patientId = patientData.patient_id;
            const patientIdentificationNumber = patientData.identificationNumber;
            const patientImageUrl = patientData.url;

            // Rellenar los datos en el HTML
            // Modificación para mostrar la imagen del paciente
            document.querySelector('.card img').src = patientData.url || 'src/static/images/logo.jpg';

            document.getElementById('patient-id').textContent = patientData.identificationNumber || 'N/A';
            document.getElementById('patient-name').textContent = patientData.name || 'N/A';
            document.getElementById('patient-age').textContent = patientData.age || 'N/A';
            document.getElementById('patient-race').textContent = patientData.race || 'N/A';
            document.getElementById('patient-gender').textContent = patientData.gender || 'N/A';
            document.getElementById('patient-tutor-name').textContent = patientData.tutorName || 'N/A';
            document.getElementById('patient-tutor-phone').textContent = patientData.tutorPhone || 'N/A';

            // Botón de eliminar paciente
            document.getElementById('deleteButton').addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
                    // Usar el patient_id para la solicitud DELETE
                    fetch(`http://localhost:8080/api/vc/patient/${patientId}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Paciente eliminado con éxito');
                            window.location.href = 'http://127.0.0.1:5500/index.html';
                        } else {
                            throw new Error('Error eliminando el paciente');
                        }
                    })
                    .catch(error => console.error('Error eliminando el paciente:', error));
                }
            });

            // Botón de editar paciente
            document.getElementById('editButton').addEventListener('click', function() {
                // Mostrar el formulario de edición y rellenar los campos
                toggleEditForm();
                document.getElementById('img').value = patientData.url || 'src/static/images/logo.jpg';
                document.getElementById('editName').value = patientData.name;
                document.getElementById('editAge').value = patientData.age;
                document.getElementById('editRace').value = patientData.race || '';
                document.getElementById('editGender').value = patientData.gender;
                document.getElementById('editTutorName').value = patientData.tutorName;
                document.getElementById('editTutorPhone').value = patientData.tutorPhone;
            });

            // Botón de guardar cambios
            document.getElementById('saveChangesButton').addEventListener('click', function() {
                // Almacenar valores del formulario en constantes
                const image = document.getElementById('img').value;
                const nameInput = document.getElementById('editName').value;
                const ageInput = parseInt(document.getElementById('editAge').value, 10);
                const raceInput = document.getElementById('editRace').value || '';
                const genderInput = document.getElementById('editGender').value || '';
                const tutorNameInput = document.getElementById('editTutorName').value;
                const tutorPhoneInput = document.getElementById('editTutorPhone').value;

                // Construir el objeto DTO para enviar
                const updatedPatient = {
                    identificationNumber: patientIdentificationNumber, // Usar el valor original
                    name: nameInput,
                    age: ageInput,
                    race: raceInput,
                    gender: genderInput,
                    tutorName: tutorNameInput,
                    tutorPhone: tutorPhoneInput,
                    url:image
                };

                // Enviar la solicitud de actualización
                fetch(`http://localhost:8080/api/vc/patient/${patientId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedPatient)
                })
                .then(response => {
                    if (response.ok) {
                        alert('Paciente actualizado con éxito');
                        location.reload(); // Recargar la página para reflejar los cambios
                    } else {
                        return response.text().then(text => {
                            throw new Error(text);
                        });
                    }
                })
                .catch(error => console.error('Error actualizando el paciente:', error));
            });
        })
        .catch(error => console.error('Error fetching patient data:', error));
});

// Función para mostrar/ocultar el formulario de edición
function toggleEditForm() {
    const editForm = document.getElementById('edit-form');
    editForm.style.display = (editForm.style.display === 'none') ? 'block' : 'none';
}

// Botón de regresar
document.getElementById('back-button').addEventListener('click', function() {
    window.location.href = 'http://127.0.0.1:5500/index.html';
});

document.getElementById('appointment').addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search); // Asegúrate de definir urlParams
    const identificationNumber = urlParams.get('id');

    if (identificationNumber) {
        window.location.href = `http://127.0.0.1:5500/citas.html?id=${identificationNumber}`;
    } else {
        console.error('No ID found in URL');
    }
});

document.getElementById('historic').addEventListener('click', function() {
    const urlParams = new URLSearchParams(window.location.search); // Asegúrate de definir urlParams
    const identificationNumber = urlParams.get('id');

    if (identificationNumber) {
        window.location.href = `http://127.0.0.1:5500/historico_citas.html?id=${identificationNumber}`;
    } else {
        console.error('No ID found in URL');
    }
});