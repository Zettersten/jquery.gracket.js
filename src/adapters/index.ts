/**
 * Framework adapters for Gracket
 * 
 * Modern, framework-specific wrappers for the Gracket tournament bracket library.
 * Each adapter follows the latest best practices for its respective framework.
 * 
 * @packageDocumentation
 */

// Re-export core library
export { Gracket } from '../core/Gracket';
export * from '../types';

// Note: Framework adapters should be imported directly from their submodules:
// - import { GracketReact } from 'gracket/react'
// - import { GracketVue } from 'gracket/vue'
// - import { GracketComponent } from 'gracket/angular'
// - import { GracketSolid } from 'gracket/solid'
// - import { gracket, createGracket } from 'gracket/svelte'
// - import { GracketElement } from 'gracket/webcomponent'
