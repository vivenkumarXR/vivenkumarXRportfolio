// Let's Learn Morse Code: Blackout
// The whole course: three acts, 21 days, one long night.
// Rule: every message the player has to read uses only symbols learned by that day.
// Only "cold" lines (the cliffhangers) break the rule on purpose: the player sees
// the letters they know and a "?" for the rest, and reads more of it each day.

import { LETTERS, DIGITS } from "./morse.js?v=21";

export const ACTS = [
  { n: 1, name: "The Dark", from: 1, to: 7 },
  { n: 2, name: "The Static", from: 8, to: 14 },
  { n: 3, name: "Lights On", from: 15, to: 21 },
];

export const DAYS = [
  { n: 1, title: "The Signal", time: "9:47 PM", teach: ["S", "O"], label: "S O", summary: "You learned S and O, decoded your first message and sent your first signal." },
  { n: 2, title: "Someone Is Listening", time: "9:52 PM", teach: ["E", "N"], label: "E N", summary: "You found Grandpa's codebook, learned E and N, and read the cold reply." },
  { n: 3, title: "Look East", time: "9:58 PM", teach: ["T", "A"], label: "T A", summary: "You learned T and A and spotted a light on the old radio tower." },
  { n: 4, title: "The Tower Light", time: "10:09 PM", teach: ["I", "M"], label: "I M", summary: "You learned I and M and found out who is on the tower." },
  { n: 5, title: "The Radio Room", time: "10:21 PM", teach: ["R", "D"], label: "R D", summary: "You learned R and D and found out where Grandpa is hiding." },
  { n: 6, title: "The Moonstone", time: "10:38 PM", teach: ["H", "U"], label: "H U", summary: "You learned H and U and discovered what the gang is after." },
  { n: 7, title: "The Name", time: "10:55 PM", teach: ["C", "K"], label: "C K", summary: "You learned C and K and read the cold sender's name." },
  { n: 8, title: "Static Storm", time: "11:14 PM", teach: ["L", "W"], label: "L W", summary: "You learned L and W and heard Grandpa through the jamming." },
  { n: 9, title: "A Strange Message", time: "11:32 PM", teach: ["G", "P"], label: "G P", summary: "You learned G and P and got a message that didn't feel right." },
  { n: 10, title: "Real or Fake?", time: "11:51 PM", teach: ["F", "Y"], label: "F Y", summary: "You learned F and Y and learned to recognise Grandpa's fist." },
  { n: 11, title: "The Knock", time: "12:13 AM", teach: ["B", "V"], label: "B V", summary: "You learned B and V and found out who The Static really is." },
  { n: 12, title: "Quiet", time: "12:34 AM", teach: ["J", "Q"], label: "J Q", summary: "You learned J and Q and escaped up to the roof." },
  { n: 13, title: "The Roof", time: "1:02 AM", teach: ["X", "Z"], label: "X Z", summary: "You learned X and Z. You know the whole alphabet!" },
  { n: 14, title: "Five O'Clock", time: "1:37 AM", teach: ["1", "2", "3", "4", "5"], label: "1 to 5", summary: "You learned the numbers 1 to 5 and found out when the gang will strike." },
  { n: 15, title: "The Frequency", time: "2:16 AM", teach: ["6", "7", "8", "9", "0"], label: "6 to 0", summary: "You learned all ten numbers and found Grandpa's secret frequency." },
  { n: 16, title: "Who Are You?", time: "2:58 AM", teach: [".", ",", "?", "/"], label: ". , ? /", summary: "You learned Morse punctuation and reached the police." },
  { n: 17, title: "Over and Out", time: "3:35 AM", teach: ["<AR>", "<BT>", "<SK>"], label: "Radio rules", summary: "You learned the special signals real radio operators use." },
  { n: 18, title: "Lightning Words", time: "4:12 AM", teach: [], label: "Words", summary: "You learned to hear whole words at once." },
  { n: 19, title: "The Chase", time: "4:49 AM", teach: [], label: "Speed", summary: "You kept up with Morse at top speed." },
  { n: 20, title: "The Relay", time: "5:18 AM", teach: [], label: "Sending", summary: "You sent the messages that brought the police." },
  { n: 21, title: "Lights On", time: "5:41 AM", teach: [], label: "Finale", summary: "You switched the whole city back on. You're a real radio operator now." },
];

export const TOTAL_DAYS = DAYS.length;

// How to remember each symbol. Shown when it's taught.
export const TIPS = {
  S: "Three short beeps, quick like a snake's hiss: sss.",
  O: "Three long beeps. Long and round, like the letter O.",
  E: "Just one short beep. E is the most common letter, so it gets the shortest code.",
  N: "One long beep, then a short one. Say it like 'NAH-dit'.",
  T: "Just one long beep. T is the opposite of E.",
  A: "A short beep, then a long one. Say it like 'a-HA!' A is N backwards.",
  I: "Two short beeps, like E twice.",
  M: "Two long beeps, like T twice. Mmm-mmm.",
  R: "Short, long, short. The long beep sits in the middle, like a bridge.",
  D: "Long, then two short. It sounds like 'DOG did it!'",
  H: "Four short beeps. One more than S, so count carefully.",
  U: "Two short, then one long. Like 'uh-oh, NO!'",
  C: "Long, short, long, short. 'CHA-cha-CHA-cha', like a dance.",
  K: "Long, short, long. Radio operators send K to say 'over to you'.",
  L: "Short, long, short, short. 'la-LAH-la-la'.",
  W: "Short, long, long. Like 'wa-HOO-HOO!'",
  G: "Long, long, short. It's M with a short beep on the end.",
  P: "Short, long, long, short. It's W with a short beep on the end.",
  F: "Short, short, long, short. A little hop: di-di-DAH-dit.",
  Y: "Long, short, long, long. It's K with one more long beep.",
  B: "Long, then three short. 'BOOM-bi-bi-bi', like a drum.",
  V: "Three short, then a long one. Like a famous tune: da-da-da-DUM!",
  J: "Short, then three long. 'a JUMP-JUMP-JUMP'.",
  Q: "Long, long, short, long. It's G with one more long beep.",
  X: "Long, short, short, long. Two long beeps hug two short ones.",
  Z: "Long, long, short, short. 'ZOOM-ZOOM-zi-zi'.",
  1: "One short, four long.",
  2: "Two short, three long.",
  3: "Three short, two long.",
  4: "Four short, one long.",
  5: "Five short beeps.",
  6: "One long, four short.",
  7: "Two long, three short.",
  8: "Three long, two short.",
  9: "Four long, one short.",
  0: "Five long beeps.",
  ".": "Full stop: di-dah, three times over.",
  ",": "Comma: two long, two short, two long.",
  "?": "Question mark: di-di-dah-dah-di-dit.",
  "/": "Slash: it means 'or', like YES/NO.",
  "<AR>": "End of message. A and R with no gap.",
  "<BT>": "Break: a new part of the message. B and T with no gap.",
  "<SK>": "End of contact: 'over and out'. S and K with no gap.",
};

export const MEANINGS = {
  "<AR>": "End of message",
  "<BT>": "New part",
  "<SK>": "Over and out",
};

/* ------------------------------------------------------------------ */
/* Helpers for building practice rounds                                */
/* ------------------------------------------------------------------ */

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pickN = (list, n) => shuffle(list).slice(0, n);

// An even mix of symbols, never three of the same in a row.
function singles(symbols, n) {
  const base = Array.from({ length: n }, (_, i) => symbols[i % symbols.length]);
  for (let attempt = 0; attempt < 60; attempt++) {
    const a = shuffle(base);
    if (a.every((ch, i) => i < 2 || !(ch === a[i - 1] && ch === a[i - 2]))) return a;
  }
  return base;
}

