const PITCH_CLASS_MAP = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export type Letter = keyof typeof PITCH_CLASS_MAP;

export interface Note {
  letter: Letter;
  octave: number;
  accidental: number;
  frequency: number;
}

export type NoteOptions = Omit<Note, 'frequency' | 'accidental'> & {
  accidental?: number;
};

const A4_HZ = 440;
const ROOT_OF_TWO = 2 ** (1 / 12);

const calculatePitchHeight = ({ letter, octave, accidental }: NoteOptions) =>
  PITCH_CLASS_MAP[letter] + (accidental ?? 0) + (octave - 4) * 12;

const calculateFrequency = (noteOptions: NoteOptions) =>
  A4_HZ * ROOT_OF_TWO ** (calculatePitchHeight(noteOptions) - 9);

export const createNote = ({
  letter,
  octave,
  accidental = 0,
}: NoteOptions): Note => {
  const note = {
    letter,
    octave,
    accidental: accidental ?? 0,
    frequency: calculateFrequency({ letter, octave, accidental }),
  };

  return note;
};
