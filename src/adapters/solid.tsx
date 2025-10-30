import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  mergeProps,
  type Component,
  type JSX,
} from 'solid-js';
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

export interface GracketSolidProps extends Omit<GracketOptions, 'src'> {
  /** Tournament data */
  data: TournamentData;
  /** Additional CSS class for container */
  class?: string;
  /** Inline styles for container */
  style?: JSX.CSSProperties;
  /** Callback when bracket is initialized */
  onInit?: (gracket: Gracket) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * SolidJS component wrapper for Gracket
 * Uses modern SolidJS best practices with fine-grained reactivity
 */
export const GracketSolid: Component<GracketSolidProps> = (props) => {
  const merged = mergeProps({ class: '', style: {} }, props);
  
  let containerRef: HTMLDivElement | undefined;
  let gracketInstance: Gracket | null = null;
  
  const [error, setError] = createSignal<Error | null>(null);

  // Initialize Gracket on mount
  onMount(() => {
    if (!containerRef || !merged.data?.length) return;

    try {
      const { data, class: _class, style: _style, ...options } = merged;
      
      gracketInstance = new Gracket(containerRef, {
        ...options,
        src: data,
      });

      setError(null);
      merged.onInit?.(gracketInstance);
    } catch (err) {
      const error = err as Error;
      setError(error);
      merged.onError?.(error);
      console.error('Gracket initialization error:', err);
    }
  });

  // React to data changes
  createEffect(() => {
    if (gracketInstance && merged.data?.length) {
      try {
        gracketInstance.update(merged.data);
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(error);
        merged.onError?.(error);
      }
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    gracketInstance?.destroy();
    gracketInstance = null;
  });

  return (
    <>
      {error() ? (
        <div class="gracket-error" style={{ color: 'red', padding: '1rem' }}>
          Error initializing Gracket: {error()!.message}
        </div>
      ) : (
        <div ref={containerRef} class={merged.class} style={merged.style} />
      )}
    </>
  );
};

/**
 * SolidJS hook for programmatic Gracket control
 */
export const useGracket = (
  data: TournamentData,
  options?: GracketOptions
) => {
  let containerRef: HTMLDivElement | undefined;
  let gracketInstance: Gracket | null = null;
  
  const [instance, setInstance] = createSignal<Gracket | null>(null);
  const [error, setError] = createSignal<Error | null>(null);

  onMount(() => {
    if (!containerRef || !data?.length) return;

    try {
      gracketInstance = new Gracket(containerRef, {
        ...options,
        src: data,
      });
      
      setInstance(gracketInstance);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  });

  createEffect(() => {
    if (gracketInstance && data?.length) {
      try {
        gracketInstance.update(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    }
  });

  onCleanup(() => {
    gracketInstance?.destroy();
    gracketInstance = null;
    setInstance(null);
  });

  const update = (newData: TournamentData) => {
    try {
      gracketInstance?.update(newData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const updateScore = (
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ) => {
    try {
      gracketInstance?.updateScore(roundIndex, gameIndex, teamIndex, score);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const advanceRound = (fromRound?: number) => {
    try {
      return gracketInstance?.advanceRound(fromRound);
    } catch (err) {
      setError(err as Error);
      return undefined;
    }
  };

  const destroy = () => {
    gracketInstance?.destroy();
    gracketInstance = null;
    setInstance(null);
  };

  return {
    containerRef: (el: HTMLDivElement) => (containerRef = el),
    instance,
    error,
    update,
    updateScore,
    advanceRound,
    destroy,
  };
};

export default GracketSolid;
