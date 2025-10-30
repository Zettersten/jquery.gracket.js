import { 
  defineComponent, 
  ref, 
  onMounted, 
  onUnmounted, 
  watch, 
  h, 
  type PropType,
  computed,
  shallowRef,
} from 'vue';
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

/**
 * Vue 3.5+ component wrapper for Gracket with modern best practices
 */
export const GracketVue = defineComponent({
  name: 'GracketVue',
  props: {
    data: {
      type: Array as PropType<TournamentData>,
      required: true,
    },
    options: {
      type: Object as PropType<Omit<GracketOptions, 'src'>>,
      default: () => ({}),
    },
    class: {
      type: String,
      default: '',
    },
    style: {
      type: [Object, String] as PropType<Record<string, string> | string>,
      default: undefined,
    },
  },
  emits: {
    init: (instance: Gracket) => instance instanceof Gracket,
    error: (error: Error) => error instanceof Error,
    update: (data: TournamentData) => Array.isArray(data),
  },
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    // Use shallowRef for non-reactive DOM instance
    const gracketInstance = shallowRef<Gracket | null>(null);
    const error = ref<Error | null>(null);

    const initGracket = () => {
      if (!containerRef.value || !props.data?.length) return;

      try {
        gracketInstance.value = new Gracket(containerRef.value, {
          ...props.options,
          src: props.data,
        });

        error.value = null;
        emit('init', gracketInstance.value);
      } catch (err) {
        error.value = err as Error;
        emit('error', err as Error);
        console.error('Gracket initialization error:', err);
      }
    };

    const updateData = (newData: TournamentData) => {
      if (gracketInstance.value && newData?.length) {
        try {
          gracketInstance.value.update(newData);
          error.value = null;
          emit('update', newData);
        } catch (err) {
          error.value = err as Error;
          emit('error', err as Error);
        }
      }
    };

    const updateScore = (
      roundIndex: number,
      gameIndex: number,
      teamIndex: number,
      score: number
    ) => {
      gracketInstance.value?.updateScore(roundIndex, gameIndex, teamIndex, score);
    };

    const advanceRound = (fromRound?: number) => {
      return gracketInstance.value?.advanceRound(fromRound);
    };

    const destroy = () => {
      gracketInstance.value?.destroy();
      gracketInstance.value = null;
    };

    onMounted(() => {
      initGracket();
    });

    onUnmounted(() => {
      destroy();
    });

    // Watch for data changes with deep comparison
    watch(
      () => props.data,
      (newData) => updateData(newData),
      { deep: true }
    );

    // Watch for options changes - recreate instance
    watch(
      () => props.options,
      () => {
        if (gracketInstance.value && props.data?.length) {
          destroy();
          initGracket();
        }
      },
      { deep: true }
    );

    // Expose public API
    expose({
      instance: computed(() => gracketInstance.value),
      updateData,
      updateScore,
      advanceRound,
      destroy,
    });

    return () => {
      if (error.value) {
        return h(
          'div',
          {
            class: 'gracket-error',
            style: { color: 'red', padding: '1rem' },
          },
          `Error initializing Gracket: ${error.value.message}`
        );
      }

      return h('div', {
        ref: containerRef,
        class: props.class,
        style: props.style,
      });
    };
  },
});

/**
 * Composable for programmatic Gracket control - Vue 3.5+ optimized
 */
export const useGracket = (
  data: TournamentData | (() => TournamentData),
  options?: GracketOptions | (() => GracketOptions)
) => {
  const containerRef = ref<HTMLElement | null>(null);
  const gracketInstance = shallowRef<Gracket | null>(null);
  const error = ref<Error | null>(null);

  const tournamentData = computed(() => 
    typeof data === 'function' ? data() : data
  );
  
  const gracketOptions = computed(() => 
    typeof options === 'function' ? options() : options
  );

  const init = () => {
    if (!containerRef.value || !tournamentData.value?.length) return;

    try {
      gracketInstance.value = new Gracket(containerRef.value, {
        ...gracketOptions.value,
        src: tournamentData.value,
      });
      error.value = null;
    } catch (err) {
      error.value = err as Error;
      console.error('Gracket initialization error:', err);
    }
  };

  const update = (newData: TournamentData) => {
    try {
      gracketInstance.value?.update(newData);
      error.value = null;
    } catch (err) {
      error.value = err as Error;
    }
  };

  const updateScore = (
    roundIndex: number,
    gameIndex: number,
    teamIndex: number,
    score: number
  ) => {
    try {
      gracketInstance.value?.updateScore(roundIndex, gameIndex, teamIndex, score);
      error.value = null;
    } catch (err) {
      error.value = err as Error;
    }
  };

  const advanceRound = (fromRound?: number) => {
    try {
      return gracketInstance.value?.advanceRound(fromRound);
    } catch (err) {
      error.value = err as Error;
      return undefined;
    }
  };

  const destroy = () => {
    gracketInstance.value?.destroy();
    gracketInstance.value = null;
  };

  onMounted(() => init());
  onUnmounted(() => destroy());

  // Watch for data changes
  watch(tournamentData, (newData) => {
    if (gracketInstance.value && newData?.length) {
      update(newData);
    }
  }, { deep: true });

  // Watch for options changes
  watch(gracketOptions, () => {
    if (gracketInstance.value) {
      destroy();
      init();
    }
  }, { deep: true });

  return {
    containerRef,
    instance: computed(() => gracketInstance.value),
    error: computed(() => error.value),
    update,
    updateScore,
    advanceRound,
    destroy,
  };
};

export default GracketVue;
