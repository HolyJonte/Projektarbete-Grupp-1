// Denna export default gör att komponentens inställningar exporteras så att den kan användas i Vue-applikationen.
export default {
    // Definierar de egenskaper som komponenten tar emot från föräldern, här skickas "bookedTimes"
    props: ['bookedTimes'], 

    // Data för komponenten. Inkluderar variabler för den valda veckan, datum och tid.
    data() {
      return {
        selectedWeek: this.getCurrentWeek(),   // Sätter aktuell vecka(hämtas från metoden "getCurrentWeek")
        selectedDate: '',                      // Variabel för det valda datumet
        selectedTime: '',                      // Variabel för den valda tiden
      };
    },
    methods: {
      // Hämtar den aktuella veckan (måndag till fredag)
      getCurrentWeek() {
        // Skapar ett Date-objekt för dagens datum
        const today = new Date();
        // Beräknar måndagens datum
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); 
        const week = [];
        // Endast måndag-fredag
        for (let i = 0; i < 5; i++) { 
          // Skapar en ny Date för varje dag
          const day = new Date(startOfWeek);
          // Uppdaterar datumet till rätt dag i veckan
          day.setDate(startOfWeek.getDate() + i);
          // Lägger till dagarna i veckan i YYYY-MM-DD format
          week.push(day.toISOString().split('T')[0]);
        }

        // Returnerar veckan
        return week;
      },
      // Navigera till föregående vecka
      prevWeek() {
        this.selectedWeek = this.selectedWeek.map((date) => {
          const newDate = new Date(date);
          // Minskar 7 dagar för att gå till föregående vecka
          newDate.setDate(newDate.getDate() - 7);
          // Returnerar datumet i ISO-format
          return newDate.toISOString().split('T')[0];
        });
      },

      // Navigera till nästa vecka
      nextWeek() {
        this.selectedWeek = this.selectedWeek.map((date) => {
          const newDate = new Date(date);
          // Ökar 7 dagar för att gå till nästa vecka 
          newDate.setDate(newDate.getDate() + 7);
          // Returnerar datumet i ISO-format
          return newDate.toISOString().split('T')[0];
        });
      },

      // Kontrollerar om en tid är bokad genom att jämföra med den lista av bokade tider som skickas som prop 
      isTimeBooked(date, time) {
        return this.bookedTimes.some(
          // Jämför datum och tid med bokade tider 
          (booking) => booking.date === date && booking.time === time
        );
      },

      // Hantera val av tid (uppdatera både datum och tid)
      selectDateTime(date, time) {
        // Om tiden redan är bokad så visas följande alert
        if (this.isTimeBooked(date, time)) {
          alert('Tiden är redan bokad!');
          // Avslutar funktionen
          return;
        }
        this.selectedDate = date; // Markera valt datum
        this.selectedTime = time; // Markera vald tid
        this.$emit('date-selected', date); // Skicka valt datum till BookingForm
        this.$emit('time-selected', time); // Skicka vald tid till BookingForm
      },

      // Formatera datum till önskat format
      formatDate(date) {
        // Specifikation för att visa dag och förkortad månad
        const options = { day: 'numeric', month: 'short' }; 
        // Returnera datumet i svenska format
        return new Date(date).toLocaleDateString('sv-SE', options);
      },

    },

    // HTML-mall för att visa veckobyn och bokningstabell
    template: `
      <div>
        <!-- Navigeringsknappar för vecka -->
        <div class="d-flex justify-content-between mb-3">
          <button class="btn btn-secondary mx-2" @click="prevWeek">
            <i class="bi bi-arrow-left"></i>
          </button>
          <button class="btn btn-secondary" @click="nextWeek">
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
        
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th v-for="day in selectedWeek" :key="day" @click="selectDateTime(day, selectedTime)">
                {{ formatDate(day) }}
                <div 
                  :class="{
                    'bg-primary text-white': selectedDate === day,
                    'bg-light': selectedDate !== day
                  }"
                  class="p-2 rounded">
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hour in Array.from({ length: 10 }, (_, i) => 9 + i)" :key="hour">
              <td v-for="day in selectedWeek" :key="day" @click="selectDateTime(day, hour + ':00')">
                <div 
                  :class="{
                    'bg-success text-white': !isTimeBooked(day, hour + ':00') && selectedDate === day && selectedTime === hour + ':00',
                    'bg-danger text-white': isTimeBooked(day, hour + ':00'),
                    'bg-light': !isTimeBooked(day, hour + ':00') && (selectedDate !== day || selectedTime !== hour + ':00')
                  }"
                  class="p-2 rounded">
                  {{ hour }}:00
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  };
  