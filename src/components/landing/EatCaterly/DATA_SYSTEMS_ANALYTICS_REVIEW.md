# Data Systems & Analytics Review

**Review Date**: January 2025
**Reviewer**: Technical Consultant
**Application**: SMS Food Delivery Platform
**Database**: PostgreSQL via Supabase
**ORM**: Prisma

---

## Executive Summary

**Overall Data Maturity Level**: 3/10 (Early Stage - Manual Operations)

The SMS Food Delivery platform has a **solid foundational data schema** but lacks formal data engineering infrastructure for analytics, ETL pipelines, and business intelligence. The system relies entirely on **ad-hoc queries** and a single admin dashboard for insights. There are **no data quality monitoring tools**, **no formal ETL processes**, and **no dedicated analytics infrastructure**.

### Key Strengths
- Clean, well-structured Prisma schema with proper relationships
- Good use of timestamps (createdAt, updatedAt) for temporal tracking
- Basic dashboard with 7 operational KPIs
- Proper indexing on critical fields (phoneNumber, status, areaCode)

### Critical Gaps
- No ETL/ELT pipelines or data transformation workflows
- No BI tools (no Looker, Tableau, Metabase, etc.)
- No data quality monitoring or validation frameworks
- No observability beyond console.log (137 occurrences)
- No data export capabilities (CSV, Excel, reports)
- No data lineage tracking
- No data freshness monitoring or SLAs
- No analytics database or data warehouse

---

## 1. Data Flow Diagrams & Pipeline Configurations

### What Exists

**None.** There are no formal data flow diagrams, ETL/ELT pipelines, or data transformation workflows.

**Data Movement Patterns Identified:**

1. **Webhook-Driven Updates (Stripe)**
   - Location: `src/app/api/webhooks/stripe/route.ts`
   - Flow: Stripe webhook → rate-limited endpoint → `handleWebhook()` → database update
   - Processing: Real-time, synchronous
   - No retry logic, no dead letter queue
   - Rate limit: 100 req/min

2. **SMS Data Flow**
   - Location: `src/lib/sms.ts`, `src/app/api/webhooks/sms/route.ts`
   - Flow: SMS received → webhook → parse → create order → update customer
   - Logging: SmsLog table captures all messages
   - No message queue, all synchronous processing

3. **Admin Dashboard Aggregations**
   - Location: `src/app/admin/page.tsx:15-72`
   - Processing: On-demand, server-side rendering
   - 7 parallel queries using `Promise.all()`:
     ```typescript
     await Promise.all([
       prisma.customer.count(),
       prisma.customer.count({ where: { isActive: true } }),
       prisma.order.count(),
       prisma.order.count({ where: { status: 'PAID' } }),
       prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
       prisma.order.count({ where: { createdAt: { gte: today } } }),
       prisma.smsLog.count({ where: { createdAt: { gte: today } } })
     ])
     ```
   - No caching, recalculates on every page load
   - Falls back to demo data if database unavailable

4. **Customer Segmentation Flow**
   - Location: `src/app/api/customers/bulk-categorize/route.ts`
   - Manual categorization via admin UI
   - Filters: category, tags, minOrders, minSpent, lastOrderAfter
   - No automated segmentation or ML

### Missing Infrastructure

- No Apache Airflow, Dagster, or Prefect for orchestration
- No dbt (data build tool) for transformations
- No data warehouse (Snowflake, BigQuery, Redshift)
- No reverse ETL tools (Census, Hightouch)
- No event streaming (Kafka, Kinesis, Pub/Sub)
- No CDC (Change Data Capture) from production DB

### Observations

**Reliability**: ⚠️ Moderate risk
- Webhook processing is synchronous - failures could block Stripe events
- No retry mechanism for failed data transformations
- Database connection failures trigger demo data fallback (hides issues)

**Lineage**: ❌ Missing entirely
- No tracking of data transformations
- Cannot trace where customer.totalSpent originates
- No audit log of schema changes

