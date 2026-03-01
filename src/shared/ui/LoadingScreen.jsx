import { useEffect, useState } from "preact/hooks";

export default function LoadingScreen({ delay = 1000 }) {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldShow(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!shouldShow) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full col-span-full animate-in fade-in duration-700">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#7bf4e1]/20 border-t-[#7bf4e1] animate-spin"></div>
                <div className="absolute inset-4 rounded-full bg-[#7bf4e1]/10 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#7bf4e1] animate-ping"></div>
                </div>
            </div>
            <p className="mt-6 text-[#535458] font-medium tracking-[0.2em] uppercase text-[10px] animate-pulse">
                Loading
            </p>
        </div>
    );
}
