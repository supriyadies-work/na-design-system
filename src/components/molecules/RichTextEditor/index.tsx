"use client";

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { PendingImage } from "@/lib/helpers/pendingImageUpload";
import type { IconName } from "@/components/atoms/Icon";
import { Icon } from "@/components/atoms/Icon";
import "react-quill-new/dist/quill.snow.css";

// Store Quill from react-quill-new when it loads (Quill 2 doesn't use __quill on DOM)
let QuillClass: { find: (el: HTMLElement) => any } | null = null;

const SLASH_COMMANDS: { key: string; label: string; icon: IconName }[] = [
  { key: "image", label: "Insert Image", icon: "image" },
  { key: "link", label: "Create Link", icon: "link" },
  { key: "collapsible", label: "Collapsible", icon: "collapsible" },
  { key: "number", label: "Numbered List", icon: "listNumber" },
  { key: "pullquote", label: "Pull Quote", icon: "formatQuote" },
  { key: "blockquote", label: "Block Quote", icon: "formatQuote" },
];

// Dynamic import untuk avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const mod = await import("react-quill-new");
    const Quill = mod.Quill as typeof import("quill").default;
    QuillClass = Quill;

    const Block = Quill.import("blots/block") as any;

    // -------------------------------------------------------------------------
    // COLLAPSIBLE: linear only. Satu Block (header) + body = paragraph biasa.
    // Tidak ada Container. Toggle via CSS sibling (.ql-collapsible-header + *).
    // -------------------------------------------------------------------------

    class DetailsSummary extends Block {
      static blotName = "details-summary";
      static tagName = "DIV";

      static create(value?: unknown) {
        const node = super.create(value) as HTMLElement;
        node.classList.add("ql-collapsible-header");
        return node;
      }
    }

    Quill.register(DetailsSummary);

    return mod.default;
  },
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] border border-neutral-300 dark:border-neutral-600 rounded-lg p-4 bg-white dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">
          Loading editor...
        </p>
      </div>
    ),
  }
);

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
  const quillRef = useRef<any>(null); // Container div ref
  const quillEditorRef = useRef<any>(null); // Quill editor instance
  const blogSlugRef = useRef<string | undefined>(blogSlug);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [quillReady, setQuillReady] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });

  // Helper to capture Quill instance from DOM (Quill 2 uses Quill.find(), not __quill)
  const captureQuillInstance = useCallback(() => {
    if (quillEditorRef.current) return true;
    if (!quillRef.current || !QuillClass) return false;

    const container = quillRef.current;
    const qlContainer = container.querySelector(".ql-container");
    if (!qlContainer) return false;

    try {
      const quillInstance = QuillClass.find(qlContainer);
      if (quillInstance && quillInstance.root) {
        quillEditorRef.current = quillInstance;
        setQuillReady(true);
        return true;
      }
    } catch {
      // Quill.find may throw if not ready
    }
    return false;
  }, []);

  // Try to capture Quill instance when onChange fires
  const handleEditorChange = useCallback(
    (content: string) => {
      onChange(content);
      captureQuillInstance();
    },
    [onChange, captureQuillInstance]
  );

  // Callback for selection change to trigger Quill instance capture
  const handleChangeSelection = useCallback(() => {
    captureQuillInstance();
  }, [captureQuillInstance]);

  // Callback for focus to trigger Quill instance capture
  const handleFocus = useCallback(() => {
    captureQuillInstance();
  }, [captureQuillInstance]);

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

  // Setup Quill editor instance - poll until we capture (Quill loads async)
  useEffect(() => {
    if (!mounted || (quillReady && quillEditorRef.current)) return;

    const setupEditor = (): boolean => {
      if (quillEditorRef.current) {
        if (!quillReady) setQuillReady(true);
        return true;
      }
      if (!quillRef.current || !QuillClass) return false;

      const container = quillRef.current;
      const qlContainer = container.querySelector(".ql-container");
      if (!qlContainer) return false;

      try {
        const quillInstance = QuillClass.find(qlContainer);
        if (quillInstance && quillInstance.root) {
          quillEditorRef.current = quillInstance;
          setQuillReady(true);
          return true;
        }
      } catch {
        // Quill.find may throw if not ready
      }
      return false;
    };

    let attempts = 0;
    const maxAttempts = 54;
    const poll = setInterval(() => {
      if (setupEditor() || ++attempts >= maxAttempts) clearInterval(poll);
    }, 150);

    return () => clearInterval(poll);
  }, [mounted, quillReady]);

  // Handle text selection and show tooltip (runs when Quill is ready)
  useEffect(() => {
    if (!mounted || !quillReady || !quillEditorRef.current) return;

    const quill = quillEditorRef.current;
    const editorElement = quill.root;

    const updateTooltipPosition = (range: {
      index: number;
      length: number;
    }) => {
      const bounds = quill.getBounds(range.index, range.length);
      if (!bounds) return;

      const editorRect = editorElement.getBoundingClientRect();
      const tooltipTop = editorRect.top + bounds.top - 48;
      const tooltipLeft = editorRect.left + bounds.left + bounds.width / 2;

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
      setShowTooltip(true);
    };

    const handleSelectionChange = (range: any) => {
      if (!range || range.length === 0) {
        setShowTooltip(false);
        return;
      }

      const selectedText = quill.getText(range.index, range.length);
      if (!selectedText || selectedText.trim().length === 0) {
        setShowTooltip(false);
        return;
      }

      updateTooltipPosition(range);
    };

    // Quill selection-change: (newRange, oldRange, source)
    quill.on("selection-change", handleSelectionChange);

    const onMouseUp = () => {
      requestAnimationFrame(() => {
        const sel = quill.getSelection(true);
        if (sel && sel.length > 0) handleSelectionChange(sel);
      });
    };

    editorElement.addEventListener("mouseup", onMouseUp);
    editorElement.addEventListener("keyup", onMouseUp);

    // Throttled scroll handler to prevent jitter
    let scrollFrameId: number | null = null;
    const onScroll = () => {
      // Don't update tooltip position during manual scroll to prevent conflicts
      if (isScrollingRef.current) return;

      // Use requestAnimationFrame for smooth updates
      if (scrollFrameId === null) {
        scrollFrameId = requestAnimationFrame(() => {
          const sel = quill.getSelection(true);
          if (sel && sel.length > 0) {
            updateTooltipPosition(sel);
          }
          scrollFrameId = null;
        });
      }
    };

    // Only listen to editor scroll, not window scroll (prevents double events)
    editorElement.addEventListener("scroll", onScroll);

    // Detect manual scroll to prevent tooltip updates during scroll
    const handleScrollStart = () => {
      isScrollingRef.current = true;

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Re-enable tooltip updates after scrolling stops (150ms debounce)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    };

    editorElement.addEventListener("scroll", handleScrollStart);

    return () => {
      quill.off("selection-change", handleSelectionChange);
      editorElement.removeEventListener("mouseup", onMouseUp);
      editorElement.removeEventListener("keyup", onMouseUp);
      editorElement.removeEventListener("scroll", onScroll);
      editorElement.removeEventListener("scroll", handleScrollStart);
      if (scrollFrameId !== null) {
        cancelAnimationFrame(scrollFrameId);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [mounted, quillReady]);

  // Fallback: open slash menu on "/" at line start via keydown (Quill keyboard binding may not fire)
  useEffect(() => {
    if (!mounted || !quillReady || !quillEditorRef.current) return;
    const quill = quillEditorRef.current;
    const editorElement = quill.root;

    const onSlashKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.defaultPrevented || e.isComposing) return;
      const range = quill.getSelection();
      if (range == null || !quill.hasFocus()) return;
      try {
        const [line, offset] = quill.getLine(range.index);
        if (!line || offset !== 0) return;
        e.preventDefault();
        quill.insertText(range.index, "/", "user");
        quill.setSelection(range.index + 1);
        requestAnimationFrame(() => {
          const bounds = quill.getBounds(range.index);
          if (!bounds) return;
          const editorRect = editorElement.getBoundingClientRect();
          setSlashQuery("");
          setShowSlashMenu(true);
          setSlashPosition({
            top: editorRect.top + bounds.top + bounds.height,
            left: editorRect.left + bounds.left,
          });
        });
      } catch {
        // ignore
      }
    };

    editorElement.addEventListener("keydown", onSlashKeyDown, true);
    return () => editorElement.removeEventListener("keydown", onSlashKeyDown, true);
  }, [mounted, quillReady]);

  // Collapsible grouping logic (stable multi-line support)
  useEffect(() => {
    if (!mounted || !quillReady || !quillEditorRef.current) return;

    const editor = quillEditorRef.current.root as HTMLElement;

    const onClick = (e: MouseEvent) => {
      const header = (e.target as HTMLElement)?.closest(".ql-collapsible-header");
      if (!header) return;

      const isOpen = header.classList.toggle("is-open");

      let next = header.nextElementSibling as HTMLElement | null;

      while (next) {
        if (next.classList.contains("ql-collapsible-header")) break;
        if (!next.classList.contains("ql-collapsible-body")) break;
      
        if (isOpen) {
          next.classList.add("is-open");
        } else {
          next.classList.remove("is-open");
        }
      
        next = next.nextElementSibling as HTMLElement | null;
      }
    };

    editor.addEventListener("click", onClick);
    return () => editor.removeEventListener("click", onClick);
  }, [mounted, quillReady]);

  // Slash command: update query when user types after "/" (only while menu is open)
  useEffect(() => {
    if (!showSlashMenu || !quillEditorRef.current) return;

    const quill = quillEditorRef.current;

    const updateQuery = () => {
      const range = quill.getSelection(true);
      if (!range) return;

      try {
        const [line, _offset] = quill.getLine(range.index);
        if (!line?.domNode) return;

        const text = (line.domNode as HTMLElement).textContent ?? "";
        if (!text.startsWith("/")) {
          setShowSlashMenu(false);
          return;
        }
        setSlashQuery(text.slice(1));
      } catch {
        setShowSlashMenu(false);
      }
    };

    quill.on("text-change", updateQuery);
    return () => quill.off("text-change", updateQuery);
  }, [showSlashMenu]);

  // Hide tooltip when clicking outside
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const alignMenu = document.getElementById("align-menu");
      const fontMenu = document.getElementById("font-menu");

      // Close dropdowns if clicking outside
      if (alignMenu && !alignMenu.contains(target)) {
        alignMenu.style.display = "none";
      }
      if (fontMenu && !fontMenu.contains(target)) {
        fontMenu.style.display = "none";
      }

      // Hide tooltip if clicking outside both tooltip and editor
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(target) &&
        quillRef.current &&
        !quillRef.current.contains(target) &&
        alignMenu &&
        !alignMenu.contains(target) &&
        fontMenu &&
        !fontMenu.contains(target)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTooltip]);

  // Close slash menu on Escape or click outside
  useEffect(() => {
    if (!showSlashMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSlashMenu(false);
    };
    const handleClickOutsideSlash = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        slashMenuRef.current &&
        !slashMenuRef.current.contains(target) &&
        quillRef.current &&
        !quillRef.current.contains(target)
      ) {
        setShowSlashMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutsideSlash);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutsideSlash);
    };
  }, [showSlashMenu]);

  // Quick action handlers
  const handleLink = useCallback(() => {
    const quill = quillEditorRef.current;
    if (!quill) return;

    const selection = quill.getSelection(true);
    if (!selection || selection.length === 0) return;

    const url = prompt("Enter URL:");
    if (!url) return;

    quill.format("link", url);

    // Close dropdowns
    const alignMenu = document.getElementById("align-menu");
    const fontMenu = document.getElementById("font-menu");
    if (alignMenu) alignMenu.style.display = "none";
    if (fontMenu) fontMenu.style.display = "none";

    setShowTooltip(false);
  }, []);

  const handleAlign = useCallback((align: string) => {
    const quill = quillEditorRef.current;
    if (!quill) return;

    const selection = quill.getSelection(true);
    if (!selection) return;

    quill.format("align", align);

    // Close dropdowns
    const alignMenu = document.getElementById("align-menu");
    const fontMenu = document.getElementById("font-menu");
    if (alignMenu) alignMenu.style.display = "none";
    if (fontMenu) fontMenu.style.display = "none";

    setShowTooltip(false);
  }, []);

  const handleFontStyle = useCallback((style: string) => {
    const quill = quillEditorRef.current;
    if (!quill) return;

    const selection = quill.getSelection(true);
    if (!selection) return;

    if (style === "bold") {
      quill.format("bold", !quill.getFormat(selection).bold);
    } else if (style === "italic") {
      quill.format("italic", !quill.getFormat(selection).italic);
    } else if (style === "underline") {
      quill.format("underline", !quill.getFormat(selection).underline);
    }

    // Close dropdowns
    const alignMenu = document.getElementById("align-menu");
    const fontMenu = document.getElementById("font-menu");
    if (alignMenu) alignMenu.style.display = "none";
    if (fontMenu) fontMenu.style.display = "none";

    setShowTooltip(false);
  }, []);

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
        if (!file.type?.startsWith("image/")) {
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

            // Fallback: try to find Quill instance from DOM (Quill 2: pass .ql-container to find)
            if (!quill && QuillClass && quillRef.current) {
              const container = quillRef.current;
              const qlContainer = container.querySelector(".ql-container");
              if (qlContainer) {
                try {
                  quill = QuillClass.find(qlContainer);
                } catch (e) {
                  // Quill.find may throw
                }
              }
            }

            // Cache if found
            if (quill && !quillEditorRef.current) {
              quillEditorRef.current = quill;
              setQuillReady(true);
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

  // Execute slash command: remove "/command" text then run Quill action
  const handleSlashCommand = useCallback(
    (command: { key: string; label: string }) => {
      const quill = quillEditorRef.current;
      if (!quill) return;

      const range = quill.getSelection(true);
      if (!range) return;

      let lineStartIndex = 0;
      let textLength = 0;
      try {
        const [line, offset] = quill.getLine(range.index);
        if (line != null && typeof offset === "number") {
          lineStartIndex = range.index - offset;
          textLength = offset;
        }
      } catch {
        const textBeforeCursor = quill.getText(0, range.index);
        const lineStartInText = textBeforeCursor.lastIndexOf("\n") + 1;
        const lineText = textBeforeCursor.slice(lineStartInText);
        if (!lineText.startsWith("/")) return;
        lineStartIndex = range.index - lineText.length;
        textLength = lineText.length;
      }
      if (textLength <= 0) return;
      quill.deleteText(lineStartIndex, textLength, "user");

      switch (command.key) {
        case "image":
          imageHandler();
          break;
        case "link": {
          const sel = quill.getSelection(true);
          if (sel && sel.length > 0) {
            const url = prompt("Enter URL:");
            if (url) quill.format("link", url);
          }
          break;
        }
        case "collapsible": {
          const index = lineStartIndex;
        
          quill.insertText(index, "Header\n", { "details-summary": true });
          quill.insertText(index + 7, "\n"); 
        
          setTimeout(() => {
            const headers = quill.root.querySelectorAll(".ql-collapsible-header");
            const lastHeader = headers[headers.length - 1] as HTMLElement;
            if (lastHeader) {
              lastHeader.classList.add("is-open");
        
              let next = lastHeader.nextElementSibling as HTMLElement | null;
              if (next) {
                next.classList.add("ql-collapsible-body");
                next.classList.add("is-open");
              }
            }
          }, 0);
        
          quill.setSelection(index + 8);
          break;
        }
        case "number":
          quill.format("list", "ordered");
          break;
        case "blockquote":
          quill.format("blockquote", true);
          break;
        case "pullquote":
          quill.format("blockquote", true);
          try {
            const cur = quill.getSelection(true);
            if (cur) {
              const [leaf] = quill.getLeaf(cur.index);
              let node = leaf?.domNode as HTMLElement | undefined;
              while (node && node !== quill.root) {
                if (node.classList) {
                  node.classList.add("pull-quote");
                  break;
                }
                node = node.parentElement ?? undefined;
              }
            }
          } catch {
            // ignore if getLeaf not available
          }
          break;
        default:
          break;
      }

      setShowSlashMenu(false);
      quill.focus();
    },
    [imageHandler]
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
      keyboard: {
        bindings: {
          deleteDetailsContainer: {
            key: "Backspace",
            collapsed: true,
            handler(this: { quill: any }, range: { index: number }) {
              const quill = this.quill;
              if (!quill) return true;

              const [line] = quill.getLine(range.index);
              if (!line) return true;

              if (line.statics?.blotName === "details-summary") {
                const text = (line.domNode?.textContent ?? "").trim();

                if (text.length === 0) {
                  if (line.next) line.next.remove();
                  line.remove();
                  return false;
                }
              }

              return true;
            },
          },
          slash: {
            key: "/",
            handler(
              this: { quill: any },
              range: { index: number },
              _context: unknown
            ) {
              const quill = this.quill;
              if (!quill) return true;

              try {
                const [line, offset] = quill.getLine(range.index);
                if (!line || offset !== 0) return true;

                requestAnimationFrame(() => {
                  const bounds = quill.getBounds(range.index);
                  if (!bounds) return;
                  const editorRect = quill.root.getBoundingClientRect();
                  setSlashQuery("");
                  setShowSlashMenu(true);
                  setSlashPosition({
                    top: editorRect.top + bounds.top + bounds.height,
                    left: editorRect.left + bounds.left,
                  });
                });
              } catch {
                // ignore
              }
              return true;
            },
          },
          enterInCollapsible: {
            key: "Enter",
            handler: function (this: { quill: any }, range: any) {
              const quill = this.quill;
              if (!quill) return true;
          
              const [line] = quill.getLine(range.index);
              if (!line) return true;
          
              const node = line.domNode as HTMLElement;
              const text = node.textContent ?? "";
          
              let prev = node.previousElementSibling as HTMLElement | null;
              let activeHeader: HTMLElement | null = null;
              let insideCollapsible = true;
          
              while (prev) {
                if (prev.classList.contains("ql-collapsible-header")) {
                  activeHeader = prev;
                  break;
                }
          
                // Kalau ketemu block yg bukan body → berarti sudah keluar
                if (!prev.classList.contains("ql-collapsible-body")) {
                  insideCollapsible = false;
                  break;
                }
          
                prev = prev.previousElementSibling as HTMLElement | null;
              }
          
              if (!activeHeader || !insideCollapsible) {
                return true;
              }
          
              if (text.trim() === "") {
                node.classList.remove("ql-collapsible-body");
                node.classList.remove("is-open");
              
                return true;
              }
          
              setTimeout(() => {
                const [newLine] = quill.getLine(range.index + 1);
                if (newLine) {
                  const newNode = newLine.domNode as HTMLElement;
                  newNode.classList.add("ql-collapsible-body");
                  newNode.classList.add("is-open");
                }
              }, 0);
          
              return true;
            },
          },
        },
      },
    }),
    [imageHandler] // Only depends on imageHandler, which is stable
  );

  // Quill formats - "bullet" is a VALUE of "list" format, not a separate format
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
    "indent",
    "script",
    "color",
    "background",
    "align",
    "link",
    "image",
    "video",
    "code-block",
    "details-summary",
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

  const editorStyles = `
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
    .rich-text-editor .ql-editor details {
      margin: 12px 0;
    }
    .rich-text-editor .ql-editor .ql-collapsible-header {
      margin: 12px 0 0;
      cursor: pointer;
      font-weight: 600;
      padding-left: 1.25rem;
      position: relative;
    }
    .rich-text-editor .ql-editor .ql-collapsible-header::before {
      content: "";
      border-left: 5px solid currentColor;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      position: absolute;
      left: 0;
      top: 0.5em;
      transition: transform 0.15s ease;
    }
    .rich-text-editor .ql-editor .ql-collapsible-header.is-open::before {
      transform: rotate(90deg);
    }
    .rich-text-editor .ql-editor .ql-collapsible-header + * {
      display: none;
    }
    .rich-text-editor .ql-editor .ql-collapsible-end {
      height: 0;
      padding: 0;
      margin: 0;
    }
    .rich-text-editor .ql-editor .ql-collapsible-header.is-open + * {
      display: block;
      padding-top: 8px;
      padding-left: 1.25rem;
      margin-left: 0.25rem;
      border-left: 2px solid ${isDark ? "#374151" : "#e5e7eb"};
    }
    .rich-text-editor .ql-editor details summary {
      list-style: none;
      cursor: pointer;
      font-weight: 600;
      pointer-events: auto;
    }
    .rich-text-editor .ql-editor details .ql-details-content {
      border-top: 1px solid ${isDark ? "#374151" : "#e5e7eb"};
      padding-top: 8px;
    }
    .rich-text-editor .ql-editor .ql-collapsible-body {
      display: none;
    }
    .rich-text-editor .ql-editor .ql-collapsible-body.is-open {
      display: block;
      padding-left: 1.25rem;
      margin-left: 0.25rem;
      border-left: 2px solid ${isDark ? "#374151" : "#e5e7eb"};
    }
    .rich-text-editor .ql-editor details[open] summary {
      margin-bottom: 8px;
    }
    ${
      isDark
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
    `
    }
  `;

  return (
    <div
      className={`rich-text-editor ${className} ${isDark ? "dark-mode" : "light-mode"}`}
    >
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      <div
        className="rich-text-editor-wrapper"
        style={{ position: "relative" }}
      >
        <div ref={quillRef} data-testid={testId}>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={handleEditorChange}
            onChangeSelection={handleChangeSelection}
            onFocus={handleFocus}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        </div>
        {/* Slash command menu */}
        {showSlashMenu && (() => {
            const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
              cmd.key.includes(slashQuery.toLowerCase())
            );
            return (
              <div
                ref={slashMenuRef}
                className="slash-menu"
                style={{
                  position: "fixed",
                  top: `${slashPosition.top}px`,
                  left: `${slashPosition.left}px`,
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  padding: "4px 0",
                  minWidth: "180px",
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                {slashQuery === "" && (
                  <div
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      color: isDark ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    Type to filter commands…
                  </div>
                )}
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.key}
                    type="button"
                    onClick={() => handleSlashCommand(cmd)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: isDark ? "#e5e7eb" : "#374151",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? "#374151"
                        : "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon
                      name={cmd.icon}
                      size="sm"
                      className="shrink-0"
                    />
                    {cmd.label}
                  </button>
                ))}
              </div>
            );
          })()}
        {/* Selection Tooltip */}
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="selection-tooltip"
            style={{
              position: "fixed",
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translateX(-50%)",
              zIndex: 1000,
              display: "flex",
              gap: "4px",
              padding: "6px 8px",
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "6px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Link Button */}
            <button
              type="button"
              onClick={handleLink}
              className="tooltip-button"
              title="Add Link"
              style={{
                padding: "4px 8px",
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                color: isDark ? "#d1d5db" : "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? "#374151"
                  : "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              🔗
            </button>

            {/* Align Text Dropdown */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                type="button"
                className="tooltip-button"
                title="Align Text"
                style={{
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: isDark ? "#d1d5db" : "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#374151"
                    : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const alignMenu = document.getElementById("align-menu");
                  const fontMenu = document.getElementById("font-menu");
                  if (alignMenu) {
                    alignMenu.style.display =
                      alignMenu.style.display === "block" ? "none" : "block";
                  }
                  // Close font menu if open
                  if (fontMenu) {
                    fontMenu.style.display = "none";
                  }
                }}
              >
                ⬌
              </button>
              <div
                id="align-menu"
                style={{
                  display: "none",
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginTop: "4px",
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  padding: "4px",
                  minWidth: "120px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAlign("")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  ⬅ Left
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("center")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  ⬌ Center
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign("right")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  ➡ Right
                </button>
              </div>
            </div>

            {/* Font Style Dropdown */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                type="button"
                className="tooltip-button"
                title="Font Style"
                style={{
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: isDark ? "#d1d5db" : "#374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#374151"
                    : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const fontMenu = document.getElementById("font-menu");
                  const alignMenu = document.getElementById("align-menu");
                  if (fontMenu) {
                    fontMenu.style.display =
                      fontMenu.style.display === "block" ? "none" : "block";
                  }
                  // Close align menu if open
                  if (alignMenu) {
                    alignMenu.style.display = "none";
                  }
                }}
              >
                A
              </button>
              <div
                id="font-menu"
                style={{
                  display: "none",
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  marginTop: "4px",
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  padding: "4px",
                  minWidth: "120px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleFontStyle("bold")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <strong>Bold</strong>
                </button>
                <button
                  type="button"
                  onClick={() => handleFontStyle("italic")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <em>Italic</em>
                </button>
                <button
                  type="button"
                  onClick={() => handleFontStyle("underline")}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: "14px",
                    textDecoration: "underline",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#374151"
                      : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <u>Underline</u>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
