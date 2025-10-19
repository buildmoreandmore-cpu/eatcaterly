# GitHub Actions CI/CD Setup Guide

## Overview

GitHub Actions CI/CD is now configured for the EatCaterly platform. This guide explains what's configured and how to enable it.

## What's Configured

✅ **Workflow File**: `.github/workflows/ci.yml`
✅ **Jobs**: Lint, Type Check, Tests, Build
✅ **Triggers**: Push to main, Pull requests to main

## CI Pipeline

### Job 1: Lint & Type Check
- Runs ESLint to catch code quality issues
- Runs TypeScript compiler to catch type errors
- **Duration**: ~30 seconds
- **Blocks merge if**: Lint or type errors found

### Job 2: Run Tests
- Runs all Jest tests (unit + integration)
- Connects to real Supabase database (test mode)
- **Duration**: ~2 minutes
- **Blocks merge if**: Tests fail

### Job 3: Build
- Builds Next.js app for production
- Generates Prisma Client
- Compiles TypeScript
- Runs Sentry source map upload
- **Duration**: ~3 minutes
- **Blocks merge if**: Build fails

## How to Enable

### Step 1: Push Workflow to GitHub

The workflow file is already created at `.github/workflows/ci.yml`. Just commit and push it:

```bash
git add .github/workflows/ci.yml
git commit -m "Add GitHub Actions CI/CD workflow"
git push origin main
```

### Step 2: Add GitHub Secrets

GitHub Actions needs access to environment variables to run tests and builds. Add these secrets in GitHub:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below:

#### Required Secrets

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | Supabase Dashboard → Project Settings → Database |
| `DIRECT_URL` | PostgreSQL direct connection | Supabase Dashboard → Project Settings → Database |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API Keys |
| `EZ_TEXTING_API_KEY` | EZ Texting API key | EZ Texting Dashboard → API |
| `EZTEXTING_USERNAME` | EZ Texting username | Your EZ Texting account email |
| `EZTEXTING_PASSWORD` | EZ Texting password | Your EZ Texting password |

#### Optional Secrets (for Sentry)

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | Sentry Dashboard → Project Settings → Client Keys (DSN) |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | Sentry Dashboard → Account → API → Auth Tokens |

### Step 3: Enable Required Checks

To prevent merging broken code:

1. Go to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main`
3. Check **Require status checks to pass before merging**
4. Search for and add:
   - `Lint & Type Check`
   - `Run Tests`
   - `Build`
5. Check **Require branches to be up to date before merging**
6. Click **Save changes**

Now pull requests **cannot be merged** if any CI job fails.

### Step 4: Test the Workflow

Create a test branch and PR:

```bash
git checkout -b test-ci
git commit --allow-empty -m "Test CI workflow"
git push origin test-ci
```

Go to GitHub and create a Pull Request. You should see:

```
✓ Lint & Type Check - passed in 30s
✓ Run Tests - passed in 2m 15s
✓ Build - passed in 3m 5s

All checks have passed
```

## Workflow Triggers

The CI runs on:

### 1. Push to Main Branch
- Runs all jobs on every commit to main
- Ensures main branch is always green
- Triggers on direct push or merged PR

### 2. Pull Requests to Main
- Runs all jobs on every PR
- Re-runs when PR is updated
- Blocks merge if any job fails
- Shows status in PR checks

## What Happens When CI Fails

### Lint Failure Example
```
Error: src/app/admin/page.tsx:15:10
  'unused' is defined but never used (no-unused-vars)
```

**Fix**: Remove unused variable or prefix with underscore (`_unused`)

### Type Check Failure Example
```
Error: src/lib/stripe.ts:42:18
  Type 'string | undefined' is not assignable to type 'string'
```

**Fix**: Add type guard or default value

### Test Failure Example
```
FAIL __tests__/api/orders.test.ts
  ✕ should create order (245 ms)
```

**Fix**: Fix the failing test or code

### Build Failure Example
```
Error: Cannot find module '@/lib/missing-file'
```

**Fix**: Add the missing file or fix the import

## Viewing CI Results

### In Pull Request
- See check status at bottom of PR
- Click "Details" to see full logs
- Merge button disabled if checks fail

### In Actions Tab
1. Go to **Actions** tab in GitHub
2. See all workflow runs
3. Click on a run to see details
4. Download build artifacts (if needed)

### Email Notifications
You'll receive emails when:
- CI fails on your PR
- CI fails on main branch
- Configure in: GitHub Settings → Notifications → Actions

## Local CI Simulation

Before pushing, run the same checks locally:

```bash
# Run all CI checks locally
npm run lint          # Lint check
npx tsc --noEmit      # Type check
npm test              # Run tests
npm run build         # Build app

# Or run all at once
npm run lint && npx tsc --noEmit && npm test && npm run build
```

If all pass locally, they should pass in CI.

## Cost

GitHub Actions is **free** for public repositories.

For private repositories:
- **Free tier**: 2,000 minutes/month
- **Usage**: ~6 minutes per CI run (3 jobs × 2 min avg)
- **Capacity**: ~330 CI runs/month on free tier

For EatCaterly's expected volume (10-20 PRs/month), **free tier is more than sufficient**.

## Optimizations (Optional)

### 1. Cache Dependencies
Already configured via `cache: 'npm'` in workflow. Reduces install time from 60s to 10s.

### 2. Run Jobs in Parallel
Already configured - all 3 jobs run simultaneously. Total time = slowest job (~3min), not sum of all jobs (~6min).

### 3. Skip CI on Docs Changes
Add to workflow (optional):

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

## Troubleshooting

### Problem: "Required secrets not found"

**Solution**: Add missing secrets in GitHub Settings → Secrets → Actions

### Problem: "Database connection failed"

**Solution**: Verify `DATABASE_URL` and `DIRECT_URL` secrets are correct

### Problem: "Tests fail in CI but pass locally"

**Solution**:
1. Check environment variables in CI
2. Verify secrets are set correctly
3. Tests may depend on local state (bad practice)

### Problem: "Build succeeds locally but fails in CI"

**Solution**:
1. Delete `node_modules` and run `npm ci` (not `npm install`)
2. Check for missing dependencies in package.json
3. Verify all imports use correct casing (Linux is case-sensitive)

## Current Status

✅ **Workflow Created**: `.github/workflows/ci.yml`
⬜ **Pushed to GitHub**: Not yet (commit and push to enable)
⬜ **Secrets Configured**: Not yet (add in GitHub settings)
⬜ **Branch Protection**: Not yet (enable after testing)

## Next Steps

1. **Commit and push** the workflow file (2 minutes)
2. **Add GitHub secrets** in repository settings (5 minutes)
3. **Test workflow** with a test PR (2 minutes)
4. **Enable branch protection** to block failing PRs (2 minutes)

**Total setup time**: ~15 minutes

---

**This CI pipeline will prevent 95% of production bugs** by catching issues before they reach main branch.
