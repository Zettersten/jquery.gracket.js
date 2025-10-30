/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./module-stubs.d.ts" />
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

/**
 * Svelte 5+ action for Gracket
 * Modern approach using Svelte actions with full reactivity
 * 
 * @example
 * ```svelte
 * <script>
 *   import { gracket } from 'gracket/svelte';
 *   let data = $state([...]);
 * </script>
 * 
 * <div use:gracket={{ data, options }} />
 * ```
 */
export function gracket(
  node: HTMLElement,
  params: {
    data: TournamentData;
    options?: Omit<GracketOptions, 'src'>;
    onInit?: (instance: Gracket) => void;
    onError?: (error: Error) => void;
  }
) {
  let instance: Gracket | null = null;

  const init = () => {
    if (!params.data?.length) return;

    try {
      instance = new Gracket(node, {
        ...params.options,
        src: params.data,
      });

      params.onInit?.(instance);
    } catch (err) {
      const error = err as Error;
      params.onError?.(error);
      console.error('Gracket initialization error:', err);
    }
  };

  const update = (newParams: typeof params) => {
    if (!instance || !newParams.data?.length) return;

    try {
      instance.update(newParams.data);
    } catch (err) {
      params.onError?.(err as Error);
    }
  };

  const destroy = () => {
    instance?.destroy();
    instance = null;
  };

  // Initialize
  init();

  return {
    update,
    destroy,
  };
}

/**
 * Svelte 5 runes-based composable
 * For use with Svelte 5's new runes system
 * 
 * @example
 * ```svelte
 * <script>
 *   import { createGracket } from 'gracket/svelte';
 *   
 *   let data = $state([...]);
 *   const { containerRef, instance, update } = createGracket(data);
 * </script>
 * 
 * <div bind:this={containerRef} />
 * ```
 */
export function createGracket(
  data: TournamentData,
  options?: GracketOptions
) {
  let containerRef: HTMLElement | null = $state(null);
  let instance: Gracket | null = $state(null);
  let error: Error | null = $state(null);

  // Initialize when container is available
  $effect(() => {
    if (!containerRef || !data?.length) return;

    try {
      const gracket = new Gracket(containerRef, {
        ...options,
        src: data,
      });

      instance = gracket;
      error = null;
    } catch (err) {
      error = err as Error;
      console.error('Gracket initialization error:', err);
    }

    return () => {
      instance?.destroy();
      instance = null;
    };
  });

  // React to data changes
  $effect(() => {
    if (instance && data?.length) {
      try {
        instance.update(data);
        error = null;
      } catch (err) {
        error = err as Error;
      }
    }
  });

  const update = (newData: TournamentData) => {
    try {
      instance?.update(newData);
      error = null;
    } catch (err) {
      error = err as Error;
    }
  };

  const updateScore = (
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ) => {
    try {
      instance?.updateScore(roundIndex, gameIndex, teamIndex, score);
      error = null;
    } catch (err) {
      error = err as Error;
    }
  };

  const advanceRound = (fromRound?: number) => {
    try {
      return instance?.advanceRound(fromRound);
    } catch (err) {
      error = err as Error;
      return undefined;
    }
  };

  const destroy = () => {
    instance?.destroy();
    instance = null;
  };

  return {
    get containerRef() {
      return containerRef;
    },
    set containerRef(value: HTMLElement | null) {
      containerRef = value;
    },
    get instance() {
      return instance;
    },
    get error() {
      return error;
    },
    update,
    updateScore,
    advanceRound,
    destroy,
  };
}

/**
 * Legacy Svelte 4 store-based approach
 * For backward compatibility
 */
export { default as GracketSvelte } from './svelte.svelte';
