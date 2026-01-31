/**
 * Type for pending image upload in RichTextEditor.
 * Used when user pastes/drops an image that is not yet uploaded.
 */
export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}
