# Business Control System (BCS)

Internal business management system for **Genan Boutique** and **Flamingo Park**.

## Status

- **Overall:** IN PROGRESS
- **Current Phase:** Phase 1 — Architecture
- **Last Completed Task:** P1.3 Routing

## Stack

- React 19
- Vite
- TypeScript
- Supabase (planned)
- UI system (planned)

## Master Checklist

### Phase 0 — Foundation
- [x] P0.1 Repository baseline
- [x] P0.2 Git/branch strategy
- [x] P0.3 `.gitignore`
- [x] P0.4 `.env.example`
- [x] P0.5 Initial project configuration

### Phase 1 — Architecture
- [x] P1.1 Framework + TypeScript
- [x] P1.2 Project structure
- [x] P1.3 Routing
- [ ] P1.4 UI system
- [ ] P1.5 Environment/config architecture

### Phase 2 — Supabase
- [ ] P2.1 Supabase project
- [ ] P2.2 Database schema
- [ ] P2.3 Migrations
- [ ] P2.4 RLS
- [ ] P2.5 Indexes/constraints

### Phase 3 — Auth & Permissions
- [ ] P3.1 Authentication
- [ ] P3.2 User profiles
- [ ] P3.3 Roles
- [ ] P3.4 Permissions
- [ ] P3.5 Business isolation

### Phase 4 — Core BCS
- [ ] P4.1 Businesses
- [ ] P4.2 Users
- [ ] P4.3 Digital Assets
- [ ] P4.4 Accounts
- [ ] P4.5 Social Platforms
- [ ] P4.6 Devices
- [ ] P4.7 Bitwarden references

### Phase 5 — UI
- [ ] P5.1 Dashboard
- [ ] P5.2 Business management
- [ ] P5.3 Assets
- [ ] P5.4 Accounts
- [ ] P5.5 Devices
- [ ] P5.6 Users
- [ ] P5.7 Activity/Audit
- [ ] P5.8 Search + Filters
- [ ] P5.9 Responsive states

### Phase 6 — Security
- [ ] P6.1 No secrets stored in BCS
- [ ] P6.2 RLS verification
- [ ] P6.3 Authorization verification
- [ ] P6.4 Secret/Git scan
- [ ] P6.5 Bitwarden workflow verification

### Phase 7 — Audit & Operations
- [ ] P7.1 Activity logging
- [ ] P7.2 Audit trail
- [ ] P7.3 Error handling
- [ ] P7.4 Operational status management

### Phase 8 — Testing
- [ ] P8.1 TypeScript
- [ ] P8.2 Lint
- [ ] P8.3 Build
- [ ] P8.4 Functional tests
- [ ] P8.5 Security/RLS tests
- [ ] P8.6 UI verification

### Phase 9 — Production
- [ ] P9.1 Production environment
- [ ] P9.2 Database deployment
- [ ] P9.3 Application deployment
- [ ] P9.4 HTTPS
- [ ] P9.5 Backup/rollback
- [ ] P9.6 Production smoke test

### Phase 10 — Final Acceptance
- [ ] P10.1 Genan Boutique workflow
- [ ] P10.2 Flamingo Park workflow
- [ ] P10.3 Security approval
- [ ] P10.4 Documentation complete
- [ ] P10.5 Final production verification

## Security Rules

BCS must **never** store passwords, API keys, access/refresh tokens, private keys, recovery codes, client secrets, database credentials, or other high-risk secrets.

BCS may store operational metadata and a secure Bitwarden item reference. Secrets remain in Bitwarden.

## Progress Log

| Task | Status |
|---|---|
| P0.1 Repository baseline | Complete |
| P0.2 Git/branch strategy | Complete |
| P0.3 .gitignore | Complete |
| P0.4 .env.example | Complete |
| P0.5 Initial project configuration | Complete |
| P1.1 Framework + TypeScript | Complete |
| P1.2 React project structure | Complete |
| P1.3 Routing | Complete |
