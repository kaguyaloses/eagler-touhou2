import { PACKAGE_DESCRIPTOR_SCHEMA } from "../../package/package-descriptor.mjs";
import { HOST_PROTOCOL, PRODUCT_GAMES } from "../contracts/product-catalog.mjs";
import type { GameId } from "../contracts/product-catalog.mjs";
import type { SiteGameData } from "../contracts/site-manifest.mjs";
import type { PackageDescriptor } from "../contracts/package-read-models.mjs";

export function rawDataImportFileNames(game: GameId): readonly string[] {
  const packagePolicy = PRODUCT_GAMES[game].package;
  return "rawDataImport" in packagePolicy && packagePolicy.rawDataImport
    ? packagePolicy.rawDataImport.fileNames
    : [];
}

export function rawDataImportMatchesFileName(game: GameId, fileName: string): boolean {
  const normalized = String(fileName || "").toLowerCase();
  return !!normalized && rawDataImportFileNames(game).some(name => name.toLowerCase() === normalized);
}

export function rawDataImportSizeMatches(expected: SiteGameData, actualBytes: number): boolean {
  return Number.isInteger(actualBytes) && actualBytes === expected.bytes;
}

export function rawDataImportHashMatches(expected: SiteGameData, actualSha256: string): boolean {
  return typeof expected.sha256 === "string" && /^[a-f0-9]{64}$/i.test(actualSha256) &&
    actualSha256.toLowerCase() === expected.sha256.toLowerCase();
}

export function createRawDataImportPackageDescriptor(
  game: GameId,
  expected: SiteGameData,
  actualSha256: string,
  {actualBytes = expected.bytes, allowLocalIdentity = false}: {actualBytes?: number; allowLocalIdentity?: boolean} = {},
): PackageDescriptor {
  if (rawDataImportFileNames(game).length === 0) throw new Error(`${game}: raw DATA import is not declared`);
  if (!Number.isSafeInteger(actualBytes) || actualBytes! <= 0 || !/^[a-f0-9]{64}$/i.test(actualSha256)) {
    throw new Error(`${game}: raw DATA import has an invalid local identity`);
  }
  const siteIdentityAvailable = typeof expected.bytes === "number" && !!expected.version && !!expected.sha256;
  if (!siteIdentityAvailable && !allowLocalIdentity) {
    throw new Error(`${game}: raw DATA import requires a verified site identity`);
  }
  if (siteIdentityAvailable && (!rawDataImportSizeMatches(expected, actualBytes!) || !rawDataImportHashMatches(expected, actualSha256))) {
    throw new Error(`${game}: raw DATA identity does not match Site Manifest`);
  }
  const product = PRODUCT_GAMES[game];
  const dataFileId = product.package.dataFileId;
  const version = expected.version || `sha256-${actualSha256.toLowerCase()}`;
  return {
    schema: PACKAGE_DESCRIPTOR_SCHEMA,
    game,
    revision: `raw-${actualSha256.toLowerCase().slice(0, 16)}`,
    runtimeRequirement: {
      protocol: HOST_PROTOCOL,
      target: game,
      dataFile: dataFileId,
      dataLayout: expected.layout,
    },
    files: {
      [dataFileId]: {
        revision: version,
        source: expected.path,
        target: product.package.dataTarget,
        bytes: expected.bytes ?? actualBytes,
      },
    },
    base: { files: [dataFileId] },
    components: {},
  };
}
