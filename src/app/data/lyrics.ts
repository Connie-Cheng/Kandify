export interface LyricLine {
  time: number;
  text: string;
}

export interface SongLyrics {
  songId: number;
  lyrics: LyricLine[];
}

export const songLyrics: Record<number, LyricLine[]> = {
  1: [
    { time: 0, text: "I don't wanna lose you" },
    { time: 3, text: "I don't wanna choose" },
    { time: 6, text: "Between my heart and my mind" },
    { time: 10, text: "My love, my love, my love" },
    { time: 14, text: "She's all that I need" },
    { time: 18, text: "My love, my love, my love" },
    { time: 22, text: "She's everything to me" },
    { time: 26, text: "Late nights thinking 'bout you" },
    { time: 30, text: "Can't get you off my mind" },
    { time: 34, text: "Every moment without you" },
    { time: 38, text: "Feels like wasted time" },
    { time: 42, text: "My love, my love, my love" },
    { time: 46, text: "You're all I see" },
    { time: 50, text: "My love, my love, my love" },
    { time: 54, text: "Come back to me" },
  ],
  100: [
    { time: 0, text: "I don't wanna lose you" },
    { time: 3, text: "I don't wanna choose" },
    { time: 6, text: "Between my heart and my mind" },
    { time: 10, text: "My love, my love, my love" },
    { time: 14, text: "She's all that I need" },
    { time: 18, text: "My love, my love, my love" },
    { time: 22, text: "She's everything to me" },
    { time: 26, text: "Late nights thinking 'bout you" },
    { time: 30, text: "Can't get you off my mind" },
    { time: 34, text: "Every moment without you" },
    { time: 38, text: "Feels like wasted time" },
    { time: 42, text: "My love, my love, my love" },
    { time: 46, text: "You're all I see" },
    { time: 50, text: "My love, my love, my love" },
    { time: 54, text: "Come back to me" },
  ],
  101: [
    { time: 0, text: "Used to think I was adorable" },
    { time: 4, text: "A perfect little doll" },
    { time: 8, text: "But something's changed inside me" },
    { time: 12, text: "I'm not cute anymore" },
    { time: 16, text: "Breaking out of this shell" },
    { time: 20, text: "Not your baby anymore" },
    { time: 24, text: "Watch me transform" },
    { time: 28, text: "Into something real" },
    { time: 32, text: "Not cute anymore" },
    { time: 36, text: "I'm finding my edge" },
    { time: 40, text: "Not playing nice" },
    { time: 44, text: "Not holding back" },
    { time: 48, text: "Not cute anymore" },
    { time: 52, text: "This is who I am" },
  ],
  102: [
    { time: 0, text: "I bet on losing dogs" },
    { time: 4, text: "I know they're losing and I'll pay for my place" },
    { time: 9, text: "By the ring" },
    { time: 12, text: "Where I'll be looking in their eyes when they're down" },
    { time: 17, text: "I'll be there on their side" },
    { time: 21, text: "I'm losing by their side" },
    { time: 26, text: "Will you let me, baby, lose" },
    { time: 30, text: "On losing dogs" },
    { time: 34, text: "I know they're losing and I'll pay for my place" },
    { time: 39, text: "By the ring" },
    { time: 42, text: "Where I'll be looking in their eyes when they're down" },
    { time: 47, text: "I wanna feel it" },
    { time: 51, text: "I bet on losing dogs" },
    { time: 55, text: "I always want you when I'm finally fine" },
  ],
};
