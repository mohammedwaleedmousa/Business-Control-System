# Business Control System (BCS)

Internal business management system for **Genan Boutique** and **Flamingo Park**.

## Status

- **Overall:** IN PROGRESS
- **Current Phase:** Phase 3 — Auth & Permissions
- **Last Completed Task:** P4.2 Users

## Stack

- React 19
- Vite
- TypeScript
- Supabase
- Lightweight custom UI foundation

## Supabase

- Project: `business-control-system`
- Project ref: `rqdvnpzbqwtvhuonowor`
- Region: `eu-central-1`
- Database foundation: complete
- RLS: enabled on all BCS tables
- Security advisor: no security lints after function execution hardening

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
- [x] P1.4 UI system
- [x] P1.5 Environment/config architecture

### Phase 2 — Supabase
- [x] P2.1 Supabase project
- [x] P2.2 Database schema
- [x] P2.3 Migrations
- [x] P2.4 RLS
- [x] P2.5 Indexes/constraints

### Phase 3 — Auth & Permissions
- [x] P3.1 Authentication
- [x] P3.2 User profiles
- [x] P3.3 Roles
- [x] P3.4 Permissions
- [x] P3.5 Business isolation

### Phase 4 — Core BCS
- [x] P4.1 Businesses
- [x] P4.2 Users
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

## Database Foundation

Core tables created:

- `businesses`
- `profiles`
- `business_members`
- `bitwarden_refs`
- `social_platforms`
- `accounts`
- `digital_assets`
- `devices`
- `activity_logs`

Initial business records: Genan Boutique and Flamingo Park.

Initial social platforms: Instagram, Facebook, TikTok, WhatsApp, X, YouTube.

## Progress Log

| Task | Status |
|---|---|
| P0.1 Repository baseline | Complete |
| P0.2 Git/branch strategy | Complete |
| P0.3 `.gitignore` | Complete |
| P0.4 `.env.example` | Complete |
| P0.5 Initial project configuration | Complete |
| P1.1 Framework + TypeScript | Complete |
| P1.2 React project structure | Complete |
| P1.3 Routing | Complete |
| P1.4 UI system | Complete |
| P1.5 Environment/config architecture | Complete |
| P2.1 Supabase project | Complete |
| P2.2 Database schema | Complete |
| P2.3 Migrations | Complete |
| P2.4 RLS | Complete |
| P2.5 Indexes/constraints | Complete |
| P3.1 Authentication | Complete |
| P3.2 User profiles | Complete |
| P3.3 Roles | Complete |
| P3.4 Permissions | Complete |
| P3.5 Business isolation | Complete |
| P4.1 Businesses | Complete |
| P4.2 Users | Complete |

## Users

P4.2 connects the authenticated user registry to the application. The current user's profile is loaded after authentication, and administrators receive a protected profile-count summary. User records remain metadata-only and are governed by the existing RLS and role policies.

## Businesses

P4.1 connects the application to the BCS business registry. Genan Boutique and Flamingo Park are seeded in the database, protected by RLS, and loaded by the authenticated React application as business metadata (`id`, `name`, `slug`, `code`, `status`). No secrets are stored in the business records.

## Business Isolation

P3.5 enforces business-scoped access through RLS using business membership checks. Business-linked accounts, assets, devices, and Bitwarden references are restricted to members of the relevant business, while administrators retain cross-business access. Security Advisor reports no security lints after isolation policies were applied.

## Permissions

P3.4 applies role-based authorization policies at the database layer. Administrators can manage BCS master data and profiles; authenticated users retain read access according to the existing RLS rules. Bitwarden references remain metadata-only and never contain secrets. Security Advisor reports no security lints after the permission policies were applied.

## Roles

P3.3 defines the BCS role model (`admin`, `manager`, `operator`, `viewer`) and adds protected database helpers for active-user role checks and administrator authorization. Role-management updates are restricted to administrators. Security Advisor was rechecked after hardening and reports no security lints.

## User Profiles

P3.2 provisions a BCS profile automatically when a new Supabase Auth user is created. The profile stores only the user's BCS identity metadata (`full_name`, `role`, and `status`). The React application loads the authenticated user's profile from `public.profiles` and does not store passwords or authentication secrets in the profile table.

## Authentication

P3.1 implements Supabase email/password authentication in the React client using the publishable/anon key only. The application restores the current session on startup, listens for auth state changes, protects the application behind sign-in, and provides sign-out. No passwords or auth tokens are stored by BCS application tables.
