import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';

type SourceExercise = {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instruction_steps: { en: string[] };
};

async function main() {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Exercise download failed: ${response.status}`);
  const raw = (await response.json()) as SourceExercise[];

  const compact = raw.map((exercise) => ({
    id: exercise.id,
    name: exercise.name.trim(),
    category: exercise.body_part,
    equipment: exercise.equipment,
    primaryMuscles: [exercise.target],
    secondaryMuscles: exercise.secondary_muscles,
    instructions: exercise.instruction_steps.en,
  }));

  if (compact.length < 1_000)
    throw new Error(`Expected at least 1,000 exercises, received ${compact.length}`);
  if (compact.some((exercise) => exercise.instructions.length === 0))
    throw new Error('An exercise has no English instructions');

  const output = resolve('src/data/exercises.json');
  await writeFile(output, `${JSON.stringify(compact)}\n`, 'utf8');
  console.log(`Wrote ${compact.length} metadata-only exercises to ${output}`);
}

void main();
