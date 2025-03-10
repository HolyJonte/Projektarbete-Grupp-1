// Importerar de olika komponenterna som kommer att användas i applikationen
import WeekCalendar from './components/weekCalendar.js';
import BookingForm from './components/bookingForm.js';
import CheckBookings from './components/checkBookings.js';
import Header from './components/header.js';
import Home from './components/home.js';
import Services from './components/services.js';
import Contact from './components/contact.js';
import Admin from './components/admin.js';

// Definerar alla rutter i applikationen. Varje rutt är en väg och en kopplad komponent 
const routes = [
  { path: '/', component: Home },                         // Startsidan
  { path: '/services', component: Services },             // Sidan för tjänster
  { path: '/contact', component: Contact },               // Sidan för kontaktinformation
  { path: '/book', component: BookingForm },              // Bokningsformuläret
  { path: '/check-bookings', component: CheckBookings },  // Visar bokningar
  { path: '/week-calendar', component: WeekCalendar },    // Ny rutt för kalendern som visar bokningar per vecka
  { path: '/admin', component: Admin },                   // Administratörsvy för att hantera bokningar
];

// Skapar en Vue-router instans med definierade rutter och historik och lagras i konstanten router
const router = VueRouter.createRouter({
  // Skapar en historikhantering med URL:er som använder # istället för fullständig path
  history: VueRouter.createWebHashHistory(),
  // Använder de definierade rutt-konfigurationerna
  routes,
});

// Huvudapplikationens komponent
const App = {
  components: {
    // Inkluderar Header-komponenten för att visa ett gemensamt sidhuvud
    'app-header': Header,
  },
  
  //  HTML-mall
  template: `
    <div>
      <!-- Header-komponenten -->
      <app-header></app-header>

      <!-- Router-view visar innehållet för aktuell rutt -->
      <router-view></router-view>
    </div>
  `,
};

// Skapar en Vue-applikation
const app = Vue.createApp(App);
// Använder routern i applikationen
app.use(router);
// Monterar applikationen på HTML-elementet med id "app"
app.mount('#app');
