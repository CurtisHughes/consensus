import { shallowMount } from '@vue/test-utils';
import Button from '@/components/Button.vue';

describe('Button.vue', () => {
  it('renders a button', () => {
    const color = 'blue';
    const wrapper = shallowMount(Button, {
      propsData: { color },
    });
    expect(wrapper.get('button'));
  });
});
