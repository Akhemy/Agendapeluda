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
            modalTitle.textContent = meeting.type;
            modalDate.textContent = `Fecha: ${meeting.date} | Duración: ${meeting.duration}`;
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
        data.forEach(meeting => {
            if (meeting.sprint !== currentSprint) {
                currentSprint = meeting.sprint;
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
                <div class="meeting-card" onclick="openModal('${meeting.id}')">
                    <div class="meeting-type ${meeting.type.toLowerCase().replace(/\s/g, '-')}">${meeting.type}</div>
                    <div class="meeting-date">${meeting.date}</div>
                    <div class="meeting-details">
                        <strong>Objetivo:</strong> ${meeting.objective}<br>
                        <strong>Aspectos Clave:</strong> ${meeting.summary}<br>
                    </div>
                    <div class="attendees">
                        ${meeting.attendees.map(a => `<span class="attendee">${a}</span>`).join('')}
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