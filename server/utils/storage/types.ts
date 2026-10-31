export type ReadOptions = {
  // Accept a copy up to ~60s old from the CDN cache. Only for public pages:
  // the admin and every read-before-write need the latest version.
  cached?: boolean;
};

export interface StorageDriver {
  // JSON documents — keys are relative paths like 'events/my-event.json' or 'participants.json'
  readJSON(key: string, options?: ReadOptions): Promise<string | null>;
  writeJSON(key: string, content: string): Promise<void>;
  listJSONKeys(prefix: string): Promise<string[]>;
  deleteJSON(key: string): Promise<void>;

  // Binary assets — key is a path like 'events/my-event/background.jpg'
  // Returns a public URL usable in <img src="...">, with a ?v= version so that a replaced
  // file gets a new URL and browsers don't show the copy they already cached
  putAsset(key: string, data: Buffer, contentType: string): Promise<string>;
  deleteAssetsByPrefix(prefix: string): Promise<void>;
}
