//Denna komponent definierar en navigationsbar för Vue.js-applikationen.
//Vi använder Bootstrap för layout och styling samt inkulderar ikoner från Bootstrap Icons.
//Komponentens navigationsmeny är uppdelad i olika sektioner som länkar till sidor som
//startsidan, tjänster, kontakt, boka service, mina bokningar och admin.
//Menyn är responsiv och anpassar sig för mindre skärmar genom en hamburgermeny. 
const Header = {
  template: `
    <nav class="navbar navbar-expand-md navbar-light bg-light">
      <div class="container-fluid">
        <!-- Logotypen med ikon -->
        <a class="navbar-brand" href="#">
          <i class="bi bi-car-front-fill"></i> MaJoVi Service AB
        </a>
        
        <!-- Hamburgermenyn -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Menyn -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav d-flex flex-md-row">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house-fill"></i> Hem
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/services">
                <i class="bi bi-tools"></i> Tjänster
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/contact">
                <i class="bi bi-telephone-fill"></i> Kontakt
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/book">
                <i class="bi bi-calendar-check"></i> Boka Service
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/check-bookings">
                <i class="bi bi-journals"></i> Visa Bokningar
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">
                <i class="bi bi-key"></i> ADMIN
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
};
//Exporterar Header-komponenten som standard, vilket gör den tillgänlig för import i
//andra filer i applikationen.
export default Header;
