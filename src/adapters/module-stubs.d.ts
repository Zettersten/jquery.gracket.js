/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Type stubs for optional peer dependencies during build
// These allow TypeScript to compile without having the actual packages installed
// This file provides minimal type definitions to satisfy TypeScript when peer dependencies are not installed

// Svelte 5 runes support
declare function $state<T>(initial: T): T;
declare function $effect(fn: () => void | (() => void)): void;
declare function $derived<T>(fn: () => T): T;

// Solid JSX namespace augmentation
declare namespace JSX {
  interface IntrinsicElements {
    div: {
      ref?: any;
      class?: string;
      className?: string;
      style?: any;
      children?: any;
      [key: string]: any;
    };
    [elemName: string]: any;
  }
}

declare module '@angular/core' {
  export interface Type<T> extends Function {
    new (...args: any[]): T;
  }
  export interface SimpleChange {
    firstChange: boolean;
    previousValue: any;
    currentValue: any;
    isFirstChange(): boolean;
  }
  export interface SimpleChanges {
    [propName: string]: SimpleChange;
  }
  export class EventEmitter<T> {
    emit(value?: T): void;
    subscribe(generatorOrNext?: any, error?: any, complete?: any): any;
  }
  export class ElementRef<T = any> {
    nativeElement: T;
  }
  export interface OnInit {
    ngOnInit(): void;
  }
  export interface OnDestroy {
    ngOnDestroy(): void;
  }
  export interface OnChanges {
    ngOnChanges(changes: SimpleChanges): void;
  }
  export const ChangeDetectionStrategy: {
    OnPush: number;
    Default: number;
  };
  export function Component(obj: any): any;
  export function Input(obj?: any): any;
  export function Output(obj?: any): any;
  export function ViewChild(selector: string | Type<any>, opts?: any): any;
  export function inject<T>(token: Type<T> | any): T;
  export function signal<T>(initialValue: T): any;
}

declare module 'solid-js' {
  export interface Component<P = {}> {
    (props: P): any;
  }
  export namespace JSX {
    export interface CSSProperties {
      [key: string]: string | number | undefined;
    }
    export interface Element {}
    export interface IntrinsicElements {
      div: any;
      [elemName: string]: any;
    }
  }
  export function createSignal<T>(initialValue: T): [() => T, (v: T) => void];
  export function createEffect(fn: () => void): void;
  export function onMount(fn: () => void): void;
  export function onCleanup(fn: () => void): void;
  export function mergeProps<T extends object, U extends object>(defaults: Partial<T>, props: U): T & U;
  export function mergeProps<A extends object, B extends object, C extends object>(a: A, b: B, c: C): A & B & C;
  export function mergeProps(...args: any[]): any;
}

declare module 'svelte' {
  export class SvelteComponent<Props = any, Events = any, Slots = any> {
    constructor(options: any);
    $on(event: string, handler: (e: any) => any): () => void;
    $set(props: Partial<Props>): void;
    $destroy(): void;
  }
  export function onMount(fn: () => any): void;
  export function onDestroy(fn: () => any): void;
  export function createEventDispatcher<T = any>(): (event: string, detail?: any) => void;
}

declare module './svelte.svelte' {
  const component: any;
  export default component;
}
