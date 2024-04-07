import { Button, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Chord, createChordProgression } from './music/chord';
import { useCallback, useRef, useState } from 'react';

const PROGRESSION = createChordProgression(
  {
    name: 'D',
    notes: [
      { letter: 'D', octave: 4 },
      { letter: 'F', octave: 4, accidental: 1 },
      { letter: 'A', octave: 4 },
    ],
  },
  {
    name: 'Gm',
    notes: [
      { letter: 'G', octave: 4 },
      { letter: 'B', octave: 4, accidental: -1 },
      { letter: 'D', octave: 5 },
    ],
  }
);

export function App() {
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const cleanupRef = useRef<() => void>();

  const ENVELOPE_QUARTER_VALUE = 0.25;

  const play = useCallback(async () => {
    const context = new AudioContext();

    let time = context.currentTime;
    const passTime = (quarterNoteCount: number) => {
      time = time + calcQuarterSeconds(quarterNoteCount);
      return time;
    };

    let activeOscillators: { oscillator: OscillatorNode; gain: GainNode }[] =
      [];

    cleanupRef.current = () => {
      activeOscillators.forEach(({ oscillator, gain }) => {
        const stopTime = context.currentTime + ENVELOPE_QUARTER_VALUE;
        gain.gain.linearRampToValueAtTime(0, stopTime);
        oscillator.stop(stopTime);
        oscillator.onended = () => {
          setCurrentChord(null);
          context.close();
        };
      });
    };

    const bpm = 100;
    const calcQuarterSeconds = (count: number) => (60 / bpm) * count;

    setCurrentChord(PROGRESSION.chords[0]);

    while (context.state === 'running') {
      // eslint-disable-next-line no-loop-func
      await new Promise((res) =>
        PROGRESSION.chords.forEach((chord, chordIndex) => {
          const initialTime = time;
          const envelopeStartTime = passTime(ENVELOPE_QUARTER_VALUE);
          const envelopeEndTime = passTime(0.75);
          const stopTime = passTime(ENVELOPE_QUARTER_VALUE);

          activeOscillators = [];
          chord.notes.forEach(({ frequency }) => {
            const gain = new GainNode(context, { gain: -1 });

            gain.gain.linearRampToValueAtTime(
              1 / chord.notes.length,
              envelopeStartTime
            );
            gain.gain.linearRampToValueAtTime(0, envelopeEndTime);

            const oscillator = new OscillatorNode(context, { frequency });
            oscillator.start(initialTime);
            oscillator.stop(stopTime);
            oscillator.onended = () =>
              res(
                setCurrentChord(
                  PROGRESSION.chords[chordIndex + 1] ?? PROGRESSION.chords[0]
                )
              );

            activeOscillators.push({ oscillator, gain });
            oscillator.connect(gain);
            gain.connect(context.destination);
          });
        })
      );
    }
  }, []);

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
      <CssBaseline />
      <div>{currentChord?.name ?? ''}</div>
      <Button onClick={currentChord ? cleanupRef.current : play}>
        {currentChord ? 'Stop' : 'Play'}
      </Button>
    </ThemeProvider>
  );
}

export default App;