const FIST_LINES = ["COME HOME", "STAY IN", "I AM OK", "GO NOW", "RUN", "FOLLOW ME", "HURRY UP", "IT IS ME", "OPEN UP", "LOOK"];
function fistItems(n) {
  const voices = shuffle([...Array(Math.ceil(n / 2)).fill("grandpa"), ...Array(Math.floor(n / 2)).fill("fake")]);
  const lines = pickN(FIST_LINES, n);
  return voices.map((v, i) => ({
    text: lines[i % lines.length],
    voice: v,
    answer: v === "grandpa" ? "Grandpa" : "Fake",
    options: ["Grandpa", "Fake"],
  }));
}

function prosignItems(n) {
  const options = ["<AR>", "<BT>", "<SK>"].map((p) => MEANINGS[p]);
  return singles(["<AR>", "<BT>", "<SK>"], n).map((p) => ({ text: p, answer: MEANINGS[p], options }));
}

const WORD_SETS = [
  ["THE", "THEY", "THEN", "THAT"],
  ["AND", "ANT", "END", "ANY"],
  ["YOU", "YES", "OUT", "YOUR"],
  ["GO", "NO", "SO", "TO"],
  ["NOW", "NOT", "NEW", "HOW"],
  ["VAN", "MAN", "CAN", "RAN"],
  ["RUN", "SUN", "FUN", "RAIN"],
  ["STOP", "STEP", "SHOP", "SPOT"],
  ["HELP", "HOLD", "HERE", "HALT"],
  ["COME", "CODE", "COLD", "CAME"],
  ["LEFT", "LIFT", "LOFT", "LIST"],
];
function wordChoiceItems(n) {
  return pickN(WORD_SETS, n).map((set) => {
    const target = set[Math.floor(Math.random() * set.length)];
    return { text: target, answer: target, options: shuffle(set) };
  });
}

/* ------------------------------------------------------------------ */
/* The 21 days                                                         */
/* ------------------------------------------------------------------ */
// Story lines can set:  scene (what the picture shows), fx (an effect),
// play (a Morse signal), cold (a cliffhanger signal shown as far as you can read it),
// style ("stamp" for times and titles, "letter" for Grandpa's writing),
// tone ("cold" for The Static), cta (the button text after that line).

