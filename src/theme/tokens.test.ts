import { describe, expect, it } from 'vitest';
import { palette, themeFor } from './tokens';

describe('themeFor', () => {
  it('uses true black and white in dark mode', () => {
    expect(themeFor(true)).toMatchObject({ background: palette.black, foreground: palette.white });
  });

  it('inverts foreground and background in light mode', () => {
    expect(themeFor(false)).toMatchObject({ background: palette.white, foreground: palette.black });
  });
});
