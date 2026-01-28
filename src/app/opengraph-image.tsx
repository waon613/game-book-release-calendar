import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ゲーム＆書籍リリースカレンダー";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * OGP画像の動的生成
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1e293b",
          backgroundImage:
            "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
        }}
      >
        {/* アイコン */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 120 }}>📅</span>
        </div>

        {/* タイトル */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: "bold",
              color: "#f8fafc",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            ゲーム＆書籍
          </h1>
          <h1
            style={{
              fontSize: 64,
              fontWeight: "bold",
              color: "#3b82f6",
              textAlign: "center",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            リリースカレンダー
          </h1>
        </div>

        {/* サブタイトル */}
        <p
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            marginTop: 30,
          }}
        >
          新作ゲーム・書籍の発売日を一覧表示
        </p>

        {/* フッター */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 24, color: "#64748b" }}>🎮 ゲーム</span>
          <span style={{ fontSize: 24, color: "#64748b" }}>•</span>
          <span style={{ fontSize: 24, color: "#64748b" }}>📚 書籍</span>
          <span style={{ fontSize: 24, color: "#64748b" }}>•</span>
          <span style={{ fontSize: 24, color: "#64748b" }}>🔔 通知</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
