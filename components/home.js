//Denna komponent definierar första sidan på webbplatsen och innehåller flera sektioner som
//en sektion med en välkomsttext och knappar för att boka service och läsa mer om tjänster,
//en "Om oss"- sektion som beskriver företagets tjänster och expertis,
//en sektion med kort som presenterar fördelarna med att välja detta företag.
//Alla sektioner använder Bootstrap-klasser för att skapa ett responsiv och fin layout
const Home = {
    template: `
      <div class="m-3">
        <!-- Introduktionssektion -->
        <div class="hero bg-secondary text-white p-5 rounded-3">
          <h2 class="display-4">Välkommen till Majovi Service AB</h2>
          <p class="lead">Din pålitliga partner för bilservice och underhåll. Vi erbjuder ett brett utbud av tjänster för att hålla din bil i toppskick.</p>
          <a href="#book" class="btn btn-primary btn-lg">Boka Service</a>
          <a href="#services" class="btn btn-light btn-lg ms-2">Läs mer om våra tjänster</a>
        </div>
  
        <!-- Om oss-sektion -->
        <div class="mt-5">
          <h3>Om Majovi Service AB</h3>
          <p>På Majovi Service AB erbjuder vi professionell bilservice och reparationer för alla bilmodeller. Vi strävar efter att ge dig snabb och pålitlig service för att säkerställa att din bil alltid är i bästa skick.</p>
          <p>Oavsett om du behöver ett rutinmässigt oljebyte, bromsjustering eller mer avancerade reparationer, kan du lita på vårt erfarna team för att ta hand om din bil med högsta noggrannhet och omsorg.</p>
        </div>
  
        <!-- Fördelar med att välja oss -->
        <div class="row row-cols-1 row-cols-md-4 g-4 mt-5">
          <!-- Kort 1 -->
          <div class="col">
            <div class="card d-flex flex-column h-100">
              <div class="card-body">
                <h5 class="card-title">
                  Erfarenhet
                  <i class="bi bi-check-circle-fill text-success"></i>
                </h5>
                <p class="card-text">Vi har över 20 års erfarenhet av bilservice och reparationer.</p>
              </div>
            </div>
          </div>
          <!-- Kort 2 -->
          <div class="col">
            <div class="card d-flex flex-column h-100">
              <div class="card-body">
                <h5 class="card-title">
                  Snabb Service
                  <i class="bi bi-check-circle-fill text-success"></i>
                </h5>
                <p class="card-text">Vi erbjuder snabb och effektiv service för att du ska kunna komma tillbaka på vägen snabbt.</p>
              </div>
            </div>
          </div>
          <!-- Kort 3 -->
          <div class="col">
            <div class="card d-flex flex-column h-100">
              <div class="card-body">
                <h5 class="card-title">
                  Prisvärdhet
                  <i class="bi bi-check-circle-fill text-success"></i>
                </h5>
                <p class="card-text">Vi erbjuder konkurrenskraftiga priser utan att tumma på kvaliteten.</p>
              </div>
            </div>
          </div>
          <!-- Kort 4 -->
          <div class="col">
            <div class="card d-flex flex-column h-100">
              <div class="card-body">
                <h5 class="card-title">
                  Kundnöjdhet
                  <i class="bi bi-check-circle-fill text-success"></i>
                </h5>
                <p class="card-text">Vår kundnöjdhet är vår högsta prioritet, och vi strävar alltid efter att överträffa dina förväntningar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
//Exporterar Home-komponenten som standard, vilket gör den tillgänlig för import i
//andra filer i applikationen.
  export default Home;