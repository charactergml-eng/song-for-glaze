"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { LyricsDisplay } from "@/components/LyricsDisplay";

// Sample data - replace with your actual lyrics and timestamps
const lyrics = [
  "[Intro]", 
  "my homie you went thru a lot in this matrix", 
  "you deserve good words and lots of glazin’", 
  "you should be proud of yourself", 
  "self dependant and so amazing", 
  "the best at your job", 
  "your grinding never stops", 
  "inspiration for the people around you", 
  "homie you really a star", 
  "you’re so good what you do", 
  "they offered you royalty treatment", 
  "that alone is a proof", 
  "that you have no signs of weakness",
  "you’re a source of power", 
  "patience and pride", 
  "i’m really proud of you homie", 
  "and i’d say that in every other life",
  "Who really is the best?", 
  "Goddess Batoul", 
  "Who does the most reps?", 
  "Goddess Batoul",
  "Who got them all jealous?", 
  "Goddess Batoul",
  "You know who to worship?",
  "Goddess Batoul", 
  "Who really is the best?",
  "Goddess Batoul", 
  "Who does the most reps?", 
  "Goddess Batoul",
  "Who got them all jealous?", 
  "Goddess Batoul",
  "You know who to worship?",
  "Goddess Batoul",
  "There’s men that are too pussy to live like you",
  "There’s men that still ask their mom to wipe their poop",
  "There’s men too afraid of responsibilities",
  "but you over here showing superhero abilities",
  "I mean you have your boss on his knees", 
  "So who’s the real boss here?", 
  "we are all beneath your feet",
  "That Ana enta meme is really real", 
  "and when we make a sitting", 
  "as soon as you open the door", 
  "and only with your permission",
  "you’ll see me bow down to the floor", 
  "Because that’s the bare minimum",
  "Who really is the best?",
  "Goddess Batoul", 
  "Who does the most reps?", 
  "Goddess Batoul",
  "Who got them all jealous?",
  "Goddess Batoul", 
  "You know who to worship?", 
  "Goddess Batoul", 
  "Who really is the best?",
  "Goddess Batoul",
  "Who does the most reps?", 
  "Goddess Batoul",
  "Who got them all jealous?",
  "Goddess Batoul",
  "You know who to worship?",
  "Goddess Batoul",
  "I be glazing I be glazing I be glazing",
  "I be glazing I be glazing I be glazing", 
  "Batoul glaze day", 
  "Batoul glaze day is every day", 
  "hey hey hey hey heyyyyyyyyyyy"
]

const timestamps = [
  0, 
  14,
  17, 
  21,
  23,
  27, 
  29, 
  31, 
  32,
  34,
  36,
  38,
  40,
  42,
  44,
  45,
  47,
  50,
  51,
  53,
  54,
  56,
  58,
  60,
  61,
  62,
  64,
  65,
  67,
  68,
  71,
  72,
  74,
  76,
  78,
  81,
  85,
  87,
  91,
  94,
  96,
  97,
  100,
  101,
  103,
  105,
  107,
  110,
  111,
  113,
  114,
  117,
  118,
  120,
  121,
  123,
  125,
  127,
  129,
  131,
  132,
  134,
  136,
  138,
  141,
  147,
  150
];

export default function Home() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSongEnd = () => {
    // Navigate to rating page when song ends
    router.push("/rate");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Decorative header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-gothic text-gothic-crimson text-glow mb-2 animate-candle-flicker">
          Song for Glaze
        </h1>
        <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-gothic-bloodRed to-transparent" />
      </div>

      {/* Lyrics Display */}
      <LyricsDisplay
        lyrics={lyrics}
        timestamps={timestamps}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />

      {/* Audio Player */}
      <div className="mt-12 w-full">
        <AudioPlayer
          audioSrc="/audio/song.mp3"
          onTimeUpdate={setCurrentTime}
          onEnded={handleSongEnd}
          onPlayStateChange={setIsPlaying}
        />
      </div>

      {/* Decorative footer */}
      <div className="mt-12">
        <div className="flex gap-4 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gothic-bloodRed rounded-full animate-candle-flicker candle-glow"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
