// Let's Learn Morse Code: Blackout
// Course data: the three acts, the 21 days and the Day 1 script.
// Letters come two a day in an order chosen so each day's story messages
// can be read with only the letters learned so far.

export const ACTS = [
  { n: 1, name: "The Dark", from: 1, to: 7 },
  { n: 2, name: "The Static", from: 8, to: 14 },
  { n: 3, name: "Lights On", from: 15, to: 21 },
];

export const DAYS = [
  {
    n: 1,
    title: "The Signal",
    teach: ["S", "O"],
    label: "S O",
    summary: "You learned S and O, decoded your first message and sent your first signal.",
  },
  { n: 2, title: "Someone Is Listening", teach: ["E", "T"], label: "E T" },
  { n: 3, teach: ["A", "N"], label: "A N" },
  { n: 4, teach: ["I", "M"], label: "I M" },
  { n: 5, teach: ["R", "D"], label: "R D" },
  { n: 6, teach: ["H", "U"], label: "H U" },
  { n: 7, teach: ["C", "K"], label: "C K" },
  { n: 8, teach: ["L", "W"], label: "L W" },
  { n: 9, teach: ["G", "P"], label: "G P" },
  { n: 10, teach: ["F", "Y"], label: "F Y" },
  { n: 11, teach: ["B", "V"], label: "B V" },
  { n: 12, teach: ["J", "Q"], label: "J Q" },
  { n: 13, teach: ["X", "Z"], label: "X Z" },
  { n: 14, teach: ["1", "2", "3", "4", "5"], label: "1 to 5" },
  { n: 15, teach: ["6", "7", "8", "9", "0"], label: "6 to 0" },
  { n: 16, teach: [".", ",", "?", "/"], label: ". , ? /" },
  { n: 17, teach: [], label: "Prosigns" },
  { n: 18, teach: [], label: "Words" },
  { n: 19, teach: [], label: "Speed" },
  { n: 20, teach: [], label: "Sending" },
  { n: 21, teach: [], label: "Finale" },
];

// Days that are written and playable.
export const AVAILABLE = new Set([1]);

// The reply at the end of Day 1. Players crack more of it as they learn letters.
export const MYSTERY = { text: "SEEN", name: "The cold reply" };

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Even mix of letters, never three of the same in a row.
function singles(letters, n) {
  const base = Array.from({ length: n }, (_, i) => letters[i % letters.length]);
  for (let attempt = 0; attempt < 60; attempt++) {
    const a = shuffle(base);
    if (a.every((ch, i) => i < 2 || !(ch === a[i - 1] && ch === a[i - 2]))) return a;
  }
  return base;
}

export const DAY_SCRIPTS = {
  1: [
    {
      type: "story",
      scene: "city",
      cta: "Learn the code",
      lines: [
        { text: "Monday night. 9:47.", style: "stamp" },
        { text: "You're finishing your homework. In the next room, Grandpa is humming an old song." },
        { text: "The lights flicker.", fx: "flicker" },
        { text: "Then everything goes dark.", fx: "blackout" },
        { text: "No lights. No phone signal. No internet. From your window you watch the whole city switch off, one building at a time." },
        { text: "It's so quiet you can hear the clock ticking." },
        { text: "Then a click from Grandpa's room." },
        { text: "His old radio, the one nobody is allowed to touch, has switched itself on.", fx: "radio" },
        { text: "Through the crackle comes a sound.", play: { text: "SOS", voice: "grandpa" } },
        { text: "You call out for Grandpa. No answer." },
        { text: "His room is empty. The window is open. His torch is gone." },
        { text: "And the radio keeps beeping.", play: { text: "SOS", voice: "grandpa" } },
        { text: "It's a message in Morse code. And tonight, you're the only one who can read it." },
      ],
    },
    { type: "concept" },
    { type: "learn", letter: "S", tip: "Three short beeps, quick like a snake's hiss: sss.", next: "Next letter" },
    { type: "learn", letter: "O", tip: "Three long beeps. Long and round, like the letter O.", next: "Start practising" },
    {
      type: "drill",
      title: "Which one?",
      intro: "The radio will play S or O. Press the letter you hear.",
      mode: "audio",
      items: () => singles(["S", "O"], 12),
      points: 10,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Keep listening",
      lines: [{ text: "The beeping speeds up. Whoever is sending it is in a hurry.", play: { text: "SOS", voice: "fast" } }],
    },
    {
      type: "drill",
      title: "Faster",
      intro: "Now the letters come in groups, a little faster. Type every letter you hear, in order.",
      mode: "audio",
      voice: "fast",
      items: () => shuffle(["SO", "OS", "SOS", "OSO", "SSO", "OOS", "SOO", "OSS"]),
      points: 15,
    },
    {
      type: "story",
      scene: "street",
      cta: "Read the light",
      lines: [
        { text: "A light blinks across the street.", fx: "torch" },
        { text: "It's Zoya, your best friend, at her window. She's copying the radio with her torch: short flashes and long flashes." },
        { text: "No sound this time. Read the light." },
      ],
    },
    {
      type: "drill",
      title: "Torch talk",
      intro: "Watch Zoya's window. A short flash is a dit, a long flash is a dah.",
      mode: "light",
      items: () => [...singles(["S", "O"], 4), "SO", "SOS"],
      points: 10,
    },
    {
      type: "story",
      scene: "street",
      cta: "Decode it",
      lines: [
        { text: "Zoya gives you a thumbs up. You're getting good at this." },
        { text: "Behind you, the radio goes quiet. Then the whole message starts again from the beginning.", fx: "radio" },
        { text: "This time, you're ready." },
      ],
    },
    {
      type: "decode",
      title: "The message",
      intro: "Listen to the whole message, then type the word it keeps repeating.",
      message: "SOS SOS SOS",
      answer: "SOS",
      success: "You decoded your first message!",
      points: 50,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Answer it",
      lines: [
        { text: "S. O. S. Everyone knows that one. It means: help!" },
        { text: "Grandpa's pocket radio is missing too." },
        { text: "He's out there somewhere in the dark, sending SOS to his own radio. To his own house. To you." },
      ],
    },
    {
      type: "reply",
      title: "Answer Grandpa",
      intro: "Grandpa's radio has a key for sending. Tap SOS back so he knows you heard him.",
      target: "SOS",
      points: 50,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 1",
      lines: [
        { text: "Your signal flies out across the dark city." },
        { text: "Silence. One second. Two. Three." },
        { text: "Then an answer comes back.", cold: MYSTERY.text },
        { text: "But that's not Grandpa. Grandpa taps slow and steady, like a heartbeat. These beeps are fast. Sharp. Cold.", tone: "cold" },
        { text: "You can only read the first letter." },
        { text: "Someone else is listening to Grandpa's radio." },
        { text: "And now they know you're listening too.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],
};
