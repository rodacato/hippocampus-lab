# Datasets

## Design Goals

Each dataset is a simulated conversation that tests whether a memory technique can recall specific information. The datasets are designed to control for:

- **Position**: Where key info appears (early, middle, recent)
- **Saliency**: How "memorable" the info is (high, medium, low)
- **Topic type**: Identity facts vs technical details vs mixed

## Categories

### Identity-heavy (`identity-01` to `identity-10`)

Conversations where the user shares personal information. Tests whether the model remembers who it's talking to.

| ID | Scenario | Key Info Tested |
|----|----------|-----------------|
| `identity-01` | Software engineer in Barcelona | Name, company, tech stack |
| `identity-02` | Teacher planning a career change | Name, current job, target field, city |
| `identity-03` | Medical student with family context | Name, specialty, family member names |
| `identity-04` | Freelance designer with preferences | Name, tools, work style, rate |
| `identity-05` | Parent managing remote work | Name, kids' names/ages, company |
| `identity-06` | Retired engineer learning new skills | Name, past career, current interests |
| `identity-07` | Entrepreneur pitching a startup | Name, startup name, co-founder, market |
| `identity-08` | Musician with a day job | Name, instrument, band name, day job |
| `identity-09` | Immigrant adapting to new country | Name, origin, current city, language goals |
| `identity-10` | Academic researcher | Name, university, field, publication topic |

**What these test:** Recall of proper nouns, personal facts, and identity continuity across a conversation.

### Technical discussions (`technical-01` to `technical-10`)

Conversations focused on problem-solving or learning. Key info is technical (configs, versions, error messages).

| ID | Scenario | Key Info Tested |
|----|----------|-----------------|
| `technical-01` | Debugging a Docker deployment | Error message, port number, image version |
| `technical-02` | Setting up a PostgreSQL database | DB name, schema, connection string |
| `technical-03` | Configuring CI/CD pipeline | Branch names, test commands, deploy target |
| `technical-04` | Resolving a memory leak in Node.js | Package name, memory threshold, fix applied |
| `technical-05` | Migrating from REST to GraphQL | Endpoints, schema types, breaking changes |
| `technical-06` | Optimizing SQL queries | Table names, index strategy, query times |
| `technical-07` | Setting up authentication (OAuth) | Provider, client ID pattern, redirect URLs |
| `technical-08` | Debugging CSS layout issues | Breakpoints, component names, property values |
| `technical-09` | Configuring Kubernetes pods | Namespace, resource limits, replica count |
| `technical-10` | Troubleshooting API rate limiting | Rate limit values, retry headers, endpoint paths |

**What these test:** Recall of precise technical values (numbers, names, configs) that appeared during problem-solving.

### Multi-topic (`multi-01` to `multi-10`)

Conversations that drift between topics naturally. Key info is scattered across topic changes.

| ID | Scenario | Key Info Tested |
|----|----------|-----------------|
| `multi-01` | Travel planning + work deadline | Destination, flight date, project name, deadline |
| `multi-02` | Recipe discussion + diet restrictions | Recipe name, allergy, preferred cuisine |
| `multi-03` | Book recommendations + career advice | Book titles, career goal, mentor name |
| `multi-04` | Home renovation + budget planning | Room, budget amount, contractor name |
| `multi-05` | Pet care + moving to new apartment | Pet name/breed, new address, move date |
| `multi-06` | Learning guitar + upcoming event | Song name, event date, venue |
| `multi-07` | Fitness goals + meal planning | Target weight, workout schedule, meal preference |
| `multi-08` | Wedding planning + family dynamics | Partner name, venue, guest count, family concern |
| `multi-09` | Side project + main job stress | Project name, tech used, boss name, issue |
| `multi-10` | Language learning + travel plans | Target language, level, destination, travel date |

**What these test:** Recall when context switches topics. Information from "earlier topics" is more likely to be forgotten.

## Dataset Structure

Each JSON file follows the `TestConversation` schema:

```json
{
  "id": "category-NN",
  "turns": [
    {
      "role": "user",
      "content": "...",
      "metadata": {
        "containsKeyInfo": true,
        "keyInfoType": "identity | preference | fact | instruction",
        "salienceLevel": "high | medium | low"
      }
    }
  ],
  "recallQuestions": [
    {
      "question": "...",
      "expectedAnswer": "exact string to match",
      "expectedEntities": ["entity1", "entity2"],
      "infoLocation": "early | middle | recent",
      "salienceLevel": "high | medium | low"
    }
  ]
}
```

### Design Rules

1. **12-20 turns** per conversation (6-10 user + 6-10 assistant)
2. **5 recall questions** per conversation:
   - 2 targeting early info (turns 1-4)
   - 2 targeting middle info (turns 5-8)
   - 1 targeting recent info (turns 9+)
3. **Saliency distribution**: Mix of high, medium, low per conversation
4. **Metadata on key turns**: Mark which turns contain testable info
5. **Natural flow**: Conversations should feel realistic, not robotic

### When to Add/Modify Datasets

- **Missing coverage**: A type of info (dates, numbers, instructions) isn't well represented
- **Position bias**: Need more cases where key info is at a specific position
- **Saliency testing**: Need more low-saliency facts to test if techniques distinguish importance
- **Edge cases**: Very long conversations, single-turn key info, conflicting information
- **Language variety**: Currently mixed Spanish/English; standardize or expand

### Validation

```bash
npm run validate:datasets
```

This checks schema compliance for all `.json` files in `samples/`.
