// Importerar kalenderkomponent från WeekCalender.js
import WeekCalendar from './weekCalendar.js'; 

// Skapar denna komponents konstant
const BookingForm = {

  // Registrerar kalenderkomponenten som används i formuläret
  components: { WeekCalendar },

  // Skapar ett dataobjekt i Vue komponenten
  data() {
    // Definerar vad dataobjektet ska innehålla för variabler
    return {
      currentStep: 1, // Skapar en variabel att spara aktuellt steg, denna börjar på steg 1
      name: '', // Namn på personen som bokar
      email: '', // E-postadress
      phone: '', // Telefonnummer
      carRegistration: '', // Registreringsnummer för bilen
      date: '', // Valt datum för bokning
      time: '', // Vald tid för bokning
      serviceType: '', // Vald tjänst
      errors: [], // Lista att spara felmeddelanden i
      showModal: false, // Visar eller döljer modalen som används för bekräftelse av bokning
      bookedTimes: this.getBookedTimes(), // Hämtar alla redan bokade tider
    };
  },

  //--------------------------------------------------------------------------------
  // Computed. Här under ligger beräkningar som görs i BookingForm
  //--------------------------------------------------------------------------------

  computed: {
    // Skapar en funktion för att räkna ut vilka tider som är tillgängliga att boka
    availableTimes() {
      // Skapar en tom lista som lagras i konstanten times
      const times = [];
      // Skapar en for loop som går igenom tider från 09:00 till 18:00 och infogar vald timme
      for (let hour = 9; hour <= 18; hour++) {
        const time = `${hour}:00`;

        // Letar efter om tiden redan är bokad för valt datum
        const isBooked = this.bookedTimes.some(
          (booking) => booking.date === this.date && booking.time === time
        );

        // Bestämmer vad som händer om inget är bokat
        if (!isBooked) {
          times.push(time);
        }
      }
      // Returnerar alla lediga tider
      return times; 
    },
  },

  //--------------------------------------------------------------------------------
  // Methods. Här under ligger metoder som används i komponeneten
  //--------------------------------------------------------------------------------

  methods: {
    // Metoden för att gå mellan steg i bokningskarusellen.
    nextStep() {
       // Rensar eventuella felmeddelanden från föregående steg
      this.errors = [];

      // Skapar en if-sats över vilket som är det aktuella steget
      // Denna definerar också vilka felmeddelanden som ska skrivas om allt inte är ifyllt 
      if (this.currentStep === 1 && !this.carRegistration) {
        this.errors.push('Registreringsnummer är obligatoriskt.');
      } else if (this.currentStep === 2 && !this.serviceType) {
        this.errors.push('Välj en tjänst.');
      } else if (this.currentStep === 3 && (!this.date || !this.time)) {
        this.errors.push('Datum och tid är obligatoriska.');
      }

      // Går till nästa steg om inga fel finns
      if (this.errors.length === 0) {
        this.currentStep++;
      }
    },

    // Definerar en metod för att gå tillbaka ett steg om steget är mer än 1
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--; 
      }
    },

    // Definerar en metod för att skapa en bokning
    submitBooking() {
      // Hämtar befintliga bokningar från localStorage vilket sparas även om man stänger webbläsaren
      // Denna omvadlar även innehållet från JSON till JavaScript-objekt
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};

      // Bestämmer hur data ska sparas i bokningsdetaljerna, med Key: Value
      const bookingDetails = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        carRegistration: this.carRegistration,
        date: this.date,
        time: this.time,
        serviceType: this.serviceType,
      };

      // Kontrollerar om det finns en en lista för bilens bokningar, om inte skapas det en
      if (!allBookings[this.carRegistration]) {
        allBookings[this.carRegistration] = [];
      }

      // Lägger till den nya bokningen
      allBookings[this.carRegistration].push(bookingDetails); 

      // Omvandlar dat i bokningen till JSON igen och sparar denna i localStorage
      localStorage.setItem('allBookings', JSON.stringify(allBookings)); 

      // Visar en modal över bokningsprocessen där man ser bokningsdetaljerna från bookingDetails
      this.showModal = true;
    },

    // Skpar en metod för att stänga modalen och navigerar sedan tillbaka till startsidan
    closeModal() {
      this.showModal = false;
      this.$router.push('/');
    },

    // Definerar en metod för att läsa in redan bokade tider
    getBookedTimes() {
      // Hämtar befintliga bokningar från localStorage
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};
      // Omvandlar data i allBookings till en array (lista)
      return Object.values(allBookings).flat(); 
    },

    // Metod för att uppdatera vald datum från WeekCalendar
    handleDateSelection(date) {
      this.date = date;
    },

    // Metod för att uppdatera vald tid från WeekCalendar
    handleTimeSelection(time) {
      this.time = time;
    },
  },

  //--------------------------------------------------------------------------------
  // Template. Här ligger HTML-layouten för bokningsformuläret
  //--------------------------------------------------------------------------------

  template: `

    <!-- Använder bootstrap klasser för att skapa en struktur på hela bokningsformuläret -->
    <div class="container mt-5">
      <div class="card shadow-lg d-flex justify-content-center mx-auto col-md-12 col-lg-6">

        <!-- Skapar en del för rubrik och infogar vilket steg man ligger på i karusellen -->
        <div class="card-header text-center">
          <h2>Boka Service - Steg {{ currentStep }}</h2>
        </div>
        <div class="card-body">
        
          <!-- Skapar en sektion som visar felmeddelanden som visas -->
          <div v-if="errors.length" class="alert alert-danger">
            <ul class="mb-0">
              <li v-for="error in errors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <!-- Här visas Steg 1 där kund fyller i Regnr i ett formulär -->
          <div v-if="currentStep === 1">
            <!-- Skapar ett formulär för att fylla i -->
            <label for="carRegistration" class="form-label">Registreringsnummer</label>
            <input 
              id="carRegistration" 
              v-model="carRegistration" 
              class="form-control" 
              placeholder="Ange ditt registreringsnummer"
              @keyup.enter="nextStep"
              @input="carRegistration = carRegistration.toUpperCase()" 
            />

            <!-- Skapar en primärknapp med hjälp av bootstrap, även denna går vidare till nästa steg i karusellen -->
            <div class="d-flex justify-content-end mt-4">
              <button class="btn btn-primary" 
                style="width: 150px;" 
                @click="nextStep">Nästa</button>
            </div>
          </div>

          <!-- Här visas Steg 2 där kund får välja en tjänst att boka -->
          <div v-if="currentStep === 2">
            <label for="serviceType" class="form-label">Tjänst</label>
            
            <!-- Här skapas olika alternativ i ett select formulär, med 4 olika alternativ -->
            <select id="serviceType" v-model="serviceType" class="form-select">
              <option value="Full service">Full service - 2,000 kr</option>
              <option value="Oljebyte">Oljebyte - 700 kr</option>
              <option value="Bromsjustering">Bromsjustering - 1,000 kr</option>
              <option value="Däckbyte">Däckbyte - 500 kr</option>
            </select>

            <!-- Bestämmer placering och utseende på knappar -->
            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-secondary" 
                style="width: 150px;" 
                @click="prevStep">Tillbaka</button>
              <button class="btn btn-primary" 
                style="width: 150px;" 
                @click="nextStep">Nästa</button>
            </div>
          </div>

          <!-- Här visas Steg 3 där kund får välja datum och tid i en kalender -->
          <div v-if="currentStep === 3">
            <!-- Hämtar week-calender från den andra komponenten och infogar Bokade tider, Time och Date funktionerna sen tidigare -->
            <week-calendar 
              id="week-calendar"
              :booked-times="bookedTimes"
              @date-selected="handleDateSelection"
              @time-selected="handleTimeSelection"
            ></week-calendar>
            
            <!-- Visar valt datum och tid under kalendern -->
            <div class="mt-3">
              <p><strong>Valt datum:</strong> {{ date || 'Inget datum valt' }}</p>
              <p><strong>Vald tid:</strong> {{ time || 'Ingen tid vald' }}</p>
            </div>

            <!-- Infogar två knappar längst ner -->
            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-secondary" 
                style="width: 150px;" 
                @click="prevStep">Tillbaka</button>
              <button class="btn btn-primary" 
                style="width: 150px;" :disabled="!date || !time" 
                @click="nextStep">Nästa</button>
            </div>
          </div>

          <!-- Här visas steg 4 där kund får fylla i namn, telefonnummer, email och bekräfta sin bokning -->
          <div v-if="currentStep === 4">
            <h5>Bekräfta din bokning</h5>
            <p class="mt-4 mb-0">Namn:</p>
            <input 
              id="Namn" 
              v-model="name" 
              class="form-control" 
              placeholder="Ange ditt namn"/>
              
              <p class="mt-4 mb-0">Telefonnummer:</p>
              <input 
              id="Telnr" 
              v-model="phone" 
              class="form-control" 
              placeholder="Ange ditt telefonnummer"/>
              
              <p class="mt-4 mb-0">Email:</p>
              <input 
              id="email" 
              v-model="email" 
              class="form-control" 
              placeholder="Ange din mailadress"/>
              
            <!-- Här infogas och visas vad som redan är valts i tidgare steg -->
            <ul class="mt-4">
              <li><strong>Registreringsnummer:</strong> {{ carRegistration }}</li>
              <li><strong>Tjänst:</strong> {{ serviceType }}</li>
              <li><strong>Datum:</strong> {{ date }}</li>
              <li><strong>Tid:</strong> {{ time }}</li>
            </ul>

            <!-- Infogar två knappar längst ner -->
            <div class="d-flex justify-content-between mt-4">
              <button class="btn btn-secondary" 
                style="width: 150px;"
                @click="prevStep">Tillbaka</button>
              <button 
                class="btn btn-primary"
                style="width: 150px;" 
                :disabled="!name || !phone || !email" 
                @click="submitBooking">Bekräfta
               </button>
            </div>
          </div>
        </div>

        <!-- Här visas modalens bakgrund som ligger bakom bokningsbekräftelsen -->
        <div v-if="showModal" class="modal-backdrop show"></div>

        <!-- Här visas modalen överst på fönstret, som innehåller bokningsbekräftelsen -->
        <div v-if="showModal" class="modal fade show blur" tabindex="-1" aria-labelledby="confirmationModalLabel" style="display: block;">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="confirmationModalLabel">Bokningsbekräftelse</h5>
                <button type="button" class="btn-close" @click="closeModal" aria-label="Stäng"></button>
              </div>
              <div class="modal-body">

                <!-- Här infogas alla ifyllda uppgifter från bokningen -->
                <p>Din bokning är mottagen!</p>
                <ul>
                  <li><strong>Namn:</strong> {{ name }}</li>
                  <li><strong>Telefonnummer:</strong> {{ phone }}</li>
                  <li><strong>E-mail:</strong> {{ email }}</li>
                  <li><strong>Registreringsnummer:</strong> {{ carRegistration }}</li>
                  <li><strong>Tjänst:</strong> {{ serviceType }}</li>
                  <li><strong>Datum:</strong> {{ date }}</li>
                  <li><strong>Tid:</strong> {{ time }}</li>
                </ul>
              </div>

              <!-- Här infogas stängknappen för modalen -->
              <div class="modal-footer">
                <button type="button" 
                  class="btn btn-secondary"
                  style="width: 150px;" 
                  @click="closeModal">Stäng</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

// Exporterar komponenten för användnig från andra komponenter
export default BookingForm;
