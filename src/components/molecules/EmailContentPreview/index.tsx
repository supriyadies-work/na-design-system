import React, { useMemo } from "react";
import { cn } from "@supriyadies-work/supr-design-system/utils/cn";
import { Text } from "@supriyadies-work/supr-design-system/components/atoms/Text";

export interface EmailContentPreviewProps {
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  className?: string;
  /** Extra classes for the sandboxed iframe (height, etc.). */
  iframeClassName?: string;
  /** Section heading (e.g. localized). */
  title?: string;
  /** Short helper under the title. */
  description?: string;
  /** iframe title for a11y */
  iframeTitle?: string;
  /** &lt;summary&gt; for raw HTML disclosure */
  rawHtmlToggleLabel?: string;
  /** Shown when textBody is empty */
  plainTextEmptyMessage?: string;
  subjectLabel?: string;
  htmlBodyLabel?: string;
  plainTextLabel?: string;
}

/** Break out of HTML if user content closes our tags (minimal hardening for srcdoc). */
function escapeHtmlFragmentForSrcdoc(html: string): string {
  return html
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<\/style/gi, "<\\/style");
}

/**
 * Styles so Quill/RichTextEditor output (links, lists, align, collapsible, pull quote)
 * renders like the editor; links stay visible and clickable where sandbox allows.
 */
function buildPreviewDocumentCss(): string {
  return `
    html, body { height: auto; min-height: 100%; }
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #111827;
      word-break: break-word;
      -webkit-font-smoothing: antialiased;
    }
    @media (prefers-color-scheme: dark) {
      body { color: #f3f4f6; background: #111827; }
    }
    .ql-editor { box-sizing: border-box; outline: none; white-space: pre-wrap; word-wrap: break-word; }
    .ql-editor > * { cursor: text; }
    .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6,
    .ql-editor ol, .ql-editor ul, .ql-editor pre, .ql-editor blockquote { margin: 0 0 0.75em; }
    .ql-editor h1 { font-size: 2em; font-weight: 700; }
    .ql-editor h2 { font-size: 1.5em; font-weight: 700; }
    .ql-editor h3 { font-size: 1.25em; font-weight: 600; }
    .ql-editor ol, .ql-editor ul { padding-left: 1.5em; }
    .ql-editor a {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    @media (prefers-color-scheme: dark) {
      .ql-editor a { color: #93c5fd; }
    }
    .ql-editor a:visited { color: #7c3aed; }
    @media (prefers-color-scheme: dark) {
      .ql-editor a:visited { color: #c4b5fd; }
    }
    .ql-editor img, .ql-editor video {
      max-width: 100%;
      height: auto;
      vertical-align: middle;
    }
    .ql-editor .ql-align-center { text-align: center; }
    .ql-editor .ql-align-right { text-align: right; }
    .ql-editor .ql-align-justify { text-align: justify; }
    .ql-editor blockquote {
      border-left: 4px solid #e5e7eb;
      padding-left: 1rem;
      color: #4b5563;
    }
    @media (prefers-color-scheme: dark) {
      .ql-editor blockquote { border-left-color: #4b5563; color: #d1d5db; }
    }
    .ql-editor blockquote.pull-quote {
      border-left: none;
      padding-left: 0;
      font-size: 1.125em;
      font-style: italic;
      text-align: center;
      color: inherit;
    }
    .ql-editor .ql-code-block-container { margin: 0.75em 0; }
    .ql-editor pre.ql-syntax {
      background: #f3f4f6;
      color: #111;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.875em;
    }
    @media (prefers-color-scheme: dark) {
      .ql-editor pre.ql-syntax { background: #1f2937; color: #f9fafb; }
    }
    .ql-editor .ql-collapsible { margin: 12px 0; }
    .ql-editor .ql-collapsible-header {
      margin: 0;
      font-weight: 600;
      padding-left: 1.25rem;
      position: relative;
    }
    .ql-editor .ql-collapsible-header::before {
      content: "";
      border-left: 5px solid currentColor;
      border-top: 4px solid transparent;
      border-bottom: 4px solid transparent;
      position: absolute;
      left: 0;
      top: 0.5em;
    }
    .ql-editor .ql-collapsible[data-open="true"] .ql-collapsible-header::before {
      transform: rotate(90deg);
    }
    .ql-editor .ql-collapsible[data-open="false"] .ql-collapsible-content {
      display: none !important;
    }
    .ql-editor .ql-collapsible-content {
      display: block;
      padding-top: 8px;
      padding-left: 1.25rem;
      margin-left: 0.25rem;
      border-left: 2px solid #e5e7eb;
    }
    @media (prefers-color-scheme: dark) {
      .ql-editor .ql-collapsible-content { border-left-color: #4b5563; }
    }
    .ql-indent-1 { padding-left: 3em !important; }
    .ql-indent-2 { padding-left: 6em !important; }
    .ql-indent-3 { padding-left: 9em !important; }
    .ql-indent-4 { padding-left: 12em !important; }
    .ql-indent-5 { padding-left: 15em !important; }
    .ql-indent-6 { padding-left: 18em !important; }
    .ql-indent-7 { padding-left: 21em !important; }
    .ql-indent-8 { padding-left: 24em !important; }
    .ql-indent-9 { padding-left: 27em !important; }
  `;
}

