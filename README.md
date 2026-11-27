# Albumia — Generator de albume cu fotografii

Studiul individual nr. 2: **Instrumente pentru dezvoltarea în echipă a proiectelor software**.

Aplicație web în limba română pentru crearea, organizarea și exportarea albumelor foto. Fotografiile sunt procesate în browser și salvate pe dispozitiv, fără server de stocare sau cont de utilizator.

## Pornire rapidă

Necesită Node.js 22 sau mai nou și un browser modern cu IndexedDB și createImageBitmap (Chrome, Edge, Firefox). Nu există pachete externe de instalat.

```sh
git clone https://github.com/lupudaniel-beep/Studiul-Individual-Nr2-Album.git
cd Studiul-Individual-Nr2-Album
npm start
```

Deschide **http://127.0.0.1:4173**. Oprește serverul cu `Ctrl+C`. Folosește mereu aceeași adresă și același port pentru a accesa albumele salvate. Deschiderea directă a `index.html` prin `file://` nu este suportată.

## Funcționalități

- Creare, redenumire, descriere, căutare și ștergere de albume.
- Încărcare multiplă sau drag-and-drop pentru JPG, PNG, WebP și GIF.
- Descrieri pentru fiecare fotografie, salvate când părăsești câmpul editat.
- Reordonare prin butoanele Înapoi/Înainte; prima imagine devine copertă.
- Aspect Grilă sau Poveste; vizualizare mărită cu navigare din tastatură.
- Salvare persistentă în IndexedDB și restaurare la reîncărcarea paginii.
- Backup JSON cu fotografii incluse; importul creează o copie cu identificatori noi.
- Export HTML autonom, cu imagini incluse, care se poate deschide fără aplicație sau conexiune. Pentru imprimare sau salvare ca PDF folosește dialogul de tipărire al browserului în fișierul exportat.
- Confirmare înainte de ștergere; validare format/mărime și mesaje la erori de stocare.

## Limite explicite

Maximum 100 de fotografii per album, 10 MB per fotografie și 100 MB per fișier JSON importat. Imaginile sunt convertite în JPEG cu latura maximă de 2000 px: transparența devine albă, iar GIF-urile devin imagini statice. Originalele de pe disc nu sunt modificate. Păstrează separat fotografiile originale.

Albumele sunt locale profilului de browser și originii web; ștergerea datelor site-ului le elimină. Folosește backup-uri JSON. Nu există sincronizare între dispozitive, autentificare sau editare colaborativă. Editează colecția într-o singură filă: modificările simultane în mai multe file nu sunt sincronizate. Salvarea este limitată de spațiul alocat de browser. Testele de epuizare a cotei, încărcare maximă și compatibilitate în toate browserele nu au fost efectuate.

## Structură și arhitectură

| Fișier | Responsabilitate |
| --- | --- |
| `index.html` | Structură semantică, controale și dialoguri |
| `style.css` | Stiluri și adaptare la ecrane mici |
| `app.js` | Interacțiuni, prelucrarea imaginilor, IndexedDB și descărcări |
| `model.js` | Validare, modelul albumului, reordonare și export HTML sigur |
| `server.mjs` | Server local cu listă explicită de fișiere publice |
| `test/` | Teste automate cu `node:test` |
| `docs/` | Cerințe, prezentare și rezultate de verificare |
| `.github/workflows/ci.yml` | Verificări automate la push și pull request |

Un album conține `id`, `title`, `description`, `layout`, `createdAt` și `photos`. Fiecare fotografie conține `id`, `name`, `caption` și `src` (imagine inclusă ca data URL). Textul utilizatorului este afișat cu `textContent`; la export este escapadat. Importul acceptă doar imagini raster incluse, nu URL-uri externe, SVG sau JavaScript. Serverul local nu expune întregul director de lucru.

## Testare

```sh
npm run check
npm test
```

Verificările de sintaxă și testele sunt fără dependențe externe. Rezultatele observate și limitele verificării se află în [docs/TESTARE.md](docs/TESTARE.md). Workflow-ul GitHub configurează aceste verificări; existența fișierului workflow nu dovedește că o rulare GitHub a trecut — verifică fila **Actions**.

## Gestionarea prin GitHub

Repository: [lupudaniel-beep/Studiul-Individual-Nr2-Album](https://github.com/lupudaniel-beep/Studiul-Individual-Nr2-Album).