**Documentation**: ❌ None
- No data flow diagrams found
- No Mermaid diagrams or architecture docs
- Implicit flows only (discovered via code analysis)

---

## 2. Schema Definitions & Documentation

### What Exists

**Prisma Schema**: `prisma/schema.prisma` (299 lines)

**9 Data Models:**
1. **Customer** - End consumers ordering food
2. **BusinessCustomer** - B2B clients (restaurants)
3. **PhoneNumberInventory** - Shared phone number pool
4. **PromoCode** - Discount codes
5. **CustomerList** - Segmentation lists
6. **CustomerListMember** - Many-to-many join table
7. **Menu** - Daily menus
8. **MenuItem** - Individual food items
9. **Order** - Customer orders
10. **SmsLog** - SMS audit trail
11. **AdminUser** - Internal staff

**Database Enums:**
- `OrderStatus`: 7 states (PENDING → DELIVERED/CANCELLED)
- `PhoneNumberStatus`: 5 states (AVAILABLE, ASSIGNED, RESERVED, COOLDOWN, RETIRED)
- `SmsDirection`: INBOUND, OUTBOUND
- `SmsStatus`: SENT, DELIVERED, FAILED, RECEIVED
- `DiscountType`: PERCENTAGE, FIXED_AMOUNT

### Schema Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Normalization** | 9/10 | Proper 3NF, join tables for many-to-many |
| **Indexes** | 8/10 | Key fields indexed (status, areaCode, currentBusinessId) |
| **Relationships** | 10/10 | Cascade deletes, proper foreign keys |
| **Constraints** | 9/10 | Unique constraints on phoneNumber, email, areaCode |
| **Data Types** | 8/10 | Good use of JSONB for preferences, items |
| **Temporal Tracking** | 9/10 | createdAt/updatedAt on all tables |
| **Business Logic** | 7/10 | Some logic in DB (totalOrders, totalSpent denormalized) |

### Data Dictionary

**Customer Fields with Business Metrics:**
```prisma
model Customer {
  lastOrderAt DateTime?  // Recency for RFM analysis
  totalOrders Int @default(0)  // Frequency metric
  totalSpent  Int @default(0)  // Monetary value (cents)
  tags        String[]  // Manual segmentation
  category    String?   // "Frequent", "Occasional", "One-time"
}
```

**BusinessCustomer Subscription Tracking:**
- 13 Stripe-related fields for Connect + subscriptions
- Dual customer relationship: Stripe customer + Connect account
- Phone number lifecycle tracking (ezTextingNumberId, numberProvisionedAt)

### Missing Documentation

