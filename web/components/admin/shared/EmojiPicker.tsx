"use client";

import { useMemo } from "react";
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
} from "@/components/ui/combobox";
import { EMOJI_OPTIONS } from "@/lib/emojiOptions";

type EmojiOption = {
  value: string;
  label: string;
};

type EmojiPickerProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

export function EmojiPicker({
  id,
  value,
  onValueChange,
  placeholder = "Cari emoji...",
}: EmojiPickerProps) {
  const items = useMemo<EmojiOption[]>(() => {
    const options = EMOJI_OPTIONS.map((opt) => ({
      value: opt.emoji,
      label: `${opt.emoji}  ${opt.label}`,
    }));

    const isCustomEmoji =
      !!value && !EMOJI_OPTIONS.some((opt) => opt.emoji === value);

    if (isCustomEmoji) {
      return [{ value, label: `${value}  (saat ini)` }, ...options];
    }

    return options;
  }, [value]);

  return (
    <Combobox<string>
      items={items}
      value={value || null}
      onValueChange={(next) => onValueChange(next ?? "")}
    >
      <ComboboxInputGroup className="rounded-xl">
        <ComboboxInput id={id} placeholder={placeholder} />
        <ComboboxTrigger />
      </ComboboxInputGroup>
      <ComboboxContent emptyMessage="Emoji tidak ditemukan.">
        {(item: EmojiOption) => (
          <ComboboxItem key={item.value} value={item.value}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
