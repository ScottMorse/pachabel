import { Note, NoteOptions, createNote } from './note';

export interface Chord {
  name: string;
  notes: Note[];
}

export interface ChordOptions {
  name: string;
  notes: NoteOptions[];
}

export interface ChordProgression {
  chords: Chord[];
}

const createChord = ({ name, notes }: ChordOptions): Chord => ({
  name,
  notes: notes.map(createNote),
});

export const createChordProgression = (
  ...chords: ChordOptions[]
): ChordProgression => ({
  chords: chords.map(createChord),
});
