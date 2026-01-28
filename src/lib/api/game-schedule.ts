/**
 * 任天堂 ゲーム発売スケジュール スクレイピング
 * 公式サイトから日本向けゲーム情報を取得
 */

interface NintendoGame {
  title: string;
  releaseDate: string;
  platform: string;
  publisher: string;
  price?: number;
  imageUrl?: string;
  url?: string;
}

/**
 * 任天堂公式の発売予定リストからゲーム情報を取得
 * Note: 実際のスクレイピングはサーバーサイドで実行
 */
export async function fetchNintendoSchedule(): Promise<NintendoGame[]> {
  // Nintendo Japan の発売スケジュールページ
  // 実際の実装では、サーバーサイドでスクレイピングを行う
  
  // サンプルデータ（実際の実装ではAPIまたはスクレイピング結果を返す）
  return [
    {
      title: "ゼルダの伝説 新作",
      releaseDate: "2026-03-15",
      platform: "Nintendo Switch",
      publisher: "任天堂",
      price: 7678,
    },
    {
      title: "マリオカート 10",
      releaseDate: "2026-06-20",
      platform: "Nintendo Switch 2",
      publisher: "任天堂",
      price: 6578,
    },
  ];
}

/**
 * ファミ通の発売スケジュールからゲーム情報を取得
 */
export async function fetchFamitsuSchedule(
  platform?: string,
  month?: number,
  year?: number
): Promise<NintendoGame[]> {
  // ファミ通の発売予定リスト
  // 実際の実装では、サーバーサイドでスクレイピングを行う
  
  return [];
}

/**
 * PlayStation Store から発売予定を取得
 */
export async function fetchPlayStationSchedule(): Promise<NintendoGame[]> {
  // PlayStation Store API (非公式)
  // 実際の実装では、サーバーサイドで処理
  
  return [];
}

/**
 * 複数ソースからゲーム情報を統合
 */
export async function fetchAllGameSchedules(): Promise<NintendoGame[]> {
  const [nintendo, famitsu, playstation] = await Promise.all([
    fetchNintendoSchedule().catch(() => []),
    fetchFamitsuSchedule().catch(() => []),
    fetchPlayStationSchedule().catch(() => []),
  ]);

  // 重複を除去してマージ
  const allGames = [...nintendo, ...famitsu, ...playstation];
  const uniqueGames = allGames.reduce((acc, game) => {
    const key = `${game.title}-${game.releaseDate}`;
    if (!acc.has(key)) {
      acc.set(key, game);
    }
    return acc;
  }, new Map<string, NintendoGame>());

  return Array.from(uniqueGames.values()).sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );
}

/**
 * ゲーム情報を共通フォーマットに変換
 */
export function convertGameToItem(game: NintendoGame) {
  return {
    id: `game-${game.title.replace(/\s+/g, "-").toLowerCase()}-${game.releaseDate}`,
    type: "GAME" as const,
    title: game.title,
    releaseDate: game.releaseDate,
    coverUrl: game.imageUrl || null,
    platform: [game.platform],
    publisher: game.publisher,
    currentPrice: game.price || null,
    listPrice: game.price || null,
    genre: [],
    affiliateLinks: {
      official: game.url || null,
    },
  };
}
