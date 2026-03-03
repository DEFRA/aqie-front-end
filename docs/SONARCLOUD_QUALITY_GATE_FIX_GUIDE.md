# SonarCloud Quality Gate Fix Guide

## Problem Overview

**Symptom**: Main branch Quality Gate failing with coverage below 90% threshold, measuring "New Code" over an unexpectedly long period (e.g., "Since 11 months ago").

**Root Cause**: GitHub workflow files contain hardcoded SonarCloud parameters that override the project's web UI settings, preventing proper baseline configuration.

---

## Solution Walkthrough

### Step 1: Identify the Issue

1. **Check SonarCloud Dashboard**
   - Navigate to your project on SonarCloud
   - Look at the "New Code" period on the main branch
   - Note if it shows an unexpected timeframe (e.g., months instead of days)

2. **Verify Web UI Settings**
   - Go to **Project Settings** → **New Code**
   - Check what baseline is configured (e.g., "Previous version", "30 days")
   - If the dashboard shows a different period, workflow overrides are likely present

### Step 2: Audit Workflow Files

Search all GitHub Actions workflow files (`.github/workflows/*.yml`) for hardcoded SonarCloud parameters:

```bash
grep -r "sonar.newCodePeriod" .github/workflows/
```

**Common culprits**:

- `-Dsonar.newCodePeriod.type=PREVIOUS_VERSION`
- `-Dsonar.newCodePeriod.type=NUMBER_OF_DAYS`
- `-Dsonar.newCodePeriod.value=30`

These parameters **override** your SonarCloud web UI settings and should be removed.

### Step 3: Remove Workflow Overrides

Edit each workflow file containing SonarCloud scans (typically `publish.yml`, `publish-hotfix.yml`, `check-pull-request.yml`):

**BEFORE** (example from `publish.yml`):

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@...
  with:
    args: >
      -Dsonar.projectKey=YOUR_ORG_YOUR_PROJECT
      -Dsonar.organization=your-org
      -Dsonar.newCodePeriod.type=PREVIOUS_VERSION  # ❌ REMOVE THIS LINE
      -Dsonar.sources=src/
      ...
```

**AFTER**:

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@...
  with:
    args: >
      -Dsonar.projectKey=YOUR_ORG_YOUR_PROJECT
      -Dsonar.organization=your-org
      -Dsonar.sources=src/
      ...
```

### Step 4: Add Project Versioning (Recommended)

To enable "Previous version" baseline strategy, add versioning to your project:

#### 4a. Add Version to `sonar-project.properties`

Create or edit `sonar-project.properties` in your project root:

```properties
sonar.projectKey=YOUR_ORG_YOUR_PROJECT
sonar.organization=your-org
sonar.projectVersion=1.1.0
```

#### 4b. Add Version to Workflow Files

Add `-Dsonar.projectVersion=X.Y.Z` to each workflow's SonarCloud scan step:

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@...
  with:
    args: >
      -Dsonar.projectKey=YOUR_ORG_YOUR_PROJECT
      -Dsonar.organization=your-org
      -Dsonar.projectVersion=1.1.0  # ✅ ADD THIS LINE
      -Dsonar.sources=src/
      ...
```

**Files to update**:

- `.github/workflows/publish.yml`
- `.github/workflows/publish-hotfix.yml`
- `.github/workflows/check-pull-request.yml`

#### 4c. Create Git Version Tags

Create version tags to establish baselines:

```bash
# Tag a stable commit from the past as your baseline (e.g., 3-6 months ago)
git tag v1.0.0 <commit-hash-from-past>

# Tag your current main branch as the new version
git tag v1.1.0 HEAD

# Push tags to remote
git push origin v1.0.0 v1.1.0
```

**How to find a good baseline commit**:

```bash
# Show commits from 3 months ago
git log --since="3 months ago" --until="2 months ago" --oneline

# Or list commits with dates
git log --since="2024-09-01" --until="2024-09-30" --oneline
```

### Step 5: Configure SonarCloud Web UI

1. **Navigate to SonarCloud Settings**
   - Go to your project on SonarCloud
   - Click **Administration** → **New Code**

2. **Choose Baseline Strategy**

   **Option A: Previous Version (Recommended)**
   - Select **"Previous version"**
   - This will compare v1.1.0 against v1.0.0
   - Requires git tags created in Step 4c

   **Option B: Number of Days**
   - Select **"Number of days"**
   - Set to **30**, **60**, or **90** days
   - Simpler but less precise than version-based comparison

3. **Save Settings**

### Step 6: Commit and Push Changes

```bash
# Add modified workflow files
git add .github/workflows/

# Add sonar-project.properties if modified
git add sonar-project.properties

