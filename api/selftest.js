import assert from "node:assert/strict";
import { authUrl, fileUploadSource } from "./tiktok.js";
import { upsertProduct, listProducts, addMetric, listMetrics } from "./memory-db.js";

const url = authUrl({
  clientKey: "abc",
  redirectUri: "https://example.com/callback",
  scopes: "user.info.basic,video.upload",
  state: "xyz",
});
assert.match(url, /client_key=abc/);
assert.match(url, /state=xyz/);
assert.match(url, /redirect_uri=https%3A%2F%2Fexample.com%2Fcallback/);
assert.match(url, /scope=user.info.basic%2Cvideo.upload/);

assert.deepEqual(fileUploadSource(1024), {
  source_info: {
    source: "FILE_UPLOAD",
    video_size: 1024,
    chunk_size: 1024,
    total_chunk_count: 1,
  },
});

upsertProduct({ id: 1, name: "Teste" });
assert.equal(listProducts().length, 1);
addMetric({ views: 10 });
assert.equal(listMetrics()[0].views, 10);

console.log("selftest ok");
