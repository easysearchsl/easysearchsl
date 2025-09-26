import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: number;
};

// Simple, dependency-free rich text editor using contentEditable.
// Note: Uses document.execCommand for simplicity; acceptable for local admin tooling.
export default function RichTextEditor({ value, onChange, placeholder = "Write your content...", height = 240 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 p-2 bg-muted/40">
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("bold")}>B</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("italic")}><em>I</em></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("underline")}>U</Button>
        <Separator orientation="vertical" className="mx-1" />
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("formatBlock", "<h2>")}>H2</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("formatBlock", "<h3>")}>H3</Button>
        <Separator orientation="vertical" className="mx-1" />
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("insertUnorderedList")}>• List</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("insertOrderedList")}>1. List</Button>
        <Separator orientation="vertical" className="mx-1" />
        <Button type="button" size="sm" variant="ghost" onClick={() => {
          const url = prompt("Enter URL");
          if (url) exec("createLink", url);
        }}>Link</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => exec("removeFormat")}>Clear</Button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        className="p-3 outline-none min-h-[160px]"
        style={{ height }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}
