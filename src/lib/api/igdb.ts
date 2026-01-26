/**
 * IGDB API クライアント
 * グローバルゲーム情報取得
 *
 * @see https://api-docs.igdb.com/
 */

const IGDB_API_BASE = "https://api.igdb.com/v4";
const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";

// IGDBのプラットフォームID
export const IGDB_PLATFORM_IDS = {
  PC: 6,
  PS5: 167,
  PS4: 48,
  XBOX_SERIES: 169,
  XBOX_ONE: 49,
  SWITCH: 130,
  IOS: 39,
  ANDROID: 34,
} as const;

// IGDBのジャンルID
export const IGDB_GENRE_IDS = {
  RPG: 12,
  ACTION: 25,
  ADVENTURE: 31,
  SIMULATION: 13,
  PUZZLE: 9,
  SPORTS: 14,
  RACING: 10,
  FIGHTING: 4,
  SHOOTER: 5,
  HORROR: 35, // Survival Horror is not a genre, use Theme
  MUSIC: 7,
} as const;

export interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number; // Unix timestamp
  rating?: number; // 0-100
  aggregated_rating?: number; // 0-100 (Critic score)
  aggregated_rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  cover?: {
    id: number;
    image_id: string;
    url: string;
  };
  platforms?: Array<{
    id: number;
    name: string;
    abbreviation?: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  involved_companies?: Array<{
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }>;
  game_modes?: Array<{
    id: number;
    name: string;
  }>;
  time_to_beat?: {
    hastily?: number;
    normally?: number;
    completely?: number;
  };
  release_dates?: Array<{
    id: number;
    date?: number;
    region: number;
    platform: {
      id: number;
      name: string;
    };
    human: string;
  }>;
  websites?: Array<{
    id: number;
    category: number;
    url: string;
  }>;
}

export interface IGDBSearchParams {
  search?: string;
  platforms?: number[];
  genres?: number[];
  releaseAfter?: Date;
  releaseBefore?: Date;
  limit?: number;
  offset?: number;
  sort?: string;
}

/**
 * IGDB APIクライアント
 */