# Commit changes
git commit -m "fix: remove SonarCloud workflow overrides and add project versioning"

# Push to main branch
git push origin main
```

### Step 7: Trigger Analysis and Verify

1. **Wait for Workflow Completion**
   - GitHub Actions will run automatically on push
   - Monitor the workflow in the **Actions** tab

2. **Check SonarCloud Dashboard**
   - Go to your project's main branch summary
   - Verify "New Code" shows the expected period:
     - "Since version 1.0.0" (if using Previous version)
     - "Since 30 days ago" (if using Number of days)

3. **Verify Quality Gate**
   - Check if Quality Gate status is now **PASSED**
   - Ensure coverage metrics are displayed (not "not enough lines to compute")

---

## Troubleshooting

### Issue: Quality Gate still showing old baseline

**Cause**: Changes haven't propagated to SonarCloud yet

**Solution**:

```bash
# Trigger a new analysis with an empty commit
git commit --allow-empty -m "chore: trigger SonarCloud analysis"
git push origin main
```

### Issue: "Previous version" baseline not working

**Cause**: No version tags exist or tags not pushed

**Solution**:

```bash
# Verify tags exist
git tag

# Push tags if missing
git push origin --tags
```

### Issue: Coverage shows "not enough lines to compute"

**Cause**: Baseline period is too narrow (e.g., only measuring recent config changes)

**Solution**:

- Widen the baseline in SonarCloud web UI to 30+ days
- Or ensure version tags span meaningful code changes (3+ months apart)

### Issue: Workflow fails with "invalid parameter" error

**Cause**: Typo in `-Dsonar.projectVersion` or other parameters

**Solution**:

- Review workflow YAML syntax
- Ensure no duplicate parameters
- Verify indentation is correct

---

## Validation Checklist

Before considering the fix complete, verify:

- [ ] All workflow files checked for `sonar.newCodePeriod.*` parameters
- [ ] All hardcoded baseline overrides removed from workflows
- [ ] `sonar.projectVersion` added to `sonar-project.properties`
- [ ] `sonar.projectVersion` added to all workflow SonarCloud scan steps
- [ ] Git version tags created (v1.0.0 baseline, v1.1.0 current)
- [ ] Version tags pushed to remote repository
- [ ] SonarCloud web UI baseline configured correctly
- [ ] Main branch pushed and workflow completed successfully
- [ ] SonarCloud dashboard shows expected "New Code" period
- [ ] Quality Gate status is **PASSED**
- [ ] Coverage metrics are displayed (not bypassed)

---

## Quick Reference Commands

```bash
# Search for workflow overrides
grep -r "sonar.newCodePeriod" .github/workflows/

# Create version tags
git tag v1.0.0 <baseline-commit-hash>
git tag v1.1.0 HEAD
git push origin v1.0.0 v1.1.0

# List all tags
git tag -l

# Trigger new analysis
git commit --allow-empty -m "chore: trigger SonarCloud analysis"
git push origin main

# View commit history for baseline selection
git log --since="3 months ago" --oneline --graph
```

---

## Best Practices

1. **Version Tags**: Create meaningful version tags that span significant development periods (3-6 months minimum)

2. **Consistent Versioning**: Keep `sonar.projectVersion` synchronized across:
   - `sonar-project.properties`
   - All workflow files
   - Git tags

3. **Avoid Workflow Overrides**: Let SonarCloud web UI control baseline settings for better flexibility

4. **Document Baseline**: Add a comment in `sonar-project.properties` explaining the versioning strategy:

   ```properties
   # Version 1.0.0: September 2024 baseline
   # Version 1.1.0: December 2024 current release
   sonar.projectVersion=1.1.0
   ```

5. **Team Communication**: Inform team members about baseline changes to avoid confusion with coverage reports

---

## Additional Resources

- [SonarCloud New Code Definition](https://docs.sonarcloud.io/improving/new-code-definition/)
- [SonarCloud Analysis Parameters](https://docs.sonarcloud.io/advanced-setup/analysis-parameters/)
- [GitHub Actions: SonarCloud Action](https://github.com/SonarSource/sonarcloud-github-action)

---

## Summary

This issue occurs when GitHub Actions workflow files hardcode SonarCloud baseline parameters, overriding web UI settings. The fix involves:

1. Removing hardcoded `-Dsonar.newCodePeriod.*` parameters from workflows
2. Adding project versioning (`sonar.projectVersion`) to enable "Previous version" strategy
3. Creating git tags to establish version baselines
4. Configuring baseline in SonarCloud web UI (not in workflows)

Following this guide will restore control over your New Code definition and allow the Quality Gate to measure coverage accurately.
