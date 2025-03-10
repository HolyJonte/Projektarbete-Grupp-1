// Importerar WeekCalendar-komponenten 
import WeekCalendar from './weekCalendar.js';

// Definierar en Vue-komponent för att hantera bokningar 
const CheckBookings = {
  // Registrerar WeekCalendar-komponenten som underkomponent
  components: { WeekCalendar },
  // Definierar data för komponenten som inkulderar sökfält, bokningar, felmeddelanden och redigeringsdata 
  data() {
    return {
      searchRegNr: '',              // Håller sökfältets registreringsnummer
      bookings: [],                 // Lagrar bokningar som matchar registreringsnumret
      errors: [],                   // Lagrar eventuella felmeddelanden
      selectedBookingIndex: null,   // Håller reda på den bokning som redigeras
      editedBooking: {              // Lagrar redigerad bokning
        date: '',
        time: '',
        serviceType: '',
      },
    };
  },

//==============================================================================================================================================================//
// Computed, beräknade egenskaper för att filtrera bokningar
//==============================================================================================================================================================//
  
computed: {
  // Filtrering för att visa aktuella bokningar
  incompleteBookings() {
    return this.bookings.filter(booking => !booking.completed);
  },

  // Filtrering för att visa avslutade bokningar
  completedBookings() {
    return this.bookings.filter(booking => booking.completed);
  },

  // Samlar alla redan bokade tider från tidigare bokningara för att undvika dubbelbokningar
  bookedTimes() {
    // Extrahera redan bokade tider från alla bokningar (från alla användare)
    const times = Object.values(JSON.parse(localStorage.getItem('allBookings')) || {})
      .flat()
      .map((booking) => ({
        date: booking.date,
        time: booking.time,
      }));

    // Lägg till den tid som redigeras om en bokning är markerad
    if (this.selectedBookingIndex !== null) {
      const editedTime = {
        date: this.bookings[this.selectedBookingIndex].date,
        time: this.bookings[this.selectedBookingIndex].time,
      };

      // Kontrollera om den redigerade tiden redan finns i den lista av bokade tider 
      const isTimeIncluded = times.some(
        (time) => time.date === editedTime.date && time.time === editedTime.time
      );

      // Lägg till redigerad tid om den inte finns i listan
      if (!isTimeIncluded) {
        times.push(editedTime);
      }
    }

    return times;
  },
},


//==============================================================================================================================================================//
//Metoder för att hantera sökning, redigering, uppdatering och borttagning av bokningar
//==============================================================================================================================================================//
  
methods: {
  // Söker efter bokningar baserat på registreringsnummer
  searchBookings() {
    // Töm tidigare felmeddelanden
    this.errors = [];
    try {
      // Hämta alla bokningar från localStorage
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};

      // Kontrollera att ett giltigt registreringsnummer har angetts
      if (!this.searchRegNr) {
        this.errors.push('Ange ett registreringsnummer.');
        return;
      }
      if (!/^[a-zA-Z0-9-]{3,10}$/.test(this.searchRegNr)) {
        this.errors.push('Ogiltigt registreringsnummer.');
        return;
      }

      // Hämta bokningar för det angivna registreringsnumret
      this.bookings = allBookings[this.searchRegNr] || [];

      // Om inga bokningar hittas, visa ett felmeddelande
      if (this.bookings.length === 0) {
        this.errors.push('Inga bokningar hittades för detta registreringsnummer.');
      }
    } catch (error) {
      this.errors.push('Ett fel uppstod vid hämtning av bokningar. Försök igen senare.');
    }
  },

  // Redigerar en bokning baserat på index
  editBooking(index) {
    const booking = this.bookings[index];
    this.selectedBookingIndex = index;
    this.editedBooking = { ...booking };
  },

  // Uppdaterar den redigerade bokningen
  updateBooking() {
    if (this.selectedBookingIndex !== null) {
      try {
        const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};

        // Validera att alla fält är ifyllda
        if (!this.editedBooking.date || !this.editedBooking.time || !this.editedBooking.serviceType) {
          alert('Alla fält måste fyllas i för att spara ändringen.');
          return;
        }

        // Kontrollera om tiden redan är bokad
        const allBookedTimes = Object.values(allBookings)
          .flat()
          .filter((booking) =>
            booking.date === this.editedBooking.date && booking.time === this.editedBooking.time
          );
        
        // Här kontrolleras om den tid som användaren försöker boka redan är bokad
        const isTimeTaken = allBookedTimes.some(
          (booking) =>
            booking.date === this.editedBooking.date &&
            booking.time === this.editedBooking.time
        );

        // Om tiden redan är bokad så visas följande alert
        if (isTimeTaken) {
          alert('Den valda tiden är redan bokad. Välj en annan tid.');
          return;
        }

        // Uppdatera bokningen
        this.bookings[this.selectedBookingIndex] = {
          ...this.bookings[this.selectedBookingIndex],
          ...this.editedBooking,
        };

        // Uppdatera localStorage
        allBookings[this.searchRegNr] = this.bookings;
        localStorage.setItem('allBookings', JSON.stringify(allBookings));

        // Återställ redigering
        this.selectedBookingIndex = null;
        this.editedBooking = { date: '', time: '', serviceType: '' };
      } catch (error) {
        alert('Ett fel uppstod vid uppdatering av bokning. Försök igen senare.');
      }
    }
  },

  // Tar bort en bokning baserat på index
  removeBooking(index) {
    try {
      this.bookings.splice(index, 1);
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};
      allBookings[this.searchRegNr] = this.bookings;
      localStorage.setItem('allBookings', JSON.stringify(allBookings));
    } catch (error) {
      console.error('Fel vid borttagning av bokning:', error);
      alert('Ett fel uppstod vid borttagning av bokning. Försök igen senare.');
    }
  },

  // Hanterar datumet från WeekCalendar-komponenten
  handleDateSelection(date) {
    this.editedBooking.date = date;
  },

  // Hanterar tidsval från WeekCalendar-komponenten
  handleTimeSelection(time) {
    this.editedBooking.time = time;
  },

  // Skrollar till redigeringssektionen
  scrollToRedigering() {
    const element = document.getElementById("Redigering");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn('Elementet med ID "Redigering" hittades inte.');
    }
  },

  // Returnerar en beskrivning baserat på tjänstetypen
  getDescription(serviceType) {
    switch (serviceType) {
      case 'Full service':
        return 'En fullständig översyn av din bil inklusive oljebyte, filterkontroll och bromsjustering.';
      case 'Oljebyte':
        return 'Inkluderar byte av motorolja och filter.';
      case 'Bromsjustering':
        return 'Justering av bromsbelägg och kontroll av bromsarna.';
      case 'Däckbyte':
        return 'Däckbyte inkluderar balansering och kontroll av däcktryck.';
      default:
        return 'Okänd tjänst.';
    }
  },
},


