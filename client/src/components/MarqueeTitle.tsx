import { useEffect, useRef, useState } from "react";

const MarqueeTitle = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (containerRef.current) {
            setIsOverflowing(containerRef.current.scrollWidth > containerRef.current.clientWidth);
        }
    }, [text]);

    if (!isOverflowing) {
        return (
            <div
                ref={containerRef}
                style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
                {text}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
            }}
        >
            <div
                className="flex items-center justify-center"
                style={{
                    display: "inline-block",
                    paddingLeft: "100%",
                    animation: "marquee 10s linear infinite",
                }}
            >
                {text}
            </div>
            <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
};

export default MarqueeTitle;
