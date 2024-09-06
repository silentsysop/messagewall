# Projektisuunnitelma: Viestiseinä-sovellus

## 1. Projektin Tavoite
- Luoda selainpohjainen viestiseinä-sovellus, jota tapahtuman kävijät voivat käyttää viestien lähettämiseen ja lukemiseen reaaliajassa.
- Sovelluksen täytyy tukea useiden eri tapahtumien luomista ja hallintaa.

## 2. Keskeiset Toiminnallisuudet
- **Käyttäjärekisteröinti ja kirjautuminen**: Tapahtuman järjestäjät voivat luoda tilin ja kirjautua sisään hallitakseen viestiseiniä.
- **Viestiseinän luonti**: Järjestäjät voivat luoda uusia viestiseiniä tapahtumilleen.
- **Viestien lähetys ja näyttäminen**: Tapahtuman kävijät voivat lähettää viestejä viestiseinälle, ja viestit näytetään reaaliajassa.
- **Moderointi**: Järjestäjät voivat poistaa sopimattomia viestejä tai asettaa viestit odottamaan hyväksyntää ennen niiden julkaisua.
- **Reaaliaikaisuus**: Viestien on päivityttävä seinällä reaaliajassa ilman sivun uudelleenlatausta.
- **Responsiivisuus**: Sovelluksen tulee toimia sekä työpöydällä että mobiililaitteilla.

## 3. Teknologiat
- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Tietokanta**: MongoDB tai PostgreSQL
- **Autentikointi**: JWT tai OAuth
- **Reaaliaikainen viestintä**: WebSocket (esim. Socket.io)
- **Hosting**: Heroku, Vercel tai AWS
- **Versiohallinta**: Git (GitHub/GitLab)
- **Testaus**: Jest, Mocha

## 4. Arkkitehtuuri
- **Backend**: REST API Expressillä, joka huolehtii autentikoinnista, viestien tallentamisesta ja hakemisesta tietokannasta sekä viestien moderoinnista.
- **Frontend**: React-pohjainen käyttöliittymä, joka näyttää viestiseinät ja mahdollistaa viestien lähettämisen. Viestit päivittyvät reaaliajassa WebSocketien avulla.
- **Reaaliaikainen päivitys**: WebSocketit mahdollistavat sen, että viestit päivittyvät seinälle heti, kun joku lähettää uuden viestin.

## 5. Vaiheistus ja työlista
- **Vaihe 1: Suunnittelu**
  - Tarkempi määrittely ja käyttöliittymän suunnittelu (Figma, Sketch, tms.)
  - Tietokannan skeeman suunnittelu
- **Vaihe 2: Backend**
  - Node.js ja Express-sovelluksen perustaminen
  - Tietokannan ja REST API:n toteutus
  - Autentikointi- ja autorisointiratkaisun rakentaminen
  - WebSocketien integrointi reaaliaikaisuutta varten
- **Vaihe 3: Frontend**
  - React-projektin perustaminen
  - Käyttöliittymän rakentaminen
  - Viestien lähettämisen ja näyttämisen toteuttaminen
  - Reaaliaikaisen päivityksen integrointi WebSocketeilla
- **Vaihe 4: Testaus**
  - Yksikkötestit backendille ja frontendille
  - Integraatiotestit
  - Manuaalinen testaus eri laitteilla
- **Vaihe 5: Deployaus**
  - Hosting-palvelun valinta ja käyttöönotto
  - Sovelluksen deployaus ja jatkuvan integraation (CI/CD) automatisointi
