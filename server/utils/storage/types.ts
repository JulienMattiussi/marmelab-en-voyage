export interface StorageDriver {
  // JSON documents — keys are relative paths like 'events/my-event.json' or 'participants.json'
  readJSON(key: string): Promise<string | null>;
  writeJSON(key: string, content: string): Promise<void>;
  listJSONKeys(prefix: string): Promise<string[]>;
  deleteJSON(key: string): Promise<void>;

  // Binary assets — key is a path like 'events/my-event/background.jpg'
  // Returns a public URL usable in <img src="...">
  putAsset(key: string, data: Buffer, contentType: string): Promise<string>;
  deleteAssetsByPrefix(prefix: string): Promise<void>;
}
