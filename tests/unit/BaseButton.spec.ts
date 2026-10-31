import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '@/components/BaseButton.vue';

describe('BaseButton.vue', () => {
  it('renders slot content with the given color', () => {
    const wrapper = mount(BaseButton, {
      props: { color: 'blue' },
      slots: { default: 'CREATE' },
    });
    expect(wrapper.text()).toBe('CREATE');
    expect(wrapper.get('button').attributes('style')).toContain('background: blue');
  });

  it('has no background when inverted', () => {
    const wrapper = mount(BaseButton, { props: { inverted: true } });
    expect(wrapper.get('button').attributes('style')).toContain('background: none');
  });

  it('emits a single click event when clicked', async () => {
    let clicks = 0;
    const wrapper = mount(BaseButton, { attrs: { onClick: () => (clicks += 1) } });
    await wrapper.get('button').trigger('click');
    expect(clicks).toBe(1);
  });

  it('does not fire click handlers when disabled', async () => {
    let clicks = 0;
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
      attrs: { onClick: () => (clicks += 1) },
    });
    expect(wrapper.get('button').element.disabled).toBe(true);
    await wrapper.get('button').trigger('click');
    expect(clicks).toBe(0);
  });
});
