## Post-Completion Dev Notes

These are various notes and questions around this take home assignment.

- Claude Code was used throughout the assignment. 
- Before any code was generated, we went back and forth on AC gaps and some behavioral decisions.
- No part of _**this file**_ was AI-generated or -assisted. 


### Fail States
To test fail states, change each variable in rates.ts lines 68-70:
- Increase `latencyMs` to make the loading states last longer
- Set `failFetch` to `true` to see initial page load fail state
- Set `failSubmit` to `true` to see submission fail state (after clicking 'Continue')

### Gap-filling assumptions made
Some decisions around functionality were independantly made, given gaps in the AC. Typically these would be ran by someone in product.
- Min/max hourly rates
- Increment amount for rate change ($1 increments)
- Calculations for estimated numbers of jobs
    - Implemented a simple tiering system, see `rates.ts` line 83
- Added explanaition for the `?` next to 'Recommended Rate'
- Set default states for the "Set new client rate" functionality, see `rates.ts` line 76
- No error or loading states given, made them independently
- New Client rate is always handled by the server, _unless_ user is in a state where they're allowed to set this rate themselves

### Prod API

A real API call would look something like this, rather than what's in the mock calls:
```
const res = await fetch(`${API}/applicants/${params.applicantId}/rate`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(params.request),
  signal: params.signal,
});
```

## Continuing

When the user hits "Continue", data would be sent in for server-side validation, and the next page would likely 