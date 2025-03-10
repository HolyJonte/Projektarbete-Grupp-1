//Denna komponent definierar sidan "Tjänster" och visar kort med bilrelaterade tjänster.
//Vi använder Bootstrapp-klasser för att skapa en responsiv och fin layout.
const Services = {
  template: `
    <div class="m-3">
      <h2>Tjänster</h2>
      <p>Här kan du läsa om våra tjänster, som oljebyte, bromsjustering och andra bilrelaterade tjänster.</p>
      <div class="row">
        <!-- Oljebyte Card -->
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Oljebyte</h5>
              <p class="card-text">Vi byter motorolja för att hålla din bil i toppskick.</p>
              <button class="btn btn-primary mt-auto">Läs mer</button>
            </div>
          </div>
        </div>

        <!-- Bromsjustering Card -->
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Bromsjustering</h5>
              <p class="card-text">Se till att dina bromsar fungerar optimalt för din säkerhet.</p>
              <button class="btn btn-primary mt-auto">Läs mer</button>
            </div>
          </div>
        </div>

        <!-- Däckbyte Card -->
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Däckbyte</h5>
              <p class="card-text">Byt däck för att hålla bilen säker under alla väderförhållanden.</p>
              <button class="btn btn-primary mt-auto">Läs mer</button>
            </div>
          </div>
        </div>

        <!-- Felsökning Card -->
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">Felsökning</h5>
              <p class="card-text">Vi identifierar och åtgärdar bilens tekniska problem.</p>
              <button class="btn btn-primary mt-auto">Läs mer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};
//Exporterar Services-komponenten som standard, vilket gör den tillgänlig för import i
//andra filer i applikationen.
export default Services;