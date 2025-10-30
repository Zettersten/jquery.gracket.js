import { defineComponent, ref, onMounted, onUnmounted, watch, h, PropType } from 'vue';
import { Gracket } from '../core/Gracket';
import type { GracketOptions, TournamentData } from '../types';

/**
 * Vue 3 component wrapper for Gracket
 */
export const GracketVue = defineComponent({
  name: 'Gracket',
  props: {
    data: {
      type: Array as PropType<TournamentData>,
      required: true,
    },
    options: {
      type: Object as PropType<GracketOptions>,
      default: () => ({}),
    },
    class: {
      type: String,
      default: '',
    },
  },
  emits: ['init', 'error'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const gracketInstance = ref<Gracket | null>(null);
    const error = ref<Error | null>(null);

    const initGracket = () => {
      if (!containerRef.value || !props.data?.length) return;

      try {
        gracketInstance.value = new Gracket(containerRef.value, {
          ...props.options,
          src: props.data,
        });

        emit('init', gracketInstance.value);
      } catch (err) {
        error.value = err as Error;
        emit('error', err);
        console.error('Gracket initialization error:', err);
      }
    };

    onMounted(() => {
      initGracket();
    });

    onUnmounted(() => {
      gracketInstance.value?.destroy();
      gracketInstance.value = null;
    });

    // Watch for data changes
    watch(
      () => props.data,
      (newData) => {
        if (gracketInstance.value && newData?.length) {
          gracketInstance.value.update(newData);
        }
      },
      { deep: true }
    );

    // Watch for options changes
    watch(
      () => props.options,
      () => {
        if (gracketInstance.value && props.data?.length) {
          gracketInstance.value.destroy();
          initGracket();
        }
      },
      { deep: true }
    );

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
      });
    };
  },
});

export default GracketVue;