//==============================================================================================================================================================//
// HTML-mall för komponenten där vi använder Bootstrap för att designa layouten
//==============================================================================================================================================================//

  template: `
    <div class="container mt-4">
      <h1>Visa Bokningar</h1>
      <p>Ange ett registreringsnummer för att visa bokningar.</p>

      <!-- Sökfält för att skriva registeringsnummer -->
      <div class="row g-2 align-items-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4">
        <input 
          v-model="searchRegNr" 
          type="text" 
          class="form-control" 
          placeholder="Ange registreringsnummer"
          @input="searchRegNr = searchRegNr.toUpperCase()"
          @keyup.enter="searchBookings" />
      </div>
      <div class="col-auto">
        <button class="btn btn-primary" @click="searchBookings">Sök</button>
      </div>
    </div>

      <!-- Felmeddelanden -->
      <div v-if="errors.length" class="alert alert-danger">
        <ul class="mb-0">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Lista med aktuella bokningar -->
      <div v-if="incompleteBookings.length > 0">
        <h3 class="mt-3">Aktuella Bokningar för {{ searchRegNr }}</h3>
        <ul class="list-group">
          <li class="list-group-item" v-for="(booking, index) in incompleteBookings" :key="index">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ booking.date }} - {{ booking.serviceType }} kl. {{ booking.time }}</strong>
                <p class="text-muted">{{ getDescription(booking.serviceType) }}</p>
              </div>
              <div class="d-flex">
                <button 
                  class="btn btn-secondary btn-sm me-2"
                  style="width: 100px;" 
                  @click="editBooking(index); scrollToRedigering()">
                  <i class="bi bi-pencil-fill"></i> Ändra
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  style="width: 100px;" 
                  @click="removeBooking(index)">
                  <i class="bi bi-trash3-fill"></i> Avboka
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Lista med avslutade bokningar -->
      <div v-if="completedBookings.length > 0">
        <h3>Avslutade Bokningar för {{ searchRegNr }}</h3>
        <ul class="list-group">
          <li class="list-group-item" v-for="(booking, index) in completedBookings" :key="index">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                {{ booking.date }} - {{ booking.serviceType }} kl. {{ booking.time }}
                <p v-if="booking.completed" class="text-success">[Avslutad: {{ booking.action || 'Ingen åtgärd angiven' }}]</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Formulär för att redigera bokningar -->
      <div v-if="selectedBookingIndex !== null" class="mt-4">
        <div id="Redigering">
          <h4 class="mb-4">Redigera Bokning</h4>
        </div>
        
        <!-- Lägg till WeekCalendar för att välja datum och tid -->
        <week-calendar 
          id="week-calendar"
          :booked-times="bookedTimes"
          @date-selected="handleDateSelection"
          @time-selected="handleTimeSelection"
        ></week-calendar>
        
        <div class="mt-3">
          <p><strong>Valt datum:</strong> {{ editedBooking.date || 'Inget datum valt' }}</p>
          <p><strong>Vald tid:</strong> {{ editedBooking.time || 'Ingen tid vald' }}</p>
        </div>

        <!-- Tjänst -->
        <div class="mb-3">
          <label for="editService" class="form-label"><strong>Tjänst</strong></label>
          <select id="editService" v-model="editedBooking.serviceType" class="form-select">
            <option value="Full service">Full service</option>
            <option value="Oljebyte">Oljebyte</option>
            <option value="Bromsjustering">Bromsjustering</option>
            <option value="Däckbyte">Däckbyte</option>
          </select>
        </div>
        
        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="selectedBookingIndex = null">Avbryt</button>
          <button class="btn btn-primary" @click="updateBooking">Spara Ändringar</button>
        </div>
      </div>
    </div>
  `,
};

// Exporterar komponenten så att den kan användas i andra delar i applikationen
export default CheckBookings;

