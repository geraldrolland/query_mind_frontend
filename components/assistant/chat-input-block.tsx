"use client";

import { useRef } from "react";
import { Send } from "lucide-react";

interface InputBlockPropType {
    handleSend: ((text: string) => void),
    inputValue: string,
    disableSendBtn: boolean,
    placeholder: string,
    setInputValue: ((inputValue: string) => void)
}


const InputBlock = ({handleSend, disableSendBtn, inputValue, setInputValue, placeholder}: InputBlockPropType) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    };

    return(
        <>
        <div className="mx-4 mb-4 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={4000}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleInput();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(inputValue);
              }
            }}
            placeholder={placeholder}
            className="max-h-32 min-h-[36px] flex-1 resize-none overflow-y-auto rounded bg-slate-800 px-3 py-2 text-slate-200 outline-none placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={disableSendBtn || !inputValue.trim()}
            className="h-[36px] rounded bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-500 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        </>
    )
}

export default InputBlock;