❌ **No data dictionary** beyond inline comments
❌ **No ERD (Entity-Relationship Diagram)** - must infer from schema
❌ **No field descriptions** for business users
❌ **No data governance policies** (who owns what data)
❌ **No JSONB schema documentation** (what's in `preferences`, `items`?)

### Observations

**Data Completeness**: ⚠️ Medium risk
- Many optional fields: `name`, `email`, `notes`, `deliveryTime`
- No validation on JSONB columns (could contain anything)
- No check constraints on monetary values (totalSpent could be negative)

**Schema Evolution**: ✅ Well-managed
- Single migration file: `20250927003130_init/migration.sql`
- Clean Prisma schema with no drift
- Uses Supabase pooling (DIRECT_URL vs DATABASE_URL)

**Business Alignment**: ✅ Good
- Schema reflects B2B2C marketplace model correctly
- Phone number recycling logic well-modeled (cooldown state)
- Customer segmentation fields support personalization

---

## 3. BI Dashboards, Reports, and KPIs

### What Exists

**Admin Dashboard** (`src/app/admin/page.tsx`)

**7 Real-Time KPIs:**

| Metric | Query | Business Use |
|--------|-------|--------------|
| **Total Customers** | `prisma.customer.count()` | Growth tracking |
| **Active Customers** | `count({ where: { isActive: true } })` | Churn monitoring |
| **Total Orders** | `prisma.order.count()` | Volume tracking |
| **Paid Orders** | `count({ where: { status: 'PAID' } })` | Revenue orders |
| **Total Revenue** | `aggregate({ _sum: { totalAmount } })` | Financial health |
| **Today's Orders** | `count({ where: { createdAt >= today } })` | Daily ops |
| **SMS Count (Today)** | `smsLog.count({ createdAt >= today })` | Cost tracking |

**Business Dashboard** (`src/app/admin/businesses/page.tsx`)

**4 Business Metrics:**
- Total Businesses
- With Phone Number
- Without Phone Number
- Active Subscriptions

**Filtering Capabilities:**
- Search by business name, email, phone
- Filter by phone number status
- Client-side filtering (inefficient for scale)

### Missing Analytics

❌ **No Historical Trends**
- Can't view revenue over time (no charts)
- No week-over-week or month-over-month comparisons
- No cohort analysis

❌ **No Customer Analytics**
- No RFM (Recency, Frequency, Monetary) scoring despite having data
- No churn prediction
- No lifetime value (LTV) calculation
- Customer acquisition cost (CAC) not tracked

❌ **No Operational Metrics**
- Average order value (AOV) not displayed
- Order fulfillment time not tracked
- SMS delivery rate not measured (status: DELIVERED not used)
- Menu item popularity not analyzed

❌ **No Export Capabilities**
- Cannot download customer lists as CSV
- No invoice export for businesses
- No report generation for tax purposes

❌ **No BI Tools**
- No Metabase, Looker, Tableau, Power BI integration
- No embedded analytics (like Cube.js, Apache Superset)
- No data visualization library (no Recharts, Chart.js, D3)

### Observations

**Decision Support**: 3/10
- Basic operational visibility only
- No predictive analytics
- No A/B testing capabilities
- No funnel analysis (signup → order → paid)

**Performance**: ⚠️ Degrades with scale
- Dashboard runs 7 database queries on every page load
- No materialized views or summary tables
- No Redis caching of KPIs
- Demo data fallback hides database issues

**User Experience**: 5/10
- Clean UI, but purely table-based
- No charts or graphs
- No drill-down capabilities
- No custom date ranges

---

## 4. Data Quality Issues & Validation Reports

### Validation Logic Found

**Input Validation** (12 files use Zod/validation):

1. **Promo Code Validation** (`src/app/api/promo-codes/validate/route.ts`)
   - Checks: code exists, is active, not expired, usage limit
   - ✅ Good boundary checks

2. **Customer Bulk Operations** (`src/app/api/customers/bulk-categorize/route.ts`)
   - Validates: customerIds array, action type, tags array
   - ⚠️ No validation of category values (any string accepted)

3. **Phone Number Format**
   - Schema: `phoneNumber String @unique`
   - ❌ No regex validation for E.164 format (+14045551234)
   - Could store invalid phone numbers

4. **Price Validation**
   - Schema: `price Int` (cents)
   - ❌ No check constraint to prevent negative prices
   - ❌ No max price limit

5. **JSONB Validation**
   - Fields: `preferences Json?`, `items Json`
   - ❌ No JSON schema validation
   - Could contain malformed data

### Data Quality Checks

**None automated.** No data quality framework exists.

**Missing Quality Checks:**
- No duplicate customer detection (same person, multiple phones)
- No orphaned record cleanup (deleted businesses with active phone numbers)
- No stale data monitoring (orders stuck in PENDING for > 24 hours)
- No referential integrity monitoring beyond DB constraints
- No completeness checks (% of customers with names)
- No anomaly detection (sudden spike in orders, revenue)

### Data Validation Test Coverage

**Found in tests:**
- `__tests__/api/payment-api-security.test.ts` - 324 lines, but only payment validation
- No dedicated data quality test suite
- No database constraint tests

### Known Data Issues

**From Code Analysis:**

1. **Customer.totalOrders and totalSpent**
   - Location: `prisma/schema.prisma:27-28`
   - Risk: Denormalized fields that could drift from actual order totals
   - ❌ No reconciliation job to verify accuracy
   - ❌ Not updated atomically with order creation

2. **PhoneNumberInventory.cooldownUntil**
   - Location: `prisma/schema.prisma:110`
   - Risk: Could be recycled too early if clock skew
   - ❌ No monitoring of cooldown violations

3. **Order.platformFee**
   - Location: `prisma/schema.prisma:232`
   - Type: `Int?` (nullable)
   - Risk: Inconsistent fee calculation, some orders missing fees
   - ❌ No validation that platformFee matches business logic

4. **SmsLog.status**
   - Location: `prisma/schema.prisma:254`
   - Values: SENT, DELIVERED, FAILED, RECEIVED
   - ❌ No webhook updates from Twilio/EZTexting to set DELIVERED
   - Most messages stuck at SENT status forever

### Observations

**Data Trustworthiness**: 6/10
- Schema constraints prevent most bad data
- But lack of application-level validation allows edge cases
- No data steward or governance team

**Data Hygiene**: 5/10
- No automated cleanup jobs
- No archival strategy for old orders
- 137 console.log statements instead of structured logging
- No PII redaction in logs

**Remediation**: ❌ No validation reports
- No weekly data quality scorecards
- No dashboards showing data completeness
- No alerts for data anomalies

---

## 5. Data Observability & Monitoring

### Current Observability Stack

**Console.log Only** - 137 occurrences across 48 TypeScript files

**Example Logging Patterns:**
```typescript
// Error logging (most common)
console.error('Database connection failed:', error)
console.error('Failed to load businesses:', error)
console.error('Stripe webhook error:', error)

// Info logging (seed data, status)
console.log('🌱 Seeding database...')
console.log(`Phone number ${business.assignedPhoneNumber} recycled`)

// Debug logging (minimal)
// No debug logs found
```

### Missing Observability Tools

❌ **No APM (Application Performance Monitoring)**
- No Sentry, Datadog, New Relic
- No error tracking beyond console.error
- No performance monitoring

❌ **No Structured Logging**
- No Winston, Pino, Bunyan
- No log levels (debug, info, warn, error)
- No request tracing IDs
- No JSON-formatted logs for parsing

❌ **No Database Monitoring**
- No query performance tracking
- No slow query logs
- No connection pool monitoring
- No deadlock detection

❌ **No Business Metrics Tracking**
- No Mixpanel, Amplitude, Segment
- No event tracking (user actions)
- No funnel analytics
- No conversion tracking

❌ **No Data Pipeline Monitoring**
- No Airflow UI (no Airflow)
- No dbt Cloud logs (no dbt)
- No failed job alerts

❌ **No Alerting**
- No PagerDuty, Opsgenie integration
- No Slack alerts for critical errors
- No anomaly detection (sudden drop in orders)

### Rate Limit Monitoring

**Partial observability** via `src/lib/rate-limit.ts`:
- Uses Upstash Redis for rate limiting
- Stores: count, reset timestamp
- ❌ No dashboards showing rate limit hits
- ❌ No alerts when limits reached
- ⚠️ **Fails open** - allows requests if Redis is down (security risk)

### Webhook Monitoring

**Stripe Webhooks** (`src/app/api/webhooks/stripe/route.ts`):
- Rate limited: 100 req/min
- Security headers added
- ❌ No webhook delivery tracking (Stripe retries not monitored)
- ❌ No dead letter queue for failed events

### Database Connection Monitoring

**Fallback to Demo Data** (`src/app/admin/page.tsx:59-71`):
```typescript
} catch (error) {
  console.error('Database connection failed:', error)
  // Return demo data when database is not available
  return { totalCustomers: 25, activeCustomers: 18, ... }
}
```

⚠️ **Silent Failures** - If database is down, users see fake data instead of error message

### Observations

**Incident Response**: 2/10
- Cannot detect outages quickly
- No runbooks or playbooks
- No on-call rotation

**Root Cause Analysis**: 3/10
- Hard to debug issues without structured logs
- No request tracing across services
- No database query logs

**Proactive Monitoring**: 1/10
- No monitoring of data freshness
- No SLAs or SLOs defined
- No uptime monitoring

---

## 6. Data Freshness, Completeness & Reliability

### Temporal Tracking

**Good Foundation:**

All 11 models have temporal fields:
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

**Additional Temporal Fields:**
- `Customer.lastOrderAt` - tracks customer activity
- `Order.createdAt` - order timestamp
- `PhoneNumberInventory.assignedAt`, `releasedAt`, `purchasedAt`, `cooldownUntil`
- `SmsLog.createdAt` - message timestamp

**Usage of Timestamps:**
- Dashboard shows "Today's Orders" using `createdAt >= today`
- Customer segmentation can filter by `lastOrderAt`
- ✅ All queries use indexed timestamp fields

### Data Freshness Monitoring

❌ **No SLAs** for data freshness
- Don't know if data is minutes, hours, or days old
- No staleness alerts

❌ **No Delayed Data Detection**
- Can't detect if webhooks are delayed
- No comparison of `createdAt` vs current time

❌ **No Data Latency Metrics**
- Order creation → payment webhook → database update (no tracking)
- SMS sent → delivery confirmation → database update (no tracking)

### Data Completeness

**Field Completeness Analysis** (from schema):

| Field | Nullable | Completion Risk |
|-------|----------|----------------|
| `Customer.name` | ✅ Optional | High - many customers may lack names |
| `Customer.email` | ✅ Optional | High - phone-only customers |
| `Order.deliveryTime` | ✅ Optional | Medium - not enforced |
| `Order.platformFee` | ✅ Optional | Critical - revenue leakage risk |
| `BusinessCustomer.city`, `state` | ✅ Optional | Low - can infer from ZIP |
| `SmsLog.errorCode` | ✅ Optional | Medium - failure diagnosis issues |

**No Completeness Monitoring:**
- Can't answer "What % of customers have email addresses?"
- No reports on missing required business data
- No data quality dashboards

### Data Reliability

**Denormalization Risks:**

1. **Customer.totalOrders** and **Customer.totalSpent**
   - Updated manually, not via database triggers
   - Risk: Could drift from actual sum of orders
   - ❌ No reconciliation job

2. **Order Counts**
   - Dashboard counts paid orders: `prisma.order.count({ where: { status: 'PAID' } })`
   - Assumption: Orders properly transition to PAID status
   - Risk: Stuck orders in PENDING not counted

**Data Consistency Checks:**

❌ No scheduled jobs to verify:
- Sum of order amounts = customer.totalSpent
- Count of customer orders = customer.totalOrders
- Phone number not assigned to multiple businesses
- No orders referencing deleted customers (should fail due to FK constraint)

### Backup & Recovery

**Supabase Managed Backups:**
- Likely daily backups (standard for Supabase)
- ❌ No documentation of backup schedule
- ❌ No tested restore procedures
- ❌ No point-in-time recovery (PITR) testing

**No Application-Level Backups:**
- No exports of critical data (customer lists, order history)
- No disaster recovery plan
- No multi-region redundancy

### Observations

**Data Trustworthiness**: 7/10
- Schema constraints enforce basic integrity
- But lack of monitoring means silent data drift possible
- No data quality SLAs

**Recovery Time Objective (RTO)**: Unknown
- No documented recovery procedures
- Likely hours to days (Supabase support ticket)

**Recovery Point Objective (RPO)**: Likely 24 hours
- Depends on Supabase backup schedule
- Could lose up to 24 hours of data

---

## 7. Summary of Data Health

### Data Health Scorecard

| Dimension | Score | Status |
|-----------|-------|--------|
| **Schema Design** | 9/10 | ✅ Excellent |
| **Data Pipelines** | 1/10 | ❌ None exist |
| **BI & Analytics** | 3/10 | ❌ Ad-hoc only |
| **Data Quality** | 5/10 | ⚠️ No monitoring |
| **Observability** | 2/10 | ❌ Console.log only |
| **Data Freshness** | 6/10 | ⚠️ No SLAs |
| **Completeness** | 6/10 | ⚠️ Many optional fields |
| **Documentation** | 3/10 | ❌ Schema only |
| **Governance** | 2/10 | ❌ No policies |
| **Security** | 7/10 | ✅ Good (see Security Assessment) |

**Overall Data Maturity**: **3.4/10** (Early Stage)

### What's Working

✅ **Clean Schema** - Well-normalized, indexed, with proper relationships
✅ **Temporal Tracking** - All models have createdAt/updatedAt
✅ **Basic Dashboard** - 7 KPIs for operational visibility
✅ **Webhook Integration** - Real-time data from Stripe
✅ **Database Reliability** - Supabase managed PostgreSQL (99.9% uptime)

### Critical Gaps

❌ **No ETL/ELT Pipelines** - All data transformations happen in application code
❌ **No BI Tools** - Cannot create custom reports or dashboards
❌ **No Data Quality Framework** - No monitoring, validation, or reconciliation
❌ **No Observability** - No APM, structured logging, or monitoring
❌ **No Analytics Database** - All queries hit production DB (performance risk)

### Broken or Missing Components

🔴 **Broken:**
- SmsLog.status always SENT (delivery webhooks not implemented)
- Dashboard falls back to demo data on DB errors (hides issues)
- Rate limiting fails open (security risk)

🟡 **Degraded:**
- Dashboard recalculates KPIs on every page load (no caching)
- No retry logic for failed webhook processing
- Denormalized fields (totalOrders, totalSpent) could drift

⚪ **Missing:**
- 15+ observability and monitoring tools (see Section 5)
- Data warehouse for analytics
- Data export capabilities (CSV, Excel)
- Automated data quality checks
- Historical trend analysis
- Customer segmentation beyond manual tagging

---

## 8. Recommended Next Steps for Analytics Maturity

### Immediate Priorities (Week 1-2) - $0 Investment

**Goal**: Establish baseline visibility and fix broken data flows

1. **Implement Structured Logging** (2 days)
   - Add Pino or Winston for JSON logs
   - Include: timestamp, level, requestId, userId, businessId
   - Tool: `pino` (free, 14ms overhead)

2. **Fix SmsLog Status Updates** (1 day)
   - Implement Twilio/EZTexting delivery webhooks
   - Update SmsLog.status to DELIVERED/FAILED
   - Location: Create `src/app/api/webhooks/sms/delivery/route.ts`

3. **Add Dashboard Caching** (1 day)
   - Cache KPIs in Redis for 5 minutes
   - Fallback to database if cache miss
   - Reduce dashboard load from 7 queries → 1 cache hit

4. **Document Data Flows** (2 days)
   - Create Mermaid diagrams for:
     - Order creation flow
     - Stripe webhook → database update
     - SMS → order parsing → payment
   - Location: `DATA_FLOWS.md`

5. **Create Data Quality Queries** (1 day)
   - SQL to find: orphaned records, missing fees, stale orders
   - Save as `scripts/data-quality-checks.sql`
   - Run manually weekly

**Investment**: $0 (internal dev time only: 40 hours)

---

### Short-Term (Month 1) - $500-1,500

**Goal**: Add basic BI and monitoring

6. **Deploy Metabase** (3 days)
   - Open-source BI tool, self-hosted on Vercel/Railway
   - Cost: $0-20/month hosting
   - Connect to Supabase read replica
   - Create 10 essential dashboards:
     - Revenue trends (daily, weekly, monthly)
     - Customer growth and churn
     - Order volume and AOV
     - SMS costs vs revenue
     - Business onboarding funnel

7. **Implement Sentry** (1 day)
   - Error tracking and monitoring
   - Cost: $0 (free tier: 5,000 errors/month)
   - Already recommended in Security Assessment

8. **Add BetterStack (Logtail)** (1 day)
   - Structured log aggregation
   - Cost: $0-15/month (1GB logs)
   - Search, filter, alert on logs

9. **Create Summary Tables** (2 days)
   - Materialized views or cron jobs:
     - `daily_order_stats` (date, total_orders, revenue, avg_order_value)
     - `customer_rfm_scores` (recency, frequency, monetary)
   - Refresh: Nightly at 2am
   - Location: `prisma/migrations/add_summary_tables.sql`

10. **CSV Export Endpoints** (2 days)
    - Add export routes:
      - `/api/admin/customers/export` → CSV download
      - `/api/admin/orders/export` → CSV with date range
    - Library: `papaparse` or `csv-writer`

**Investment**: $500-1,500 (40 hours dev + $60/year tools)

---

### Medium-Term (Quarter 1) - $5,000-10,000

**Goal**: Establish data warehouse and automated pipelines

11. **Set Up Data Warehouse** (1 week)
    - Options:
      - BigQuery (Google) - $0-100/month for small datasets
      - Snowflake - $40/month Starter
      - Supabase Analytics (beta) - $0-25/month
    - Replicate production data nightly
    - Use for all BI queries (no load on production DB)

12. **Implement dbt (Data Build Tool)** (2 weeks)
    - Transform raw data → analytics tables
    - Models to build:
      - `customers_enriched` (with RFM scores, LTV)
      - `order_metrics` (daily aggregates)
      - `business_health` (MRR, churn, CAC)
    - Cost: dbt Cloud $0 (developer tier) or self-host

13. **Automate Data Quality Checks** (1 week)
    - Tools: Great Expectations, Soda Core (open-source)
    - Checks:
      - Schema validation (column types match)
      - Completeness (% null values)
      - Consistency (totalSpent = sum of orders)
      - Uniqueness (no duplicate phone numbers)
      - Freshness (orders created in last 24 hours)
    - Alert: Slack channel for failures

14. **Customer Segmentation Automation** (1 week)
    - RFM (Recency, Frequency, Monetary) scoring
    - Auto-tag customers: VIP, At-Risk, Lost, New
    - Update `Customer.category` nightly
    - Location: `scripts/calculate-rfm-scores.ts`

15. **Deploy Reverse ETL** (1 week)
    - Tool: Census, Hightouch, or Grouparoo
    - Sync data warehouse → operational tools:
      - Customer segments → Mailchimp
      - Churn risk → CRM
      - LTV scores → Stripe metadata
    - Cost: $0-200/month

**Investment**: $5,000-10,000 (160 hours dev + $500/year tools)

---

### Long-Term (Year 1) - $20,000-50,000

**Goal**: Advanced analytics and AI/ML capabilities

16. **Real-Time Analytics** (3 weeks)
    - Event streaming: Apache Kafka or Google Pub/Sub
    - Stream processing: Flink, Spark Streaming
    - Live dashboards with <1 min latency
    - Use cases: Real-time order tracking, anomaly detection

17. **Predictive Analytics** (4 weeks)
    - Churn prediction model (scikit-learn or TensorFlow)
    - LTV forecasting
    - Demand forecasting for menu items
    - A/B testing framework

18. **Data Catalog** (2 weeks)
    - Tool: Atlan, Alation, or open-source DataHub
    - Document all tables, columns, lineage
    - Data governance policies
    - PII tagging and encryption

19. **Embedded Analytics** (3 weeks)
    - Give businesses their own dashboards
    - Show: order trends, customer growth, revenue
    - Tool: Cube.js or Metabase embedding
    - Multi-tenant isolation

20. **Advanced Observability** (2 weeks)
    - Datadog or New Relic APM
    - Database query profiling
    - Distributed tracing (OpenTelemetry)
    - Business metrics dashboards (not just technical)

**Investment**: $20,000-50,000 (320 hours dev + $5,000/year tools)

---

## 9. Analytics Maturity Roadmap (18 Months)

```
Month 0 (Now): Maturity Level 1 - Ad-Hoc Queries
├─ Basic admin dashboard
├─ Console.log observability
└─ No data pipelines

Month 2: Maturity Level 2 - Repeatable Reporting
├─ Metabase BI tool deployed
├─ Sentry error tracking
├─ CSV exports available
└─ Summary tables for common queries

Month 6: Maturity Level 3 - Managed Analytics
├─ Data warehouse operational
├─ dbt transformations automated
├─ Data quality monitoring (Great Expectations)
├─ Customer segmentation automated
└─ Structured logging with BetterStack

Month 12: Maturity Level 4 - Strategic Analytics
├─ Reverse ETL syncing to business tools
├─ Predictive churn model
├─ LTV forecasting
├─ Real-time dashboards (<1 min latency)
└─ A/B testing framework

Month 18: Maturity Level 5 - AI-Driven Insights
├─ Event streaming (Kafka)
├─ ML-powered demand forecasting
├─ Embedded analytics for businesses
├─ Data catalog and governance
└─ Automated anomaly detection
```

---

## 10. Investment Summary

| Phase | Timeline | Dev Hours | Tool Costs | Total |
|-------|----------|-----------|------------|-------|
| **Immediate** | Weeks 1-2 | 40h | $0 | $0 |
| **Short-Term** | Month 1 | 40h | $60/yr | $500-1,500 |
| **Medium-Term** | Quarter 1 | 160h | $500/yr | $5,000-10,000 |
| **Long-Term** | Year 1 | 320h | $5,000/yr | $20,000-50,000 |
| **Total Year 1** | 12 months | 560h | $5,560/yr | **$25,500-61,500** |

*Assumes blended dev rate of $50/hour (could be in-house or contractor)*

**ROI Drivers:**
- Reduced time to answer business questions (10x faster with BI tools)
- Prevented churn via predictive models (10-20% reduction)
- Faster incident response with monitoring (MTTR: 4 hours → 15 minutes)
- Revenue optimization via A/B testing (5-15% lift)
- Data-driven pricing and menu optimization

**Break-Even Estimate**: 6-9 months (for a B2B SaaS with >$100K ARR)

---

## 11. Conclusion

The SMS Food Delivery platform has a **solid data foundation** (9/10 schema design) but **minimal analytics infrastructure** (3/10 overall maturity). The current system can support operational needs for 50-100 businesses but will **struggle to scale** or provide strategic insights without investment in:

1. **Data pipelines** (ETL/ELT for transformations)
2. **BI tools** (Metabase, Looker for reporting)
3. **Observability** (Sentry, BetterStack for monitoring)
4. **Data quality** (Great Expectations, automated checks)
5. **Data warehouse** (BigQuery, Snowflake for analytics)

**Recommended Action**: Start with **Immediate Priorities** ($0, 1 week) to fix broken data flows and add visibility. Then decide on **Short-Term** investment based on business traction (if >20 paying businesses, proceed with Metabase + monitoring).

The roadmap above provides a clear path from **ad-hoc queries → strategic analytics** over 18 months, with incremental value at each stage.

---

**Document Version**: 1.0
**Next Review**: March 2025 (reassess after Month 1 implementation)
**Owner**: Engineering Team
**Stakeholders**: Product, Business Operations, Finance
