import { describe, it, expect } from 'vitest';
import { slugify } from '~/utils/slugify';

describe('slugify', () => {
  it('lowercases the string', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('replaces spaces with dashes by default', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('strips accents', () => {
    expect(slugify('été')).toBe('ete');
    expect(slugify('Noël')).toBe('noel');
    expect(slugify('François')).toBe('francois');
  });

  it('collapses multiple non-alphanumeric characters into one separator', () => {
    expect(slugify('hello  world')).toBe('hello-world');
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify(' hello ')).toBe('hello');
    expect(slugify('-hello-')).toBe('hello');
  });

  it('handles an empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('supports a custom empty separator for compact IDs', () => {
    expect(slugify('Marie Dupont', '')).toBe('mariedupont');
    expect(slugify('Julien Maire', '')).toBe('julienmaire');
  });

  it('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('hello-world');
  });

  it('generates stable event slugs', () => {
    expect(slugify('Belmont 2025')).toBe('belmont-2025');
  });
});
