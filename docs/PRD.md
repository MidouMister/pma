# PMA — Product Requirements Document

**Version:** 2.0.0
**Status:** Final
**Last Updated:** March 2026
**Author:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Business Rules & Constraints](#9-business-rules--constraints)
10. [Data Models Summary](#10-data-models-summary)
11. [Page & Route Inventory](#11-page--route-inventory)
12. [Navigation Structure](#12-navigation-structure)
13. [Out of Scope](#13-out-of-scope)
14. [Glossary](#14-glossary)

---

## 1. Executive Summary

**PMA** (Project Management App) is a multi-tenant, enterprise-grade web application for industries requiring granular tracking of projects, financial phases, and production rates — primarily construction, engineering, and public works sectors in Algeria.

The platform is structured around a **Company → Units → Projects** hierarchy. A single Company Owner bootstraps the account and manages multiple operational Units. Each Unit operates semi-independently with its own Admin, members, clients, projects, and Kanban board. Regular members interact exclusively with projects they are assigned to.

PMA is the single source of truth for a company's project financials (HT/TTC), Gantt-based planning, production output monitoring, and day-to-day task execution — replacing fragmented spreadsheet workflows with a cohesive, role-enforced platform.

---

## 2. Problem Statement

| Pain Point                   | Description                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Fragmented planning tools    | Gantt charts in Excel, tasks in another app, financials elsewhere — no single project health view |
| No production accountability | Planned vs. actual production tracked manually (if at all) — underperformance detected too late   |
| Weak access control          | Spreadsheet sharing exposes sensitive financial data to all roles indiscriminately                |
| Multi-unit chaos             | No structured way to manage multiple regional branches under one organizational roof              |
| Subscription scalability     | Small teams need a lightweight entry point; enterprises need no hard limits                       |

---

## 3. Goals & Success Metrics

### Product Goals

| #   | Goal                          | Description                                                                         |
| --- | ----------------------------- | ----------------------------------------------------------------------------------- |
| G1  | Unified project view          | Every project's financial, planning, and production data accessible from one screen |
| G2  | Role-enforced data access     | Users see only what their role permits — no over-exposure of sensitive data         |
| G3  | Production variance detection | Automated alerts when actual production falls below planned thresholds              |
| G4  | Structured multi-tenancy      | Companies manage multiple independent units under one account                       |
| G5  | Scalable monetization         | Tiered plans that grow with the customer without requiring code changes             |

### Key Metrics (KPIs — 6 months post-launch)

| Metric                                      | Target                     |
| ------------------------------------------- | -------------------------- |
| User activation rate (onboarding completed) | > 75% of signups           |
| Weekly Active Users (WAU)                   | > 60% of registered users  |
| Average projects per active unit            | ≥ 3                        |
| Trial-to-paid conversion within 2 months    | > 25%                      |
| Support tickets related to permissions      | < 5% of active users/month |

---

## 4. User Personas

### Persona 1 — The Company Owner (OWNER)

> _"I need a 10,000-foot view of every project in every unit at any time."_

- **Who:** Founder or CEO of a construction/engineering firm
- **Goals:** Track overall financial performance, manage subscriptions, ensure units are staffed
- **Pain points:** Calls unit managers for updates; no real-time financial visibility across projects
- **Key features:** Dashboard KPIs, company settings, billing, cross-unit overview, all notifications

---

### Persona 2 — The Unit Administrator (ADMIN)

> _"I run my unit. I need to create projects, assign work, and monitor delivery."_

- **Who:** Branch manager, project director, or site supervisor
- **Goals:** Create and track projects end-to-end, manage their team, record production progress
- **Pain points:** Gantt in Excel; no automatic variance alerts; no structured task assignment
- **Key features:** Project creation, Gantt planning, phase management, production recording, Kanban, client CRM, invitations

---

### Persona 3 — The Regular Member (USER)

> _"Tell me what I need to do today and let me log my work."_

- **Who:** Engineer, technician, field worker, or analyst
- **Goals:** See assigned tasks, update progress, log working hours
- **Pain points:** Instructions via WhatsApp; no structured place to report progress
- **Key features:** Kanban (assigned tasks only), time tracking, notifications, assigned project view

---

## 5. System Architecture Overview

```
Company (1 Owner · 1 Subscription · 1 Plan)
  └── Unit (0-1 Admin · N Members)
        ├── Projects
        │     ├── Phases → SubPhases → GanttMarkers
        │     ├── Team (TeamMembers)
        │     ├── Product → Productions
        │     └── TimeEntries
        ├── Clients
        ├── Lanes → Tasks (Tags)
        └── Invitations
```

### Hierarchy Rules

- One Company is owned by exactly **one User** (the OWNER — bootstrapped at onboarding)
- A Company contains **one or more Units** (limited by Plan)
- Each Unit has **at most one Admin** and **many Members**
- A Unit is created **without an Admin** — `adminId` is nullable at creation. The Admin is assigned only when the OWNER invites a member with `Role.ADMIN` and that member accepts the invitation via `acceptInvitation()`
- The OWNER is **company-wide** and is **not bound to any Unit** — `User.unitId` is `null` for the OWNER
- Projects belong to a Unit; Members access only projects where they are a **TeamMember**
- All entities are isolated by `companyId` at the data layer

---

## 6. Functional Requirements

### 6.1 Authentication & Onboarding

**Provider:** Clerk

| ID      | Requirement                                                                                                                                                                | Priority  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| AUTH-01 | Users register and log in via Clerk (email/password or OAuth)                                                                                                              | Must Have |
| AUTH-02 | On first login with no associated Company, redirect to `/onboarding`                                                                                                       | Must Have |
| AUTH-03 | Onboarding wizard collects: Company name, email, address, phone, logo, NIF, legal form, state, sector                                                                      | Must Have |
| AUTH-04 | Completing onboarding creates: Company record, assigns OWNER role, auto-creates a 2-month Starter trial subscription, and creates first Unit — no operator action required | Must Have |
| AUTH-05 | Users arriving via invitation link skip onboarding and are assigned to their Unit directly                                                                                 | Must Have |
| AUTH-06 | All dashboard routes are protected; unauthenticated users redirect to sign-in                                                                                              | Must Have |
| AUTH-07 | Clerk webhook `user.created` syncs the new user to the PMA database                                                                                                        | Must Have |

#### Onboarding Steps

1. **Step 1 — Company Profile:** Name, logo upload, legal form, NIF, sector, state, address, phone, email
2. **Step 2 — First Unit:** Unit name, address, phone, email
3. **Step 3 — Invite Team (optional):** Email + role picker — skippable

---

### 6.2 Company Management

| ID      | Requirement                                                                     | Priority    |
| ------- | ------------------------------------------------------------------------------- | ----------- |
| COMP-01 | OWNER can edit all Company fields (name, logo, address, legal info)             | Must Have   |
| COMP-02 | Company logo uploaded via Uploadthing, stored as URL                            | Must Have   |
| COMP-03 | OWNER is the only user with `Role.OWNER`; cannot be granted via invitation      | Must Have   |
| COMP-04 | `Company.ownerId` is unique and immutable after creation                        | Must Have   |
| COMP-05 | OWNER can view aggregated data across all units (projects, members, financials) | Must Have   |
| COMP-06 | OWNER can delete the Company — cascades deletion of all data                    | Should Have |

---

### 6.3 Subscription & Plans

#### Algerian Payment Reality

All commercial transactions use offline methods: physical cheques, bank wire transfers (virement bancaire), and formal service contracts. There is **no payment gateway**. The PMA platform administrator activates, renews, or suspends subscriptions manually after confirming payment receipt.

#### Plan Tiers

| Feature             | Starter (Trial) | Pro           | Premium          |
| ------------------- | --------------- | ------------- | ---------------- |
| Duration            | 2 months free   | Annual (paid) | Annual (paid)    |
| Price (DA HT)       | 0 DA            | Paid          | Paid             |
| Max Units           | 1               | 5             | Unlimited (null) |
| Max Projects        | 5               | 30            | Unlimited (null) |
| Max Tasks / Project | 20              | 200           | Unlimited (null) |
| Max Members         | 10              | 50            | Unlimited (null) |
| Support             | None            | Email         | Dedicated        |

> A `null` value in any limit field means unlimited.

#### Starter Trial Lifecycle

```
Day 0   → Trial starts automatically at onboarding (startAt = now, endAt = now + 2 months)
Day 30  → GENERAL notification: trial expires in 30 days
Day 53  → GENERAL notification: trial expires in 7 days
Day 57  → GENERAL notification: trial ends in 3 days
Day 60  → Trial ends: persistent upgrade banner shown, 7-day grace period begins
Day 67  → Account enters READ-ONLY mode: all create/update/delete blocked, data preserved
```

After expiry, no downgrade back to Starter is permitted.

#### Subscription Requirements

| ID     | Requirement                                                                                  | Priority  |
| ------ | -------------------------------------------------------------------------------------------- | --------- |
| SUB-01 | Starter trial automatically activates at onboarding with no operator action                  | Must Have |
| SUB-02 | After trial ends, a 7-day grace period allows continued access with upgrade banner           | Must Have |
| SUB-03 | After grace period, account enters read-only mode — all mutations blocked                    | Must Have |
| SUB-04 | OWNER can submit an upgrade request (plan selection, preferred payment method, contact info) | Must Have |
| SUB-05 | PMA operator manually activates paid subscriptions via an operator panel                     | Must Have |
| SUB-06 | On activation, `Subscription.status` changes to `ACTIVE`, `startAt` and `endAt` are set      | Must Have |
| SUB-07 | All plan limits are enforced at the server action level before any INSERT                    | Must Have |
| SUB-08 | Billing page shows: current plan, limits usage, trial countdown, upgrade CTA                 | Must Have |

---

### 6.4 Unit Management

| ID      | Requirement                                                                                                                                                                                                                                                            | Priority    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| UNIT-01 | OWNER can create Units (limited by `Plan.maxUnits`)                                                                                                                                                                                                                    | Must Have   |
| UNIT-02 | Unit fields: name, address, phone, email                                                                                                                                                                                                                               | Must Have   |
| UNIT-03 | A Unit has at most one ADMIN. The Admin is assigned when the OWNER invites a member with `Role.ADMIN` and they accept the invitation, or when the OWNER promotes an existing member. A Unit may exist temporarily without an Admin (e.g. immediately after onboarding) | Must Have   |
| UNIT-04 | OWNER can reassign the ADMIN role of a Unit to another member                                                                                                                                                                                                          | Must Have   |
| UNIT-05 | OWNER sees all units on the company dashboard                                                                                                                                                                                                                          | Must Have   |
| UNIT-06 | Deleting a Unit requires confirmation and cascades to projects, tasks, and clients                                                                                                                                                                                     | Should Have |

---

### 6.5 Team & Invitations

| ID     | Requirement                                                                               | Priority    |
| ------ | ----------------------------------------------------------------------------------------- | ----------- |
| INV-01 | ADMIN or OWNER can invite users to a Unit by email with a role (ADMIN or USER)            | Must Have   |
| INV-02 | Invitation creates a pending record with a unique token sent via email                    | Must Have   |
| INV-03 | Invited user clicks link → authenticates via Clerk → assigned to Unit with specified role | Must Have   |
| INV-04 | Duplicate invitations to the same email within the same unit are rejected                 | Must Have   |
| INV-05 | Invitations expire after 7 days                                                           | Should Have |
| INV-06 | ADMIN or OWNER can revoke a pending invitation                                            | Must Have   |
| INV-07 | ADMIN or OWNER can remove a member from a Unit — data is retained, access is revoked      | Must Have   |
| INV-08 | A Unit cannot have more members than `Plan.maxMembers`                                    | Must Have   |
| INV-09 | Company-level team page shows all members across all units (OWNER only)                   | Must Have   |

---

### 6.6 Client CRM

| ID     | Requirement                                                                               | Priority    |
| ------ | ----------------------------------------------------------------------------------------- | ----------- |
| CLT-01 | Clients are **Unit-scoped** — each Unit manages its own client list independently         | Must Have   |
| CLT-02 | ADMIN or OWNER can create, edit, and delete Clients                                       | Must Have   |
| CLT-03 | Client fields: name (unique within unit), wilaya, phone, email (unique within unit)       | Must Have   |
| CLT-04 | Client profile page shows: contact details, all linked projects, total TTC contract value | Must Have   |
| CLT-05 | USERs can view client info (read-only) for clients linked to their assigned projects only | Must Have   |
| CLT-06 | Client list supports search by name and sort by name / total contract value               | Must Have   |
| CLT-07 | A Client cannot be deleted if they have active (InProgress) projects                      | Should Have |

---

### 6.7 Project Management

| ID      | Requirement                                                                                                                             | Priority    |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| PROJ-01 | ADMIN or OWNER can create a Project within their Unit                                                                                   | Must Have   |
| PROJ-02 | Project fields: name, code (unique within unit), type, montantHT, montantTTC, ODS date, delaiMonths, delaiDays, status, signe, clientId | Must Have   |
| PROJ-03 | Project status lifecycle: `New → InProgress → Pause → Complete`                                                                         | Must Have   |
| PROJ-04 | `signe` flag indicates whether the contract is signed                                                                                   | Must Have   |
| PROJ-05 | Project overview shows: financials (HT, TTC, TVA), progress (weighted average of phase progress by montantHT), team, client, dates      | Must Have   |
| PROJ-06 | Project detail page has tabs: Overview, Gantt, Production, Tasks, Time Tracking, Documents                                              | Must Have   |
| PROJ-07 | A Project automatically creates an empty Team on creation                                                                               | Must Have   |
| PROJ-08 | OWNER sees all projects across all units; ADMIN sees only their unit; USER sees only assigned projects                                  | Must Have   |
| PROJ-09 | Project list supports filter by status, unit (OWNER only), client, and sort by date / montantTTC                                        | Must Have   |
| PROJ-10 | Documents tab supports file uploads via Uploadthing (PDFs, images, drawings)                                                            | Should Have |
| PROJ-11 | ADMIN can archive / soft-delete a project                                                                                               | Should Have |
| PROJ-12 | Project creation checks `Plan.maxProjects` before INSERT                                                                                | Must Have   |

#### Financial Formulas

| Formula          | Expression                                                                    |
| ---------------- | ----------------------------------------------------------------------------- |
| TVA Amount       | `montantTTC - montantHT`                                                      |
| TVA %            | `((montantTTC - montantHT) / montantHT) × 100`                                |
| Project Progress | `Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)` (weighted average) |

All monetary amounts display in Algerian format: `1 234 567,89 DA`

---

### 6.8 Phase & Gantt Planning

#### Phase Requirements

| ID    | Requirement                                                                                                                                                                                                                                                                                                                                              | Priority    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| PH-01 | ADMIN or OWNER can create Phases for a Project                                                                                                                                                                                                                                                                                                           | Must Have   |
| PH-02 | Phase fields: name, code, montantHT, startDate, endDate, status, observations, progress (0–100), duration (auto-calculated in days)                                                                                                                                                                                                                      | Must Have   |
| PH-03 | `Phase.startDate` must be ≥ `Project.ods`                                                                                                                                                                                                                                                                                                                | Must Have   |
| PH-04 | `Phase.duration` is auto-calculated as `(endDate - startDate)` in days on save                                                                                                                                                                                                                                                                           | Must Have   |
| PH-05 | Sum of all `Phase.montantHT` within a project must not exceed `Project.montantHT`. This is checked on every `createPhase()` and `updatePhase()`. If the sum would exceed the project total: **block the save and return an error** — do not merely warn. The error message must show the remaining available budget: `(Project.montantHT - currentSum)`. | Must Have   |
| PH-06 | Each Phase can have multiple SubPhases                                                                                                                                                                                                                                                                                                                   | Must Have   |
| PH-07 | SubPhase fields: name, code, status (TODO / COMPLETED), progress (0–100), startDate, endDate                                                                                                                                                                                                                                                             | Must Have   |
| PH-08 | SubPhase dates must fall within the parent Phase's date range                                                                                                                                                                                                                                                                                            | Must Have   |
| PH-09 | `Phase.progress` auto-calculates as the average of its SubPhase progress values when SubPhases exist                                                                                                                                                                                                                                                     | Should Have |
| PH-10 | ADMIN can add GanttMarkers to a Project: label, date, optional style class                                                                                                                                                                                                                                                                               | Must Have   |
| PH-11 | Overlapping phases within the same project trigger a visual warning on the Gantt chart                                                                                                                                                                                                                                                                   | Should Have |

#### Gantt Chart UI

| ID     | Requirement                                                                        | Priority    |
| ------ | ---------------------------------------------------------------------------------- | ----------- |
| GNT-01 | Phases displayed as horizontal bars on a timeline, color-coded by status           | Must Have   |
| GNT-02 | SubPhases display as nested, indented bars beneath their parent Phase              | Must Have   |
| GNT-03 | GanttMarkers render as vertical dashed lines with a diamond icon and label         | Must Have   |
| GNT-04 | Each bar shows a progress fill overlay representing Phase.progress %               | Must Have   |
| GNT-05 | Timeline header supports Month / Week / Day zoom levels                            | Must Have   |
| GNT-06 | ADMIN/OWNER can drag phase bars to reschedule (updates startDate/endDate/duration) | Should Have |
| GNT-07 | Clicking a phase bar opens a Phase detail sheet                                    | Must Have   |

---

### 6.9 Production Monitoring

The production module tracks planned vs. actual output per Phase, ensuring financial and physical progress stay in sync.

- **Product** — the planned baseline for a Phase: planned `taux` (%), planned `montantProd`, reference `date`
- **Production** — individual actual entries recorded against a Product: actual `taux`, actual `mntProd`, `date`

| ID      | Requirement                                                                                                               | Priority  |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| PROD-01 | Each Phase can have at most one Product (planned baseline)                                                                | Must Have |
| PROD-02 | ADMIN creates the Product first, defining the planned taux and montantProd                                                | Must Have |
| PROD-03 | ADMIN records individual Production entries (actual results) against the Product                                          | Must Have |
| PROD-04 | `Production.mntProd = Phase.montantHT × (Production.taux / 100)` — auto-calculated on save                                | Must Have |
| PROD-05 | Production tab shows two charts: (1) Planned vs Actual production rate (line), (2) Planned vs Actual amount (grouped bar) | Must Have |
| PROD-06 | Data table shows: date, planned taux, actual taux, variance, variance % — rows colored red if actual < planned            | Must Have |
| PROD-07 | If `actual taux < Company.productionAlertThreshold% of planned taux`, create a `PRODUCTION` notification targeting OWNER  | Must Have |
| PROD-08 | When a Phase is marked Complete and production milestone reached, create a `PRODUCTION` notification                      | Must Have |
| PROD-09 | `Company.productionAlertThreshold` defaults to 80% and is configurable by OWNER                                           | Must Have |

---

### 6.10 Task & Kanban Board

#### Lane Requirements

| ID      | Requirement                                                                                           | Priority  |
| ------- | ----------------------------------------------------------------------------------------------------- | --------- |
| LANE-01 | Lanes are **Unit-scoped** (shared across all projects within a unit)                                  | Must Have |
| LANE-02 | ADMIN or OWNER can create, rename, reorder, change color of, and delete Lanes                         | Must Have |
| LANE-03 | Lanes have an `order` integer field; displayed in ascending order                                     | Must Have |
| LANE-04 | Deleting a Lane with tasks prompts confirmation; tasks are unassigned from the lane (`laneId = null`) | Must Have |

#### Task Requirements

| ID      | Requirement                                                                                                                                                                                  | Priority  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| TASK-01 | ADMIN or OWNER can create Tasks within a Lane, scoped to a Unit                                                                                                                              | Must Have |
| TASK-02 | Task fields: title, description, startDate, dueDate, endDate, complete, assignedUserId, laneId, order, tags[], **phaseId (required), subPhaseId (optional), projectId (derived from phase)** | Must Have |
| TASK-03 | Task creation checks `Plan.maxTasksPerProject` before INSERT                                                                                                                                 | Must Have |
| TASK-04 | Assigning a task to a user sends them a `TASK` notification                                                                                                                                  | Must Have |
| TASK-05 | Tasks displayed as cards on the Kanban board, ordered by `Task.order` within each lane                                                                                                       | Must Have |
| TASK-06 | ADMIN/OWNER can drag tasks between lanes (updates `laneId` and `order`)                                                                                                                      | Must Have |
| TASK-07 | USER can drag only their own assigned tasks between lanes                                                                                                                                    | Must Have |
| TASK-08 | A task is **overdue** if `dueDate < NOW` and `complete = false` — display a red overdue badge                                                                                                | Must Have |
| TASK-09 | Clicking a task card opens a Task Detail Side Sheet (480px slide-over panel)                                                                                                                 | Must Have |
| TASK-10 | Task Detail Sheet shows: title, description, status, lane, assignee picker, due date picker, tags, time entries, activity log, **and Project → Phase → SubPhase context section**            | Must Have |
| TASK-11 | Any unit member can mark a task complete if assigned to them; ADMIN/OWNER can mark any task complete                                                                                         | Must Have |
| TASK-12 | Tags are Unit-scoped, have a name and a color, and can be applied to multiple tasks                                                                                                          | Must Have |
| TASK-13 | `assignedUserId` must be a TeamMember of the task's linked Project — enforced in Server Action                                                                                               | Must Have |
| TASK-14 | `subPhaseId` must be a child of `phaseId` — enforced in Server Action                                                                                                                        | Must Have |
| TASK-15 | `projectId` on Task is always set to `Phase.projectId` on save — never set independently by the client                                                                                       | Must Have |
| TASK-16 | Task completion does NOT affect `SubPhase.progress` — SubPhase progress is updated manually                                                                                                  | Must Have |
| TASK-17 | Kanban filter bar supports 3 sequential dropdowns: Project → Phase → SubPhase (each filters the next)                                                                                        | Must Have |
| TASK-18 | Phase and SubPhase context is NOT shown on the task card — only visible in the Task Detail Sheet                                                                                             | Must Have |
| TASK-19 | Any TeamMember of the task's project, plus ADMIN and OWNER of the unit, can post comments on a task                                                                                          | Must Have |
| TASK-20 | Comment fields: body (text), author, timestamp, edited flag                                                                                                                                  | Must Have |
| TASK-21 | Comment author can edit or delete their own comment                                                                                                                                          | Must Have |
| TASK-22 | ADMIN and OWNER can delete any comment within their unit                                                                                                                                     | Must Have |
| TASK-23 | Edited comments show an "edited" label next to the timestamp                                                                                                                                 | Must Have |
| TASK-24 | Comments are displayed in the Task Detail Sheet under a "Comments" tab, ordered by `createdAt` ascending                                                                                     | Must Have |
| TASK-25 | Comments are never cached — always fetched fresh                                                                                                                                             | Must Have |
| TASK-26 | A comment body can contain `@username` mentions — typed inline, autocomplete dropdown appears after `@`                                                                                      | Must Have |
| TASK-27 | The autocomplete dropdown shows only users eligible to be mentioned: TeamMembers of the task's project + ADMIN + OWNER of the unit                                                           | Must Have |
| TASK-28 | On comment save, the server parses all `@username` patterns, resolves them to `userId`, creates a `TaskMention` record per match, and sends a `TASK` notification to each mentioned user     | Must Have |
| TASK-29 | Mentioned usernames are rendered as highlighted chips in the displayed comment (not raw `@username` text)                                                                                    | Must Have |
| TASK-30 | A user cannot @mention themselves — filtered out of the autocomplete                                                                                                                         | Must Have |
| TASK-31 | If the same user is @mentioned multiple times in one comment, only one `TaskMention` record and one notification is created (enforced by `@@unique([commentId, mentionedUserId])`)           | Must Have |

---

### 6.11 Time Tracking

| ID      | Requirement                                                                                             | Priority  |
| ------- | ------------------------------------------------------------------------------------------------------- | --------- |
| TIME-01 | Any user (OWNER, ADMIN, USER) can log time entries                                                      | Must Have |
| TIME-02 | A TimeEntry can be linked to a Task, a Project, or both                                                 | Must Have |
| TIME-03 | Fields: description, startTime, endTime, duration (minutes, auto-calculated)                            | Must Have |
| TIME-04 | Users can start a live timer on a task; stopping it auto-fills endTime and calculates duration          | Must Have |
| TIME-05 | Manual entry form allows direct input of startTime, endTime, and description                            | Must Have |
| TIME-06 | Users can only edit or delete their own time entries (unless OWNER/ADMIN)                               | Must Have |
| TIME-07 | **USERs can only log time on projects they are assigned to**                                            | Must Have |
| TIME-08 | Project Time Tracking tab shows: entries grouped by user, total duration per user per week, grand total | Must Have |
| TIME-09 | Task detail sheet shows all time entries for that task with user, duration, and description             | Must Have |

---

### 6.12 Notifications

#### Notification Types by Role

| Type         | OWNER | ADMIN | USER          | Trigger                                    |
| ------------ | ----- | ----- | ------------- | ------------------------------------------ |
| `INVITATION` | ✓     | ✓     | ✓             | Invite accepted or rejected                |
| `PROJECT`    | ✓     | ✓     | Assigned only | Project status change                      |
| `TASK`       | ✓     | ✓     | ✓ (assigned)  | Task assigned to user                      |
| `TEAM`       | ✓     | ✓     | ✓             | Added to / removed from project team       |
| `PHASE`      | ✓     | ✓     | —             | Phase status change                        |
| `CLIENT`     | ✓     | ✓     | —             | Client added or updated                    |
| `PRODUCTION` | ✓     | ✓     | —             | Milestone reached / underperformance alert |
| `LANE`       | ✓     | ✓     | —             | Lane created or deleted                    |
| `TAG`        | ✓     | ✓     | —             | Tag created or deleted                     |
| `GENERAL`    | ✓     | ✓     | ✓             | System-wide announcements, trial warnings  |

#### Requirements

| ID       | Requirement                                                                                                                                           | Priority  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| NOTIF-01 | Notifications stored in DB with: userId, companyId, unitId, type, read, targetRole, targetUserId                                                      | Must Have |
| NOTIF-02 | Bell icon in header shows unread count badge                                                                                                          | Must Have |
| NOTIF-03 | Bell dropdown shows latest 5 unread notifications with type icon, message, timestamp                                                                  | Must Have |
| NOTIF-04 | Full notifications page with filter tabs: All / Unread / by Type                                                                                      | Must Have |
| NOTIF-05 | "Mark all as read" action on notifications page                                                                                                       | Must Have |
| NOTIF-06 | Role-targeted notifications (`targetRole: OWNER`) are delivered to the single OWNER user                                                              | Must Have |
| NOTIF-07 | USER receives `PROJECT` notifications only for projects they are a TeamMember of                                                                      | Must Have |
| NOTIF-08 | Notification count (bell icon badge) is refreshed via **polling every 30 seconds** — no Supabase Realtime required                                    | Must Have |
| NOTIF-09 | Polling is implemented using a Client Component with `setInterval` + Server Action call — not a `useEffect` fetch to an API route                     | Must Have |
| NOTIF-10 | Only the unread **count** is polled — the full notification list is fetched on demand when the user opens the bell dropdown                           | Must Have |
| NOTIF-11 | A `@mention` in a task comment sends a `TASK` notification to the mentioned user with message format: `"[Author] vous a mentionné dans [Task title]"` | Must Have |
| NOTIF-12 | A user can only be @mentioned if they are a TeamMember of the task's project, or an ADMIN/OWNER of the unit — no mentions of unrelated users          | Must Have |

---

### 6.13 Activity Logs

| ID     | Requirement                                                                                             | Priority    |
| ------ | ------------------------------------------------------------------------------------------------------- | ----------- |
| ACT-01 | Key actions generate an ActivityLog: create/edit/delete for Projects, Phases, Tasks, Clients, Members   | Must Have   |
| ACT-02 | ActivityLog fields: companyId, unitId, userId, action, entityType, entityId, metadata (JSON), createdAt | Must Have   |
| ACT-03 | OWNER can view all activity logs company-wide                                                           | Must Have   |
| ACT-04 | ADMIN can view activity logs for their unit only                                                        | Must Have   |
| ACT-05 | USER can view activity logs scoped to their assigned projects only                                      | Must Have   |
| ACT-06 | Activity log supports filter by: date range, entityType, user                                           | Should Have |

---

## 7. Non-Functional Requirements

### Performance

| ID     | Requirement                                                              |
| ------ | ------------------------------------------------------------------------ |
| NFR-01 | Initial page load (LCP) < 2.5s on standard broadband                     |
| NFR-02 | Server Actions (mutations) respond in < 500ms under normal load          |
| NFR-03 | Gantt chart renders up to 50 phases without visible lag                  |
| NFR-04 | Kanban board renders up to 200 tasks across 10 lanes without degradation |

### Security

| ID     | Requirement                                                                                  |
| ------ | -------------------------------------------------------------------------------------------- |
| SEC-01 | All database queries scoped by `companyId` to enforce tenant isolation                       |
| SEC-02 | Role checks enforced at Server Action level, not just UI                                     |
| SEC-03 | File uploads validated for type and size before Uploadthing submission                       |
| SEC-04 | No sensitive data (financial totals, full client records) accessible to USER unless assigned |

### Reliability

| ID     | Requirement                                                                |
| ------ | -------------------------------------------------------------------------- |
| REL-01 | Data is never permanently deleted on user removal — access is revoked only |
| REL-02 | All subscription state changes are logged in ActivityLog                   |

---

## 8. Role-Based Access Control

### Role Definitions

| Role    | Scope          | Description                                                                                |
| ------- | -------------- | ------------------------------------------------------------------------------------------ |
| `OWNER` | Company-wide   | Created at onboarding. One per Company. Full visibility across all units. Manages billing. |
| `ADMIN` | Unit-scoped    | Manages a single Unit. Full operational control within their unit.                         |
| `USER`  | Project-scoped | Access only to projects where they are a TeamMember.                                       |

### Permission Matrix

| Action                           | OWNER            | ADMIN                  | USER                        |
| -------------------------------- | ---------------- | ---------------------- | --------------------------- |
| View all units                   | ✅               | ❌ (own only)          | ❌                          |
| Manage Company settings          | ✅               | ❌                     | ❌                          |
| Manage billing / subscription    | ✅               | ❌                     | ❌                          |
| Create / delete Units            | ✅               | ❌                     | ❌                          |
| Invite / remove members          | ✅               | ✅ (own unit)          | ❌                          |
| Create / edit Projects           | ✅               | ✅ (own unit)          | ❌                          |
| View Projects                    | ✅ (all)         | ✅ (own unit)          | ✅ (assigned only)          |
| Manage Phases & Gantt            | ✅               | ✅ (own unit)          | ❌                          |
| Record Production                | ✅               | ✅ (own unit)          | ❌                          |
| Manage Clients                   | ✅               | ✅ (own unit)          | ❌ (view assigned only)     |
| Create / manage Lanes            | ✅               | ✅ (own unit)          | ❌                          |
| Create Tasks                     | ✅               | ✅ (own unit)          | ❌                          |
| Drag any task                    | ✅               | ✅                     | ❌ (own tasks only)         |
| Mark task complete               | ✅               | ✅ (any task)          | ✅ (own tasks only)         |
| Log time entries                 | ✅ (any project) | ✅ (own unit projects) | ✅ (assigned projects only) |
| Edit/delete others' time entries | ✅               | ✅ (own unit)          | ❌                          |
| View activity logs               | ✅ (all)         | ✅ (own unit)          | ✅ (assigned projects)      |

---

## 9. Business Rules & Constraints

### Tenant Isolation

- **BR-01:** Every database query involving user data must be scoped by `companyId`. No exceptions.
- **BR-02:** A User belongs to exactly one Company. Cross-company access is impossible.

### Onboarding

- **BR-03:** The first User to complete onboarding for a Company is permanently assigned `Role.OWNER`.
- **BR-04:** Only one OWNER exists per Company. OWNER role cannot be granted via invitation.
- **BR-04a:** The OWNER is company-wide and is **not assigned to any Unit** — `User.unitId` is `null` for the OWNER at all times.
- **BR-04b:** During onboarding, the first Unit is created with `adminId = null`. The Unit Admin is assigned later via the invitation flow (`acceptInvitation()` with `role: ADMIN`), which sets `Unit.adminId = user.id`.

### Subscription & Limits

- **BR-05:** Plan limits (`maxUnits`, `maxProjects`, `maxTasksPerProject`, `maxMembers`) are checked server-side before every INSERT. Exceeding a limit returns a user-facing error, not a DB error.
- **BR-06:** A `null` limit means unlimited — the check is skipped.
- **BR-07:** Trial expiry and grace period transitions are computed from `Subscription.endAt` on every page load. No background job required for display, but mutations must check status.
- **BR-08:** After grace period (day 67+), all create/update/delete Server Actions return an error and redirect to the billing page.
- **BR-09:** Once upgraded to Pro or Premium, downgrade to Starter is not permitted.

### Financial Rules

- **BR-10:** `Phase.montantHT` sum across all phases of a project must not exceed `Project.montantHT`. **Block the save and return an error** showing the remaining available budget — do not merely warn. (See PH-05 for full enforcement details.)
- **BR-11:** `Phase.startDate` must be ≥ `Project.ods` date. Block save if violated.
- **BR-12:** SubPhase dates must be within parent Phase date range. Block save if violated.
- **BR-13:** `Production.mntProd` is always system-calculated as `Phase.montantHT × (taux / 100)`. Never user-editable directly.

### Production Alerts

- **BR-14:** If `Production.taux < (Product.taux × Company.productionAlertThreshold / 100)`, create a `PRODUCTION` notification to OWNER immediately on save.
- **BR-15:** `Company.productionAlertThreshold` defaults to `80`. Range: 1–100. Configurable by OWNER only.

### User Removal

- **BR-16:** When a User is removed from a Unit, their tasks and time entries are **retained**. Only their unit membership is deleted. Their `assignedUserId` on tasks remains but they lose access.

### Project Progress

- **BR-17:** `Project.progress = Σ(Phase.progress × Phase.montantHT) / Σ(Phase.montantHT)`. Recalculated whenever any Phase.progress changes.

### Délai Field

- **BR-18:** Project deadline is stored as two integer fields: `delaiMonths` (number of months) and `delaiDays` (additional days). Both default to 0. Display as: `X mois Y jours`.

### Clients

- **BR-19:** Clients are Unit-scoped. A client in Unit A is invisible to Unit B, even within the same Company.
- **BR-20:** A Client with at least one Project in `InProgress` status cannot be deleted.

### Kanban

- **BR-21:** Lanes are Unit-scoped — shared across all projects within the unit. A task's Kanban column does not change when it moves between projects.

---

## 10. Data Models Summary

### Core Entities

| Model          | Key Fields                                                                                             | Relationships                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `Plan`         | id, name, maxUnits, maxProjects, maxTasksPerProject, maxMembers, priceDA                               | hasMany Subscriptions                                         |
| `Company`      | id, name, ownerId, logo, NIF, formJur, sector, wilaya, address, phone, email, productionAlertThreshold | hasOne Subscription, hasMany Units/Users                      |
| `Subscription` | id, companyId, planId, status (TRIAL/ACTIVE/GRACE/READONLY/SUSPENDED), startAt, endAt                  | belongsTo Company, Plan                                       |
| `User`         | id, clerkId, name, email, role (OWNER/ADMIN/USER), companyId, unitId                                   | belongsTo Company, Unit                                       |
| `Unit`         | id, companyId, **adminId?** (nullable), name, address, phone, email, logo                              | belongsTo Company, hasMany Projects/Clients/Lanes/Invitations |
| `Invitation`   | id, companyId, unitId, email, role, token, status (PENDING/ACCEPTED/REJECTED/EXPIRED), expiresAt       | belongsTo Company, Unit                                       |

### Operational Entities

| Model         | Key Fields                                                                                                           | Relationships                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Client`      | id, unitId, companyId, name, wilaya, phone, email                                                                    | belongsTo Unit, hasMany Projects                                  |
| `Project`     | id, unitId, companyId, clientId, name, code, type, montantHT, montantTTC, ods, delaiMonths, delaiDays, status, signe | belongsTo Unit/Client, hasMany Phases/TeamMembers/TimeEntries     |
| `Team`        | id, projectId                                                                                                        | belongsTo Project, hasMany TeamMembers                            |
| `TeamMember`  | id, teamId, userId, role label                                                                                       | belongsTo Team, User                                              |
| `Phase`       | id, projectId, name, code, montantHT, startDate, endDate, duration, status, progress, observations                   | belongsTo Project, hasMany SubPhases/GanttMarkers, hasOne Product |
| `SubPhase`    | id, phaseId, name, code, status, progress, startDate, endDate                                                        | belongsTo Phase                                                   |
| `GanttMarker` | id, projectId, label, date, className                                                                                | belongsTo Project                                                 |
| `Product`     | id, phaseId, taux, montantProd, date                                                                                 | belongsTo Phase, hasMany Productions                              |
| `Production`  | id, productId, phaseId, taux, mntProd, date                                                                          | belongsTo Product                                                 |

### Execution & Tracking

| Model          | Key Fields                                                                                                                                                     | Relationships                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Lane`         | id, unitId, companyId, name, color, order                                                                                                                      | belongsTo Unit, hasMany Tasks                                                |
| `Task`         | id, unitId, companyId, **projectId, phaseId, subPhaseId (optional)**, laneId, assignedUserId, title, description, startDate, dueDate, endDate, complete, order | belongsTo Unit/Lane/User/Project/Phase/SubPhase, hasManyThrough Tags         |
| `Tag`          | id, unitId, name, color                                                                                                                                        | belongsTo Unit                                                               |
| `TaskComment`  | id, taskId, authorId, companyId, body, edited, createdAt                                                                                                       | belongsTo Task/User/Company, hasMany TaskMentions                            |
| `TaskMention`  | id, commentId, mentionedUserId, companyId                                                                                                                      | belongsTo TaskComment/User/Company — unique per [commentId, mentionedUserId] |
| `TimeEntry`    | id, companyId, userId, projectId, taskId (nullable), description, startTime, endTime, duration                                                                 | belongsTo User/Project/Task                                                  |
| `Notification` | id, companyId, unitId, userId, type, message, read, targetRole, targetUserId                                                                                   | belongsTo Company/Unit/User                                                  |
| `ActivityLog`  | id, companyId, unitId, userId, action, entityType, entityId, metadata (JSON), createdAt                                                                        | belongsTo Company/Unit/User                                                  |

---

## 11. Page & Route Inventory

### Public Routes

| Route                             | Page          |
| --------------------------------- | ------------- |
| `/`                               | Landing page  |
| `/company/sign-in/[[...sign-in]]` | Clerk Sign In |
| `/company/sign-up/[[...sign-up]]` | Clerk Sign Up |

### Onboarding

| Route         | Page                         |
| ------------- | ---------------------------- |
| `/onboarding` | Multi-step onboarding wizard |

### Company Routes (OWNER only)

| Route                                   | Page                       |
| --------------------------------------- | -------------------------- |
| `/company/[companyId]`                  | Company Dashboard          |
| `/company/[companyId]/settings`         | Company Settings           |
| `/company/[companyId]/settings/billing` | Billing & Plans            |
| `/company/[companyId]/units`            | Units Management           |
| `/company/[companyId]/team`             | Company Team & Invitations |

### Unit Routes (ADMIN + OWNER)

| Route                                  | Page                    |
| -------------------------------------- | ----------------------- |
| `/unite/[unitId]`                      | Unit Dashboard          |
| `/unite/[unitId]/members`              | Unit Members Management |
| `/unite/[unitId]/clients`              | Client List             |
| `/unite/[unitId]/clients/[clientId]`   | Client Profile          |
| `/unite/[unitId]/projects`             | Project List            |
| `/unite/[unitId]/projects/[projectId]` | Project Detail (tabbed) |
| `/unite/[unitId]/kanban`               | Kanban Board            |
| `/unite/[unitId]/settings`             | Unit Settings           |

### User Workspace Routes (all roles)

| Route                      | Page                              |
| -------------------------- | --------------------------------- |
| `/dashboard`               | Personal dashboard / redirect hub |
| `/dashboard/notifications` | Notifications page                |

---

## 12. Navigation Structure

### Sidebar by Role

| Section           | OWNER | ADMIN | USER               |
| ----------------- | ----- | ----- | ------------------ |
| Company Dashboard | ✅    | ❌    | ❌                 |
| Units             | ✅    | ❌    | ❌                 |
| Company Team      | ✅    | ❌    | ❌                 |
| Billing           | ✅    | ❌    | ❌                 |
| Unit Dashboard    | ✅    | ✅    | ✅                 |
| Projects          | ✅    | ✅    | ✅ (assigned only) |
| Kanban            | ✅    | ✅    | ✅                 |
| Clients           | ✅    | ✅    | ❌                 |
| Unit Members      | ✅    | ✅    | ❌                 |
| Notifications     | ✅    | ✅    | ✅                 |
| Unit Settings     | ✅    | ✅    | ❌                 |

---

## 13. Out of Scope (v1.0)

| Feature                                        | Reason Deferred                                    |
| ---------------------------------------------- | -------------------------------------------------- |
| Mobile native app (iOS / Android)              | Desktop-first; mobile web sufficient for v1        |
| Real-time collaborative editing (live cursors) | Complexity; polling / Supabase Realtime sufficient |
| Gantt task dependency arrows (FS, SS, FF, SF)  | Schema enum defined for future use                 |
| Advanced reporting & PDF export                | Phase 2                                            |
| Two-factor authentication (2FA)                | Delegated to Clerk settings                        |
| Custom domain / white-labeling                 | Enterprise tier, post-launch                       |
| Offline mode / PWA                             | Out of scope for v1                                |
| External calendar sync                         | Phase 2                                            |
| Public project share links                     | Phase 2                                            |

---

## 14. Glossary

| Term                             | Definition                                                                |
| -------------------------------- | ------------------------------------------------------------------------- |
| **HT (Hors Taxe)**               | Pre-tax amount (excluding VAT)                                            |
| **TTC (Toutes Taxes Comprises)** | Total amount including all taxes                                          |
| **TVA**                          | Taxe sur la Valeur Ajoutée — VAT in Algeria                               |
| **ODS**                          | Ordre de Service — official project start order date                      |
| **Délai**                        | Contractual deadline, stored as `delaiMonths` + `delaiDays` integers      |
| **Taux**                         | Production rate, expressed as a percentage (0–100)                        |
| **montantProd**                  | Produced monetary amount = `Phase.montantHT × (taux / 100)`               |
| **Phase**                        | Major deliverable block within a project with its own budget and timeline |
| **SubPhase**                     | Granular sub-task within a Phase                                          |
| **GanttMarker**                  | Vertical milestone line on the Gantt chart with a label and date          |
| **Product**                      | Planned production baseline for a Phase (one per phase)                   |
| **Production**                   | Individual actual production record logged against a Product              |
| **Lane**                         | Kanban board column (e.g. "To Do", "In Progress") — Unit-scoped           |
| **TeamMember**                   | Junction record linking a User to a Project's Team                        |
| **Multi-Tenant**                 | One app instance serves multiple isolated companies                       |
| **RBAC**                         | Role-Based Access Control — permissions tied to a user's Role             |
| **Onboarding**                   | First-run wizard that creates the Company, first Unit, and sets the OWNER |
| **Virement Bancaire**            | Bank wire transfer — primary offline payment method                       |

---

_End of Document — PMA PRD v2.0.0_
