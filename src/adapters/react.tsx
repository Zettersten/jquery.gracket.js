import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

export interface GracketReactProps extends Omit<GracketOptions, 'src'> {
  /** Tournament data */
  data: TournamentData;
  /** Additional CSS class for container */
  className?: string;
  /** Inline styles for container */
  style?: React.CSSProperties;
  /** Callback when bracket is initialized */
  onInit?: (gracket: Gracket) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * React component wrapper for Gracket - Modern React 18+ best practices
 */
const GracketReactComponent: React.FC<GracketReactProps> = ({
  data,
  className,
  style,
  onInit,
  onError,
  ...options
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gracketRef = useRef<Gracket | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Stabilize options object to prevent unnecessary re-renders
  const stableOptions = useMemo(() => options, [
    options.gracketClass,
    options.gameClass,
    options.roundClass,
    options.roundLabelClass,
    options.teamClass,
    options.winnerClass,
    options.spacerClass,
    options.currentClass,
    options.seedClass,
    options.cornerRadius,
    options.canvasId,
    options.canvasClass,
    options.canvasLineColor,
    options.canvasLineCap,
    options.canvasLineWidth,
    options.canvasLineGap,
    options.byeLabel,
    options.byeClass,
    options.showByeGames,
    // Callbacks are intentionally excluded from deps
  ]);

  // Initialize Gracket instance
  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    try {
      gracketRef.current = new Gracket(containerRef.current, {
        ...stableOptions,
        src: data,
      });

      onInit?.(gracketRef.current);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      console.error('Gracket initialization error:', err);
    }

    return () => {
      gracketRef.current?.destroy();
      gracketRef.current = null;
    };
  }, [stableOptions, onInit, onError]);

  // Update data reactively
  useEffect(() => {
    if (gracketRef.current && data?.length) {
      try {
        gracketRef.current.update(data);
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      }
    }
  }, [data, onError]);

  if (error) {
    return (
      <div className="gracket-error" style={{ color: 'red', padding: '1rem' }}>
        Error initializing Gracket: {error.message}
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
};

// Memoized component export for performance
export const GracketReact = memo(GracketReactComponent);

/**
 * Hook for programmatic Gracket control - React 18+ optimized
 */
export const useGracket = (
  data: TournamentData,
  options?: GracketOptions
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gracketRef = useRef<Gracket | null>(null);
  const [instance, setInstance] = useState<Gracket | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Stabilize options
  const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

  // Initialize on mount
  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    try {
      const gracket = new Gracket(containerRef.current, {
        ...stableOptions,
        src: data,
      });
      
      gracketRef.current = gracket;
      setInstance(gracket);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }

    return () => {
      gracketRef.current?.destroy();
      gracketRef.current = null;
      setInstance(null);
    };
  }, [stableOptions]);

  // Update data
  useEffect(() => {
    if (gracketRef.current && data?.length) {
      try {
        gracketRef.current.update(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      }
    }
  }, [data]);

  // Stable API methods
  const update = useCallback((newData: TournamentData) => {
    try {
      gracketRef.current?.update(newData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const destroy = useCallback(() => {
    gracketRef.current?.destroy();
    gracketRef.current = null;
    setInstance(null);
  }, []);

  const updateScore = useCallback((
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ) => {
    try {
      gracketRef.current?.updateScore(roundIndex, gameIndex, teamIndex, score);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const advanceRound = useCallback((fromRound?: number) => {
    try {
      return gracketRef.current?.advanceRound(fromRound);
    } catch (err) {
      setError(err as Error);
      return undefined;
    }
  }, []);

  return {
    containerRef,
    gracket: instance,
    error,
    update,
    destroy,
    updateScore,
    advanceRound,
  };
};

export default GracketReact;
