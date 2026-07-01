/**
 * Shared DTO types for API responses and UI props.
 *
 * These describe the shapes that cross the network boundary (dates serialize to
 * ISO strings), so components and pages can import one definition instead of
 * redeclaring `Photo`/`User` locally.
 */

/** Minimal, publicly-safe user fields. */
export interface PublicUser {
  id: string;
  username: string;
  image: string | null;
}

/** The current user, as returned by `GET /api/me`. */
export interface Me extends PublicUser {
  email: string;
  _count: {
    followers: number;
    following: number;
  };
}

/** A photo as returned by the photo/feed endpoints. */
export interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
  publicId: string | null;
  createdAt: string;
  userId: string;
}

/** A feed photo that includes its author. */
export interface PhotoWithAuthor extends Photo {
  user: Pick<PublicUser, "username" | "image">;
}

/** Aggregate counts from `GET /api/user/[username]/stats`. */
export interface UserStats {
  followers: number;
  following: number;
  photos: number;
}

/** Standard error envelope returned by API routes. */
export interface ApiError {
  error: string;
}