function buildIframeSrcDoc(htmlBody: string): string {
  const safe = escapeHtmlFragmentForSrcdoc(htmlBody);
  const css = buildPreviewDocumentCss();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><base target="_blank" rel="noopener noreferrer"/><style>${css}</style></head><body><div class="ql-editor">${safe}</div></body></html>`;
}

/**
 * Read-only preview of an email: subject, HTML (sandboxed iframe + raw toggle), optional plain text.
 * No network calls; safe for admin surfaces.
 */
export const EmailContentPreview: React.FC<EmailContentPreviewProps> = ({
  subject,
  htmlBody,
  textBody,
  className,
  iframeClassName,
  title = "Email content",
  description = "Subject and body below reflect what recipients see (server state).",
  iframeTitle = "HTML email preview",
  rawHtmlToggleLabel = "View raw HTML",
  plainTextEmptyMessage = "No plain-text part; clients without HTML use HTML fallback.",
  subjectLabel = "Subject",
  htmlBodyLabel = "Body (HTML)",
  plainTextLabel = "Body (plain text)",
}) => {
  const srcDoc = useMemo(() => buildIframeSrcDoc(htmlBody), [htmlBody]);

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-600 dark:bg-neutral-800",
        className
      )}
    >
      <Text variant="h5" className="font-semibold text-neutral-900 dark:text-white">
        {title}
      </Text>
      <Text variant="caption" className="mt-1 text-neutral-500 dark:text-neutral-400">
        {description}
      </Text>

      <div className="mt-4 space-y-1">
        <Text variant="label" className="uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {subjectLabel}
        </Text>
        <Text
          variant="body"
          className="font-medium break-words text-neutral-900 dark:text-white"
          as="p"
        >
          {subject?.trim() ? subject : "—"}
        </Text>
      </div>

      <div className="mt-4">
        <Text variant="label" className="uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {htmlBodyLabel}
        </Text>
        <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900/50">
          <iframe
            title={iframeTitle}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            className={cn(
              "block min-h-[min(52vh,480px)] w-full max-h-[min(88vh,900px)] border-0",
              iframeClassName
            )}
            srcDoc={srcDoc}
          />
        </div>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-primary-600 hover:underline dark:text-primary-400">
            {rawHtmlToggleLabel}
          </summary>
          <pre className="mt-2 max-h-64 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-neutral-200 bg-neutral-100 p-3 text-xs dark:border-neutral-700 dark:bg-neutral-900">
            {htmlBody}
          </pre>
        </details>
      </div>

      {textBody ? (
        <div className="mt-4">
          <Text variant="label" className="uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {plainTextLabel}
          </Text>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-neutral-200 bg-neutral-100 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900">
            {textBody}
          </pre>
        </div>
      ) : (
        <Text variant="caption" className="mt-4 text-neutral-500 dark:text-neutral-400">
          {plainTextEmptyMessage}
        </Text>
      )}
    </div>
  );
};

export default EmailContentPreview;
