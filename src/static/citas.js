document.addEventListener('DOMContentLoaded', function() {
  // 1. Ocultar el formulario inicialmente usando 'd-none'
  const addAppointmentForm = document.getElementById('add-appointment-form');
  addAppointmentForm.classList.add('d-none');

  // 2. Mostrar/Ocultar formulario al hacer clic en "Añadir Cita"
  const addAppointmentButton = document.getElementById('add-appointment-button');
  addAppointmentButton.addEventListener('click', () => {
      addAppointmentForm.classList.toggle('d-none');
  });

  // 3. Recoger el ID de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const identificationNumber = urlParams.get('id');

  if (identificationNumber) {
      fetchAppointments(identificationNumber); // Pasar como argumento para futuros usos
      // Hacer la solicitud fetch para obtener el patient_id
      fetch(`http://localhost:8080/api/vc/patient/in/${identificationNumber}`)
          .then(response => response.json())
          .then(data => {
              if (data.length === 0) {
                  throw new Error('No se encontraron datos para el paciente');
              }

              // Obtener el patient_id del primer objeto del array
              const patientId = data[0].patient_id;

              // 4. Manejar el envío del formulario
              const newAppointmentForm = document.getElementById('new-appointment-form');
              newAppointmentForm.addEventListener('submit', function(event) {
                  event.preventDefault(); // Prevenir que el formulario se envíe por defecto

                  // Recoger los datos del formulario
                  const dateInput = document.getElementById('appointment-date').value;
                  const timeInput = document.getElementById('appointment-time').value;
                  const reason = document.getElementById('appointment-reason').value;
                  const emergency = document.getElementById('appointment-emergency').checked;
                  const past = document.getElementById('appointment-past').checked;
                  const treatment = document.getElementById('appointment-treatment').value;

                  // Formatear la fecha en formato DD-MM-YYYY
                  const dateParts = dateInput.split('-');
                  const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                  // Crear objeto de la cita
                  const appointmentData = {
                      date: formattedDate,
                      time: timeInput,
                      reason: reason,
                      emergency: emergency,
                      past: past,
                      treatment: treatment,
                      patient: {
                          patient_id: patientId
                      }
                  };

                  // Enviar la cita al servidor
                  fetch(`http://localhost:8080/api/vc/appointment`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(appointmentData),
                  })
                  .then(response => {
                      if (response.ok) {
                          return response.json();
                      } else {
                          throw new Error('Error en la creación de la cita');
                      }
                  })
                  .then(data => {
                      alert('Cita añadida con éxito');
                      location.reload(); // Recargar la página para reflejar los cambios
                  })
                  .catch(error => {
                      console.error('Error:', error);
                      alert('Error al añadir la cita. Por favor, inténtelo de nuevo.');
                  });
              });
          })
          .catch(error => {
              console.error('Error al obtener el patient_id:', error);
              alert('Error al obtener datos del paciente. Por favor, inténtelo de nuevo.');
          });
  } else {
      console.error('No se encontró el ID de identificación en la URL');
  }
});

function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;  // Cambiado a formato YYYY-MM-DD
}

document.addEventListener('DOMContentLoaded', function() {
  // Cargar citas cuando se cargue la página
  fetchAppointments();
});