export const SCRIPTS = {
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
        { text: "His old radio, the one nobody is allowed to touch, has switched itself on.", scene: "radio" },
        { text: "Through the crackle comes a sound.", play: { text: "SOS", voice: "grandpa" } },
        { text: "You call out for Grandpa. No answer." },
        { text: "His room is empty. The window is open. His torch is gone." },
        { text: "And the radio keeps beeping.", play: { text: "SOS", voice: "grandpa" } },
        { text: "It's a message in Morse code. And tonight, you're the only one who can read it." },
      ],
    },
    { type: "concept" },
    { type: "learn", symbol: "S", next: "Next letter" },
    { type: "learn", symbol: "O", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "The radio will play S or O. Press the letter you hear.", items: () => singles(["S", "O"], 12), points: 10 },
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
      voice: "fast",
      items: () => shuffle(["SO", "OS", "SOS", "OSO", "SSO", "OOS", "SOO", "OSS"]),
      points: 15,
    },
    {
      type: "story",
      scene: "street",
      cta: "Read the light",
      lines: [
        { text: "A light blinks across the street.", fx: "zoyaBlink" },
        { text: "It's Zoya, your best friend, at her window. She's copying the radio with her torch: short flashes and long flashes." },
        { text: "No sound this time. Read the light." },
      ],
    },
    {
      type: "drill",
      title: "Torch talk",
      intro: "Watch Zoya's torch. A short flash is a dit, a long flash is a dah.",
      mode: "light",
      view: "street",
      source: "zoya",
      items: () => [...singles(["S", "O"], 4), "SO", "SOS"],
      points: 10,
    },
    {
      type: "story",
      scene: "street",
      cta: "Decode it",
      lines: [
        { text: "Zoya gives you a thumbs up. You're getting good at this." },
        { text: "Behind you, the radio goes quiet. Then the whole message starts again from the beginning.", scene: "radio" },
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
    { type: "reply", title: "Answer Grandpa", intro: "Grandpa's radio has a key for sending. Tap SOS back so he knows you heard him.", target: "SOS", points: 50 },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 1",
      lines: [
        { text: "Your signal flies out across the dark city." },
        { text: "Silence. One second. Two. Three." },
        { text: "Then an answer comes back.", cold: { text: "SEEN", name: "The cold reply" } },
        { text: "But that's not Grandpa. Grandpa taps slow and steady, like a heartbeat. These beeps are fast. Sharp. Cold.", tone: "cold" },
        { text: "You can only read the first letter." },
        { text: "Someone else is listening to Grandpa's radio." },
        { text: "And now they know you're listening too.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  2: [
    {
      type: "story",
      scene: "radio",
      cta: "Turn the page",
      lines: [
        { text: "9:52 PM.", style: "stamp" },
        { text: "The cold beeps have stopped. Grandpa's radio just hisses." },
        { text: "Who else is listening? And where is Grandpa?" },
        { text: "On his desk, under his reading glasses, you find a small notebook.", scene: "codebook" },
        { text: "On the cover, in Grandpa's wobbly writing: For my favourite radio operator." },
        { text: "Inside, there's a note." },
        { text: "For weeks, strange beeps have filled my radio at night. Someone is planning something big.", style: "letter" },
        { text: "If the lights ever go out, listen to my radio. I will only use letters from this book, so you can always read me.", style: "letter" },
        { text: "You'll know it's me. I tap slow and steady, like a heartbeat. Love, Grandpa.", style: "letter" },
        { text: "Page one has S and O. You know those already. Page two has two more." },
      ],
    },
    { type: "learn", symbol: "E", next: "Next letter" },
    { type: "learn", symbol: "N", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "The radio will play E or N. Press the letter you hear.", items: () => singles(["E", "N"], 10), points: 10 },
    { type: "drill", title: "Mix it up", intro: "All four letters you know. Press each one you hear.", items: () => singles(["S", "O", "E", "N"], 10), points: 10 },
    {
      type: "story",
      scene: "street",
      cta: "Read her torch",
      lines: [
        { text: "A torch flashes across the street. Zoya!", fx: "zoyaBlink" },
        { text: "Grandpa taught her some Morse last summer. She wants to practise with you." },
      ],
    },
    {
      type: "drill",
      title: "Torch talk",
      intro: "Watch Zoya's torch and type each letter or word she flashes.",
      mode: "light",
      view: "street",
      source: "zoya",
      items: () => [...singles(["E", "N", "S", "O"], 4), "NO", "ON", "ONE"],
      points: 10,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "Click. The radio wakes up." },
        { text: "Fast, sharp beeps. The cold sender is back, sending the same word again.", play: { text: "SEEN", voice: "cold" } },
        { text: "This time, you know enough letters to read it." },
      ],
    },
    {
      type: "decode",
      title: "The cold message",
      intro: "Here it is again, slowed down. Type the word.",
      voice: "coldSlow",
      message: "SEEN SEEN",
      answer: "SEEN",
      success: "SEEN. They heard your SOS.",
      points: 50,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "Seen. Somebody heard your SOS. Somebody who isn't Grandpa.", tone: "cold" },
        { text: "Then the radio clicks again. Slow and steady, like a heartbeat." },
        { text: "It's Grandpa!", play: { text: "NO SOS", voice: "grandpa" } },
      ],
    },
    {
      type: "decode",
      title: "Grandpa's warning",
      intro: "Grandpa sends two words. Type them both.",
      message: "NO SOS NO SOS",
      answer: "NO SOS",
      success: "NO SOS. Grandpa wants you to stop sending SOS.",
      points: 50,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 2",
      lines: [
        { text: "No SOS. Whoever is out there can hear every beep you send. From now on, you listen." },
        { text: "Then the cold sender comes back one last time." },
        { text: "Radio operators sign off with their name, like signing a letter. The cold sender signs off too.", cold: { text: "STATIC", name: "The cold sender's name" } },
        { text: "You can only read the first letter." },
        { text: "Who is S?", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  3: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn T and A",
      lines: [
        { text: "9:58 PM.", style: "stamp" },
        { text: "S. The cold sender's name starts with S. That's all you know." },
        { text: "You turn the radio down low and keep listening." },
        { text: "Grandpa's codebook is open on your knees. Page three: T and A.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "T", next: "Next letter" },
    { type: "learn", symbol: "A", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "Careful: E and T are opposites. So are A and N.", items: () => singles(["T", "A", "E", "N"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Short words now, a little faster. Type every letter you hear.",
      voice: "fast",
      items: () => pickN(["AT", "TO", "ON", "TEA", "SEA", "EAT", "NOT", "ANT", "SAT", "TEN", "NOTE"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "Then the heartbeat comes back. Slow. Steady. Grandpa.", play: { text: "SEE EAST", voice: "grandpa" } },
        { text: "Two words. Can you read them?" },
      ],
    },
    { type: "decode", title: "Grandpa's clue", intro: "Type both words Grandpa sends.", message: "SEE EAST SEE EAST", answer: "SEE EAST", success: "SEE EAST. Look east!", points: 50 },
    {
      type: "story",
      scene: "hill",
      cta: "Read the light",
      lines: [
        { text: "East! You run to the window that faces east." },
        { text: "Past the dark rooftops, the old radio tower stands on the hill. Nobody has used it in years." },
        { text: "But right at the very top, a tiny light is blinking.", fx: "towerBlink" },
        { text: "Short flashes. Long flashes. Someone up there is sending Morse with a torch." },
      ],
    },
    {
      type: "decode",
      title: "The tower light",
      intro: "Watch the light at the top of the tower. Type what it flashes.",
      mode: "light",
      view: "hill",
      source: "tower",
      message: "SOS SOS",
      answer: "SOS",
      success: "SOS! Someone on the tower needs help.",
      points: 50,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Finish Day 3",
      lines: [
        { text: "Is that Grandpa up there? What would he be doing on an old tower in the middle of a blackout?" },
        { text: "The tower light goes out.", fx: "towerOff" },
        { text: "Then your radio crackles. The cold sender again.", scene: "radio", cold: { text: "STATIC", name: "The cold sender's name" } },
        { text: "S, T, A, T... The name is getting clearer." },
        { text: "And now there's another sound: footsteps, coming up the stairs of your building.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  4: [
    {
      type: "story",
      scene: "door",
      cta: "Learn I and M",
      lines: [
        { text: "10:09 PM.", style: "stamp" },
        { text: "Knock, knock, knock.", fx: "knock" },
        { text: "You hold your breath. Then a friendly voice: \"Only me! Mr. Pike, the caretaker.\"" },
        { text: "Mr. Pike looks after your building. He's brought candles for everyone.", fx: "candle" },
        { text: "\"Where's your Grandpa?\" he asks. \"Out,\" you say. \"Back soon.\"" },
        { text: "While he lights a candle, he drums his fingers on the table, fast and sharp. And he whistles a tune you've never heard.", fx: "drum" },
        { text: "Then he's gone, and it's just you and the radio again." },
        { text: "Grandpa's codebook, page four: I and M.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "I", next: "Next letter" },
    { type: "learn", symbol: "M", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "I is E twice. M is T twice. Count the beeps.", items: () => singles(["I", "M", "E", "T"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Short words, a little faster. Type every letter.",
      voice: "fast",
      items: () => pickN(["SIT", "MAN", "TIME", "MOON", "MIST", "NAME", "SAME", "MEAT", "AIM", "MINT"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Read the light",
      lines: [
        { text: "The tower light is back, blinking through the dark.", fx: "towerBlink" },
        { text: "Slow. Steady. Like a heartbeat." },
      ],
    },
    {
      type: "decode",
      title: "The tower light",
      intro: "The light flashes three short words. Type them all.",
      mode: "light",
      view: "hill",
      source: "tower",
      message: "IT IS ME",
      answer: "IT IS ME",
      success: "IT IS ME. It's Grandpa!",
      points: 60,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Flash back",
      lines: [
        { text: "It's Grandpa! He's at the top of the old radio tower." },
        { text: "Anyone can listen to a radio. But only Grandpa can see your window. So you answer with a torch." },
      ],
    },
    { type: "reply", title: "Answer with your torch", intro: "Flash SEEN to Grandpa, so he knows you've seen him.", view: "torch", target: "SEEN", points: 50 },
    {
      type: "story",
      scene: "hill",
      cta: "Finish Day 4",
      lines: [
        { text: "The tower light blinks twice. He saw you!", fx: "towerBlink" },
        { text: "Then your radio crackles. The cold sender.", scene: "radio", cold: { text: "STATIC", name: "The cold sender's name" } },
        { text: "S, T, A, T, I, and one letter you don't know yet." },
        { text: "Downstairs, a door slams.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  5: [
    {
      type: "story",
      scene: "hill",
      cta: "Learn R and D",
      lines: [
        { text: "10:21 PM.", style: "stamp" },
        { text: "Grandpa is on top of the old radio tower. But why?" },
        { text: "Grandpa's codebook, page five: R and D. With these, you can spell RADIO.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "R", next: "Next letter" },
    { type: "learn", symbol: "D", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "Where's the long beep? R has it in the middle. D starts with it. A ends with it.", items: () => singles(["R", "D", "A", "N"], 12), points: 10 },
    {
      type: "drill",
      title: "Words",
      intro: "Real words now. Type every letter you hear.",
      items: () => pickN(["RED", "ROAD", "DARE", "STAR", "DREAM", "TRAIN", "STORM", "DIRT", "SIDE"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "The heartbeat again. Grandpa has more to tell you.", play: { text: "RADIO ROOM", voice: "grandpa" } }],
    },
    {
      type: "decode",
      title: "Where is Grandpa?",
      intro: "Type both words.",
      message: "RADIO ROOM RADIO ROOM",
      answer: "RADIO ROOM",
      success: "RADIO ROOM. Grandpa is in the old radio room at the top of the tower.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "The radio room: a little room right at the top of the tower, full of old radio machines." },
        { text: "The radio clicks again. Faster this time. Grandpa sounds worried.", play: { text: "MEN AT DOOR", voice: "fast" } },
      ],
    },
    {
      type: "decode",
      title: "Grandpa's warning",
      intro: "Three words. Type them all.",
      message: "MEN AT DOOR MEN AT DOOR",
      answer: "MEN AT DOOR",
      success: "MEN AT DOOR. Someone is outside Grandpa's door!",
      points: 60,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Finish Day 5",
      lines: [
        { text: "Men at his door. Grandpa isn't alone up there.", tone: "cold" },
        { text: "Who are they? What would anyone want with an old radio tower?" },
        { text: "The tower light blinks once. Then it goes dark.", fx: "towerOff" },
        { text: "You stare at the black shape of the tower and wait. Nothing." },
        { text: "Then, very faintly, the cold sender signs off again.", scene: "radio", cold: { text: "STATIC", name: "The cold sender's name" } },
      ],
    },
    { type: "results" },
  ],

  6: [
    {
      type: "story",
      scene: "hill",
      cta: "Learn H and U",
      lines: [
        { text: "10:38 PM.", style: "stamp" },
        { text: "The tower stays dark. Your heart is thumping." },
        { text: "Then the light comes back on. Grandpa is OK!", fx: "towerBlink" },
        { text: "Grandpa's codebook, page six: H and U.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "H", next: "Next letter" },
    { type: "learn", symbol: "U", next: "Start practising" },
    { type: "drill", title: "Count the beeps", intro: "H has four short beeps. S has three. I has two. Count carefully.", items: () => singles(["H", "S", "I", "U"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Words with H and U. Type every letter.",
      voice: "fast",
      items: () => pickN(["HE", "SHE", "HUT", "OUT", "HUNT", "HOME", "HURT", "RUN", "SOUTH", "NORTH", "SUN"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "Grandpa's heartbeat fist. One long word, sent twice.", play: { text: "MOONSTONE", voice: "grandpa" } }],
    },
    { type: "decode", title: "What do they want?", intro: "Type the word Grandpa sends.", message: "MOONSTONE MOONSTONE", answer: "MOONSTONE", success: "MOONSTONE!", points: 60 },
    {
      type: "story",
      scene: "museum",
      cta: "Decode it",
      lines: [
        { text: "The Moonstone: the giant blue diamond at the City Museum. Everybody knows it." },
        { text: "And with the power off, the museum's cameras and alarms are off too." },
        { text: "So that's the plan. Switch off the whole city. Steal the Moonstone in the dark.", tone: "cold" },
        { text: "Grandpa sends one more message, quick and urgent.", scene: "radio", play: { text: "SHUT THE DOOR", voice: "fast" } },
      ],
    },
    {
      type: "decode",
      title: "Grandpa's order",
      intro: "Three words. Type them all.",
      message: "SHUT THE DOOR SHUT THE DOOR",
      answer: "SHUT THE DOOR",
      success: "SHUT THE DOOR. Lock your front door!",
      points: 60,
    },
    {
      type: "story",
      scene: "door",
      cta: "Finish Day 6",
      lines: [
        { text: "Shut the door? Why? Who would come to your door?" },
        { text: "You run to the front door.", cta: "Lock the door" },
        { text: "Click. The bolt slides across. Locked.", fx: "lock" },
        { text: "On the radio, the cold sender: fast, sharp and cold.", scene: "radio", cold: { text: "STATIC", name: "The cold sender's name" } },
        { text: "One more letter to learn, and you'll know their name.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  7: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn C and K",
      lines: [
        { text: "10:55 PM.", style: "stamp" },
        { text: "S, T, A, T, I and one more letter. The cold sender's name is almost yours." },
        { text: "Grandpa's codebook, page seven: C and K. The last page of the first chapter.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "C", next: "Next letter" },
    { type: "learn", symbol: "K", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "C and K both start long, short, long. C has one more short beep at the end.", items: () => singles(["C", "K", "R", "N"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Words with C and K. Type every letter.",
      voice: "fast",
      items: () => pickN(["CAT", "KIT", "ROCK", "DUCK", "CODE", "CAKE", "DOCK", "TRUCK", "SECRET", "KNOCK", "CHAIN"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "There it is again: the cold sender's name. This time, every letter is in your codebook.", play: { text: "STATIC", voice: "cold" } }],
    },
    {
      type: "decode",
      title: "The name",
      intro: "The name is sent again, more slowly. Type it.",
      voice: "coldSlow",
      message: "STATIC STATIC",
      answer: "STATIC",
      success: "STATIC. The cold sender calls himself The Static.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "The Static. Like the crackle on a radio when there's nothing there.", tone: "cold" },
        { text: "Then the heartbeat. Grandpa, slow and serious.", play: { text: "TRUST NO ONE", voice: "grandpa" } },
      ],
    },
    {
      type: "decode",
      title: "Grandpa's warning",
      intro: "Three words. Type them all.",
      message: "TRUST NO ONE TRUST NO ONE",
      answer: "TRUST NO ONE",
      success: "TRUST NO ONE.",
      points: 60,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Flash back",
      lines: [
        { text: "Trust no one. Not even people you know?" },
        { text: "Let Grandpa know you understand. Radio operators say OK too." },
      ],
    },
    { type: "reply", title: "Send OK", intro: "Flash OK to the tower with your torch.", view: "torch", target: "OK", points: 40 },
    {
      type: "story",
      scene: "hill",
      cta: "Finish Day 7",
      lines: [
        { text: "The tower light blinks back. Message received.", fx: "towerBlink" },
        { text: "Down on the dark street, a van rolls past with its lights off.", scene: "city", fx: "van" },
        { text: "It turns toward the river. Toward the City Museum.", tone: "cold" },
        { text: "End of Act 1: The Dark.", style: "stamp" },
      ],
    },
    { type: "results" },
  ],

  8: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn L and W",
      lines: [
        { text: "Act 2: The Static. 11:14 PM.", style: "stamp" },
        { text: "KSSSSHHHHH! A roar of noise floods the radio.", fx: "jam" },
        { text: "The Static is jamming: blasting noise so nobody can hear anything." },
        { text: "But Grandpa's codebook has an answer.", scene: "codebook" },
        { text: "Listen for the beeps, not the noise.", style: "letter" },
        { text: "Page eight: L and W." },
      ],
    },
    { type: "learn", symbol: "L", next: "Next letter" },
    { type: "learn", symbol: "W", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "W and R start the same way: short, long. Is the last beep long or short?", items: () => singles(["L", "W", "R", "A"], 12), points: 10 },
    {
      type: "drill",
      title: "Through the noise",
      intro: "The Static is jamming. Listen for the beeps under the crackle.",
      noise: 0.06,
      items: () => singles(["L", "W", "S", "O", "E", "T", "H", "U"], 10),
      points: 15,
    },
    {
      type: "story",
      scene: "street",
      cta: "Read her torch",
      lines: [{ text: "Across the street, Zoya's torch is flashing. Noise can't jam a torch!", fx: "zoyaBlink" }],
    },
    {
      type: "drill",
      title: "Torch talk",
      intro: "Read Zoya's torch. Type each letter or word.",
      mode: "light",
      view: "street",
      source: "zoya",
      items: () => [...singles(["L", "W"], 3), "LOW", "OWL", "WALL"],
      points: 10,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "Under the noise, something slow and steady. Grandpa is still sending!", play: { text: "HOLD ON", voice: "grandpa", noise: 0.05 } }],
    },
    {
      type: "decode",
      title: "Through the storm",
      intro: "Listen through the noise. Type both words.",
      noise: 0.05,
      message: "HOLD ON HOLD ON",
      answer: "HOLD ON",
      success: "HOLD ON. Grandpa says stay strong.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 8",
      lines: [
        { text: "Hold on. You will." },
        { text: "The noise stops. Silence. Too much silence." },
        { text: "Then The Static sends three words, fast and cold.", cold: { text: "WE WATCH YOU", name: "The Static's message" } },
        { text: "We watch... something. One letter is still a mystery.", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  9: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn G and P",
      lines: [
        { text: "11:32 PM.", style: "stamp" },
        { text: "The radio is quiet. Too quiet." },
        { text: "Grandpa's codebook, page nine: G and P. Now you can spell GRANDPA.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "G", next: "Next letter" },
    { type: "learn", symbol: "P", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "G is M plus a short beep. P is W plus a short beep.", items: () => singles(["G", "P", "M", "W"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Words with G and P. Type every letter.",
      voice: "fast",
      items: () => pickN(["GO", "UP", "PIG", "GAP", "PEG", "HELP", "STOP", "GATE", "GRID", "PLAN"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "Click. A message starts with a word you can finally read: GRANDPA.", play: { text: "GRANDPA HERE", voice: "fake" } },
        { text: "Then three more words." },
      ],
    },
    {
      type: "decode",
      title: "A new message",
      intro: "Type the three words that came after GRANDPA HERE.",
      voice: "fakeSlow",
      message: "GO TO PARK GO TO PARK",
      answer: "GO TO PARK",
      success: "GO TO PARK.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Read her torch",
      lines: [
        { text: "Go to the park? In the dark? On your own?" },
        { text: "Something feels wrong. Grandpa taps slow and steady. Those beeps were rushed and choppy." },
        { text: "Across the street, Zoya is flashing her torch like crazy.", scene: "street", fx: "zoyaBlink" },
      ],
    },
    {
      type: "decode",
      title: "Zoya's warning",
      intro: "Read Zoya's torch. Type all three words.",
      mode: "light",
      view: "street",
      source: "zoya",
      message: "DO NOT GO",
      answer: "DO NOT GO",
      success: "DO NOT GO. Zoya doesn't trust it either.",
      points: 60,
    },
    {
      type: "story",
      scene: "codebook",
      cta: "Finish Day 9",
      lines: [
        { text: "Zoya got the message too, and she doesn't believe it." },
        { text: "You check Grandpa's note again." },
        { text: "You'll know it's me. I tap slow and steady, like a heartbeat.", style: "letter" },
        { text: "So who sent the park message?", scene: "radio", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  10: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn F and Y",
      lines: [
        { text: "11:51 PM.", style: "stamp" },
        { text: "Two messages. Both say they're from Grandpa. One of them is lying." },
        { text: "Every radio operator taps in their own way, like handwriting. It's called their fist." },
        { text: "Grandpa's codebook, page ten: F and Y. F for fist. Y for you.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "F", next: "Next letter" },
    { type: "learn", symbol: "Y", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "F and L are mirror images. Y is K with one more long beep.", items: () => singles(["F", "Y", "L", "K"], 12), points: 10 },
    {
      type: "choice",
      title: "Real or fake?",
      intro: "Don't listen to the words. Listen to the rhythm. Slow and steady is Grandpa. Rushed and choppy is a fake.",
      items: () => fistItems(8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Check it",
      lines: [{ text: "A new message arrives on the radio. Is it really Grandpa?" }],
    },
    {
      type: "choice",
      title: "Who sent it?",
      intro: "Listen to the rhythm, then choose.",
      items: () => [{ text: "STAY HOME", voice: "grandpa", answer: "Grandpa", options: ["Grandpa", "Fake"] }],
      points: 20,
    },
    {
      type: "decode",
      title: "The real message",
      intro: "It's really Grandpa. Type his message.",
      message: "STAY HOME STAY HOME",
      answer: "STAY HOME",
      success: "STAY HOME. That's the real Grandpa.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 10",
      lines: [
        { text: "Stay home. You'd know that heartbeat anywhere." },
        { text: "So the park message was a fake. Someone wanted you outside, alone, in the dark.", tone: "cold" },
        { text: "And now you can read every letter of The Static's warning.", cold: { text: "WE WATCH YOU", name: "The Static's message" } },
        { text: "We watch you.", tone: "cold" },
        { text: "Then: footsteps in the corridor. They stop outside your door.", scene: "door", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  11: [
    {
      type: "story",
      scene: "door",
      cta: "Learn B and V",
      lines: [
        { text: "12:13 AM.", style: "stamp" },
        { text: "Knock, knock, knock.", fx: "knock" },
        { text: "\"It's Mr. Pike!\" says the friendly voice. \"Your Grandpa sent me. He's waiting at the park. Come with me.\"" },
        { text: "The park. The fake message said the park too." },
        { text: "You don't open the door. Shut the door, Grandpa said. Trust no one." },
        { text: "While Mr. Pike waits outside, you open the codebook. Page eleven: B and V.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "B", next: "Next letter" },
    { type: "learn", symbol: "V", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "B is long, then three short. V is three short, then long. D and U are their little cousins.", items: () => singles(["B", "V", "D", "U"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Words with B and V. Type every letter.",
      voice: "fast",
      items: () => pickN(["VAN", "BOAT", "BEEP", "OVER", "BLUE", "BRAVE", "VOICE", "SILVER", "BELL", "VIEW"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "door",
      cta: "Decode it",
      lines: [
        { text: "Outside, Mr. Pike starts to whistle while he waits.", play: { text: "STATIC", voice: "whistle", source: "door" } },
        { text: "Short whistles and long whistles. Fast and sharp." },
        { text: "Wait. That's not a tune. That's Morse code!" },
      ],
    },
    {
      type: "decode",
      title: "The whistle",
      intro: "Here's the whistle again, more slowly. Type what he's whistling.",
      voice: "whistleSlow",
      view: "door",
      source: "door",
      message: "STATIC STATIC",
      answer: "STATIC",
      success: "STATIC. Mr. Pike is The Static!",
      points: 70,
    },
    {
      type: "story",
      scene: "door",
      cta: "Finish Day 11",
      lines: [
        { text: "Mr. Pike is The Static.", tone: "cold" },
        { text: "The friendly caretaker with the candles. He sent the fake message. He wanted you to go to the park, alone." },
        { text: "\"Suit yourself,\" he says. His footsteps go back down the stairs." },
        { text: "Then, in the corridor, you hear his pocket radio. He's sending an order.", cold: { text: "JAM ALL RADIOS", name: "The Static's order", source: "door" } },
        { text: "Something ALL RADIOS. What is he planning now?", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  12: [
    {
      type: "story",
      scene: "radio",
      cta: "Learn J and Q",
      lines: [
        { text: "12:34 AM.", style: "stamp" },
        { text: "Something ALL RADIOS. You need to know the first word." },
        { text: "Grandpa's codebook, page twelve: J and Q. Only four letters left.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "J", next: "Next letter" },
    { type: "learn", symbol: "Q", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "J starts short. Q, Y and G start long. Listen to how each one ends.", items: () => singles(["J", "Q", "Y", "G"], 12), points: 10 },
    {
      type: "drill",
      title: "Faster",
      intro: "Words with J and Q. Type every letter.",
      voice: "fast",
      items: () => pickN(["JET", "JOG", "JUMP", "JOKE", "QUEEN", "QUIET", "EQUAL", "QUIT"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "The Static sends his order again, to his whole gang.", play: { text: "JAM ALL RADIOS", voice: "cold" } }],
    },
    {
      type: "decode",
      title: "The order",
      intro: "Slowed down. Type all three words.",
      voice: "coldSlow",
      message: "JAM ALL RADIOS",
      answer: "JAM ALL RADIOS",
      success: "JAM ALL RADIOS. Soon no radio in the city will work.",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [{ text: "Before the jamming starts, one last heartbeat squeezes through. Grandpa!", play: { text: "QUICK GO UP", voice: "grandpa", noise: 0.04 } }],
    },
    {
      type: "decode",
      title: "Grandpa's last message",
      intro: "The noise is starting. Listen hard and type all three words.",
      noise: 0.05,
      message: "QUICK GO UP QUICK GO UP",
      answer: "QUICK GO UP",
      success: "QUICK. GO UP. Up to the roof!",
      points: 60,
    },
    {
      type: "story",
      scene: "radio",
      cta: "Finish Day 12",
      lines: [
        { text: "KSSSSHHHHH! The radio roars. Then nothing works at all.", fx: "jam" },
        { text: "No phone. No internet. And now, no radio." },
        { text: "Go up. To the roof, where you can see the whole city." },
        { text: "You grab Grandpa's torch and his codebook, and climb the dark stairs. Quietly.", scene: "roof" },
      ],
    },
    { type: "results" },
  ],

  13: [
    {
      type: "story",
      scene: "roof",
      cta: "Learn X and Z",
      lines: [
        { text: "1:02 AM.", style: "stamp" },
        { text: "The roof door creaks open. Cold wind. Stars everywhere. The whole city is dark." },
        { text: "Across the street, on her own roof, a torch clicks on. Zoya!", fx: "zoyaBlink" },
        { text: "And far to the east, the tower light still blinks. Grandpa.", fx: "towerBlink" },
        { text: "Grandpa's codebook: the last page of letters. X and Z.", scene: "codebook" },
      ],
    },
    { type: "learn", symbol: "X", next: "Next letter" },
    { type: "learn", symbol: "Z", next: "Start practising" },
    { type: "drill", title: "Which one?", intro: "X and B both start long, short, short. X ends long. Z starts with two long beeps.", items: () => singles(["X", "Z", "B", "G"], 12), points: 10 },
    { type: "drill", title: "All 26", intro: "You know every letter now! Here's the whole alphabet, mixed up.", items: () => singles(shuffle(LETTERS), 14), points: 15 },
    {
      type: "story",
      scene: "roof",
      cta: "Flash her name",
      lines: [{ text: "Zoya waves her torch. She wants to know you're OK.", fx: "zoyaBlink" }],
    },
    { type: "reply", title: "Call Zoya", intro: "Flash her name with your torch. Now you know every letter in it.", view: "torch", target: "ZOYA", points: 50 },
    {
      type: "story",
      scene: "roof",
      cta: "Read the red light",
      lines: [
        { text: "Then you see something else. A red light, flashing on a rooftop to the north.", fx: "crewBlink" },
        { text: "The Static jammed every radio in the city. Even his own gang's! Now they have to talk with lights." },
        { text: "And you can read every single letter." },
      ],
    },
    {
      type: "decode",
      title: "The red light",
      intro: "Read the gang's red light. Type both words.",
      mode: "light",
      view: "roof",
      source: "crew",
      message: "ZERO HOUR ZERO HOUR",
      answer: "ZERO HOUR",
      success: "ZERO HOUR: the moment their plan begins.",
      points: 60,
    },
    {
      type: "story",
      scene: "roof",
      cta: "Finish Day 13",
      lines: [
        { text: "Zero hour. The moment the gang's plan begins. But when?" },
        { text: "The red light flashes once more.", cold: { text: "AT 5", name: "Zero hour", source: "crew" } },
        { text: "A number. You don't know numbers yet. Neither does Zoya." },
        { text: "But Grandpa's codebook has one more chapter: Numbers.", scene: "codebook" },
      ],
    },
    { type: "results" },
  ],

  14: [
    {
      type: "story",
      scene: "roof",
      cta: "See the pattern",
      lines: [
        { text: "1:37 AM.", style: "stamp" },
        { text: "Zero hour is at a number. You need to read it." },
        { text: "Grandpa's codebook, chapter two: Numbers.", scene: "codebook" },
        { text: "Numbers are the easiest of all. They follow a pattern.", style: "letter" },
      ],
    },
    { type: "learnSet", title: "Count the short beeps", intro: "Every number has five beeps. For 1 to 5, count the short beeps at the start. That's the number!", symbols: ["1", "2", "3", "4", "5"] },
    { type: "drill", title: "Which number?", intro: "Count the short beeps before the long ones.", items: () => singles(["1", "2", "3", "4", "5"], 12), points: 10 },
    { type: "drill", title: "Count carefully", intro: "5 has five short beeps. H has four. S has three. Don't mix them up!", items: () => singles(["5", "H", "S", "4", "V"], 10), points: 15 },
    {
      type: "story",
      scene: "roof",
      cta: "Read the red light",
      lines: [{ text: "The red light on the north roof flashes again.", fx: "crewBlink" }],
    },
    {
      type: "decode",
      title: "Zero hour",
      intro: "Read the red light. Type the word and the number.",
      mode: "light",
      view: "roof",
      source: "crew",
      message: "AT 5 AT 5",
      answer: "AT 5",
      success: "AT 5. Zero hour is five o'clock!",
      points: 60,
    },
    {
      type: "story",
      scene: "hill",
      cta: "Read the tower",
      lines: [
        { text: "Five o'clock. Just before sunrise. That's when they'll steal the Moonstone." },
        { text: "Then the tower light flashes. Grandpa is sending numbers too.", fx: "towerBlink" },
      ],
    },
    {
      type: "decode",
      title: "Grandpa's count",
      intro: "Read Grandpa's light. Type everything, numbers too.",
      mode: "light",
      view: "hill",
      source: "tower",
      message: "4 MEN 1 VAN",
      answer: "4 MEN 1 VAN",
      success: "Four men. One van.",
      points: 60,
    },
    {
      type: "story",
      scene: "roof",
      cta: "Finish Day 14",
      lines: [
        { text: "Four men. One van. Zero hour at five." },
        { text: "It's 1:37. Less than four hours to go." },
        { text: "You have to warn the police. But how, with every radio jammed?" },
        { text: "Across the street, Zoya flashes her torch. She has an idea.", fx: "zoyaBlink" },
      ],
    },
    { type: "results" },
  ],

  15: [
    {
      type: "story",
      scene: "relay",
      cta: "Learn the rest",
      lines: [
        { text: "Act 3: Lights On. 2:16 AM.", style: "stamp" },
        { text: "Zoya's idea: a light relay! Torch to torch, rooftop to rooftop, all the way to the police station by the river.", fx: "relay" },
        { text: "But first, the rest of Grandpa's numbers.", scene: "codebook" },
        { text: "After 5, the pattern flips. Now the long beeps come first.", style: "letter" },
      ],
    },
    { type: "learnSet", title: "The pattern flips", intro: "For 6 to 9, count the long beeps and add 5. Zero is five long beeps.", symbols: ["6", "7", "8", "9", "0"] },
    { type: "drill", title: "Which number?", intro: "Count the long beeps at the start.", items: () => singles(["6", "7", "8", "9", "0"], 12), points: 10 },
    { type: "drill", title: "All ten", intro: "Every number, mixed up.", items: () => singles(shuffle(DIGITS), 12), points: 15 },
    {
      type: "story",
      scene: "hill",
      cta: "Read the tower",
      lines: [{ text: "Grandpa's tower light flashes a long number. Twice.", fx: "towerBlink" }],
    },
    {
      type: "decode",
      title: "Grandpa's number",
      intro: "Read the tower light. Type the number.",
      mode: "light",
      view: "hill",
      source: "tower",
      message: "7080 7080",
      answer: "7080",
      success: "7080. A radio frequency!",
      points: 60,
    },
    {
      type: "story",
      scene: "codebook",
      cta: "Repeat it back",
      lines: [
        { text: "7080. There's a note about it in the margin of Grandpa's codebook." },
        { text: "7080: the old emergency radio at the power station. I built it years ago.", style: "letter" },
        { text: "If the city ever loses power, the right Morse message on 7080 can switch it back on.", style: "letter" },
        { text: "The Static hacked the power station's computers. But he doesn't know about Grandpa's old radio!" },
        { text: "Radio operators always repeat numbers back, to be sure they got them right.", scene: "hill" },
      ],
    },
    { type: "reply", title: "Repeat it back", intro: "Flash 7080 to Grandpa with your torch.", view: "torch", target: "7080", points: 60 },
    {
      type: "story",
      scene: "relay",
      cta: "Finish Day 15",
      lines: [
        { text: "The tower blinks back. Correct!", scene: "hill", fx: "towerBlink" },
        { text: "Then, one by one, torches switch on across the rooftops between you and the river.", scene: "relay", fx: "relay" },
        { text: "Zoya has woken up the whole street!" },
        { text: "The relay is ready. Now you have to reach the police." },
      ],
    },
    { type: "results" },
  ],

  16: [
    {
      type: "story",
      scene: "relay",
      cta: "Learn punctuation",
      lines: [
        { text: "2:58 AM.", style: "stamp" },
        { text: "Your roof. Zoya's roof. The bakery. The clock shop. The bridge. Five torches, all the way to the river.", fx: "relay" },
        { text: "Then, from the police station on the other side, a blue light flashes back!", fx: "policeBlink" },
        { text: "The police are asking questions. To read them, you need Morse punctuation.", scene: "codebook" },
      ],
    },
    { type: "learnSet", title: "Punctuation", intro: "These are long, but each one has its own rhythm. Listen to each one.", symbols: [".", ",", "?", "/"] },
    { type: "drill", title: "Which one?", intro: "Full stop, comma, question mark or slash?", items: () => singles([".", ",", "?", "/"], 10), points: 10 },
    {
      type: "story",
      scene: "relay",
      cta: "Read the blue light",
      lines: [{ text: "The blue light flashes. The relay passes it along, torch to torch, all the way to you.", fx: "policeBlink" }],
    },
    {
      type: "decode",
      title: "The first question",
      intro: "Read the police light. Type the words and the question mark.",
      mode: "light",
      view: "relay",
      source: "police",
      message: "WHO ARE YOU?",
      answer: "WHO ARE YOU?",
      success: "WHO ARE YOU? The police want to know who's signalling.",
      points: 60,
    },
    {
      type: "story",
      scene: "relay",
      cta: "Read the blue light",
      lines: [
        { text: "Zoya flashes your codename. The relay carries it across the river.", fx: "relay" },
        { text: "Another question comes back." },
      ],
    },
    {
      type: "decode",
      title: "The second question",
      intro: "The slash means OR. Type everything.",
      mode: "light",
      view: "relay",
      source: "police",
      message: "ALARM? YES/NO",
      answer: "ALARM? YES/NO",
      success: "Is it an alarm? Yes or no?",
      points: 60,
    },
    { type: "reply", title: "Answer the police", intro: "Flash YES with your torch. The relay will carry it to the police.", view: "torch", target: "YES", points: 50 },
    {
      type: "story",
      scene: "relay",
      cta: "Finish Day 16",
      lines: [
        { text: "Torch to torch, your YES crosses the river.", fx: "relay" },
        { text: "The blue light blinks: they understood!", fx: "policeBlink" },
        { text: "Then it flashes something strange. Two letters stuck together, with no gap.", cold: { text: "<AR>", name: "A strange signal", source: "police" } },
        { text: "Not a letter. Not a number. Grandpa's codebook calls these radio rules." },
      ],
    },
    { type: "results" },
  ],

  17: [
    {
      type: "story",
      scene: "codebook",
      cta: "Learn the radio rules",
      lines: [
        { text: "3:35 AM.", style: "stamp" },
        { text: "Radio operators have special signals: two letters run together, with no gap. They're called prosigns." },
        { text: "Learn these and you'll talk like a real operator.", style: "letter" },
      ],
    },
    { type: "learnSet", title: "Radio rules", intro: "Each one is two letters run together. Listen to each one.", symbols: ["<AR>", "<BT>", "<SK>"] },
    { type: "choice", title: "What does it mean?", intro: "Listen to the signal, then choose what it means.", items: () => prosignItems(9), points: 15 },
    {
      type: "story",
      scene: "relay",
      cta: "Read the blue light",
      lines: [{ text: "The police send a proper radio message now.", fx: "policeBlink" }],
    },
    {
      type: "decode",
      title: "The police message",
      intro: "Type the words. The radio rule at the end is filled in for you.",
      mode: "light",
      view: "relay",
      source: "police",
      message: "SEND INFO <AR>",
      answer: "SEND INFO",
      success: "SEND INFO, then AR: end of message.",
      points: 60,
    },
    {
      type: "story",
      scene: "relay",
      cta: "Send it",
      lines: [
        { text: "Zoya flashes 4 MEN 1 VAN across the relay.", fx: "relay" },
        { text: "Now you send the most important part: when. End it with AR, like a real operator." },
      ],
    },
    { type: "reply", title: "Zero hour", intro: "Send AT 5, then AR to end your message.", view: "torch", target: "AT 5 <AR>", points: 60 },
    {
      type: "story",
      scene: "relay",
      cta: "Finish Day 17",
      lines: [
        { text: "The blue light flashes R. In radio, R means received.", play: { text: "R", voice: "police", source: "police", reveal: true } },
        { text: "Then: WILL SEND CARS. And SK: over and out.", play: { text: "WILL SEND CARS <SK>", voice: "police", source: "police", reveal: true } },
        { text: "The police are coming!" },
        { text: "But on the north roof, the red light starts flashing faster. Much faster.", scene: "roof", fx: "crewBlink" },
      ],
    },
    { type: "results" },
  ],

  18: [
    {
      type: "story",
      scene: "roof",
      cta: "Train your ears",
      lines: [
        { text: "4:12 AM.", style: "stamp" },
        { text: "The gang's red light flashes so fast that reading letter by letter is too slow.", fx: "crewBlink" },
        { text: "Fast operators don't hear letters. They hear whole words, the way you read whole words without spelling them.", scene: "codebook", style: "letter" },
      ],
    },
    { type: "choice", title: "Which word?", intro: "Listen to the whole word. Don't spell it, just hear its shape.", voice: "fast", items: () => wordChoiceItems(10), points: 15 },
    {
      type: "drill",
      title: "Word shapes",
      intro: "Now type the words you hear.",
      voice: "fast",
      items: () => pickN(["THE", "AND", "YOU", "GO", "NOW", "VAN", "STOP", "HELP", "COME", "RUN", "YES", "NO"], 10),
      points: 15,
    },
    {
      type: "story",
      scene: "roof",
      cta: "Read the red light",
      lines: [{ text: "Now read the gang's light at full speed.", fx: "crewBlink" }],
    },
    {
      type: "decode",
      title: "The gang's plan",
      intro: "Read the red light. Type everything.",
      mode: "light",
      view: "roof",
      source: "crew",
      voice: "crewFast",
      message: "VAN READY GO AT 5",
      answer: "VAN READY GO AT 5",
      success: "The van is ready. They go at five.",
      points: 70,
    },
    {
      type: "story",
      scene: "roof",
      cta: "Finish Day 18",
      lines: [
        { text: "4:12. The van is ready." },
        { text: "Then the red light goes out.", fx: "crewOff" },
        { text: "Down in the street, an engine starts.", scene: "city", fx: "van" },
        { text: "The van is moving. Early!", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  19: [
    {
      type: "story",
      scene: "city",
      cta: "Speed up",
      lines: [
        { text: "4:49 AM.", style: "stamp" },
        { text: "The van races through the dark streets toward the river.", fx: "van" },
        { text: "Police cars are racing too. But they're on the wrong side of the river!" },
        { text: "Messages fly across the relay, faster and faster. You need to keep up.", scene: "relay", fx: "relay" },
      ],
    },
    { type: "drill", title: "Speed run", intro: "Each round is a little faster than the one before. Keep up!", ramp: 9, items: () => singles(shuffle(LETTERS), 14), points: 15 },
    {
      type: "drill",
      title: "Fast words",
      intro: "Words at full speed. Type every letter.",
      voice: "fast",
      ramp: 6,
      items: () => pickN(["LEFT", "RIGHT", "RIVER", "SOUTH", "FAST", "TURN", "ROAD", "WEST", "PARK", "BRAKE"], 8),
      points: 15,
    },
    {
      type: "story",
      scene: "relay",
      cta: "Read the blue light",
      lines: [{ text: "The police flash a question across the river.", fx: "policeBlink" }],
    },
    {
      type: "decode",
      title: "Police question",
      intro: "Fast now. Type everything.",
      mode: "light",
      view: "relay",
      source: "police",
      voice: "fastLight",
      message: "WHICH BRIDGE?",
      answer: "WHICH BRIDGE?",
      success: "WHICH BRIDGE? Where is the van crossing?",
      points: 60,
    },
    {
      type: "story",
      scene: "roof",
      cta: "Read Zoya",
      lines: [{ text: "From her roof, Zoya can see the van's dark shape. She flashes as fast as she can.", fx: "zoyaBlink" }],
    },
    {
      type: "decode",
      title: "Zoya sees it",
      intro: "Read Zoya's torch. Type both words.",
      mode: "light",
      view: "roof",
      source: "zoya",
      voice: "fastLight",
      message: "NORTH BRIDGE",
      answer: "NORTH BRIDGE",
      success: "NORTH BRIDGE!",
      points: 60,
    },
    { type: "reply", title: "Tell the police", intro: "Flash NORTH. The relay will carry it to the police.", view: "torch", target: "NORTH", points: 60 },
    {
      type: "story",
      scene: "relay",
      cta: "Finish Day 19",
      lines: [
        { text: "Torch to torch, NORTH flies across the river.", fx: "relay" },
        { text: "The blue light: R. Received!", play: { text: "R", voice: "police", source: "police", reveal: true } },
        { text: "Then one last red light from the north roof. The gang's lookout.", scene: "roof", play: { text: "TOO LATE", voice: "crewFast", source: "crew", reveal: true } },
        { text: "Too late?", tone: "cold" },
      ],
    },
    { type: "results" },
  ],

  20: [
    {
      type: "story",
      scene: "roof",
      cta: "Practise sending",
      lines: [
        { text: "5:18 AM.", style: "stamp" },
        { text: "Zoya's torch flickers... and dies. Her batteries are flat!", fx: "zoyaOff" },
        { text: "Now it's all up to you. You'll send the messages yourself, straight to the police." },
        { text: "Sending is like dancing. Keep a steady beat.", scene: "codebook", style: "letter" },
      ],
    },
    { type: "reply", title: "Warm up", intro: "Start with the first word you ever learned.", view: "torch", target: "SOS", points: 30 },
    { type: "reply", title: "Where?", intro: "Tell the police where the gang is going.", view: "torch", target: "MUSEUM", points: 60 },
    {
      type: "story",
      scene: "relay",
      cta: "Send more",
      lines: [
        { text: "The blue light flashes R. Received!", play: { text: "R", voice: "police", source: "police", reveal: true } },
        { text: "Now tell them how many." },
      ],
    },
    { type: "reply", title: "How many?", intro: "Send 4 MEN.", view: "torch", target: "4 MEN", points: 60 },
    {
      type: "story",
      scene: "relay",
      cta: "Read the blue light",
      lines: [{ text: "The blue light flashes back. A message, with AR at the end.", fx: "policeBlink" }],
    },
    {
      type: "decode",
      title: "The police answer",
      intro: "Read the police light. Type the words.",
      mode: "light",
      view: "relay",
      source: "police",
      message: "IN POSITION <AR>",
      answer: "IN POSITION",
      success: "IN POSITION. The police are at the museum!",
      points: 60,
    },
    {
      type: "story",
      scene: "museum",
      cta: "Finish Day 20",
      lines: [
        { text: "The van pulls up outside the dark museum." },
        { text: "Four men jump out. And then a fifth: Mr. Pike.", tone: "cold" },
        { text: "Then, blue lights everywhere!", fx: "police" },
        { text: "\"POLICE! Nobody move!\"" },
      ],
    },
    { type: "results" },
  ],

  21: [
    {
      type: "story",
      scene: "museum",
      cta: "Listen",
      lines: [
        { text: "5:41 AM.", style: "stamp" },
        { text: "The museum is surrounded. The whole gang is caught. Even Mr. Pike, The Static.", fx: "police" },
        { text: "In the van, the police find his jamming machine. They switch it off." },
        { text: "For the first time in hours, the radio is quiet. Clean. Clear.", scene: "radio" },
        { text: "Then: a slow, steady heartbeat.", play: { text: "I AM SAFE", voice: "grandpa" } },
      ],
    },
    { type: "decode", title: "The heartbeat", intro: "Type Grandpa's message.", message: "I AM SAFE I AM SAFE", answer: "I AM SAFE", success: "I AM SAFE. The police got Grandpa down from the tower!", points: 60 },
    {
      type: "story",
      scene: "radio",
      cta: "Decode it",
      lines: [
        { text: "Grandpa is safe! But the city is still dark. The Static's hack is still running." },
        { text: "Grandpa sends one more message, fast, because the sun is coming up.", play: { text: "TUNE TO 7080 SEND LIGHTS ON", voice: "fast" } },
      ],
    },
    {
      type: "decode",
      title: "Beat the sunrise",
      intro: "Type Grandpa's instructions before the sun comes up. Finish in time for bonus points.",
      timer: 120,
      message: "TUNE TO 7080 SEND LIGHTS ON",
      answer: "TUNE TO 7080 SEND LIGHTS ON",
      success: "Tune to 7080. Send LIGHTS ON.",
      points: 80,
    },
    { type: "tune", title: "Tune the radio", intro: "Turn Grandpa's dial to 7080: the power station's emergency radio.", target: 7080, points: 40 },
    { type: "reply", title: "Lights on", intro: "This is it. Send LIGHTS ON to the power station.", target: "LIGHTS ON", points: 100 },
    {
      type: "story",
      scene: "radio",
      cta: "Finish the course",
      lines: [
        { text: "Your message flies across the dark city to Grandpa's old radio at the power station." },
        { text: "One second. Two. Three." },
        { text: "Then, far away, a hum. A click. Another click.", scene: "dawn" },
        { text: "Street lights flicker on. Then windows, one by one, all over the city.", fx: "lightsOn" },
        { text: "And over the river, the sun comes up.", fx: "sunrise" },
        { text: "6:00 AM. The blackout is over.", style: "stamp" },
        { text: "Later that morning, Grandpa comes home. He hugs you for a very long time." },
        { text: "\"I knew you could read me,\" he says. \"You're a real radio operator now.\"" },
        { text: "He opens the codebook to the very last page and writes one more line.", scene: "codebook" },
        { text: "To my favourite radio operator. Thank you for bringing back the light. Love, Grandpa.", style: "letter" },
        { text: "The end.", style: "stamp" },
      ],
    },
    { type: "results" },
  ],
};

// Every symbol the player knows once they've finished day n.
export function symbolsBy(n) {
  const set = new Set();
  for (const d of DAYS) if (d.n <= n) d.teach.forEach((s) => set.add(s));
  return set;
}

// The cliffhanger signals told in each day's story.
export function mysteriesFor(n) {
  const list = [];
  for (const step of SCRIPTS[n] || []) {
    if (step.type !== "story") continue;
    for (const line of step.lines) if (line.cold) list.push(line.cold);
  }
  return list;
}