export class IGDBClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * アクセストークンを取得
   */
  private async getAccessToken(): Promise<string> {
    // トークンがまだ有効ならそのまま使用
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
    });

    const response = await fetch(`${TWITCH_AUTH_URL}?${params.toString()}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Twitch認証エラー: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // 1分前に期限切れとする

    return this.accessToken!;
  }

  /**
   * APIリクエストを実行
   */
  private async request<T>(endpoint: string, body: string): Promise<T[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${IGDB_API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": this.clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IGDB APIエラー: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * ゲームを検索
   */
  async searchGames(params: IGDBSearchParams): Promise<IGDBGame[]> {
    const fields = `
      fields name, slug, summary, storyline,
        first_release_date, rating, aggregated_rating, aggregated_rating_count,
        total_rating, total_rating_count,
        cover.image_id, cover.url,
        platforms.name, platforms.abbreviation,
        genres.name,
        involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
        game_modes.name,
        release_dates.date, release_dates.region, release_dates.platform.name, release_dates.human,
        websites.category, websites.url;
    `;

    let where = "where category = 0"; // Main game only

    if (params.search) {
      // 検索の場合はsearch句を使用
    }

    if (params.platforms && params.platforms.length > 0) {
      where += ` & platforms = (${params.platforms.join(",")})`;
    }

    if (params.genres && params.genres.length > 0) {
      where += ` & genres = (${params.genres.join(",")})`;
    }

    if (params.releaseAfter) {
      const timestamp = Math.floor(params.releaseAfter.getTime() / 1000);
      where += ` & first_release_date >= ${timestamp}`;
    }

    if (params.releaseBefore) {
      const timestamp = Math.floor(params.releaseBefore.getTime() / 1000);
      where += ` & first_release_date <= ${timestamp}`;
    }

    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const sort = params.sort || "first_release_date desc";

    let body = `${fields} ${where}; limit ${limit}; offset ${offset}; sort ${sort};`;

    if (params.search) {
      body = `search "${params.search}"; ${fields} ${where}; limit ${limit};`;
    }

    return this.request<IGDBGame>("/games", body);
  }

  /**
   * 発売予定のゲームを取得
   */
  async getUpcomingGames(
    platforms?: number[],
    limit: number = 50
  ): Promise<IGDBGame[]> {
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    return this.searchGames({
      platforms,
      releaseAfter: now,
      releaseBefore: threeMonthsLater,
      limit,
      sort: "first_release_date asc",
    });
  }

  /**
   * 最近リリースされたゲームを取得
   */
  async getRecentReleases(
    platforms?: number[],
    limit: number = 50
  ): Promise<IGDBGame[]> {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return this.searchGames({
      platforms,
      releaseAfter: oneMonthAgo,
      releaseBefore: now,
      limit,
      sort: "first_release_date desc",
    });
  }

  /**
   * IDでゲームを取得
   */
  async getGameById(id: number): Promise<IGDBGame | null> {
    const fields = `
      fields name, slug, summary, storyline,
        first_release_date, rating, aggregated_rating, aggregated_rating_count,
        total_rating, total_rating_count,
        cover.image_id, cover.url,
        platforms.name, platforms.abbreviation,
        genres.name,
        involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
        game_modes.name,
        release_dates.date, release_dates.region, release_dates.platform.name, release_dates.human,
        websites.category, websites.url;
    `;

    const games = await this.request<IGDBGame>(
      "/games",
      `${fields} where id = ${id};`
    );

    return games[0] || null;
  }

  /**
   * 日本発売日を取得
   * region: 1 = Europe, 2 = North America, 5 = Japan, 8 = Worldwide
   */
  async getJapanReleaseDate(game: IGDBGame): Promise<string | null> {
    if (!game.release_dates) return null;

    // 日本 (region: 5) の発売日を探す
    const japanRelease = game.release_dates.find((rd) => rd.region === 5);
    if (japanRelease?.date) {
      return new Date(japanRelease.date * 1000).toISOString().split("T")[0];
    }

    // ワールドワイド (region: 8) の発売日を探す
    const worldwideRelease = game.release_dates.find((rd) => rd.region === 8);
    if (worldwideRelease?.date) {
      return new Date(worldwideRelease.date * 1000).toISOString().split("T")[0];
    }

    // 最初の発売日を返す
    if (game.first_release_date) {
      return new Date(game.first_release_date * 1000)
        .toISOString()
        .split("T")[0];
    }

    return null;
  }
}

/**
 * IGDBのカバー画像URLを生成
 * @param imageId cover.image_id
 * @param size t_thumb, t_cover_small, t_cover_big, t_1080p, etc.
 */
export function getIGDBCoverUrl(
  imageId: string,
  size: "t_thumb" | "t_cover_small" | "t_cover_big" | "t_720p" | "t_1080p" = "t_cover_big"
): string {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

/**
 * IGDBゲームをItem形式に変換
 */
export function convertIGDBGameToItem(game: IGDBGame): {
  type: "GAME";
  title: string;
  releaseDate: string | null;
  coverUrl: string | null;
  criticScore: number | null;
  userScore: number | null;
  estimatedClearTime: number | null;
  genre: string[];
  platform: string[];
  developer: string | null;
  publisher: string | null;
  igdbId: number;
  description: string | null;
} {
  // 開発者とパブリッシャーを抽出
  let developer: string | null = null;
  let publisher: string | null = null;

  if (game.involved_companies) {
    const devCompany = game.involved_companies.find((ic) => ic.developer);
    const pubCompany = game.involved_companies.find((ic) => ic.publisher);
    developer = devCompany?.company.name || null;
    publisher = pubCompany?.company.name || null;
  }

  // プラットフォーム名を変換
  const platformMapping: Record<string, string> = {
    "PlayStation 5": "PlayStation 5",
    "PlayStation 4": "PlayStation 4",
    "Nintendo Switch": "Nintendo Switch",
    "Xbox Series X|S": "Xbox Series X|S",
    "Xbox One": "Xbox Series X|S",
    PC: "PC (Steam)",
    "PC (Microsoft Windows)": "PC (Steam)",
  };

  const platforms =
    game.platforms?.map(
      (p) => platformMapping[p.name] || p.name
    ) || [];

  // ジャンルを変換
  const genreMapping: Record<string, string> = {
    "Role-playing (RPG)": "RPG",
    Adventure: "アドベンチャー",
    Shooter: "シューティング",
    Fighting: "格闘",
    Racing: "レース",
    Sport: "スポーツ",
    Puzzle: "パズル",
    Simulator: "シミュレーション",
    Music: "音楽",
    "Hack and slash/Beat 'em up": "アクション",
    Platform: "アクション",
  };

  const genres =
    game.genres?.map((g) => genreMapping[g.name] || g.name) || [];

  // クリア時間（秒→分に変換）
  let estimatedClearTime: number | null = null;
  if (game.time_to_beat?.normally) {
    estimatedClearTime = Math.round(game.time_to_beat.normally / 60);
  }

  return {
    type: "GAME",
    title: game.name,
    releaseDate: game.first_release_date
      ? new Date(game.first_release_date * 1000).toISOString().split("T")[0]
      : null,
    coverUrl: game.cover?.image_id
      ? getIGDBCoverUrl(game.cover.image_id)
      : null,
    criticScore: game.aggregated_rating
      ? Math.round(game.aggregated_rating)
      : null,
    userScore: game.rating ? Math.round(game.rating) / 10 : null,
    estimatedClearTime,
    genre: genres,
    platform: [...new Set(platforms)], // 重複削除
    developer,
    publisher,
    igdbId: game.id,
    description: game.summary || null,
  };
}
