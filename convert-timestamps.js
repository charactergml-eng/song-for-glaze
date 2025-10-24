// TIMESTAMP CONVERTER
// This script converts durations to cumulative timestamps

// Replace these with your actual durations (in seconds)
// Each number represents how long that lyric line should be displayed
const durations = [
  14,    // [Intro]
  3,     // my homie you went thru a lot in this matrix
  10.8,  // you deserve good words and lots of glazin'
  16.3,  // you should be proud of yourself
  5.9,   // self dependant and so amazing
  5.4,   // the best at your job
  6.1,   // your grinding never stops
  5.8,   // inspiration for the people around you
  // Add more durations for each of your 77 lyrics...
];

// Convert to cumulative timestamps
const timestamps = [];
let cumulative = 0;

console.log("Converting durations to cumulative timestamps...\n");
console.log("Line | Timestamp | Lyric");
console.log("-----|-----------|------");

for (let i = 0; i < durations.length; i++) {
  timestamps.push(parseFloat(cumulative.toFixed(2)));
  console.log(`${String(i).padStart(4)} | ${cumulative.toFixed(2).padStart(9)}s | Line ${i + 1}`);
  cumulative += durations[i];
}

console.log("\n" + "=".repeat(50));
console.log("Copy this array into your app/page.tsx:");
console.log("=".repeat(50) + "\n");

console.log("const timestamps = [");
timestamps.forEach((ts, i) => {
  const isLast = i === timestamps.length - 1;
  console.log(`  ${ts.toFixed(2)}${isLast ? "" : ","}`);
});
console.log("];\n");

console.log(`Total lines: ${timestamps.length}`);
console.log(`Song duration: ~${cumulative.toFixed(2)} seconds (~${(cumulative / 60).toFixed(2)} minutes)`);
