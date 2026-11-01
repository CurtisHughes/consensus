import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TextInput from '@/components/TextInput.vue';

describe('TextInput.vue', () => {
  it('renders the bound value', () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'Camping' } });
    expect(wrapper.get('input').element.value).toBe('Camping');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: '' } });
    await wrapper.get('input').setValue('Picnic');
    expect(wrapper.emitted('update:modelValue')).toEqual([['Picnic']]);
  });

  it('passes native attributes through to the input', () => {
    const wrapper = mount(TextInput, { attrs: { placeholder: 'Event', required: true } });
    const input = wrapper.get('input');
    expect(input.attributes('placeholder')).toBe('Event');
    expect(input.element.required).toBe(true);
  });
});
