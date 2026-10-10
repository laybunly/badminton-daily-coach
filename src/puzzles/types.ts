// Puzzle schema. Court units are cm: x 0–610, y 0–1340, net at y 670, the user's half is y > 670.

export type Lang = 'de' | 'en' | 'fr';
/** Languages stored inline in the puzzle data; French comes from its own overlay (`text.fr.json`). */
export type DataLang = 'de' | 'en';
export type Level = 'beg' | 'int' | 'adv';
export type Hand = 'R' | 'L';
export type Grade = 'best' | 'good' | 'inacc' | 'mistake';
export type PlayerKey = 'Y' | 'P' | 'A' | 'B';
/** x, y in cm */
export type Pt = [number, number];
/** x, y, height in cm */
export type Pt3 = [number, number, number];
export type Bi<T> = Record<DataLang, T>;

export interface Shuttle { from: Pt3; to: Pt3; peak: number }
export interface Why { best: string; good: string }

export interface ShotOption {
  /** label */
  t: string;
  /** landing spot */
  d: Pt;
  g: Grade;
  why: string;
  /** shot kind (high, half, smash, drop, drive, push, net, block) */
  k?: string;
}

export interface Target { best: Pt; rBest: number; rGood: number }

/** Level-specific override of a step. */
export interface LevelVariant {
  best?: Pt;
  targets?: Partial<Record<PlayerKey, Pt>>;
  why?: Bi<Why>;
  /** grades per option, in data order */
  g?: Grade[];
  whys?: Bi<(string | undefined)[]>;
}

interface StepBase {
  players: Partial<Record<PlayerKey, Pt>>;
  shuttle: Shuttle;
  q: string;
  lv?: Partial<Record<Level, LevelVariant>>;
}

export interface ShotStep extends StepBase {
  type: 'shot';
  options: ShotOption[];
}

export interface PlaceStep extends StepBase {
  type: 'place';
  /** single player to place (if no targets) */
  who?: PlayerKey;
  best?: Pt;
  rBest?: number;
  rGood?: number;
  /** several players to place */
  targets?: Partial<Record<PlayerKey, Target>>;
  why: Why;
  /** shift the user's best spot toward the backhand for beginner/intermediate */
  bhY?: boolean;
}

export type Step = ShotStep | PlaceStep;

export interface Puzzle {
  id: string;
  /** undefined = hand-written doubles, 's' = singles, 't' = generated training */
  disc?: 'd' | 's' | 't';
  /** training category index into CATS */
  cat?: number;
  /** training set index 0–4 */
  set?: number;
  theme: string;
  title: string;
  rating: number;
  lesson: string;
  lvLesson?: Partial<Record<Level, Bi<string>>>;
  steps: Step[];
}

/** English overlay for one puzzle. */
export interface PuzzleText {
  theme: string;
  title: string;
  lesson: string;
  steps: ({ q: string; why?: Why; opts?: [string, string][] } | null)[];
}

/** French overlay: like the English one, plus the texts of the level variants. */
export interface PuzzleTextFr extends PuzzleText {
  lvLesson?: Partial<Record<Level, string>>;
  steps: ({ q: string; why?: Why; opts?: [string, string][]; lv?: Partial<Record<Level, { why?: Why; whys?: (string | null)[] }>> } | null)[];
}

export interface Category { k: string; de: string; en: string; fr: string; sets: [string, string, string][] }

export interface Prefs { discs: string[]; level: Level; hand: Hand; stats: boolean; set: boolean }
