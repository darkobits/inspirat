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
