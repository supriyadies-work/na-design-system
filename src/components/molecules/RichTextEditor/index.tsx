"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { PendingImage } from "@/lib/helpers/pendingImageUpload";
import "react-quill/dist/quill.snow.css";

// Dynamic import untuk avoid SSR issues
// Wrap with forwardRef to support ref forwarding
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-white dark:bg-neutral-800">
      <p className="text-neutral-500 dark:text-neutral-400">
        Loading editor...
      </p>
    </div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  blogSlug?: string; // Untuk upload image
  className?: string;
  onPendingImagesChange?: (images: PendingImage[]) => void; // Callback untuk pending images
  testId?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  blogSlug,
  className = "",
  onPendingImagesChange,
  testId,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef<any>(null);
  const quillEditorRef = useRef<any>(null);
  const blogSlugRef = useRef<string | undefined>(blogSlug);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  // Update blogSlug ref when it changes
  useEffect(() => {
    blogSlugRef.current = blogSlug;
  }, [blogSlug]);

  // Notify parent about pending images changes
  useEffect(() => {
    if (onPendingImagesChange) {
      onPendingImagesChange(pendingImages);
    }
  }, [pendingImages, onPendingImagesChange]);

  // Handle SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup Quill editor instance after mount
  useEffect(() => {
    if (!mounted) return;

    const setupEditor = () => {
      if (!quillRef.current) return;

      const container = quillRef.current;

      // Find the .ql-editor element
      const editorElement = container.querySelector(
        ".ql-editor"
      ) as HTMLElement;
      if (editorElement) {
        // Try multiple ways to get Quill instance
        let quillInstance: any = null;

        // Method 1: From element's __quill property
        if ((editorElement as any).__quill) {
          quillInstance = (editorElement as any).__quill;
        }
        // Method 2: Using Quill.find (if available)
        else if ((window as any).Quill) {
          quillInstance = (window as any).Quill.find(editorElement);
        }
        // Method 3: From parent container
        else {
          const qlContainer = container.querySelector(".ql-container");
          if (qlContainer && (qlContainer as any).__quill) {
            quillInstance = (qlContainer as any).__quill;
          }
        }

        if (quillInstance && quillInstance.root) {
          quillEditorRef.current = quillInstance;
          return true; // Success
        }
      }
      return false; // Not ready yet
    };

    // Try immediately
    if (setupEditor()) return;

    // Retry with increasing delays
    const timeouts: NodeJS.Timeout[] = [];
    [100, 200, 500, 1000].forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (setupEditor()) {
          // If successful, clear remaining timeouts
          timeouts.forEach(clearTimeout);
        }
      }, delay);
      timeouts.push(timeoutId);
    });

    // Use MutationObserver to detect when editor is added
    const observer = new MutationObserver(() => {
      if (setupEditor()) {
        observer.disconnect();
        timeouts.forEach(clearTimeout);
      }
    });

    if (quillRef.current) {
      observer.observe(quillRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [mounted]); // Only run when mounted changes

  // Custom image handler
  const imageHandler = useMemo(
    () => () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("Image size must be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select an image file");
          return;
        }

        try {
          // Create preview URL using FileReader for base64 data URL (more reliable)
          const imageId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Use FileReader to create data URL (works better than blob URL)
          const reader = new FileReader();
          reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            if (!dataUrl) {
              alert("Failed to load image");
              return;
            }

            // Create pending image object with data URL
            const pendingImage: PendingImage = {
              id: imageId,
              file,
              previewUrl: dataUrl,
            } as PendingImage;

            // Add to pending images
            setPendingImages((prev) => [...prev, pendingImage]);

            // Wait a bit to ensure editor DOM is ready, with retry
            let editorElement: HTMLElement | null = null;
            let attempts = 0;
            const maxAttempts = 20;

            while (!editorElement && attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 100));

              // Try to find editor element
              if (quillRef.current) {
                editorElement = quillRef.current.querySelector(
                  ".ql-editor"
                ) as HTMLElement;
              }

              // Also try to find from document (fallback)
              if (!editorElement) {
                const allEditors = document.querySelectorAll(".ql-editor");
                if (allEditors.length > 0) {
                  // Find the one within our component
                  for (let i = 0; i < allEditors.length; i++) {
                    const el = allEditors[i] as HTMLElement;
                    if (quillRef.current && quillRef.current.contains(el)) {
                      editorElement = el;
                      break;
                    }
                  }
                }
              }

              attempts++;
            }

            if (!editorElement) {
              console.error(
                "Editor element (.ql-editor) not found after retries. Container:",
                quillRef.current
              );
              setPendingImages((prev) =>
                prev.filter((img) => img.id !== imageId)
              );
              alert("Editor not ready. Please wait a moment and try again.");
              return;
            }

            // Insert image using data URL
            // Try to use Quill API if available (better insertion)
            // First try cached instance
            let quill: any = quillEditorRef.current;

            // If not cached, try to find Quill instance from DOM
            if (!quill) {
              // Method 1: From element's __quill property
              quill = (editorElement as any).__quill;

              // Method 2: Using Quill.find (if available)
              if (!quill && (window as any).Quill) {
                quill = (window as any).Quill.find(editorElement);
              }

              // Method 3: From parent container
              if (!quill && quillRef.current) {
                const qlContainer =
                  quillRef.current.querySelector(".ql-container");
                if (qlContainer && (qlContainer as any).__quill) {
                  quill = (qlContainer as any).__quill;
                }
              }

              // Cache if found
              if (quill) {
                quillEditorRef.current = quill;
              }
            }

            // Try Quill API first (best method)
            let inserted = false;

            if (
              quill &&
              typeof quill.getSelection === "function" &&
              typeof quill.insertEmbed === "function"
            ) {
              try {
                const selection = quill.getSelection(true);
                let index = 0;

                if (selection && selection.index !== null) {
                  index = selection.index;
                } else {
                  const length = quill.getLength();
                  index = Math.max(0, length - 1);
                }

                // Use insertEmbed - Quill's native method for images
                quill.insertEmbed(index, "image", dataUrl, "user");

                // Set data attribute after insertion
                setTimeout(() => {
                  const imgElements = quill.root.querySelectorAll(
                    `img[src="${dataUrl}"]`
                  );
                  if (imgElements.length > 0) {
                    const imgEl = imgElements[0] as HTMLImageElement;
                    imgEl.setAttribute("data-pending-id", imageId);
                    // Ensure image is visible
                    imgEl.style.maxWidth = "100%";
                    imgEl.style.height = "auto";
                    imgEl.style.display = "block";
                  }
                }, 50);

                quill.setSelection(index + 1);

                // Update content immediately
                setTimeout(() => {
                  const content = quill.root.innerHTML;
                  if (content !== value) {
                    onChange(content);
                  }
                }, 100);

                inserted = true;
              } catch (error) {
                console.warn("Quill insertEmbed failed:", error);
              }
            }

            // Fallback: Use pasteHTML if available
            if (!inserted && quill && typeof quill.pasteHTML === "function") {
              try {
                const selection = quill.getSelection(true);
                let index = 0;

                if (selection && selection.index !== null) {
                  index = selection.index;
                } else {
                  const length = quill.getLength();
                  index = Math.max(0, length - 1);
                }

                // Escape dataUrl for HTML
                const escapedUrl = dataUrl.replace(/"/g, "&quot;");
                quill.pasteHTML(
                  index,
                  `<img src="${escapedUrl}" data-pending-id="${imageId}" style="max-width: 100%; height: auto; display: block;" />`,
                  "user"
                );
                quill.setSelection(index + 1);

                setTimeout(() => {
                  const content = quill.root.innerHTML;
                  if (content !== value) {
                    onChange(content);
                  }
                }, 100);

                inserted = true;
              } catch (error) {
                console.warn("Quill pasteHTML failed:", error);
              }
            }

            // Final fallback: Direct DOM manipulation
            if (!inserted) {
              // Create image element
              const img = document.createElement("img");
              img.src = dataUrl;
              img.setAttribute("data-pending-id", imageId);
              img.setAttribute("alt", "");
              img.style.maxWidth = "100%";
              img.style.height = "auto";
              img.style.display = "block";
              img.style.margin = "10px 0";

              const selection = window.getSelection();

              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);

                // Check if range is within editor
                if (editorElement.contains(range.commonAncestorContainer)) {
                  // Insert image at cursor
                  range.insertNode(img);
                  range.setStartAfter(img);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } else {
                  // Cursor not in editor, append at end
                  editorElement.appendChild(img);
                }
              } else {
                // No selection, append at end
                editorElement.appendChild(img);
              }

              // Trigger onChange
              setTimeout(() => {
                const updatedContent = editorElement.innerHTML;
                if (updatedContent !== value) {
                  onChange(updatedContent);
                }
              }, 100);
            }
          };

          reader.onerror = () => {
            alert("Failed to read image file");
          };

          reader.readAsDataURL(file);
        } catch (error: any) {
          console.error("Error adding image:", error);
          alert(`Failed to add image: ${error.message || "Unknown error"}`);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Empty dependency array - function never changes
  );

  // Quill modules configuration - stable, doesn't recreate on blogSlug change
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          [{ script: "sub" }, { script: "super" }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["code-block"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler] // Only depends on imageHandler, which is stable
  );

  // Quill formats
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "script",
    "color",
    "background",
    "align",
    "link",
    "image",
    "video",
    "code-block",
  ];

  const isDark = theme === "dark";

  if (!mounted) {
    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="min-h-[300px] border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-white dark:bg-neutral-800">
          <p className="text-neutral-500 dark:text-neutral-400">
            Loading editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rich-text-editor ${className} ${isDark ? "dark-mode" : "light-mode"}`}
    >
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 16px;
          min-height: 300px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: ${isDark ? "#9ca3af" : "#6b7280"};
          font-style: normal;
        }
        ${isDark
          ? `
        .rich-text-editor.dark-mode .ql-toolbar {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-stroke {
          stroke: #d1d5db !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-fill {
          fill: #d1d5db !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar button:hover,
        .rich-text-editor.dark-mode .ql-toolbar button.ql-active {
          background-color: #374151 !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-picker-label {
          color: #d1d5db !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-picker-options {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #d1d5db !important;
        }
        .rich-text-editor.dark-mode .ql-toolbar .ql-picker-item {
          color: #d1d5db !important;
        }
        .rich-text-editor.dark-mode .ql-container {
          background-color: #111827 !important;
          border-color: #374151 !important;
        }
        .rich-text-editor.dark-mode .ql-editor {
          color: #f9fafb !important;
          background-color: #111827 !important;
        }
        .rich-text-editor.dark-mode .ql-editor p,
        .rich-text-editor.dark-mode .ql-editor h1,
        .rich-text-editor.dark-mode .ql-editor h2,
        .rich-text-editor.dark-mode .ql-editor h3,
        .rich-text-editor.dark-mode .ql-editor h4,
        .rich-text-editor.dark-mode .ql-editor h5,
        .rich-text-editor.dark-mode .ql-editor h6,
        .rich-text-editor.dark-mode .ql-editor li,
        .rich-text-editor.dark-mode .ql-editor span,
        .rich-text-editor.dark-mode .ql-editor div {
          color: #f9fafb !important;
        }
        .rich-text-editor.dark-mode .ql-editor.ql-blank::before {
          color: #9ca3af !important;
        }
        `
          : `
        .rich-text-editor.light-mode .ql-toolbar {
          background-color: #f9fafb !important;
          border-color: #e5e7eb !important;
        }
        .rich-text-editor.light-mode .ql-container {
          background-color: #ffffff !important;
          border-color: #e5e7eb !important;
        }
        .rich-text-editor.light-mode .ql-editor {
          color: #111827 !important;
          background-color: #ffffff !important;
        }
        `}
      `}</style>
      <div className="rich-text-editor-wrapper">
        <div ref={quillRef} data-testid={testId}>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
