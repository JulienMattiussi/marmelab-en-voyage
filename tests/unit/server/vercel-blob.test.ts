import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const blob = vi.hoisted(() => ({ get: vi.fn(), list: vi.fn(), put: vi.fn(), del: vi.fn() }));

vi.mock('@vercel/blob', () => blob);

vi.mock('~/server/utils/config', () => ({
  default: { get: (key: string) => ({ blobDataToken: 'data-token', blobAssetsToken: 'assets-token' })[key] },
}));

// eslint-disable-next-line import/first
import { VercelBlobDriver } from '~/server/utils/storage/vercel-blob';

const okResult = (content: string) => ({ statusCode: 200, stream: new Response(content).body });

const driver = new VercelBlobDriver();

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => vi.useRealTimers());

describe('VercelBlobDriver.readJSON', () => {
  it('reads the latest version from the private store by default', async () => {
    blob.get.mockResolvedValue(okResult('[]'));
    expect(await driver.readJSON('participants.json')).toBe('[]');
    expect(blob.get).toHaveBeenCalledWith('participants.json', {
      access: 'private',
      token: 'data-token',
      useCache: false,
    });
  });

  it('accepts the CDN cache when asked to', async () => {
    blob.get.mockResolvedValue(okResult('[]'));
    await driver.readJSON('participants.json', { cached: true });
    expect(blob.get).toHaveBeenCalledWith('participants.json', expect.objectContaining({ useCache: true }));
  });

  it('returns null when the blob does not exist', async () => {
    blob.get.mockResolvedValue(null);
    expect(await driver.readJSON('participants.json')).toBeNull();
    expect(blob.get).toHaveBeenCalledTimes(1);
  });

  it('retries after a transient storage failure', async () => {
    blob.get
      .mockRejectedValueOnce(new Error('Vercel Blob: Failed to fetch blob: 403 Forbidden'))
      .mockResolvedValueOnce(okResult('[]'));
    const result = driver.readJSON('participants.json');
    await vi.runAllTimersAsync();
    expect(await result).toBe('[]');
    expect(blob.get).toHaveBeenCalledTimes(2);
  });

  it('gives up with a 503 when the storage keeps failing', async () => {
    blob.get.mockRejectedValue(new Error('Vercel Blob: Failed to fetch blob: 403 Forbidden'));
    const result = driver.readJSON('participants.json');
    const assertion = expect(result).rejects.toThrow('Stockage temporairement indisponible');
    await vi.runAllTimersAsync();
    await assertion;
    expect(blob.get).toHaveBeenCalledTimes(4);
    expect(createError).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 503 }));
  });
});

describe('VercelBlobDriver.listJSONKeys', () => {
  it('retries after a transient storage failure', async () => {
    blob.list
      .mockRejectedValueOnce(new Error('Vercel Blob: 403 Forbidden'))
      .mockResolvedValueOnce({ blobs: [{ pathname: 'events/a.json' }] });
    const result = driver.listJSONKeys('events');
    await vi.runAllTimersAsync();
    expect(await result).toEqual(['events/a.json']);
  });
});

describe('VercelBlobDriver writes', () => {
  it('writes JSON to the private store', async () => {
    await driver.writeJSON('participants.json', '[]');
    expect(blob.put).toHaveBeenCalledWith(
      'participants.json',
      '[]',
      expect.objectContaining({ access: 'private', token: 'data-token' }),
    );
  });

  it('writes assets to the public store, with a new URL on each write', async () => {
    blob.put.mockResolvedValue({ url: 'https://public.example/avatars/alice.png' });
    const url = await driver.putAsset('avatars/alice.png', Buffer.from(''), 'image/png');
    expect(url).toMatch(/^https:\/\/public\.example\/avatars\/alice\.png\?v=\d+$/);
    expect(blob.put).toHaveBeenCalledWith(
      'avatars/alice.png',
      expect.anything(),
      expect.objectContaining({ access: 'public', token: 'assets-token' }),
    );
  });
});
