import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Profile = { developmentClient?: boolean; distribution?: string };
const eas = JSON.parse(readFileSync('eas.json', 'utf8')) as {
  build: Record<string, Profile>;
  submit: Record<string, unknown>;
};

describe('eas.json', () => {
  it('has development, preview and production profiles', () => {
    expect(Object.keys(eas.build).sort()).toEqual(['development', 'preview', 'production']);
  });
  it('development is an internal dev client', () => {
    expect(eas.build.development).toMatchObject({
      developmentClient: true,
      distribution: 'internal',
    });
  });
  it('preview is internal and not a dev client', () => {
    expect(eas.build.preview?.distribution).toBe('internal');
    expect(eas.build.preview?.developmentClient).toBeUndefined();
  });
  it('configures no store submission (App Store submit is Kassra only)', () => {
    expect(eas.submit).toEqual({});
  });
});
