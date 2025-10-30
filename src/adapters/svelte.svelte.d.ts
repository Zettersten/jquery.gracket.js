// Type declaration for Svelte component
import type { SvelteComponent } from 'svelte';
import type { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

export interface GracketSvelteProps {
  data: TournamentData;
  options?: Omit<GracketOptions, 'src'>;
  className?: string;
  style?: string;
}

export interface GracketSvelteEvents {
  init: CustomEvent<Gracket>;
  error: CustomEvent<Error>;
  update: CustomEvent<TournamentData>;
}

export default class GracketSvelte extends SvelteComponent<
  GracketSvelteProps,
  GracketSvelteEvents
> {
  updateScore(
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void;
  advanceRound(fromRound?: number): TournamentData | undefined;
  getInstance(): Gracket | null;
  destroy(): void;
}
