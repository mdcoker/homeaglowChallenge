## Post-Completion Dev Notes

These are various notes and questions around this take home assignment.

- Claude Code was used throughout the assignment. 
- Before any code was generated, we went back and forth on AC gaps and some behavioral decisions.
- No part of _**this file**_ was AI-generated or -assisted. 
- Dev was done on web, with mobile-sized rendered manually

### Alternate states
To view the alternate versions for specific states, update line 20 in App.tsx to any state defined in the `CUSTOM_RATE_STATES` array in rates.ts line 76.

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

## Closing thoughts

When it comes to fetching data, I'd try to pull as much as possible from the server, including
- Rate min and max
- Estimated weekly jobs
- Any state-based policy rules 
- Price increment size
- Recommended pricing
- Legal-ese in the tooltip

I'd also likely pull any data for A/B testing, flags needed, text differences, etc. Especially for mobile dev, we want to make as many things updateable without an version change as possible.

When the user hits "Continue":
1. Data would be sent in for server-side validation
2. The existing in-button spinner would continue to show until a response is recieved
3. Any errors outside what is mocked would be shown in the same space as the mocked error
4. Upon success, move to step 3, which would probably be more onboarding/user setup
5. Try to save states as often as possible until the user either finishes the flow, or leaves altogether

Error handling - see step 3 above, but generally most errors would be shown to the user with a pattern of "here's what went wrong, try again," shown on-page. Ideally we let the user know the issue so they have the power to fix it, excluding any secuirty/vulnerability issues.

I'd also spend much more time testing mobile and screen sizes, rather than the web-only testing I did here.

Hope this covers everything! I appreciate the opportunity, HomeAglow is a neat product and this was an enjoyable take-home, all things considered.