## Syncing repos

Git Source:
https://git.source.akamai.com/projects/FEE/repos/cloud-manager/browse

GitHub:
https://github.com/linode/manager

These are the steps you'll need to take to sync CM in Git Source with CM in the Github Staging branch
	1.	Set up your remotes accordingly
  ```bash
  git remote add acc ssh://git@git.source.akamai.com:7999/fee/cloud-manager.git
  ```
  e.g
  ```bash
  git remote -v
  origin	git@github.com:corya-akamai/manager.git (fetch)
  origin	git@github.com:corya-akamai/manager.git (push)
  upstream	git@github.com:linode/manager.git (fetch)
  upstream	git@github.com:linode/manager.git (push)
  acc ssh://git@git.source.akamai.com:7999/fee/cloud-manager.git (fetch)
  acc ssh://git@git.source.akamai.com:7999/fee/cloud-manager.git (push)
  ```
  2. Sync upstream/develop to acc/dev
  ```bash
  git checkout acc dev
  git pull --rebase upstream develop
  git push -u acc
  ```
  3. Sync upstream/staging to acc/stage
  ```bash
  git checkout acc stage
  git pull --rebase upstream staging
  git push -u acc
  ```
  4. Sync upstream/master to acc/prod
  ```bash
  git checkout acc prod
  git pull --rebase upstream master
  git push -u acc
  ```

## Required changes for ACC build
```
diff --git a/packages/manager/package.json b/packages/manager/package.json
--- a/packages/manager/package.json
+++ b/packages/manager/package.json
@@ -1,9 +1,11 @@
 {
-  "name": "linode-manager",
+  "name": "@linode/cloud-manager",
   "author": "Linode",
   "description": "The Linode Manager website",
   "version": "1.152.0",
-  "private": true,
+  "files": [
+    "build"
+  ],
```

Package name will need to be updated in the root package.json from `linode-manager` to `@linode/cloud-manager` as well.
