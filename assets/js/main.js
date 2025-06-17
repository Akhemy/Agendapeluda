document.addEventListener('DOMContentLoaded', async () => {
    const timelineContainer = document.getElementById('timeline-container');
    const modal = document.getElementById('modal-details');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalLocation = document.getElementById('modal-location');
    const modalObjective = document.getElementById('modal-objective');
    const modalDetailsContent = document.getElementById('modal-details-content');
    const modalAttendees = document.getElementById('modal-attendees');
    const closeModalBtn = document.querySelector('.close');

    let meetingsData = [];

    // Función para abrir el modal
    window.openModal = (meetingId) => {
        const meeting = meetingsData.find(m => m.id === meetingId);
        if (meeting) {
            // Lógica para el glosario en el modal
            if (meeting.type === "Glosario") {
                modalTitle.textContent = meeting.title;
                modalDate.textContent = ''; // El glosario no tiene fecha/duración
                modalLocation.textContent = ''; // El glosario no tiene ubicación
                modalObjective.textContent = meeting.summary; // Usar summary como objetivo principal

                modalDetailsContent.innerHTML = '<h3>Definiciones:</h3>';
                const definitionsList = document.createElement('ul');
                definitionsList.classList.add('glossary-definitions'); // Clase para estilos específicos si quieres
                for (const term in meeting.definitions) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<strong>${term}:</strong> ${meeting.definitions[term]}`;
                    definitionsList.appendChild(listItem);
                }
                modalDetailsContent.appendChild(definitionsList);

                modalAttendees.innerHTML = ''; // El glosario no tiene asistentes

            } else { // Lógica para las minutas normales
                modalTitle.textContent = meeting.type;
                modalDate.textContent = `Fecha: ${meeting.date} | Duración: ${meeting.time}`; // Usar 'time' como 'duración'
                modalLocation.textContent = `Lugar: ${meeting.location}`;
                modalObjective.textContent = meeting.objective;

                modalDetailsContent.innerHTML = '';
                for (const key in meeting.details) {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${key}:</strong> ${meeting.details[key]}`;
                    modalDetailsContent.appendChild(p);
                }

                modalAttendees.innerHTML = '';
                meeting.attendees.forEach(attendee => {
                    const span = document.createElement('span');
                    span.classList.add('attendee');
                    span.textContent = attendee;
                    modalAttendees.appendChild(span);
                });
            }

            modal.style.display = 'flex'; // Usar flex para centrar
        }
    };

    // Función para cerrar el modal
    window.closeModal = () => {
        modal.style.display = 'none';
    };

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Cargar datos de las minutas desde meetings.json
    try {
        const response = await fetch('data/meetings.json');
        meetingsData = await response.json();

        // Renderizar la línea de tiempo
        renderTimeline(meetingsData);

    } catch (error) {
        console.error('Error al cargar las minutas:', error);
        timelineContainer.innerHTML = '<p class="text-center text-white">Error al cargar las minutas. Por favor, inténtalo de nuevo más tarde.</p>';
    }

    // Función para renderizar la línea de tiempo
    function renderTimeline(data) {
        let currentSprint = '';
        data.forEach(item => { // Cambiado 'meeting' a 'item' para ser más genérico
            if (item.type === "Glosario") {
                // Renderizar el glosario de forma especial
                const glossaryItem = document.createElement('div');
                glossaryItem.classList.add('glossary-item'); // Clase para el glosario
                glossaryItem.innerHTML = `
                    <div class="meeting-card" onclick="openModal('${item.id}')">
                        <div class="meeting-type glossary-type">${item.type}</div>
                        <div class="meeting-title">${item.title}</div>
                        <div class="meeting-summary">${item.summary}</div>
                    </div>
                    <div class="timeline-dot"></div>
                `;
                timelineContainer.appendChild(glossaryItem);
                return; // Salta al siguiente elemento para no procesarlo como una minuta normal
            }

            // Lógica existente para minutas
            if (item.sprint !== currentSprint) {
                currentSprint = item.sprint;
                const sprintSection = document.createElement('div');
                sprintSection.classList.add('sprint-section');
                sprintSection.innerHTML = `
                    <div class="sprint-header">
                        <div class="sprint-title">${currentSprint}</div>
                    </div>
                `;
                timelineContainer.appendChild(sprintSection);
            }

            const meetingItem = document.createElement('div');
            meetingItem.classList.add('meeting-item');
            meetingItem.innerHTML = `
                <div class="meeting-card" onclick="openModal('${item.id}')">
                    <div class="meeting-type ${item.type.toLowerCase().replace(/\s/g, '-')}">${item.type}</div>
                    <div class="meeting-date">${item.date}</div>
                    <div class="meeting-details">
                        <strong>Objetivo:</strong> ${item.objective}<br>
                        <strong>Aspectos Clave:</strong> ${item.summary}<br>
                    </div>
                    <div class="attendees">
                        ${item.attendees.map(a => `<span class="attendee">${a}</span>`).join('')}
                    </div>
                </div>
                <div class="timeline-dot"></div>
            `;
            timelineContainer.appendChild(meetingItem);
        });

        // Animación de aparición de las tarjetas
        const cards = document.querySelectorAll('.meeting-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
});
