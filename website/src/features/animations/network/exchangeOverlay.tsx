"use client";

import { motion } from "framer-motion";
import { EdgeTuple, LineGeometry, NetworkStyleConfig, DEFAULT_STYLE_CONFIG } from "./types";

export type ExchangeVisualKind = "matched" | "alternating";

export type ExchangeToken = {
    id: string;
    visualKind: ExchangeVisualKind;
    fromEdge: EdgeTuple;
    toEdge: EdgeTuple;
};

const edgeEq = (a: EdgeTuple, b: EdgeTuple) => a[0] === b[0] && a[1] === b[1];
const edgeKey = (e: EdgeTuple) => `${e[0]}-${e[1]}`;

const inMatching = (edge: EdgeTuple, matching: EdgeTuple[]) =>
    matching.some((m) => edgeEq(m, edge));

export function buildStep2ExchangeTokens(
    pathEdges: EdgeTuple[],
    beforeMatching: EdgeTuple[],
    afterMatching: EdgeTuple[],
    pathKey: string
): ExchangeToken[] {
    const beforeMatched = pathEdges.filter((e) => inMatching(e, beforeMatching));
    const beforeAlternating = pathEdges.filter((e) => !inMatching(e, beforeMatching));

    const afterMatched = pathEdges.filter((e) => inMatching(e, afterMatching));
    const afterAlternating = pathEdges.filter((e) => !inMatching(e, afterMatching));

    const matchedTokens = beforeMatched.map((fromEdge, i) => ({
        id: `${pathKey}-matched-${i}`,
        visualKind: "matched" as const,
        fromEdge,
        toEdge: afterMatched[i],
    }));

    const alternatingTokens = beforeAlternating.map((fromEdge, i) => ({
        id: `${pathKey}-alternating-${i}`,
        visualKind: "alternating" as const,
        fromEdge,
        toEdge: afterAlternating[i],
    }));

    return [...matchedTokens, ...alternatingTokens].filter((t) => !!t.toEdge);
}

export function buildPreviewStyleMap(tokens: ExchangeToken[]) {
    const map = new Map<string, ExchangeVisualKind>();
    for (const token of tokens) {
        map.set(edgeKey(token.toEdge), token.visualKind);
    }
    return map;
}

export function ExchangeOverlay({
    tokens,
    getGeometry,
    edgeStrokeWidth,
    directed = false,
    styleConfig = DEFAULT_STYLE_CONFIG,
}: {
    tokens: ExchangeToken[];
    getGeometry: (edge: EdgeTuple) => LineGeometry | null;
    edgeStrokeWidth: number;
    directed?: boolean;
    styleConfig?: NetworkStyleConfig;
}) {
    return (
        <g pointerEvents="none">
            {tokens.map((token) => {
                const from = getGeometry(token.fromEdge);
                const to = getGeometry(token.toEdge);
                if (!from || !to) return null;

                const isMatched = token.visualKind === "matched";
                const edgeStyle = isMatched 
                  ? styleConfig.edges.alternativeNonMatching 
                  : styleConfig.edges.alternativeMatching;

                const stroke = edgeStyle.color;
                // step 2 中整条交替路径都通常保持虚线动画
                const dash = edgeStyle.dashed ? edgeStyle.dashArray : "none";
                const colorOpacity = edgeStyle.colorOpacity;

                const markerEnd = directed
                    ? isMatched
                        ? "url(#arrowhead-alt-matched)"
                        : "url(#arrowhead-alternating)"
                    : undefined;

                return (
                    <motion.line
                        key={token.id}
                        initial={{
                            x1: from.x1,
                            y1: from.y1,
                            x2: from.x2,
                            y2: from.y2,
                            opacity: 1,
                        }}
                        animate={{
                            x1: to.x1,
                            y1: to.y1,
                            x2: to.x2,
                            y2: to.y2,
                            opacity: colorOpacity,
                        }}
                        transition={{
                            duration: 0.78,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        stroke={stroke}
                        strokeWidth={edgeStrokeWidth * 1.2}
                        strokeDasharray={dash}
                        strokeLinecap="round"
                        markerEnd={markerEnd}
                    />
                );
            })}
        </g>
    );
}
