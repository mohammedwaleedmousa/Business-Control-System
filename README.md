# Business Control System (BCS)

Internal business control system for Genan Boutique and Flamingo Park.

## Phase 1 scope

Phase 1 intentionally contains only these two user-facing modules:

1. Company iPhones
2. Social Media Accounts

Supporting database entities such as profiles, businesses, and the existing social-platform lookup remain only where required by these modules. No ERP, inventory, projects, tasks, locations, departments, vendors, documents, incidents, approvals, subscriptions, digital-assets, contacts, dashboard, or platform-management screens are part of Phase 1.

## Stack

- React 19
- Vite
- TypeScript
- Supabase
- Supabase Vault for protected credential values

## Company iPhones

Each iPhone record supports:
- Phone name
- Responsible employee
- Call phone number
- WhatsApp number
- iCloud / Apple ID
- iCloud password
- Phone passcode
- Authentication / 2FA information
- Serial Number
- Custody status: Not assigned, In employee custody, Returned
- Handover date
- Return date
- Handover / return notes

## Social Media Accounts

Each account supports:
- Platform name
- Account name
- Username
- Email
- Password
- Authentication / 2FA information
- Responsible employee
- Account status
- Notes

The existing social_platforms table is used as a lookup source. There is no separate platform-management page in Phase 1.

## Sensitive-data security model

BCS stores required credentials inside the platform, but sensitive values are not stored as plaintext application columns.

- Passwords, iCloud passwords, phone passcodes, and authentication / 2FA values are serialized into protected secret records managed by Supabase Vault.
- Normal devices and accounts queries never select or return protected secret values.
- Credential mappings are stored in device_credentials and account_credentials; those tables have RLS enabled and deny direct access to anon and authenticated.
- Credential reads and writes go through the authenticated bcs-credentials Edge Function.
- Only active BCS administrators can write protected credentials.
- Credential reveal is restricted to administrators or the responsible employee for that record.
- The UI masks protected values by default and requires an explicit reveal/copy action.
- Sensitive values are not written to application logs.
- The frontend uses only the Supabase publishable/anon key. Supabase secret/service-role keys are never shipped to the browser.
- Protected credential operations run server-side in the Supabase Edge Function.
- No Bitwarden reference is required or used for Phase 1 credentials.
- No credentials are committed to Git or placed in frontend environment variables.

## Authorization

RLS remains enabled on the BCS tables. Ordinary Phase 1 records remain business-scoped through the existing BCS membership and administrator authorization model. Protected credentials have an additional authorization layer in the server-side credential function.

## Verification

Phase 1 completion requires:
- TypeScript check
- Production build
- Supabase schema verification
- RLS/security-policy verification
- Credential reveal authorization verification
- Final diff review for unrelated changes

## Phase 2 — Company iPhone app inventory and review

Phase 2 is being developed on branch `phase-2-device-management`. It adds a **third independent top-level page**, `إدارة تطبيقات الآيفون`, alongside Company iPhones and Social Media Accounts. The page uses shared `device_id` and `business_id` relations to show each app inventory/review with its existing phone, responsible employee, and company; device and employee details are not re-entered or duplicated. It will integrate an Apple-compatible mobile device management (MDM) provider only after provider and security verification. BCS cannot independently monitor unmanaged iPhones, and standard MDM does not guarantee the currently foregrounded app or the active account inside Instagram.

- [x] Document Apple capability limits, target architecture, privacy controls, and safe enrollment prerequisites.
- [ ] Select and verify an MDM provider and its API capabilities. Orchard MDM is a candidate for evaluation only, not yet approved.
- [x] Add a separate top-level app inventory/review page, approved-app list, and administrator review workflow UI (new → under review → discussed → closed); database migration is created but not applied.
- [x] Link inventory and review rows to existing company, phone, and responsible-employee records through shared IDs; no duplicated device records.
- [ ] Audit existing iPhones and approve a data-preserving enrollment plan before changing devices.
- [ ] Implement server-side provider integration, tenant-scoped authorization, and verified telemetry ingestion.
- [ ] Implement automatic dashboard updates and stale-data indicators.
- [ ] Configure and test adult-content filtering and app policies on a test device.
- [ ] Verify RLS, audit logging, tests, and production build.

Detailed plan: [`docs/PHASE_2_DEVICE_MANAGEMENT.md`](docs/PHASE_2_DEVICE_MANAGEMENT.md).

No MDM provider is connected and no actual device monitoring or blocking policy is active yet. Do not erase, reset, sign out of Apple Accounts, or enroll production devices until the migration impact has been reviewed.

## Current status

Phase 1 remains the existing two-module scope. Phase 2 adds a third independent page on branch `phase-2-device-management`; the live MDM integration and migration application remain pending. No Phase 1 features were intentionally changed.

### MDM provider review — 2026-10-07

- Orchard MDM remains **evaluation-only**, not approved for production. The preliminary review found an MIT license, a very new repository, no published releases or visible community activity at review time, and a CI run that visibly passed on 2026-10-05 (build/test success is not an independent security audit).
- A limited read of authentication code shows bcrypt password hashing, role checks, and CSRF checks, but this is **not** a full security audit.
- Next: pin a commit, run the project tests/build and security checks, review webhook/API-key and secret/certificate handling, then use synthetic data and simulated devices only.
- Do not connect Orchard to BCS, enter real Apple certificates/API secrets, or enroll company iPhones until the checks pass and a separate approval is recorded.

Assessment details: [Phase 2 device-management plan](docs/PHASE_2_DEVICE_MANAGEMENT.md#نتيجة-التدقيق-الأولي-لـ-orchard-mdm--2026-10-07).
