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
    title: string;
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
  photos: Array<InspiratPhotoResource>;
}
