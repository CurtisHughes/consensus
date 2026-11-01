import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ParticipantName from '@/components/ParticipantName.vue';

describe('ParticipantName.vue', () => {
  it('pre-fills the name you used last time', () => {
    const wrapper = mount(ParticipantName, {
      props: { suggestion: 'Curtis', save: vi.fn() },
    });
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Curtis');
  });

  it('saves a trimmed name', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const wrapper = mount(ParticipantName, { props: { save } });

    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined();
    await wrapper.get('input').setValue('  Curtis  ');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(save).toHaveBeenCalledWith('Curtis');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('shows who you are voting as and lets you edit it', async () => {
    const save = vi.fn().mockResolvedValue(true);
    const wrapper = mount(ParticipantName, { props: { name: 'Curtis', save } });

    expect(wrapper.text()).toContain('Voting as Curtis');
    expect(wrapper.find('input').exists()).toBe(false);

    await wrapper.get('.edit').trigger('click');
    const input = wrapper.get('input');
    expect((input.element as HTMLInputElement).value).toBe('Curtis');
    await input.setValue('Curtisandra');
    await wrapper.get('form').trigger('submit');
    await wrapper.setProps({ name: 'Curtisandra' });

    expect(save).toHaveBeenCalledWith('Curtisandra');
    expect(wrapper.text()).toContain('Voting as Curtisandra');
  });

  it('keeps the form open and explains when saving fails', async () => {
    const save = vi.fn().mockResolvedValue(false);
    const wrapper = mount(ParticipantName, { props: { save } });

    await wrapper.get('input').setValue('Curtis');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toContain("Your name wasn't saved");
    expect(wrapper.find('input').exists()).toBe(true);
  });
});
