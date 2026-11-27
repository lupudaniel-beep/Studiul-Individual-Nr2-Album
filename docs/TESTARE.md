# Verificare — 27 noiembrie 2026

## Verificări automate

Comenzi: `npm run check` și `npm test`. Rezultat local: verificare de sintaxă reușită, **8 teste trecute, 0 eșuate**, Node.js 26.13.0 pe Windows. Testele acoperă crearea albumelor, titlurile invalide, tipurile și dimensiunile fișierelor, reordonarea la limite, importul cu identități noi, respingerea surselor active și escapadarea HTML. Testele serverului verifică servirea aplicației și refuzul accesului la fișiere nepublice.

## Verificări efectuate în browserul integrat

Date folosite: două imagini demonstrative generate local, cu etichetele „MUNTE” și „MARE”; nu fotografii personale și nu capturi simulate ale aplicației.

| Acțiune | Rezultat observat |
| --- | --- |
| Creare album cu titlu și descriere | Album vizibil în colecție |
| Reîncărcare după creare | Albumul a rămas salvat |
| Încărcare a două fișiere PNG | Două fotografii afișate |
| Reordonare | Imaginea MARE a devenit prima și coperta |
| Descriere introdusă și editată din tastatură | Text păstrat după reîncărcare |
| Schimbare în aspect Poveste | Aspect păstrat după reîncărcare |
| Vizualizare mărită și Precedenta | Imaginea și indicatorul 1/2 s-au actualizat |
| Backup JSON | Fișier descărcat |
| Importul backup-ului | A doua copie a albumului, cu două imagini |
| Export HTML | Fișier descărcat cu imagini incluse |
| Ecran desktop 1280 px și mobil 390 px | Fără depășire orizontală a paginii; importul mobil ajustat după inspecție |
| Jurnal de erori JavaScript din browser | Nicio eroare în intervalul verificat |

Automatizarea prin completare programatică a câmpului nu a declanșat inițial evenimentul nativ `change`. Verificarea descrierii a fost repetată printr-o editare din tastatură și ieșire din câmp; textul a persistat. Acest detaliu nu este ascuns drept test reușit la prima încercare.

## Limite și verificări de repetat înainte de prezentare

- Nu s-a testat epuizarea cotei IndexedDB, limita reală de 100 fotografii sau performanța albumelor foarte mari.
- Nu s-a efectuat o matrice completă de browsere sau un audit complet de accesibilitate.
- Confirmările de ștergere și drag-and-drop trebuie verificate separat; încărcarea observată a folosit selectorul de fișiere.
- Verificarea locală nu echivalează cu o rulare reușită în GitHub Actions. Rezultatul Actions se verifică în repository.
- Imprimarea și salvarea ca PDF depind de dialogul browserului și nu au fost verificate.
