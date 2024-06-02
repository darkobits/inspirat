export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};


/**
 * Defines an RGB color.
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}


/**
 * Shape of photo objects as they are stored in S3. Contains selected paths from
 * Unsplash plus a 'palette' objet containing dominant colors for the photo.
 */
export interface InspiratPhotoResource {
  id: string;
  links: {
    html: string;
  };
  location: {
    name: string | null;
    city: string | null;
    country: string | null;
    position: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  urls: {
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  palette: {
    vibrant?: Color;
    lightVibrant?: Color;
    darkVibrant?: Color;
    muted?: Color;
    lightMuted?: Color;
    darkMuted?: Color;
  };
}


/**
 * Object representing a collection of photos.
 */
export interface InspiratPhotoCollection {
  id: string;
  title: string;
  photos: Array<InspiratPhotoResource>;
}


/**
 * /collections/:id
 */
export interface UnsplashCollection {
  id: number;
  title: string;
  description: string;
  published_at: string;
  last_collected_at: string;
  updated_at: string;
  featured: boolean;
  total_photos: number;
  private: boolean;
  share_key: string;
  cover_photo: null;
  user: null;
  links: {
    self: string;
    html: string;
    photos: string;
  };
}


/**
 * Represents a partial photo resource that is returned when querying the
 * /collections/:collectionId endpoint. This resource is missing the following
 * keys that are returned by the /photos/:photoId endpoint:
 *
 * - location
 * - downloads
 * - exif
 */
export interface UnsplashCollectionPhotoResource {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  likes: number;
  liked_by_user: boolean;
  description: string;

  /**
   * This is a *partial* User resource; it is missing the following keys that
   * are returned by the /users/:username endpoint:
   *
   * - first_name
   * - last_name
   * - followed_by_user
   * - followers_count
   * - following_count
   * - downloads
   */
  user: {
    id: string;
    username: string;
    name: string;
    portfolio_url: string;
    bio: string;
    location: string;
    total_likes: number;
    total_photos: number;
    total_collections: number;
    instagram_username: string;
    twitter_username: string;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      self: string;
      html: string;
      photos: string;
      likes: string;
      portfolio: string;
    };
  };

  /**
   * The *current user's* collections that this photo belongs to.
   */
  current_user_collections: Array<{
    id: number;
    title: string;
    published_at: string;
    updated_at: string;
    curated: boolean;
    cover_photo: string | undefined;
    user: string | undefined;
  }>;

  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };

  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
}
