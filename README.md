# Business Control System (BCS)

Internal business management system for **Genan Boutique** and **Flamingo Park**.

## Status

- **Overall:** IN PROGRESS
- **Current Phase:** Phase 5 — UI
- **Last Completed Task:** P5.5 Devices

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
- [x] P4.3 Digital Assets
- [x] P4.4 Accounts
- [x] P4.5 Social Platforms
- [x] P4.6 Devices
- [x] P4.7 Bitwarden references

### Phase 5 — UI
- [x] P5.1 Dashboard
- [x] P5.2 Business management
- [x] P5.3 Assets
- [x] P5.4 Accounts
- [x] P5.5 Devices
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
| P4.3 Digital Assets | Complete |
| P4.4 Accounts | Complete |
| P4.5 Social Platforms | Complete |
| P4.6 Devices | Complete |
| P4.7 Bitwarden references | Complete |
| P5.1 Dashboard | Complete |
| P5.2 Business management | Complete |
| P5.3 Digital Assets | Complete |
| P5.4 Accounts | Complete |
| P5.5 Devices | Complete |

## Build Verification

Cloudflare production build verified successfully after the React/Vite TypeScript configuration and Supabase client typing fixes.

## Digital Assets

P4.3 connects the digital asset registry to the authenticated application. Assets are loaded through RLS with business-scoped access and display only operational metadata such as type, name, identifier, status, and notes. Secret material is never stored in the asset records.

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

## Devices

P4.6 connects the device registry to the authenticated application. Devices are loaded through RLS with business-scoped access and display operational metadata such as type, serial number, asset tag, and status. Credential material is never stored in device records.

## Bitwarden References

P4.7 connects the Bitwarden reference registry to the authenticated application. BCS displays only vault item metadata and references; passwords, API keys, tokens, private keys, recovery codes, and other secret values remain outside BCS in Bitwarden.

## Dashboard

P5.1 replaces the dashboard placeholder with an authenticated operational overview. It shows business, account, digital asset, device, platform, and activity counts, plus the seeded business registry. All data is read through the existing Supabase RLS policies.

## Business Management

P5.2 adds the authenticated Businesses module with registry search, active/inactive filtering, status visibility, and admin-only business creation. Creation is enforced by the existing Supabase authorization policy; non-admin users receive a read-only registry.

## Digital Assets

P5.3 expands the Digital Assets module with business-aware search and filtering, status filtering, and admin-only asset creation. The module stores operational metadata only; secret values remain outside BCS.

## Accounts

P5.4 expands Accounts with business and platform context, search and status/business filters, and admin-only account creation. Authentication secrets remain outside BCS; the account registry contains operational metadata only.


## UI completion — 2026-10-07

- Switched the application workspace to a light white / silver / gray visual system while retaining the dark professional sidebar.
- Standardized primary, secondary, and form controls to a shared height and sizing system.
- Standardized text fields, selects, tables, badges, cards, filters, and responsive states.
- Added the missing Users, Activity, and Settings workspace pages and connected them to routing.
- Kept the secret-storage rule: BCS stores operational metadata and Bitwarden references, never secret values.
- UI Definition of Done remains: tested, secured, documented, and accepted.


### Latest UI verification pass
- Light workspace background and dark sidebar confirmed in the committed stylesheet.
- Shared control sizing is defined centrally for buttons and form controls.
- Digital Assets type filtering is functional.
- Users, Activity, and Settings routes are connected in the application shell.
- Repository has no GitHub Actions workflow configured, so automated build status is not available from GitHub; Cloudflare remains the deployment build verifier.


## UI refinement pass — 2026-10-07

- Dashboard, business registry, account management, devices, digital assets, platforms, Bitwarden references, users, activity, and settings remain connected to the sidebar workspace.
- Account platform filtering is now functional.
- Removed unused application state from the root shell.
- Light workspace + dark sidebar visual direction is retained consistently.


## Visual rule — 2026-10-07

- White is the default background across the application, including the sidebar and topbar.
- Black, charcoal, and gray are reserved for text, borders, controls, hierarchy, and status treatment.
- White text is used only on intentionally black primary buttons or dark status elements.
- Form controls share the same 42px height and consistent visual treatment.