// Función para recuperar y mostrar las citas
function fetchAppointments() {
  const urlParams = new URLSearchParams(window.location.search);
  const identificationNumber = urlParams.get('id');

  if (identificationNumber) {
    fetch(`http://localhost:8080/api/vc/patient/in/${identificationNumber}`)
      .then(response => response.json())
      .then(patientData => {
        const appointmentListDiv = document.getElementById('appointment-list');
        const dataPatient = patientData[0];

        if (!dataPatient || !dataPatient.appointments) {
          appointmentListDiv.innerHTML = `
            <p>Paciente: ${dataPatient.name} (${dataPatient.identificationNumber})</p>
            <p>No se encontraron citas o datos del paciente.</p>
          `;
          return;
        }

        const appointments = dataPatient.appointments;
        const todayDate = getTodayDate();

        // Filtrar las citas por fecha, solo las de hoy en adelante
        const futureAppointments = appointments.filter(appointment => {
          const [day, month, year] = appointment.date.split('-');
          const formattedAppointmentDate = `${year}-${month}-${day}`;
          return formattedAppointmentDate >= todayDate;
        });

        appointmentListDiv.innerHTML = ''; // Limpiar el contenido anterior

        if (futureAppointments.length === 0) {
          appointmentListDiv.innerHTML = `
            <h4>Paciente: ${dataPatient.name} (${dataPatient.identificationNumber})<h4>
            <p>No hay citas futuras disponibles.</p>
          `;
          return;
        }

        // Crear una tabla para mostrar las citas
        const table = document.createElement('table');
        table.classList.add('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Crear encabezados de la tabla
        thead.innerHTML = `
          <tr>
            <th>Fecha Consulta:</th>
            <th>Hora</th>
            <th>Razón</th>
            <th>UrgC.</th>
            <th>Fin</th>
            <th>Tratamiento</th>
            <th>Acciones</th>
          </tr>
        `;

        // Crear filas de la tabla
        futureAppointments.forEach(appointment => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.reason}</td>
            <td>${appointment.emergency ? 'Sí' : 'No'}</td>
            <td>${appointment.past ? 'Sí' : 'No'}</td>
            <td>${appointment.treatment}</td>
            <td>
              <button class="btn btn-primary" onclick="showUpdateForm(${appointment.id}, ${dataPatient.patient_id})">Actualizar</button>
              <button class="btn btn-danger" onclick="deleteAppointment(${appointment.id})">Eliminar</button>
            </td>
          `;
          tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        appointmentListDiv.appendChild(table);
      })
      .catch(error => console.error('Error fetching patient data:', error));
  } else {
    console.error('No se encontró el ID de identificación en la URL');
  }
}

document.getElementById('back-button').addEventListener('click', function() {
  window.location.href = 'http://127.0.0.1:5500/index.html';
});    

function showUpdateForm(appointmentId, patientId) {
  const updateForm = document.getElementById('update-appointment-form');
  updateForm.classList.remove('hidden'); // Mostrar el formulario

  // Rellenar el formulario con los datos actuales de la cita
  fetch(`http://localhost:8080/api/vc/appointment/${appointmentId}`)
      .then(response => response.json())
      .then(appointment => {
          document.getElementById('update-appointment-date').value = parseDateFromInput(appointment.date);
          document.getElementById('update-appointment-time').value = appointment.time;
          document.getElementById('update-appointment-reason').value = appointment.reason;
          document.getElementById('update-appointment-emergency').checked = appointment.emergency;
          document.getElementById('update-appointment-past').checked = appointment.past;
          document.getElementById('update-appointment-treatment').value = appointment.treatment;

          // Manejar el envío del formulario de actualización
          document.getElementById('update-appointment-form-content').addEventListener('submit', function(event) {
              event.preventDefault();

              const updatedAppointment = {
                  date: parseDateFromInput(document.getElementById('update-appointment-date').value),
                  time: document.getElementById('update-appointment-time').value,
                  reason: document.getElementById('update-appointment-reason').value,
                  emergency: document.getElementById('update-appointment-emergency').checked,
                  past: document.getElementById('update-appointment-past').checked,
                  treatment: document.getElementById('update-appointment-treatment').value,
                  patient: { patient_id: patientId}
              };

              // Enviar la solicitud de actualización
              fetch(`http://localhost:8080/api/vc/appointment/${appointmentId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(updatedAppointment)
              })
              .then(response => {
                  if (response.ok) {
                      alert('Cita actualizada con éxito');
                      location.reload(); // Recargar la página para reflejar los cambios
                  } else {
                      return response.text().then(text => {
                          throw new Error(text);
                      });
                  }
              })
              .catch(error => console.error('Error actualizando la cita:', error));
          });

          // Manejar el clic en el botón de volver
          document.getElementById('back-update-button').addEventListener('click', function() {
              const updateForm = document.getElementById('update-appointment-form');
              updateForm.classList.add('hidden'); // Ocultar el formulario
          });
      })
      .catch(error => console.error('Error fetching appointment data:', error));
}

// Función para mostrar/ocultar el formulario de edición
function toggleEditForm() {
  const editForm = document.getElementById('return-button');
  editForm.style.display = (editForm.style.display === 'none') ? 'block' : 'none';
}

// Función para eliminar una cita
function deleteAppointment(id) {
  if (confirm('¿Estás seguro de que deseas anular esta cita?')) {
      fetch(`http://localhost:8080/api/vc/appointment/${id}`, {
          method: 'DELETE'
      })
      .then(response => {
          if (response.ok) {
              alert('Cita anulada con éxito');
              location.reload(); // Recargar la página para reflejar los cambios
          } else {
              throw new Error('Error al anular la cita');
          }
      })
      .catch(error => console.error('Error deleting appointment:', error));
  }
}

function parseDateFromInput(dateStr) {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;  // Cambiado a formato YYYY-MM-DD
}
