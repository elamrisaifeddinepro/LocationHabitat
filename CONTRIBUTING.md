# Contributing to Location Habitat

Merci de votre intérêt pour ce projet. Voici comment contribuer.

## Signaler un bug

Avant de créer une issue :
1. Vérifiez qu'une issue similaire n'existe pas déjà
2. Utilisez le template `Bug report` proposé par GitHub
3. Précisez la version, l'environnement (frontend/backend), et les étapes pour reproduire

## Proposer une fonctionnalité

1. Ouvrez d'abord une issue pour discuter de la pertinence avant de coder
2. Expliquez le besoin métier, pas seulement la solution technique

## Soumettre du code

1. Forkez le dépôt et créez une branche depuis `main`
```bash
   git checkout -b feat/nom-de-la-feature
```
2. Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) pour vos messages
   - `feat:` nouvelle fonctionnalité
   - `fix:` correction de bug
   - `docs:` documentation
   - `refactor:` refactor sans changement de comportement
   - `test:` ajout/modification de tests
   - `chore:` maintenance
3. Vérifiez que la compilation passe sans erreur
```bash
   # Frontend
   npm run build:prod
   
   # Backend
   cd backend/auth-service && ./mvnw verify
   cd backend/business-service && ./mvnw verify
```
4. Ouvrez une Pull Request en décrivant clairement :
   - Le problème résolu ou la fonctionnalité ajoutée
   - Les changements techniques notables
   - Les éventuels impacts sur la base de données (migrations Liquibase)

## Style de code

- **Frontend** : suivre les conventions Angular standard (linting par défaut)
- **Backend** : conventions Java standard, indentation 4 espaces, pas d'imports inutilisés
- Pas de code commenté laissé en place
- Variables et messages utilisateur en français, code et commits en anglais

## Questions

Pour toute question, ouvrez une issue avec le label `question`.
