# Project Board Configuration Review Brief

**Audience:** Lead Consultant Orchestrator  
**Purpose:** Provide an actionable packet to review and approve the initial Jira/Linear project board configuration after Claude Code completes tooling setup.

---

## 1. Review Objectives
- Confirm that the board reflects the agreed delivery workflow (intake → ready → in progress → review → done).
- Validate column policies, WIP limits, and automation rules support disciplined flow and predictability.
- Ensure definitions of ready/done are embedded in workflow transitions and templates.
- Verify reporting views exist for throughput, lead time, and blocker visibility.
- Approve ownership assignments for backlog curation, sprint cadence, and board maintenance.

---

## 2. Proposed Board Structure
| Column | Purpose | Entry Criteria | Exit Criteria | WIP Limit | Owner |
| --- | --- | --- | --- | --- | --- |
| **Intake** | Capture new ideas, requests, bugs | Item logged with minimum metadata (title, origin, priority guess) | Triaged with DoR checklist ready to move | n/a | Product Ops |
| **Ready** | Prioritized, fully specified work waiting for capacity | DoR satisfied (user story, ACs, dependencies cleared, estimate, designs linked) | Developer starts work and pulls item | 8 | Product + Eng |
| **In Progress** | Active development | Item assigned, plan posted in description, branch linked | All dev tasks done, unit tests passing, PR opened | 5 | Engineering |
| **Code Review / QA** | Work under review & validation | PR open, description updated, automated checks passing | Reviewer approval, QA sign-off, DoD checklist completed | 4 | Engineering |
| **Ready to Deploy** | Awaiting deployment or release train | Approved, release notes drafted, feature toggles documented | Deploy executed and smoke test complete | 6 | Release Manager |
| **Done** | Shipped and validated | Deployment verified in production, monitoring clean for 24h | n/a | Delivery |

---

## 3. Definitions Embedded in Workflow
- **Definition of Ready checklist** (custom field / checklist):
  - User story format completed
  - Acceptance criteria documented
  - Dependencies cleared or tracked
  - Designs and assets attached
  - Estimate (< 5 story points or split)
  - QA notes/test plan drafted
- **Definition of Done checklist** (mandatory before Done transition):
  - Automated tests passing (unit + E2E where applicable)
  - Code review approvals recorded
  - Documentation updated (README/implementation guides)
  - Monitoring/alerting configured or verified
  - Release notes written and shared
  - Post-deploy validation recorded

---

## 4. Automation & Integrations (Post Claude Code Setup)
- Auto-assign issues entering **In Progress** to the developer who moves them.
- Trigger GitHub Action status check visibility in the board’s issue view.
- Post Slack notifications for:
  - Items moved to **Ready** (signals upcoming work)
  - Items blocked (custom “Blocked” flag toggled)
  - Deployment status as cards enter **Ready to Deploy**.
- Automatically add DoR checklist when new issue created.
- Auto-transition PR merge to move card from **Code Review / QA** to **Ready to Deploy** when checks are green.

---

## 5. Review Checklist for Lead Consultant Orchestrator
1. Columns reflect desired workflow order and naming.
2. Entry/exit criteria match documented processes.
3. WIP limits align with team capacity (adjust targets if > team size).
4. Checklists render correctly and are required fields.
5. Automation rules trigger as expected (ask Claude Code for demo).
6. Board filters and swimlanes support:
   - Sprint view (current iteration)
   - Service class / priority view (urgent vs. standard)
   - Owner workload view.
7. Reporting dashboards exist for:
   - Cycle time per column
   - Throughput per sprint
   - Blocked time / aging WIP.
8. Ownership assignments are correct and documented on board (e.g., board description).

---

## 6. Approval & Follow-up
- **Decision Meeting:** 30-minute walkthrough with Product Ops, Engineering Lead, and Claude Code once tooling is live.
- **Sign-off:** Lead Consultant Orchestrator approves via meeting notes or board comment, tagging responsible leads.
- **Post-Approval Actions:**
  - Publish onboarding guide for board usage.
  - Schedule first backlog refinement using new DoR checklist.
  - Add board maintenance review to monthly ops checklist.

---

## 7. Supporting Artefacts
- `WORKFLOW_OPTIMIZATION_AUDIT.md` – baseline findings informing this configuration.
- Future attachments to request from Claude Code:
  - Screenshot or short loom of board post-setup.
  - Automation rule exports/config files.
  - Checklist templates (JSON/YAML) for reuse across projects.

---

### Next Steps
1. Share this brief with Claude Code so tooling aligns to review expectations.
2. Confirm calendar slot for configuration demo/review.
3. Gather feedback during review and update board policies before broader rollout.
