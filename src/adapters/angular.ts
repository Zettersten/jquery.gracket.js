import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
  effect,
  signal,
} from '@angular/core';
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

/**
 * Angular 18+ Component wrapper for Gracket
 * Uses modern Angular features: signals, inject, standalone components
 */
@Component({
  selector: 'gracket',
  standalone: true,
  template: `
    @if (error()) {
      <div class="gracket-error" [style]="{ color: 'red', padding: '1rem' }">
        Error initializing Gracket: {{ error()?.message }}
      </div>
    } @else {
      <div #container [class]="className" [ngStyle]="style"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GracketComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLDivElement>;

  @Input({ required: true }) data!: TournamentData;
  @Input() options?: Omit<GracketOptions, 'src'>;
  @Input() className?: string;
  @Input() style?: Record<string, string>;

  @Output() init = new EventEmitter<Gracket>();
  @Output() errorOccurred = new EventEmitter<Error>();
  @Output() dataUpdated = new EventEmitter<TournamentData>();

  // Using signals for reactive state - Angular 18+ best practice
  protected error = signal<Error | null>(null);
  private gracketInstance = signal<Gracket | null>(null);
  private elementRef = inject(ElementRef);

  ngOnInit(): void {
    // Initialize will happen after view init when container is available
  }

  ngAfterViewInit(): void {
    this.initializeGracket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateData();
    }

    if (changes['options'] && !changes['options'].firstChange) {
      this.reinitializeGracket();
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private initializeGracket(): void {
    const container = this.containerRef?.nativeElement;
    if (!container || !this.data?.length) return;

    try {
      const instance = new Gracket(container, {
        ...this.options,
        src: this.data,
      });

      this.gracketInstance.set(instance);
      this.error.set(null);
      this.init.emit(instance);
    } catch (err) {
      const error = err as Error;
      this.error.set(error);
      this.errorOccurred.emit(error);
      console.error('Gracket initialization error:', err);
    }
  }

  private reinitializeGracket(): void {
    this.destroy();
    this.initializeGracket();
  }

  private updateData(): void {
    const instance = this.gracketInstance();
    if (instance && this.data?.length) {
      try {
        instance.update(this.data);
        this.error.set(null);
        this.dataUpdated.emit(this.data);
      } catch (err) {
        const error = err as Error;
        this.error.set(error);
        this.errorOccurred.emit(error);
      }
    }
  }

  /** Update a team's score */
  public updateScore(
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void {
    try {
      this.gracketInstance()?.updateScore(roundIndex, gameIndex, teamIndex, score);
      this.error.set(null);
    } catch (err) {
      this.error.set(err as Error);
    }
  }

  /** Advance to next round */
  public advanceRound(fromRound?: number): TournamentData | undefined {
    try {
      const result = this.gracketInstance()?.advanceRound(fromRound);
      this.error.set(null);
      return result;
    } catch (err) {
      this.error.set(err as Error);
      return undefined;
    }
  }

  /** Get the Gracket instance */
  public getInstance(): Gracket | null {
    return this.gracketInstance();
  }

  /** Destroy the instance */
  public destroy(): void {
    const instance = this.gracketInstance();
    if (instance) {
      instance.destroy();
      this.gracketInstance.set(null);
    }
  }
}

/**
 * Angular Service for programmatic Gracket control
 * Can be injected into components
 */
export class GracketService {
  private instances = new Map<string, Gracket>();

  /** Create a new Gracket instance */
  create(
    id: string,
    container: HTMLElement,
    data: TournamentData,
    options?: GracketOptions
  ): Gracket {
    // Destroy existing instance if any
    this.destroy(id);

    const instance = new Gracket(container, {
      ...options,
      src: data,
    });

    this.instances.set(id, instance);
    return instance;
  }

  /** Get an existing instance */
  get(id: string): Gracket | undefined {
    return this.instances.get(id);
  }

  /** Update data for an instance */
  update(id: string, data: TournamentData): void {
    this.instances.get(id)?.update(data);
  }

  /** Update score */
  updateScore(
    id: string,
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ): void {
    this.instances.get(id)?.updateScore(roundIndex, gameIndex, teamIndex, score);
  }

  /** Advance round */
  advanceRound(id: string, fromRound?: number): TournamentData | undefined {
    return this.instances.get(id)?.advanceRound(fromRound);
  }

  /** Destroy an instance */
  destroy(id: string): void {
    const instance = this.instances.get(id);
    if (instance) {
      instance.destroy();
      this.instances.delete(id);
    }
  }

  /** Destroy all instances */
  destroyAll(): void {
    this.instances.forEach((instance) => instance.destroy());
    this.instances.clear();
  }
}

export default GracketComponent;
