"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@na-design-system/components/molecules/Modal";
import { Button } from "@na-design-system/components/atoms/Button";

interface LinkEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; url: string }) => void;
  defaultText?: string;
  defaultUrl?: string;
}

export const LinkEditorModal: React.FC<LinkEditorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultText = "",
  defaultUrl = "",
}) => {
  const [text, setText] = useState(defaultText);
  const [url, setUrl] = useState(defaultUrl);

  useEffect(() => {
    if (isOpen) {
      setText(defaultText);
      setUrl(defaultUrl);
    }
  }, [isOpen, defaultText, defaultUrl]);

  const handleSubmit = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    onSubmit({
      text: text.trim(),
      url: trimmedUrl,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Link"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Insert
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Preview Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            placeholder="Text to display"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            placeholder="https://example.com"
          />
        </div>
      </div>
    </Modal>
  );
};

export default LinkEditorModal;