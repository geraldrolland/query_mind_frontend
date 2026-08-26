"use client";

interface InputBlockPropType {
    handleSend: ((text: string) => void),
    inputValue: string,
    disableSendBtn: boolean,
    placeholder: string,
    setInputValue: ((inputValue: string) => void)
}


const InputBlock = ({handleSend, disableSendBtn, inputValue, setInputValue, placeholder}: InputBlockPropType) => {
    return(
        <>
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
            className="flex-1 rounded border border-slate-400 px-3 py-2 focus outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={disableSendBtn || !inputValue.trim()}
            className="rounded border border-indigo-600 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-100"
          >
            Send
          </button>
        </div>
        </>
    )
}

export default InputBlock;