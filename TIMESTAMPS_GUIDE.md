# Timestamps Guide

## Understanding Timestamps

Timestamps must be **cumulative** - each timestamp represents the absolute time from the start of the song when that lyric line should appear.

## Example

If your song has:
- Intro plays for 14 seconds
- First lyric appears 3 seconds after intro ends
- Second lyric appears 10.8 seconds after the first lyric

Then your timestamps should be:

```typescript
const timestamps = [
  14,        // Intro at 14 seconds
  17,        // First lyric at 17 seconds (14 + 3)
  27.8,      // Second lyric at 27.8 seconds (17 + 10.8)
  // ... continue adding
];
```

## How to Calculate Your Timestamps

### Method 1: Listen and Note Times
1. Play your audio file
2. Use a timer or audio software (like Audacity)
3. Note the exact time (in seconds) when each lyric line should appear
4. Write down those times as your timestamps

### Method 2: Convert Durations to Cumulative
If you have durations (how long each line shows), convert them:

```javascript
// Your durations (how long each line displays)
const durations = [14, 3, 10.8, 5.5, 5.8, 5.4, 5.7, 5.8];

// Convert to cumulative timestamps
const timestamps = [];
let cumulative = 0;
for (const duration of durations) {
  timestamps.push(cumulative);
  cumulative += duration;
}

console.log(timestamps);
// [0, 14, 17, 27.8, 33.3, 39.1, 44.5, 50.2]
```

## Quick Converter Script

Create a file called `convert-timestamps.js`:

```javascript
// Replace this with your durations (in seconds)
const durations = [
  14,    // Intro duration
  3,     // First line duration
  10.8,  // Second line duration
  5.5,   // etc...
  // ... add all your durations
];

// Convert to cumulative timestamps
const timestamps = [];
let cumulative = 0;

for (let i = 0; i < durations.length; i++) {
  timestamps.push(cumulative);
  cumulative += durations[i];
  console.log(`Line ${i}: appears at ${timestamps[i].toFixed(2)}s`);
}

console.log("\nFinal timestamps array:");
console.log(JSON.stringify(timestamps, null, 2));
```

Run it with: `node convert-timestamps.js`

## Your Current Data

Based on what you provided, it looks like you might have:

```typescript
const lyrics = [
  "[Intro]",                                    // Shows at 14s
  "my homie you went thru a lot in this matrix", // Shows at 17s (14+3)
  "you deserve good words and lots of glazin'",   // Shows at 27.8s (17+10.8)
  "you should be proud of yourself",              // Shows at 44.1s (27.8+16.3)
  // ... etc
];

const timestamps = [
  14,        // [Intro]
  17,        // my homie you went thru...
  27.8,      // you deserve good words...
  44.1,      // you should be proud...
  66.2,      // self dependant...
  93.7,      // the best at your job...
  126.9,     // your grinding never stops...
  166.9,     // inspiration for the people...
];
```

## Tips for Accurate Timing

1. **Use Audio Software**: Import your MP3 into Audacity (free) to see waveforms and place markers
2. **Test in Browser**: Use your app and adjust timestamps until they feel right
3. **Start Simple**: Get the first 5-10 lines timed perfectly, then do the rest
4. **Round if Needed**: You can round to 1 decimal place for simplicity (e.g., 17.234 → 17.2)

## Debugging

If lyrics appear at the wrong time:
- Open browser console
- Add this to your code temporarily:

```typescript
useEffect(() => {
  console.log('Current time:', currentTime.toFixed(2), 'Active index:', activeLyricIndex);
}, [currentTime, activeLyricIndex]);
```

This will show you exactly when each lyric is appearing.
