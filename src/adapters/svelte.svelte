<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Gracket } from '../core/Gracket';
  import type { GracketOptions, TournamentData } from '../types';

  // Props
  export let data: TournamentData;
  export let options: Omit<GracketOptions, 'src'> = {};
  export let className: string = '';
  export let style: string = '';
  
  // Events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    init: Gracket;
    error: Error;
    update: TournamentData;
  }>();

  let containerRef: HTMLDivElement;
  let gracketInstance: Gracket | null = null;
  let error: Error | null = null;

  const initGracket = () => {
    if (!containerRef || !data?.length) return;

    try {
      gracketInstance = new Gracket(containerRef, {
        ...options,
        src: data,
      });

      error = null;
      dispatch('init', gracketInstance);
    } catch (err) {
      error = err as Error;
      dispatch('error', err as Error);
      console.error('Gracket initialization error:', err);
    }
  };

  const updateData = () => {
    if (gracketInstance && data?.length) {
      try {
        gracketInstance.update(data);
        error = null;
        dispatch('update', data);
      } catch (err) {
        error = err as Error;
        dispatch('error', err as Error);
      }
    }
  };

  // Public API
  export const updateScore = (
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ) => {
    gracketInstance?.updateScore(roundIndex, gameIndex, teamIndex, score);
  };

  export const advanceRound = (fromRound?: number) => {
    return gracketInstance?.advanceRound(fromRound);
  };

  export const getInstance = () => gracketInstance;

  export const destroy = () => {
    gracketInstance?.destroy();
    gracketInstance = null;
  };

  onMount(() => {
    initGracket();
  });

  onDestroy(() => {
    destroy();
  });

  // Watch for data changes
  $: if (gracketInstance && data) {
    updateData();
  }

  // Watch for options changes
  $: if (gracketInstance && options) {
    destroy();
    initGracket();
  }
</script>

{#if error}
  <div class="gracket-error" style="color: red; padding: 1rem;">
    Error initializing Gracket: {error.message}
  </div>
{:else}
  <div bind:this={containerRef} class={className} {style}></div>
{/if}
