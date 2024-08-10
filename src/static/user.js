document.addEventListener('DOMContentLoaded', function() {
  const userType = localStorage.getItem('userType');
  const identificationNumber = localStorage.getItem('identificationNumber');

  // Verificar si el usuario está autorizado
  if (userType !== 'user' || !identificationNumber) {
      window.location.href = 'login.html';
      return;
  }

  // Cargar citas al cargar la página
  fetchAppointments(identificationNumber);
});

function fetchAppointments(identificationNumber) {
  fetch(`http://localhost:8080/api/vc/patient/in/${identificationNumber}`)
      .then(response => response.json())
      .then(patientData => {
          const appointmentListDiv = document.getElementById('appointment-list');
          const dataPatient = patientData[0];

          if (!dataPatient || !dataPatient.appointments) {
              appointmentListDiv.innerHTML = `
                  <p>Paciente: ${identificationNumber}</p>
                  <p>No se encontraron citas o datos del paciente.</p>
              `;
              return;
          }
           // Actualizar los datos del paciente
            document.getElementById('patient-id').textContent = dataPatient.identificationNumber;
            document.getElementById('patient-name').textContent = dataPatient.name;
            document.querySelector('.card img').src = dataPatient.url || 'src/static/images/logo.jpg';
          // Acceder a las citas del paciente
          const appointments = dataPatient.appointments;
          appointmentListDiv.innerHTML = ''; // Limpiar el contenido anterior

          if (appointments.length === 0) {
              appointmentListDiv.innerHTML = `
                  <p>Paciente: ${dataPatient.name} (${dataPatient.identificationNumber})</p>
                  <p>No hay citas disponibles.</p>
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
              </tr>
          `;

          // Crear filas de la tabla
          appointments.forEach(appointment => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${appointment.date}</td>
                  <td>${appointment.time}</td>
                  <td>${appointment.reason}</td>
                  <td>${appointment.emergency ? 'Sí' : 'No'}</td>
                  <td>${appointment.past ? 'Sí' : 'No'}</td>
                  <td>${appointment.treatment}</td>
              `;
              tbody.appendChild(row);
          });

          table.appendChild(thead);
          table.appendChild(tbody);
          appointmentListDiv.appendChild(table);
      })
      .catch(error => console.error('Error fetching patient data:', error));
}

function logout() {
  localStorage.removeItem('userType');
  localStorage.removeItem('identificationNumber');
  window.location.href = 'login.html';
}
