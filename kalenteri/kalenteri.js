        /* Tiedot tallennetaan vain calendar.json-tiedostoon. fetchEvents-funktio lataa tapahtumat calendar.json-tiedostosta,
        ja saveEvents-funktio tallentaa tapahtumat calendar.json-tiedostoon.
        Huomaa, että tämä vaatii palvelinpuolen käsittelyä, jotta tiedostoa voidaan päivittää.
        Voit käyttää esimerkiksi Node.js:ää tai PHP:ta palvelinpuolen käsittelyyn.*/
        let events = [];
        const currentDate = new Date();
        let selectedDate = null;
        let selectedEventIndex = null;

        // Hakee tapahtumat calendar.json-tiedostosta
        async function fetchEvents() {
            try {
                const response = await fetch('/path/to/calendar.json');
                if (response.ok) {
                    events = await response.json();
                    renderCalendar();
                    renderEventList();
                } else {
                    console.error('Failed to fetch events');
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        // Tallentaa tapahtumat calendar.json-tiedostoon
        async function saveEvents() {
            try {
                const response = await fetch('/path/to/calendar.json', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(events)
                });
                if (!response.ok) {
                    console.error('Failed to save events');
                }
            } catch (error) {
                console.error('Error saving events:', error);
            }
        }

        // Renderöi kalenterin
        function renderCalendar() {
            const calendarDays = document.getElementById("calendarDays");
            calendarDays.innerHTML = "";
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Nykyinen kuukausi ja vuosi
            document.getElementById("currentMonth").textContent = currentDate.toLocaleDateString("fi-FI", { month: "long", year: "numeric" });

            // Siirto viikonpäivien alkua maanantaiksi
            const offset = (firstDay === 0) ? 6 : firstDay - 1;

            // Lisää tyhjät solut ennen ensimmäistä päivää
            for (let i = 0; i < offset; i++) {
                const emptyCell = document.createElement("div");
                emptyCell.className = "empty";
                calendarDays.appendChild(emptyCell);
            }

            // Lisää päivät kalenteriin
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement("div");
                dayCell.className = "day";
                dayCell.textContent = day;
                const eventDate = new Date(year, month, day).toISOString().split("T")[0];
                dayCell.addEventListener("click", () => openModal(eventDate));
                const dayEvents = events.filter(event => event.date === eventDate);
                dayEvents.forEach(event => {
                    const eventDiv = document.createElement("div");
                    eventDiv.className = `event ${event.status}`;
                    eventDiv.textContent = event.title;
                    eventDiv.addEventListener("click", (e) => {
                        e.stopPropagation();
                        openModal(event.date, events.indexOf(event));
                    });
                    dayCell.appendChild(eventDiv);
                });
                calendarDays.appendChild(dayCell);
            }
        }

        // Avaa modaalin tapahtuman lisäämistä tai muokkaamista varten
        function openModal(date, eventIndex = null) {
            selectedDate = date;
            selectedEventIndex = eventIndex;
            if (eventIndex !== null) {
                const event = events[eventIndex];
                document.getElementById("eventTitle").value = event.title;
                document.getElementById("eventTimeStart").value = event.timeStart;
                document.getElementById("eventTimeEnd").value = event.timeEnd;
                document.getElementById("eventDetails").value = event.details;
                document.getElementById("eventStatus").value = event.status;
                document.getElementById("deleteEventButton").style.display = "inline-block";
            } else {
                document.getElementById("eventTitle").value = "";
                document.getElementById("eventTimeStart").value = "";
                document.getElementById("eventTimeEnd").value = "";
                document.getElementById("eventDetails").value = "";
                document.getElementById("eventStatus").value = "vapaa";
                document.getElementById("deleteEventButton").style.display = "none";
            }
            document.getElementById("eventModal").classList.add("active");
        }

        // Sulkee modaalin
        function closeModal() {
            document.getElementById("eventModal").classList.remove("active");
        }

        // Tallentaa tapahtuman
        async function saveEvent() {
            const title = document.getElementById("eventTitle").value;
            const timeStart = document.getElementById("eventTimeStart").value;
            const timeEnd = document.getElementById("eventTimeEnd").value;
            const details = document.getElementById("eventDetails").value;
            const status = document.getElementById("eventStatus").value;

            if (title && timeStart && timeEnd) {
                const event = { date: selectedDate, title, timeStart, timeEnd, details, status };

                if (selectedEventIndex !== null) {
                    events[selectedEventIndex] = event;
                } else {
                    events.push(event);
                }

                await saveEvents();
                renderCalendar();
                renderEventList();
                closeModal();
            }
        }

        // Poistaa tapahtuman
        async function deleteEvent() {
            if (selectedEventIndex !== null) {
                events.splice(selectedEventIndex, 1);
                await saveEvents();
                renderCalendar();
                renderEventList();
                closeModal();
            }
        }

        // Renderöi tapahtumalistan
        function renderEventList() {
            const eventList = document.getElementById("eventList");
            eventList.innerHTML = "";
            events.forEach((event, index) => {
                const eventItem = document.createElement("div");
                eventItem.className = `event ${event.status}`;
                eventItem.textContent = `${event.title} (${event.timeStart} - ${event.timeEnd}) - ${event.details}`;
                eventItem.addEventListener("click", () => openModal(event.date, index));
                eventList.appendChild(eventItem);
            });
        }

        // Siirry edelliseen kuukauteen
        document.getElementById("prevMonth").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        // Siirry seuraavaan kuukauteen
        document.getElementById("nextMonth").addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Suodata tapahtumia hakukentän perusteella
        document.getElementById("searchInput").addEventListener("input", () => {
            const query = document.getElementById("searchInput").value.toLowerCase();
            document.querySelectorAll(".event").forEach(eventDiv => {
                if (eventDiv.textContent.toLowerCase().includes(query)) {
                    eventDiv.style.display = "block";
                } else {
                    eventDiv.style.display = "none";
                }
            });
        });

        // Suodata tapahtumia valitun suodattimen perusteella
        document.getElementById("filterInput").addEventListener("change", () => {
            const filter = document.getElementById("filterInput").value;
            document.querySelectorAll(".event").forEach(eventDiv => {
                if (!filter || eventDiv.classList.contains(filter)) {
                    eventDiv.style.display = "block";
                } else {
                    eventDiv.style.display = "none";
                }
            });
        });

        document.getElementById("addEventButton").addEventListener("click", () => openModal(new Date().toISOString().split("T")[0]));
        document.getElementById("saveEventButton").addEventListener("click", saveEvent);
        document.getElementById("deleteEventButton").addEventListener("click", deleteEvent);
        document.getElementById("cancelEventButton").addEventListener("click", closeModal);
        document.getElementById("eventModal").addEventListener("click", e => {
            if (e.target === document.getElementById("eventModal")) closeModal();
        });

        renderCalendar();
        renderEventList();