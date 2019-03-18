export interface LooseObject {
  [index: string]: any;
}


/**
 * Represents a user object from Unsplash.
 *
 * Resource: /users/:id
 * See: https://unsplash.com/documentation#get-a-users-public-profile
 */
export interface UnsplashUserResource {
  id: string;
  updated_at: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  twitter_username: string;
  portfolio_url: string;
  bio: string | undefined;
  location: string;
  links: {
    self: string;
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
    following: string;
    followers: string;
  };
  portfolio_image: {
    small: string;
    medium: string;
    large: string;
  };
  instagram_username: string;
  total_collections: number;
  total_likes: number;
  total_photos: number;
}


/**
 * Represents a photo resource from Unsplash.
 *
 * Resource: /photos/:id
 * Reference: https://unsplash.com/documentation#get-a-photo
 */
export interface UnsplashPhotoResource {
  id: string;

  /**
   * ISO Timestamp.
   *
   * @example
   *
   * "2016-07-10T11:00:01-05:00"
   */
  created_at: string;

  /**
   * ISO Timestamp.
   *
   * @example
   *
   * "2016-07-10T11:00:01-05:00"
   */
  updated_at: string;

  /**
   * Photo width in pixels.
   */
  width: number;

  /**
   * Photo height in pixels.
   */
  height: number;

  /**
   * Average color in the photo.
   */
  color: string;

  /**
   * Description of the ptoto.
   */
  description: string;

  /**
   * User resource that owns the photo.
   */
  user: UnsplashUserResource;

  /**
   * Number of times the photo has been viewed.
   */
  views: number;

  /**
   * Number of times the photo has been downloaded.
   */
  downloads: number;

  /**
   * Number of times the photo has been liked.
   */
  likes: number;

  /**
   * Categories the photo belongs to.
   */
  categories: Array<string>;

  /**
   * Whether the photo is sponsored.
   */
  sponsored: boolean;

  /**
   * Whether the photo has been liked by the user who owns it?
   */
  liked_by_user: boolean;


  slug: string | undefined;

  /**
   * List of collections created by the photo's owner that this photo is in.
   */
  current_user_collections: Array<any>;

  /**
   * Direct links to the photo at various sizes.
   */
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
    raw: string;
  };

  /**
   * Various links for various representations of the resource.
   */
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };

  /**
   * Geographical information about where the photo was taken.
   */
  location: {
    title: string;
    name: string;
    city: string;
    country: string;
    position: {
      latitude: number;
      longitude: number;
    };
  };

  /**
   * Information about the camera settings used to take the photo.
   */
  exif: {
    make: string;
    model: string;
    exposure_time: string;
    aperture: string;
    focal_length: string;
    iso: string;
  };
}
