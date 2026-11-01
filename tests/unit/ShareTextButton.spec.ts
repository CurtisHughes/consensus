import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ShareTextButton from '@/components/ShareTextButton.vue';

const LINK = 'https://example.com/polls/abc';

describe('ShareTextButton.vue', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('copies the text to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const wrapper = mount(ShareTextButton, { props: { text: LINK } });

    expect(wrapper.find('button[aria-label="Share link"]').exists()).toBe(false);
    await wrapper.get('button[aria-label="Copy link"]').trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(LINK);
    expect(wrapper.get('button[aria-label="Copy link"]').classes()).toContain('copied');
    expect(wrapper.get('[role="status"]').text()).toBe('Link copied');
  });

  it('selects the text when copying fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    const wrapper = mount(ShareTextButton, { props: { text: LINK }, attachTo: document.body });

    await wrapper.get('button[aria-label="Copy link"]').trigger('click');
    await flushPromises();

    expect(window.getSelection()?.toString()).toBe(LINK);
    expect(wrapper.get('button[aria-label="Copy link"]').classes()).not.toContain('copied');
    expect(wrapper.get('[role="status"]').text()).toContain("Couldn't copy");
    wrapper.unmount();
  });

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share, clipboard: { writeText: vi.fn() } });
    const wrapper = mount(ShareTextButton, { props: { text: LINK, title: 'Game night' } });

    await wrapper.get('button[aria-label="Share link"]').trigger('click');
    await flushPromises();

    expect(share).toHaveBeenCalledWith({ title: 'Game night', url: LINK });
  });

  it('falls back to copying when sharing fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('nope', 'NotAllowedError')),
      clipboard: { writeText },
    });
    const wrapper = mount(ShareTextButton, { props: { text: LINK } });

    await wrapper.get('button[aria-label="Share link"]').trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(LINK);
  });

  it('does nothing when the share sheet is dismissed', async () => {
    const writeText = vi.fn();
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')),
      clipboard: { writeText },
    });
    const wrapper = mount(ShareTextButton, { props: { text: LINK } });

    await wrapper.get('button[aria-label="Share link"]').trigger('click');
    await flushPromises();

    expect(writeText).not.toHaveBeenCalled();
  });
});
