import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

describe('dependency version consistency', () => {
  it('react and react-dom must have the exact same version', () => {
    const reactVersion = pkg.devDependencies.react;
    const reactDomVersion = pkg.devDependencies['react-dom'];

    expect(
      reactVersion,
      'react version must be defined in devDependencies',
    ).toBeDefined();
    expect(
      reactDomVersion,
      'react-dom version must be defined in devDependencies',
    ).toBeDefined();
    expect(reactVersion).toBe(reactDomVersion);
  });
});
