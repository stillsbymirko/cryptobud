# Contributing to CryptoBuddy

Vielen Dank für dein Interesse an CryptoBuddy! Wir freuen uns über jeden Beitrag.

## Wie kann ich beitragen?

### 🐛 Bug Reports

Wenn du einen Bug findest:
1. Prüfe, ob das Problem bereits gemeldet wurde
2. Öffne ein neues Issue mit:
   - Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Screenshots (wenn relevant)
   - Browser/OS Information

### 💡 Feature Requests

Für neue Features:
1. Prüfe die Roadmap und bestehende Issues
2. Öffne ein Issue mit:
   - Beschreibung des Features
   - Use Case / Warum ist es nützlich?
   - Optional: Implementierungsvorschläge

### 🔧 Code Beiträge

1. **Fork** das Repository
2. **Clone** deinen Fork lokal
3. **Branch** erstellen: `git checkout -b feature/dein-feature`
4. **Entwickeln** mit:
   ```bash
   npm run dev
   ```
5. **Testen** dass alles funktioniert
6. **Commit** mit aussagekräftiger Message
7. **Push** zu deinem Fork
8. **Pull Request** erstellen

## Development Setup

```bash
# Repository klonen
git clone https://github.com/yourusername/cryptobud.git
cd cryptobud

# Dependencies installieren
npm install

# Docker Datenbank starten
docker-compose up -d

# .env erstellen
cp .env.example .env
# Editiere .env und füge NEXTAUTH_SECRET hinzu

# Datenbank migrieren
npx prisma migrate dev
npx prisma generate

# Dev Server starten
npm run dev
```

## Code Style

- **TypeScript** für alle neuen Dateien
- **Funktionale Komponenten** mit Hooks
- **Server Components** wo möglich (Next.js App Router)
- **Tailwind CSS** für Styling
- **Prisma** für Datenbankabfragen

### Naming Conventions

- Komponenten: `PascalCase` (z.B. `TransactionList.tsx`)
- Funktionen: `camelCase` (z.B. `calculateTax()`)
- Konstanten: `UPPER_SNAKE_CASE` (z.B. `EXCHANGES`)
- Dateien: `kebab-case` für Routen, `PascalCase` für Komponenten

## Commit Messages

Nutze klare, beschreibende Commit Messages:

```
feat: Add CoinGecko API integration
fix: Correct FIFO calculation for staking rewards
docs: Update README with deployment instructions
style: Format code with Prettier
refactor: Simplify tax calculator logic
test: Add tests for CSV parser
```

Präfixe:
- `feat:` - Neue Features
- `fix:` - Bug Fixes
- `docs:` - Dokumentation
- `style:` - Code Formatting
- `refactor:` - Code Umstrukturierung
- `test:` - Tests
- `chore:` - Maintenance

## Pull Request Process

1. **Beschreibung**: Was wurde geändert und warum?
2. **Testing**: Wurde alles getestet?
3. **Screenshots**: Bei UI-Änderungen
4. **Breaking Changes**: Dokumentieren!

## Exchange Parser hinzufügen

Um einen neuen Exchange Parser hinzuzufügen:

1. Datei öffnen: `lib/parsers/csv-parser.ts`
2. Exchange zu `EXCHANGES` hinzufügen
3. Parser-Funktion implementieren:

```typescript
function parseNewExchange(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    // Parse CSV
    transactions.push({
      date: new Date(parts[0]),
      cryptocurrency: parts[1],
      amount: parseFloat(parts[2]),
      priceEUR: parseFloat(parts[3]),
      type: parts[4] as 'buy' | 'sell' | 'staking',
      exchange: 'NewExchange',
    })
  }
  
  return transactions
}
```

4. Zu `getParser()` Switch hinzufügen
5. Testen mit echten CSV-Daten

## Testing

```bash
# Build testen
npm run build

# TypeScript prüfen
npx tsc --noEmit

# Prisma Schema validieren
npx prisma validate
```

## Fragen?

- Öffne ein Discussion Thread
- Kontaktiere die Maintainer
- Schau in die README.md

## Code of Conduct

- Sei respektvoll und konstruktiv
- Hilf anderen in Issues und Discussions
- Folge den Best Practices

## Lizenz

Mit deinem Beitrag stimmst du zu, dass dein Code unter der ISC Lizenz veröffentlicht wird.

---

**Danke für deinen Beitrag! 🙏**
