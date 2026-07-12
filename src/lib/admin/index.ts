/**
 * Admin lib barrel. Re-exports the small set of helpers that are
 * shared across admin server actions and queries.
 */
export { logAudit, type LogAuditInput } from './audit';
export {
  allowedTransitions,
  isTransitionAllowed,
  statusLabel,
  statusTimestampColumn,
  ALL_ORDER_STATUSES,
} from './state-machine';
export { slugify, nextAvailableSlug } from './slug';
export { parsePage, summarize, buildHref, type PageSummary, type ParsedPage } from './pagination';
export {
  uploadImage,
  deleteImage,
  validateImage,
  publicImageUrl,
  StorageValidationError,
  MAX_IMAGE_BYTES,
  type ImageBucket,
  type UploadImageInput,
  type UploadImageResult,
} from './storage';
