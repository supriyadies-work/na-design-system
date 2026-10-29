import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_MAX_IMAGE_BYTES,
  DEFAULT_MAX_IMAGE_WIDTH,
  assertUnderMaxBytes,
  computeTargetDimensions,
  getOutputMimeAndExtension,
  replaceFileExtension,
  CompressImageError,
} from "./compressImage";

describe("computeTargetDimensions", () => {
  it("leaves small images unchanged", () => {
    const result = computeTargetDimensions(800, 600, DEFAULT_MAX_IMAGE_WIDTH);
    assert.equal(result.width, 800);
    assert.equal(result.height, 600);
    assert.equal(result.scaled, false);
  });

  it("scales down wide images to max width", () => {
    const result = computeTargetDimensions(3200, 1800, 1600);
    assert.equal(result.width, 1600);
    assert.equal(result.height, 900);
    assert.equal(result.scaled, true);
  });

  it("preserves aspect ratio for portrait sources when width exceeds max", () => {
    const result = computeTargetDimensions(2000, 3000, 1600);
    assert.equal(result.width, 1600);
    assert.equal(result.height, 2400);
    assert.equal(result.scaled, true);
  });
});

describe("getOutputMimeAndExtension", () => {
  it("prefers webp", () => {
    assert.deepEqual(getOutputMimeAndExtension("image/png"), {
      mime: "image/webp",
      extension: "webp",
    });
    assert.deepEqual(getOutputMimeAndExtension("image/jpeg"), {
      mime: "image/webp",
      extension: "webp",
    });
  });
});

describe("replaceFileExtension", () => {
  it("replaces existing extension", () => {
    assert.equal(replaceFileExtension("photo.PNG", "webp"), "photo.webp");
  });

  it("appends when missing", () => {
    assert.equal(replaceFileExtension("photo", "jpg"), "photo.jpg");
  });
});

describe("assertUnderMaxBytes", () => {
  it("allows sizes at or under the limit", () => {
    assert.doesNotThrow(() =>
      assertUnderMaxBytes(DEFAULT_MAX_IMAGE_BYTES, DEFAULT_MAX_IMAGE_BYTES)
    );
  });

  it("rejects sizes over the limit with CompressImageError", () => {
    assert.throws(
      () => assertUnderMaxBytes(DEFAULT_MAX_IMAGE_BYTES + 1),
      (err: unknown) =>
        err instanceof CompressImageError && err.code === "TOO_LARGE"
    );
  });
});
