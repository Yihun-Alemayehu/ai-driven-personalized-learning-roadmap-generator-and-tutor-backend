# Phase 7: Resource Service (Including PSE API Integration)

**Depends on:** [Phase 6: Quiz & Gatekeeper](06-quiz-gatekeeper.md)  
**Next phase:** [Phase 8: Mastery Decay](08-decay.md)

---

## What to Build

Resource CRUD, domain whitelist management, learner resource ratings. Google PSE API integration for runtime resource discovery. Automated link validation (HTTP checks). Resource adaptation logic (modality swapping triggered by Gatekeeper failures).

All resource logic lives in the **learning-service**. The PSE API client is also in learning-service (not ai-service — resource discovery is separate from AI generation).

---

## Files and Folders

```
services/learning-service/src/modules/
├── resources/
│   ├── resources.routes.ts        # CRUD + ratings + fetch from PSE
│   ├── resources.controller.ts
│   ├── resources.service.ts       # Resource CRUD, rating aggregation
│   ├── resources.validation.ts
│   └── resources.test.ts
├── whitelist/
│   ├── whitelist.routes.ts        # CRUD for domain whitelist
│   ├── whitelist.controller.ts
│   ├── whitelist.service.ts
│   └── whitelist.test.ts
├── pse/
│   ├── pse.client.ts              # Google PSE API HTTP client
│   ├── pse.service.ts             # Search, filter, cache results
│   ├── pse.test.ts                # Integration test (mocked HTTP for CI, real for manual)
│   └── pse.types.ts               # PSE API response types
├── linkValidator/
│   ├── linkValidator.service.ts   # HTTP HEAD checks, freshness detection
│   └── linkValidator.test.ts
├── adaptation/
│   ├── adaptation.service.ts      # Resource swap logic (documentation → tutorial)
│   └── adaptation.test.ts

services/learning-service/prisma/seeds/
├── 005_domain_whitelist.ts        # Whitelist entries for Frontend domain
└── 006_manual_resources.ts        # Manually curated resources for pilot nodes
```

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/nodes/:nodeId/resources | Yes | Learner | Get resources for a node (sorted by rating) |
| POST | /api/v1/nodes/:nodeId/resources/discover | Yes | Learner | Trigger PSE API search for this node → cache results |
| POST | /api/v1/resources | Yes | Admin/Expert | Manually add resource |
| PATCH | /api/v1/resources/:id | Yes | Admin/Expert | Update resource |
| DELETE | /api/v1/resources/:id | Yes | Admin | Delete resource |
| POST | /api/v1/resources/:id/rate | Yes | Learner | Rate resource (1-5 + optional comment) |
| GET | /api/v1/domains/:domainId/whitelist | Yes | Any | List whitelisted sources for domain |
| POST | /api/v1/domains/:domainId/whitelist | Yes | Admin/Expert | Add source to whitelist |
| DELETE | /api/v1/whitelist/:id | Yes | Admin | Remove source from whitelist |
| POST | /api/v1/resources/validate-links | Yes | Admin | Trigger bulk link validation job |

---

## PSE API Integration

- **Client** (`pse.client.ts`): Wraps the Google Custom Search JSON API. Accepts `query`, `siteSearch` (from whitelist), returns parsed results.
- **Service** (`pse.service.ts`):
  1. Build search query from node title + learning outcomes.
  2. Restrict search to whitelisted domains for this node's domain.
  3. Fetch top 10 results.
  4. Deduplicate against existing resources.
  5. Insert new resources with `fetched_via = 'pse_api'`.
  6. Cache results in Redis (TTL: 24 hours) to minimize API calls.

---

## Resource Adaptation Logic

When Gatekeeper triggers `resource_swap` (Phase 6 fail_low outcome):

1. Query current resources for the node, ordered by modality.
2. If learner's last attempt used `documentation` modality resources → recommend `tutorial` or `video` modality resources.
3. If no alternative modality exists → trigger PSE API search with tutorial-focused query.
4. Log `adaptation_event` with details: `{from_modality, to_modality, resources_swapped}`.

---

## Tests to Write

| Test | Asserts |
|------|---------|
| GET resources for node | Returns resources sorted by avg_rating descending |
| Add manual resource | Returns 201; resource appears in GET |
| Rate resource | Rating recorded; avg_rating recomputed |
| Rate resource twice | Updates existing rating (upsert); avg recalculated |
| PSE API search returns results | Mocked PSE response → resources inserted in DB |
| PSE API deduplicates existing URLs | Same URL not inserted twice |
| PSE results cached in Redis | Second call within TTL returns cached results without API call |
| Link validation: valid URL | Returns is_valid = true, updated last_validated_at |
| Link validation: broken URL (404) | Returns is_valid = false |
| Whitelist CRUD | Add, list, delete whitelist entries |
| Resource adaptation: swap documentation → tutorial | Returns tutorial-modality resources; adaptation_event logged |
| Resource adaptation: no alternative exists | Triggers PSE search with tutorial query |
| Only admin can manage whitelist | Learner gets 403 |

---

## Definition of Done

- [ ] Resources CRUD fully functional
- [ ] Domain whitelist CRUD works and restricts PSE API searches
- [ ] PSE API integration fetches and stores resources from whitelisted domains
- [ ] Results cached in Redis to minimize API cost
- [ ] Link validator checks HTTP status of stored resources
- [ ] Resource rating and aggregation works
- [ ] Resource adaptation logic swaps modalities correctly
- [ ] Seed data provides whitelist and manual resources for pilot domain
- [ ] All tests pass
