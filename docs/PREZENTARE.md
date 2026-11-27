# Scenariu de prezentare — aproximativ 5–7 minute

1. **Tema și scopul (30 secunde).** Studiul nr. 2 cere un generator de albume foto și folosirea GitHub. Albumia organizează fotografii local și generează un album portabil.
2. **Pornirea (30 secunde).** Arată README-ul, rulează `npm start` și deschide adresa locală. Nu este necesară instalarea pachetelor.
3. **Demonstrația (2 minute).** Creează un album „Excursie”, adaugă două fotografii proprii, completează descrierile și părăsește câmpurile pentru salvare. Reordonează imaginile și explică schimbarea copertei. Alege aspectul Poveste și deschide o imagine mărită.
4. **Persistență și export (1 minut).** Reîncarcă pagina. Descarcă backup-ul JSON și importă-l ca o copie. Exportă HTML și deschide fișierul separat; arată că imaginile sunt incluse.
5. **Cod și teste (1 minut).** Prezintă separarea dintre interfață (`app.js`) și reguli (`model.js`). Rulează `npm test` și `npm run check`. Explică un test de reordonare și unul de protecție a exportului.
6. **GitHub (1 minut).** Deschide repository-ul și istoricul real de commit-uri. Arată README, cerințele și workflow-ul. Prezintă rezultatul din Actions doar dacă rularea este efectiv disponibilă și terminată cu succes.
7. **Limite și extinderi (30 secunde).** Datele sunt locale, nu se sincronizează; imaginile sunt redimensionate. Extensii posibile: stocare pe server, colaborare, teme și export PDF dedicat.

## Întrebări posibile

- **De ce JavaScript fără framework?** Domeniul este mic; aplicația pornește fără instalare și separă regulile testabile de interfață.
- **De ce IndexedDB?** Poate păstra date mai voluminoase decât localStorage și oferă tranzacții. Cota depinde totuși de browser.
- **Cum se evită codul introdus prin descrieri?** Interfața folosește textContent, iar exportul escapează caracterele HTML. Importul exclude sursele active și URL-urile externe.
- **Ce dovedește GitHub?** Istoricul și fișierele efectiv publicate, nu o colaborare inventată. Codul a fost realizat cu asistență AI; pentru prezentare trebuie înțeles și explicat.
