import WeekCalendar from './weekCalendar.js';

// Huvudkomponent för adminpanel
const Admin = {
  // Registrerar weekCalendar-komponent
  components: { WeekCalendar },
  data() {
    return {

      searchRegNr: '', // Sökt reg.nr      
      searchName: '', // Sökt namn      
      bookings: [], // Lista över aktuella bokningar
      allBookings: [], // Lista över alla bokningar
      errors: [], // Lista över felmeddelanden
      expandedBookingIndex: null, // Håller reda på expanderad bokning
      selectedCategory: 'booked', // Filterkategori för bokningar (standard: bokad)
      selectedBooking: null, // Bokningen som för närvarande är markerad
      sortDirection: 'asc', // Sorteringsordning för datum (stigande som standard)
    };
  },

  computed: {
    // Filtrera och sortera bokningar baserat på vald kategori och datum
    filteredBookings() {
      const filtered =
        this.selectedCategory === 'all'
          ? this.allBookings // Visa alla bokningar om 'all' är valt'
          : this.allBookings.filter((booking) => booking.status === this.selectedCategory);

      // Sortera filtrerade bokningar efter datum i stigande ordning
      return filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    },
  },

  methods: {
    // Ladda alla bokningar från localStorage
    loadAllBookings() {
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};
      this.allBookings = Object.values(allBookings)
        .flat() // Slätar ut 
        .map((booking) => ({
          ...booking,
          status: booking.status || 'booked', // Default status är 'booked'
        }));
      },
      
    toggleSortDirection() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      },
    

    updateStatus(index, newStatus) {
      const booking = this.allBookings[index];
      if (newStatus === 'in-progress' && booking.status !== 'booked') return;
      if (newStatus === 'completed' && booking.status !== 'in-progress') return;
      this.allBookings[index].status = newStatus;
      this.saveBookings();
    },

    // Visa detaljer om en bokning i en modal
    showBookingDetails(index) {
      this.selectedBooking = this.allBookings[index];
      const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
      modal.show();
    },

    // Visa avboka-modalen
    showCancelModal(index) {
      this.selectedBooking = this.filteredBookings[index];
      const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
      modal.show();
    },

    // Bekräfta avbokning och ta bort bokningen
    confirmCancelBooking() {
      const booking = this.selectedBooking;

      // Ta bort bokningen från `allBookings`
      this.allBookings = this.allBookings.filter(
        (b) => !(b.carRegistration === booking.carRegistration && b.date === booking.date)
      );

      // Uppdatera localStorage
      const allBookings = JSON.parse(localStorage.getItem('allBookings')) || {};
      allBookings[booking.carRegistration] = (allBookings[booking.carRegistration] || []).filter(
        (b) => b.date !== booking.date
      );
      localStorage.setItem('allBookings', JSON.stringify(allBookings));

      // Stäng modalen
      const modal = bootstrap.Modal.getInstance(document.getElementById('cancelModal'));
      modal.hide();
    },

    setCategory(category) {
      this.selectedCategory = category;
    },
  },

  mounted() {
    this.loadAllBookings(); // Ladda alla bokningar när komponenten är monterad
  },

  template: `
    <div class="container mt-4">

      <!-- Kategorival för bokningar -->
      <div class="btn-group mb-3" role="group" aria-label="Category selection">
        <button 
          class="btn btn-primary" 
          :class="{ active: selectedCategory === 'all' }" 
          @click="setCategory('all')">
          Alla
        </button>
        <button 
          class="btn btn-primary" 
          :class="{ active: selectedCategory === 'booked' }" 
          @click="setCategory('booked')">
          Bokade
        </button>
        <button 
          class="btn btn-primary" 
          :class="{ active: selectedCategory === 'in-progress' }" 
          @click="setCategory('in-progress')">
          Pågående
        </button>
        <button 
          class="btn btn-primary" 
          :class="{ active: selectedCategory === 'completed' }" 
          @click="setCategory('completed')">
          Avslutade
        </button>
      </div>

      <!-- Tabell med bokningar -->
      <div v-if="filteredBookings.length > 0">
        <h3 class="my-4">Bokningar</h3>
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>
                Datum
                <button class="btn btn-sm btn-link p-0" @click="toggleSortDirection">
                  <i 
                    v-if="sortDirection === 'asc'" 
                    class="bi bi-arrow-up"></i>
                  <i 
                    v-if="sortDirection === 'desc'" 
                    class="bi bi-arrow-down"></i>
                </button>
              </th>
              <th>Reg.nr</th>
              <th>Tid</th>
              <th>Tjänst</th>
              <th>Status</th>
              <th>Mer info</th>
              <th>Avboka</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(booking, index) in filteredBookings" :key="index">
              <td>{{ booking.date }}</td>
              <td>{{ booking.carRegistration }}</td>
              <td>{{ booking.time }}</td>
              <td>{{ booking.serviceType }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <select 
                    class="form-select form-select-sm me-2"
                    v-model="booking.status" 
                    @change="updateStatus(index, booking.status)">
                    <option value="booked">Bokad</option>
                    <option value="in-progress">Pågående</option>
                    <option value="completed">Avslutad</option>
                  </select>
                  <i v-if="booking.status === 'booked'" class="bi bi-calendar-check text-primary"></i>
                  <i v-if="booking.status === 'in-progress'" class="bi bi-hourglass-split text-warning"></i>
                  <i v-if="booking.status === 'completed'" class="bi bi-check-circle text-success"></i>
                </div>
              </td>
              <td>
                <button class="btn btn-sm btn-link" @click="showBookingDetails(index)">
                  Visa detaljer
                </button>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" @click="showCancelModal(index)">
                  Avboka
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal för att visa bokningsdetaljer -->
      <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookingModalLabel">Bokningsdetaljer</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Namn:</strong> {{ selectedBooking?.name }}</p>
              <p><strong>Email:</strong> {{ selectedBooking?.email }}</p>
              <p><strong>Telefon:</strong> {{ selectedBooking?.phone }}</p>
              <p><strong>Reg.nr:</strong> {{ selectedBooking?.carRegistration }}</p>
              <p><strong>Tid:</strong> {{ selectedBooking?.time }}</p>
              <p><strong>Datum:</strong> {{ selectedBooking?.date }}</p>
              <p><strong>Tjänst:</strong> {{ selectedBooking?.serviceType }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Stäng</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal för att bekräfta avbokning -->
      <div class="modal fade" id="cancelModal" tabindex="-1" aria-labelledby="cancelModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="cancelModalLabel">Bekräfta avbokning</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Reg.nr:</strong> {{ selectedBooking?.carRegistration }}</p>
              <p><strong>Datum:</strong> {{ selectedBooking?.date }}</p>
              <p>Är du säker på att du vill avboka denna bokning?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Avbryt</button>
              <button type="button" class="btn btn-danger" @click="confirmCancelBooking">Avboka</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

export default Admin;
