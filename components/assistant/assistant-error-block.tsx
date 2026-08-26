

const AssistantErrorBlock = ({content}: {content: string}) => {
    return (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {content}
                </div>
    )
}

export default AssistantErrorBlock;