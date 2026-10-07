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

## Phase 2 — Company iPhone management

Phase 2 is being scoped on branch `phase-2-device-management`. It will integrate an Apple-compatible mobile device management (MDM) provider for device policy and supported telemetry, then display verified updates in BCS. BCS cannot independently monitor unmanaged iPhones, and standard MDM does not guarantee the currently foregrounded app or the active account inside Instagram.

- [x] Document Apple capability limits, target architecture, privacy controls, and safe enrollment prerequisites.
- [ ] Select and verify an MDM provider and its API capabilities. Orchard MDM is a candidate for evaluation only, not yet approved.
- [ ] Implement app inventory comparison against an approved-app list and an administrator review workflow (new → under review → discussed → closed).
- [ ] Audit existing iPhones and approve a data-preserving enrollment plan before changing devices.
- [ ] Implement server-side provider integration, tenant-scoped authorization, and verified telemetry ingestion.
- [ ] Implement automatic dashboard updates and stale-data indicators.
- [ ] Configure and test adult-content filtering and app policies on a test device.
- [ ] Verify RLS, audit logging, tests, and production build.

Detailed plan: [`docs/PHASE_2_DEVICE_MANAGEMENT.md`](docs/PHASE_2_DEVICE_MANAGEMENT.md).

No MDM provider is connected and no actual device monitoring or blocking policy is active yet. Do not erase, reset, sign out of Apple Accounts, or enroll production devices until the migration impact has been reviewed.

## Current status

Phase 1 remains the existing two-module scope. Phase 2 planning is documented on branch `phase-2-device-management`; no Phase 1 features were intentionally changed.