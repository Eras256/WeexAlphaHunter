
function StrategyRow({ name, status, color }: any) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-white">{name}</span>
            <span className={`${color} font-mono`}>{status}</span>
        </div>
    );
}
