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
import LinkEditorModal from "@/components/molecules/Modal/LinkEditorModal";


import "react-quill-new/dist/quill.snow.css";
import Delta from "quill-delta";

// Compress an image file on the client so its size is below maxBytes.
// Keeps original dimensions and adjusts JPEG/WebP quality.
async function compressImageFile(file: File, maxBytes: number): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= maxBytes) return file;

  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const ratio = maxBytes / file.size;
    let quality = Math.min(0.92, Math.max(0.4, ratio));

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(
        (b) => resolve(b),
        file.type === "image/png" || file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg",
        quality
      )
    );

    if (!blob) return file;

    let finalBlob = blob;
    if (finalBlob.size > maxBytes) {
      const secondQuality = Math.max(0.25, quality * 0.7);
      const secondBlob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(
          (b) => resolve(b),
          file.type === "image/png" || file.type === "image/webp"
            ? "image/webp"
            : "image/jpeg",
          secondQuality
        )
      );
      if (secondBlob && secondBlob.size < finalBlob.size) {
        finalBlob = secondBlob;
      }
    }

    if (finalBlob.size > maxBytes) {
      return file;
    }

    return new File([finalBlob], file.name, {
      type: finalBlob.type || file.type,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

// Store Quill from react-quill-new when it loads (Quill 2 doesn't use __quill on DOM)
let QuillClass: { find: (el: HTMLElement) => any } | null = null;

function normalizeOrphanCollapsibleHtml(input: string): string {
  if (!input.includes("ql-collapsible-header")) return input;
  const root = document.createElement("div");
  root.innerHTML = input;
  let changed = false;

  const directChildren = Array.from(root.children);
  for (const child of directChildren) {
    if (!(child instanceof HTMLElement)) continue;
    if (!child.classList.contains("ql-collapsible-header")) continue;

    const wrapper = document.createElement("div");
    wrapper.className = "ql-collapsible";
    wrapper.setAttribute("data-open", "true");

    const header = child.cloneNode(true) as HTMLElement;
    const content = document.createElement("div");
    content.className = "ql-collapsible-content";
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    content.appendChild(p);

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    root.replaceChild(wrapper, child);
    changed = true;
  }

  return changed ? root.innerHTML : input;
}

/**
 * Fix HTML where a link block was serialized outside .ql-collapsible (Quill/Delta
 * can emit it as next sibling). Move any immediate next sibling of .ql-collapsible
 * that is a single block containing a link into that collapsible's content area.
 */
function normalizeCollapsibleTrailingLink(input: string): string {
  if (typeof document === "undefined" || !input?.includes("ql-collapsible")) return input;
  try {
    const root = document.createElement("div");
    root.innerHTML = input;
    let changed = false;
    const containers = root.querySelectorAll(".ql-collapsible");
    containers.forEach((container) => {
      if (!(container instanceof HTMLElement)) return;
      const contentDiv = container.querySelector(".ql-collapsible-content");
      if (!contentDiv) return;
      while (container.nextElementSibling) {
        const sibling = container.nextElementSibling;
        if (!(sibling instanceof HTMLElement)) break;
        if (sibling.classList.contains("ql-collapsible")) break;
        if (sibling.tagName !== "P" && sibling.tagName !== "DIV") break;
        if (!sibling.querySelector("a")) break;
        contentDiv.appendChild(sibling);
        changed = true;
      }
    });
    return changed ? root.innerHTML : input;
  } catch {
    return input;
  }
}

/**
 * Insert collapsible at index via scroll API so the wrapper blot (collapsible)
 * exists. Delta insertion only creates header/content blocks, no container.
 * Do not call onChange — let Quill text-change trigger handleEditorChange.
 */
function insertCollapsibleAt(quill: any, index: number): void {
  try {
    const scroll = quill.scroll;

    const container = scroll.create("collapsible");
    const header = scroll.create("collapsible-header");
    const content = scroll.create("collapsible-content");
    const block = scroll.create("block");

    block.appendChild(scroll.create("break"));
    content.appendChild(block);

    header.appendChild(scroll.create("break"));

    container.appendChild(header);
    container.appendChild(content);

    const [line] = quill.getLine(index);
    const ref = line ? quill.constructor.find(line.domNode) : null;

    scroll.insertBefore(container, ref);

    quill.update("user");

    requestAnimationFrame(() => {
      try {
        const start = container.offset(scroll);
        quill.setSelection(start, 0, "silent");
        quill.focus();
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

/**
 * Returns true if the given index is inside a collapsible container (header or content).
 * Uses getLine(index) and walks up from the line's domNode.
 */
function isInsideCollapsible(quill: any, index: number): boolean {
  try {
    const [line] = quill.getLine(index);
    let node = line?.domNode as HTMLElement | null;
    while (node && node !== quill.root) {
      if (node.classList?.contains("ql-collapsible")) return true;
      node = node.parentElement;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * If the given index is inside a collapsible container (Quill often treats the
 * boundary after the container as still "inside"), return the index right after
 * that container so the next insert does not corrupt the collapsible.
 * Uses getLine(index) and walks up from the line's domNode so we detect
 * containment by block (line), not just leaf.
 */
function normalizeOutsideContainer(quill: any, index: number): number {
  let out = index;
  let found = false;
  let offset = -1;
  let len = -1;
  try {
    const [line] = quill.getLine(index);
    const startNode = line?.domNode as HTMLElement | null;
    let node = startNode;

    while (node && node !== quill.root) {
      if (node.classList?.contains("ql-collapsible")) {
        const blot = quill.constructor?.find?.(node);
        if (blot) {
          const scroll = quill.scroll;
          offset = blot.offset(scroll);
          len = blot.length();
          out = offset + len;
          found = true;
        }
        break;
      }
      node = node.parentElement;
    }
  } catch {
    // ignore
  }
  return out;
}

/** Find the range (index, length) of the first link with the given URL in the editor content. */
function getLinkRange(quill: any, url: string): { index: number; length: number } | null {
  if (!quill || typeof quill.getContents !== "function") return null;
  const delta = quill.getContents();
  if (!delta || !Array.isArray(delta.ops)) return null;
  let index = 0;
  for (const op of delta.ops) {
    const len = typeof op.insert === "string" ? op.insert.length : 1;
    if (op.attributes?.link === url) return { index, length: len };
    index += len;
  }
  return null;
}

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

    // Use only the same Quill instance (from react-quill-new) so custom blots are registered
    // on the same Quill that creates the editor. Avoid import("quill/blots/...") — it can
    // resolve to a different quill package in the consuming app and cause "Cannot register"
    // errors in production.
    const unwrap = (m: any) => (m?.default !== undefined ? m.default : m);
    let Block: any;
    let Container: any;
    let Break: any;
    try {
      if (typeof Quill.import === "function") {
        const blockMod = Quill.import("blots/block") as any;
        const containerVal = Quill.import("blots/container") as any;
        const breakVal = Quill.import("blots/break") as any;
        if (blockMod && containerVal && breakVal) {
          Block = unwrap(blockMod);
          Container = unwrap(containerVal);
          Break = unwrap(breakVal);
        }
      }
      if ((!Block || !Container || !Break) && Quill.imports && typeof Quill.imports === "object") {
        const b = (Quill.imports as any)["blots/block"];
        const c = (Quill.imports as any)["blots/container"];
        const br = (Quill.imports as any)["blots/break"];
        if (b && c && br) {
          Block = unwrap(b);
          Container = unwrap(c);
          Break = unwrap(br);
        }
      }
    } catch {
      /* ignore */
    }
    if (!Block || !Container || !Break) {
      throw new Error(
        "[RichTextEditor] Could not get Block/Container/Break from Quill (Quill.import or Quill.imports). " +
          "Ensure react-quill-new is installed and exposes the full Quill API. " +
          "Do not use a separate 'quill' package to avoid duplicate Quill instances."
      );
    }

    // -------------------------------------------------------------------------
    // COLLAPSIBLE: Container so content is real Block children — Enter, slash,
    // selection, and Delta all work inside content. Insert via scroll API, not
    // insert({ collapsible: true }), because Container is not an Embed.
    // -------------------------------------------------------------------------

    class CollapsibleHeader extends Block {
      static blotName = "collapsible-header";
      static tagName = "DIV";
      static className = "ql-collapsible-header";
    }

    class CollapsibleContent extends Container {
      static blotName = "collapsible-content";
      static tagName = "DIV";
      static className = "ql-collapsible-content";
      static allowedChildren = [Block];
      static defaultChild = Block;
    }

    class CollapsibleContainer extends Container {
      static blotName = "collapsible";
      static tagName = "DIV";
      static className = "ql-collapsible";
      static allowedChildren = [CollapsibleHeader, CollapsibleContent];

      static create(open: boolean = true) {
        const node = super.create() as HTMLElement;
        node.setAttribute("data-open", String(open));
        return node;
      }
    }

    Quill.register("blots/collapsible-header", CollapsibleHeader);
    Quill.register("blots/collapsible-content", CollapsibleContent);
    Quill.register("blots/collapsible", CollapsibleContainer);

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
  /** When provided, link hover will fetch preview via this callback. If omitted or fetch fails, fallback tooltip (URL only) is shown. */
  fetchLinkPreview?: (url: string) => Promise<{ title: string | null }>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  blogSlug,
  className = "",
  onPendingImagesChange,
  testId,
  fetchLinkPreview,
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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkDefaults, setLinkDefaults] = useState<{ text: string; url: string }>({
    text: "",
    url: "",
  });
  const linkSelectionRef = useRef<any>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchTargetUrlRef = useRef<string | null>(null);
  const previewCacheRef = useRef<Map<string, { title: string | null }>>(new Map());
  const hidePreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const linkRangeRef = useRef<{ index: number; length: number; text: string } | null>(null);
  const isRunningSlashCommandRef = useRef(false);
  /** When set by slash command, image handler should insert at this index (used after async file picker). */
  const pendingSlashInsertIndexRef = useRef<number | null>(null);
  const lastEnterKeydownAtRef = useRef(0);
  /** After initial paste we never re-inject HTML (would break custom blots). */
  const initialLoadRef = useRef(false);

  const [hoveredLink, setHoveredLink] = useState<{
    url: string;
    top: number;
    left: number;
  } | null>(null);

  const [linkPreviewData, setLinkPreviewData] = useState<{
    title?: string | null;
    loading: boolean;
  }>({ loading: false });

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

  // Semi-uncontrolled: push content to parent as-is. Do not normalize at runtime — that can
  // create mismatch with Quill's internal Delta and break custom blots. Normalize only on initial load.
  const handleEditorChange = useCallback(
    (content: string, _delta?: any, source?: string, _editor?: unknown) => {
      if (source === "api" || source === "silent") return;
      // Capture Quill first so we can read root.innerHTML; the string ReactQuill passes
      // can drop links/formatting inside custom blots (e.g. .ql-collapsible-content).
      captureQuillInstance();
      const q = quillEditorRef.current;
      const contentToEmit =
        q?.root != null ? q.root.innerHTML : typeof content === "string" ? content : "";
      if (contentToEmit === value) return;
      initialLoadRef.current = true;
      const html =
        typeof contentToEmit === "string" ? contentToEmit : content;
      const normalizedHtml =
        typeof html === "string" ? normalizeCollapsibleTrailingLink(html) : html;
      onChange(typeof normalizedHtml === "string" ? normalizedHtml : html);
    },
    [onChange, captureQuillInstance, value]
  );

  // Callback for selection change to trigger Quill instance capture
  const handleChangeSelection = useCallback(() => {
    captureQuillInstance();
  }, [captureQuillInstance]);

  // Callback for focus to trigger Quill instance capture
  const handleFocus = useCallback(() => {
    captureQuillInstance();
  }, [captureQuillInstance]);

  // Flush current editor HTML on blur so parent state is up to date (e.g. before Publish).
  // Ensures links and other content inside custom blots (e.g. .ql-collapsible-content) are saved.
  const handleBlur = useCallback(() => {
    if (!captureQuillInstance()) return;
    const q = quillEditorRef.current;
    if (!q?.root) return;
    const raw = q.root.innerHTML;
    if (raw === value) return;
    const normalized =
      typeof raw === "string" ? normalizeCollapsibleTrailingLink(raw) : raw;
    onChange(typeof normalized === "string" ? normalized : raw);
  }, [captureQuillInstance, onChange, value]);

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

  const normalizedValue = typeof value === "string" ? normalizeOrphanCollapsibleHtml(value) : value;

  // Initial load only: paste HTML once when editor is ready. Never re-inject after that —
  // clipboard.dangerouslyPasteHTML() parses HTML to Delta and does not preserve custom container blots.
  useEffect(() => {
    if (!quillReady) return;
    const quill = quillEditorRef.current;
    if (!quill?.clipboard?.dangerouslyPasteHTML) return;
    if (initialLoadRef.current) return;
    const normalized =
      typeof value === "string" ? normalizeOrphanCollapsibleHtml(value) : value;
    if (typeof normalized === "string") {
      quill.clipboard.dangerouslyPasteHTML(normalized);
    }
    initialLoadRef.current = true;
  }, [quillReady]);

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

  // Collapsible toggle: use click bubbling so Quill keeps selection/focus flow
  useEffect(() => {
    if (!mounted || !quillReady || !quillEditorRef.current) return;

    const editor = quillEditorRef.current.root as HTMLElement;

    const onClick = (e: MouseEvent) => {
      const header = (e.target as HTMLElement)?.closest(".ql-collapsible-header");
      if (!header) return;

      const container = header.parentElement;
      if (!container) return;
      let containerNode = container;
      let content = containerNode.querySelector(".ql-collapsible-content") as HTMLElement | null;
      if (!content && containerNode.classList.contains("ql-editor")) {
        // Repair orphan header in-place on user interaction.
        const wrapper = document.createElement("div");
        wrapper.className = "ql-collapsible";
        wrapper.setAttribute("data-open", "true");
        const contentNode = document.createElement("div");
        contentNode.className = "ql-collapsible-content";
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        contentNode.appendChild(p);
        const parent = header.parentElement;
        if (parent) {
          parent.replaceChild(wrapper, header);
          wrapper.appendChild(header);
          wrapper.appendChild(contentNode);
          containerNode = wrapper;
          content = contentNode;
          const q = quillEditorRef.current;
          if (q?.root)
            onChange(normalizeCollapsibleTrailingLink(q.root.innerHTML));
        }
      }
      if (!content) return;
      const open = containerNode.getAttribute("data-open") === "true";
      containerNode.setAttribute("data-open", String(!open));

      const q = quillEditorRef.current;
      if (q?.root)
        onChange(normalizeCollapsibleTrailingLink(q.root.innerHTML));
    };

    editor.addEventListener("click", onClick);
    return () => editor.removeEventListener("click", onClick);
  }, [mounted, quillReady, onChange]);

  useEffect(() => {
    if (!mounted || !quillReady || !quillEditorRef.current) return;
    const quill = quillEditorRef.current;
    const editor = quill.root as HTMLElement;
    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      lastEnterKeydownAtRef.current = Date.now();
    };
    const onTextChange = () => {
      // no-op; used only to pair with Enter keydown for timing
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement;
      const header = target?.closest?.(".ql-collapsible-header");
      if (!header) return;
      e.preventDefault();
      const container = header.parentElement;
      if (!container) return;
      try {
        const blot = quill.constructor?.find?.(container);
        if (blot?.children?.length) {
          const headerBlot = blot.children.head;
          const contentStart =
            blot.offset(quill.scroll) + (headerBlot?.length() ?? 0);
          quill.setSelection(contentStart, 0, "silent");
          quill.focus();
          return;
        }
      } catch {
        // fallback
      }
      const contentEl = container.querySelector(".ql-collapsible-content") as HTMLElement | null;
      if (contentEl) contentEl.focus();
      else quill.focus();
    };
    editor.addEventListener("keydown", onKeyDownCapture, true);
    editor.addEventListener("keydown", onKeyDown);
    quill.on("text-change", onTextChange);
    return () => {
      editor.removeEventListener("keydown", onKeyDownCapture, true);
      editor.removeEventListener("keydown", onKeyDown);
      quill.off("text-change", onTextChange);
    };
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

  const clearPreview = useCallback(() => {
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
      hidePreviewTimeoutRef.current = null;
    }
    linkRangeRef.current = null;
    fetchTargetUrlRef.current = null;
    setHoveredLink(null);
    setLinkPreviewData({ loading: false });
  }, []);

  const cancelHidePreview = useCallback(() => {
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
      hidePreviewTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
  if (!mounted || !quillReady || !quillEditorRef.current) return;

  const editor = quillEditorRef.current.root as HTMLElement;

  const handleMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a");

    if (!link) return;

    const rect = link.getBoundingClientRect();
    const url = link.getAttribute("href") || "";

    hoverTimeoutRef.current = setTimeout(() => {
      cancelHidePreview();
      const quill = quillEditorRef.current;
      const range = quill ? getLinkRange(quill, url) : null;
      const text = link ? (link.textContent || "").trim() : "";
      linkRangeRef.current =
        range ? { index: range.index, length: range.length, text } : null;
      setHoveredLink({
        url,
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });

      if (fetchLinkPreview) {
        const cached = previewCacheRef.current.get(url);
        if (cached !== undefined) {
          setLinkPreviewData({ title: cached.title, loading: false });
        } else {
          setLinkPreviewData({ loading: true });
          fetchTargetUrlRef.current = url;
          fetchLinkPreview(url)
            .then((data) => {
              const title =
                typeof data?.title === "string"
                  ? data.title
                  : (data as any)?.data?.title ?? null;
              const result = { title: title ?? null };
              if (fetchTargetUrlRef.current === url) {
                previewCacheRef.current.set(url, result);
                setLinkPreviewData({
                  ...result,
                  loading: false,
                });
              }
            })
            .catch(() => {
              if (fetchTargetUrlRef.current === url) {
                setLinkPreviewData({ loading: false });
              }
            });
        }
      }
    }, 150);
  };

  const handleMouseOut = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    cancelHidePreview();
    hidePreviewTimeoutRef.current = setTimeout(clearPreview, 200);
  };

  editor.addEventListener("mouseover", handleMouseOver);
  editor.addEventListener("mouseout", handleMouseOut);

  return () => {
    editor.removeEventListener("mouseover", handleMouseOver);
    editor.removeEventListener("mouseout", handleMouseOut);
    cancelHidePreview();
    if (hidePreviewTimeoutRef.current) {
      clearTimeout(hidePreviewTimeoutRef.current);
    }
  };
}, [mounted, quillReady, fetchLinkPreview, clearPreview, cancelHidePreview]);

  const applyLink = useCallback(
    ({ text, url }: { text: string; url: string }) => {
      const quill = quillEditorRef.current;
      if (!quill) return;
  
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }
  
      try {
        const parsed = new URL(finalUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return;
        }
      } catch {
        return;
      }
  
      const selection = linkSelectionRef.current;
  
      const displayText = text || finalUrl;
  
      if (selection && selection.length > 0) {
        quill.deleteText(selection.index, selection.length);
        quill.insertText(selection.index, displayText, { link: finalUrl });
        quill.setSelection(selection.index + displayText.length);
      } else {
        const index = selection?.index ?? quill.getLength();
        quill.insertText(index, displayText, { link: finalUrl });
        quill.setSelection(index + displayText.length);
      }
    },
    []
  );

  // Quick action handlers
  const handleLink = useCallback(() => {
    const quill = quillEditorRef.current;
    if (!quill) return;
  
    const selection = quill.getSelection(true);
    linkSelectionRef.current = selection;
  
    if (selection && selection.length > 0) {
      const selectedText = quill.getText(selection.index, selection.length);
      setLinkDefaults({ text: selectedText, url: "" });
    } else {
      setLinkDefaults({ text: "", url: "" });
    }
  
    setIsLinkModalOpen(true);
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

        // Validate file type
        if (!file.type?.startsWith("image/")) {
          alert("Please select an image file");
          return;
        }

        const MAX_BYTES = 5 * 1024 * 1024;
        let workingFile = file;

        if (file.size > MAX_BYTES) {
          try {
            workingFile = await compressImageFile(file, MAX_BYTES);
          } catch (err) {
            console.error("Error compressing editor image:", err);
            alert("Failed to compress image file");
            return;
          }

          if (workingFile.size > MAX_BYTES) {
            alert("Image size must be less than 5MB even after compression");
            return;
          }
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
              file: workingFile,
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
                const pendingIndex = pendingSlashInsertIndexRef.current;
                const selection = quill.getSelection(true);
                const index =
                  pendingIndex != null
                    ? pendingIndex
                    : selection?.index ?? Math.max(0, quill.getLength() - 1);
                if (pendingIndex != null) pendingSlashInsertIndexRef.current = null;
                quill.insertEmbed(index, "image", dataUrl, "user");
                quill.setSelection(index + 1);
                const contentAfterInsert = quill.root.innerHTML;
                if (contentAfterInsert !== value)
                  onChange(
                    normalizeCollapsibleTrailingLink(contentAfterInsert)
                  );
                setTimeout(() => {
                  const imgElements = quill.root.querySelectorAll(
                    `img[src="${dataUrl}"]`
                  );
                  if (imgElements.length > 0) {
                    const imgEl = imgElements[0] as HTMLImageElement;
                    imgEl.setAttribute("data-pending-id", imageId);
                    imgEl.style.maxWidth = "100%";
                    imgEl.style.height = "auto";
                    imgEl.style.display = "block";
                  }
                }, 50);
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
                    onChange(normalizeCollapsibleTrailingLink(content));
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
                  onChange(
                    normalizeCollapsibleTrailingLink(updatedContent)
                  );
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
      if (isRunningSlashCommandRef.current) return;
      isRunningSlashCommandRef.current = true;
      try {
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

        let insertIndex = lineStartIndex;
        if (!isInsideCollapsible(quill, insertIndex)) {
          insertIndex = normalizeOutsideContainer(quill, insertIndex);
        }
        quill.setSelection(insertIndex, 0, "silent");

        if (command.key === "image") {
          pendingSlashInsertIndexRef.current = insertIndex;
        } else {
          pendingSlashInsertIndexRef.current = null;
        }

        let shouldFocusAfterCommand = true;
        switch (command.key) {
        case "image":
          imageHandler();
          break;
        case "link": {
          handleLink();
          break;
        }
        case "collapsible": {
          try {
            insertCollapsibleAt(quill, insertIndex);
            shouldFocusAfterCommand = false;
          } catch {
            // ignore
          }
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
        if (shouldFocusAfterCommand) {
          quill.focus();
        }
      } finally {
        isRunningSlashCommandRef.current = false;
      }
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
          enter: {
            key: "Enter",
            collapsed: true,
            handler(this: any, range: any) {
              const quill = this.quill;
              if (!range) return true;

              const [line] = quill.getLine(range.index);
              if (!line) return true;

              let parent: any = line.parent;
              let collapsible: any = null;
              while (parent) {
                if (parent.statics?.blotName === "collapsible") {
                  collapsible = parent;
                  break;
                }
                parent = parent.parent;
              }

              if (!collapsible) return true;

              let content: any = null;
              collapsible.children.forEach((child: any) => {
                if (child.statics?.blotName === "collapsible-content")
                  content = child;
              });
              if (!content) return true;

              const isLastLine = line === content.children.tail;
              const lineLen = line?.length?.();
              const lineHtml = (line?.domNode?.innerHTML ?? "").trim();
              const isEmpty =
                lineLen <= 1 || lineHtml === "<br>";

              if (isLastLine && isEmpty) {
                const lineStart = line.offset(quill.scroll);
                const lineLength = line.length();
                quill.deleteText(lineStart, lineLength, "user");
                const insertIndex =
                  collapsible.offset(quill.scroll) + collapsible.length();
                quill.insertText(insertIndex, "\n", "user");
                quill.setSelection(insertIndex + 1, 0, "silent");
                return false;
              }

              return true;
            },
          },
          slash: {
            key: "/",
            handler(
              this: { quill: any },
              range: { index: number }
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
    "collapsible",
    "collapsible-header",
    "collapsible-content",
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
    .rich-text-editor .ql-editor .ql-collapsible {
      margin: 12px 0;
    }
    .rich-text-editor .ql-editor .ql-collapsible-header {
      margin: 0;
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
    .rich-text-editor .ql-editor .ql-collapsible[data-open="true"] .ql-collapsible-header::before {
      transform: rotate(90deg);
    }
    .rich-text-editor .ql-editor .ql-collapsible[data-open="false"] .ql-collapsible-content {
      display: none !important;
    }
    .rich-text-editor .ql-editor .ql-collapsible-content {
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

  const iconButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    opacity: 0.8,
  };

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
            defaultValue={normalizedValue}
            onChange={handleEditorChange}
            onChangeSelection={handleChangeSelection}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
        {hoveredLink &&
          (fetchLinkPreview &&
          (linkPreviewData.loading || linkPreviewData.title !== undefined) ? (
           <div
            onMouseEnter={cancelHidePreview}
            onMouseLeave={clearPreview}
            style={{
              position: "fixed",
              top: hoveredLink.top,
              left: hoveredLink.left,
              transform: "translateX(-50%)",
              zIndex: 1500,
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
              borderRadius: "12px",
              padding: "14px",
              width: "360px",
              boxShadow:
                "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            }}
          >
            {/* TOP ROW */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                gap: 12,
              }}
            >
              {/* Link Blue */}
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#60a5fa",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(hoveredLink.url, "_blank", "noopener,noreferrer")
                }
                title={hoveredLink.url}
              >
                {hoveredLink.url}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                {/* Edit */}
                <button
                  onClick={() => {
                    const range = linkRangeRef.current;
                    if (!range) return;
                    linkSelectionRef.current = {
                      index: range.index,
                      length: range.length,
                    };
                    setLinkDefaults({
                      text: range.text,
                      url: hoveredLink.url,
                    });
                    setIsLinkModalOpen(true);
                    clearPreview();
                  }}
                  style={iconButtonStyle}
                  title="Edit link"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  ✏️
                </button>

                {/* Copy */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(hoveredLink.url);
                  }}
                  style={iconButtonStyle}
                  title="Copy link"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  🔗
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    const quill = quillEditorRef.current;
                    if (!quill) return;
                    const range = linkRangeRef.current ?? (hoveredLink?.url ? getLinkRange(quill, hoveredLink.url) : null);
                    if (!range) return;
                    quill.setSelection(range.index, range.length);
                    quill.format("link", false);
                    clearPreview();
                  }}
                  style={iconButtonStyle}
                  title="Remove link"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* TITLE */}
            <div
              style={{
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.35,
                color: isDark ? "#f3f4f6" : "#111827",
              }}
            >
              {linkPreviewData.loading
                ? "Loading preview..."
                : linkPreviewData.title || "No preview available"}
            </div>
          </div>
          ) : (
            <div
              onMouseEnter={cancelHidePreview}
              onMouseLeave={clearPreview}
              style={{
                position: "fixed",
                top: hoveredLink.top,
                left: hoveredLink.left,
                transform: "translateX(-50%)",
                zIndex: 1500,
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "13px",
                maxWidth: "320px",
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                wordBreak: "break-all",
              }}
            >
              <div
                style={{
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: isDark ? "#e5e7eb" : "#111827",
                }}
              >
                Link preview
              </div>

              <div
                style={{
                  color: isDark ? "#9ca3af" : "#374151",
                }}
              >
                {hoveredLink.url}
              </div>
            </div>
          ))}
        <LinkEditorModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          onSubmit={applyLink}
          defaultText={linkDefaults.text}
          defaultUrl={linkDefaults.url}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
