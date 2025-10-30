import { useEffect, useRef, useState, useCallback } from 'react';
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
}

/**
 * React component wrapper for Gracket
 */
export const GracketReact: React.FC<GracketReactProps> = ({
  data,
  className,
  style,
  onInit,
  ...options
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gracketRef = useRef<Gracket | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    try {
      // Create new Gracket instance
      gracketRef.current = new Gracket(containerRef.current, {
        ...options,
        src: data,
      });

      onInit?.(gracketRef.current);
    } catch (err) {
      setError(err as Error);
      console.error('Gracket initialization error:', err);
    }

    // Cleanup on unmount
    return () => {
      gracketRef.current?.destroy();
      gracketRef.current = null;
    };
  }, []); // Only initialize once

  // Update data when it changes
  useEffect(() => {
    if (gracketRef.current && data?.length) {
      gracketRef.current.update(data);
    }
  }, [data]);

  // Update options when they change
  useEffect(() => {
    if (gracketRef.current && data?.length) {
      // Recreate with new options
      gracketRef.current.destroy();
      gracketRef.current = new Gracket(containerRef.current!, {
        ...options,
        src: data,
      });
      onInit?.(gracketRef.current);
    }
  }, [options, onInit]);

  if (error) {
    return (
      <div className="gracket-error" style={{ color: 'red', padding: '1rem' }}>
        Error initializing Gracket: {error.message}
      </div>
    );
  }

  return <div ref={containerRef} className={className} style={style} />;
};

/**
 * Hook for programmatic Gracket control
 */
export const useGracket = (
  data: TournamentData,
  options?: GracketOptions
): {
  containerRef: React.RefObject<HTMLDivElement>;
  gracket: Gracket | null;
  update: (newData: TournamentData) => void;
  destroy: () => void;
} => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gracketRef = useRef<Gracket | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    gracketRef.current = new Gracket(containerRef.current, {
      ...options,
      src: data,
    });

    return () => {
      gracketRef.current?.destroy();
      gracketRef.current = null;
    };
  }, []);

  const update = useCallback((newData: TournamentData) => {
    gracketRef.current?.update(newData);
  }, []);

  const destroy = useCallback(() => {
    gracketRef.current?.destroy();
    gracketRef.current = null;
  }, []);

  return {
    containerRef,
    gracket: gracketRef.current,
    update,
    destroy,
  };
};

export default GracketReact;
